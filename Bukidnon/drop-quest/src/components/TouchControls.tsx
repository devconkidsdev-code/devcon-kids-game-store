import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, Zap } from 'lucide-react';

interface TouchControlsProps {
  onLeftChange: (active: boolean) => void;
  onRightChange: (active: boolean) => void;
  onJumpChange: (active: boolean) => void;
  onShootChange?: (active: boolean) => void;
  hasWaterGun?: boolean;
  waterAmmo?: number;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onLeftChange,
  onRightChange,
  onJumpChange,
  onShootChange,
  hasWaterGun = false,
  waterAmmo = 0,
}) => {
  return (
    <div id="touch-controls-layer" className="absolute inset-0 pointer-events-none z-20 select-none flex justify-between items-end p-4 pb-6 sm:hidden">
      
      {/* Left/Right D-Pad */}
      <div className="flex items-center gap-3 pointer-events-auto">
        <button
          id="btn-touch-left"
          type="button"
          onTouchStart={e => { e.preventDefault(); onLeftChange(true); }}
          onTouchEnd={e => { e.preventDefault(); onLeftChange(false); }}
          onMouseDown={() => onLeftChange(true)}
          onMouseUp={() => onLeftChange(false)}
          onMouseLeave={() => onLeftChange(false)}
          className="w-16 h-16 rounded-2xl bg-amber-950/85 active:bg-amber-800 border-2 border-amber-500/40 text-amber-200 flex items-center justify-center shadow-xl active:scale-90 transition-transform backdrop-blur-sm"
          aria-label="Move Left"
        >
          <ArrowLeft className="w-8 h-8" />
        </button>

        <button
          id="btn-touch-right"
          type="button"
          onTouchStart={e => { e.preventDefault(); onRightChange(true); }}
          onTouchEnd={e => { e.preventDefault(); onRightChange(false); }}
          onMouseDown={() => onRightChange(true)}
          onMouseUp={() => onRightChange(false)}
          onMouseLeave={() => onRightChange(false)}
          className="w-16 h-16 rounded-2xl bg-amber-950/85 active:bg-amber-800 border-2 border-amber-500/40 text-amber-200 flex items-center justify-center shadow-xl active:scale-90 transition-transform backdrop-blur-sm"
          aria-label="Move Right"
        >
          <ArrowRight className="w-8 h-8" />
        </button>
      </div>

      {/* Action Buttons: Shoot (if unlocked) & Jump */}
      <div className="flex items-center gap-3 pointer-events-auto">
        {hasWaterGun && onShootChange && (
          <button
            id="btn-touch-shoot"
            type="button"
            onTouchStart={e => { e.preventDefault(); onShootChange(true); }}
            onTouchEnd={e => { e.preventDefault(); onShootChange(false); }}
            onMouseDown={() => onShootChange(true)}
            onMouseUp={() => onShootChange(false)}
            onMouseLeave={() => onShootChange(false)}
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 active:from-cyan-600 active:to-blue-700 border-2 border-cyan-300 text-white flex flex-col items-center justify-center shadow-[0_0_18px_rgba(6,182,212,0.6)] active:scale-90 transition-transform relative"
            aria-label="Shoot Water Gun"
          >
            <Zap className="w-6 h-6 fill-white text-white" />
            <span className="text-[9px] font-black tracking-wider uppercase">BLAST</span>
            <span className="absolute -top-1 -right-1 bg-amber-400 text-amber-950 text-[10px] font-black px-1.5 py-0.2 rounded-full shadow">
              {waterAmmo}
            </span>
          </button>
        )}

        {/* Jump Button */}
        <button
          id="btn-touch-jump"
          type="button"
          onTouchStart={e => { e.preventDefault(); onJumpChange(true); }}
          onTouchEnd={e => { e.preventDefault(); onJumpChange(false); }}
          onMouseDown={() => onJumpChange(true)}
          onMouseUp={() => onJumpChange(false)}
          onMouseLeave={() => onJumpChange(false)}
          className="w-20 h-20 rounded-full bg-gradient-to-tr from-sky-600 to-cyan-500 active:from-sky-700 active:to-cyan-600 border-2 border-sky-300 text-white flex flex-col items-center justify-center shadow-[0_0_20px_rgba(56,189,248,0.5)] active:scale-90 transition-transform"
          aria-label="Jump"
        >
          <ArrowUp className="w-8 h-8" />
          <span className="text-[10px] font-black tracking-widest uppercase">JUMP</span>
        </button>
      </div>

    </div>
  );
};

