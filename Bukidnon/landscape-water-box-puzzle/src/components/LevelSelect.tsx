import React, { useState } from 'react';
import { LevelDefinition, LevelProgress } from '../types';
import { LEVELS } from '../data/levels';
import { Star, Lock, Trophy, Compass, CheckCircle2, Unlock } from 'lucide-react';

interface LevelSelectProps {
  currentLevelId: number;
  progress: Record<number, LevelProgress>;
  onSelectLevel: (levelId: number) => void;
  onClose: () => void;
  onUnlockAll?: () => void;
}

export const LevelSelect: React.FC<LevelSelectProps> = ({
  currentLevelId,
  progress,
  onSelectLevel,
  onClose,
  onUnlockAll,
}) => {
  const [selectedBiome, setSelectedBiome] = useState<'all' | 'meadow' | 'canyon' | 'bamboo' | 'highlands' | 'sanctuary'>('all');

  const biomes = [
    { id: 'all', name: 'All Levels (1-40)', icon: '🌍' },
    { id: 'meadow', name: '1. Sunny Meadow (1-8)', icon: '🌱' },
    { id: 'canyon', name: '2. Stone Canyon (9-16)', icon: '🏜️' },
    { id: 'bamboo', name: '3. Bamboo Grove (17-24)', icon: '🎋' },
    { id: 'highlands', name: '4. Mystic Highlands (25-32)', icon: '⛰️' },
    { id: 'sanctuary', name: '5. Zen Sanctuary (33-40)', icon: '🪷' },
  ] as const;

  const progressList = Object.values(progress) as LevelProgress[];
  const totalStars = progressList.reduce((acc, curr) => acc + (curr.stars || 0), 0);
  const totalCompleted = progressList.filter(p => p.completed).length;

  const filteredLevels = selectedBiome === 'all'
    ? LEVELS
    : LEVELS.filter(lvl => lvl.biome === selectedBiome);

  return (
    <div id="level-select-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white border-4 border-emerald-100 rounded-3xl p-6 sm:p-7 flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-emerald-100 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-200 shrink-0">
              <Compass className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-emerald-800 flex items-center gap-2">
                Landscape Expeditions
                <span className="text-xs px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full font-mono font-bold">
                  40 Levels
                </span>
              </h2>
              <p className="text-xs text-slate-500 font-medium">Choose a puzzle challenge across the 5 scenic biomes</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Star Counter */}
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-2xl shadow-xs">
              <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
              <span className="text-sm font-black text-amber-800">
                {totalStars} / 120
              </span>
            </div>

            {/* Completed Counter */}
            <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-2xl shadow-xs">
              <Trophy className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-black text-emerald-800">
                {totalCompleted} / 40
              </span>
            </div>

            <button
              id="close-level-select-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200 flex items-center justify-center transition-colors font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Biome Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-thin">
          {biomes.map(b => (
            <button
              key={b.id}
              id={`filter-biome-${b.id}`}
              onClick={() => setSelectedBiome(b.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border-2 ${
                selectedBiome === b.id
                  ? 'bg-emerald-500 border-emerald-600 text-white shadow-sm'
                  : 'bg-emerald-50/70 border-emerald-100 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              <span>{b.icon}</span>
              <span>{b.name}</span>
            </button>
          ))}
        </div>

        {/* Level Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 p-1">
            {filteredLevels.map(lvl => {
              const lvlProgress = progress[lvl.id];
              const isUnlocked = lvlProgress?.unlocked;
              const isCompleted = lvlProgress?.completed;
              const stars = lvlProgress?.stars || 0;
              const isCurrent = lvl.id === currentLevelId;

              return (
                <div
                  key={lvl.id}
                  id={`level-card-${lvl.id}`}
                  onClick={() => {
                    if (isUnlocked) {
                      onSelectLevel(lvl.id);
                      onClose();
                    }
                  }}
                  className={`relative p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between h-32 ${
                    isCurrent
                      ? 'bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-300'
                      : isUnlocked
                      ? 'bg-white hover:bg-emerald-50/50 border-emerald-100 hover:border-emerald-300 cursor-pointer shadow-xs hover:scale-[1.02]'
                      : 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-black px-2 py-0.5 rounded-lg ${
                        isCurrent
                          ? 'bg-emerald-600 text-white'
                          : isCompleted
                          ? 'bg-blue-500 text-white'
                          : isUnlocked
                          ? 'bg-slate-200 text-slate-800'
                          : 'bg-slate-300 text-slate-500'
                      }`}
                    >
                      #{lvl.id}
                    </span>

                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : !isUnlocked ? (
                      <Lock className="w-4 h-4 text-slate-400" />
                    ) : null}
                  </div>

                  <div>
                    <h3 className="text-xs font-black text-slate-800 line-clamp-1">
                      {lvl.name}
                    </h3>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {lvl.biome} • {lvl.parMoves} par
                    </span>
                  </div>

                  {/* Stars Display */}
                  <div className="flex items-center gap-1 pt-1 border-t border-slate-100">
                    {[1, 2, 3].map(s => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= stars
                            ? 'fill-amber-400 text-amber-500'
                            : 'fill-slate-200 text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer actions inside modal */}
        <div className="flex items-center justify-between pt-4 mt-2 border-t-2 border-emerald-100">
          {onUnlockAll && (
            <button
              id="unlock-all-levels-btn"
              onClick={onUnlockAll}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1.5 hover:underline"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Unlock All 40 Levels (Sandbox Mode)</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="ml-auto px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-xs"
          >
            Close Map
          </button>
        </div>
      </div>
    </div>
  );
};
