import React from 'react';
import { motion } from 'motion/react';
import { Trophy, X, CheckCircle2, Sparkles } from 'lucide-react';
import { ALL_ACHIEVEMENTS } from '../data/cosmeticsData';
import { UserProgress } from '../types/game';
import { soundManager } from '../utils/audio';

interface AchievementsModalProps {
  progress: UserProgress;
  onClaimReward: (achievementId: string, reward: number) => void;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  progress,
  onClaimReward,
  onClose,
}) => {
  const getProgressVal = (reqType: string) => {
    switch (reqType) {
      case 'levels_completed':
        return progress.unlockedLevels;
      case 'water_saved':
        return progress.totalWaterSaved;
      case 'leaks_fixed':
        return progress.totalLeaksFixed;
      case 'rain_collected':
        return progress.totalRainCollected;
      case 'moo_moo_caught':
        return progress.mooMooSipsCaught;
      case 'stars_earned':
        return progress.starsEarned;
      default:
        return 0;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-3xl bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border-4 border-amber-200 flex flex-col overflow-hidden max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 text-amber-800 rounded-2xl">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-800">
                Guardian Honors & Achievements
              </h2>
              <p className="text-xs text-slate-500">
                Complete humorous water conservation milestones to earn bonus Eco-Coins!
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundManager.playClick();
              onClose();
            }}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Achievement Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4 overflow-y-auto pr-1">
          {ALL_ACHIEVEMENTS.map((ach) => {
            const targetVal = (ach as any).targetValue || ach.maxProgress || 10;
            const currentVal = Math.min(targetVal, getProgressVal((ach as any).requirementType || ach.category || ''));
            const isCompleted = currentVal >= targetVal;
            const isClaimed = progress.achievements[ach.id]?.claimed;
            const percent = Math.min(100, Math.floor((currentVal / targetVal) * 100));

            return (
              <div
                key={ach.id}
                className={`p-3.5 rounded-2xl border flex flex-col justify-between transition ${
                  isClaimed
                    ? 'bg-slate-50 border-slate-200 opacity-70'
                    : isCompleted
                    ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-200 shadow-xs'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-2xl p-1.5 bg-white rounded-xl border border-slate-100 shadow-xs">
                        {ach.icon}
                      </span>
                      <div>
                        <h4 className="text-xs font-black text-slate-800">{ach.title}</h4>
                        <span className="text-[10px] text-slate-500 block">{ach.description || (ach as any).desc}</span>
                      </div>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="my-2.5">
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500 transition-all rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold mt-0.5">
                      <span>
                        {currentVal} / {targetVal}
                      </span>
                      <span>{percent}%</span>
                    </div>
                  </div>
                </div>

                {/* Reward Claim Button */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-black text-amber-700 flex items-center gap-1">
                    <span>🪙</span>
                    <span>+{ach.rewardCoins} Coins</span>
                  </span>

                  {isClaimed ? (
                    <span className="text-xs font-bold text-slate-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Claimed
                    </span>
                  ) : isCompleted ? (
                    <button
                      onClick={() => {
                        soundManager.playCoin();
                        onClaimReward(ach.id, ach.rewardCoins);
                      }}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs rounded-xl shadow-xs cursor-pointer animate-bounce"
                    >
                      Claim Reward!
                    </button>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-bold">In Progress</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};
