import React from 'react';
import { motion } from 'motion/react';
import { Play, Map, Home, BookOpen, ShoppingBag, Flame, Trophy, Settings, Sparkles } from 'lucide-react';
import { BloopAvatar } from './BloopAvatar';
import { UserProgress } from '../types/game';
import { soundManager } from '../utils/audio';

interface MainMenuProps {
  progress: UserProgress;
  onStartAdventure: () => void;
  onOpenMap: () => void;
  onOpenVillage: () => void;
  onOpenJournal: () => void;
  onOpenWardrobe: () => void;
  onOpenChallenges: () => void;
  onOpenAchievements: () => void;
  onOpenSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  progress,
  onStartAdventure,
  onOpenMap,
  onOpenVillage,
  onOpenJournal,
  onOpenWardrobe,
  onOpenChallenges,
  onOpenAchievements,
  onOpenSettings,
}) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-between p-4 sm:p-8 bg-gradient-to-b from-sky-100 via-cyan-50 to-emerald-100 relative overflow-hidden">
      {/* Floating Animated Background Clouds and Droplets */}
      <div className="absolute top-10 left-10 text-4xl opacity-50 animate-pulse pointer-events-none">☁️</div>
      <div className="absolute top-16 right-16 text-5xl opacity-40 animate-pulse pointer-events-none">☁️</div>
      <div className="absolute bottom-24 left-20 text-3xl opacity-60 pointer-events-none">🌿</div>
      <div className="absolute bottom-20 right-28 text-3xl opacity-60 pointer-events-none">🌸</div>

      {/* Top Bar for Quick Settings */}
      <div className="w-full max-w-4xl flex items-center justify-between z-10">
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-sky-100 shadow-xs">
          <span className="text-xs font-black text-sky-700">💧 Splashville Guardian</span>
          <span className="text-xs font-bold text-slate-500">• Level {progress.currentLevel}</span>
        </div>

        <button
          onClick={() => {
            soundManager.playClick();
            onOpenSettings();
          }}
          className="p-2.5 bg-white/80 hover:bg-white text-slate-700 rounded-full border border-sky-100 shadow-xs cursor-pointer transition hover:scale-105"
        >
          <Settings className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      {/* Main Title & Hero Banner */}
      <div className="flex flex-col items-center text-center my-auto z-10 max-w-xl">
        {/* Animated Bloop Hero Mascot */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="mb-2"
        >
          <BloopAvatar
            expression="happy"
            size={110}
            hat={progress.equippedCosmetics?.hat}
            backpack={progress.equippedCosmetics?.backpack}
            outfit={progress.equippedCosmetics?.outfit}
            accessory={progress.equippedCosmetics?.accessory}
          />
        </motion.div>

        {/* Title Badges */}
        <span className="text-xs sm:text-sm font-black uppercase tracking-widest text-sky-600 bg-sky-100/90 px-4 py-1 rounded-full border border-sky-200 shadow-xs mb-1">
          The Great Water Panic
        </span>

        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 drop-shadow-xs">
          DROP IT!
        </h1>

        <p className="text-xs sm:text-sm font-bold text-slate-600 max-w-md mt-2 leading-relaxed">
          The comedy-adventure puzzle game where you fix wacky leaks, save Splashville’s Big Blue Tank, outsmart drought, and learn real water science!
        </p>

        {/* Primary Play Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            soundManager.playClick();
            onStartAdventure();
          }}
          className="mt-6 px-8 py-4 bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-black text-base sm:text-lg rounded-3xl shadow-xl shadow-sky-500/25 flex items-center gap-3 cursor-pointer transition border-2 border-white/60"
        >
          <Play className="w-6 h-6 fill-white" />
          <span>{progress.unlockedLevels > 1 ? `Continue Level ${progress.currentLevel}` : 'Start Adventure!'}</span>
        </motion.button>

        {/* Secondary Navigation Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full mt-6">
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenVillage();
            }}
            className="p-3 bg-white/90 hover:bg-white text-slate-800 font-extrabold text-xs rounded-2xl border border-sky-100 shadow-xs flex items-center justify-center gap-2 cursor-pointer transition hover:scale-103"
          >
            <Home className="w-4 h-4 text-emerald-600" />
            <span>Village Hub</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenMap();
            }}
            className="p-3 bg-white/90 hover:bg-white text-slate-800 font-extrabold text-xs rounded-2xl border border-sky-100 shadow-xs flex items-center justify-center gap-2 cursor-pointer transition hover:scale-103"
          >
            <Map className="w-4 h-4 text-sky-600" />
            <span>100 Levels Map</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenJournal();
            }}
            className="p-3 bg-white/90 hover:bg-white text-slate-800 font-extrabold text-xs rounded-2xl border border-sky-100 shadow-xs flex items-center justify-center gap-2 cursor-pointer transition hover:scale-103"
          >
            <BookOpen className="w-4 h-4 text-amber-600" />
            <span>Water Journal</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenWardrobe();
            }}
            className="p-3 bg-white/90 hover:bg-white text-slate-800 font-extrabold text-xs rounded-2xl border border-sky-100 shadow-xs flex items-center justify-center gap-2 cursor-pointer transition hover:scale-103"
          >
            <ShoppingBag className="w-4 h-4 text-purple-600" />
            <span>Wardrobe</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenChallenges();
            }}
            className="p-3 bg-white/90 hover:bg-white text-slate-800 font-extrabold text-xs rounded-2xl border border-sky-100 shadow-xs flex items-center justify-center gap-2 cursor-pointer transition hover:scale-103"
          >
            <Flame className="w-4 h-4 text-rose-600" />
            <span>Challenges</span>
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              onOpenAchievements();
            }}
            className="p-3 bg-white/90 hover:bg-white text-slate-800 font-extrabold text-xs rounded-2xl border border-sky-100 shadow-xs flex items-center justify-center gap-2 cursor-pointer transition hover:scale-103"
          >
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Honors</span>
          </button>
        </div>
      </div>

      {/* Footer message */}
      <div className="z-10 text-center mt-4">
        <p className="text-[11px] font-extrabold text-slate-500 flex items-center justify-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          <span>Remember: Every Single Drop Counts!</span>
        </p>
      </div>
    </div>
  );
};
