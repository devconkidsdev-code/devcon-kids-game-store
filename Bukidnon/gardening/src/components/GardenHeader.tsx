import React from 'react';
import { 
  Store, 
  FlaskConical, 
  Truck, 
  BookOpen, 
  Wrench, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Sparkles,
  Trophy
} from 'lucide-react';
import { WeatherType } from '../types';
import { WeatherWidget } from './WeatherWidget';

interface GardenHeaderProps {
  coins: number;
  xp: number;
  level: number;
  xpForNextLevel: number;
  xpCurrentLevelProgress: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenShop: () => void;
  onOpenLab: () => void;
  onOpenOrders: () => void;
  onOpenCompendium: () => void;
  onOpenUpgrades: () => void;
  onResetGame: () => void;
  weather: WeatherType;
  weatherTimeRemaining: number;
  onCycleWeather: () => void;
  activeOrdersCount: number;
}

export const GardenHeader: React.FC<GardenHeaderProps> = ({
  coins,
  xp,
  level,
  xpForNextLevel,
  xpCurrentLevelProgress,
  soundEnabled,
  onToggleSound,
  onOpenShop,
  onOpenLab,
  onOpenOrders,
  onOpenCompendium,
  onOpenUpgrades,
  onResetGame,
  weather,
  weatherTimeRemaining,
  onCycleWeather,
  activeOrdersCount,
}) => {
  const xpPercent = Math.min(100, Math.max(0, (xpCurrentLevelProgress / xpForNextLevel) * 100));

  return (
    <header className="w-full bg-emerald-950/80 border-b border-emerald-800/40 backdrop-blur-md sticky top-0 z-40 px-3 sm:px-6 py-2.5 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Brand & Level Progress */}
        <div className="flex items-center justify-between w-full md:w-auto gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-600 flex items-center justify-center text-xl shadow-inner border border-emerald-400/40">
              🌱
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                Gardening
              </h1>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-emerald-300">Level {level}</span>
                {/* XP Bar */}
                <div className="w-20 sm:w-28 h-2 bg-stone-800 rounded-full overflow-hidden border border-stone-700/60">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-sky-400 rounded-full transition-all duration-300"
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
                <span className="text-[9px] text-stone-400 font-mono">
                  {xpCurrentLevelProgress}/{xpForNextLevel} XP
                </span>
              </div>
            </div>
          </div>

          {/* Weather Widget */}
          <div className="hidden sm:block">
            <WeatherWidget
              weather={weather}
              timeRemaining={weatherTimeRemaining}
              onCycleWeather={onCycleWeather}
            />
          </div>
        </div>

        {/* Currency & Navigation Action Hub */}
        <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-2 flex-wrap sm:flex-nowrap">
          {/* Weather on mobile */}
          <div className="block sm:hidden">
            <WeatherWidget
              weather={weather}
              timeRemaining={weatherTimeRemaining}
              onCycleWeather={onCycleWeather}
            />
          </div>

          {/* Coins Display */}
          <div
            id="player-coins-badge"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-950/70 border border-amber-500/40 rounded-2xl shadow-sm"
          >
            <span className="text-sm">🪙</span>
            <span className="text-sm font-black text-amber-300 tracking-wide">
              {coins.toLocaleString()}
            </span>
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center gap-1.5">
            {/* Seed Shop */}
            <button
              id="header-nav-shop-btn"
              onClick={onOpenShop}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-900/40 hover:bg-emerald-800/60 text-emerald-200 border border-emerald-700/40 rounded-xl text-xs font-bold transition-all cursor-pointer hover:text-white"
            >
              <Store className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Shop</span>
            </button>

            {/* Exotic Lab */}
            <button
              id="header-nav-lab-btn"
              onClick={onOpenLab}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-fuchsia-950/40 hover:bg-fuchsia-900/60 text-fuchsia-200 border border-fuchsia-700/40 rounded-xl text-xs font-bold transition-all cursor-pointer hover:text-white"
            >
              <FlaskConical className="w-3.5 h-3.5 text-fuchsia-400" />
              <span className="hidden sm:inline">Exotics</span>
            </button>

            {/* Market Orders */}
            <button
              id="header-nav-orders-btn"
              onClick={onOpenOrders}
              className="relative flex items-center gap-1 px-2.5 py-1.5 bg-amber-950/40 hover:bg-amber-900/60 text-amber-200 border border-amber-700/40 rounded-xl text-xs font-bold transition-all cursor-pointer hover:text-white"
            >
              <Truck className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Orders</span>
              {activeOrdersCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-stone-950 rounded-full text-[9px] font-black flex items-center justify-center">
                  {activeOrdersCount}
                </span>
              )}
            </button>

            {/* Compendium */}
            <button
              id="header-nav-compendium-btn"
              onClick={onOpenCompendium}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-stone-900/60 hover:bg-stone-800/80 text-stone-200 border border-stone-700/50 rounded-xl text-xs font-bold transition-all cursor-pointer hover:text-white"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Journal</span>
            </button>

            {/* Upgrades */}
            <button
              id="header-nav-upgrades-btn"
              onClick={onOpenUpgrades}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-sky-950/40 hover:bg-sky-900/60 text-sky-200 border border-sky-700/40 rounded-xl text-xs font-bold transition-all cursor-pointer hover:text-white"
            >
              <Wrench className="w-3.5 h-3.5 text-sky-400" />
              <span className="hidden sm:inline">Workshop</span>
            </button>

            {/* Audio Toggle */}
            <button
              id="header-sound-toggle-btn"
              onClick={onToggleSound}
              title={soundEnabled ? 'Mute Sound' : 'Enable Sound'}
              className="w-8 h-8 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-stone-500" />}
            </button>

            {/* Reset Game */}
            <button
              id="header-reset-btn"
              onClick={onResetGame}
              title="Reset Garden Progress"
              className="w-8 h-8 rounded-xl bg-stone-800 hover:bg-rose-950/80 hover:border-rose-700 text-stone-400 hover:text-rose-300 flex items-center justify-center transition-all cursor-pointer border border-transparent"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
