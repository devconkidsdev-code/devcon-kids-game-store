import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowRight, RotateCcw, Award, Clock, Droplet, Sparkles } from 'lucide-react';
import { LevelResult } from '../types';

interface LevelCompleteModalProps {
  result: LevelResult;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onRetry: () => void;
  onMenu: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  result,
  hasNextLevel,
  onNextLevel,
  onRetry,
  onMenu,
}) => {
  useEffect(() => {
    // Fire festive mountain confetti
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#38bdf8', '#22c55e', '#f59e0b', '#ffffff'],
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm select-none">
      <div className="w-full max-w-md bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-xl text-center flex flex-col items-center text-[#2D3748]">
        {/* Success Icon / Badge */}
        <div className="w-16 h-16 rounded-full bg-[#F1F3F0] border border-[#E2E8F0] flex items-center justify-center mb-4 text-[#2F4F4F]">
          <Sparkles className="w-8 h-8 text-[#00BFFF]" />
        </div>

        {/* Title */}
        <h2 className="font-display font-black text-3xl sm:text-4xl text-[#2F4F4F] mb-1">
          You made it!
        </h2>
        <p className="text-[#708090] text-sm mb-6">
          The village received the fresh spring water safely.
        </p>

        {/* Performance Rating Badge */}
        <div className="w-full bg-[#FDFBF7] border border-[#E2E8F0] rounded-xl p-4 mb-6 flex flex-col items-center">
          <span className="text-[11px] font-bold text-[#708090] uppercase tracking-wider mb-1">
            Performance Rating
          </span>
          <div className="text-2xl font-black font-display text-[#2F4F4F] flex items-center gap-2">
            <span>{result.rating}</span>
          </div>
        </div>

        {/* Result Stats Grid */}
        <div className="w-full grid grid-cols-3 gap-2.5 mb-6">
          {/* Water Saved */}
          <div className="bg-[#FDFBF7] border border-[#E2E8F0] rounded-xl p-3 flex flex-col items-center">
            <div className="flex items-center gap-1 text-[#00BFFF] mb-1">
              <Droplet className="w-3.5 h-3.5 fill-current" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#708090]">
                Water Saved
              </span>
            </div>
            <span className="font-mono-num font-black text-xl text-[#00BFFF]">
              {result.waterRemaining}%
            </span>
          </div>

          {/* Time Taken */}
          <div className="bg-[#FDFBF7] border border-[#E2E8F0] rounded-xl p-3 flex flex-col items-center">
            <div className="flex items-center gap-1 text-amber-500 mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#708090]">
                Time
              </span>
            </div>
            <span className="font-mono-num font-black text-xl text-[#2D3748]">
              {result.timeTaken.toFixed(1)}s
            </span>
          </div>

          {/* Score */}
          <div className="bg-[#FDFBF7] border border-[#E2E8F0] rounded-xl p-3 flex flex-col items-center">
            <div className="flex items-center gap-1 text-emerald-600 mb-1">
              <Award className="w-3.5 h-3.5" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#708090]">
                Score
              </span>
            </div>
            <span className="font-mono-num font-black text-xl text-emerald-600">
              {result.score}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          {hasNextLevel ? (
            <button
              id="next-level-btn"
              onClick={onNextLevel}
              className="w-full py-3.5 px-6 rounded-xl bg-[#2F4F4F] hover:bg-[#233D3D] text-white font-bold text-base flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
            >
              <span>NEXT LEVEL</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              id="view-final-btn"
              onClick={onNextLevel}
              className="w-full py-3.5 px-6 rounded-xl bg-[#2F4F4F] hover:bg-[#233D3D] text-white font-bold text-base flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
            >
              <span>VIEW FINAL RESULTS</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}

          <div className="grid grid-cols-2 gap-2">
            <button
              id="retry-level-modal-btn"
              onClick={onRetry}
              className="py-2.5 px-4 rounded-xl bg-white hover:bg-[#F1F3F0] border border-[#E2E8F0] text-[#2D3748] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retry Level</span>
            </button>

            <button
              id="menu-level-modal-btn"
              onClick={onMenu}
              className="py-2.5 px-4 rounded-xl bg-white hover:bg-[#F1F3F0] border border-[#E2E8F0] text-[#2D3748] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Level Select</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
