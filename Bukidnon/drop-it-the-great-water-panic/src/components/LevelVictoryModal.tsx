import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { Star, Sparkles, BookOpen, ChevronRight, RotateCcw, Map, Award } from 'lucide-react';
import { LevelData, LevelReplayStats } from '../types/game';
import { BloopAvatar } from './BloopAvatar';
import { soundManager } from '../utils/audio';

interface LevelVictoryModalProps {
  level: LevelData;
  stars: number; // 1, 2, 3
  replayStats: LevelReplayStats;
  onNextLevel: () => void;
  onReplay: () => void;
  onBackToMap: () => void;
  isJournalUnlocked?: boolean;
}

export const LevelVictoryModal: React.FC<LevelVictoryModalProps> = ({
  level,
  stars,
  replayStats,
  onNextLevel,
  onReplay,
  onBackToMap,
  isJournalUnlocked = true,
}) => {
  useEffect(() => {
    soundManager.playVictory();
    // Trigger celebratory confetti burst
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#38bdf8', '#0284c7', '#34d399', '#facc15', '#f472b6'],
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border-4 border-sky-200 text-center relative overflow-hidden"
      >
        {/* Top Decorative Droplets */}
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-20 bg-sky-100/50 rounded-full blur-xl pointer-events-none" />

        {/* Bloop Proud Avatar */}
        <div className="flex justify-center mb-2">
          <BloopAvatar expression="proud" size={72} />
        </div>

        {/* Victory Title */}
        <span className="text-xs font-black uppercase tracking-widest text-sky-600">
          Mission Accomplished!
        </span>
        <h2 className="text-xl sm:text-2xl font-black text-slate-800 mt-0.5">
          {level.title}
        </h2>

        {/* 3-Star Rating Display */}
        <div className="flex items-center justify-center gap-2 my-3">
          {[1, 2, 3].map((starNum) => (
            <motion.div
              key={starNum}
              initial={{ scale: 0, rotate: -30 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.2 + starNum * 0.15, type: 'spring' }}
            >
              <Star
                className={`w-9 h-9 ${
                  starNum <= stars
                    ? 'text-amber-400 fill-amber-400 drop-shadow-md'
                    : 'text-slate-200 fill-slate-100'
                }`}
              />
            </motion.div>
          ))}
        </div>

        {/* Water Waste Replay Summary Box */}
        <div className="my-3 p-3.5 bg-sky-50/80 rounded-2xl border border-sky-100 text-left">
          <h4 className="text-xs font-extrabold uppercase text-sky-800 tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Water Waste Replay Summary
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-white rounded-xl border border-sky-100">
              <span className="text-slate-500 font-medium block">Water Saved:</span>
              <span className="font-extrabold text-sky-700">+{replayStats.waterSaved} Litres</span>
            </div>
            <div className="p-2 bg-white rounded-xl border border-sky-100">
              <span className="text-slate-500 font-medium block">Leaks Repaired:</span>
              <span className="font-extrabold text-emerald-700">{replayStats.leaksRepaired} Fixed</span>
            </div>
            {replayStats.rainwaterCollected > 0 && (
              <div className="p-2 bg-white rounded-xl border border-sky-100">
                <span className="text-slate-500 font-medium block">Rain Harvested:</span>
                <span className="font-extrabold text-blue-700">+{replayStats.rainwaterCollected} L</span>
              </div>
            )}
            {replayStats.cropsSaved > 0 && (
              <div className="p-2 bg-white rounded-xl border border-sky-100">
                <span className="text-slate-500 font-medium block">Crops Hydrated:</span>
                <span className="font-extrabold text-lime-700">{replayStats.cropsSaved} Fields</span>
              </div>
            )}
          </div>
          <p className="text-[11px] italic text-slate-600 mt-2">
            “{replayStats.funnyHighlight}”
          </p>
        </div>

        {/* Educational Guardian Takeaway */}
        <div className="my-3 p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-left flex items-start gap-2.5">
          <BookOpen className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">
              {level.educationalTitle}
            </span>
            <p className="text-xs text-emerald-950 font-medium leading-relaxed mt-0.5">
              {level.educationalLesson}
            </p>
          </div>
        </div>

        {/* Rewards Row */}
        <div className="flex items-center justify-center gap-4 my-3 text-xs font-black">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-xl">
            <span>🪙</span>
            <span>+{level.rewards.ecoCoins} Eco-Coins</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-sky-50 text-sky-900 border border-sky-200 rounded-xl">
            <span>💧</span>
            <span>+{level.rewards.drops} Clean Drops</span>
          </div>
        </div>

        {/* Navigation Action Buttons */}
        <div className="mt-4 flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
          <button
            onClick={onBackToMap}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
          >
            <Map className="w-4 h-4" />
            <span className="hidden sm:inline">Level Map</span>
          </button>

          <button
            onClick={onReplay}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Replay</span>
          </button>

          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={onNextLevel}
            className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <span>Next Level</span>
            <ChevronRight className="w-4 h-4" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};
