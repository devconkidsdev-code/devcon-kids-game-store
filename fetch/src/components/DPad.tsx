import React, { useCallback, useRef } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface DPadProps {
  onDirectionChange: (dir: { x: number; y: number } | null) => void;
}

export const DPad: React.FC<DPadProps> = ({ onDirectionChange }) => {
  const activeDirRef = useRef<{ x: number; y: number } | null>(null);

  const setDir = useCallback(
    (dir: { x: number; y: number } | null) => {
      activeDirRef.current = dir;
      onDirectionChange(dir);
    },
    [onDirectionChange]
  );

  const handleTouchStart = (dir: { x: number; y: number }) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    setDir(dir);
  };

  const handleTouchEnd = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    setDir(null);
  };

  return (
    <div className="flex flex-col items-center justify-center p-2 select-none touch-none">
      {/* Up Button */}
      <button
        id="dpad-up"
        onMouseDown={handleTouchStart({ x: 0, y: -1 })}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        onTouchStart={handleTouchStart({ x: 0, y: -1 })}
        onTouchEnd={handleTouchEnd}
        className="w-13 h-13 bg-white active:bg-[#2F4F4F] border border-[#E2E8F0] active:border-[#2F4F4F] rounded-xl flex items-center justify-center text-[#2D3748] active:text-white shadow-xs active:scale-95 transition-transform cursor-pointer mb-1.5"
      >
        <ArrowUp className="w-6 h-6" />
      </button>

      {/* Left / Center / Right */}
      <div className="flex items-center gap-1.5">
        <button
          id="dpad-left"
          onMouseDown={handleTouchStart({ x: -1, y: 0 })}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
          onTouchStart={handleTouchStart({ x: -1, y: 0 })}
          onTouchEnd={handleTouchEnd}
          className="w-13 h-13 bg-white active:bg-[#2F4F4F] border border-[#E2E8F0] active:border-[#2F4F4F] rounded-xl flex items-center justify-center text-[#2D3748] active:text-white shadow-xs active:scale-95 transition-transform cursor-pointer"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="w-13 h-13 bg-[#F1F3F0] border border-[#E2E8F0] rounded-xl flex items-center justify-center text-[#708090] text-xs font-bold font-mono">
          💧
        </div>

        <button
          id="dpad-right"
          onMouseDown={handleTouchStart({ x: 1, y: 0 })}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
          onTouchStart={handleTouchStart({ x: 1, y: 0 })}
          onTouchEnd={handleTouchEnd}
          className="w-13 h-13 bg-white active:bg-[#2F4F4F] border border-[#E2E8F0] active:border-[#2F4F4F] rounded-xl flex items-center justify-center text-[#2D3748] active:text-white shadow-xs active:scale-95 transition-transform cursor-pointer"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      {/* Down Button */}
      <button
        id="dpad-down"
        onMouseDown={handleTouchStart({ x: 0, y: 1 })}
        onMouseUp={handleTouchEnd}
        onMouseLeave={handleTouchEnd}
        onTouchStart={handleTouchStart({ x: 0, y: 1 })}
        onTouchEnd={handleTouchEnd}
        className="w-13 h-13 bg-white active:bg-[#2F4F4F] border border-[#E2E8F0] active:border-[#2F4F4F] rounded-xl flex items-center justify-center text-[#2D3748] active:text-white shadow-xs active:scale-95 transition-transform cursor-pointer mt-1.5"
      >
        <ArrowDown className="w-6 h-6" />
      </button>
    </div>
  );
};
