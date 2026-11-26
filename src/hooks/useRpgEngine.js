import { useCallback, useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_SHEETS_API_URL || "";
const API_KEY = import.meta.env.VITE_API_KEY || "";

const RANK_REWARDS = {
  E: { xp: 20, gold: 10 },
  D: { xp: 50, gold: 25 },
  C: { xp: 120, gold: 60 },
  B: { xp: 300, gold: 150 },
  A: { xp: 600, gold: 300 },
  S: { xp: 1200, gold: 600 },
};

function getRankTitle(level) {
  if (level >= 25) return "Tech & Global Specialist";
  if (level >= 20) return "A-Rank Vanguard";
  if (level >= 15) return "B-Rank Tactician";
  if (level >= 10) return "C-Rank Specialist";
  if (level >= 5) return "D-Rank Apprentice";
  return "E-Rank Novice";
}

export function getLocalTodayStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getLocalNowTimeStr() {
  const d = new Date();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

function generateSequentialId(questsList) {
  let maxNum = 0;
  (questsList || []).forEach((q) => {
    const match = String(q.id || "")
      .trim()
      .match(/^Q-(\d+)$/i);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNum) maxNum = num;
    }
  });
  return `Q-${String(maxNum + 1).padStart(3, "0")}`;
}

export function useRpgEngine() {
  const [quests, setQuests] = useState([]);
  const [skills, setSkills] = useState([]);
  const [debuffs, setDebuffs] = useState([]);
  const [availableGold, setAvailableGold] = useState(0);
  const [sheetMeta, setSheetMeta] = useState({
    level: null,
    rankTitle: null,
    totalXp: null,
  });

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [floatingReward, setFloatingReward] = useState(null);
  const [levelUpInfo, setLevelUpInfo] = useState(null);

  const fetchGameData = useCallback(async (silent = false) => {
    if (!API_URL) {
      setError("VITE_SHEETS_API_URL belum diatur di .env");
      setLoading(false);
      return;
    }

    if (!silent) setLoading(true);
    setSyncing(true);

    try {
      const url = API_KEY ? `${API_URL}?key=${encodeURIComponent(API_KEY)}` : API_URL;
      const res = await fetch(url);
      const data = await res.json();

      if (data.status === "success") {
        const normalizedQuests = (data.quests || []).map((q) => ({
          ...q,
          completedDate: q.completed ? q.completedDate || q.date || "" : "",
          createdTime: q.createdTime || "",
          completedTime: q.completed ? q.completedTime || "" : "",
        }));

        setQuests(normalizedQuests);
        setSkills(data.skills || []);
        setDebuffs(data.debuffs || []);
        setAvailableGold(Number(data.availableGold) || 0);
        setSheetMeta({
          level: Number(data.sheetLevel) || null,
          rankTitle: data.sheetRankTitle || null,
          totalXp: data.sheetTotalXp !== null && data.sheetTotalXp !== undefined ? Number(data.sheetTotalXp) : null,
        });
        setError(null);
      } else {
        setError(data.message || "Gagal memuat data dari Google Sheets");
      }
    } catch (err) {
      setError("Koneksi ke server Google Apps Script gagal");
    } finally {
      setLoading(false);
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    fetchGameData();
  }, [fetchGameData]);

  const postAction = async (bodyPayload) => {
    if (!API_URL) return;
    setSyncing(true);
    try {
      await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          ...bodyPayload,
          ...(API_KEY ? { key: API_KEY } : {}),
        }),
      });
      await fetchGameData(true);
    } catch (err) {
      setError("Gagal menyinkronkan perubahan ke Google Sheets");
    } finally {
      setSyncing(false);
    }
  };

  const toggleQuest = async (questId) => {
    const target = quests.find((q) => q.id === questId);
    if (!target) return;

    const nextCompleted = !target.completed;
    const todayStr = getLocalTodayStr(0);
    const nowTime = getLocalNowTimeStr();
    const reward = RANK_REWARDS[target.rank] || RANK_REWARDS.D;
    const xpDelta = nextCompleted ? reward.xp : -reward.xp;
    const goldDelta = nextCompleted ? reward.gold : -reward.gold;

    setQuests((prev) =>
      prev.map((q) =>
        q.id === questId
          ? {
              ...q,
              completed: nextCompleted,
              completedDate: nextCompleted ? todayStr : "",
              completedTime: nextCompleted ? nowTime : "",
            }
          : q,
      ),
    );

    setSheetMeta((prev) => {
      if (prev.totalXp === null) return prev;
      const updatedXp = Math.max(0, prev.totalXp + xpDelta);
      return {
        ...prev,
        totalXp: updatedXp,
        level: Math.floor(updatedXp / 500) + 1,
      };
    });
    setAvailableGold((prev) => Math.max(0, Number(prev) + goldDelta));

    if (nextCompleted) {
      setFloatingReward({
        id: `${questId}-${Date.now()}`,
        skill: target.skill || "INT",
        xp: reward.xp,
        gold: reward.gold,
      });
      setTimeout(() => setFloatingReward(null), 3000);

      if (sheetMeta.totalXp !== null) {
        const oldLvl = Math.floor(sheetMeta.totalXp / 500) + 1;
        const newLvl = Math.floor((sheetMeta.totalXp + reward.xp) / 500) + 1;
        if (newLvl > oldLvl) {
          setLevelUpInfo({
            oldLevel: oldLvl,
            newLevel: newLvl,
            rankTitle: getRankTitle(newLvl),
          });
        }
      }
    }

    await postAction({
      action: "TOGGLE_QUEST",
      id: questId,
      completed: nextCompleted,
    });
  };

  const addQuest = async (newQuest) => {
    const nextId = generateSequentialId(quests);
    const questDate = newQuest.date || getLocalTodayStr(0);
    const nowTime = getLocalNowTimeStr();

    const optimisticItem = {
      id: nextId,
      date: questDate,
      completedDate: "",
      createdTime: nowTime,
      completedTime: "",
      title: newQuest.title,
      type: newQuest.type || "Daily Quest",
      skill: newQuest.skill || "INT",
      rank: newQuest.rank || "D",
      completed: false,
    };

    setQuests((prev) => [optimisticItem, ...prev]);

    await postAction({
      action: "ADD_QUEST",
      ...optimisticItem,
    });
  };

  const deleteQuest = async (questId) => {
    const target = quests.find((q) => q.id === questId);
    if (target && target.completed) {
      const reward = RANK_REWARDS[target.rank] || RANK_REWARDS.D;
      setSheetMeta((prev) => {
        if (prev.totalXp === null) return prev;
        const updatedXp = Math.max(0, prev.totalXp - reward.xp);
        return {
          ...prev,
          totalXp: updatedXp,
          level: Math.floor(updatedXp / 500) + 1,
        };
      });
      setAvailableGold((prev) => Math.max(0, Number(prev) - reward.gold));
    }

    setQuests((prev) => prev.filter((q) => q.id !== questId));
    await postAction({
      action: "DELETE_QUEST",
      id: questId,
    });
  };

  const toggleDebuff = async (debuff) => {
    const nextActive = !debuff.active;
    const penaltyDelta = nextActive ? -Number(debuff.penalty || 0) : Number(debuff.penalty || 0);

    setDebuffs((prev) => prev.map((d) => (d.id === debuff.id ? { ...d, active: nextActive } : d)));
    setSheetMeta((prev) => {
      if (prev.totalXp === null) return prev;
      const updatedXp = Math.max(0, prev.totalXp + penaltyDelta);
      return {
        ...prev,
        totalXp: updatedXp,
        level: Math.floor(updatedXp / 500) + 1,
      };
    });

    await postAction({
      action: "TOGGLE_DEBUFF",
      rowIndex: debuff.rowIndex,
      active: nextActive,
    });
  };

  const redeemReward = async (item) => {
    const cost = Number(item?.cost || item?.price || 0);
    if (cost <= 0 || availableGold < cost) return;

    setAvailableGold((prev) => Math.max(0, Number(prev) - cost));
    await postAction({
      action: "REDEEM_REWARD",
      title: item.title || item.name || "Reward",
      cost,
    });
  };

  const stats = useMemo(() => {
    const todayStr = getLocalTodayStr(0);

    let grossXpFromQuests = 0;
    let earnedGold = 0;
    let completedTodayCount = 0;
    let xpToday = 0;

    const completedByDate = {};

    quests.forEach((q) => {
      if (!q.completed) return;
      const reward = RANK_REWARDS[q.rank] || RANK_REWARDS.D;
      grossXpFromQuests += reward.xp;
      earnedGold += reward.gold;

      const doneDate = q.completedDate || q.date;
      if (doneDate) {
        completedByDate[doneDate] = (completedByDate[doneDate] || 0) + 1;
      }

      if (doneDate === todayStr) {
        completedTodayCount += 1;
        xpToday += reward.xp;
      }
    });

    const activeDebuffs = debuffs.filter((d) => d.active);
    const activeDebuffPenalty = activeDebuffs.reduce((sum, d) => sum + (Number(d.penalty) || 0), 0);

    const computedNetXp = Math.max(0, grossXpFromQuests - activeDebuffPenalty);
    const totalXp = sheetMeta.totalXp !== null && sheetMeta.totalXp > 0 ? sheetMeta.totalXp : computedNetXp;
    const xpPerLevel = 500;
    const level = Math.floor(totalXp / xpPerLevel) + 1;

    const xpInCurrentLevel = totalXp % xpPerLevel;
    const xpToNextLevel = xpPerLevel - xpInCurrentLevel;
    const nextLevelXp = level * xpPerLevel;
    const levelProgressPct = Math.min(100, Math.round((xpInCurrentLevel / xpPerLevel) * 100));

    let streak = 0;
    let checkOffset = completedByDate[todayStr] > 0 ? 0 : -1;
    while (true) {
      const dateKey = getLocalTodayStr(checkOffset);
      if ((completedByDate[dateKey] || 0) > 0) {
        streak += 1;
        checkOffset -= 1;
      } else {
        break;
      }
    }

    const dailyTarget = 3;
    const isDailyClear = completedTodayCount >= dailyTarget;
    const completedQuestsList = quests.filter((q) => q.completed);
    const pendingQuestsList = quests.filter((q) => !q.completed);
    const todayQuestsList = quests.filter((q) => q.date === todayStr || q.completedDate === todayStr);
    const resolvedGold = Number(availableGold) || earnedGold;
    const rankTitle = sheetMeta.rankTitle || getRankTitle(level);

    return {
      todayStr,
      totalXp,
      netXP: totalXp,
      netXp: totalXp,
      grossXP: totalXp + activeDebuffPenalty,
      grossXp: totalXp + activeDebuffPenalty,
      level,
      rankTitle,
      currentLevelXP: xpInCurrentLevel,
      xpInCurrentLevel,
      currentXp: xpInCurrentLevel,
      xpInLevel: xpInCurrentLevel,
      nextLevelXp,
      maxXp: xpPerLevel,
      xpNeeded: xpPerLevel,
      xpToNextLevel,
      remainingXp: xpToNextLevel,
      levelProgressPct,
      progressPct: levelProgressPct,
      availableGold: resolvedGold,
      gold: resolvedGold,
      totalPenalty: activeDebuffPenalty,
      activeDebuffPenalty,
      debuffPenalty: activeDebuffPenalty,
      penaltyXp: activeDebuffPenalty,
      activeDebuffs,
      completedToday: completedTodayCount,
      completedTodayCount,
      dailyTarget,
      isDailyClear,
      dailyClear: isDailyClear,
      xpToday,
      streakDays: streak,
      streak,
      completedCount: completedQuestsList.length,
      totalCompletedQuests: completedQuestsList.length,
      completedQuests: completedQuestsList,
      pendingQuests: pendingQuestsList,
      todayQuests: todayQuestsList,
      skills: skills || [],
      debuffs: debuffs || [],
    };
  }, [quests, debuffs, availableGold, sheetMeta, skills]);

  const syncStatus = !API_URL ? "idle" : error ? "error" : syncing ? "syncing" : "synced";

  return {
    quests: quests || [],
    skills: skills || [],
    debuffs: debuffs || [],
    rewards: [],
    shopItems: [],
    logs: [],
    history: [],
    todayQuests: stats.todayQuests,
    completedQuests: stats.completedQuests,
    pendingQuests: stats.pendingQuests,
    stats,
    character: {
      level: stats.level,
      rankTitle: stats.rankTitle,
      xp: stats.totalXp,
      totalXp: stats.totalXp,
      netXP: stats.netXP,
      netXp: stats.netXp,
      grossXp: stats.grossXp,
      currentLevelXP: stats.currentLevelXP,
      currentXp: stats.xpInCurrentLevel,
      xpInLevel: stats.xpInCurrentLevel,
      nextLevelXp: stats.nextLevelXp,
      maxXp: stats.maxXp,
      xpToNextLevel: stats.xpToNextLevel,
      progressPct: stats.levelProgressPct,
      gold: stats.availableGold,
      availableGold: stats.availableGold,
      streakDays: stats.streakDays,
      streak: stats.streak,
      skills: skills || [],
      debuffs: debuffs || [],
      activeDebuffs: stats.activeDebuffs,
    },
    loading,
    isLoading: loading,
    syncing,
    isSyncing: syncing,
    syncStatus,
    error,
    floatingReward,
    levelUpInfo,
    setLevelUpInfo,
    toggleQuest,
    completeQuest: toggleQuest,
    addQuest,
    createQuest: addQuest,
    deleteQuest,
    removeQuest: deleteQuest,
    toggleDebuff,
    redeemReward,
    refreshData: () => fetchGameData(false),
    fetchFromSheet: () => fetchGameData(false),
    fetchData: () => fetchGameData(false),
  };
}
