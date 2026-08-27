import React from 'react';
import { RotateCcw, Skull } from 'lucide-react';
import { PlayerStats } from '../types';

interface GameOverModalProps {
  stats: PlayerStats;
  currentLevel: number;
  onRetry: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  currentLevel,
  onRetry,
  onMainMenu,
}) => {
  return (
    <div id="game-over-modal" className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-fade-in select-none">
      <div className="max-w-md w-full bg-neutral-950 border border-red-900/60 p-8 rounded-2xl shadow-[0_0_60px_rgba(220,38,38,0.5)] text-center space-y-6">
        <div className="inline-flex p-4 rounded-full bg-red-950/60 border border-red-800 text-red-500 animate-bounce">
          <Skull className="w-12 h-12" />
        </div>

        <div className="space-y-1">
          <h2 className="text-5xl font-['Creepster',cursive] text-red-600 tracking-wider drop-shadow-[0_2px_10px_rgba(220,38,38,0.8)]">
            CAUGHT BY THE DARK
          </h2>
          <p className="text-neutral-400 font-['VT323',monospace] text-xl">
            You ran out of lives on Stage {currentLevel}.
          </p>
        </div>

        {/* Stats breakdown */}
        <div className="bg-neutral-900/80 p-4 rounded-xl border border-neutral-800 space-y-2 text-sm text-neutral-300">
          <div className="flex justify-between font-['VT323',monospace] text-lg">
            <span className="text-neutral-400">Total Buckets Gathered:</span>
            <span className="text-cyan-400 font-bold">{stats.totalBucketsCollected}</span>
          </div>
          <div className="flex justify-between font-['VT323',monospace] text-lg">
            <span className="text-neutral-400">Time Survived:</span>
            <span className="text-amber-400 font-bold">{Math.floor(stats.timeElapsed)}s</span>
          </div>
          <div className="flex justify-between font-['VT323',monospace] text-lg">
            <span className="text-neutral-400">Creature Encounters:</span>
            <span className="text-red-400 font-bold">{stats.nearMisses}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            id="btn-retry-level"
            onClick={onRetry}
            className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-black font-bold font-['VT323',monospace] text-2xl rounded-xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.4)] flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>TRY AGAIN</span>
          </button>
          <button
            id="btn-back-menu"
            onClick={onMainMenu}
            className="w-full py-2.5 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white font-['VT323',monospace] text-xl rounded-xl border border-neutral-800 transition-all cursor-pointer"
          >
            RETURN TO TITLE
          </button>
        </div>
      </div>
    </div>
  );
};
