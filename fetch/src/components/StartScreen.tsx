import React from 'react';
import { Volume2, VolumeX, Play, Trophy, Sparkles, Mountain, Droplets } from 'lucide-react';
import { LEVELS } from '../data/levels';
import { GameStats } from '../types';

interface StartScreenProps {
  onStartGame: (levelIndex?: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  gameStats: GameStats;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStartGame,
  isMuted,
  onToggleMute,
  gameStats,
}) => {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 sm:p-10 overflow-y-auto bg-[#FDFBF7] text-[#2D3748] select-none">
      {/* Mountain Illustrated Sky Backdrop in Clean Geometric Vector Style */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
        {/* Mountain Silhouettes */}
        <svg
          className="absolute bottom-0 w-full h-72 text-[#E2E8F0]"
          viewBox="0 0 1200 400"
          preserveAspectRatio="none"
          fill="currentColor"
        >
          {/* Back peak */}
          <polygon points="0,400 300,120 600,400" fill="#CBD5E1" opacity="0.6" />
          <polygon points="400,400 750,80 1100,400" fill="#CBD5E1" opacity="0.6" />
          <polygon points="200,400 500,160 800,400" fill="#E2E8F0" />
          <polygon points="650,400 950,140 1200,400" fill="#E2E8F0" />
          {/* Forefront mountain range */}
          <polygon points="-50,400 250,220 550,400" fill="#F1F3F0" />
          <polygon points="450,400 800,200 1150,400" fill="#F1F3F0" />
        </svg>
      </div>

      {/* Top Bar with Audio & Records */}
      <div className="relative z-10 w-full max-w-2xl flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-bold text-[#708090] bg-white px-3.5 py-1.5 rounded-full border border-[#E2E8F0] shadow-xs">
          <Mountain className="w-3.5 h-3.5 text-[#2F4F4F]" />
          <span>3 MOUNTAIN EXPEDITIONS</span>
        </div>

        <button
          id="hero-sound-toggle"
          onClick={onToggleMute}
          className="flex items-center gap-2 text-xs font-bold px-3.5 py-1.5 rounded-full bg-white hover:bg-[#F1F3F0] border border-[#E2E8F0] text-[#2D3748] transition-colors cursor-pointer shadow-xs"
        >
          {isMuted ? (
            <>
              <VolumeX className="w-3.5 h-3.5 text-[#A0AEC0]" />
              <span>Sound: Off</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-[#00BFFF]" />
              <span>Sound: On</span>
            </>
          )}
        </button>
      </div>

      {/* Hero Centerpiece */}
      <div className="relative z-10 my-auto flex flex-col items-center text-center max-w-xl py-6">
        {/* Animated Character Carrying Leaking Bucket */}
        <div className="relative mb-5 flex flex-col items-center">
          <div className="relative w-28 h-28 flex items-center justify-center animate-subtle-float">
            {/* Mountaineer Illustration (Geometric Balance) */}
            <svg viewBox="0 0 100 100" className="w-24 h-24 drop-shadow-md">
              {/* Shadow */}
              <ellipse cx="50" cy="90" rx="28" ry="7" fill="rgba(45,55,72,0.15)" />
              {/* Legs */}
              <rect x="42" y="65" width="7" height="18" rx="2" fill="#2D3748" />
              <rect x="52" y="65" width="7" height="18" rx="2" fill="#2D3748" />
              <rect x="40" y="80" width="10" height="6" rx="2" fill="#8B4513" />
              <rect x="52" y="80" width="10" height="6" rx="2" fill="#8B4513" />
              {/* Dark Slate Teal Parka */}
              <rect x="36" y="40" width="28" height="28" rx="4" fill="#2F4F4F" />
              <rect x="42" y="44" width="16" height="20" rx="2" fill="#233D3D" />
              {/* Beanie Head */}
              <circle cx="50" cy="30" r="14" fill="#D97706" />
              <circle cx="50" cy="14" r="4" fill="#FFFFFF" />
              <circle cx="50" cy="34" r="10" fill="#FED7AA" />
              {/* Leaking Wooden Bucket */}
              <g transform="translate(68, 52)">
                <rect x="-6" y="-8" width="12" height="16" rx="2" fill="#8B4513" stroke="#708090" strokeWidth="1" />
                {/* Water level in bucket */}
                <rect x="-4" y="-2" width="8" height="9" rx="1" fill="#00BFFF" />
                {/* Bucket handle */}
                <path d="M-5,-8 A5,5 0 0,1 5,-8" fill="none" stroke="#708090" strokeWidth="1.5" />
              </g>
            </svg>

            {/* Leaking Animated Water Drops */}
            <div className="absolute right-3 top-16 flex flex-col items-center">
              <span className="text-[#00BFFF] text-base animate-water-drip">💧</span>
            </div>
          </div>
        </div>

        {/* Title & Tagline */}
        <h1 className="font-display font-black text-6xl sm:text-7xl tracking-tighter text-[#2F4F4F] mb-1">
          FETCH
        </h1>
        <p className="text-[#00BFFF] font-bold text-lg sm:text-xl tracking-wide mb-2">
          “Every drop counts.”
        </p>
        <p className="text-[#708090] text-sm sm:text-base italic max-w-md mb-8">
          Carry the water. Beat the mountain.
        </p>

        {/* Start Game Action Button */}
        <button
          id="start-game-btn"
          onClick={() => onStartGame(0)}
          className="group relative inline-flex items-center gap-3 px-9 py-4 rounded-xl bg-[#2F4F4F] hover:bg-[#233D3D] text-white font-bold text-lg tracking-wider shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer mb-6"
        >
          <Play className="w-5 h-5 fill-current" />
          <span>START GAME</span>
          <Sparkles className="w-4 h-4 text-[#00BFFF] group-hover:scale-125 transition-transform" />
        </button>

        {/* Instruction Banner */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl px-5 py-3.5 text-xs sm:text-sm text-[#2D3748] max-w-md text-center shadow-xs">
          <div className="flex items-center justify-center gap-1.5 text-[#00BFFF] font-bold mb-1">
            <Droplets className="w-4 h-4" />
            <span>Core Objective</span>
          </div>
          <p className="text-[#708090]">
            Get the water from the spring to the village before the bucket runs dry.
          </p>
        </div>
      </div>

      {/* Bottom Level Select & High Score Summary */}
      <div className="relative z-10 w-full max-w-2xl bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3 text-xs font-bold text-[#708090] uppercase tracking-wider">
          <span>Expedition Stages</span>
          {gameStats.totalScore > 0 && (
            <div className="flex items-center gap-1 text-[#2F4F4F] font-mono-num font-bold">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span>TOTAL SCORE: {gameStats.totalScore}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {LEVELS.map((lvl, index) => {
            const best = gameStats.bestScores[lvl.id];
            return (
              <button
                key={lvl.id}
                onClick={() => onStartGame(index)}
                className="flex flex-col text-left p-3.5 rounded-xl bg-[#FDFBF7] hover:bg-[#F1F3F0] border border-[#E2E8F0] hover:border-[#708090] transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#2F4F4F]">
                    Level {lvl.id}
                  </span>
                  {best && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 font-mono-num font-bold">
                      {best.score} pts
                    </span>
                  )}
                </div>
                <span className="text-sm font-bold text-[#2D3748] group-hover:text-[#2F4F4F]">
                  {lvl.name.replace(/Level \d+ — /, '')}
                </span>
                <span className="text-[11px] text-[#708090] mt-0.5 line-clamp-1">
                  {best ? `${best.rating} (${best.waterRemaining}%)` : lvl.subtitle}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
