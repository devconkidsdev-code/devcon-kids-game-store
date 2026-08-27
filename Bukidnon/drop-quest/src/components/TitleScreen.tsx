import React from 'react';
import { Play, Sparkles, Droplets, Heart, Timer, Award } from 'lucide-react';
import { LEVELS } from '../game/levels';

interface TitleScreenProps {
  onStartGame: (levelIndex: number) => void;
  unlockedLevel: number;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStartGame, unlockedLevel }) => {
  return (
    <div id="title-screen" className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div className="w-full max-w-xl bg-gradient-to-b from-amber-950 via-stone-900 to-amber-950 rounded-3xl border-2 border-amber-500/40 p-6 sm:p-8 text-amber-50 shadow-2xl text-center relative overflow-hidden my-auto">
        
        {/* Shimmering Top Accent */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-24 bg-sky-500/20 blur-2xl rounded-full pointer-events-none" />

        {/* Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 border border-sky-400/40 text-sky-300 text-xs font-black uppercase tracking-widest mb-3">
          <Droplets className="w-3.5 h-3.5" />
          <span>2D Platformer Adventure</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-100 to-sky-300 drop-shadow-md mb-2">
          DROP QUEST
        </h1>
        <p className="text-amber-200/80 text-sm sm:text-base font-medium max-w-md mx-auto mb-6">
          The farm is facing a severe drought! Help the farmer gather every scattered water drop to save the dying crops before time runs out.
        </p>

        {/* Controls and Mechanics Box */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-left mb-5 bg-stone-950/60 p-4 rounded-2xl border border-amber-500/20">
          <div className="flex items-start gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 mt-0.5">
              <span className="font-mono font-bold text-xs">A / D</span>
            </div>
            <div>
              <span className="text-xs font-bold text-amber-100 block">Move</span>
              <span className="text-[11px] text-amber-300/70">Left / Right</span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-300 mt-0.5">
              <span className="font-mono font-bold text-xs">W / ↑</span>
            </div>
            <div>
              <span className="text-xs font-bold text-sky-100 block">Jump</span>
              <span className="text-[11px] text-sky-300/70">Platform Arc</span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 mt-0.5">
              <span className="font-mono font-bold text-xs">SPACEBAR</span>
            </div>
            <div>
              <span className="text-xs font-bold text-cyan-100 block">Shoot Blast</span>
              <span className="text-[11px] text-cyan-300/70">Water Blaster</span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="p-1.5 rounded-lg bg-red-500/20 text-red-300 mt-0.5">
              <Heart className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-red-100 block">5 Lives</span>
              <span className="text-[11px] text-red-300/70">Watch hazards</span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 mt-0.5">
              <Timer className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-100 block">60 Seconds</span>
              <span className="text-[11px] text-amber-300/70">Beat the clock</span>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="p-1.5 rounded-lg bg-yellow-500/20 text-yellow-300 mt-0.5">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-bold text-yellow-100 block">Golden Drops</span>
              <span className="text-[11px] text-yellow-300/70">Hydration & Pts</span>
            </div>
          </div>

          {/* Super Mario Question Block & Water Gun highlight */}
          <div className="flex items-start gap-2 col-span-2 sm:col-span-3 bg-cyan-950/40 p-2.5 rounded-xl border border-cyan-500/30">
            <div className="px-2 py-1 rounded-lg bg-amber-400 text-amber-950 font-black text-xs font-mono">
              [?]
            </div>
            <div>
              <span className="text-xs font-bold text-cyan-200 block">Mystery Question Blocks & Water Gun</span>
              <span className="text-[11px] text-cyan-100/80">Bump ? blocks from underneath to grab the Super Water Gun! Extinguish angry spitting sunflowers and weeds with hydro blasts.</span>
            </div>
          </div>
        </div>

        {/* Level Select & Play Button */}
        <div className="space-y-3">
          <button
            id="btn-start-game"
            onClick={() => onStartGame(0)}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-black text-lg tracking-wide uppercase shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:shadow-[0_0_35px_rgba(245,158,11,0.7)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-stone-950" />
            <span>START QUEST</span>
          </button>

          {/* Quick Level Selector */}
          <div className="pt-2 border-t border-amber-500/20">
            <span className="text-xs font-bold text-amber-300/80 uppercase tracking-wider block mb-2">
              Select Stage
            </span>
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
              {LEVELS.map((lvl, idx) => {
                const isUnlocked = idx <= unlockedLevel;
                return (
                  <button
                    key={lvl.id}
                    id={`btn-select-level-${lvl.id}`}
                    disabled={!isUnlocked}
                    onClick={() => onStartGame(idx)}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      isUnlocked
                        ? 'bg-amber-950 hover:bg-amber-800 border border-amber-500/40 text-amber-100 cursor-pointer'
                        : 'bg-stone-900/60 border border-stone-800 text-stone-500 cursor-not-allowed opacity-60'
                    }`}
                  >
                    <Award className="w-3.5 h-3.5" />
                    <span>Lvl {lvl.id}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
