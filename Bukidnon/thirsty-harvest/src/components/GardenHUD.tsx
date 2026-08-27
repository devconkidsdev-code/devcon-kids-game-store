import React from 'react';
import { Volume2, VolumeX, Pause, Play, Store, Map, Droplets, CloudRain } from 'lucide-react';
import { LevelConfig, Upgrades } from '../types';

interface GardenHUDProps {
  levelConfig: LevelConfig;
  score: number;
  coins: number;
  harvestCount: number;
  deadCount: number;
  timeRemaining: number;
  waterLevel: number;
  maxWater: number;
  upgrades: Upgrades;
  isPaused: boolean;
  isMuted: boolean;
  onTogglePause: () => void;
  onToggleMute: () => void;
  onOpenShop: () => void;
  onOpenLevelSelect: () => void;
  onUseRainCloud: () => void;
}

export const GardenHUD: React.FC<GardenHUDProps> = ({
  levelConfig,
  score,
  coins,
  harvestCount,
  deadCount,
  timeRemaining,
  waterLevel,
  maxWater,
  upgrades,
  isPaused,
  isMuted,
  onTogglePause,
  onToggleMute,
  onOpenShop,
  onOpenLevelSelect,
  onUseRainCloud,
}) => {
  const harvestPercent = Math.min(100, (harvestCount / levelConfig.targetHarvests) * 100);
  const casualtiesLeft = Math.max(0, levelConfig.maxDeadAllowed - deadCount);
  const isTimeCritical = timeRemaining <= 15;

  return (
    <header className="w-full max-w-5xl mx-auto px-2 sm:px-4 py-2 flex flex-col gap-2 z-20">
      {/* Top Main Bar */}
      <div className="bg-stone-900/95 backdrop-blur-md rounded-2xl p-2.5 sm:p-3.5 border border-stone-800 shadow-xl flex flex-wrap items-center justify-between gap-2 text-white">
        
        {/* Left: Level Info & Navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenLevelSelect}
            className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border border-stone-700 active:scale-95"
            title="All 30 Levels Map"
          >
            <Map className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Levels</span>
            <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.2 rounded-md">
              {levelConfig.levelNumber}/30
            </span>
          </button>

          <div>
            <h1 className="text-xs sm:text-sm font-black text-amber-300 flex items-center gap-1 leading-tight">
              <span>{levelConfig.title}</span>
            </h1>
            <p className="text-[10px] sm:text-xs text-stone-400 font-medium">
              Chapter {levelConfig.chapter}: {levelConfig.chapterName}
            </p>
          </div>
        </div>

        {/* Center: Harvest Target & Dead Plant Casualty Limits */}
        <div className="flex items-center gap-3 bg-stone-950/80 px-3 py-1.5 rounded-xl border border-stone-800">
          {/* Harvest Progress */}
          <div className="flex flex-col gap-0.5 min-w-[90px] sm:min-w-[120px]">
            <div className="flex justify-between items-center text-[10px] sm:text-xs font-bold text-amber-200">
              <span className="flex items-center gap-1">
                <span>🧺</span> Harvest
              </span>
              <span>
                {harvestCount} / {levelConfig.targetHarvests}
              </span>
            </div>
            <div className="w-full h-2 bg-stone-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-300"
                style={{ width: `${harvestPercent}%` }}
              />
            </div>
          </div>

          {/* Plant Casualty Warning Tracker */}
          <div className="flex flex-col items-center pl-2 border-l border-stone-800 text-[10px] sm:text-xs">
            <span className="text-stone-400 font-medium text-[9px]">Max Wither Losses</span>
            <div className="flex items-center gap-1 mt-0.5">
              {Array.from({ length: levelConfig.maxDeadAllowed }).map((_, i) => {
                const isLost = i < deadCount;
                return (
                  <span
                    key={i}
                    className={`text-sm ${
                      isLost ? 'opacity-30 grayscale' : 'text-emerald-400 drop-shadow-sm'
                    }`}
                    title={isLost ? 'Plant withering casualty' : 'Safe plant slot'}
                  >
                    {isLost ? '🥀' : '🌱'}
                  </span>
                );
              })}
              <span
                className={`text-[10px] font-bold ml-1 ${
                  casualtiesLeft <= 1 ? 'text-red-400 animate-pulse' : 'text-stone-300'
                }`}
              >
                ({casualtiesLeft} left)
              </span>
            </div>
          </div>
        </div>

        {/* Right: Timer, Coins, Sound & Controls */}
        <div className="flex items-center gap-2">
          {/* Countdown Clock */}
          <div
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-xs sm:text-sm font-black ${
              isTimeCritical
                ? 'bg-red-950/90 text-red-300 border-red-500 animate-pulse'
                : 'bg-stone-950/80 text-amber-100 border-stone-800'
            }`}
          >
            <span>⏳</span>
            <span>{timeRemaining}s</span>
          </div>

          {/* Coins / Score */}
          <div className="hidden md:flex items-center gap-2 text-xs font-bold bg-amber-950/40 border border-amber-800/60 px-2.5 py-1.5 rounded-xl text-amber-300">
            <span>🪙 {coins}</span>
            <span className="text-stone-500">|</span>
            <span className="text-stone-300 font-medium">Pts: {score}</span>
          </div>

          {/* Shop Button */}
          <button
            onClick={onOpenShop}
            className="p-1.5 sm:px-2.5 sm:py-1.5 bg-amber-600 hover:bg-amber-500 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1 transition-all active:scale-95 shadow-md shadow-amber-700/30"
            title="Open Farm Upgrades Shop"
          >
            <Store className="w-4 h-4" />
            <span className="hidden sm:inline">Shop</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl transition-colors border border-stone-700 active:scale-95"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Pause / Resume */}
          <button
            onClick={onTogglePause}
            className="p-1.5 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl transition-colors border border-stone-700 active:scale-95"
            title={isPaused ? 'Resume' : 'Pause'}
          >
            {isPaused ? <Play className="w-4 h-4 text-amber-400" /> : <Pause className="w-4 h-4 text-stone-300" />}
          </button>
        </div>
      </div>

      {/* Sub Bar: Watering Can Gauge & Quick Booster Power-ups */}
      <div className="flex items-center justify-between bg-stone-900/80 px-3 py-1.5 rounded-xl border border-stone-800 text-xs text-stone-300">
        {/* Can Capacity Bar */}
        <div className="flex items-center gap-2 flex-1 max-w-xs">
          <div className="flex items-center gap-1 font-bold text-sky-400 whitespace-nowrap">
            <Droplets className="w-4 h-4" />
            <span>Can:</span>
            <span>{waterLevel}/{maxWater}</span>
          </div>
          <div className="flex-1 h-2 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
            <div
              className={`h-full rounded-full transition-all duration-200 ${
                waterLevel === 0 ? 'bg-red-500 animate-pulse' : 'bg-cyan-400'
              }`}
              style={{ width: `${(waterLevel / maxWater) * 100}%` }}
            />
          </div>
          {waterLevel === 0 && (
            <span className="text-[10px] font-bold text-red-400 bg-red-950/80 px-1.5 py-0.2 rounded-md animate-pulse">
              REFILL AT WELL!
            </span>
          )}
        </div>

        {/* Rain Cloud Booster Item */}
        <div className="flex items-center gap-2">
          {upgrades.rainCloudPowerups > 0 && (
            <button
              onClick={onUseRainCloud}
              className="px-2.5 py-1 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-md animate-pulse active:scale-95"
            >
              <CloudRain className="w-3.5 h-3.5" />
              <span>Rain Cloud ({upgrades.rainCloudPowerups})</span>
            </button>
          )}

          <span className="text-[11px] text-stone-400 hidden sm:inline">
            💧 <b className="text-stone-200">Space / Tap</b> to water plot | Keep moisture above 0% so crops don't shrink!
          </span>
        </div>
      </div>
    </header>
  );
};
