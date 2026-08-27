import React from 'react';
import { Sparkles, Trophy, RotateCcw, Home, Star } from 'lucide-react';
import { GameState } from '../types';

interface VictoryModalProps {
  state: GameState;
  onPlayAgain: () => void;
  onHome: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ state, onPlayAgain, onHome }) => {
  return (
    <div id="victory-modal" className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-gradient-to-b from-stone-900 via-amber-950/90 to-stone-900 rounded-3xl border-2 border-amber-400/50 p-6 sm:p-8 text-stone-100 shadow-2xl text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Shimmering Top Glow */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-24 bg-amber-400/30 blur-3xl rounded-full pointer-events-none" />

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-300 text-xs font-black uppercase tracking-widest mb-3">
          <Trophy className="w-3.5 h-3.5" />
          <span>FARM HERO</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-sky-300 mb-2">
          YOU SAVED THE FARM!
        </h2>

        <p className="text-amber-200/90 text-sm sm:text-base font-medium max-w-md mx-auto mb-6">
          The drought has broken! Lush crops are blooming in full radiance, the sunflowers are cheering, and the harvest is saved!
        </p>

        {/* 3 Golden Stars */}
        <div className="flex justify-center gap-3 mb-6">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className="p-3 rounded-2xl bg-amber-500/20 border-2 border-amber-400/60 text-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.6)] animate-bounce"
              style={{ animationDelay: `${s * 150}ms` }}
            >
              <Star className="w-8 h-8 fill-amber-400 text-amber-300" />
            </div>
          ))}
        </div>

        {/* Final Score Banner */}
        <div className="bg-stone-950/70 p-4 rounded-2xl border border-amber-500/30 mb-6 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-amber-300/80 block mb-1">
            Grand Champion Score
          </span>
          <span className="text-3xl sm:text-4xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400">
            {state.score} <span className="text-base text-amber-400">PTS</span>
          </span>
        </div>

        {/* Actions */}
        <div className="space-y-2.5">
          <button
            id="btn-victory-play-again"
            onClick={onPlayAgain}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-black text-base tracking-wide uppercase shadow-[0_0_25px_rgba(245,158,11,0.5)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-5 h-5 fill-stone-950" />
            <span>PLAY AGAIN</span>
          </button>

          <button
            id="btn-victory-home"
            onClick={onHome}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Title</span>
          </button>
        </div>

      </div>
    </div>
  );
};
