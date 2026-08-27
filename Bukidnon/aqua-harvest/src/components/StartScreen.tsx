import React from 'react';
import { Play, Droplets, Trophy } from 'lucide-react';
import { soundFX } from '../utils/audio';

interface StartScreenProps {
  onStartGame: () => void;
  highScore: number;
  highestLevel: number;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStartGame,
  highScore,
  highestLevel,
}) => {
  const handleStart = () => {
    soundFX.playClick();
    onStartGame();
  };

  return (
    <div className="relative z-30 flex flex-col items-center justify-center min-h-[85vh] px-4 py-6 text-white max-w-2xl mx-auto">
      {/* Frosted Glass Title Card Container */}
      <div className="w-full bg-white/15 backdrop-blur-2xl rounded-[32px] sm:rounded-[40px] border border-white/30 shadow-[0_16px_48px_rgba(0,0,0,0.35)] p-6 sm:p-10 text-center relative overflow-hidden">
        
        {/* Decorative Frosted Top Glow Strip */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-400 via-emerald-300 to-yellow-300 opacity-80" />

        {/* Game Title & Badging */}
        <div className="flex flex-col items-center mt-1 mb-3">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md text-emerald-200 border border-white/30 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-3 shadow-sm">
            <span>🌿</span>
            <span>Bukidnon Highland Farming Arcade</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            AQUA HARVEST
          </h1>
          <p className="text-xs sm:text-sm text-white/85 mt-2 font-medium max-w-md drop-shadow-xs">
            Help the young Bukidnon farmer use smart precision watering to nourish crops and conserve water!
          </p>
        </div>

        {/* Farmer & Device Hero Graphic */}
        <div className="my-4 flex items-center justify-center">
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-white/20 backdrop-blur-xl p-2 shadow-[0_0_35px_rgba(255,255,255,0.3)] border border-white/40 flex items-center justify-center">
            {/* Farmer emoji/graphic avatar */}
            <span className="text-6xl sm:text-7xl drop-shadow-lg animate-bounce">
              👨‍🌾
            </span>
            <div className="absolute -bottom-2 -right-2 bg-cyan-500/90 text-white p-2 rounded-full border-2 border-white/80 shadow-lg animate-pulse backdrop-blur-md">
              <Droplets className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Core Rules & Cheat Sheet - Frosted Glass Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4 text-left text-xs sm:text-sm">
          <div className="bg-emerald-950/30 backdrop-blur-md border border-emerald-400/40 rounded-2xl p-3.5 flex items-start gap-3 shadow-inner">
            <span className="text-2xl">🌱</span>
            <div>
              <span className="font-black text-emerald-300 block">Water DRY Crops (+1 Pt)</span>
              <p className="text-white/80 text-xs mt-0.5">
                Look for yellow alert bubbles. Water dry crops to score points and build combos!
              </p>
            </div>
          </div>

          <div className="bg-rose-950/30 backdrop-blur-md border border-rose-400/40 rounded-2xl p-3.5 flex items-start gap-3 shadow-inner">
            <span className="text-2xl">⚠️</span>
            <div>
              <span className="font-black text-rose-300 block">Avoid WET Crops (-1 Life)</span>
              <p className="text-white/80 text-xs mt-0.5">
                Spraying saturated crops over-waters soil and causes a life penalty!
              </p>
            </div>
          </div>
        </div>

        {/* Controls Info Banner */}
        <div className="bg-black/35 backdrop-blur-md border border-white/20 rounded-2xl p-3 my-3 text-xs sm:text-sm text-white/90 flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <span className="bg-white/25 text-white font-black px-2 py-1 rounded-lg text-xs border border-white/30">← / →</span>
            <span>or <strong className="text-yellow-300">A / D</strong>: Move Farmer</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-cyan-500/50 text-cyan-100 font-black px-2.5 py-1 rounded-lg text-xs border border-cyan-300/50">SPACEBAR</span>
            <span>: Smart Spray</span>
          </div>
        </div>

        {/* High Score / Best Stats */}
        {highScore > 0 && (
          <div className="inline-flex items-center gap-4 bg-white/15 backdrop-blur-md border border-yellow-300/40 px-4 py-1.5 rounded-full text-xs font-bold text-yellow-300 mb-4 shadow-sm">
            <span className="flex items-center gap-1">
              <Trophy className="w-4 h-4 text-yellow-300" />
              <span>High Score: <strong>{highScore}</strong></span>
            </span>
            <span>•</span>
            <span>Best Level: <strong>Lv.{highestLevel}</strong></span>
          </div>
        )}

        {/* Play Action Button - Glowing Frosted Green Button */}
        <div>
          <button
            id="start-game-btn"
            onClick={handleStart}
            className="w-full sm:w-auto px-8 sm:px-12 py-4 rounded-2xl bg-emerald-500/90 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-black text-xl sm:text-2xl shadow-[0_0_30px_rgba(16,185,129,0.6)] hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 mx-auto border border-emerald-200 cursor-pointer"
          >
            <Play className="w-6 h-6 fill-slate-950" />
            <span>START FARMING</span>
          </button>
        </div>
      </div>
    </div>
  );
};
