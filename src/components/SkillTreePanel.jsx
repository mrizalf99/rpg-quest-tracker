import { motion } from "framer-motion";
import { AlertTriangle, Coins, Cpu, ShoppingBag } from "lucide-react";
import { REWARD_SHOP } from "../data/initialGameData";

export default function SkillTreePanel({ skills, debuffs, onToggleDebuff, availableGold, onRedeem }) {
  return (
    <div className="space-y-6">
      {/* Skill Tree */}
      <section className="hud-card rounded-2xl p-5">
        <h2 className="font-display text-sm font-bold tracking-wider text-cyan-300 uppercase flex items-center gap-2 mb-4">
          <Cpu className="w-4 h-4" /> Skill Tree &amp; Mastery
        </h2>
        <div className="space-y-3.5">
          {skills.map((skill) => (
            <div key={skill.code} className="rounded-xl bg-slate-900/75 border border-slate-800 p-3">
              <div className="flex justify-between items-center text-xs mb-1">
                <div>
                  <span className="font-display font-bold text-cyan-400 mr-2">{skill.code}</span>
                  <span className="text-slate-200 font-medium">{skill.name}</span>
                </div>
                <span className="font-display font-bold text-white bg-slate-800 px-2 py-0.5 rounded">Lv.{skill.level}</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-2">{skill.perk}</p>
              <div className="h-1.5 w-full rounded-full bg-slate-950 overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400" initial={{ width: 0 }} animate={{ width: `${skill.progressPct}%` }} transition={{ duration: 0.5 }} />
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Total: {skill.xp} XP</span>
                <span>{skill.xpInLevel}/500 XP</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Log Debuff */}
      <section className="hud-card rounded-2xl p-5 border-rose-500/30">
        <h2 className="font-display text-sm font-bold tracking-wider text-rose-400 uppercase flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4" /> Log Debuff (Penalti XP)
        </h2>
        <div className="space-y-2.5">
          {debuffs.map((d) => (
            <label
              key={d.id}
              className={`flex items-center justify-between gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${d.active ? "bg-rose-950/40 border-rose-500/50 text-rose-200" : "bg-slate-900/60 border-slate-800 text-slate-400"}`}
            >
              <div className="flex items-center gap-2.5 text-xs">
                <input type="checkbox" checked={d.active} onChange={() => onToggleDebuff(d.id)} className="rounded border-slate-600 text-rose-500 focus:ring-rose-500" />
                <span>{d.label}</span>
              </div>
              <span className="font-display text-xs font-bold text-rose-400 shrink-0">-{d.penalty} XP</span>
            </label>
          ))}
        </div>
      </section>

      {/* Reward Shop */}
      <section className="hud-card rounded-2xl p-5 border-amber-500/30">
        <h2 className="font-display text-sm font-bold tracking-wider text-amber-400 uppercase flex items-center gap-2 mb-3">
          <ShoppingBag className="w-4 h-4" /> Reward Shop
        </h2>
        <div className="space-y-2.5">
          {REWARD_SHOP.map((item) => {
            const canAfford = availableGold >= item.cost;
            return (
              <div key={item.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-900/75 border border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-slate-100">{item.title}</div>
                  <div className="text-[11px] text-slate-400">{item.desc}</div>
                </div>
                <button
                  disabled={!canAfford}
                  onClick={() => onRedeem(item.cost)}
                  className={`px-3 py-1.5 rounded-lg font-display text-xs font-bold flex items-center gap-1 shrink-0 transition-all ${
                    canAfford ? "bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-95" : "bg-slate-800 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  <Coins className="w-3.5 h-3.5" /> {item.cost}
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
