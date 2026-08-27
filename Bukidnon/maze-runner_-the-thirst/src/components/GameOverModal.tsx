import React from 'react';
import { GameEngine } from '../game/GameEngine';
import { RotateCcw, Home, Skull, Droplets, AlertTriangle } from 'lucide-react';

interface GameOverModalProps {
  engine: GameEngine;
  onRetry: () => void;
  onMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  engine,
  onRetry,
  onMenu
}) => {
  const isTimeOut = engine.timeLeft <= 0;
  const isWaterOut = engine.player && engine.player.water <= 0;

  return (
    <div className="absolute inset-0 z-50 bg-indigo-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-indigo-900/85 border-2 border-pink-500/60 rounded-3xl p-6 md:p-8 shadow-[0_0_60px_rgba(236,72,153,0.3)] text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-pink-500 text-white text-xs font-black uppercase tracking-wider mb-3 shadow-[0_0_15px_rgba(236,72,153,0.6)]">
          <Skull className="w-4 h-4" />
          <span>The Thirst Won</span>
        </div>

        <h2 className="text-3xl md:text-4xl font-black italic text-white mb-2">
          {isTimeOut ? 'Time Expired!' : 'Bucket Ran Dry!'}
        </h2>

        <p className="text-sm text-indigo-200 mb-6">
          {isTimeOut
            ? 'The scorching heat withered the plants before you could reach them in time.'
            : 'You spilled your water on hard wall crashes or thorn traps! Watch your turns!'}
        </p>

        {/* Stats card */}
        <div className="bg-indigo-950/90 border border-indigo-500/50 rounded-2xl p-4 mb-6 text-left text-xs space-y-2.5">
          <div className="flex justify-between items-center text-indigo-200">
            <span className="font-bold">Crops Revived:</span>
            <span className="font-black text-cyan-400">
              {engine.cropsWateredCount} / {engine.totalCropsNeeded}
            </span>
          </div>
          <div className="flex justify-between items-center text-indigo-200">
            <span className="font-bold">Score Accumulated:</span>
            <span className="font-black text-yellow-400 tabular-nums">{engine.score}</span>
          </div>
          <div className="flex justify-between items-center text-pink-400">
            <span className="flex items-center gap-1 font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-pink-400" /> Survival Tip:
            </span>
            <span className="text-[11px] text-indigo-300">
              Pick up 🧽 Sponge or 🛡️ Bucket Lid crates to prevent spillage!
            </span>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col gap-3">
          <button
            id="retry-game-btn"
            onClick={onRetry}
            className="w-full py-4 rounded-2xl bg-pink-500 hover:bg-pink-400 text-white font-black text-base uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#be185d] active:translate-y-1 active:shadow-[0_2px_0_#be185d] transition cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>TRY AGAIN</span>
          </button>
          <button
            id="gameover-menu-btn"
            onClick={onMenu}
            className="py-3 px-4 rounded-2xl bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border border-indigo-700/60 transition cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
