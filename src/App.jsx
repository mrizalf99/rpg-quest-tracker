import { AnimatePresence, motion } from "framer-motion";
import { Plus, Swords } from "lucide-react";
import { useState } from "react";
import AddQuestModal from "./components/AddQuestModal";
import CharacterHud from "./components/CharacterHud";
import LevelUpModal from "./components/LevelUpModal";
import QuestCard from "./components/QuestCard";
import SkillTreePanel from "./components/SkillTreePanel";
import { useRpgEngine } from "./hooks/useRpgEngine";

export default function App() {
  const { quests, debuffs, stats, syncStatus, fetchFromSheet, levelUpInfo, setLevelUpInfo, floatingReward, toggleQuest, addQuest, deleteQuest, toggleDebuff, redeemReward } = useRpgEngine();

  const [filter, setFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredQuests = quests.filter((q) => {
    if (filter === "ACTIVE") return !q.completed;
    if (filter === "COMPLETED") return q.completed;
    if (filter === "BOSS") return q.type === "Boss Quest";
    return true;
  });

  return (
    <div className="min-h-screen w-full py-8 px-4 sm:px-6 lg:px-8">
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
              className="fixed bottom-6 right-6 z-40 rounded-xl bg-slate-900/95 border border-cyan-400/40 px-4 py-3 shadow-2xl"
            >
              <div className="font-display text-xs font-bold text-cyan-300">QUEST CLEAR &bull; {floatingReward.skill}</div>
              <div className="text-xs font-semibold text-emerald-400 mt-0.5">
                +{floatingReward.xp} XP &bull; +{floatingReward.gold} Gold
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bar Status Koneksi Google Sheet */}
        <div className="flex justify-end items-center gap-3 mb-3 text-xs">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-slate-300">
            <span className={`w-2 h-2 rounded-full ${syncStatus === "syncing" ? "bg-amber-400 animate-pulse" : syncStatus === "synced" ? "bg-emerald-400" : syncStatus === "error" ? "bg-rose-500" : "bg-slate-500"}`} />
            {syncStatus === "syncing" && "Menyinkronkan ke Google Sheet..."}
            {syncStatus === "synced" && "Terhubung ke Google Sheet"}
            {syncStatus === "error" && "Mode Offline (Cache Lokal)"}
            {syncStatus === "idle" && "Menunggu URL API (.env)"}
          </span>

          <button onClick={fetchFromSheet} className="px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 text-cyan-300 transition-colors" title="Tarik ulang data dari Google Sheet">
            Refresh Sheet
          </button>
        </div>

        {/* Top Character HUD */}
        <CharacterHud stats={stats} />

        {/* Grid Utama 2 Kolom Terpusat */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Kolom Kiri: Quest Board */}
          <main className="lg:col-span-8 rpg-panel rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-5 border-b border-slate-800/80">
              <h2 className="font-display text-xs font-bold tracking-[0.18em] text-white uppercase flex items-center gap-2">
                <Swords className="w-4 h-4 text-cyan-400" /> Quest Board
              </h2>

              <div className="flex flex-wrap items-center gap-1.5">
                {["ALL", "ACTIVE", "BOSS", "COMPLETED"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold tracking-wider transition-all ${
                      filter === tab ? "bg-cyan-400 text-slate-950 font-bold" : "bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800"
                    }`}
                  >
                    {tab}
                  </button>
                ))}

                <button onClick={() => setIsModalOpen(true)} className="ml-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-[11px] font-bold tracking-wider inline-flex items-center gap-1.5 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> QUEST BARU
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {filteredQuests.map((quest) => (
                  <QuestCard key={quest.id} quest={quest} onToggle={toggleQuest} onDelete={deleteQuest} />
                ))}
              </AnimatePresence>
            </div>
          </main>

          {/* Kolom Kanan: Skill Mastery, Debuff & Shop */}
          <aside className="lg:col-span-4">
            <SkillTreePanel skills={stats.skills} debuffs={debuffs} onToggleDebuff={toggleDebuff} availableGold={stats.availableGold} onRedeem={redeemReward} />
          </aside>
        </div>
      </div>

      {isModalOpen && <AddQuestModal onClose={() => setIsModalOpen(false)} onAdd={addQuest} />}

      <LevelUpModal info={levelUpInfo} onClose={() => setLevelUpInfo(null)} />
    </div>
  );
}
