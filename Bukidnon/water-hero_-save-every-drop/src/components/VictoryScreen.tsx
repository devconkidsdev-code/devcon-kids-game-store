import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Droplets, Trophy, Heart, Sparkles, Home, ShieldCheck } from 'lucide-react';
import { WaterHeroAvatar } from './WaterHeroAvatar';
import { soundManager } from '../utils/audio';

interface Props {
  totalScore: number;
  totalCleanDrops: number;
  onPlayAgain: () => void;
  onGoHome: () => void;
}

export const VictoryScreen: React.FC<Props> = ({
  totalScore,
  totalCleanDrops,
  onPlayAgain,
  onGoHome,
}) => {
  useEffect(() => {
    soundManager.playVictory();

    // Trigger celebratory confetti cannon bursts
    const count = 200;
    const defaults = {
      origin: { y: 0.7 },
      colors: ['#2563eb', '#38bdf8', '#22c55e', '#facc15', '#ef4444'],
    };

    function fire(particleRatio: number, opts: confetti.Options) {
      confetti({
        ...defaults,
        ...opts,
        particleCount: Math.floor(count * particleRatio),
      });
    }

    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 flex flex-col items-center justify-center text-center select-none" id="victory-screen">
      
      {/* Celebrating Avatar */}
      <div className="relative mb-3 animate-float">
        <WaterHeroAvatar size={120} mood="celebrating" />
      </div>

      {/* Main Victory Title */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-500 border-2 border-green-600 rounded-full text-xs sm:text-sm font-black text-white uppercase tracking-widest mb-3 shadow-md">
        <Sparkles className="w-4 h-4 text-yellow-300" />
        <span>GRAND VICTORY • 100 LEVELS COMPLETED!</span>
      </div>

      <h1 className="text-4xl sm:text-6xl font-black text-blue-600 font-heading tracking-tight drop-shadow-[0_4px_0_rgba(29,78,216,0.25)] uppercase">
        COMMUNITY SAVED!
      </h1>

      {/* Core Message mandated by prompt */}
      <div className="my-5 max-w-xl bg-white border-4 border-blue-600 rounded-3xl p-6 shadow-lg">
        <p className="text-base sm:text-xl text-blue-900 font-black leading-relaxed">
          You delivered enough clean water to the community!
        </p>
        <p className="text-xl sm:text-2xl font-black text-amber-500 font-heading mt-2 tracking-wide">
          “Every drop counts. Use water wisely.”
        </p>

        {/* Flourishing Village Visual Summary */}
        <div className="mt-4 pt-4 border-t-2 border-blue-100 flex items-center justify-around text-xs sm:text-sm text-slate-800">
          <div className="flex flex-col items-center">
            <span className="text-3xl mb-1">🏡</span>
            <span className="font-black text-blue-900">Reservoir Full</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl mb-1">🌱</span>
            <span className="font-black text-emerald-600">Crops Flourishing</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl mb-1">💧</span>
            <span className="font-black text-blue-600">Clean Water Secured</span>
          </div>
        </div>
      </div>

      {/* Final Stats Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-md mb-8">
        <div className="bg-white border-3 border-blue-600 p-3 rounded-2xl shadow-sm">
          <span className="text-2xl block mb-1">💧</span>
          <span className="text-[10px] text-blue-900 uppercase font-black block">Clean Drops</span>
          <span className="text-lg font-black text-blue-600">{totalCleanDrops}</span>
        </div>

        <div className="bg-white border-3 border-blue-600 p-3 rounded-2xl shadow-sm">
          <span className="text-2xl block mb-1">🏆</span>
          <span className="text-[10px] text-blue-900 uppercase font-black block">Final Score</span>
          <span className="text-lg font-black text-amber-600">{totalScore.toLocaleString()}</span>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white border-3 border-blue-600 p-3 rounded-2xl shadow-sm">
          <span className="text-2xl block mb-1">⭐</span>
          <span className="text-[10px] text-blue-900 uppercase font-black block">Rank</span>
          <span className="text-lg font-black text-emerald-600">Water Hero</span>
        </div>
      </div>

      {/* Play Again & Home Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md">
        <button
          id="btn-play-again-victory"
          onClick={onPlayAgain}
          className="w-full flex-1 flex items-center justify-center gap-2 py-4 bg-green-500 hover:bg-green-400 text-white font-black text-lg rounded-2xl border-b-6 border-green-700 shadow-xl active:translate-y-0.5 active:border-b-2 transition-all cursor-pointer uppercase"
        >
          <RotateCcw className="w-6 h-6" />
          <span>PLAY AGAIN</span>
        </button>

        <button
          id="btn-home-victory"
          onClick={onGoHome}
          className="w-full sm:w-auto px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-base rounded-2xl border-b-6 border-blue-800 shadow-xl active:translate-y-0.5 active:border-b-2 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase"
        >
          <Home className="w-5 h-5" />
          <span>MAIN MENU</span>
        </button>
      </div>

    </div>
  );
};
