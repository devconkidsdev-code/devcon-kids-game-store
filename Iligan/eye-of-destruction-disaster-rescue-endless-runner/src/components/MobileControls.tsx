import React, { useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Hand } from 'lucide-react';
import { GameMode } from '../types';

interface MobileControlsProps {
  mode: GameMode;
  onLaneLeft: () => void;
  onLaneRight: () => void;
  onJump: () => void;
  onSlide: () => void;
  onInteract: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  mode,
  onLaneLeft,
  onLaneRight,
  onJump,
  onSlide,
  onInteract
}) => {
  const touchStartPos = useRef<{ x: number; y: number } | null>(null);

  // Global Touch Swipe detection on the screen
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        touchStartPos.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartPos.current || e.changedTouches.length === 0) return;
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;

      const diffX = endX - touchStartPos.current.x;
      const diffY = endY - touchStartPos.current.y;
      const minSwipeDistance = 30;

      if (Math.abs(diffX) > Math.abs(diffY)) {
        // Horizontal swipe
        if (Math.abs(diffX) > minSwipeDistance) {
          if (diffX > 0) {
            onLaneRight();
          } else {
            onLaneLeft();
          }
        }
      } else {
        // Vertical swipe
        if (Math.abs(diffY) > minSwipeDistance) {
          if (diffY < 0) {
            onJump();
          } else {
            onSlide();
          }
        }
      }
      touchStartPos.current = null;
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [onLaneLeft, onLaneRight, onJump, onSlide]);

  return (
    <div className="absolute inset-x-0 bottom-4 pointer-events-none flex justify-between items-end px-4 z-20 sm:hidden">
      {/* Left: Directional buttons */}
      {mode === 'RUNNER' ? (
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            id="mobile-btn-left"
            onClick={onLaneLeft}
            className="w-12 h-12 rounded bg-[#151518]/90 active:bg-orange-500 active:text-black border border-white/15 text-white flex items-center justify-center shadow-lg active:scale-95 transition backdrop-blur-md"
            aria-label="Move Left"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            id="mobile-btn-right"
            onClick={onLaneRight}
            className="w-12 h-12 rounded bg-[#151518]/90 active:bg-orange-500 active:text-black border border-white/15 text-white flex items-center justify-center shadow-lg active:scale-95 transition backdrop-blur-md"
            aria-label="Move Right"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      ) : (
        <div />
      )}

      {/* Right: Jump / Slide or Interact */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {mode === 'RUNNER' ? (
          <>
            <button
              id="mobile-btn-slide"
              onClick={onSlide}
              className="w-12 h-12 rounded bg-[#151518]/90 active:bg-sky-500 active:text-black border border-white/15 text-white flex items-center justify-center shadow-lg active:scale-95 transition backdrop-blur-md"
              aria-label="Slide"
            >
              <ArrowDown className="w-5 h-5" />
            </button>
            <button
              id="mobile-btn-jump"
              onClick={onJump}
              className="w-12 h-12 rounded bg-orange-500 hover:bg-orange-400 active:scale-95 text-black flex items-center justify-center shadow-xl font-mono font-black text-sm uppercase transition"
              aria-label="Jump"
            >
              <ArrowUp className="w-6 h-6" />
            </button>
          </>
        ) : (
          <button
            id="mobile-btn-interact"
            onClick={onInteract}
            className="px-4 py-3 rounded bg-green-400 hover:bg-green-300 active:scale-95 text-black flex items-center justify-center gap-2 shadow-xl font-mono font-bold text-xs uppercase tracking-wider transition border border-green-300"
          >
            <Hand className="w-4 h-4" />
            <span>INTERACT [E]</span>
          </button>
        )}
      </div>
    </div>
  );
};

