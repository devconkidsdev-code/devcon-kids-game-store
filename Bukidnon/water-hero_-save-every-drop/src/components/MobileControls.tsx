import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { Direction } from '../types';

interface Props {
  onMove: (dir: Direction) => void;
}

export const MobileControls: React.FC<Props> = ({ onMove }) => {
  const handleTouch = (e: React.MouseEvent | React.TouchEvent, dir: Direction) => {
    e.preventDefault();
    onMove(dir);
  };

  return (
    <div className="flex flex-col items-center justify-center select-none w-full" id="mobile-dpad">
      
      {/* Keyboard Hint Badges */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-2 text-xs">
        <div className="flex items-center gap-1.5 bg-white/90 border-2 border-blue-200 px-3 py-1 rounded-xl shadow-sm">
          <kbd className="bg-gray-100 border-2 border-gray-300 rounded px-2 py-0.5 font-black text-blue-950">&uarr;</kbd>
          <kbd className="bg-gray-100 border-2 border-gray-300 rounded px-2 py-0.5 font-black text-blue-950">&larr;</kbd>
          <kbd className="bg-gray-100 border-2 border-gray-300 rounded px-2 py-0.5 font-black text-blue-950">&darr;</kbd>
          <kbd className="bg-gray-100 border-2 border-gray-300 rounded px-2 py-0.5 font-black text-blue-950">&rarr;</kbd>
          <span className="text-[11px] font-black text-blue-900 uppercase ml-1">OR WASD TO MOVE</span>
        </div>
      </div>

      {/* Chunky 3D Arcade D-Pad */}
      <div className="grid grid-cols-3 gap-2 w-44 max-w-full">
        {/* Row 1 */}
        <div />
        <button
          id="btn-dpad-up"
          onTouchStart={(e) => handleTouch(e, 'UP')}
          onClick={(e) => handleTouch(e, 'UP')}
          aria-label="Move Up"
          className="h-12 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 border-b-4 border-blue-800 rounded-2xl flex items-center justify-center text-white shadow-md active:translate-y-0.5 active:border-b-2 transition-all cursor-pointer"
        >
          <ArrowUp className="w-6 h-6 stroke-[3]" />
        </button>
        <div />

        {/* Row 2 */}
        <button
          id="btn-dpad-left"
          onTouchStart={(e) => handleTouch(e, 'LEFT')}
          onClick={(e) => handleTouch(e, 'LEFT')}
          aria-label="Move Left"
          className="h-12 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 border-b-4 border-blue-800 rounded-2xl flex items-center justify-center text-white shadow-md active:translate-y-0.5 active:border-b-2 transition-all cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6 stroke-[3]" />
        </button>

        <div className="flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-blue-400/40 border border-blue-500/40" />
        </div>

        <button
          id="btn-dpad-right"
          onTouchStart={(e) => handleTouch(e, 'RIGHT')}
          onClick={(e) => handleTouch(e, 'RIGHT')}
          aria-label="Move Right"
          className="h-12 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 border-b-4 border-blue-800 rounded-2xl flex items-center justify-center text-white shadow-md active:translate-y-0.5 active:border-b-2 transition-all cursor-pointer"
        >
          <ArrowRight className="w-6 h-6 stroke-[3]" />
        </button>

        {/* Row 3 */}
        <div />
        <button
          id="btn-dpad-down"
          onTouchStart={(e) => handleTouch(e, 'DOWN')}
          onClick={(e) => handleTouch(e, 'DOWN')}
          aria-label="Move Down"
          className="h-12 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 border-b-4 border-blue-800 rounded-2xl flex items-center justify-center text-white shadow-md active:translate-y-0.5 active:border-b-2 transition-all cursor-pointer"
        >
          <ArrowDown className="w-6 h-6 stroke-[3]" />
        </button>
        <div />
      </div>

    </div>
  );
};
