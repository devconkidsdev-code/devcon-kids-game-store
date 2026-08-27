import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Trophy, Star, Clock, Zap, Heart } from 'lucide-react';
import { GameStats } from '../types';

interface VictoryModalProps {
  stats: GameStats;
  onRestart: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ stats, onRestart }) => {
  useEffect(() => {
    // Blast celebratory confetti!
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#38bdf8', '#34d399', '#facc15', '#f472b6'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#38bdf8', '#34d399', '#facc15', '#f472b6'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-30 animate-in fade-in zoom-in-95 duration-300 text-white">
      <div className="max-w-md w-full bg-black/50 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-5 text-center relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-20 inset-x-0 h-40 bg-yellow-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Trophy Icon */}
        <div className="mx-auto w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg shadow-yellow-400/30">
          <Trophy className="w-9 h-9 text-black fill-black" />
        </div>

        {/* Victory Headers Required by Prompt */}
        <div className="flex flex-col gap-1">
          <h2 className="text-4xl font-black italic tracking-tighter text-yellow-400 drop-shadow">
            YOU WIN!
          </h2>
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-white/80">
            You successfully escaped the waves!
          </p>
        </div>

        {/* Stars */}
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Star
              key={i}
              className={`w-7 h-7 transition-transform duration-500 ${
                i < stats.starsEarned
                  ? 'text-yellow-400 fill-yellow-400 scale-110 drop-shadow-md'
                  : 'text-white/20 fill-white/10'
              }`}
            />
          ))}
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-3 gap-2 bg-white/5 border border-white/15 p-3.5 rounded-2xl">
          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-white/60 text-[10px] uppercase tracking-wider mb-1">
              <Clock className="w-3 h-3 text-blue-400" /> Time
            </div>
            <span className="text-base font-mono font-bold text-white">
              {stats.timeElapsed.toFixed(1)}s
            </span>
          </div>

          <div className="flex flex-col items-center border-x border-white/15 px-1">
            <div className="flex items-center gap-1 text-white/60 text-[10px] uppercase tracking-wider mb-1">
              <Zap className="w-3 h-3 text-yellow-400" /> Boosts
            </div>
            <span className="text-base font-mono font-bold text-white">
              {stats.boostsUsed}
            </span>
          </div>

          <div className="flex flex-col items-center">
            <div className="flex items-center gap-1 text-white/60 text-[10px] uppercase tracking-wider mb-1">
              <Heart className="w-3 h-3 text-red-400" /> Hits
            </div>
            <span className="text-base font-mono font-bold text-white">
              {stats.damageTaken}
            </span>
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

