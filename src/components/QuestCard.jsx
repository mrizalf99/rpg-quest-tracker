import { motion } from "framer-motion";
import { Calendar, CheckCircle2, Circle, Coins, Sparkles, Swords, Trash2 } from "lucide-react";
import { forwardRef } from "react";
import { RANK_CONFIG } from "../data/initialGameData";
import { formatQuestDate, getLocalTodayISO, normalizeToISO } from "../utils/dateUtils";

const QuestCard = forwardRef(function QuestCard({ quest, onToggle, onDelete }, ref) {
  const rankStyle = RANK_CONFIG[quest.rank] || RANK_CONFIG.D;
  const isBoss = quest.type === "Boss Quest";
  const isToday = normalizeToISO(quest.date) === getLocalTodayISO();
  const formattedDate = formatQuestDate(quest.date);

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18 }}
      className={`group relative rounded-xl p-4 border transition-all ${
        quest.completed
          ? "bg-slate-900/30 border-slate-800/60 opacity-60"
          : isBoss
            ? "bg-slate-900/80 border-indigo-400/35 border-l-4 border-l-indigo-400 shadow-[0_8px_24px_-12px_rgba(99,102,241,0.35)]"
            : "bg-slate-900/65 border-slate-800/90 hover:border-slate-700"
      }`}
    >
      <div className="flex items-start gap-3.5">
        <button onClick={() => onToggle(quest.id)} className="mt-0.5 shrink-0 transition-transform active:scale-90" aria-label="Selesaikan quest">
          {quest.completed ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <Circle className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[11px] font-mono text-slate-500">{quest.id}</span>
            <span className={`px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded border ${rankStyle.color}`}>{rankStyle.label}</span>
            <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider rounded bg-slate-800 text-cyan-300 border border-slate-700">{quest.skill}</span>
            {isBoss && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase rounded bg-indigo-500/15 text-indigo-300 border border-indigo-400/30">
                <Swords className="w-3 h-3" /> Boss
              </span>
            )}
          </div>

          <p className={`text-sm font-medium leading-relaxed ${quest.completed ? "line-through text-slate-500" : "text-slate-100"}`}>{quest.title}</p>

          <div className="flex flex-wrap items-center justify-between gap-2 mt-3 text-xs">
            <div className="flex items-center gap-3.5">
              <span className="inline-flex items-center gap-1 text-cyan-400/90 font-medium">
                <Sparkles className="w-3.5 h-3.5" /> +{rankStyle.xp} XP
              </span>
              <span className="inline-flex items-center gap-1 text-amber-400/90 font-medium">
                <Coins className="w-3.5 h-3.5" /> +{rankStyle.gold} Gold
              </span>
            </div>

            {/* Badge Tanggal Detail */}
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium border ${isToday ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/25" : "bg-slate-950/60 text-slate-400 border-slate-800"}`}>
              <Calendar className="w-3 h-3" />
              {formattedDate}
            </span>
          </div>
        </div>

        <button onClick={() => onDelete(quest.id)} className="opacity-70 sm:opacity-0 group-hover:opacity-100 text-slate-500 hover:text-rose-400 transition-opacity p-1.5 rounded-lg hover:bg-slate-800/60" title="Hapus Quest">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
});

export default QuestCard;
