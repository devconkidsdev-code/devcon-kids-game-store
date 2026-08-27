import React, { useState } from 'react';
import { X, Star, Lock, CheckCircle2, ChevronRight, Trophy } from 'lucide-react';
import { CHAPTERS, LEVELS } from '../data/levels';
import { LevelProgress } from '../types';

interface LevelSelectModalProps {
  progressList: LevelProgress[];
  currentLevel: number;
  onSelectLevel: (lvl: number) => void;
  onClose: () => void;
}

export const LevelSelectModal: React.FC<LevelSelectModalProps> = ({
  progressList,
  currentLevel,
  onSelectLevel,
  onClose,
}) => {
  const [selectedChapter, setSelectedChapter] = useState<number>(
    Math.ceil(currentLevel / 6)
  );

  const currentChapterObj = CHAPTERS.find((c) => c.id === selectedChapter) || CHAPTERS[0];
  const chapterLevels = LEVELS.filter((l) => l.chapter === selectedChapter);

  // Total stars calculated across all levels
  const totalStarsEarned = progressList.reduce((acc, p) => acc + (p.stars || 0), 0);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 select-none animate-fadeIn">
      <div className="bg-stone-900 border-2 border-stone-700 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl text-white">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-800 flex items-center justify-between bg-stone-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center text-xl shadow-md">
              🌱
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-amber-200">
                Garden Level Map (1 - 30)
              </h2>
              <div className="flex items-center gap-2 text-xs text-stone-400">
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {totalStarsEarned} / 90 Stars
                </span>
                <span>•</span>
                <span>Select a stage to play</span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-800 rounded-xl text-stone-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Chapter Tabs */}
        <div className="flex overflow-x-auto p-2.5 gap-2 bg-stone-950/40 border-b border-stone-800 scrollbar-none">
          {CHAPTERS.map((chap) => {
            const isSelected = chap.id === selectedChapter;
            const isUnlocked = chap.levels.some((lvlNum) => {
              const p = progressList.find((x) => x.level === lvlNum);
              return p?.unlocked;
            });

            return (
              <button
                key={chap.id}
                onClick={() => setSelectedChapter(chap.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-700/30'
                    : isUnlocked
                    ? 'bg-stone-800/80 hover:bg-stone-700 text-stone-300'
                    : 'bg-stone-900/50 text-stone-600 opacity-60'
                }`}
              >
                <span>{chap.badge}</span>
                <span>Ch. {chap.id}</span>
                {!isUnlocked && <Lock className="w-3 h-3 text-stone-500" />}
              </button>
            );
          })}
        </div>

        {/* Chapter Header Banner */}
        <div className="px-5 py-3 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 border-b border-stone-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              Chapter {currentChapterObj.id}
            </span>
            <h3 className="text-sm sm:text-base font-bold text-stone-100">
              {currentChapterObj.name}
            </h3>
          </div>
          <span className="text-2xl">{currentChapterObj.badge}</span>
        </div>

        {/* Level Cards Grid */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {chapterLevels.map((lvl) => {
            const progress = progressList.find((p) => p.level === lvl.levelNumber) || {
              level: lvl.levelNumber,
              unlocked: lvl.levelNumber === 1,
              stars: 0,
              highScore: 0,
              completed: false,
            };

            const isCurrent = lvl.levelNumber === currentLevel;

            return (
              <div
                key={lvl.levelNumber}
                onClick={() => {
                  if (progress.unlocked) {
                    onSelectLevel(lvl.levelNumber);
                    onClose();
                  }
                }}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between relative ${
                  progress.unlocked
                    ? 'cursor-pointer bg-stone-800/90 border-stone-700 hover:border-emerald-500 hover:scale-[1.02] shadow-md'
                    : 'bg-stone-950/60 border-stone-900 opacity-50 cursor-not-allowed'
                } ${isCurrent ? 'ring-2 ring-amber-400 border-amber-400 shadow-amber-400/20' : ''}`}
              >
                {/* Level Title & Badges */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="text-[11px] font-black text-emerald-400 uppercase">
                      Level {lvl.levelNumber}
                    </span>
                    <h4 className="text-sm font-bold text-white leading-snug">
                      {lvl.title}
                    </h4>
                  </div>

                  {progress.unlocked ? (
                    progress.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <span className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-ping" />
                    )
                  ) : (
                    <Lock className="w-4 h-4 text-stone-500" />
                  )}
                </div>

                {/* Level Description */}
                <p className="text-[11px] text-stone-400 line-clamp-2 mb-3">
                  {lvl.description}
                </p>

                {/* Bottom Stats: Stars & High Score */}
                <div className="pt-2 border-t border-stone-700/60 flex items-center justify-between text-xs">
                  {/* 3-Star Rating */}
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3].map((starIdx) => (
                      <Star
                        key={starIdx}
                        className={`w-4 h-4 ${
                          starIdx <= progress.stars
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-stone-600'
                        }`}
                      />
                    ))}
                  </div>

                  {/* High Score */}
                  {progress.highScore > 0 ? (
                    <div className="flex items-center gap-1 text-[11px] text-amber-300 font-bold">
                      <Trophy className="w-3 h-3" />
                      <span>{progress.highScore}</span>
                    </div>
                  ) : (
                    <span className="text-[10px] text-stone-500 font-medium">
                      {lvl.gridRows}x{lvl.gridCols} Plots
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-950/80 border-t border-stone-800 flex items-center justify-between text-xs text-stone-400">
          <span>Complete levels with 3 stars to unlock master badges!</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-colors active:scale-95"
          >
            Close Map
          </button>
        </div>
      </div>
    </div>
  );
};
