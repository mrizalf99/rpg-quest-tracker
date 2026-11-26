import { Award, CheckCircle2, Flame, ShieldAlert, TrendingUp, Zap } from "lucide-react";
import { useMemo } from "react";
import { getLocalTodayStr } from "../hooks/useRpgEngine";

const RANK_XP = {
  E: 25,
  D: 50,
  C: 150,
  B: 300,
  A: 600,
  S: 1200,
};

const SKILL_COLORS = {
  INT: "bg-cyan-500",
  CHESS: "bg-amber-500",
  JPN: "bg-rose-500",
  ENG: "bg-indigo-500",
  STR: "bg-emerald-500",
  CHA: "bg-purple-500",
  WIS: "bg-teal-500",
  LIT: "bg-orange-500",
};

export default function Analytics({ quests = [], debuffs = [], stats = {} }) {
  // 1. Grafik Daily XP 7 Hari Terakhir berdasarkan completedDate
  const dailyXpSeries = useMemo(() => {
    const days = [];
    for (let offset = -6; offset <= 0; offset++) {
      const dateStr = getLocalTodayStr(offset);
      const dateObj = new Date(dateStr + "T12:00:00");
      const shortLabel = dateObj.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
      });

      let xpSum = 0;
      let countSum = 0;

      quests.forEach((q) => {
        if (!q.completed) return;
        const doneDate = q.completedDate || q.date;
        if (doneDate === dateStr) {
          xpSum += RANK_XP[q.rank] || 50;
          countSum += 1;
        }
      });

      days.push({
        dateStr,
        label: offset === 0 ? "Hari Ini" : shortLabel,
        xp: xpSum,
        count: countSum,
        isToday: offset === 0,
      });
    }
    return days;
  }, [quests]);

  const maxDailyXp = useMemo(() => {
    const peak = Math.max(...dailyXpSeries.map((d) => d.xp), 300);
    return peak;
  }, [dailyXpSeries]);

  // 2. Distribusi XP per Cabang Skill (dari quest selesai)
  const skillBreakdown = useMemo(() => {
    const map = {};
    let total = 0;

    quests.forEach((q) => {
      if (!q.completed) return;
      const code = q.skill || "INT";
      const xp = RANK_XP[q.rank] || 50;
      map[code] = (map[code] || 0) + xp;
      total += xp;
    });

    return Object.entries(map)
      .map(([code, xp]) => ({
        code,
        xp,
        pct: total > 0 ? Math.round((xp / total) * 100) : 0,
      }))
      .sort((a, b) => b.xp - a.xp);
  }, [quests]);

  // 3. Daftar quest yang dituntaskan hari ini (termasuk backlog kemarin yang selesai hari ini)
  const completedTodayList = useMemo(() => {
    const todayStr = getLocalTodayStr(0);
    return quests.filter((q) => q.completed && (q.completedDate || q.date) === todayStr);
  }, [quests]);

  const completedCount = stats.completedTodayCount ?? completedTodayList.length;
  const dailyTarget = stats.dailyTarget || 3;
  const clearProgressPct = Math.min(100, Math.round((completedCount / dailyTarget) * 100));
  const activeDebuffs = debuffs.filter((d) => d.active);

  return (
    <div className="space-y-5 text-slate-100">
      {/* BARIS ATAS: DAILY CLEAR 3/3 & KPI RINGKAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Kartu Daily Clear 3/3 */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Daily Clear Target
            </span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${completedCount >= dailyTarget ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-amber-500/20 text-amber-300 border border-amber-500/40"}`}>
              {completedCount >= dailyTarget ? "DAILY CLEAR!" : "IN PROGRESS"}
            </span>
          </div>

          <div className="flex items-baseline gap-2 my-1">
            <span className="text-3xl font-extrabold text-white">
              {completedCount}/{dailyTarget}
            </span>
            <span className="text-xs text-slate-400">quest selesai hari ini</span>
          </div>

          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden mt-3">
            <div className={`h-full transition-all duration-500 rounded-full ${completedCount >= dailyTarget ? "bg-emerald-500" : "bg-cyan-500"}`} style={{ width: `${clearProgressPct}%` }} />
          </div>
        </div>

        {/* Kartu XP Hari Ini */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cyan-400" />
              XP Diperoleh Hari Ini
            </span>
          </div>
          <div className="text-3xl font-extrabold text-cyan-400 my-1">
            +{stats.xpToday || 0} <span className="text-sm font-semibold text-slate-400">XP</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Termasuk quest kemarin yang diselesaikan hari ini</p>
        </div>

        {/* Kartu Streak & Debuff */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-400" />
              Active Streak
            </span>
            {activeDebuffs.length > 0 && (
              <span className="text-xs text-rose-400 flex items-center gap-1 font-medium">
                <ShieldAlert className="w-3.5 h-3.5" /> -{stats.activeDebuffPenalty} XP
              </span>
            )}
          </div>
          <div className="text-3xl font-extrabold text-orange-400 my-1">
            {stats.streak || 0} <span className="text-sm font-semibold text-slate-400">Hari</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Total {stats.totalCompletedQuests || 0} quest tuntas sepanjang waktu</p>
        </div>
      </div>

      {/* BARIS TENGAH: GRAFIK DAILY XP (7 HARI TERAKHIR) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Grafik Daily XP (Berdasarkan Tanggal Selesai)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Perolehan XP aktual 7 hari terakhir dari kolom Tanggal Selesai</p>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 pt-6 px-1">
          {dailyXpSeries.map((day) => {
            const heightPct = day.xp > 0 ? Math.max(10, Math.round((day.xp / maxDailyXp) * 100)) : 4;
            return (
              <div key={day.dateStr} className="flex flex-col items-center h-full justify-end group">
                <span className="text-[11px] font-semibold text-slate-300 mb-1.5 opacity-90">{day.xp > 0 ? `${day.xp}` : "0"}</span>

                <div className="w-full max-w-[44px] flex-1 flex items-end justify-center bg-slate-800/40 rounded-t-lg overflow-hidden">
                  <div
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      day.isToday ? "bg-gradient-to-t from-cyan-600 to-emerald-400 shadow-[0_0_15px_rgba(34,211,238,0.35)]" : day.xp > 0 ? "bg-cyan-600/80 group-hover:bg-cyan-500" : "bg-slate-700/40"
                    }`}
                    style={{ height: `${heightPct}%` }}
                    title={`${day.label}: ${day.xp} XP (${day.count} quest)`}
                  />
                </div>

                <span className={`text-[11px] mt-2 font-medium ${day.isToday ? "text-emerald-400 font-bold" : "text-slate-400"}`}>{day.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* BARIS BAWAH: DISTRIBUSI SKILL & LOG SELESAI HARI INI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Distribusi XP Skill */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
            <Award className="w-4 h-4 text-amber-400" />
            Distribusi XP per Cabang Skill
          </h3>
          {skillBreakdown.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">Belum ada XP quest yang tercatat.</p>
          ) : (
            <div className="space-y-3">
              {skillBreakdown.map((item) => (
                <div key={item.code}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold text-slate-200">{item.code}</span>
                    <span className="text-slate-400">
                      {item.xp} XP ({item.pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${SKILL_COLORS[item.code] || "bg-cyan-500"}`} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Log Quest yang Tuntas Hari Ini */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg">
          <h3 className="text-sm font-bold text-white mb-3">Log Quest Tuntas Hari Ini ({completedTodayList.length})</h3>
          {completedTodayList.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">Belum ada quest yang dicentang selesai hari ini.</p>
          ) : (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {completedTodayList.map((q) => (
                <div key={q.id} className="flex items-center justify-between bg-slate-800/60 border border-slate-700/60 rounded-lg px-3 py-2 text-xs">
                  <div className="min-w-0 pr-2">
                    <p className="font-medium text-slate-100 truncate">{q.title}</p>
                    <p className="text-[11px] text-slate-400">
                      {q.skill} • Rank {q.rank}
                      {q.date && q.date !== q.completedDate && <span className="ml-1.5 text-amber-400">(Jadwal: {q.date})</span>}
                    </p>
                  </div>
                  <span className="font-bold text-emerald-400 shrink-0">+{RANK_XP[q.rank] || 50} XP</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
