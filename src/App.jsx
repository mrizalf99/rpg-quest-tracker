import { AnimatePresence, motion } from "framer-motion";
import { BarChart3, Plus, Swords } from "lucide-react";
import { useState } from "react";
import AddQuestModal from "./components/AddQuestModal";
import Analytics from "./components/Analytics";
import CharacterHud from "./components/CharacterHud";
import LevelUpModal from "./components/LevelUpModal";
import QuestCard from "./components/QuestCard";
import QuickNavCards from "./components/QuickNavCards";
import SkillTreePanel from "./components/SkillTreePanel";
import { useRpgEngine } from "./hooks/useRpgEngine";
import { getLocalTodayISO, normalizeToISO } from "./utils/dateUtils";

export default function App() {
  const { quests, debuffs, stats, syncStatus, fetchFromSheet, levelUpInfo, setLevelUpInfo, floatingReward, toggleQuest, addQuest, deleteQuest, toggleDebuff, redeemReward } = useRpgEngine();

  const [activeTab, setActiveTab] = useState("QUEST"); // "QUEST" | "SKILL" | "DEBUFF" | "SHOP" | "ANALYTICS"
  const [filter, setFilter] = useState("TODAY"); // Default langsung menampilkan quest aktif hari ini
  const [isModalOpen, setIsModalOpen] = useState(false);

  const todayISO = getLocalTodayISO();
  const activeTodayCount = quests.filter((q) => !q.completed && normalizeToISO(q.date) === todayISO).length;

  // Filter & Urutkan mulai dari tanggal hari ini ke bawah
  const filteredQuests = quests
    .filter((q) => {
      const qDate = normalizeToISO(q.date);
      if (filter === "TODAY") return !q.completed && qDate === todayISO;
      if (filter === "ACTIVE") return !q.completed;
      if (filter === "COMPLETED") return q.completed;
      if (filter === "BOSS") return q.type === "Boss Quest";
      return true;
    })
    .sort((a, b) => {
      const dateA = normalizeToISO(a.date);
      const dateB = normalizeToISO(b.date);

      if (dateA === todayISO && dateB !== todayISO) return -1;
      if (dateB === todayISO && dateA !== todayISO) return 1;

      if (dateA >= todayISO && dateB >= todayISO) {
        return dateA.localeCompare(dateB);
      }
      if (dateA >= todayISO && dateB < todayISO) return -1;
      if (dateB >= todayISO && dateA < todayISO) return 1;

      return dateB.localeCompare(dateA);
    });

  const handleSelectNav = (tabId) => {
    setActiveTab(tabId);
    if (window.innerWidth >= 1024 && tabId !== "ANALYTICS") {
      const targetMap = {
        QUEST: "section-quest",
        SKILL: "section-skill",
        DEBUFF: "section-debuff",
        SHOP: "section-shop",
      };
      const el = document.getElementById(targetMap[tabId]);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const filterTabs = [
    { id: "TODAY", label: "HARI INI" },
    { id: "ACTIVE", label: "SEMUA AKTIF" },
    { id: "BOSS", label: "BOSS" },
    { id: "COMPLETED", label: "SELESAI" },
    { id: "ALL", label: "SEMUA" },
  ];

  return (
    <div className="min-h-screen w-full py-5 sm:py-8 px-3.5 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Notifikasi Reward Melayang */}
        <AnimatePresence>
          {floatingReward && (
            <motion.div
              key={floatingReward.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="fixed bottom-5 right-5 z-40 rounded-xl bg-slate-900/95 border border-cyan-400/40 px-4 py-3 shadow-2xl"
            >
              <div className="font-display text-xs font-bold text-cyan-300">QUEST CLEAR &bull; {floatingReward.skill}</div>
              <div className="text-xs font-semibold text-emerald-400 mt-0.5">
                +{floatingReward.xp} XP &bull; +{floatingReward.gold} Gold
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Bar Status Koneksi Google Sheet & Tombol Analytics */}
        <div className="flex flex-wrap justify-between sm:justify-end items-center gap-2 mb-3 text-[11px] sm:text-xs">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300">
            <span className={`w-2 h-2 rounded-full ${syncStatus === "syncing" ? "bg-amber-400 animate-pulse" : syncStatus === "synced" ? "bg-emerald-400" : syncStatus === "error" ? "bg-rose-500" : "bg-slate-500"}`} />
            {syncStatus === "syncing" && "Menyinkronkan..."}
            {syncStatus === "synced" && "Terhubung ke Google Sheet"}
            {syncStatus === "error" && "Mode Offline"}
            {syncStatus === "idle" && "Menunggu URL API"}
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab((prev) => (prev === "ANALYTICS" ? "QUEST" : "ANALYTICS"))}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border transition-colors ${
                activeTab === "ANALYTICS" ? "bg-cyan-400 text-slate-950 border-cyan-400 font-bold" : "bg-slate-900 hover:bg-slate-800 border-slate-800 text-cyan-300"
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              {activeTab === "ANALYTICS" ? "Kembali ke Quest" : "Analytics"}
            </button>

            <button onClick={fetchFromSheet} className="px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-300 transition-colors" title="Tarik ulang data dari Google Sheet">
              Refresh
            </button>
          </div>
        </div>
        {/* Top Character HUD */}
        <CharacterHud stats={stats} />
        // 1. Tambahkan import di bagian atas src/App.jsx: import EverySecondCountsClock from "./components/EverySecondCountsClock"; // 2. Letakkan tepat di bawah <CharacterHud stats={stats} /> (atau di atasnya):
        <CharacterHud stats={stats} />
        {/* Jam Hitung Mundur "EVERY SECOND COUNTS" ala The Bear */}
        <EverySecondCountsClock />
        {/* 4 Quick-Nav Card Boxes */}
        <QuickNavCards activeTab={activeTab} onSelectTab={handleSelectNav} activeQuestCount={activeTodayCount} skillCount={stats.skills.length} totalPenalty={stats.totalPenalty} availableGold={stats.availableGold} />
        {/* Tampilan Analytics vs Grid Utama */}
        {activeTab === "ANALYTICS" ? (
          <Analytics quests={quests} debuffs={debuffs} stats={stats} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Kolom Kiri: Quest Board */}
            <main id="section-quest" className={`lg:col-span-8 rpg-panel rounded-2xl p-4 sm:p-6 scroll-mt-6 ${activeTab === "QUEST" ? "block" : "hidden lg:block"}`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 sm:pb-5 mb-4 sm:mb-5 border-b border-slate-800/80">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-xs font-bold tracking-[0.18em] text-white uppercase flex items-center gap-2">
                    <Swords className="w-4 h-4 text-cyan-400" /> Quest Board
                  </h2>

                  <button onClick={() => setIsModalOpen(true)} className="sm:hidden px-3 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-[11px] font-bold tracking-wider inline-flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> BARU
                  </button>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                  {filterTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setFilter(tab.id)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold tracking-wider shrink-0 transition-all ${
                        filter === tab.id ? "bg-cyan-400 text-slate-950 font-bold" : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}

                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="hidden sm:inline-flex ml-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-[11px] font-bold tracking-wider items-center gap-1.5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> QUEST BARU
                  </button>
                </div>
              </div>

              {filteredQuests.length === 0 ? (
                <div className="text-center py-10 px-4 rounded-xl border border-dashed border-slate-800 text-slate-400 text-xs sm:text-sm">
                  {filter === "TODAY" ? "Semua quest aktif untuk hari ini sudah tuntas! Cek tab SEMUA AKTIF atau tambah quest baru." : "Tidak ada quest pada kategori ini."}
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {filteredQuests.map((quest) => (
                      <QuestCard key={quest.id} quest={quest} onToggle={toggleQuest} onDelete={deleteQuest} />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </main>

            {/* Kolom Kanan: Skill Mastery, Debuff & Shop */}
            <aside className="lg:col-span-4">
              <SkillTreePanel activeTab={activeTab} skills={stats.skills} debuffs={debuffs} onToggleDebuff={toggleDebuff} availableGold={stats.availableGold} onRedeem={redeemReward} />
            </aside>
          </div>
        )}
      </div>

      {isModalOpen && <AddQuestModal onClose={() => setIsModalOpen(false)} onAdd={addQuest} />}

      <LevelUpModal info={levelUpInfo} onClose={() => setLevelUpInfo(null)} />
    </div>
  );
}
