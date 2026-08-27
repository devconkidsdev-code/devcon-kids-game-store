import React from 'react';
import { X, ShieldAlert, Package, CheckCircle, AlertTriangle } from 'lucide-react';

interface SurvivalGuideModalProps {
  onClose: () => void;
}

export const SurvivalGuideModal: React.FC<SurvivalGuideModalProps> = ({ onClose }) => {
  const suppliesInfo = [
    {
      icon: '🦺',
      name: 'Flotation Life Vest',
      color: '#f97316',
      effect: '+50% Swim Speed & Doubles underwater breath duration',
      lore: 'The most important flood survival gear. Keeps Dexter afloat in raging flood currents.',
    },
    {
      icon: '🔦',
      name: 'Waterproof Flashlight',
      color: '#eab308',
      effect: 'Casts high-powered light beam piercing torrential rain & darkness',
      lore: 'Allows Dexter to spot safe ledges and ladders through heavy typhoon squalls.',
    },
    {
      icon: '📻',
      name: 'Emergency Transistor Radio',
      color: '#8b5cf6',
      effect: '+300 pts & Evacuation vessel tracking bonus',
      lore: 'Tuned to PAGASA emergency weather broadcasts and Coast Guard rescue frequencies.',
    },
    {
      icon: '🩹',
      name: 'First-Aid Medical Kit',
      color: '#10b981',
      effect: '+1 Extra Life ❤️, Full Stamina & +30% Oxygen boost',
      lore: 'Treats abrasions and electrical burns, restoring +1 life (up to 5 max) and replenishing Dexter\'s physical endurance.',
    },
    {
      icon: '🥫',
      name: 'Canned Goods & Emergency Rations',
      color: '#ef4444',
      effect: '+200 pts & +40% stamina replenishment',
      lore: 'Non-perishable food items packed in Dexter\'s emergency grab-bag.',
    },
    {
      icon: '💧',
      name: 'Clean Potable Water',
      color: '#06b6d4',
      effect: '+150 pts & stamina recovery',
      lore: 'Flood water is heavily contaminated with bacteria. Sealed clean water is life-saving.',
    },
    {
      icon: '🔋',
      name: 'Heavy Duty Batteries',
      color: '#84cc16',
      effect: '+150 pts & Powers emergency distress beacons',
      lore: 'Essential for powering flashlights and radio communications during power outages.',
    },
    {
      icon: '🪢',
      name: 'Emergency Utility Rope',
      color: '#d97706',
      effect: '+250 pts & high-angle evacuation capability',
      lore: 'Strong braided rope used to secure family members and scale steep rooftops.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none font-sans">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden relative backdrop-blur-xl">
        <div className="absolute inset-0 bg-dot-grid opacity-10 pointer-events-none" />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between p-4 sm:p-5 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-red-400 block leading-none">
                PROTOCOL MANUAL // SURVIVAL BRIEFING
              </span>
              <h2 className="text-base sm:text-lg font-black text-white uppercase italic mt-0.5">
                BAGYO SURVIVAL &amp; GO-BAG GUIDE
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer border border-slate-700/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="relative z-10 p-4 sm:p-6 overflow-y-auto space-y-5 text-slate-300 text-sm">
          {/* Main Objectives */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 space-y-2.5 shadow-inner">
            <h3 className="font-bold text-amber-400 flex items-center gap-2 text-xs uppercase tracking-widest">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Objective &amp; Operational Constraints
            </h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong className="text-white font-semibold">60-Second Evacuation Clock:</strong> You have exactly 1 minute before flood waters submerge all access routes. Reach the rescue boat at the summit before the timer hits 0.0s!</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span><strong className="text-white font-semibold">5 Lives &amp; Electrical Hazards:</strong> Dexter starts with 5 lives. Touching sparking high-voltage electrical wires or submerged live cables removes 1 life and triggers severe shock! Avoid electric hazards to survive.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span><strong className="text-white font-semibold">Rising Flood Waters:</strong> Flood water rises continuously. Dexter can swim and float, but being submerged drains Oxygen quickly!</span>
              </li>
              <li className="flex items-start gap-2.5">
                <CheckCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                <span><strong className="text-white font-semibold">Gather Supplies:</strong> Collect as many survival go-bag supplies as possible for point bonuses, stamina replenishment, and higher survival grade (S / A / B / C).</span>
              </li>
            </ul>
          </div>

          {/* Go-Bag Supply Items Grid */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-200 flex items-center gap-2 text-xs uppercase tracking-widest">
              <Package className="w-4 h-4 text-sky-400" /> Emergency Go-Bag Supplies
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {suppliesInfo.map((item, idx) => (
                <div 
                  key={idx} 
                  className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex items-start gap-3 hover:border-slate-700 transition-colors shadow-inner"
                >
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border"
                    style={{ backgroundColor: `${item.color}18`, borderColor: `${item.color}40` }}
                  >
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-100">{item.name}</h4>
                    </div>
                    <p className="text-[11px] font-semibold text-emerald-400 mt-0.5">{item.effect}</p>
                    <p className="text-[10px] text-slate-400 mt-1 leading-snug">{item.lore}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 p-4 border-t border-slate-800 bg-slate-950/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 via-amber-500 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_20px_rgba(220,38,38,0.4)] active:scale-95 border border-red-400/40"
          >
            CONFIRM PROTOCOL — ESCAPE FLOOD
          </button>
        </div>
      </div>
    </div>
  );
};
