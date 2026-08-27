import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Droplets, RefreshCw } from 'lucide-react';

interface TouchControlsProps {
  onMove: (dir: 'left' | 'right' | 'up' | 'down') => void;
  onWater: () => void;
  onRefill: () => void;
  waterLevel: number;
  maxWater: number;
  isNearWell: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onMove,
  onWater,
  onRefill,
  waterLevel,
  maxWater,
  isNearWell,
}) => {
  return (
    <div className="fixed bottom-3 inset-x-0 max-w-xl mx-auto px-4 flex items-center justify-between pointer-events-none z-30 select-none">
      {/* Directional Pad */}
      <div className="grid grid-cols-3 gap-1 bg-stone-900/90 backdrop-blur-md p-2 rounded-3xl border border-stone-700 shadow-2xl pointer-events-auto">
        <div />
        <button
          onClick={() => onMove('up')}
          className="w-12 h-12 bg-stone-800 active:bg-emerald-600 active:scale-95 text-stone-200 rounded-2xl flex items-center justify-center shadow-md transition-all"
          aria-label="Move Up"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
        <div />

        <button
          onClick={() => onMove('left')}
          className="w-12 h-12 bg-stone-800 active:bg-emerald-600 active:scale-95 text-stone-200 rounded-2xl flex items-center justify-center shadow-md transition-all"
          aria-label="Move Left"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="w-12 h-12 flex items-center justify-center text-xs font-bold text-stone-500">
          PAD
        </div>
        <button
          onClick={() => onMove('right')}
          className="w-12 h-12 bg-stone-800 active:bg-emerald-600 active:scale-95 text-stone-200 rounded-2xl flex items-center justify-center shadow-md transition-all"
          aria-label="Move Right"
        >
          <ArrowRight className="w-6 h-6" />
        </button>

        <div />
        <button
          onClick={() => onMove('down')}
          className="w-12 h-12 bg-stone-800 active:bg-emerald-600 active:scale-95 text-stone-200 rounded-2xl flex items-center justify-center shadow-md transition-all"
          aria-label="Move Down"
        >
          <ArrowDown className="w-6 h-6" />
        </button>
        <div />
      </div>

      {/* Action Buttons (Water & Refill) */}
      <div className="flex flex-col gap-2 pointer-events-auto items-end">
        {/* Refill Button (highlighted when near well or empty) */}
        {(isNearWell || waterLevel === 0) && (
          <button
            onClick={onRefill}
            className="px-4 py-2.5 bg-gradient-to-r from-sky-600 to-cyan-500 text-white font-black text-xs rounded-2xl flex items-center gap-1.5 shadow-lg active:scale-90 transition-all animate-bounce border border-cyan-300"
          >
            <RefreshCw className="w-4 h-4" />
            <span>REFILL WELL</span>
          </button>
        )}

        {/* Big Water Action Button */}
        <button
          onClick={onWater}
          className={`w-20 h-20 rounded-full flex flex-col items-center justify-center font-black shadow-2xl active:scale-90 transition-all border-4 ${
            waterLevel === 0
              ? 'bg-stone-800 border-red-500 text-stone-400 opacity-60'
              : 'bg-gradient-to-br from-cyan-400 via-sky-500 to-blue-600 text-white border-cyan-200 shadow-cyan-500/50 hover:brightness-110'
          }`}
          aria-label="Water Plant"
        >
          <Droplets className="w-7 h-7" />
          <span className="text-[11px] tracking-wider mt-0.5">WATER</span>
        </button>
      </div>
    </div>
  );
};
