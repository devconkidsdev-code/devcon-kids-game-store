import React from 'react';
import { ArrowLeft, ArrowRight, Droplets } from 'lucide-react';

interface MobileControlsProps {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onWater: () => void;
  disabled?: boolean;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onMoveLeft,
  onMoveRight,
  onWater,
  disabled = false,
}) => {
  return (
    <div className="w-full max-w-xl mx-auto px-3 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.3)] flex items-center justify-between gap-3 select-none z-30">
      {/* Directional Pad with Frosted Glass Buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          id="btn-move-left"
          onClick={onMoveLeft}
          disabled={disabled}
          className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-white/15 hover:bg-white/25 active:bg-white/35 active:scale-95 disabled:opacity-40 backdrop-blur-md border border-white/30 text-white shadow-lg transition-all flex items-center justify-center font-bold cursor-pointer"
          aria-label="Move Left (Left Arrow)"
        >
          <ArrowLeft className="w-7 h-7 sm:w-8 sm:h-8" />
        </button>

        <button
          id="btn-move-right"
          onClick={onMoveRight}
          disabled={disabled}
          className="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-white/15 hover:bg-white/25 active:bg-white/35 active:scale-95 disabled:opacity-40 backdrop-blur-md border border-white/30 text-white shadow-lg transition-all flex items-center justify-center font-bold cursor-pointer"
          aria-label="Move Right (Right Arrow)"
        >
          <ArrowRight className="w-7 h-7 sm:w-8 sm:h-8" />
        </button>
      </div>

      {/* Water Spray Action Button - Glowing Frosted Cyan Pill */}
      <button
        id="btn-water-crop"
        onClick={onWater}
        disabled={disabled}
        className="flex-1 max-w-[240px] h-13 sm:h-16 rounded-2xl bg-cyan-500/80 hover:bg-cyan-400/90 active:bg-cyan-600 active:scale-95 disabled:opacity-40 backdrop-blur-md border border-cyan-200/80 text-white shadow-[0_0_25px_rgba(6,182,212,0.6)] transition-all flex items-center justify-center gap-2 font-black text-sm sm:text-base tracking-wider cursor-pointer"
        aria-label="Spray Water (Spacebar)"
      >
        <Droplets className="w-5 h-5 sm:w-6 sm:h-6 animate-bounce text-cyan-100" />
        <span>WATER (SPACE)</span>
      </button>
    </div>
  );
};
