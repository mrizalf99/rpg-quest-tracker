import confetti from "canvas-confetti";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { INITIAL_DEBUFFS, INITIAL_QUESTS, RANK_CONFIG, SKILL_BRANCHES } from "../data/initialGameData";

const API_URL = import.meta.env.VITE_SHEETS_API_URL;
const STORAGE_KEY = "rizal_rpg_tracker_cache_v2";

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

  const [syncStatus, setSyncStatus] = useState("idle"); // "idle" | "syncing" | "synced" | "error"
  const [levelUpInfo, setLevelUpInfo] = useState(null);
  const [floatingReward, setFloatingReward] = useState(null);

  // Simpan cache lokal setiap ada perubahan
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ quests, debuffs, spentGold }));
  }, [quests, debuffs, spentGold]);

  // Ambil data terbaru dari Google Sheet saat halaman dibuka
  const fetchFromSheet = useCallback(async () => {
    if (!API_URL) return;
    try {
      setSyncStatus("syncing");
      const res = await fetch(API_URL);
      const data = await res.json();
      if (data.status === "success") {
        if (Array.isArray(data.quests) && data.quests.length > 0) {
          setQuests(data.quests);
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

  // Kirim aksi perubahan ke Google Sheet (menggunakan text/plain agar bebas CORS preflight)
  const pushToSheet = async (payload) => {
    if (!API_URL) return;
    try {
      setSyncStatus("syncing");
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });
      setSyncStatus("synced");
    } catch (err) {
      console.error("Gagal mengirim perubahan ke Google Sheet:", err);
      setSyncStatus("error");
    }
  };

  const stats = useMemo(() => {
    const todayStr = new Date().toISOString().split("T")[0];
    let grossXP = 0;
    let totalGoldEarned = 0;
    let completedCount = 0;
    let completedToday = 0;

    const skillXpMap = {};
    SKILL_BRANCHES.forEach((s) => {
      skillXpMap[s.code] = s.baseXp;
    });

    quests.forEach((q) => {
      if (q.completed) {
        const reward = RANK_CONFIG[q.rank] || RANK_CONFIG.D;
        grossXP += reward.xp;
        totalGoldEarned += reward.gold;
        completedCount += 1;
        if (q.date === todayStr) {
          completedToday += 1;
        }
        if (skillXpMap[q.skill] !== undefined) {
          skillXpMap[q.skill] += reward.xp;
        }
      }
    });

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
    let targetCompleted = false;
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        targetCompleted = !q.completed;
        if (targetCompleted) {
          const reward = RANK_CONFIG[q.rank] || RANK_CONFIG.D;
          setFloatingReward({
            id: Date.now(),
            xp: reward.xp,
            gold: reward.gold,
            skill: q.skill,
          });
          if (q.type === "Boss Quest") {
            confetti({ particleCount: 65, spread: 60, origin: { y: 0.7 } });
          }
        }
        return { ...q, completed: targetCompleted };
      }),
    );

    pushToSheet({ action: "TOGGLE_QUEST", id, completed: targetCompleted });
  };

  const addQuest = ({ title, type, skill, rank }) => {
    const maxNum = quests.reduce((max, q) => {
      const num = parseInt(String(q.id).replace(/\D/g, ""), 10);
      return !isNaN(num) && num > max ? num : max;
    }, 0);
    const nextId = `Q-${String(maxNum + 1).padStart(3, "0")}`;
    const todayStr = new Date().toISOString().split("T")[0];

    const newQuest = {
      id: nextId,
      date: todayStr,
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
    let targetDebuff = null;
    setDebuffs((prev) =>
      prev.map((d) => {
        if (d.id !== id) return d;
        targetDebuff = { ...d, active: !d.active };
        return targetDebuff;
      }),
    );

    if (targetDebuff?.rowIndex) {
      pushToSheet({
        action: "TOGGLE_DEBUFF",
        rowIndex: targetDebuff.rowIndex,
        active: targetDebuff.active,
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
