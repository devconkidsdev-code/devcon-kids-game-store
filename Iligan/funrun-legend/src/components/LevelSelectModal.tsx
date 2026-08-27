import React from 'react';
import { Flag, Timer, Zap, ArrowLeft, Play, Infinity as InfinityIcon } from 'lucide-react';
import { GAME_LEVELS } from '../game/levels';
import { LevelConfig } from '../types';

interface LevelSelectModalProps {
  currentLevelId: number;
  onSelectLevel: (level: LevelConfig) => void;
  onBack: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  currentLevelId,
  onSelectLevel,
  onBack,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#050805]/95 border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-7 max-w-2xl w-full text-center shadow-[0_0_50px_rgba(16,185,129,0.2)] relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Background watermark */}
        <div className="text-[100px] font-black leading-none tracking-tighter text-emerald-500/5 absolute -bottom-6 -right-6 pointer-events-none select-none">
          STAGES
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-3 z-10">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-bold text-emerald-300 hover:text-white bg-black/60 hover:bg-emerald-950/60 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-[0.3em] text-emerald-500 font-bold">
              Select Sector
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white italic tracking-tight drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              PROVINCE <span className="text-emerald-400">COURSES</span>
            </h2>
          </div>
          <div className="w-14" />
        </div>

        {/* Level Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 overflow-y-auto pr-1 my-2 text-left z-10">
          {GAME_LEVELS.map((lvl) => {
            const isSelected = lvl.id === currentLevelId;
            const isInf = !!lvl.isInfinite;

            return (
              <div
                key={lvl.id}
                onClick={() => onSelectLevel(lvl)}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between ${
                  isSelected
                    ? isInf
                      ? 'bg-teal-950/80 border-teal-400 shadow-[0_0_25px_rgba(45,212,191,0.4)]'
                      : 'bg-emerald-950/70 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.35)]'
                    : isInf
                    ? 'bg-gradient-to-br from-teal-950/40 to-black/80 border-teal-500/40 hover:border-teal-400/80 hover:bg-[#071818]'
                    : 'bg-black/60 border-emerald-500/20 hover:border-emerald-500/50 hover:bg-[#0a140a]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${
                      isInf
                        ? 'bg-teal-500/30 text-teal-200 border-teal-400/60'
                        : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    }`}>
                      {isInf ? '⚡ ENDLESS MODE' : `Stage ${lvl.id}`}
                    </span>
                    {isSelected && (
                      <span className={`text-[10px] font-black uppercase flex items-center gap-1 ${
                        isInf ? 'text-teal-300' : 'text-emerald-400'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
                    {lvl.name}
                    {isInf && <InfinityIcon className="w-4 h-4 text-teal-400" />}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1 leading-snug">{lvl.description}</p>
                </div>

                <div className="flex items-center justify-between text-xs text-emerald-100 mt-3 pt-2.5 border-t border-emerald-500/20 font-mono">
                  <span className="flex items-center gap-1 text-emerald-400 text-[11px]">
                    <Flag className="w-3.5 h-3.5" />
                    {isInf ? 'Endless ∞' : `${lvl.distanceToSafeZone}m`}
                  </span>
                  <span className="flex items-center gap-1 text-zinc-300 text-[11px]">
                    <Timer className="w-3.5 h-3.5 text-emerald-400" />
                    {isInf ? 'No Limit' : `${lvl.timeLimitSeconds}s`}
                  </span>
                  <span className="flex items-center gap-1 text-amber-300 text-[11px]">
                    <Zap className="w-3.5 h-3.5" />
                    {isInf ? 'Escalating ⚡' : `${lvl.speedMultiplier}x Spd`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Start Button */}
        <div className="mt-3 pt-3 border-t border-emerald-500/20 z-10">
          <button
            onClick={onBack}
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black italic tracking-widest text-base uppercase rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all active:scale-[0.98] cursor-pointer"
          >
            <Play className="w-5 h-5 fill-black" />
            CONFIRM & SPRINT
          </button>
        </div>
      </div>
    </div>
  );
};


