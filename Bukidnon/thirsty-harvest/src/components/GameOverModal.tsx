import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, RotateCcw, ArrowRight, Map, Store, Frown, Sparkles } from 'lucide-react';
import { LevelConfig } from '../types';

interface GameOverModalProps {
  isVictory: boolean;
  reason?: 'harvest_goal' | 'too_many_dead' | 'time_out';
  score: number;
  coinsEarned: number;
  harvests: number;
  deadCount: number;
  starsEarned: number;
  levelConfig: LevelConfig;
  onReplay: () => void;
  onNextLevel: () => void;
  onOpenLevelSelect: () => void;
  onOpenShop: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isVictory,
  reason,
  score,
  coinsEarned,
  harvests,
  deadCount,
  starsEarned,
  levelConfig,
  onReplay,
  onNextLevel,
  onOpenLevelSelect,
  onOpenShop,
}) => {
  useEffect(() => {
    if (isVictory) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [isVictory]);

  const hasNextLevel = levelConfig.levelNumber < 30;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fadeIn">
      <div className="bg-stone-900 border-2 border-stone-700 rounded-3xl w-full max-w-md p-6 flex flex-col items-center text-center shadow-2xl text-white relative overflow-hidden">
        
        {/* Ambient Top Glow */}
        <div
          className={`absolute -top-16 inset-x-0 h-32 blur-3xl opacity-40 ${
            isVictory ? 'bg-emerald-500' : 'bg-red-600'
          }`}
        />

        {/* Icon / Avatar Banner */}
        <div
          className={`w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mb-4 shadow-xl border-2 ${
            isVictory
              ? 'bg-gradient-to-br from-emerald-500 to-green-700 border-emerald-400'
              : 'bg-gradient-to-br from-red-600 to-rose-900 border-red-400'
          }`}
        >
          {isVictory ? '🏆' : '🥀'}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black mb-1">
          {isVictory ? (
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
              Level {levelConfig.levelNumber} Cleared!
            </span>
          ) : (
            <span className="text-red-400">Harvest Failed!</span>
          )}
        </h2>

        {/* Description / Failure Cause */}
        <p className="text-xs sm:text-sm text-stone-300 mb-4 max-w-xs">
          {isVictory ? (
            <span>Bountiful harvest! All crop quotas met while keeping your plots watered.</span>
          ) : reason === 'too_many_dead' ? (
            <span>
              <b className="text-red-400">{deadCount} crops withered and shrank to dead twigs!</b> Plants must be watered regularly to prevent shrinking.
            </span>
          ) : (
            <span>Time ran out before you could harvest enough crops! Upgrade boots or can for speed.</span>
          )}
        </p>

        {/* Stars (If Victory) */}
        {isVictory && (
          <div className="flex items-center gap-2 mb-5">
            {[1, 2, 3].map((starIdx) => (
              <div
                key={starIdx}
                className={`p-2 rounded-2xl border transition-all transform ${
                  starIdx <= starsEarned
                    ? 'bg-amber-500/20 border-amber-400 scale-110 shadow-lg shadow-amber-500/30'
                    : 'bg-stone-800 border-stone-700 opacity-40'
                }`}
              >
                <Star
                  className={`w-7 h-7 ${
                    starIdx <= starsEarned ? 'text-amber-400 fill-amber-400' : 'text-stone-600'
                  }`}
                />
              </div>
            ))}
          </div>
        )}

        {/* Stats Grid */}
        <div className="w-full bg-stone-950/70 border border-stone-800 rounded-2xl p-3.5 mb-5 grid grid-cols-3 gap-2 text-xs">
          <div className="flex flex-col items-center">
            <span className="text-stone-400 text-[10px]">Harvested</span>
            <span className="font-black text-amber-200 text-sm mt-0.5">
              🧺 {harvests}/{levelConfig.targetHarvests}
            </span>
          </div>
          <div className="flex flex-col items-center border-x border-stone-800">
            <span className="text-stone-400 text-[10px]">Withered</span>
            <span
              className={`font-black text-sm mt-0.5 ${
                deadCount === 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              🥀 {deadCount}
            </span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-stone-400 text-[10px]">Coins</span>
            <span className="font-black text-amber-300 text-sm mt-0.5">
              🪙 +{coinsEarned}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          {isVictory && hasNextLevel ? (
            <button
              onClick={onNextLevel}
              className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-stone-950 font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/40 active:scale-98 transition-all"
            >
              <span>Next Level ({levelConfig.levelNumber + 1})</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={onReplay}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 font-black text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-600/30 active:scale-98 transition-all"
            >
              <RotateCcw className="w-5 h-5" />
              <span>{isVictory ? 'Play Again' : 'Try Again'}</span>
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onOpenLevelSelect}
              className="py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-stone-700"
            >
              <Map className="w-4 h-4 text-emerald-400" />
              <span>Level Map</span>
            </button>

            <button
              onClick={onOpenShop}
              className="py-2.5 bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors border border-stone-700"
            >
              <Store className="w-4 h-4 text-amber-400" />
              <span>Shop Shed</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
