import React from 'react';
import { motion } from 'motion/react';
import { Volume2, VolumeX, Pause, Map, Home, BookOpen } from 'lucide-react';
import { VillageResources } from '../types/game';
import { WaterPanicMeter } from './WaterPanicMeter';
import { soundManager } from '../utils/audio';

interface ResourceHeaderProps {
  resources: VillageResources;
  currentScreen: string;
  onNavigate: (screen: any) => void;
  onOpenPanicModal?: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onPause?: () => void;
}

export const ResourceHeader: React.FC<ResourceHeaderProps> = ({
  resources,
  currentScreen,
  onNavigate,
  onOpenPanicModal,
  soundEnabled,
  onToggleSound,
  onPause,
}) => {
  const waterPercent = Math.min(100, Math.max(0, (resources.cleanWater / resources.maxCapacity) * 100));

  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-sky-100 shadow-xs px-3 sm:px-6 py-2.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand / Home / Map links */}
        <div className="flex items-center gap-2">
          {currentScreen !== 'menu' && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  soundManager.playClick();
                  onNavigate('village');
                }}
                title="Village Hub"
                className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer ${
                  currentScreen === 'village'
                    ? 'bg-sky-500 text-white border-sky-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-sky-50'
                }`}
              >
                <Home className="w-4 h-4" />
                <span className="hidden md:inline">Splashville</span>
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  onNavigate('map');
                }}
                title="Level Map (1-100)"
                className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer ${
                  currentScreen === 'map'
                    ? 'bg-sky-500 text-white border-sky-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-sky-50'
                }`}
              >
                <Map className="w-4 h-4" />
                <span className="hidden md:inline">Level Map</span>
              </button>

              <button
                onClick={() => {
                  soundManager.playClick();
                  onNavigate('journal');
                }}
                title="Guardian Journal"
                className={`p-2 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer ${
                  currentScreen === 'journal'
                    ? 'bg-sky-500 text-white border-sky-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-sky-50'
                }`}
              >
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span className="hidden lg:inline">Journal</span>
              </button>
            </div>
          )}
        </div>

        {/* Center: Vital Water Resource & Countdown to Rain */}
        <div className="flex items-center gap-2 sm:gap-4 flex-wrap justify-center">
          {/* Big Blue Tank Level */}
          <div className="flex items-center gap-2 px-3 py-1 bg-sky-50 border border-sky-200 rounded-2xl">
            <motion.div
              animate={{ y: [0, -2, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-lg"
            >
              💧
            </motion.div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-sky-600 tracking-wider">
                Big Blue Tank
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-xs sm:text-sm font-extrabold text-sky-950">
                  {Math.round(resources.cleanWater).toLocaleString()} L
                </span>
                <span className="text-[10px] text-sky-600 font-medium">
                  / {resources.maxCapacity.toLocaleString()}L
                </span>
              </div>
            </div>
          </div>

          {/* Days until Rain Countdown */}
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 border border-amber-200 rounded-2xl">
            <span className="text-lg">⏳</span>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">
                Days Until Rain
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-amber-950">
                {resources.daysRemaining} {resources.daysRemaining === 1 ? 'Day' : 'Days'}
              </span>
            </div>
          </div>

          {/* Water Panic Meter */}
          <WaterPanicMeter
            waterPercent={waterPercent}
            onClick={onOpenPanicModal}
          />
        </div>

        {/* Right: Eco-Coins & Audio/Settings */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Eco Coins */}
          <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 font-bold text-xs sm:text-sm">
            <span>🪙</span>
            <span>{resources.ecoCoins}</span>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              onToggleSound();
              soundManager.playClick();
            }}
            title={soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-sky-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Pause button if in level */}
          {currentScreen === 'level' && onPause && (
            <button
              onClick={() => {
                soundManager.playClick();
                onPause();
              }}
              title="Pause Game"
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition cursor-pointer"
            >
              <Pause className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
