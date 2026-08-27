import React from 'react';
import { Play, Map, Store, Info, Droplets, AlertTriangle, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { FarmerSprite } from './FarmerSprite';

interface StartScreenProps {
  onStartGame: () => void;
  onOpenLevelSelect: () => void;
  onOpenShop: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  highestUnlockedLevel: number;
  totalStars: number;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStartGame,
  onOpenLevelSelect,
  onOpenShop,
  isMuted,
  onToggleMute,
  highestUnlockedLevel,
  totalStars,
}) => {
  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-emerald-900 via-green-900 to-stone-950 flex flex-col items-center justify-between p-4 sm:p-8 select-none overflow-hidden text-white">
      
      {/* Background Decorative Garden Atmosphere */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-10 left-10 text-6xl">🌻</div>
        <div className="absolute top-24 right-16 text-5xl">🥕</div>
        <div className="absolute bottom-20 left-16 text-6xl">🍓</div>
        <div className="absolute bottom-32 right-20 text-6xl">🍉</div>
        <div className="absolute top-1/2 left-1/3 text-4xl">🌱</div>
        <div className="absolute top-1/3 right-1/4 text-5xl">🍅</div>
      </div>

      {/* Top Bar */}
      <div className="w-full max-w-4xl flex items-center justify-between z-10">
        <div className="flex items-center gap-2 bg-stone-900/80 px-3 py-1.5 rounded-2xl border border-stone-700">
          <span className="text-amber-400 font-black text-sm">⭐ {totalStars} Stars</span>
          <span className="text-stone-500">•</span>
          <span className="text-emerald-400 font-bold text-xs">Level {highestUnlockedLevel}/30</span>
        </div>

        <button
          onClick={onToggleMute}
          className="p-2.5 bg-stone-900/80 hover:bg-stone-800 rounded-2xl border border-stone-700 text-stone-300 transition-colors"
        >
          {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
        </button>
      </div>

      {/* Main Title & Hero Character */}
      <div className="flex flex-col items-center text-center max-w-xl z-10 my-auto">
        
        {/* Animated Farmer Hero */}
        <div className="relative mb-2">
          <div className="scale-125 mb-4">
            <FarmerSprite
              facing="right"
              isWalking={true}
              isWatering={false}
              waterLevel={15}
              maxWater={15}
            />
          </div>
          <span className="absolute -bottom-2 -right-4 bg-amber-400 text-stone-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-md animate-bounce">
            30 LEVELS!
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-emerald-300 drop-shadow-md">
          Garden Farmer Quest
        </h1>
        <p className="text-xs sm:text-sm text-emerald-100/90 font-medium mb-6 max-w-md">
          Water thirsty crops to make them bloom. Don’t miss watering or your plants will shrink and wither away!
        </p>

        {/* How To Play Rule Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full text-left mb-6 text-xs">
          <div className="bg-stone-900/80 border border-stone-700 p-3 rounded-2xl">
            <div className="flex items-center gap-1.5 font-bold text-cyan-300 mb-1">
              <Droplets className="w-4 h-4" />
              <span>1. Water Plots</span>
            </div>
            <p className="text-[11px] text-stone-400">
              Walk to crops and water them to keep soil moisture high. Refill at the well when dry!
            </p>
          </div>

          <div className="bg-stone-900/80 border border-stone-700 p-3 rounded-2xl">
            <div className="flex items-center gap-1.5 font-bold text-amber-300 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>2. Prevent Shrinking</span>
            </div>
            <p className="text-[11px] text-stone-400">
              If moisture hits 0%, plants shrink in size and wither! Water quickly to revive them.
            </p>
          </div>

          <div className="bg-stone-900/80 border border-stone-700 p-3 rounded-2xl">
            <div className="flex items-center gap-1.5 font-bold text-emerald-300 mb-1">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>3. Harvest & Beat 30 Lvls</span>
            </div>
            <p className="text-[11px] text-stone-400">
              Harvest ripe crops for coins and unlock all 5 chapters & 30 exciting levels!
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
          <button
            onClick={onStartGame}
            className="w-full sm:flex-1 py-4 bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-400 hover:to-green-400 text-stone-950 font-black text-base rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-emerald-800/50 active:scale-95 transition-all"
          >
            <Play className="w-5 h-5 fill-stone-950" />
            <span>Play Level {highestUnlockedLevel}</span>
          </button>

          <button
            onClick={onOpenLevelSelect}
            className="w-full sm:w-auto px-5 py-4 bg-stone-900 hover:bg-stone-800 text-stone-100 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 border border-stone-700 active:scale-95 transition-all"
          >
            <Map className="w-4 h-4 text-emerald-400" />
            <span>Levels (1-30)</span>
          </button>

          <button
            onClick={onOpenShop}
            className="w-full sm:w-auto px-5 py-4 bg-stone-900 hover:bg-stone-800 text-amber-300 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 border border-stone-700 active:scale-95 transition-all"
          >
            <Store className="w-4 h-4" />
            <span>Shop</span>
          </button>
        </div>

      </div>

      {/* Footer Info */}
      <div className="text-[11px] text-stone-400 z-10 text-center">
        Controls: Arrow Keys / WASD / Mouse Tap / On-Screen Touch Controls • Space to Water
      </div>
    </div>
  );
};
