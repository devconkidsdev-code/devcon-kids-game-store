import React from 'react';
import { motion } from 'motion/react';
import { Flame, X, Play, Trophy, Sparkles } from 'lucide-react';
import { CHALLENGE_MODES } from '../data/cosmeticsData';
import { ChallengeMode } from '../types/game';
import { soundManager } from '../utils/audio';

interface ChallengeModeModalProps {
  onStartChallenge: (challenge: ChallengeMode) => void;
  onClose: () => void;
}

export const ChallengeModeModal: React.FC<ChallengeModeModalProps> = ({
  onStartChallenge,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-xs">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-4xl max-h-[85vh] bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border-4 border-rose-200 flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-rose-100 text-rose-800 rounded-2xl">
              <Flame className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-800">
                Special Challenge Modes & Water Olympics
              </h2>
              <p className="text-xs text-slate-500">
                Test your water conservation mastery under extreme constraints and wacky scenarios!
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

        {/* Challenges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-4 overflow-y-auto pr-1">
          {CHALLENGE_MODES.map((ch) => (
            <div
              key={ch.id}
              className="p-4 bg-slate-50 hover:bg-rose-50/50 rounded-2xl border border-slate-200 hover:border-rose-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-2 bg-white rounded-xl border border-slate-100 shadow-xs">
                    {ch.icon}
                  </span>
                  <span
                    className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                      ch.difficulty === 'extreme'
                        ? 'bg-rose-200 text-rose-900'
                        : ch.difficulty === 'hard'
                        ? 'bg-amber-200 text-amber-900'
                        : 'bg-sky-200 text-sky-900'
                    }`}
                  >
                    {ch.difficulty}
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-black text-slate-800 mt-2">{ch.title}</h4>
                <p className="text-xs text-slate-600 my-1 leading-relaxed">{ch.desc}</p>
                <div className="p-2 bg-white rounded-xl border border-slate-200 text-[11px] font-medium text-slate-700 mt-2">
                  <span className="font-bold text-rose-600 block">Rule:</span>
                  {ch.specialRule}
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5 text-amber-500" />
                  <span>High: {ch.highScore}</span>
                </span>

                <button
                  onClick={() => {
                    soundManager.playClick();
                    onStartChallenge(ch);
                  }}
                  className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1 cursor-pointer transition"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Enter Run</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
