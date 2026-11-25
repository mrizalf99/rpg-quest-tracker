import { motion } from "framer-motion";
import { CheckCircle2, Circle, Coins, Sparkles, Swords, Trash2 } from "lucide-react";
import { RANK_CONFIG } from "../data/initialGameData";

export default function QuestCard({ quest, onToggle, onDelete }) {
  const rankStyle = RANK_CONFIG[quest.rank] || RANK_CONFIG.D;
  const isBoss = quest.type === "Boss Quest";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className={`group relative rounded-xl p-4 border transition-all ${
        quest.completed
          ? "bg-slate-900/40 border-slate-800/80 opacity-70"
          : isBoss
            ? "bg-gradient-to-r from-slate-900/95 to-indigo-950/40 border-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.12)]"
            : "bg-slate-900/80 border-slate-800 hover:border-cyan-500/40"
      }`}
    >
      <div className="flex items-start gap-3.5">
        <button onClick={() => onToggle(quest.id)} className="mt-0.5 text-cyan-400 hover:text-cyan-300 transition-transform active:scale-90" aria-label="Tandai quest selesai">
          {quest.completed ? <CheckCircle2 className="w-6 h-6 text-emerald-400" /> : <Circle className="w-6 h-6 text-slate-500 group-hover:text-cyan-400" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-[11px] font-mono text-slate-400">{quest.id}</span>
            <span className={`px-2 py-0.5 text-[11px] font-bold rounded border ${rankStyle.color}`}>{rankStyle.label}</span>
            <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-cyan-950/70 text-cyan-300 border border-cyan-500/20">{quest.skill}</span>
            {isBoss && (
              <span className="px-2 py-0.5 text-[11px] font-bold rounded bg-rose-950/70 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                <Swords className="w-3 h-3" /> BOSS QUEST
              </span>
            )}
          </div>

          <p className={`text-sm md:text-[15px] font-medium leading-snug ${quest.completed ? "line-through text-slate-500" : "text-slate-100"}`}>{quest.title}</p>

          <div className="flex items-center gap-4 mt-2.5 text-xs">
            <span className="text-cyan-400 font-semibold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> +{rankStyle.xp} XP
            </span>
            <span className="text-amber-400 font-semibold flex items-center gap-1">
              <Coins className="w-3.5 h-3.5" /> +{rankStyle.gold} Gold
            </span>
          </div>
        </div>

        <button onClick={() => onDelete(quest.id)} className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity p-1" title="Hapus Quest">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
