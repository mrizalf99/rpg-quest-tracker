import { motion } from "framer-motion";
import { AlertTriangle, Cpu, ShoppingBag, Swords } from "lucide-react";

export default function QuickNavCards({ activeTab, onSelectTab, activeQuestCount, skillCount, totalPenalty, availableGold }) {
  const navItems = [
    {
      id: "QUEST",
      label: "Quest Board",
      badge: `${activeQuestCount} Aktif`,
      icon: Swords,
      accent: "text-cyan-400",
      activeStyle: "border-cyan-400/60 bg-cyan-500/10 shadow-[0_0_20px_rgba(56,189,248,0.15)]",
    },
    {
      id: "SKILL",
      label: "Skill Tree",
      badge: `${skillCount} Cabang`,
      icon: Cpu,
      accent: "text-emerald-400",
      activeStyle: "border-emerald-400/60 bg-emerald-500/10 shadow-[0_0_20px_rgba(16,185,129,0.15)]",
    },
    {
      id: "DEBUFF",
      label: "Log Debuff",
      badge: totalPenalty > 0 ? `-${totalPenalty} XP` : "Aman",
      icon: AlertTriangle,
      accent: "text-rose-400",
      activeStyle: "border-rose-400/60 bg-rose-500/10 shadow-[0_0_20px_rgba(244,63,94,0.15)]",
    },
    {
      id: "SHOP",
      label: "Reward Shop",
      badge: `${availableGold.toLocaleString("id-ID")} G`,
      icon: ShoppingBag,
      accent: "text-amber-400",
      activeStyle: "border-amber-400/60 bg-amber-500/10 shadow-[0_0_20px_rgba(245,158,11,0.15)]",
    },
  ];

  return (
    <nav aria-label="Navigasi Cepat RPG" className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 mb-6">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <motion.button
            key={item.id}
            whileTap={{ scale: 0.96 }}
            onClick={() => onSelectTab(item.id)}
            className={`text-left rounded-xl p-3 sm:p-3.5 border transition-all flex items-center gap-3 ${isActive ? item.activeStyle : "rpg-subcard hover:border-slate-700"}`}
          >
            <div className={`w-9 h-9 rounded-lg bg-slate-950/80 border border-slate-800 flex items-center justify-center shrink-0 ${item.accent}`}>
              <Icon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="font-display text-[11px] sm:text-xs font-bold text-slate-100 truncate">{item.label}</div>
              <div className={`text-[11px] font-semibold mt-0.5 truncate ${item.accent}`}>{item.badge}</div>
            </div>
          </motion.button>
        );
      })}
    </nav>
  );
}
