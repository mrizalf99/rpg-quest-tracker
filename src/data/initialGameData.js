export const RANK_CONFIG = {
  E: { label: "Rank E", xp: 20, gold: 10, color: "text-slate-300 border-slate-500/40 bg-slate-800/60" },
  D: { label: "Rank D", xp: 50, gold: 25, color: "text-emerald-300 border-emerald-500/40 bg-emerald-950/50" },
  C: { label: "Rank C", xp: 120, gold: 60, color: "text-cyan-300 border-cyan-500/40 bg-cyan-950/50" },
  B: { label: "Rank B", xp: 300, gold: 150, color: "text-indigo-300 border-indigo-500/40 bg-indigo-950/50" },
  A: { label: "Rank A", xp: 600, gold: 300, color: "text-amber-300 border-amber-500/40 bg-amber-950/50" },
  S: { label: "Rank S", xp: 1000, gold: 500, color: "text-rose-300 border-rose-500/50 bg-rose-950/60" },
};

export const SKILL_BRANCHES = [
  { code: "INT", name: "Software Engineering & Tech", baseXp: 0, perk: "Fullstack AI-Accelerated Engineer" },
  { code: "ENG", name: "English Language & Comm", baseXp: 0, perk: "ATS Resume & Tech Interview (B2)" },
  { code: "STR", name: "Physical & Stamina", baseXp: 0, perk: "Gym & Rindam Endurance Routine" },
  { code: "CHA", name: "Career & Execution", baseXp: 0, perk: "Consistent Job Hunter & Builder" },
  { code: "JPN", name: "Japanese & Kaiwa", baseXp: 0, perk: "Irodori Elementary & JFT Track" },
  { code: "CHESS", name: "Catur Strategis", baseXp: 0, perk: "London Opening & Tactical Vision" },
  { code: "WIS", name: "Language & Mental Math", baseXp: 0, perk: "Fast Calculation (< 1s/item)" },
  { code: "LIT", name: "Reading & Knowledge Synthesis", baseXp: 0, perk: "Daily 20-Page Habit & Notes" },
];

export const INITIAL_QUESTS = [
  {
    id: "Q-001",
    date: "2026-11-22",
    title: "Kirim lamaran Junior Programmer ke PT. Agro Mantep Lestari (AML Group)",
    type: "Boss Quest",
    skill: "CHA",
    rank: "B",
    completed: true,
  },
  {
    id: "Q-011",
    date: "2026-11-23",
    title: "Ikuti Mensetsu Tahap 1 Greentec di LPK Megumi Kulon Progo",
    type: "Boss Quest",
    skill: "CHA",
    rank: "B",
    completed: true,
  },
  {
    id: "Q-018",
    date: "2026-11-24",
    title: "Membuat website portofolio dengan React JS + Tailwind",
    type: "Boss Quest",
    skill: "INT",
    rank: "A",
    completed: true,
  },
  {
    id: "Q-009",
    date: "2026-11-25",
    title: "Latihan beban (arm & leg workout) di gym Magelang",
    type: "Weekly Quest",
    skill: "STR",
    rank: "C",
    completed: true,
  },
  {
    id: "Q-006",
    date: "2026-11-25",
    title: "Perbarui CV ke versi Bahasa Inggris ATS-friendly untuk lamaran Skyshi",
    type: "Daily Quest",
    skill: "CHA",
    rank: "D",
    completed: false,
  },
  {
    id: "Q-005",
    date: "2026-11-25",
    title: "Rapikan profil GitHub & unggah repositori proyek web (Web Sembako / Riztube)",
    type: "Daily Quest",
    skill: "INT",
    rank: "D",
    completed: false,
  },
  {
    id: "Q-004",
    date: "2026-11-25",
    title: "Review 15 kosakata & tata bahasa Irodori (persiapan retake JFT-Basic A2)",
    type: "Daily Quest",
    skill: "JPN",
    rank: "D",
    completed: false,
  },
  {
    id: "Q-008",
    date: "2026-11-25",
    title: "Bangun mini-project CRUD React (useState, useEffect) + Node.js REST API",
    type: "Boss Quest",
    skill: "INT",
    rank: "B",
    completed: false,
  },
  {
    id: "Q-020",
    date: "2026-11-25",
    title: "Tambahkan fitur album dan manajemen playlist di Riztube",
    type: "Daily Quest",
    skill: "INT",
    rank: "C",
    completed: false,
  },
  {
    id: "Q-019",
    date: "2026-11-25",
    title: "Membaca buku 20 halaman & catat poin penting",
    type: "Daily Quest",
    skill: "LIT",
    rank: "D",
    completed: false,
  },
];

export const INITIAL_DEBUFFS = [
  { id: "DEB-1", label: "Begadang tanpa alasan produktif (> 00.00 WIB)", penalty: 30, active: true },
  { id: "DEB-2", label: "Menunda jadwal latihan / scrolling distraksi berlebih", penalty: 20, active: false },
];

export const REWARD_SHOP = [
  { id: "REW-1", title: "Kopi Susu / Matcha Favorit Magelang", cost: 150, desc: "Reward santai setelah Daily Clear" },
  { id: "REW-2", title: "1 Jam Sesi Gaming Laptop Tanpa Rasa Bersalah", cost: 250, desc: "Istirahat penuh setelah Boss Quest" },
  { id: "REW-3", title: "Cheat Meal Spesial Akhir Pekan", cost: 400, desc: "Kuliner bebas setelah target mingguan tuntas" },
];
