import React from 'react';
import { RotateCcw, Home, Droplets } from 'lucide-react';
import { LevelConfig } from '../types';

interface GameOverModalProps {
  level: LevelConfig;
  timeTaken: number;
  onRetry: () => void;
  onMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  level,
  timeTaken,
  onRetry,
  onMenu,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm select-none">
      <div className="w-full max-w-md bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-xl text-center flex flex-col items-center text-[#2D3748]">
        {/* Dry Bucket Icon */}
        <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mb-4 text-rose-500">
          <Droplets className="w-8 h-8 rotate-180 opacity-70" />
        </div>

        {/* Title */}
        <h2 className="font-display font-black text-3xl sm:text-4xl text-[#2F4F4F] mb-1">
          Bucket Ran Dry!
        </h2>
        <p className="text-[#708090] text-sm mb-6">
          The water ran out before reaching the village.
        </p>

        {/* Level & Time Stats */}
        <div className="w-full bg-[#FDFBF7] border border-[#E2E8F0] rounded-xl p-4 mb-6 flex flex-col items-center gap-2">
          <div className="flex items-center justify-between w-full text-xs text-[#708090]">
            <span className="font-bold">EXPEDITION</span>
            <span className="font-bold text-[#2D3748]">{level.name}</span>
          </div>
          <div className="flex items-center justify-between w-full text-xs text-[#708090]">
            <span className="font-bold">TIME SURVIVED</span>
            <span className="font-mono-num font-bold text-[#2D3748]">{timeTaken.toFixed(1)}s</span>
          </div>
          <div className="flex items-center justify-between w-full text-xs text-[#708090]">
            <span className="font-bold">FINAL WATER</span>
            <span className="font-mono-num font-bold text-rose-600">0% (Empty)</span>
          </div>
        </div>

        {/* Hint Banner */}
        <div className="w-full bg-[#F1F3F0] border border-[#E2E8F0] rounded-xl p-3.5 mb-6 text-xs text-[#2D3748] text-left">
          <p className="font-bold text-[#2F4F4F] mb-1">💡 Mountain Guide Tip:</p>
          <p className="text-[#708090]">
            Avoid rough scree patches when possible, plan turns before walking, and grab sparkling dew drops along the way!
          </p>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            id="try-again-btn"
            onClick={onRetry}
            className="w-full py-3.5 px-6 rounded-xl bg-[#2F4F4F] hover:bg-[#233D3D] text-white font-bold text-base flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>TRY AGAIN (R)</span>
          </button>

          <button
            id="gameover-menu-btn"
            onClick={onMenu}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#F1F3F0] border border-[#E2E8F0] text-[#2D3748] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Return to Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
