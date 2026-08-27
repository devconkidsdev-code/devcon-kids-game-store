import React from 'react';
import { GameState } from '../game/engine';
import { Sparkles, Trophy, Star, ArrowRight, RotateCcw, Droplets, CheckCircle2, Shield, Radio } from 'lucide-react';

interface VictoryModalProps {
  gameState: GameState;
  onNextLevel: () => void;
  onReplay: () => void;
  onOpenLevelSelect: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  gameState,
  onNextLevel,
  onReplay,
  onOpenLevelSelect,
}) => {
  const { level, player, gameTime, stealthBonusMaintained } = gameState;

  // Star calculation
  const underParTime = gameTime <= level.parTimeSeconds;
  const highHealth = player.health >= 70;
  const stealthAchieved = stealthBonusMaintained;

  let stars = 1;
  if (underParTime) stars++;
  if (highHealth || stealthAchieved) stars++;

  const timeFormatted = `${Math.floor(gameTime / 60)}m ${Math.floor(gameTime % 60)}s`;

  return (
    <div
      id="victory-modal-backdrop"
      className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fadeIn"
    >
      <div
        id="victory-dialog-card"
        className="bg-[#0a0f0a] border border-emerald-500/50 w-full max-w-lg p-6 sm:p-8 text-center text-emerald-50 shadow-[0_0_50px_rgba(16,185,129,0.25)] relative overflow-hidden"
      >
        {/* Tactical Grid Overlay */}
        <div className="absolute inset-0 bg-tactical-grid opacity-20 pointer-events-none" />

        {/* Tactical Header Badge */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-950/80 border border-emerald-500/40 text-[10px] uppercase font-mono tracking-[0.2em] text-emerald-400 font-bold mb-3">
            <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> MISSION OBJECTIVE COMPLETED
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white italic">
            SECTOR RESTORATION SUCCESSFUL
          </h2>
          <p className="text-emerald-400/80 text-xs font-mono mt-1 max-w-sm mx-auto uppercase">
            {level.title} — Flora Saturated with Pure Water
          </p>

          {/* 3 Stars Award */}
          <div className="flex items-center justify-center gap-3 my-5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`w-12 h-12 flex items-center justify-center transition-all ${
                  s <= stars
                    ? 'bg-amber-950/60 border border-amber-400 text-amber-300 shadow-[0_0_15px_#f59e0b]'
                    : 'bg-black/60 border border-emerald-950 text-emerald-950'
                }`}
              >
                <Star className={`w-6 h-6 ${s <= stars ? 'fill-amber-400 text-amber-400' : ''}`} />
              </div>
            ))}
          </div>

          {/* Stats Grid */}
          <div className="bg-black/70 p-4 border border-emerald-500/30 grid grid-cols-3 gap-2 text-left mb-6 font-mono">
            <div className="p-2 border-r border-emerald-500/20">
              <div className="text-[10px] text-emerald-500/70 font-semibold uppercase">
                ⏱️ TIME ELAPSED
              </div>
              <div className="text-sm font-bold text-white mt-0.5">{timeFormatted}</div>
              <div className="text-[9px] text-emerald-400/60">PAR: {level.parTimeSeconds}s</div>
            </div>

            <div className="p-2 border-r border-emerald-500/20">
              <div className="text-[10px] text-cyan-400 font-semibold uppercase flex items-center gap-1">
                <Droplets className="w-3 h-3 text-cyan-400" /> WATER QUOTA
              </div>
              <div className="text-sm font-bold text-cyan-300 mt-0.5">{level.waterGoal}L</div>
              <div className="text-[9px] text-cyan-400/70">100% SATURATED</div>
            </div>

            <div className="p-2">
              <div className="text-[10px] text-emerald-400 font-semibold uppercase flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-400" /> VITALITY
              </div>
              <div className="text-sm font-bold text-white mt-0.5">{Math.ceil(player.health)}%</div>
              <div className="text-[9px] text-amber-400">{stealthAchieved ? 'GHOST STEALTH' : 'SURVIVED'}</div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              id="replay-level-btn"
              onClick={onReplay}
              className="flex-1 bg-black/60 hover:bg-emerald-950/40 text-emerald-300 font-bold py-3 px-4 border border-emerald-500/40 flex items-center justify-center gap-2 transition tracking-wider text-xs uppercase font-mono"
            >
              <RotateCcw className="w-4 h-4" /> Replay Sector
            </button>

            {level.levelNumber < 30 ? (
              <button
                id="next-level-btn"
                onClick={onNextLevel}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-3 px-4 skew-x-[-8deg] shadow-[0_0_20px_#10b981] flex items-center justify-center gap-2 transition border border-emerald-300"
              >
                <span className="skew-x-[8deg] flex items-center gap-2 uppercase tracking-widest text-xs font-mono">
                  <span>Advance Sector {level.levelNumber + 1}</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              </button>
            ) : (
              <button
                id="finish-campaign-btn"
                onClick={onOpenLevelSelect}
                className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-3 px-4 skew-x-[-8deg] shadow-[0_0_20px_#f59e0b] flex items-center justify-center gap-2 transition border border-amber-300 uppercase tracking-widest text-xs font-mono"
              >
                <span className="skew-x-[8deg] flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Campaign Master!
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
