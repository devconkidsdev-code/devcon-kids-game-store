import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Star, Lock, Play, CheckCircle2, ChevronRight, Filter } from 'lucide-react';
import { ALL_LEVELS } from '../data/levelsData';
import { UserProgress } from '../types/game';
import { soundManager } from '../utils/audio';

interface LevelMapProps {
  progress: UserProgress;
  onSelectLevel: (levelId: number) => void;
  onBackToVillage: () => void;
}

const CHAPTER_INFO = [
  { id: 1, title: 'Chapter 1: The Day the Tank Dropped', range: [1, 10], color: 'from-sky-500 to-blue-600', icon: '💧' },
  { id: 2, title: 'Chapter 2: The Great Kitchen & Bathroom Chaos', range: [11, 20], color: 'from-blue-500 to-indigo-600', icon: '🛁' },
  { id: 3, title: 'Chapter 3: The Cow Who Drank Too Much', range: [21, 30], color: 'from-amber-500 to-orange-600', icon: '🐮' },
  { id: 4, title: 'Chapter 4: The Underground Pipe Mystery', range: [31, 40], color: 'from-stone-500 to-slate-700', icon: '🔧' },
  { id: 5, title: 'Chapter 5: Muddy River, Clean Solutions', range: [41, 50], color: 'from-teal-500 to-emerald-600', icon: '🐟' },
  { id: 6, title: 'Chapter 6: The Great Farm Drought', range: [51, 60], color: 'from-lime-500 to-green-600', icon: '🌾' },
  { id: 7, title: 'Chapter 7: Catching the Sky Water', range: [61, 70], color: 'from-cyan-500 to-blue-600', icon: '🌧️' },
  { id: 8, title: 'Chapter 8: The Big City Water Rush', range: [71, 80], color: 'from-violet-500 to-purple-600', icon: '🏙️' },
  { id: 9, title: 'Chapter 9: The Village Water Festival', range: [81, 90], color: 'from-pink-500 to-rose-600', icon: '🎪' },
  { id: 10, title: 'Chapter 10: The Last Drop & The Rainmaker', range: [91, 100], color: 'from-amber-600 to-sky-700', icon: '🏆' },
];

export const LevelMap: React.FC<LevelMapProps> = ({
  progress,
  onSelectLevel,
  onBackToVillage,
}) => {
  const [selectedChapter, setSelectedChapter] = useState(
    Math.min(10, Math.max(1, Math.ceil(progress.currentLevel / 10)))
  );

  const currentChapterData = CHAPTER_INFO.find((c) => c.id === selectedChapter) || CHAPTER_INFO[0];
  const [startLvl, endLvl] = currentChapterData.range;
  const chapterLevels = ALL_LEVELS.filter((lvl) => lvl.id >= startLvl && lvl.id <= endLvl);

  const handleSelect = (levelId: number) => {
    if (levelId <= progress.unlockedLevels) {
      soundManager.playClick();
      onSelectLevel(levelId);
    } else {
      soundManager.playPanic();
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-3 sm:p-6 flex flex-col gap-5">
      {/* Top Map Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white/90 backdrop-blur-md p-4 rounded-3xl border border-sky-100 shadow-sm">
        <div>
          <span className="text-xs font-black uppercase text-sky-600 tracking-wider">
            100-Level Adventure Map
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800">
            Select Your Conservation Mission
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-black text-slate-600 bg-slate-100 px-3 py-1.5 rounded-2xl">
            🌟 {progress.starsEarned} / 300 Stars
          </span>
          <span className="text-xs font-black text-sky-700 bg-sky-50 px-3 py-1.5 rounded-2xl border border-sky-200">
            💧 {progress.unlockedLevels} / 100 Levels Unlocked
          </span>
        </div>
      </div>

      {/* Chapter Selection Horizontal Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CHAPTER_INFO.map((chap) => {
          const isUnlocked = progress.unlockedLevels >= chap.range[0];
          const isSelected = chap.id === selectedChapter;

          return (
            <button
              key={chap.id}
              onClick={() => {
                soundManager.playClick();
                setSelectedChapter(chap.id);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-black shrink-0 transition-all cursor-pointer border ${
                isSelected
                  ? 'bg-sky-600 text-white border-sky-700 shadow-md scale-105'
                  : isUnlocked
                  ? 'bg-white text-slate-700 border-slate-200 hover:bg-sky-50'
                  : 'bg-slate-100 text-slate-400 border-slate-200 opacity-60'
              }`}
            >
              <span>{chap.icon}</span>
              <span>Ch. {chap.id}</span>
              {!isUnlocked && <Lock className="w-3 h-3 text-slate-400" />}
            </button>
          );
        })}
      </div>

      {/* Chapter Overview Card */}
      <div className={`p-5 rounded-3xl bg-gradient-to-r ${currentChapterData.color} text-white shadow-md flex items-center justify-between`}>
        <div>
          <span className="text-xs uppercase font-extrabold text-sky-200 tracking-wider">
            Levels {startLvl} to {endLvl}
          </span>
          <h2 className="text-lg sm:text-xl font-black mt-0.5">{currentChapterData.title}</h2>
        </div>
        <span className="text-4xl">{currentChapterData.icon}</span>
      </div>

      {/* 10-Level Chapter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {chapterLevels.map((lvl) => {
          const isUnlocked = lvl.id <= progress.unlockedLevels;
          const stars = progress.levelStars[lvl.id] || 0;
          const isCurrent = lvl.id === progress.currentLevel;

          return (
            <motion.button
              key={lvl.id}
              whileHover={isUnlocked ? { scale: 1.03 } : {}}
              whileTap={isUnlocked ? { scale: 0.97 } : {}}
              onClick={() => handleSelect(lvl.id)}
              className={`p-4 rounded-3xl border-2 text-left flex flex-col justify-between h-44 transition-all cursor-pointer relative overflow-hidden ${
                isCurrent
                  ? 'bg-white border-sky-500 shadow-lg ring-4 ring-sky-200'
                  : isUnlocked
                  ? 'bg-white border-slate-200 hover:border-sky-300 shadow-xs'
                  : 'bg-slate-50 border-slate-200 opacity-50 cursor-not-allowed'
              }`}
            >
              {/* Top Row: Level number & Status */}
              <div className="flex items-center justify-between">
                <span
                  className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black ${
                    isCurrent
                      ? 'bg-sky-500 text-white'
                      : isUnlocked
                      ? 'bg-slate-100 text-slate-800'
                      : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {lvl.id}
                </span>

                {/* Stars or Lock */}
                {isUnlocked ? (
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= stars
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-200 fill-slate-100'
                        }`}
                      />
                    ))}
                  </div>
                ) : (
                  <Lock className="w-4 h-4 text-slate-400" />
                )}
              </div>

              {/* Title and Objective */}
              <div className="my-1">
                <h4 className="text-xs font-black text-slate-800 line-clamp-1">{lvl.title}</h4>
                <p className="text-[10px] text-slate-500 line-clamp-2 mt-1">{lvl.objectiveText}</p>
              </div>

              {/* Bottom Action / Difficulty */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                  {lvl.type.replace('_', ' ')}
                </span>

                {isUnlocked && (
                  <span className="text-xs font-black text-sky-600 flex items-center gap-0.5">
                    <Play className="w-3 h-3 fill-sky-600" />
                    <span>Play</span>
                  </span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
