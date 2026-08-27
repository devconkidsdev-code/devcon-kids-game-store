import React from 'react';
import { GameEngine } from '../game/GameEngine';
import { Trophy, Star, ArrowRight, RotateCcw, Home, Droplets, Clock, Flame } from 'lucide-react';
import { CAMPAIGN_LEVELS } from '../game/LevelData';

interface VictoryModalProps {
  engine: GameEngine;
  onNextLevel: () => void;
  onRetry: () => void;
  onMenu: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  engine,
  onNextLevel,
  onRetry,
  onMenu
}) => {
  const breakdown = engine.lastScoreBreakdown;
  const isCampaignEnd = engine.mode === 'CAMPAIGN' && engine.currentLevelIndex >= CAMPAIGN_LEVELS.length - 1;

  return (
    <div className="absolute inset-0 z-50 bg-indigo-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-indigo-900/80 border-2 border-pink-500/50 rounded-3xl p-6 md:p-8 shadow-[0_0_60px_rgba(236,72,153,0.35)] text-center animate-in fade-in zoom-in-95 duration-200">
        {/* Banner */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-400 text-indigo-950 text-xs font-black uppercase tracking-wider mb-3 shadow-[0_0_15px_rgba(250,204,21,0.5)]">
          <Trophy className="w-4 h-4 fill-current" />
          <span>{isCampaignEnd ? 'Campaign Mastered!' : 'Crops Revived & Stage Cleared!'}</span>
        </div>

        <h2 className="text-3xl md:text-4xl font-black italic tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-yellow-300 to-cyan-300 mb-2">
          {engine.currentLevelConfig.title}
        </h2>

        {/* Star Rating */}
        <div className="flex justify-center items-center gap-3 my-4">
          {[1, 2, 3].map(s => {
            const hasStar = breakdown ? s <= breakdown.stars : true;
            return (
              <div
                key={s}
                className={`transition-all duration-500 ${
                  hasStar ? 'text-yellow-400 scale-110 drop-shadow-[0_0_15px_rgba(250,204,21,0.9)]' : 'text-indigo-950/80 scale-90'
                }`}
              >
                <Star className="w-9 h-9 fill-current" />
              </div>
            );
          })}
        </div>

        {/* Score Breakdown Table */}
        {breakdown && (
          <div className="bg-indigo-950/90 border border-indigo-500/50 rounded-2xl p-4 my-5 text-left text-xs md:text-sm space-y-2.5">
            <div className="flex justify-between items-center text-indigo-200">
              <span className="font-bold">Base Level Score:</span>
              <span className="font-black text-white tabular-nums">+{breakdown.baseScore}</span>
            </div>
            <div className="flex justify-between items-center text-cyan-400 font-bold">
              <span className="flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 fill-current" /> Water Preserved ({Math.round(engine.player.water)}%):
              </span>
              <span className="font-black tabular-nums">+{breakdown.waterBonus}</span>
            </div>
            <div className="flex justify-between items-center text-yellow-400 font-bold">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Time Remaining ({Math.ceil(engine.timeLeft)}s):
              </span>
              <span className="font-black tabular-nums">+{breakdown.timeBonus}</span>
            </div>
            <div className="flex justify-between items-center text-pink-400 font-bold">
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-current" /> Peak Combo Bonus:
              </span>
              <span className="font-black tabular-nums">+{breakdown.comboBonus}</span>
            </div>
            <div className="border-t border-indigo-800/80 pt-2 flex justify-between items-center text-base font-black text-yellow-300">
              <span className="uppercase tracking-wider">TOTAL SCORE:</span>
              <span className="tabular-nums text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-pink-400">
                {breakdown.totalScore}
              </span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {!isCampaignEnd ? (
            <button
              id="next-level-btn"
              onClick={onNextLevel}
              className="w-full py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-indigo-950 font-black text-base uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#0891b2] active:translate-y-1 active:shadow-[0_2px_0_#0891b2] transition cursor-pointer"
            >
              <span>{engine.mode === 'ENDLESS' ? 'NEXT MAZE FLOOR' : 'NEXT LEVEL'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <div className="p-3.5 bg-yellow-400 text-indigo-950 rounded-2xl font-black text-xs uppercase tracking-wide mb-2 shadow-[0_0_15px_rgba(250,204,21,0.5)]">
              🎉 Congratulations! You have brought water and life back to the entire kingdom!
            </div>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <button
              id="retry-level-btn"
              onClick={onRetry}
              className="py-3 px-4 rounded-2xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-200 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Level</span>
            </button>
            <button
              id="menu-btn"
              onClick={onMenu}
              className="py-3 px-4 rounded-2xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-200 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Main Menu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
