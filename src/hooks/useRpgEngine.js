import confetti from "canvas-confetti";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { INITIAL_DEBUFFS, INITIAL_QUESTS, RANK_CONFIG, SKILL_BRANCHES } from "../data/initialGameData";
import { getLocalTodayISO, normalizeToISO } from "../utils/dateUtils";

const API_URL = import.meta.env.VITE_SHEETS_API_URL;
const STORAGE_KEY = "rizal_rpg_tracker_cache_v3";

const getRankTitle = (level) => {
  if (level >= 20) return "Principal Tech Architect";
  if (level >= 15) return "Elite Fullstack Vanguard";
  if (level >= 10) return "Fullstack Vanguard";
  if (level >= 5) return "Code Craftsman";
  return "Novice Developer";
};

export function useRpgEngine() {
  const [quests, setQuests] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).quests : INITIAL_QUESTS;
  });

  const [debuffs, setDebuffs] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).debuffs : INITIAL_DEBUFFS;
  });

  const [spentGold, setSpentGold] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).spentGold || 0 : 0;
  });

  const [syncStatus, setSyncStatus] = useState("idle");
  const [levelUpInfo, setLevelUpInfo] = useState(null);
  const [floatingReward, setFloatingReward] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ quests, debuffs, spentGold }));
  }, [quests, debuffs, spentGold]);

  const fetchFromSheet = useCallback(async () => {
    if (!API_URL) return;
    try {
      setSyncStatus("syncing");
      const res = await fetch(API_URL, { cache: "no-store" });
      const data = await res.json();
      if (data.status === "success") {
        if (Array.isArray(data.quests) && data.quests.length > 0) {
          const normalizedQuests = data.quests.map((q) => ({
            ...q,
            date: normalizeToISO(q.date),
            completed: Boolean(q.completed),
          }));
          setQuests(normalizedQuests);
        }
        if (Array.isArray(data.debuffs) && data.debuffs.length > 0) {
          setDebuffs(data.debuffs);
        }
        setSyncStatus("synced");
      }
    } catch (err) {
      console.error("Gagal sinkronisasi dari Google Sheet:", err);
      setSyncStatus("error");
    }
  }, []);

  useEffect(() => {
    fetchFromSheet();
  }, [fetchFromSheet]);

  const pushToSheet = async (payload) => {
    if (!API_URL) return;
    try {
      setSyncStatus("syncing");
      const res = await fetch(API_URL, {
        method: "POST",
        keepalive: true,
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setSyncStatus("synced");
    } catch (err) {
      console.error("Gagal mengirim perubahan ke Google Sheet:", err);
      setSyncStatus("error");
    }
  };

  const stats = useMemo(() => {
    const todayStr = getLocalTodayISO();
    let grossXP = 0;
    let totalGoldEarned = 0;
    let completedCount = 0;
    let completedToday = 0;
    const completedDatesSet = new Set();

    const skillXpMap = {};
    SKILL_BRANCHES.forEach((s) => {
      skillXpMap[s.code] = s.baseXp;
    });

    quests.forEach((q) => {
      const qDate = normalizeToISO(q.date);
      if (q.completed) {
        const reward = RANK_CONFIG[q.rank] || RANK_CONFIG.D;
        grossXP += reward.xp;
        totalGoldEarned += reward.gold;
        completedCount += 1;
        completedDatesSet.add(qDate);

        if (qDate === todayStr) {
          completedToday += 1;
        }
        if (skillXpMap[q.skill] !== undefined) {
          skillXpMap[q.skill] += reward.xp;
        }
      }
    });

    // Hitung consecutive day streak (jika hari ini belum ada yang selesai, hitung dari kemarin agar streak tidak langsung reset)
    let calculatedStreak = 0;
    const cursor = new Date(`${todayStr}T00:00:00`);

    if (!completedDatesSet.has(todayStr)) {
      cursor.setDate(cursor.getDate() - 1);
    }

    while (true) {
      const iso = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}-${String(cursor.getDate()).padStart(2, "0")}`;
      if (completedDatesSet.has(iso)) {
        calculatedStreak += 1;
        cursor.setDate(cursor.getDate() - 1);
      } else {
        break;
      }
    }
    const streakDays = calculatedStreak;

    const totalPenalty = debuffs.reduce((acc, d) => (d.active ? acc + d.penalty : acc), 0);
    const netXP = Math.max(0, grossXP - totalPenalty);
    const level = Math.floor(netXP / 500) + 1;
    const currentLevelXP = netXP % 500;
    const availableGold = Math.max(0, totalGoldEarned - spentGold);
    const isDailyClear = completedToday >= 3;

    const skills = SKILL_BRANCHES.map((s) => {
      const xp = skillXpMap[s.code];
      const skillLevel = Math.floor(xp / 500) + 1;
      const xpInLevel = xp % 500;
      return {
        ...s,
        xp,
        level: skillLevel,
        xpInLevel,
        progressPct: Math.min(100, Math.round((xpInLevel / 500) * 100)),
      };
    });

    return {
      level,
      rankTitle: getRankTitle(level),
      netXP,
      currentLevelXP,
      availableGold,
      completedCount,
      completedToday,
      isDailyClear,
      streakDays,
      totalPenalty,
      skills,
    };
  }, [quests, debuffs, spentGold]);

  const prevLevelRef = useRef(stats.level);

  useEffect(() => {
    if (stats.level > prevLevelRef.current) {
      setLevelUpInfo({ newLevel: stats.level, rankTitle: stats.rankTitle });
      confetti({
        particleCount: 110,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#38bdf8", "#f59e0b", "#10b981"],
      });
    }
    prevLevelRef.current = stats.level;
  }, [stats.level, stats.rankTitle]);

  const toggleQuest = (id) => {
    const currentQuest = quests.find((q) => q.id === id);
    if (!currentQuest) return;

    const nextCompleted = !currentQuest.completed;

    if (nextCompleted) {
      const reward = RANK_CONFIG[currentQuest.rank] || RANK_CONFIG.D;
      setFloatingReward({
        id: Date.now(),
        xp: reward.xp,
        gold: reward.gold,
        skill: currentQuest.skill,
      });
      if (currentQuest.type === "Boss Quest") {
        confetti({ particleCount: 65, spread: 60, origin: { y: 0.7 } });
      }
    }

    setQuests((prev) => prev.map((q) => (q.id === id ? { ...q, completed: nextCompleted } : q)));

    pushToSheet({ action: "TOGGLE_QUEST", id, completed: nextCompleted });
  };

  const addQuest = ({ title, date, type, skill, rank }) => {
    const maxNum = quests.reduce((max, q) => {
      const num = parseInt(String(q.id).replace(/\D/g, ""), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    const nextId = `Q-${String(maxNum + 1).padStart(3, "0")}`;
    const questDate = date || getLocalTodayISO();

    const newQuest = {
      id: nextId,
      date: questDate,
      title,
      type,
      skill,
      rank,
      completed: false,
    };

    setQuests((prev) => [newQuest, ...prev]);
    pushToSheet({ action: "ADD_QUEST", ...newQuest });
  };

  const deleteQuest = (id) => {
    setQuests((prev) => prev.filter((q) => q.id !== id));
    pushToSheet({ action: "DELETE_QUEST", id });
  };

  const toggleDebuff = (id) => {
    const currentDebuff = debuffs.find((d) => d.id === id);
    if (!currentDebuff) return;

    const nextActive = !currentDebuff.active;

    setDebuffs((prev) => prev.map((d) => (d.id === id ? { ...d, active: nextActive } : d)));

    if (currentDebuff.rowIndex) {
      pushToSheet({
        action: "TOGGLE_DEBUFF",
        rowIndex: currentDebuff.rowIndex,
        active: nextActive,
      });
    }
  };

  const redeemReward = (cost) => {
    if (stats.availableGold >= cost) {
      setSpentGold((prev) => prev + cost);
      confetti({ particleCount: 50, spread: 55, origin: { y: 0.75 } });
      return true;
    }
    return false;
  };

  return {
    quests,
    debuffs,
    stats,
    syncStatus,
    fetchFromSheet,
    levelUpInfo,
    setLevelUpInfo,
    floatingReward,
    toggleQuest,
    addQuest,
    deleteQuest,
    toggleDebuff,
    redeemReward,
  };
}
