import React from 'react';
import { X, Heart, Compass, Zap, Octagon, ArrowUp, ArrowDown } from 'lucide-react';
import { PATH_CONFIGS } from '../utils/trackGenerator';

interface RulesModalProps {
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-sky-950/90 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-sky-900 border-4 border-sky-700 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl text-white flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl">🚤</span>
            <div>
              <h2 className="text-2xl md:text-3xl font-black italic tracking-tight text-yellow-400">BOAT RACE — HOW TO PLAY</h2>
              <p className="text-xs text-sky-200 font-bold uppercase tracking-wider">Official Rules & 3-Path River Guide</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-sky-800 hover:bg-sky-700 text-sky-300 hover:text-white transition-all cursor-pointer border-2 border-sky-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1. The 3-Path River System */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-black text-yellow-300 uppercase tracking-widest">
            <Compass className="w-4 h-4 text-yellow-400" />
            <span>1. THREE-PATH RIVER SYSTEM</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[0, 1, 2].map((p) => {
              const cfg = PATH_CONFIGS[p as 0 | 1 | 2];
              return (
                <div
                  key={p}
                  className="p-4 rounded-2xl border-2 flex flex-col gap-2 bg-white/10 shadow-lg"
                  style={{ borderColor: `${cfg.color}80` }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-white">PATH 0{p + 1}</span>
                    <span 
                      className="text-[9px] font-black px-2 py-0.5 rounded-md uppercase"
                      style={{ backgroundColor: cfg.color, color: '#0f172a' }}
                    >
                      {cfg.dangerLevel} RISK
                    </span>
                  </div>

                  <div className="font-black text-xs uppercase" style={{ color: cfg.color }}>
                    {cfg.name}
                  </div>
                  <p className="text-[11px] text-sky-200 leading-snug font-medium">
                    {cfg.description}
                  </p>
                  <div className="mt-auto pt-1 text-[11px] font-black text-yellow-300">
                    ⚡ {cfg.perk}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. Lives & Obstacle Bounce System */}
        <div className="bg-white/10 border-2 border-white/20 rounded-3xl p-5 flex flex-col gap-2.5 shadow-md">
          <div className="flex items-center gap-2 text-xs font-black text-red-400 uppercase tracking-widest">
            <Heart className="w-4 h-4 text-red-500 fill-red-500" />
            <span>2. 5 LIVES & OBSTACLE BOUNCE REDIRECTION</span>
          </div>
          <ul className="text-xs text-sky-100 space-y-2 font-bold list-disc list-inside leading-relaxed">
            <li>Each player starts with <strong className="text-white">5 Lives (❤️)</strong>.</li>
            <li>Colliding with hazards (rocks, mines, alligators) costs <strong className="text-white">1 Life</strong> and drops boat speed.</li>
            <li><strong className="text-yellow-300">Automatic Path Redirection:</strong> Colliding in Path 2 (Middle) automatically bounces you into Path 1 or Path 3! Colliding in Path 1 or 3 bounces you back to Path 2.</li>
            <li>Losing all 5 lives results in a DNF elimination for that round.</li>
          </ul>
        </div>

        {/* 3. Controls Reference */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2 text-xs font-black text-yellow-300 uppercase tracking-widest">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span>3. CHUNKY RESPONSIVE CONTROLS</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-emerald-600/30 border-2 border-emerald-500 p-3.5 rounded-2xl flex flex-col items-center text-center gap-1">
              <span className="font-black text-emerald-300 text-sm uppercase">FULL RUN</span>
              <span className="text-[11px] text-sky-100 font-bold">Throttle Forward</span>
              <span className="text-[10px] font-mono font-black bg-black/40 px-2 py-0.5 rounded text-white">[Space / D / →]</span>
            </div>

            <div className="bg-red-600/30 border-2 border-red-500 p-3.5 rounded-2xl flex flex-col items-center text-center gap-1">
              <span className="font-black text-red-300 text-sm uppercase">STOP</span>
              <span className="text-[11px] text-sky-100 font-bold">Brake / Slow Down</span>
              <span className="text-[10px] font-mono font-black bg-black/40 px-2 py-0.5 rounded text-white">[A / ←]</span>
            </div>

            <div className="bg-sky-700/40 border-2 border-sky-400 p-3.5 rounded-2xl flex flex-col items-center text-center gap-1">
              <span className="font-black text-sky-300 text-sm uppercase">UP PATH</span>
              <span className="text-[11px] text-sky-100 font-bold">Steer Upper Lane</span>
              <span className="text-[10px] font-mono font-black bg-black/40 px-2 py-0.5 rounded text-white">[W / ↑]</span>
            </div>

            <div className="bg-sky-700/40 border-2 border-sky-400 p-3.5 rounded-2xl flex flex-col items-center text-center gap-1">
              <span className="font-black text-sky-300 text-sm uppercase">DOWN PATH</span>
              <span className="text-[11px] text-sky-100 font-bold">Steer Lower Lane</span>
              <span className="text-[10px] font-mono font-black bg-black/40 px-2 py-0.5 rounded text-white">[S / ↓]</span>
            </div>
          </div>
        </div>

        {/* 4. Rounds Structure */}
        <div className="bg-sky-950/80 border-2 border-yellow-400/40 rounded-3xl p-4 flex flex-col gap-2">
          <div className="text-xs font-black text-yellow-300 uppercase tracking-widest">
            4. TWO-ROUND CHAMPIONSHIP FORMAT
          </div>
          <div className="text-xs text-sky-200 space-y-1 font-bold">
            <p>• <strong>Round 1:</strong> Player 1 starts first, followed by Player 2.</p>
            <p>• <strong>Round 2:</strong> Player 2 starts first, followed by Player 1.</p>
            <p>• Overall winner crowned after both rounds based on finish times, preserved lives, and stars collected!</p>
          </div>
        </div>

        {/* Close Button with Chunky 3D Styling */}
        <button
          onClick={onClose}
          className="w-full py-4 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-black text-lg italic border-b-6 border-yellow-600 active:border-b-0 active:translate-y-1 transition-all shadow-xl cursor-pointer"
        >
          READY TO RACE!
        </button>

      </div>
    </div>
  );
};
