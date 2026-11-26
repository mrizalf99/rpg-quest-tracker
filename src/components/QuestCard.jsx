import { motion } from "framer-motion";
import { Calendar, Check, Clock, Coins, Sparkles, Trash2 } from "lucide-react";

const RANK_STYLE = {
  S: "bg-rose-500/15 text-rose-300 border-rose-400/40",
  A: "bg-amber-500/15 text-amber-300 border-amber-400/40",
  B: "bg-purple-500/15 text-purple-300 border-purple-400/40",
  C: "bg-cyan-500/15 text-cyan-300 border-cyan-400/40",
  D: "bg-emerald-500/15 text-emerald-300 border-emerald-400/40",
  E: "bg-slate-500/15 text-slate-300 border-slate-400/30",
};

const RANK_REWARD_PREVIEW = {
  E: { xp: 20, gold: 10 },
  D: { xp: 50, gold: 25 },
  C: { xp: 120, gold: 60 },
  B: { xp: 300, gold: 150 },
  A: { xp: 600, gold: 300 },
  S: { xp: 1200, gold: 600 },
};

export default function QuestCard({ quest, onToggle, onDelete }) {
  const reward = RANK_REWARD_PREVIEW[quest.rank] || RANK_REWARD_PREVIEW.D;
  const rankBadge = RANK_STYLE[quest.rank] || RANK_STYLE.D;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className={`group rounded-xl p-3.5 sm:p-4 border transition-all ${quest.completed ? "bg-slate-900/45 border-slate-800/70 opacity-75" : "rpg-subcard hover:border-cyan-400/40"}`}
    >
      <div className="flex items-start gap-3">
        {/* Tombol Centang Selesai */}
        <button
          type="button"
          onClick={() => onToggle(quest.id)}
          aria-label="Tandai quest selesai"
          className={`mt-0.5 w-5 h-5 sm:w-6 sm:h-6 rounded-lg border flex items-center justify-center shrink-0 transition-all ${
            quest.completed ? "bg-emerald-500 border-emerald-400 text-slate-950 shadow-[0_0_12px_rgba(16,185,129,0.45)]" : "bg-slate-950/80 border-slate-700 hover:border-cyan-400 text-transparent"
          }`}
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </button>

        {/* Konten Tengah */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1">
            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">{quest.id}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${rankBadge}`}>RANK {quest.rank}</span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/25">{quest.skill}</span>
            {quest.type === "Boss Quest" && <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30">BOSS</span>}
          </div>

          <h3 className={`text-xs sm:text-sm font-semibold leading-snug break-words ${quest.completed ? "line-through text-slate-500" : "text-slate-100"}`}>{quest.title}</h3>

          {/* Baris Tanggal, Jam Dibuat, Jam Selesai & Reward */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[11px] text-slate-400">
            {quest.date && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-500" />
                {quest.date}
              </span>
            )}

            {quest.createdTime && (
              <span className="inline-flex items-center gap-1 text-slate-400">
                <Clock className="w-3 h-3 text-cyan-400/80" />
                Dibuat {quest.createdTime} WIB
              </span>
            )}

            {quest.completed && quest.completedTime && (
              <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                <Clock className="w-3 h-3 text-emerald-400" />
                Selesai {quest.completedTime} WIB
              </span>
            )}

            <span className="inline-flex items-center gap-1 text-cyan-300 font-medium">
              <Sparkles className="w-3 h-3" />+{reward.xp} XP
            </span>
            <span className="inline-flex items-center gap-1 text-amber-400 font-medium">
              <Coins className="w-3 h-3" />+{reward.gold} G
            </span>
          </div>
        </div>

        {/* Tombol Hapus */}
        <button type="button" onClick={() => onDelete(quest.id)} aria-label="Hapus quest" className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0" title="Hapus Quest">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}
