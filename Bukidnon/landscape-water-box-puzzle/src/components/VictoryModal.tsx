import React, { useEffect } from 'react';
import { LevelDefinition } from '../types';
import { Star, ChevronRight, RotateCcw, ListOrdered, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface VictoryModalProps {
  level: LevelDefinition;
  moveCount: number;
  dewdropsCollected: number;
  totalDewdrops: number;
  onNextLevel: () => void;
  onRestart: () => void;
  onOpenLevelSelect: () => void;
  hasNextLevel: boolean;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  level,
  moveCount,
  dewdropsCollected,
  totalDewdrops,
  onNextLevel,
  onRestart,
  onOpenLevelSelect,
  hasNextLevel,
}) => {
  let stars = 1;
  const underPar = moveCount <= level.parMoves;
  const gotAllDewdrops = totalDewdrops === 0 || dewdropsCollected === totalDewdrops;

  if (underPar && gotAllDewdrops) {
    stars = 3;
  } else if (underPar || gotAllDewdrops) {
    stars = 2;
  }

  useEffect(() => {
    confetti({
      particleCount: 80,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#10B981', '#3B82F6', '#F59E0B', '#06B6D4', '#EC4899'],
    });
  }, []);

  return (
    <div id="victory-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white border-4 border-emerald-200 rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col items-center text-center relative overflow-hidden">
        {/* Glowing backdrop halo */}
        <div className="absolute -top-24 w-72 h-72 bg-emerald-200/50 rounded-full blur-3xl pointer-events-none" />

        {/* Trophy icon */}
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 border-2 border-emerald-200 shadow-xl shadow-emerald-200 flex items-center justify-center mb-3">
          <Trophy className="w-8 h-8 text-white" />
        </div>

        <h2 className="text-2xl font-black text-emerald-800 tracking-tight">
          Garden Blooming!
        </h2>
        <p className="text-xs text-slate-500 mt-1 mb-5">
          Level {level.id}: <span className="text-emerald-700 font-bold">{level.name}</span> Complete
        </p>

        {/* Stars */}
        <div className="flex items-center gap-3 mb-6">
          {[1, 2, 3].map(s => (
            <div
              key={s}
              className={`p-2.5 rounded-2xl border-2 transition-all ${
                s <= stars
                  ? 'bg-amber-50 border-amber-300 shadow-md shadow-amber-100 scale-110'
                  : 'bg-slate-50 border-slate-200 opacity-40'
              }`}
            >
              <Star
                className={`w-8 h-8 ${
                  s <= stars ? 'fill-amber-400 text-amber-500' : 'fill-slate-200 text-slate-300'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Performance metrics card */}
        <div className="w-full bg-emerald-50/80 border-2 border-emerald-100 rounded-2xl p-4 mb-6 flex flex-col gap-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Moves Taken:</span>
            <div className="flex items-center gap-1 font-mono">
              <span className={`font-black text-sm ${underPar ? 'text-emerald-700' : 'text-amber-600'}`}>
                {moveCount}
              </span>
              <span className="text-slate-500">/ {level.parMoves} (Par)</span>
              {underPar && <span className="text-[10px] text-emerald-600 font-black ml-1">★ Par Bonus</span>}
            </div>
          </div>

          {totalDewdrops > 0 && (
            <div className="flex items-center justify-between text-xs pt-2 border-t border-emerald-100">
              <span className="text-slate-600 font-medium">Dewdrops Collected:</span>
              <div className="flex items-center gap-1 font-mono font-bold text-blue-600">
                <span>{dewdropsCollected} / {totalDewdrops}</span>
                {gotAllDewdrops && <span className="text-[10px] text-blue-600 font-black ml-1">★ All Gathered</span>}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          {hasNextLevel ? (
            <button
              id="victory-next-btn"
              onClick={onNextLevel}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <span>Next Expedition</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              id="victory-next-btn"
              onClick={onOpenLevelSelect}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-wider shadow-lg shadow-emerald-200 flex items-center justify-center gap-2"
            >
              <span>All 40 Levels Mastered! View Map</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              id="victory-replay-btn"
              onClick={onRestart}
              className="py-2.5 bg-white hover:bg-slate-50 border-2 border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-4 h-4 text-amber-600" />
              <span>Replay</span>
            </button>

            <button
              id="victory-map-btn"
              onClick={onOpenLevelSelect}
              className="py-2.5 bg-white hover:bg-slate-50 border-2 border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <ListOrdered className="w-4 h-4 text-emerald-600" />
              <span>Level Map</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
