import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, ArrowRight, RotateCcw, Menu, Timer, Zap, Sparkles } from 'lucide-react';
import { LevelConfig, RunStats } from '../types';

interface VictoryModalProps {
  stats: RunStats;
  level: LevelConfig;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onReplay: () => void;
  onMenu: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  stats,
  hasNextLevel,
  onNextLevel,
  onReplay,
  onMenu,
}) => {
  useEffect(() => {
    // Blast victory confetti!
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    const timer = setTimeout(() => {
      confetti({
        particleCount: 50,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
      });
      confetti({
        particleCount: 50,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
      });
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const rankBadgeColors = {
    LEGENDARY: 'bg-amber-400/20 text-amber-300 border-amber-400/50 shadow-[0_0_15px_rgba(245,158,11,0.3)]',
    SPEEDSTER: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/50 shadow-[0_0_15px_rgba(16,185,129,0.3)]',
    PROVINCE_HERO: 'bg-teal-400/20 text-teal-300 border-teal-400/50',
    RUNNER: 'bg-zinc-800 text-zinc-300 border-zinc-700',
  }[stats.rank];

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#050805]/95 border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center shadow-[0_0_50px_rgba(16,185,129,0.3)] relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Glow effects & Watermark */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[350px] h-[200px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="text-[100px] font-black leading-none tracking-tighter text-emerald-500/5 absolute -bottom-6 -right-6 pointer-events-none select-none">
          VICTORY
        </div>

        {/* Victory Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/15 border border-emerald-500/50 backdrop-blur-md rounded-full shadow-[0_0_20px_rgba(16,185,129,0.25)] mb-2.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-400 font-bold">
            SAFE ZONE REACHED!
          </span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black italic tracking-tight text-white drop-shadow-[0_0_25px_rgba(16,185,129,0.5)]">
          PROVINCE <span className="text-emerald-400">VICTORY</span>
        </h2>
        <p className="text-emerald-100/70 text-xs sm:text-sm mt-1.5 leading-relaxed">
          {stats.characterName || 'Alexander'} crossed the finish line in record time and safely reached the Safe Zone!
        </p>

        {/* Rank Banner */}
        <div className={`inline-flex items-center gap-2 border px-4 py-1.5 rounded-full text-xs font-black uppercase my-3.5 ${rankBadgeColors}`}>
          <Trophy className="w-4 h-4 text-amber-400" />
          RANK: {stats.rank.replace('_', ' ')}
        </div>

        {/* Detailed Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5 bg-black/70 border border-emerald-500/30 rounded-2xl p-3.5 text-left shadow-inner">
          <div className="flex flex-col">
            <span className="flex items-center gap-1 text-[9px] text-zinc-400 uppercase font-bold tracking-wider">
              <Timer className="w-3 h-3 text-emerald-400" /> Time Left
            </span>
            <span className="text-base font-black text-white font-mono">{stats.timeRemaining}s</span>
          </div>

          <div className="flex flex-col">
            <span className="flex items-center gap-1 text-[9px] text-zinc-400 uppercase font-bold tracking-wider">
              Vitality
            </span>
            <div className="flex items-center gap-1.5 mt-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rotate-45 ${
                    i < stats.livesLeft
                      ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.9)]'
                      : 'bg-zinc-800 opacity-40'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col">
            <span className="flex items-center gap-1 text-[9px] text-zinc-400 uppercase font-bold tracking-wider">
              <Zap className="w-3 h-3 text-emerald-400" /> Top Speed
            </span>
            <span className="text-base font-black text-emerald-400 font-mono">{stats.topSpeedKmH} km/h</span>
          </div>

          <div className="flex flex-col">
            <span className="flex items-center gap-1 text-[9px] text-zinc-400 uppercase font-bold tracking-wider">
              <Trophy className="w-3 h-3 text-amber-400" /> Total Score
            </span>
            <span className="text-base font-black text-amber-300 font-mono">{stats.score.toLocaleString()}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          {hasNextLevel ? (
            <button
              onClick={onNextLevel}
              className="flex items-center justify-center gap-2 w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black italic tracking-widest text-base uppercase rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all active:scale-[0.98] cursor-pointer"
            >
              NEXT PROVINCE STAGE
              <ArrowRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          ) : (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/50 rounded-2xl text-emerald-300 text-xs font-bold mb-1 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              🏆 ALL PROVINCE STAGES CLEARED! Alexander is the Undisputed Funrun LeGEND!
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onReplay}
              className="flex items-center justify-center gap-1.5 py-3 bg-black/60 hover:bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 text-xs font-bold rounded-2xl transition-all active:scale-95 cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.1)]"
            >
              <RotateCcw className="w-4 h-4 text-emerald-400" />
              REPLAY COURSE
            </button>

            <button
              onClick={onMenu}
              className="flex items-center justify-center gap-1.5 py-3 bg-black/60 hover:bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 text-xs font-bold rounded-2xl transition-all active:scale-95 cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.1)]"
            >
              <Menu className="w-4 h-4 text-emerald-400" />
              MENU
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

