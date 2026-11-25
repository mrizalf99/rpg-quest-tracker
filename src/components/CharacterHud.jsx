import { motion } from "framer-motion";
import { CheckCircle, Coins, Flame, Shield, Sparkles } from "lucide-react";

export default function CharacterHud({ stats }) {
  const expPct = Math.min(100, Math.round((stats.currentLevelXP / 500) * 100));

  return (
    <motion.header initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="rpg-panel rounded-2xl p-6 md:p-7 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Kiri: Avatar Level & Identitas */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-cyan-400/25 to-slate-900 border border-cyan-400/40 flex flex-col items-center justify-center shrink-0 shadow-[0_0_25px_rgba(56,189,248,0.15)]">
            <span className="text-[10px] font-semibold tracking-[0.2em] text-cyan-300">LVL</span>
            <span className="font-display text-2xl font-extrabold text-white leading-none mt-0.5">{stats.level}</span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="font-display text-lg md:text-xl font-bold tracking-wider text-white">MUHAMAD RIZAL FAHLEFI</h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-400/25">
                <Shield className="w-3.5 h-3.5" />
                {stats.rankTitle}
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-400 mt-1">Fullstack Developer &amp; Global Tech Specialist &bull; Base: Magelang</p>
          </div>
        </div>

        {/* Kanan: 3 Kartu Statistik Minimalis */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="rpg-subcard rounded-xl px-4 py-3 min-w-[105px]">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
              <Coins className="w-3.5 h-3.5 text-amber-400" />
              <span>Gold</span>
            </div>
            <div className="font-display text-base md:text-lg font-bold text-amber-400 mt-1">{stats.availableGold.toLocaleString("id-ID")}</div>
          </div>

          <div className="rpg-subcard rounded-xl px-4 py-3 min-w-[105px]">
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
              <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
              <span>Selesai</span>
            </div>
            <div className="font-display text-base md:text-lg font-bold text-slate-100 mt-1">
              {stats.completedCount} <span className="text-xs font-sans font-normal text-slate-400">Misi</span>
            </div>
          </div>

          <div className={`rounded-xl px-4 py-3 min-w-[115px] border transition-colors ${stats.isDailyClear ? "bg-emerald-500/10 border-emerald-400/30" : "rpg-subcard"}`}>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
              <Flame className={`w-3.5 h-3.5 ${stats.isDailyClear ? "text-emerald-400" : "text-slate-500"}`} />
              <span>Harian ({stats.completedToday}/3)</span>
            </div>
            <div className={`font-display text-xs md:text-sm font-bold mt-1.5 tracking-wide ${stats.isDailyClear ? "text-emerald-400" : "text-slate-300"}`}>{stats.isDailyClear ? "DAILY CLEAR" : "ACTIVE"}</div>
          </div>
        </div>
      </div>

      {/* EXP Bar */}
      <div className="mt-6 pt-5 border-t border-slate-800/80">
        <div className="flex flex-wrap justify-between items-center gap-2 text-xs mb-2">
          <div className="flex items-center gap-2 text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>
              Total XP Bersih: <strong className="text-white font-semibold">{stats.netXP.toLocaleString("id-ID")} XP</strong>
            </span>
            {stats.totalPenalty > 0 && <span className="px-2 py-0.5 rounded bg-rose-500/15 text-rose-300 text-[11px] border border-rose-500/20">-{stats.totalPenalty} Debuff</span>}
          </div>
          <span className="font-display text-xs text-cyan-300">
            {stats.currentLevelXP} / 500 XP &rarr; Lv.{stats.level + 1}
          </span>
        </div>

        <div className="h-2.5 w-full rounded-full bg-slate-950/90 border border-slate-800 overflow-hidden">
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
