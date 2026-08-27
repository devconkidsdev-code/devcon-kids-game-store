import React from 'react';
import { X, Flame, Droplets, Zap, Shield, Sparkles } from 'lucide-react';
import { sound } from '../utils/sound';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white border-4 border-amber-300 rounded-3xl shadow-[12px_12px_0px_0px_#fde68a] p-6 relative flex flex-col max-h-[90vh] overflow-y-auto">
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 w-9 h-9 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 mb-4 font-display">
          <span>Game Guide & Elemental Rules</span>
        </h2>

        <div className="space-y-3.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
          {/* Core Rule */}
          <div className="p-3.5 rounded-2xl bg-sky-50 border-2 border-sky-300 shadow-[2px_2px_0px_0px_#bae6fd]">
            <h3 className="font-black text-sky-800 text-sm mb-1">Elemental Dualism:</h3>
            <p>
              • <strong className="text-sky-600 font-bold">The Diamond is Water (💧/💎)</strong>: Collect or scatter them to score points, accumulate multipliers, and trigger Free Spins and Hydro Tsunami blasts.<br />
              • <strong className="text-orange-600 font-bold">The Bomb is Fire (🔥/💣)</strong>: Fiery hazards that explode on contact, unless shielded or multiplied in cascading scatter boards!
            </p>
          </div>

          {/* Mode 1: Scatter Blitz */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border-2 border-amber-200 shadow-[2px_2px_0px_0px_#fde68a]">
            <h3 className="font-black text-orange-600 text-sm mb-1">⚔️ Mode 1: Scatter Blitz Arena</h3>
            <p>
              • Slice, catch, or tap scattering water diamonds to keep combo multipliers alive.<br />
              • <strong>Do not hit Fire Bombs</strong> unless you have an active 🛡️ Hydro Bubble.<br />
              • Fill your Hydro Gauge to 100% to unleash a <strong>Tsunami Wave</strong> that converts all active bombs into diamonds!
            </p>
          </div>

          {/* Mode 2: Cascade Scatter Grid */}
          <div className="p-3.5 rounded-2xl bg-cyan-50 border-2 border-cyan-200 shadow-[2px_2px_0px_0px_#a5f3fc]">
            <h3 className="font-black text-cyan-800 text-sm mb-1">🎰 Mode 2: Cascade Scatter Grid</h3>
            <p>
              • 8+ matching symbols anywhere on the board trigger a tumbling cascade payout.<br />
              • <strong>Fire Bombs (💣)</strong> act as explosive multiplier boosters (2x up to 100x).<br />
              • 4+ <strong>Water Diamonds (💎)</strong> award 10 Free Hydro Spins with sticky persistent fire multipliers!
            </p>
          </div>

          {/* Mode 3: Mines Scatter */}
          <div className="p-3.5 rounded-2xl bg-red-50 border-2 border-red-200 shadow-[2px_2px_0px_0px_#fca5a5]">
            <h3 className="font-black text-red-600 text-sm mb-1">💣 Mode 3: Elemental Mines</h3>
            <p>
              • Choose the number of hidden Fire Bombs and reveal tiles one by one.<br />
              • Each Water Diamond uncovered raises your payout multiplier. Cash out anytime!
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="mt-6 w-full py-3 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-sky-500 text-white font-black text-sm shadow-[4px_4px_0px_0px_#c2410c] border-2 border-orange-600 hover:opacity-95 transition-opacity cursor-pointer"
        >
          Got It, Let's Play!
        </button>
      </div>
    </div>
  );
};
