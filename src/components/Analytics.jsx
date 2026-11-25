import { useEffect, useMemo, useState } from "react";

const SKILL_COLORS = {
  INT: "#38bdf8", // Sky
  ENG: "#a78bfa", // Violet
  STR: "#f87171", // Red
  CHA: "#fbbf24", // Amber
  JPN: "#f472b6", // Pink
  CHESS: "#34d399", // Emerald
  WIS: "#2dd4bf", // Teal
  LIT: "#94a3b8", // Slate
};

// Helper normalisasi angka dari string seperti "3,900 XP" atau "300"
const parseNumber = (val) => {
  if (typeof val === "number") return val;
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.-]/g, "");
  return Number(cleaned) || 0;
};

// Helper normalisasi tanggal MM/DD/YYYY atau YYYY-MM-DD menjadi label rapi
const normalizeDateKey = (rawDate) => {
  if (!rawDate) return "Tanpa Tanggal";
  const str = String(rawDate).trim();
  if (str.includes("T")) return str.split("T")[0];
  const slashParts = str.split("/");
  if (slashParts.length === 3) {
    const [m, d, y] = slashParts;
    return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
  }
  return str;
};

export default function Analytics({ data: externalData = null, apiUrl = import.meta.env.VITE_SHEETS_API_URL }) {
  const [rawData, setRawData] = useState(externalData);
  const [loading, setLoading] = useState(!externalData);
  const [error, setError] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("ALL");
  const [hoveredDay, setHoveredDay] = useState(null);

  useEffect(() => {
    if (externalData) {
      setRawData(externalData);
      setLoading(false);
      return;
    }
    if (!apiUrl) {
      setError("VITE_SHEETS_API_URL belum diatur di environment variable.");
      setLoading(false);
      return;
    }

    let isMounted = true;
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        const res = await fetch(apiUrl);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (isMounted) {
          setRawData(json);
          setError("");
        }
      } catch (err) {
        if (isMounted) setError(`Gagal memuat data doGet: ${err.message}`);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchAnalyticsData();
    return () => {
      isMounted = false;
    };
  }, [externalData, apiUrl]);

  // Ekstrak dan hitung metrik dari struktur JSON doGet
  const analytics = useMemo(() => {
    if (!rawData) return null;

    // Mendukung berbagai penamaan key dari Apps Script doGet()
    const rawQuests = rawData.quests || rawData.questLog || rawData.Quest_Log || rawData.data?.quests || [];
    const rawSkills = rawData.skills || rawData.skillTree || rawData.Skill_Tree || rawData.data?.skills || [];
    const hud = rawData.hud || rawData.dashboard || rawData.Dashboard_HUD || rawData.data?.hud || {};

    // 1. Normalisasi Quest_Log
    const quests = rawQuests
      .filter((q) => q["Nama Quest / Tugas"] || q.title || q.name)
      .map((q, idx) => {
        const isDoneRaw = q["Selesai?"] ?? q.completed ?? q.done ?? false;
        const completed = isDoneRaw === true || String(isDoneRaw).toUpperCase() === "TRUE" || parseNumber(q["XP Didapat"] ?? q.xpEarned) > 0;

        const baseXp = parseNumber(q["Base XP"] ?? q.baseXp ?? q.xp);
        const earnedXp = completed ? parseNumber(q["XP Didapat"] ?? q.xpEarned) || baseXp : 0;
        const earnedGold = completed ? parseNumber(q["Gold Didapat"] ?? q.goldEarned) || Math.round(baseXp / 2) : 0;

        return {
          id: q["ID Quest"] || q.id || `Q-${idx + 1}`,
          date: normalizeDateKey(q["Tanggal"] || q.date),
          title: q["Nama Quest / Tugas"] || q.title || q.name,
          type: q["Tipe Quest"] || q.type || "Daily Quest",
          skillCode: (q["Cabang Skill"] || q.skill || "INT").trim().toUpperCase(),
          skillName: q["Nama Cabang Skill"] || q.skillName || "",
          rank: (q["Rank"] || q.rank || "D").trim().toUpperCase(),
          baseXp,
          completed,
          earnedXp,
          earnedGold,
        };
      });

    const filteredQuests = selectedSkill === "ALL" ? quests : quests.filter((q) => q.skillCode === selectedSkill);

    // 2. Normalisasi Skill_Tree (fallback agregasi dari quests jika Skill_Tree kosong)
    let skills = [];
    if (Array.isArray(rawSkills) && rawSkills.length > 0) {
      skills = rawSkills
        .filter((s) => s["Kode"] || s.code)
        .map((s) => {
          const code = (s["Kode"] || s.code).trim().toUpperCase();
          const xp = parseNumber(s["Total XP Skill"] ?? s.totalXp ?? s.xp);
          const level = parseNumber(s["Level Skill"] ?? s.level) || Math.floor(xp / 500) + 1;
          return {
            code,
            name: s["Cabang Keahlian"] || s.name || code,
            level,
            xp,
            perk: s["Status Perk Aktif"] || s.activePerk || "",
          };
        });
    } else {
      const map = {};
      quests.forEach((q) => {
        if (!map[q.skillCode]) {
          map[q.skillCode] = {
            code: q.skillCode,
            name: q.skillName || q.skillCode,
            xp: 0,
          };
        }
        map[q.skillCode].xp += q.earnedXp;
      });
      skills = Object.values(map).map((s) => ({
        ...s,
        level: Math.floor(s.xp / 500) + 1,
        perk: "",
      }));
    }

    skills.sort((a, b) => b.xp - a.xp);
    const totalSkillXp = skills.reduce((acc, s) => acc + s.xp, 0) || 1;

    // 3. Tren XP & Quest Harian
    const dailyMap = {};
    filteredQuests.forEach((q) => {
      if (q.date === "Tanpa Tanggal") return;
      if (!dailyMap[q.date]) {
        dailyMap[q.date] = {
          date: q.date,
          xp: 0,
          gold: 0,
          completedCount: 0,
          totalCount: 0,
        };
      }
      dailyMap[q.date].totalCount += 1;
      if (q.completed) {
        dailyMap[q.date].xp += q.earnedXp;
        dailyMap[q.date].gold += q.earnedGold;
        dailyMap[q.date].completedCount += 1;
      }
    });

    const dailyTrend = Object.values(dailyMap)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((d) => ({
        ...d,
        shortDate: d.date.slice(5), // MM-DD
        isDailyClear: d.completedCount >= 3,
      }));

    // 4. Rasio Penyelesaian Quest (Overall, per Rank, per Tipe)
    const totalQuests = filteredQuests.length;
    const completedQuests = filteredQuests.filter((q) => q.completed).length;
    const pendingQuests = totalQuests - completedQuests;
    const completionRate = totalQuests > 0 ? Math.round((completedQuests / totalQuests) * 100) : 0;

    const ranks = ["S", "A", "B", "C", "D", "E"];
    const byRank = ranks
      .map((rank) => {
        const items = filteredQuests.filter((q) => q.rank === rank);
        const done = items.filter((q) => q.completed).length;
        return {
          rank,
          total: items.length,
          done,
          rate: items.length > 0 ? Math.round((done / items.length) * 100) : 0,
        };
      })
      .filter((r) => r.total > 0);

    const byType = ["Daily Quest", "Weekly Quest", "Boss Quest"].map((type) => {
      const items = filteredQuests.filter((q) => q.type.toLowerCase() === type.toLowerCase());
      const done = items.filter((q) => q.completed).length;
      return {
        type,
        total: items.length,
        done,
        rate: items.length > 0 ? Math.round((done / items.length) * 100) : 0,
      };
    });

    const totalXpEarned = filteredQuests.reduce((acc, q) => acc + q.earnedXp, 0);
    const potentialXpPending = filteredQuests.filter((q) => !q.completed).reduce((acc, q) => acc + q.baseXp, 0);

    return {
      hud,
      skills,
      totalSkillXp,
      dailyTrend,
      totalQuests,
      completedQuests,
      pendingQuests,
      completionRate,
      byRank,
      byType,
      totalXpEarned,
      potentialXpPending,
    };
  }, [rawData, selectedSkill]);

  if (loading) {
    return <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 text-slate-300 animate-pulse">Memuat telemetri RPG dari Google Sheets...</div>;
  }

  if (error || !analytics) {
    return <div className="p-6 rounded-2xl bg-red-950/40 border border-red-800/60 text-red-200 text-sm">{error || "Data tidak tersedia."}</div>;
  }

  const maxDailyXp = Math.max(...analytics.dailyTrend.map((d) => d.xp), 500);
  const donutRadius = 46;
  const donutCircumference = 2 * Math.PI * donutRadius;
  const donutOffset = donutCircumference - (analytics.completionRate / 100) * donutCircumference;

  return (
    <section className="space-y-6 text-slate-100">
      {/* Header & Filter Skill */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
        <div>
          <h2 className="text-lg font-bold tracking-wide text-amber-400">RPG TELEMETRY & ANALYTICS</h2>
          <p className="text-xs text-slate-400">Sinkronisasi langsung dengan Quest_Log & Skill_Tree</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {["ALL", ...analytics.skills.map((s) => s.code)].map((code) => (
            <button
              key={code}
              onClick={() => setSelectedSkill(code)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${selectedSkill === code ? "bg-amber-500 text-slate-950 shadow" : "bg-slate-800 text-slate-300 hover:bg-slate-700"}`}
            >
              {code}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Ringkas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
          <div className="text-xs text-slate-400">XP Terkumpul (Filter)</div>
          <div className="text-2xl font-extrabold text-sky-400 mt-1">{analytics.totalXpEarned.toLocaleString("id-ID")} XP</div>
          <div className="text-[11px] text-slate-500 mt-1">+{analytics.potentialXpPending.toLocaleString("id-ID")} XP di backlog</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
          <div className="text-xs text-slate-400">Rasio Penyelesaian</div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">{analytics.completionRate}%</div>
          <div className="text-[11px] text-slate-500 mt-1">
            {analytics.completedQuests} selesai / {analytics.totalQuests} quest
          </div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
          <div className="text-xs text-slate-400">Hari DAILY CLEAR</div>
          <div className="text-2xl font-extrabold text-amber-400 mt-1">{analytics.dailyTrend.filter((d) => d.isDailyClear).length} Hari</div>
          <div className="text-[11px] text-slate-500 mt-1">Syarat: ≥ 3 quest selesai/hari</div>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl">
          <div className="text-xs text-slate-400">Skill Dominan</div>
          <div className="text-2xl font-extrabold text-violet-400 mt-1">
            {analytics.skills[0]?.code || "-"} (Lv.{analytics.skills[0]?.level || 1})
          </div>
          <div className="text-[11px] text-slate-500 mt-1 truncate">{analytics.skills[0]?.xp.toLocaleString("id-ID") || 0} XP total</div>
        </div>
      </div>

      {/* Grid Grafik Utama */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. Grafik Tren XP Harian (7 kolom) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-100">Tren Perolehan XP Harian</h3>
              <p className="text-xs text-slate-400">Batang emas menandakan status DAILY CLEAR (≥ 3 quest)</p>
            </div>
            {hoveredDay && (
              <div className="text-right bg-slate-800/90 px-3 py-1.5 rounded-lg border border-slate-700">
                <div className="text-xs font-bold text-amber-300">{hoveredDay.date}</div>
                <div className="text-[11px] text-slate-300">
                  {hoveredDay.xp.toLocaleString("id-ID")} XP • {hoveredDay.completedCount}/{hoveredDay.totalCount} Quest
                </div>
              </div>
            )}
          </div>

          {analytics.dailyTrend.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-xs text-slate-500">Belum ada data tanggal untuk filter ini.</div>
          ) : (
            <div className="w-full overflow-x-auto">
              <svg viewBox={`0 0 ${Math.max(analytics.dailyTrend.length * 56, 360)} 210`} className="w-full h-52">
                {/* Garis grid horizontal */}
                {[0, 0.5, 1].map((ratio, idx) => {
                  const y = 165 - ratio * 135;
                  return (
                    <g key={idx}>
                      <line x1="36" y1={y} x2={Math.max(analytics.dailyTrend.length * 56, 360) - 12} y2={y} stroke="#1e293b" strokeDasharray="4 4" />
                      <text x="4" y={y + 4} fill="#64748b" fontSize="10">
                        {Math.round(maxDailyXp * ratio)}
                      </text>
                    </g>
                  );
                })}

                {/* Batang XP per tanggal */}
                {analytics.dailyTrend.map((day, idx) => {
                  const barWidth = 28;
                  const x = 48 + idx * 54;
                  const barHeight = Math.max((day.xp / maxDailyXp) * 135, 4);
                  const y = 165 - barHeight;
                  const fill = day.isDailyClear ? "#f59e0b" : "#38bdf8";

                  return (
                    <g key={day.date} className="cursor-pointer transition-opacity hover:opacity-85" onMouseEnter={() => setHoveredDay(day)} onMouseLeave={() => setHoveredDay(null)}>
                      <rect x={x} y={y} width={barWidth} height={barHeight} rx="6" fill={fill} />
                      <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" fill="#e2e8f0" fontSize="10" fontWeight="bold">
                        {day.xp}
                      </text>
                      <text x={x + barWidth / 2} y="184" textAnchor="middle" fill="#94a3b8" fontSize="10">
                        {day.shortDate}
                      </text>
                      <text x={x + barWidth / 2} y="198" textAnchor="middle" fill={day.isDailyClear ? "#fbbf24" : "#64748b"} fontSize="9">
                        {day.completedCount}Q
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          )}
        </div>

        {/* 2. Rasio Penyelesaian Quest (5 kolom) */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Rasio Penyelesaian Quest</h3>
            <p className="text-xs text-slate-400">Proporsi misi selesai vs tertunda berdasarkan Rank & Tipe</p>
          </div>

          <div className="flex items-center gap-5 my-4">
            {/* Donut SVG */}
            <div className="relative w-28 h-28 shrink-0">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 112 112">
                <circle cx="56" cy="56" r={donutRadius} fill="transparent" stroke="#1e293b" strokeWidth="12" />
                <circle cx="56" cy="56" r={donutRadius} fill="transparent" stroke="#10b981" strokeWidth="12" strokeDasharray={donutCircumference} strokeDashoffset={donutOffset} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-extrabold text-emerald-400">{analytics.completionRate}%</span>
                <span className="text-[10px] text-slate-400">Clear</span>
              </div>
            </div>

            {/* Breakdown Tipe Quest */}
            <div className="flex-1 space-y-2.5">
              {analytics.byType.map((item) => (
                <div key={item.type}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-300">{item.type}</span>
                    <span className="text-slate-400">
                      {item.done}/{item.total} ({item.rate}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${item.rate}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Breakdown per Rank */}
          <div className="grid grid-cols-5 gap-2 pt-3 border-t border-slate-800">
            {analytics.byRank.map((r) => (
              <div key={r.rank} className="bg-slate-800/70 rounded-xl p-2 text-center">
                <div className="text-xs font-bold text-amber-400">Rank {r.rank}</div>
                <div className="text-sm font-extrabold text-slate-100 mt-0.5">
                  {r.done}/{r.total}
                </div>
                <div className="text-[10px] text-slate-400">{r.rate}%</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Grafik Distribusi Cabang Skill */}
      <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100">Distribusi XP & Level per Cabang Skill</h3>
            <p className="text-xs text-slate-400">Identifikasi spesialisasi utama vs cabang skill yang masih tertinggal</p>
          </div>
          <span className="text-xs text-slate-400 mt-1 sm:mt-0">Total XP Semua Cabang: {analytics.totalSkillXp.toLocaleString("id-ID")} XP</span>
        </div>

        <div className="space-y-3.5">
          {analytics.skills.map((skill) => {
            const sharePct = Math.round((skill.xp / analytics.totalSkillXp) * 100);
            const barColor = SKILL_COLORS[skill.code] || "#38bdf8";

            return (
              <div key={skill.code} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-bold text-[11px] text-slate-950" style={{ backgroundColor: barColor }}>
                      {skill.code}
                    </span>
                    <span className="font-medium text-slate-200">{skill.name}</span>
                    <span className="text-slate-400">• Lv.{skill.level}</span>
                  </div>
                  <div className="text-right font-semibold text-slate-200">
                    {skill.xp.toLocaleString("id-ID")} XP <span className="text-slate-400 font-normal">({sharePct}%)</span>
                  </div>
                </div>

                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${Math.max(sharePct, skill.xp > 0 ? 3 : 0)}%`,
                      backgroundColor: barColor,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
