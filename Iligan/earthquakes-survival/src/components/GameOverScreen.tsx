import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Award,
  RotateCcw,
  Trophy,
} from 'lucide-react';

interface GameOverScreenProps {
  score: number; // People saved
  onRestartGame: () => void;
  highScore: number;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  score,
  onRestartGame,
  highScore,
}) => {
  const isNewHighScore = score > highScore && score > 0;

  useEffect(() => {
    if (score > 0) {
      // Fire celebratory confetti for rescued survivors
      try {
        confetti({
          particleCount: Math.min(150, 40 + score * 8),
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#22c55e', '#ea580c', '#facc15', '#ef4444', '#3b82f6'],
        });
      } catch {
        // safe
      }
    }
  }, [score]);

  // Determine rescuer rank
  const getRank = (savedCount: number) => {
    if (savedCount >= 25) return { title: 'DISASTER RESCUE LEGEND', desc: 'Incredible heroism! Saved an entire district!', color: 'text-amber-400' };
    if (savedCount >= 18) return { title: 'CHIEF FIRST RESPONDER', desc: 'Master driver! Exceptional evacuation speed!', color: 'text-emerald-400' };
    if (savedCount >= 10) return { title: 'HERO RESCUE PARAMEDIC', desc: 'Great bravery during chaotic aftershocks!', color: 'text-sky-400' };
    if (savedCount >= 5) return { title: 'EMERGENCY CADET', desc: 'Good effort, multiple lives brought to safety.', color: 'text-orange-400' };
    return { title: 'ROOKIE RESPONDER', desc: 'Every life counts. Try navigating faster next time!', color: 'text-gray-300' };
  };

  const rank = getRank(score);

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md select-none">
      <div className="text-center max-w-md w-full p-8 sm:p-10 border-4 border-red-600 bg-[#1a1a1a] rounded-2xl shadow-[0_0_60px_rgba(239,68,68,0.4)] flex flex-col items-center">
        {/* Title */}
        <h2 className="text-4xl sm:text-5xl font-black uppercase text-red-500 mb-2 tracking-tight">
          Mission Over
        </h2>
        <p className="text-gray-400 uppercase tracking-widest text-xs font-semibold mb-6">
          Time has expired
        </p>

        {/* Final Score Box */}
        <div className="w-full bg-white/5 p-6 rounded-xl mb-6 border border-white/5 flex flex-col items-center">
          <p className="text-xs uppercase text-gray-400 font-semibold mb-1 tracking-wider">
            Final Score
          </p>
          <p id="final-score" className="text-6xl font-black text-white font-mono tracking-tight my-1">
            {score}
          </p>
          <p className="text-sm text-green-400 font-bold mt-1">
            Survivors Rescued
          </p>
        </div>

        {/* Rescuer Honor Rank */}
        <div className="w-full bg-white/5 border border-white/5 rounded-xl p-3.5 text-center mb-6 space-y-1">
          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-400">
            <Trophy className="w-4 h-4" />
            <span>HONORARY CITATION</span>
          </div>
          <div className={`text-sm sm:text-base font-black uppercase ${rank.color}`}>
            {rank.title}
          </div>
          <div className="text-xs text-gray-400">
            {rank.desc}
          </div>
        </div>

        {/* High score notice */}
        {isNewHighScore && (
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/50 text-amber-300 text-xs font-bold mb-6 animate-bounce">
            <Award className="w-4 h-4" />
            <span>NEW ALL-TIME RECORD!</span>
          </div>
        )}

        {/* Try Again Button */}
        <button
          onClick={onRestartGame}
          className="w-full py-4 bg-white text-black font-black text-xl uppercase tracking-widest rounded-xl hover:bg-gray-200 active:scale-95 transition-all shadow-xl cursor-pointer flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Try Again</span>
        </button>
      </div>
    </div>
  );
};

