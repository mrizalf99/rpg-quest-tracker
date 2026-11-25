import { motion } from "framer-motion";
import { Calendar, PlusCircle, X } from "lucide-react";
import { useState } from "react";
import { RANK_CONFIG, SKILL_BRANCHES } from "../data/initialGameData";
import { getLocalTodayISO } from "../utils/dateUtils";

export default function AddQuestModal({ onClose, onAdd }) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(getLocalTodayISO());
  const [type, setType] = useState("Daily Quest");
  const [skill, setSkill] = useState("INT");
  const [rank, setRank] = useState("D");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title: title.trim(), date, type, skill, rank });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <motion.div initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} className="rpg-panel w-full max-w-md rounded-2xl p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>

        <h3 className="font-display text-sm font-bold tracking-wider text-cyan-300 uppercase mb-4 flex items-center gap-2">
          <PlusCircle className="w-5 h-5" /> Tambah Quest Baru
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-300 mb-1.5">Nama Quest / Tugas</label>
            <input
              type="text"
              required
              placeholder="Contoh: Deploy portfolio ke Vercel"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Tanggal Pelaksanaan
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3.5 py-2.5 text-sm text-white focus:border-cyan-400 focus:outline-none [color-scheme:dark]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-300 mb-1.5">Tipe Quest</label>
              <select value={type} onChange={(e) => setType(e.target.value)} className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2.5 text-sm text-white">
                <option>Daily Quest</option>
                <option>Weekly Quest</option>
                <option>Boss Quest</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1.5">Cabang Skill</label>
              <select value={skill} onChange={(e) => setSkill(e.target.value)} className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2.5 text-sm text-white">
                {SKILL_BRANCHES.map((s) => (
                  <option key={s.code} value={s.code}>
                    {s.code} — {s.name.split(" ")[0]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1.5">Rank &amp; Hadiah Otomatis</label>
            <select value={rank} onChange={(e) => setRank(e.target.value)} className="w-full rounded-xl bg-slate-950 border border-slate-700 px-3 py-2.5 text-sm text-white">
              {Object.entries(RANK_CONFIG).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.label} (+{val.xp} XP / +{val.gold} Gold)
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 font-display text-xs font-bold tracking-wider text-white shadow-lg shadow-cyan-500/20 transition-all"
          >
            TERIMA MISI
          </button>
        </form>
      </motion.div>
    </div>
  );
}
