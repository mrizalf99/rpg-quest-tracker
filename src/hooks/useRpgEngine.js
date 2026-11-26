import { useCallback, useEffect, useMemo, useState } from "react";

const API_URL = import.meta.env.VITE_SHEETS_API_URL || "";
const API_KEY = import.meta.env.VITE_API_KEY || "";

const RANK_REWARDS = {
  E: { xp: 25, gold: 10 },
  D: { xp: 50, gold: 25 },
  C: { xp: 150, gold: 75 },
  B: { xp: 300, gold: 150 },
  A: { xp: 600, gold: 300 },
  S: { xp: 1200, gold: 600 },
};

// Helper tanggal hari ini format YYYY-MM-DD sesuai waktu lokal (anti-geser UTC)
export function getLocalTodayStr(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function useRpgEngine() {
  const [quests, setQuests] = useState([]);
  const [skills, setSkills] = useState([]);
  const [debuffs, setDebuffs] = useState([]);
  const [availableGold, setAvailableGold] = useState(0);
  const [sheetMeta, setSheetMeta] = useState({ level: null, totalXp: null });

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);

  // ================= FETCH DATA DARI GOOGLE SHEETS =================
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
          // Pastikan completedDate selalu terisi untuk quest yang sudah selesai
          completedDate: q.completed ? q.completedDate || q.date || "" : "",
        }));

        setQuests(normalizedQuests);
        setSkills(data.skills || []);
        setDebuffs(data.debuffs || []);
        setAvailableGold(Number(data.availableGold) || 0);
        setSheetMeta({
          level: data.sheetLevel || null,
          totalXp: data.sheetTotalXp || null,
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

  // Helper kirim aksi POST ke Apps Script
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

  // ================= AKSI QUEST & DEBUFF =================
  const toggleQuest = async (questId) => {
    const target = quests.find((q) => q.id === questId);
    if (!target) return;

    const nextCompleted = !target.completed;
    const todayStr = getLocalTodayStr(0);

    // Optimistic Update: langsung catat completedDate = hari ini
    setQuests((prev) =>
      prev.map((q) =>
        q.id === questId
          ? {
              ...q,
              completed: nextCompleted,
              completedDate: nextCompleted ? todayStr : "",
            }
          : q,
      ),
    );

    await postAction({
      action: "TOGGLE_QUEST",
      id: questId,
      completed: nextCompleted,
    });
  };

  const addQuest = async (newQuest) => {
    const nextNum = quests.length + 1;
    const generatedId = newQuest.id || `Q-${String(Date.now()).slice(-4)}-${nextNum}`;
    const questDate = newQuest.date || getLocalTodayStr(0);

    const optimisticItem = {
      id: generatedId,
      date: questDate,
      completedDate: "",
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
    setQuests((prev) => prev.filter((q) => q.id !== questId));
    await postAction({
      action: "DELETE_QUEST",
      id: questId,
    });
  };

  const toggleDebuff = async (debuff) => {
    const nextActive = !debuff.active;
    setDebuffs((prev) => prev.map((d) => (d.id === debuff.id ? { ...d, active: nextActive } : d)));
    await postAction({
      action: "TOGGLE_DEBUFF",
      rowIndex: debuff.rowIndex,
      active: nextActive,
    });
  };

  // ================= KALKULASI STATS, DAILY CLEAR 3/3 & STREAK =================
  const stats = useMemo(() => {
    const todayStr = getLocalTodayStr(0);

    let grossXp = 0;
    let earnedGold = 0;
    let completedTodayCount = 0;
    let xpToday = 0;

    // Peta jumlah quest selesai per tanggal penyelesaian (completedDate)
    const completedByDate = {};

    quests.forEach((q) => {
      if (!q.completed) return;
      const reward = RANK_REWARDS[q.rank] || RANK_REWARDS.D;
      grossXp += reward.xp;
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

    // Penalti Debuff Aktif
    const activeDebuffs = debuffs.filter((d) => d.active);
    const activeDebuffPenalty = activeDebuffs.reduce((sum, d) => sum + (Number(d.penalty) || 0), 0);

    const computedNetXp = Math.max(0, grossXp - activeDebuffPenalty);
    const totalXp = sheetMeta.totalXp !== null ? sheetMeta.totalXp : computedNetXp;
    const level = sheetMeta.level !== null ? sheetMeta.level : Math.floor(totalXp / 1000) + 1;

    const xpPerLevel = 1000;
    const xpInCurrentLevel = totalXp % xpPerLevel;
    const xpToNextLevel = xpPerLevel - xpInCurrentLevel;
    const nextLevelXp = level * xpPerLevel;
    const levelProgressPct = Math.min(100, Math.round((xpInCurrentLevel / xpPerLevel) * 100));

    // Hitung Streak berturut-turut (hari ini + hari-hari sebelumnya yang >= 1 quest selesai)
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

    return {
      todayStr,
      totalXp,
      netXp: totalXp,
      grossXp: totalXp + activeDebuffPenalty,
      level,
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
      activeDebuffPenalty,
      debuffPenalty: activeDebuffPenalty,
      penaltyXp: activeDebuffPenalty,
      activeDebuffs,
      completedTodayCount,
      completedToday: completedTodayCount,
      dailyTarget,
      isDailyClear,
      dailyClear: isDailyClear,
      xpToday,
      streak,
      totalCompletedQuests: completedQuestsList.length,
      completedQuests: completedQuestsList,
      pendingQuests: pendingQuestsList,
      todayQuests: todayQuestsList,
      skills: skills || [],
      debuffs: debuffs || [],
    };
  }, [quests, debuffs, availableGold, sheetMeta, skills]);

  return {
    // Data utama
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

    // Statistik lengkap (semua angka dijamin Number, tidak pernah undefined)
    stats,

    // Objek karakter (kompatibel dengan berbagai versi CharacterHud)
    character: {
      level: stats.level,
      xp: stats.totalXp,
      totalXp: stats.totalXp,
      netXp: stats.netXp,
      grossXp: stats.grossXp,
      currentXp: stats.xpInCurrentLevel,
      xpInLevel: stats.xpInCurrentLevel,
      nextLevelXp: stats.nextLevelXp,
      maxXp: stats.maxXp,
      xpToNextLevel: stats.xpToNextLevel,
      progressPct: stats.levelProgressPct,
      gold: stats.availableGold,
      availableGold: stats.availableGold,
      streak: stats.streak,
      skills: skills || [],
      debuffs: debuffs || [],
      activeDebuffs: stats.activeDebuffs,
    },

    // Status loading & sinkronisasi
    loading,
    isLoading: loading,
    syncing,
    isSyncing: syncing,
    syncStatus: error ? "error" : syncing ? "syncing" : "synced",
    error,

    // Fungsi aksi
    toggleQuest,
    completeQuest: toggleQuest,
    addQuest,
    createQuest: addQuest,
    deleteQuest,
    removeQuest: deleteQuest,
    toggleDebuff,
    refreshData: () => fetchGameData(false),
    fetchData: () => fetchGameData(false),
  };
}
