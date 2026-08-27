import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowRight, CheckCircle2, Star, Clock, Zap, Heart, Compass } from 'lucide-react';
import { GameStats } from '../types';
import { ROUNDS_CONFIG } from '../game/constants';

interface RoundClearedModalProps {
  round: number;
  totalRounds: number;
  stats: GameStats;
  onNextRound: () => void;
}

export const RoundClearedModal: React.FC<RoundClearedModalProps> = ({
  round,
  totalRounds,
  stats,
  onNextRound,
}) => {
  const currentConfig = ROUNDS_CONFIG[round - 1] || ROUNDS_CONFIG[0];
  const nextConfig = ROUNDS_CONFIG[round] || null;

  useEffect(() => {
    // Quick burst confetti for round clear
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#38bdf8', '#34d399', '#facc15', '#a855f7'],
    });
  }, [round]);

  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-30 animate-in fade-in zoom-in-95 duration-300 text-white">
      <div className="max-w-md w-full bg-black/60 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-5 text-center relative overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute -top-20 inset-x-0 h-40 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Checkmark badge */}
        <div className="mx-auto w-16 h-16 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <CheckCircle2 className="w-9 h-9 text-slate-950" />
        </div>

        {/* Round Cleared Title */}
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-mono font-bold tracking-widest text-emerald-400 uppercase">
            {currentConfig.title} • {currentConfig.subtitle}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black italic tracking-tighter text-white drop-shadow">
            ROUND {round} CLEARED!
          </h2>
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

        {/* Round Performance Stats */}
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

        {/* Up Next Preview */}
        {nextConfig && (
          <div className="bg-blue-950/40 border border-blue-500/30 rounded-2xl p-3 flex items-center justify-between text-left">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center">
                <Compass className="w-4 h-4 text-blue-300" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wider text-blue-300 font-semibold">
                  Up Next: Round {round + 1} of {totalRounds}
                </div>
                <div className="text-sm font-bold text-white">
                  {nextConfig.title}
                </div>
              </div>
            </div>
            <span className="text-xs font-medium text-white/60">
              {nextConfig.subtitle}
            </span>
          </div>
        )}

        {/* Continue Button */}
        <button
          onClick={onNextRound}
          className="w-full py-3.5 bg-white hover:bg-slate-100 text-black font-black text-sm uppercase tracking-wider rounded-full shadow-2xl flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
        >
          <span>{nextConfig ? `Proceed to Round ${round + 1}` : 'Claim Final Victory'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
