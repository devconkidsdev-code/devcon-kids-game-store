import React, { useEffect } from 'react';
import { RotateCcw, Trophy, AlertTriangle, DropletOff, Clock, HeartCrack } from 'lucide-react';
import { soundFX } from '../utils/audio';
import { GameStats } from '../types';

interface GameOverModalProps {
  stats: GameStats;
  highScore: number;
  reason: 'lives' | 'time' | 'water';
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  highScore,
  reason,
  onRestart,
}) => {
  useEffect(() => {
    soundFX.playGameOver();
  }, []);

  const isNewHighScore = stats.score >= highScore && stats.score > 0;

  let reasonTitle = 'Out of Lives!';
  let reasonIcon = <HeartCrack className="w-8 h-8 text-rose-400 animate-bounce" />;
  let reasonDesc = 'Too many watering mistakes or overwatered saturated crops.';

  if (reason === 'time') {
    reasonTitle = "Time's Up!";
    reasonIcon = <Clock className="w-8 h-8 text-amber-300 animate-pulse" />;
    reasonDesc = "The level timer ran out before reaching the required harvest score.";
  } else if (reason === 'water') {
    reasonTitle = 'Water Reservoir Depleted!';
    reasonIcon = <DropletOff className="w-8 h-8 text-cyan-300 animate-bounce" />;
    reasonDesc = 'Your smart watering device ran out of water before completing the harvest.';
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fade-in select-none">
      {/* Frosted Glass Dialog Container */}
      <div className="w-full max-w-md bg-white/15 backdrop-blur-2xl border border-white/30 rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 text-center text-white shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative overflow-hidden">
        
        {/* Decorative Top Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-400 to-rose-500" />

        {/* Reason Icon & Header */}
        <div className="flex flex-col items-center mt-1 mb-3">
          <div className="w-16 h-16 rounded-full bg-white/15 border border-white/30 flex items-center justify-center mb-2 shadow-inner backdrop-blur-md">
            {reasonIcon}
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-rose-300 tracking-tight drop-shadow-md">
            GAME OVER
          </h2>
          <span className="text-base font-black text-white mt-1">{reasonTitle}</span>
          <p className="text-xs text-white/80 max-w-xs mt-1">{reasonDesc}</p>
        </div>

        {/* New High Score Banner */}
        {isNewHighScore && (
          <div className="bg-yellow-400/25 border border-yellow-300/60 rounded-2xl py-2 px-4 mb-4 text-yellow-300 font-black text-sm animate-pulse flex items-center justify-center gap-2 backdrop-blur-md shadow-sm">
            <Trophy className="w-5 h-5 text-yellow-300 fill-yellow-300" />
            <span>🎉 NEW ALL-TIME HIGH SCORE! 🎉</span>
          </div>
        )}

        {/* Results Matrix Frosted Box */}
        <div className="bg-black/35 backdrop-blur-md border border-white/15 rounded-2xl p-4 my-4 space-y-2.5 text-sm text-left shadow-inner">
          <div className="flex justify-between items-center text-white/85">
            <span>Final Score:</span>
            <span className="font-mono font-black text-yellow-300 text-xl">{stats.score} pts</span>
          </div>

          <div className="flex justify-between items-center text-white/85">
            <span>Highest Level Reached:</span>
            <span className="font-mono font-bold text-white">Level {stats.level}</span>
          </div>

          <div className="flex justify-between items-center text-white/85">
            <span>Crops Watered Correctly:</span>
            <span className="font-mono font-bold text-emerald-300">{stats.cropsWateredCorrectly}</span>
          </div>

          <div className="flex justify-between items-center text-white/85">
            <span>Max Combo Streak:</span>
            <span className="font-mono font-bold text-amber-300">x{stats.maxCombo}</span>
          </div>

          <div className="pt-2 border-t border-white/15 flex justify-between items-center text-xs text-white/60">
            <span>All-Time Best High Score:</span>
            <span className="font-mono font-bold text-yellow-300 text-sm">{highScore} pts</span>
          </div>
        </div>

        {/* Play Again Button */}
        <button
          id="play-again-btn"
          onClick={() => {
            soundFX.playClick();
            onRestart();
          }}
          className="w-full py-4 rounded-2xl bg-emerald-500/90 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-black text-xl shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:scale-102 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer border border-emerald-200"
        >
          <RotateCcw className="w-6 h-6" />
          <span>PLAY AGAIN</span>
        </button>
      </div>
    </div>
  );
};
