import React from 'react';
import { X, Droplets, Heart, Skull, Flame, Clock, Navigation, CheckCircle2 } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<Props> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-sky-900/60 backdrop-blur-sm animate-fadeIn" id="how-to-play-modal">
      <div className="w-full max-w-xl bg-yellow-50 border-8 border-blue-600 rounded-[32px] p-5 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          id="btn-close-how-to-play"
          onClick={onClose}
          aria-label="Close guide"
          className="absolute top-4 right-4 w-10 h-10 rounded-2xl bg-white border-3 border-blue-600 flex items-center justify-center text-blue-900 hover:bg-rose-500 hover:text-white hover:border-rose-700 transition-colors shadow-sm cursor-pointer"
        >
          <X className="w-5 h-5 stroke-[3]" />
        </button>

        <h2 className="text-3xl font-black text-blue-600 font-heading text-center mb-0.5 uppercase tracking-wide">
          HOW TO PLAY
        </h2>
        <p className="text-xs font-black text-blue-900 uppercase tracking-widest text-center mb-5">
          Water Hero: Save Every Drop
        </p>

        {/* Instructions Grid */}
        <div className="space-y-3 text-sm">
          {/* Objective */}
          <div className="p-3.5 bg-white rounded-2xl border-3 border-blue-600 flex items-start gap-3 shadow-sm">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shrink-0 shadow-sm">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-blue-900 uppercase text-xs tracking-wide">Main Objective</h4>
              <p className="text-xs text-slate-700 font-bold mt-0.5 leading-relaxed">
                Navigate the secure maze, collect clean water drops to fill your bottle, and reach the <strong>outside exit gateway</strong> to deliver water into the <strong className="text-emerald-600">Community Water Tank</strong> for the village families waiting outside!
              </p>
            </div>
          </div>

          {/* Items & Hazards Guide */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 bg-white rounded-2xl border-3 border-blue-600 flex items-center gap-2.5 shadow-sm">
              <span className="text-2xl">💧</span>
              <div className="text-left">
                <span className="font-black text-xs text-blue-900 block uppercase">Clean Water Drop</span>
                <span className="text-[11px] font-bold text-blue-600">+1 Water Point</span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-2xl border-3 border-blue-600 flex items-center gap-2.5 shadow-sm">
              <span className="text-2xl">☣️</span>
              <div className="text-left">
                <span className="font-black text-xs text-purple-900 block uppercase">Contaminated Sludge</span>
                <span className="text-[11px] font-bold text-purple-600">-1 to -2 Water Points</span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-2xl border-3 border-blue-600 flex items-center gap-2.5 shadow-sm">
              <span className="text-2xl">❤️</span>
              <div className="text-left">
                <span className="font-black text-xs text-rose-900 block uppercase">Heart Item</span>
                <span className="text-[11px] font-bold text-rose-600">+1 Life (Max 3)</span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-2xl border-3 border-blue-600 flex items-center gap-2.5 shadow-sm">
              <span className="text-2xl">🐍</span>
              <div className="text-left">
                <span className="font-black text-xs text-emerald-950 block uppercase">Snake Hazard</span>
                <span className="text-[11px] font-bold text-emerald-600">-1 Life upon contact</span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-2xl border-3 border-blue-600 flex items-center gap-2.5 shadow-sm">
              <span className="text-2xl">🔥</span>
              <div className="text-left">
                <span className="font-black text-xs text-amber-950 block uppercase">Dry Drought Area</span>
                <span className="text-[11px] font-bold text-amber-600">-1 Water on step</span>
              </div>
            </div>

            <div className="p-3 bg-white rounded-2xl border-3 border-blue-600 flex items-center gap-2.5 shadow-sm">
              <span className="text-2xl">⏳</span>
              <div className="text-left">
                <span className="font-black text-xs text-blue-900 block uppercase">Countdown Timer</span>
                <span className="text-[11px] font-bold text-amber-600">60s in Level 5</span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="p-3.5 bg-white rounded-2xl border-3 border-blue-600 flex items-center gap-3 shadow-sm">
            <div className="p-2.5 rounded-xl bg-blue-600 text-white shrink-0 shadow-sm">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-blue-900 uppercase text-xs tracking-wide">Movement Controls</h4>
              <p className="text-xs text-slate-700 font-bold mt-0.5">
                Use <strong>Arrow Keys</strong> (Up, Down, Left, Right), <strong>WASD</strong> on keyboard, or tap the on-screen <strong>Directional Buttons</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Got it Button */}
        <button
          id="btn-got-it"
          onClick={onClose}
          className="w-full mt-5 py-4 bg-green-500 hover:bg-green-400 text-white font-black text-base rounded-2xl border-b-6 border-green-700 shadow-md active:translate-y-0.5 active:border-b-2 transition-all cursor-pointer uppercase tracking-wide"
        >
          GOT IT! LET'S SAVE WATER!
        </button>

      </div>
    </div>
  );
};
