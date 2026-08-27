import React from 'react';
import { generateLevel, TOTAL_LEVELS } from '../game/levels';
import { LevelScore } from '../types';
import { X, Star, Droplets, ShieldAlert, Sparkles, Play, Map, Crosshair } from 'lucide-react';

interface LevelSelectModalProps {
  currentLevel: number;
  unlockedLevel: number;
  scores: { [levelNum: number]: LevelScore };
  onSelectLevel: (levelNum: number) => void;
  onClose: () => void;
  onUnlockAll?: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  currentLevel,
  unlockedLevel,
  scores,
  onSelectLevel,
  onClose,
  onUnlockAll,
}) => {
  const levels = Array.from({ length: TOTAL_LEVELS }, (_, i) => generateLevel(i + 1));

  return (
    <div
      id="level-select-modal-backdrop"
      className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 z-50 animate-fadeIn"
    >
      <div
        id="level-select-dialog"
        className="bg-[#0a0f0a] border border-emerald-500/40 w-full max-w-4xl max-h-[90vh] flex flex-col shadow-[0_0_40px_rgba(16,185,129,0.2)] text-emerald-50 relative overflow-hidden"
      >
        {/* Tactical Grid Background Overlay */}
        <div className="absolute inset-0 bg-tactical-grid opacity-20 pointer-events-none" />

        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-emerald-500/30 flex items-center justify-between bg-black/60 z-10 backdrop-blur-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 border border-emerald-500/30">
                SATELLITE EXPEDITION RECON
              </span>
              <span className="text-xs font-mono text-emerald-500/60">SECTORS 01-30</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1 italic flex items-center gap-2">
              <Map className="w-5 h-5 text-emerald-400" /> SELECT WILDERNESS SECTOR
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {onUnlockAll && (
              <button
                id="unlock-all-sectors-btn"
                onClick={onUnlockAll}
                className="px-3 py-1.5 bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Unlock All Sectors</span>
              </button>
            )}

            <button
              id="close-level-select-btn"
              onClick={onClose}
              className="w-9 h-9 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 flex items-center justify-center transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Level Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4 z-10">
          {levels.map((lvl) => {
            const isUnlocked = lvl.levelNumber <= unlockedLevel;
            const isCurrent = lvl.levelNumber === currentLevel;
            const score = scores[lvl.levelNumber];
            const stars = score ? score.stars : 0;

            return (
              <button
                key={lvl.levelNumber}
                id={`level-card-${lvl.levelNumber}`}
                disabled={!isUnlocked}
                onClick={() => {
                  if (isUnlocked) {
                    onSelectLevel(lvl.levelNumber);
                    onClose();
                  }
                }}
                className={`group relative p-3 sm:p-3.5 text-left flex flex-col justify-between transition-all duration-200 border text-white ${
                  isCurrent
                    ? 'bg-emerald-950/60 border-emerald-400 shadow-[0_0_15px_#10b981] ring-1 ring-emerald-400'
                    : isUnlocked
                    ? 'bg-black/60 hover:bg-emerald-950/30 border-emerald-500/30 hover:border-emerald-400/80 hover:shadow-[0_0_12px_rgba(16,185,129,0.2)]'
                    : 'bg-black/40 border-emerald-950/40 opacity-35 cursor-not-allowed'
                }`}
              >
                {/* Level number header */}
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-base font-black font-mono tracking-tighter ${isCurrent ? 'text-emerald-300' : 'text-emerald-500'}`}>
                    SEC {lvl.levelNumber < 10 ? `0${lvl.levelNumber}` : lvl.levelNumber}
                  </span>

                  {/* Stars */}
                  {isUnlocked && (
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3].map((starIdx) => (
                        <Star
                          key={starIdx}
                          className={`w-3 h-3 ${
                            starIdx <= stars
                              ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_#fbbf24]'
                              : 'text-emerald-950 fill-emerald-950'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Level title & biome */}
                <div className="mb-2.5">
                  <div className="text-[9px] font-mono text-emerald-400 uppercase tracking-wider mb-0.5">
                    {lvl.biome.replace('_', ' ')}
                  </div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-100 line-clamp-1 group-hover:text-emerald-300 transition">
                    {lvl.title}
                  </h4>
                </div>

                {/* Info footer */}
                <div className="flex items-center justify-between text-[10px] font-mono text-emerald-500/70 pt-2 border-t border-emerald-500/20">
                  <span className="flex items-center gap-1 text-cyan-300">
                    <Droplets className="w-3 h-3" /> {lvl.waterGoal}L
                  </span>

                  {lvl.animals.length > 0 && (
                    <span className="flex items-center gap-1 text-red-300">
                      <ShieldAlert className="w-3 h-3 text-red-400" /> {lvl.animals.length}
                    </span>
                  )}
                </div>

                {/* Play button hover cue */}
                {isUnlocked && (
                  <div className="absolute inset-0 bg-emerald-500/10 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                    <Crosshair className="w-6 h-6 text-emerald-400 animate-pulse" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
