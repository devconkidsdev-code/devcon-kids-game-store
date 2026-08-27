import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, ArrowRight, Droplets, CheckCircle } from 'lucide-react';
import { soundFX } from '../utils/audio';
import { LevelConfig } from '../types';

interface LevelCompleteModalProps {
  level: number;
  score: number;
  waterRemaining: number;
  nextLevelConfig: LevelConfig;
  onNextLevel: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  level,
  score,
  waterRemaining,
  nextLevelConfig,
  onNextLevel,
}) => {
  useEffect(() => {
    soundFX.playLevelComplete();
    // Confetti effect
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4ade80', '#38bdf8', '#facc15', '#a7f3d0', '#ffffff'],
      });
    } catch {
      // Confetti fallback
    }
  }, []);

  const waterBonus = Math.round(waterRemaining * 0.5);
  const totalWithBonus = score + waterBonus;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in select-none">
      {/* Frosted Glass Dialog Container */}
      <div className="w-full max-w-md bg-white/15 backdrop-blur-2xl border border-white/30 rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 text-center text-white shadow-[0_20px_60px_rgba(0,0,0,0.5)] relative overflow-hidden">
        
        {/* Decorative Top Glow Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-400 via-cyan-400 to-yellow-300" />

        {/* Victory Header Badge */}
        <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-emerald-300 border border-white/30 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-2 shadow-sm">
          <CheckCircle className="w-4 h-4 text-emerald-300" />
          <span>HARVEST SUCCESS!</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-white drop-shadow-md">
          LEVEL {level} COMPLETE!
        </h2>
        <p className="text-xs sm:text-sm text-white/85 mt-1 font-medium">
          Great water conservation! The Bukidnon crops are flourishing.
        </p>

        {/* 3 Glowing Frosted Stars Rating */}
        <div className="flex items-center justify-center gap-3 my-4">
          <Star className="w-8 h-8 text-yellow-300 fill-yellow-300 drop-shadow-[0_0_12px_rgba(250,204,21,0.8)] animate-bounce" />
          <Star className="w-10 h-10 text-yellow-300 fill-yellow-300 drop-shadow-[0_0_15px_rgba(250,204,21,0.9)] animate-bounce delay-100" />
          <Star className="w-8 h-8 text-yellow-300 fill-yellow-300 drop-shadow-[0_0_12px_rgba(250,204,21,0.8)] animate-bounce delay-200" />
        </div>

        {/* Score & Bonus Breakdown Frosted Box */}
        <div className="bg-black/35 backdrop-blur-md border border-white/15 rounded-2xl p-4 my-4 space-y-2 text-sm text-left shadow-inner">
          <div className="flex justify-between items-center text-white/80">
            <span>Crop Harvest Score:</span>
            <span className="font-mono font-black text-white text-base">{score} pts</span>
          </div>

          <div className="flex justify-between items-center text-cyan-200">
            <span className="flex items-center gap-1">
              <Droplets className="w-4 h-4 text-cyan-300" />
              <span>Water Conserved Bonus:</span>
            </span>
            <span className="font-mono font-bold text-cyan-300">+{waterBonus} pts ({Math.round(waterRemaining)}L)</span>
          </div>

          <div className="pt-2 border-t border-white/15 flex justify-between items-center font-black text-base sm:text-lg text-yellow-300">
            <span>Total Points:</span>
            <span className="font-mono text-yellow-300 text-xl sm:text-2xl drop-shadow-xs">{totalWithBonus} pts</span>
          </div>
        </div>

        {/* Next Level Difficulty Preview */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2.5 my-3 text-xs text-white/90">
          <span className="font-black text-emerald-300 block">Up Next: Level {nextLevelConfig.level} ({nextLevelConfig.name})</span>
          <span className="text-white/75">{nextLevelConfig.cropCount} Crop Plots • Target: {nextLevelConfig.targetScore} Pts • Timer: {nextLevelConfig.timeLimit}s</span>
        </div>

        {/* Continue Button */}
        <button
          id="next-level-btn"
          onClick={() => {
            soundFX.playClick();
            onNextLevel();
          }}
          className="w-full py-3.5 rounded-2xl bg-emerald-500/90 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-black text-lg shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-200"
        >
          <span>CONTINUE TO LEVEL {nextLevelConfig.level}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
