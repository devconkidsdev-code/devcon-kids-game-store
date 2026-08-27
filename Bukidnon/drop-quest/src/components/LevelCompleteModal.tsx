import React from 'react';
import { ArrowRight, Star, Sparkles, Droplets, RotateCcw } from 'lucide-react';
import { GameState } from '../types';

interface LevelCompleteModalProps {
  state: GameState;
  levelName: string;
  onNextLevel: () => void;
  onReplayLevel: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  state,
  levelName,
  onNextLevel,
  onReplayLevel,
}) => {
  // Calculate stars
  const stars = state.timeLeft > 35 && state.lives >= 4 ? 3 : state.timeLeft > 15 && state.lives >= 2 ? 2 : 1;

  return (
    <div id="level-complete-modal" className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div className="w-full max-w-md bg-gradient-to-b from-stone-900 via-emerald-950/90 to-stone-900 rounded-3xl border-2 border-emerald-500/40 p-6 sm:p-8 text-stone-100 shadow-2xl text-center relative overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        {/* Shimmering Top Glow */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-20 bg-emerald-500/30 blur-2xl rounded-full pointer-events-none" />

        {/* Header Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black uppercase tracking-widest mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Stage Cleared!</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 via-green-100 to-teal-200 mb-1">
          FIELD WATERED!
        </h2>
        <p className="text-emerald-300/80 text-sm font-medium mb-5">
          {levelName} has been fully revived!
        </p>

        {/* Stars */}
        <div className="flex justify-center gap-2 mb-6">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`p-2 rounded-2xl border transition-transform ${
                s <= stars
                  ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 scale-110 shadow-[0_0_15px_rgba(251,191,36,0.5)]'
                  : 'bg-stone-900/60 border-stone-800 text-stone-600'
              }`}
            >
              <Star className={`w-7 h-7 ${s <= stars ? 'fill-amber-400 text-amber-300' : ''}`} />
            </div>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-6 bg-stone-950/60 p-4 rounded-2xl border border-emerald-500/20 text-left">
          <div>
            <span className="text-xs text-stone-400 block font-medium">Water Collected</span>
            <span className="text-lg font-black text-sky-400 flex items-center gap-1">
              <Droplets className="w-4 h-4" />
              100%
            </span>
          </div>

          <div>
            <span className="text-xs text-stone-400 block font-medium">Time Left</span>
            <span className="text-lg font-black text-amber-400 font-mono">
              {Math.ceil(state.timeLeft)}s
            </span>
          </div>

          <div>
            <span className="text-xs text-stone-400 block font-medium">Lives Remaining</span>
            <span className="text-lg font-black text-red-400 font-mono">
              {state.lives} / {state.maxLives}
            </span>
          </div>

          <div>
            <span className="text-xs text-stone-400 block font-medium">Total Score</span>
            <span className="text-lg font-black text-emerald-400 font-mono">
              {state.score}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2.5">
          <button
            id="btn-next-level"
            onClick={onNextLevel}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-stone-950 font-black text-base tracking-wide uppercase shadow-[0_0_20px_rgba(16,185,129,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>NEXT STAGE</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            id="btn-replay-level"
            onClick={onReplayLevel}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Replay Stage</span>
          </button>
        </div>

      </div>
    </div>
  );
};
