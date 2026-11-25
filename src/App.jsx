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
  const { quests, debuffs, stats, levelUpInfo, setLevelUpInfo, floatingReward, toggleQuest, addQuest, deleteQuest, toggleDebuff, redeemReward } = useRpgEngine();

  const [filter, setFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredQuests = quests.filter((q) => {
    if (filter === "ACTIVE") return !q.completed;
    if (filter === "COMPLETED") return q.completed;
    if (filter === "BOSS") return q.type === "Boss Quest";
    return true;
  });

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 py-6 md:px-8 md:py-8">
      {/* Popup Reward Melayang */}
      <AnimatePresence>
        {floatingReward && (
          <motion.div
            key={floatingReward.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -25 }}
            transition={{ duration: 0.45 }}
            className="fixed bottom-6 right-6 z-40 rounded-xl bg-slate-900/95 border border-cyan-400/50 px-4 py-3 shadow-xl shadow-cyan-500/20"
          >
            <div className="font-display text-xs font-bold text-cyan-300">QUEST CLEAR! ({floatingReward.skill})</div>
            <div className="text-xs font-semibold text-emerald-400 mt-0.5">
              +{floatingReward.xp} XP &bull; +{floatingReward.gold} Gold
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top HUD */}
      <CharacterHud stats={stats} />

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Kolom Kiri: Quest Board */}
        <main className="lg:col-span-8">
          <div className="hud-card rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <h2 className="font-display text-base font-bold tracking-wider text-white uppercase flex items-center gap-2">
                <Swords className="w-5 h-5 text-cyan-400" /> Quest Board
              </h2>

              <div className="flex flex-wrap items-center gap-2">
                {["ALL", "ACTIVE", "BOSS", "COMPLETED"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${filter === tab ? "bg-cyan-500 text-slate-950 font-bold" : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"}`}
                  >
                    {tab}
                  </button>
                ))}

                <button onClick={() => setIsModalOpen(true)} className="ml-1 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-500/20">
                  <Plus className="w-4 h-4" /> Quest Baru
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <AnimatePresence mode="popLayout">
                {filteredQuests.map((quest) => (
                  <QuestCard key={quest.id} quest={quest} onToggle={toggleQuest} onDelete={deleteQuest} />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </main>

        {/* Kolom Kanan: Skill Tree, Debuff & Reward Shop */}
        <aside className="lg:col-span-4">
          <SkillTreePanel skills={stats.skills} debuffs={debuffs} onToggleDebuff={toggleDebuff} availableGold={stats.availableGold} onRedeem={redeemReward} />
        </aside>
      </div>

      {isModalOpen && <AddQuestModal onClose={() => setIsModalOpen(false)} onAdd={addQuest} />}

      <LevelUpModal info={levelUpInfo} onClose={() => setLevelUpInfo(null)} />
    </div>
  );
}
