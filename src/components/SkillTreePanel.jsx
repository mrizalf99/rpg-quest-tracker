import { motion } from "framer-motion";
import { AlertTriangle, Coins, Cpu, ShoppingBag } from "lucide-react";
import { REWARD_SHOP } from "../data/initialGameData";

export default function SkillTreePanel({ activeTab, skills, debuffs, onToggleDebuff, availableGold, onRedeem }) {
  return (
    <div className="space-y-6">
      {/* Skill Tree */}
      <section id="section-skill" className={`rpg-panel rounded-2xl p-5 sm:p-6 scroll-mt-6 ${activeTab === "SKILL" ? "block" : "hidden lg:block"}`}>
        <h2 className="font-display text-xs font-bold tracking-[0.18em] text-cyan-300 uppercase flex items-center gap-2 mb-4">
          <Cpu className="w-4 h-4" /> Skill Mastery
        </h2>
        <div className="space-y-3">
          {skills.map((skill) => (
            <div key={skill.code} className="rpg-subcard rounded-xl p-3.5">
              <div className="flex justify-between items-center text-xs mb-1">
                <div className="truncate pr-2">
                  <span className="font-display font-bold text-cyan-400 mr-2">{skill.code}</span>
                  <span className="text-slate-200 font-medium">{skill.name}</span>
                </div>
                <span className="font-display text-[11px] font-bold text-slate-200 bg-slate-800/90 border border-slate-700 px-2 py-0.5 rounded shrink-0">Lv.{skill.level}</span>
              </div>
              <p className="text-[11px] text-slate-400 truncate mb-2.5">{skill.perk}</p>
              <div className="h-1.5 w-full rounded-full bg-slate-950 overflow-hidden">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-emerald-400" initial={{ width: 0 }} animate={{ width: `${skill.progressPct}%` }} transition={{ duration: 0.45 }} />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 mt-1.5">
                <span>{skill.xp.toLocaleString("id-ID")} XP</span>
                <span>{skill.xpInLevel}/500</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Log Debuff */}
      <section id="section-debuff" className={`rpg-panel rounded-2xl p-5 sm:p-6 scroll-mt-6 ${activeTab === "DEBUFF" ? "block" : "hidden lg:block"}`}>
        <h2 className="font-display text-xs font-bold tracking-[0.18em] text-rose-400 uppercase flex items-center gap-2 mb-4">
          <AlertTriangle className="w-4 h-4" /> Log Debuff
        </h2>
        <div className="space-y-2.5">
          {debuffs.map((d) => (
            <label
              key={d.id}
              className={`flex items-center justify-between gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${d.active ? "bg-rose-500/10 border-rose-500/35 text-rose-200" : "rpg-subcard text-slate-400 hover:border-slate-700"}`}
            >
              <div className="flex items-center gap-3 text-xs leading-snug">
                <input type="checkbox" checked={d.active} onChange={() => onToggleDebuff(d.id)} className="w-4 h-4 rounded border-slate-600 bg-slate-900 text-rose-500 focus:ring-0" />
                <span>{d.label}</span>
              </div>
              <span className="font-display text-xs font-bold text-rose-400 shrink-0">-{d.penalty}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Reward Shop */}
      <section id="section-shop" className={`rpg-panel rounded-2xl p-5 sm:p-6 scroll-mt-6 ${activeTab === "SHOP" ? "block" : "hidden lg:block"}`}>
        <h2 className="font-display text-xs font-bold tracking-[0.18em] text-amber-400 uppercase flex items-center gap-2 mb-4">
          <ShoppingBag className="w-4 h-4" /> Reward Shop
        </h2>
        <div className="space-y-2.5">
          {REWARD_SHOP.map((item) => {
            const canAfford = availableGold >= item.cost;
            return (
              <div key={item.id} className="rpg-subcard flex items-center justify-between gap-3 p-3.5 rounded-xl">
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-slate-100 leading-snug">{item.title}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                </div>
                <button
                  disabled={!canAfford}
                  onClick={() => onRedeem(item.cost)}
                  className={`px-3 py-1.5 rounded-lg font-display text-xs font-bold inline-flex items-center gap-1 shrink-0 transition-all ${
                    canAfford ? "bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-sm active:scale-95" : "bg-slate-800/80 text-slate-500 cursor-not-allowed"
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
