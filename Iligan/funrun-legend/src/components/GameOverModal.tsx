import React from 'react';
import { RotateCcw, Menu, Zap, Flag, Timer, Trophy, ShieldAlert } from 'lucide-react';
import { LevelConfig, RunStats } from '../types';

interface GameOverModalProps {
  stats?: RunStats;
  level: LevelConfig;
  onRetry: () => void;
  onMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  level,
  onRetry,
  onMenu,
}) => {
  const isInfinite = !!level.isInfinite || !!stats?.isInfinite;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#050805]/95 border-2 border-red-500/50 rounded-3xl p-6 sm:p-8 max-w-md w-full text-center shadow-[0_0_50px_rgba(239,68,68,0.25)] relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Background watermark */}
        <div className="text-[90px] font-black leading-none tracking-tighter text-red-500/5 absolute -bottom-6 -right-6 pointer-events-none select-none">
          {isInfinite ? 'SURVIVED' : 'FAILED'}
        </div>

        {/* Elimination / Infinite Alert */}
        <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[0.3em] uppercase mb-3 border ${
          isInfinite
            ? 'bg-teal-500/20 text-teal-300 border-teal-500/50 shadow-[0_0_15px_rgba(45,212,191,0.25)]'
            : 'bg-red-500/15 text-red-400 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
        }`}>
          {isInfinite ? (
            <>
              <Trophy className="w-3.5 h-3.5 text-teal-400" />
              Endless Run Complete • Tier {stats?.difficultyTier || 1}
            </>
          ) : (
            <>
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
              Eliminated on Track
            </>
          )}
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-white italic tracking-tight drop-shadow-[0_0_20px_rgba(239,68,68,0.4)]">
          {isInfinite ? (
            <>ODYSSEY <span className="text-teal-400">SURVIVED</span></>
          ) : (
            <>RUN <span className="text-red-500">FAILED</span></>
          )}
        </h2>
        <p className="text-zinc-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
          {isInfinite
            ? `${stats?.characterName || 'Your runner'} survived ${stats?.distance || 0} meters across escalating difficulty tiers!`
            : `${stats?.characterName || 'Your runner'} hit moving obstacles or ran out of time before crossing into the Safe Zone.`}
        </p>

        {/* Run Stats Grid */}
        {stats && (
          <div className="grid grid-cols-3 gap-2 my-5 bg-black/70 border border-emerald-500/30 rounded-2xl p-3.5 shadow-inner">
            <div className="flex flex-col items-center">
              <Flag className="w-4 h-4 text-emerald-400 mb-1" />
              <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Distance</span>
              <span className="text-sm font-black text-white font-mono">{stats.distance}m</span>
              <span className="text-[9px] text-zinc-500">{isInfinite ? 'Total Survived' : `of ${level.distanceToSafeZone}m`}</span>
            </div>
            <div className="flex flex-col items-center border-x border-zinc-800">
              <Zap className="w-4 h-4 text-amber-400 mb-1" />
              <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Dodged</span>
              <span className="text-sm font-black text-amber-300 font-mono">{stats.obstaclesDodged}</span>
              <span className="text-[9px] text-zinc-500">{stats.topSpeedKmH} km/h top</span>
            </div>
            <div className="flex flex-col items-center">
              <Timer className="w-4 h-4 text-teal-400 mb-1" />
              <span className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider">Survived</span>
              <span className="text-sm font-black text-white font-mono">{stats.timeSpent}s</span>
              <span className="text-[9px] text-zinc-500">Score: {stats.score.toLocaleString()}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onRetry}
            className={`flex items-center justify-center gap-2 w-full py-3.5 font-black italic tracking-widest text-base uppercase rounded-2xl transition-all active:scale-[0.98] cursor-pointer ${
              isInfinite
                ? 'bg-teal-400 hover:bg-teal-300 text-black shadow-[0_0_25px_rgba(45,212,191,0.4)]'
                : 'bg-red-500 hover:bg-red-400 text-black shadow-[0_0_25px_rgba(239,68,68,0.4)]'
            }`}
          >
            <RotateCcw className="w-5 h-5 stroke-[2.5]" />
            RUN AGAIN (SPACE / ENTER)
          </button>

          <button
            onClick={onMenu}
            className="flex items-center justify-center gap-2 py-3 bg-black/60 hover:bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-2xl transition-all active:scale-95 cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.1)]"
          >
            <Menu className="w-4 h-4 text-emerald-400" />
            RETURN TO MENU
          </button>
        </div>
      </div>
    </div>
  );
};


