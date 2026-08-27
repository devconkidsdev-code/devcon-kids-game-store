import React from 'react';
import { RotateCcw, Skull, AlertTriangle } from 'lucide-react';
import { GameStats } from '../types';
import { TOTAL_GAME_LENGTH } from '../game/constants';

interface GameOverModalProps {
  reason: string;
  distanceTraveled: number;
  stats: GameStats;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  reason,
  distanceTraveled,
  stats,
  onRestart,
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((distanceTraveled / TOTAL_GAME_LENGTH) * 100)));

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-30 animate-in fade-in zoom-in-95 duration-300 text-white">
      <div className="max-w-md w-full bg-black/50 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-5 text-center relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-20 inset-x-0 h-40 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Skull Icon */}
        <div className="mx-auto w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-600/30">
          <Skull className="w-8 h-8 text-white" />
        </div>

        {/* Header */}
        <div className="flex flex-col gap-1.5">
          <h2 className="text-4xl sm:text-5xl font-black italic tracking-tighter text-red-500 drop-shadow">
            GAME OVER
          </h2>
          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full text-red-300 text-[11px] font-semibold uppercase tracking-wider">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{reason}</span>
          </div>
        </div>

        {/* Progress achieved */}
        <div className="bg-white/5 border border-white/15 p-4 rounded-2xl flex flex-col gap-2">
          <div className="flex justify-between text-xs text-white/70 font-medium">
            <span className="uppercase tracking-wider text-[10px] text-white/50">Mission Progress</span>
            <strong className="text-white font-mono font-bold">{percentage}% Completed</strong>
          </div>
          <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden border border-white/10">
            <div
              className="h-full bg-red-500 rounded-full"
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-white/50 font-mono mt-1">
            <span>Survived: {stats.timeElapsed.toFixed(1)}s</span>
            <span>Boosts: {stats.boostsUsed}</span>
          </div>
        </div>

        {/* Restart Game Button */}
        <button
          onClick={onRestart}
          className="w-full py-3.5 bg-white hover:bg-gray-100 text-black font-black text-sm uppercase tracking-wider rounded-full shadow-2xl flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" /> Restart Game
        </button>
      </div>
    </div>
  );
};

