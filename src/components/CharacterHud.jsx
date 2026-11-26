import { motion } from "framer-motion";
import { CheckCircle, Coins, Flame, Shield, Sparkles } from "lucide-react";

export default function CharacterHud({ stats = {} }) {
  const level = Number(stats.level) || 1;
  const currentLevelXP = Number(stats.currentLevelXP ?? stats.xpInCurrentLevel) || 0;
  const netXP = Number(stats.netXP ?? stats.netXp ?? stats.totalXp) || 0;
  const totalPenalty = Number(stats.totalPenalty ?? stats.activeDebuffPenalty) || 0;
  const availableGold = Number(stats.availableGold ?? stats.gold) || 0;
  const completedCount = Number(stats.completedCount ?? stats.totalCompletedQuests) || 0;
  const completedToday = Number(stats.completedToday ?? stats.completedTodayCount) || 0;
  const streakDays = Number(stats.streakDays ?? stats.streak) || 0;
  const isDailyClear = Boolean(stats.isDailyClear ?? completedToday >= 3);
  const rankTitle = stats.rankTitle || (level >= 20 ? "S-Rank Shadow Monarch" : level >= 15 ? "A-Rank Architect" : level >= 10 ? "B-Rank Builder" : level >= 5 ? "C-Rank Adventurer" : "E-Rank Novice");

  const expPct = Math.min(100, Math.round((currentLevelXP / 500) * 100));

  return (
    <motion.header initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="rpg-panel rounded-2xl p-4 sm:p-6 md:p-7 mb-4 sm:mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 sm:gap-6">
        {/* Kiri: Avatar Level, Identitas & Api Streak */}
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-b from-cyan-400/25 to-slate-900 border border-cyan-400/40 flex flex-col items-center justify-center shrink-0 shadow-[0_0_25px_rgba(56,189,248,0.15)]">
            <span className="text-[9px] sm:text-[10px] font-semibold tracking-[0.2em] text-cyan-300">LVL</span>
            <span className="font-display text-xl sm:text-2xl font-extrabold text-white leading-none mt-0.5">{level}</span>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-sm sm:text-lg md:text-xl font-bold tracking-wider text-white truncate">MUHAMAD RIZAL FAHLEFI</h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-400/25">
                <Shield className="w-3 h-3" />
                {rankTitle}
              </span>

              {/* Lencana Api Streak Ringan (GPU-Composited) */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-orange-500/20 via-amber-500/15 to-rose-500/20 border border-orange-400/45 shadow-[0_0_12px_rgba(249,115,22,0.25)]">
                <Flame className="w-3.5 h-3.5 text-orange-400 fill-amber-400 animate-pulse" />
                <span className="font-display text-[11px] font-bold tracking-wide text-amber-300">{streakDays} DAY STREAK</span>
              </div>
            </div>

            <p className="text-[11px] sm:text-sm text-slate-400 mt-1 truncate">Fullstack Developer &bull; Base: Magelang</p>
          </div>
        </div>

        {/* Kanan: 3 Kartu Statistik */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          <div className="rpg-subcard rounded-xl px-3 py-2.5 sm:px-4 sm:py-3">
            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-slate-400">
              <Coins className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
              <span>Gold</span>
            </div>
            <div className="font-display text-sm sm:text-lg font-bold text-amber-400 mt-0.5 sm:mt-1">{availableGold.toLocaleString("id-ID")}</div>
          </div>

          <div className="rpg-subcard rounded-xl px-3 py-2.5 sm:px-4 sm:py-3">
            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-slate-400">
              <CheckCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-cyan-400" />
              <span>Selesai</span>
            </div>
            <div className="font-display text-sm sm:text-lg font-bold text-slate-100 mt-0.5 sm:mt-1">
              {completedCount} <span className="text-[10px] sm:text-xs font-sans font-normal text-slate-400">Misi</span>
            </div>
          </div>

          <div className={`rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 border transition-colors ${isDailyClear ? "bg-emerald-500/10 border-emerald-400/30" : "rpg-subcard"}`}>
            <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-slate-400">
              <Flame className={`w-3 h-3 sm:w-3.5 sm:h-3.5 ${isDailyClear ? "text-emerald-400" : "text-slate-500"}`} />
              <span>Harian ({completedToday}/3)</span>
            </div>
            <div className={`font-display text-[11px] sm:text-sm font-bold mt-1 tracking-wide ${isDailyClear ? "text-emerald-400" : "text-slate-300"}`}>{isDailyClear ? "CLEAR" : "ACTIVE"}</div>
          </div>
        </div>
      </div>

      {/* EXP Bar */}
      <div className="mt-4 sm:mt-6 pt-3.5 sm:pt-5 border-t border-slate-800/80">
        <div className="flex flex-wrap justify-between items-center gap-1.5 text-[11px] sm:text-xs mb-1.5">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              XP Bersih: <strong className="text-white font-semibold">{netXP.toLocaleString("id-ID")}</strong>
            </span>
            {totalPenalty > 0 && <span className="px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 text-[10px] border border-rose-500/20">-{totalPenalty}</span>}
          </div>
          <span className="font-display text-[11px] sm:text-xs text-cyan-300">
            {currentLevelXP}/500 &rarr; Lv.{level + 1}
          </span>
        </div>

        <div className="h-2 sm:h-2.5 w-full rounded-full bg-slate-950/90 border border-slate-800 overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-400 shadow-[0_0_14px_rgba(56,189,248,0.5)]"
            initial={{ width: 0 }}
            animate={{ width: `${expPct}%` }}
            transition={{ type: "spring", stiffness: 90, damping: 18 }}
          />
        </div>
      </div>
    </motion.header>
  );
}
