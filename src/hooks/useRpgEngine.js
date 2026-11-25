import confetti from "canvas-confetti";
import { useEffect, useMemo, useRef, useState } from "react";
import { INITIAL_DEBUFFS, INITIAL_QUESTS, RANK_CONFIG, SKILL_BRANCHES } from "../data/initialGameData";

const STORAGE_KEY = "rizal_rpg_tracker_v1";

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

  const [levelUpInfo, setLevelUpInfo] = useState(null);
  const [floatingReward, setFloatingReward] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ quests, debuffs, spentGold }));
  }, [quests, debuffs, spentGold]);

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
        if (q.date === todayStr || q.date === "2026-11-25") {
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
    setQuests((prev) =>
      prev.map((q) => {
        if (q.id !== id) return q;
        const nextCompleted = !q.completed;
        if (nextCompleted) {
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
        return { ...q, completed: nextCompleted };
      }),
    );
  };

  const addQuest = ({ title, type, skill, rank }) => {
    const nextNum = String(quests.length + 1).padStart(3, "0");
    const newQuest = {
      id: `Q-${nextNum}`,
      date: "2026-11-25",
      title,
      type,
      skill,
      rank,
      completed: false,
    };
    setQuests((prev) => [newQuest, ...prev]);
  };

  const deleteQuest = (id) => {
    setQuests((prev) => prev.filter((q) => q.id !== id));
  };

  const toggleDebuff = (id) => {
    setDebuffs((prev) => prev.map((d) => (d.id === id ? { ...d, active: !d.active } : d)));
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
