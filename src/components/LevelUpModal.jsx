import { motion } from "framer-motion";
import { Award } from "lucide-react";

export default function LevelUpModal({ info, onClose }) {
  if (!info) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <motion.div
        initial={{ scale: 0.6, opacity: 0, rotate: -4 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 14 }}
        className="hud-card max-w-sm w-full rounded-3xl p-8 text-center border-amber-400/50 shadow-[0_0_50px_rgba(245,158,11,0.25)]"
      >
        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center mb-4">
          <Award className="w-9 h-9 text-amber-400" />
        </div>
        <div className="font-display text-xs tracking-[0.25em] text-amber-400 uppercase">System Notification</div>
        <h2 className="font-display text-3xl font-extrabold text-white mt-1">LEVEL UP!</h2>
        <p className="text-slate-300 text-sm mt-3">
          Karakter naik ke <span className="font-bold text-cyan-400">Level {info.newLevel}</span>
        </p>
        <div className="mt-2 inline-block px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-xs font-semibold text-cyan-300">Gelar: {info.rankTitle}</div>
        <button onClick={onClose} className="mt-6 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display text-sm font-bold transition-colors">
          LANJUTKAN PETUALANGAN
        </button>
      </motion.div>
    </div>
  );
}
