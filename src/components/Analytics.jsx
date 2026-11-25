import { motion } from "framer-motion";
import { AlertTriangle, Award, BarChart3, CheckCircle2, Coins, Flame, ShieldAlert, Sparkles, Target, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import { normalizeToISO } from "../utils/dateUtils";

export default function Analytics({ quests = [], debuffs = [], stats = {} }) {
  const analyticsData = useMemo(() => {
    const totalQuests = quests.length;
    const completedQuests = quests.filter((q) => Boolean(q.completed));
    const pendingQuests = quests.filter((q) => !q.completed);
    const completionRate = totalQuests > 0 ? Math.round((completedQuests.length / totalQuests) * 100) : 0;

    // Total XP & Gold dari quest selesai
    const totalEarnedXp = completedQuests.reduce((sum, q) => sum + Number(q.earnedXp ?? q.xp ?? q.baseXp ?? 0), 0);
    const totalEarnedGold = completedQuests.reduce((sum, q) => sum + Number(q.earnedGold ?? q.gold ?? Math.round((q.baseXp ?? 0) / 2)), 0);

    // Hitung penalti Debuff aktif
    const activeDebuffs = debuffs.filter((d) => Boolean(d.active));
    const calculatedPenalty = activeDebuffs.reduce((sum, d) => sum + Number(d.appliedPenalty ?? d.penalty ?? d.weight ?? 0), 0);
    const totalPenalty = Number(stats?.totalPenalty ?? calculatedPenalty);

    // Kelompokkan performa per tanggal (7 hari terakhir yang memiliki aktivitas)
    const dailyMap = {};
    quests.forEach((q) => {
      const iso = normalizeToISO(q.date);
      if (!iso) return;
      if (!dailyMap[iso]) {
        dailyMap[iso] = { date: iso, xp: 0, gold: 0, completed: 0, total: 0 };
      }
      dailyMap[iso].total += 1;
      if (q.completed) {
        dailyMap[iso].completed += 1;
        dailyMap[iso].xp += Number(q.earnedXp ?? q.xp ?? q.baseXp ?? 0);
        dailyMap[iso].gold += Number(q.earnedGold ?? q.gold ?? 0);
      }
    });

    const dailyTimeline = Object.values(dailyMap)
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7);

    const maxDailyXp = Math.max(...dailyTimeline.map((d) => d.xp), 100);
    const dailyClearDays = Object.values(dailyMap).filter((d) => d.completed >= 3).length;

    // Distribusi Skill (ambil dari stats.skills jika tersedia, atau agregasi dari quests)
    const skillList =
      Array.isArray(stats?.skills) && stats.skills.length > 0
        ? stats.skills.map((s) => ({
            code: s.code || s.id || "GEN",
            name: s.name || s.code || "Skill",
            level: Number(s.level ?? 1),
            xp: Number(s.xp ?? s.totalXp ?? 0),
          }))
        : Object.values(
            completedQuests.reduce((acc, q) => {
              const code = q.skill || q.skillCode || "GEN";
              if (!acc[code]) {
                acc[code] = {
                  code,
                  name: q.skillName || code,
                  level: 1,
                  xp: 0,
                };
              }
              acc[code].xp += Number(q.earnedXp ?? q.xp ?? q.baseXp ?? 0);
              acc[code].level = Math.floor(acc[code].xp / 500) + 1;
              return acc;
            }, {}),
          );

    const sortedSkills = [...skillList].sort((a, b) => b.xp - a.xp);
    const maxSkillXp = Math.max(...sortedSkills.map((s) => s.xp), 500);
    const strongestSkill = sortedSkills[0] || null;
    const weakestSkill = sortedSkills[sortedSkills.length - 1] || null;

    // Breakdown berdasarkan Rank (S, A, B, C, D, E)
    const ranks = ["S", "A", "B", "C", "D", "E"];
    const rankStats = ranks
      .map((r) => {
        const items = quests.filter((q) => (q.rank || "D").toUpperCase() === r);
        const done = items.filter((q) => q.completed).length;
        return {
          rank: r,
          total: items.length,
          done,
          pct: items.length > 0 ? Math.round((done / items.length) * 100) : 0,
        };
      })
      .filter((r) => r.total > 0);

    // Deteksi anomali/duplikat quest pada tanggal & nama yang sama
    const seenKeys = new Set();
    const duplicateQuests = [];
    quests.forEach((q) => {
      const key = `${normalizeToISO(q.date)}|${(q.title || q.name || "").trim().toLowerCase()}`;
      if (seenKeys.has(key)) {
        duplicateQuests.push(q);
      } else {
        seenKeys.add(key);
      }
    });

    return {
      totalQuests,
      completedCount: completedQuests.length,
      pendingCount: pendingQuests.length,
      completionRate,
      totalEarnedXp,
      totalEarnedGold,
      activeDebuffs,
      totalPenalty,
      dailyTimeline,
      maxDailyXp,
      dailyClearDays,
      sortedSkills,
      maxSkillXp,
      strongestSkill,
      weakestSkill,
      rankStats,
      duplicateQuests,
    };
  }, [quests, debuffs, stats]);

  const formatShortDate = (iso) => {
    if (!iso) return "-";
    const parts = iso.split("-");
    if (parts.length !== 3) return iso;
    return `${parts[2]}/${parts[1]}`;
  };

  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      {/* Header Panel */}
      <div className="rpg-panel rounded-2xl p-4 sm:p-6 border border-slate-800/90">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-800/80">
          <div>
            <h2 className="font-display text-xs sm:text-sm font-bold tracking-[0.18em] text-white uppercase flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" /> Guild Telemetry &amp; Quest Analytics
            </h2>
            <p className="text-xs text-slate-400 mt-1">Analisis realtime progres XP, distribusi cabang skill, dan rasio penyelesaian quest.</p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-cyan-500/30 text-xs text-cyan-300 font-semibold self-start sm:self-auto">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>{analyticsData.dailyClearDays} Hari Daily Clear (&ge;3 Quest)</span>
          </div>
        </div>

        {/* 4 Kartu KPI Utama */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3.5 sm:p-4">
            <div className="flex items-center justify-between text-slate-400 text-[11px] uppercase tracking-wider">
              <span>Completion Rate</span>
              <Target className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="font-display text-xl sm:text-2xl font-bold text-white mt-1.5">{analyticsData.completionRate}%</div>
            <div className="text-[11px] text-slate-400 mt-1">
              {analyticsData.completedCount} selesai dari {analyticsData.totalQuests} quest
            </div>
          </div>

          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3.5 sm:p-4">
            <div className="flex items-center justify-between text-slate-400 text-[11px] uppercase tracking-wider">
              <span>Total XP Terkumpul</span>
              <Sparkles className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="font-display text-xl sm:text-2xl font-bold text-cyan-300 mt-1.5">{Number(stats?.netXp ?? analyticsData.totalEarnedXp).toLocaleString("id-ID")} XP</div>
            <div className="text-[11px] text-emerald-400 mt-1">
              Level {stats?.level ?? 1} &bull; {stats?.rankTitle || "Vanguard"}
            </div>
          </div>

          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3.5 sm:p-4">
            <div className="flex items-center justify-between text-slate-400 text-[11px] uppercase tracking-wider">
              <span>Gold &amp; Saldo</span>
              <Coins className="w-4 h-4 text-amber-400" />
            </div>
            <div className="font-display text-xl sm:text-2xl font-bold text-amber-300 mt-1.5">{Number(stats?.availableGold ?? analyticsData.totalEarnedGold).toLocaleString("id-ID")} G</div>
            <div className="text-[11px] text-slate-400 mt-1">Total didapat: {analyticsData.totalEarnedGold.toLocaleString("id-ID")} G</div>
          </div>

          <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-3.5 sm:p-4">
            <div className="flex items-center justify-between text-slate-400 text-[11px] uppercase tracking-wider">
              <span>Penalti Debuff</span>
              <ShieldAlert className="w-4 h-4 text-rose-400" />
            </div>
            <div className="font-display text-xl sm:text-2xl font-bold text-rose-400 mt-1.5">-{analyticsData.totalPenalty} XP</div>
            <div className="text-[11px] text-slate-400 mt-1">{analyticsData.activeDebuffs.length} debuff aktif tercatat</div>
          </div>
        </div>
      </div>

      {/* Baris Tengah: Grafik Tren XP Harian & Distribusi Skill */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Grafik Batang Tren XP Harian */}
        <div className="lg:col-span-7 rpg-panel rounded-2xl p-4 sm:p-6 border border-slate-800/90 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-xs font-bold tracking-[0.15em] text-white uppercase flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> Perolehan XP Harian (7 Hari Aktif)
              </h3>
              <span className="text-[11px] text-slate-400">Hijau = Daily Clear (&ge;3)</span>
            </div>

            {analyticsData.dailyTimeline.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 border border-dashed border-slate-800 rounded-xl">Belum ada data tanggal quest untuk ditampilkan.</div>
            ) : (
              <div className="grid grid-cols-7 gap-2 sm:gap-3 items-end h-52 pt-6 pb-2 px-1 border-b border-slate-800/80">
                {analyticsData.dailyTimeline.map((day) => {
                  const heightPct = Math.max(Math.round((day.xp / analyticsData.maxDailyXp) * 100), day.xp > 0 ? 12 : 4);
                  const isClear = day.completed >= 3;

                  return (
                    <div key={day.date} className="flex flex-col items-center h-full justify-end group">
                      <span className="text-[10px] font-bold text-slate-300 mb-1.5 opacity-90 group-hover:text-cyan-300 transition-colors">{day.xp > 0 ? `+${day.xp}` : "0"}</span>

                      <div className="w-full max-w-[38px] h-32 bg-slate-900/90 rounded-lg p-1 flex items-end border border-slate-800/80">
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${heightPct}%` }}
                          transition={{ duration: 0.45 }}
                          className={`w-full rounded-md ${isClear ? "bg-gradient-to-t from-emerald-500 to-cyan-400" : day.xp > 0 ? "bg-gradient-to-t from-indigo-600 to-cyan-500" : "bg-slate-800"}`}
                          title={`${day.date}: ${day.xp} XP (${day.completed}/${day.total} quest selesai)`}
                        />
                      </div>

                      <span className="text-[10px] font-semibold text-slate-400 mt-2">{formatShortDate(day.date)}</span>
                      <span className="text-[9px] text-slate-500">
                        {day.completed}/{day.total} Q
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Insight Rekomendasi Otomatis */}
          <div className="mt-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-cyan-400 font-bold">Skill Dominan: </span>
              {analyticsData.strongestSkill ? `${analyticsData.strongestSkill.code} (${analyticsData.strongestSkill.xp.toLocaleString("id-ID")} XP)` : "-"}
            </div>
            <div>
              <span className="text-amber-400 font-bold">Perlu Fokus: </span>
              {analyticsData.weakestSkill ? `${analyticsData.weakestSkill.code} (${analyticsData.weakestSkill.xp.toLocaleString("id-ID")} XP)` : "-"}
            </div>
          </div>
        </div>

        {/* Distribusi XP per Cabang Skill */}
        <div className="lg:col-span-5 rpg-panel rounded-2xl p-4 sm:p-6 border border-slate-800/90">
          <h3 className="font-display text-xs font-bold tracking-[0.15em] text-white uppercase flex items-center gap-2 mb-4">
            <Award className="w-4 h-4 text-cyan-400" /> Distribusi Cabang Skill
          </h3>

          <div className="space-y-3.5">
            {analyticsData.sortedSkills.map((skill) => {
              const barPct = Math.min(Math.round((skill.xp / analyticsData.maxSkillXp) * 100), 100);

              return (
                <div key={skill.code}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="px-1.5 py-0.5 rounded bg-cyan-500/15 border border-cyan-500/30 font-display text-[10px] font-bold text-cyan-300 shrink-0">{skill.code}</span>
                      <span className="text-slate-300 truncate">{skill.name}</span>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <span className="font-bold text-white">Lv.{skill.level}</span>
                      <span className="text-slate-400 text-[11px] ml-1.5">({skill.xp.toLocaleString("id-ID")} XP)</span>
                    </div>
                  </div>

                  <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${barPct}%` }}
                      transition={{ duration: 0.45 }}
                      className={`h-full rounded-full ${skill.xp === 0 ? "bg-slate-700" : "bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400"}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Baris Bawah: Rasio Rank Quest & Audit Kesehatan Data */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 rpg-panel rounded-2xl p-4 sm:p-6 border border-slate-800/90">
          <h3 className="font-display text-xs font-bold tracking-[0.15em] text-white uppercase flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Rasio Penyelesaian per Rank
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {analyticsData.rankStats.map((item) => (
              <div key={item.rank} className="rounded-xl bg-slate-900/80 border border-slate-800 p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="font-display text-xs font-bold text-amber-300">RANK {item.rank}</span>
                  <span className="text-xs font-bold text-white">{item.pct}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 my-2 overflow-hidden">
                  <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${item.pct}%` }} />
                </div>
                <div className="text-[11px] text-slate-400">
                  {item.done} / {item.total} quest selesai
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Data Google Sheet */}
        <div className="lg:col-span-6 rpg-panel rounded-2xl p-4 sm:p-6 border border-slate-800/90">
          <h3 className="font-display text-xs font-bold tracking-[0.15em] text-white uppercase flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> Audit Data &amp; Backlog Quest
          </h3>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
              <span className="text-slate-300">Quest Aktif Belum Selesai (Backlog)</span>
              <span className="font-bold text-amber-300">{analyticsData.pendingCount} Quest</span>
            </div>

            {analyticsData.duplicateQuests.length > 0 ? (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200">
                <div className="font-bold mb-1">Terdeteksi {analyticsData.duplicateQuests.length} entri quest ganda:</div>
                <ul className="list-disc list-inside text-[11px] text-amber-300/90 space-y-0.5">
                  {analyticsData.duplicateQuests.map((dq, idx) => (
                    <li key={dq.id || idx}>
                      {dq.id ? `[${dq.id}] ` : ""}
                      {dq.title || dq.name} ({normalizeToISO(dq.date)})
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300">Tidak ada entri quest duplikat yang terdeteksi di Quest Log.</div>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  );
}
