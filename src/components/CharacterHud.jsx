import { motion } from "framer-motion";
import { Coins, Flame, Shield, Sparkles, Trophy } from "lucide-react";

export default function CharacterHud({ stats }) {
  const expPct = Math.min(100, Math.round((stats.currentLevelXP / 500) * 100));

  return (
    <motion.header initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }} className="hud-card rounded-2xl p-5 md:p-6 mb-6 relative overflow-hidden">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        {/* Identitas Karakter */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-indigo-600 p-[2px] shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full rounded-2xl bg-slate-950 flex flex-col items-center justify-center">
                <span className="text-[10px] uppercase tracking-widest text-cyan-400">LVL</span>
                <span className="font-display text-2xl font-extrabold text-white">{stats.level}</span>
              </div>
            </div>
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-slate-950"></span>
            </span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-lg md:text-xl font-bold tracking-wide text-white">MUHAMAD RIZAL FAHLEFI</h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> {stats.rankTitle}
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-400 mt-1">Class: Fullstack Developer &amp; Global Tech Specialist • Base: Magelang</p>
          </div>
        </div>

        {/* Stat Badges */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-slate-900/90 border border-amber-500/30 px-3.5 py-2.5">
            <div className="flex items-center gap-1.5 text-xs text-amber-300/80">
              <Coins className="w-3.5 h-3.5 text-amber-400" /> Gold
            </div>
            <div className="font-display text-base md:text-lg font-bold text-amber-400 mt-0.5">{stats.availableGold.toLocaleString("id-ID")}</div>
          </div>

          <div className="rounded-xl bg-slate-900/90 border border-cyan-500/30 px-3.5 py-2.5">
            <div className="flex items-center gap-1.5 text-xs text-cyan-300/80">
              <Trophy className="w-3.5 h-3.5 text-cyan-400" /> Selesai
            </div>
            <div className="font-display text-base md:text-lg font-bold text-white mt-0.5">{stats.completedCount} Quest</div>
          </div>

          <div className={`rounded-xl border px-3.5 py-2.5 transition-colors ${stats.isDailyClear ? "bg-emerald-950/50 border-emerald-500/40" : "bg-slate-900/90 border-slate-700/60"}`}>
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <Flame className={`w-3.5 h-3.5 ${stats.isDailyClear ? "text-emerald-400" : "text-slate-400"}`} />
              Harian ({stats.completedToday}/3)
            </div>
            <div className={`font-display text-xs md:text-sm font-bold mt-1 ${stats.isDailyClear ? "text-emerald-400" : "text-slate-400"}`}>{stats.isDailyClear ? "DAILY CLEAR!" : "IN PROGRESS"}</div>
          </div>
        </div>
      </div>

      {/* EXP Progress Bar */}
      <div className="mt-5">
        <div className="flex justify-between items-center text-xs mb-1.5">
          <span className="text-cyan-300 font-medium flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Total XP Bersih: {stats.netXP.toLocaleString("id-ID")} XP
            {stats.totalPenalty > 0 && <span className="text-rose-400">(-{stats.totalPenalty} Debuff)</span>}
          </span>
          <span className="font-display text-slate-300">
            {stats.currentLevelXP} / 500 XP ke Lv.{stats.level + 1}
          </span>
        </div>
        <div className="h-3 w-full rounded-full bg-slate-900 border border-slate-800 overflow-hidden p-[2px]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500 shadow-[0_0_12px_rgba(56,189,248,0.6)]"
            initial={{ width: 0 }}
            animate={{ width: `${expPct}%` }}
            transition={{ type: "spring", stiffness: 90, damping: 18 }}
          />
        </div>
      </div>
    </motion.header>
  );
}
