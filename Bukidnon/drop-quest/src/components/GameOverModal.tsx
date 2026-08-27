import React from 'react';
import { RotateCcw, AlertTriangle, Home, Timer, Heart } from 'lucide-react';
import { GameState } from '../types';

interface GameOverModalProps {
  state: GameState;
  onRetry: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ state, onRetry, onHome }) => {
  const isTimeout = state.lossReason === 'timeout';

  return (
    <div id="game-over-modal" className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-gradient-to-b from-stone-950 via-rose-950/80 to-stone-950 rounded-3xl border-2 border-red-500/40 p-6 sm:p-8 text-stone-100 shadow-2xl text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Red Warning Ambient Glow */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-20 bg-red-500/30 blur-2xl rounded-full pointer-events-none" />

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/20 border border-red-400/40 text-red-300 text-xs font-black uppercase tracking-widest mb-3">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Drought Prevails</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-300 via-rose-200 to-amber-200 mb-2">
          GAME OVER
        </h2>

        <p className="text-rose-200/80 text-sm font-medium mb-6">
          {isTimeout ? (
            <span className="flex items-center justify-center gap-1">
              <Timer className="w-4 h-4 text-amber-400 inline" />
              Time ran out! The crops wilted before receiving water.
            </span>
          ) : (
            <span className="flex items-center justify-center gap-1">
              <Heart className="w-4 h-4 text-red-400 inline" />
              All 5 lives lost! Hazards and deep pits claimed the farmer.
            </span>
          )}
        </p>

        {/* Progress Snapshot */}
        <div className="bg-stone-950/70 p-4 rounded-2xl border border-red-500/20 mb-6 text-left space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-stone-400">Hydration Progress</span>
            <span className="font-bold text-sky-400">{state.progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-stone-900 rounded-full overflow-hidden">
            <div className="h-full bg-sky-500" style={{ width: `${state.progressPercent}%` }} />
          </div>
          <div className="flex justify-between items-center text-xs pt-1 border-t border-stone-800">
            <span className="text-stone-400">Final Score</span>
            <span className="font-bold text-amber-300 font-mono">{state.score} PTS</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2.5">
          <button
            id="btn-retry"
            onClick={onRetry}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-500 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-base tracking-wide uppercase shadow-[0_0_20px_rgba(239,68,68,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>TRY AGAIN</span>
          </button>

          <button
            id="btn-game-over-home"
            onClick={onHome}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Title</span>
          </button>
        </div>

      </div>
    </div>
  );
};
