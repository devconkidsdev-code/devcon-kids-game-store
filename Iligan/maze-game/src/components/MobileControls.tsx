import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Wrench } from 'lucide-react';
import React, { useEffect } from 'react';

interface MobileControlsProps {
  onActionDown: (action: string) => void;
  onActionUp: (action: string) => void;
}

export function MobileControls({ onActionDown, onActionUp }: MobileControlsProps) {
  // Global pointer up to clear keys if finger slides off buttons
  useEffect(() => {
    const handleGlobalUp = () => {
      onActionUp('up');
      onActionUp('down');
      onActionUp('left');
      onActionUp('right');
    };
    window.addEventListener('pointerup', handleGlobalUp);
    return () => window.removeEventListener('pointerup', handleGlobalUp);
  }, [onActionUp]);

  const handlePointerDown = (action: string) => (e: React.PointerEvent) => {
    e.preventDefault();
    onActionDown(action);
  };

  const handlePointerUp = (action: string) => (e: React.PointerEvent) => {
    e.preventDefault();
    onActionUp(action);
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex justify-between items-end p-4 pb-8 sm:p-8">
      {/* D-PAD */}
      <div className="grid grid-cols-3 grid-rows-3 gap-2 pointer-events-auto">
        <div />
        <button
          className="w-14 h-14 bg-[#fefcf8]/90 backdrop-blur rounded-xl border-2 border-[#8ba888] flex items-center justify-center active:bg-[#e0e7da] active:scale-95 transition-all shadow-md touch-none"
          onPointerDown={handlePointerDown('up')}
          onPointerUp={handlePointerUp('up')}
        >
          <ArrowUp className="text-[#5a5a40] drop-shadow-sm" size={28} />
        </button>
        <div />
        
        <button
          className="w-14 h-14 bg-[#fefcf8]/90 backdrop-blur rounded-xl border-2 border-[#8ba888] flex items-center justify-center active:bg-[#e0e7da] active:scale-95 transition-all shadow-md touch-none"
          onPointerDown={handlePointerDown('left')}
          onPointerUp={handlePointerUp('left')}
        >
          <ArrowLeft className="text-[#5a5a40] drop-shadow-sm" size={28} />
        </button>
        <div className="w-14 h-14" />
        <button
          className="w-14 h-14 bg-[#fefcf8]/90 backdrop-blur rounded-xl border-2 border-[#8ba888] flex items-center justify-center active:bg-[#e0e7da] active:scale-95 transition-all shadow-md touch-none"
          onPointerDown={handlePointerDown('right')}
          onPointerUp={handlePointerUp('right')}
        >
          <ArrowRight className="text-[#5a5a40] drop-shadow-sm" size={28} />
        </button>

        <div />
        <button
          className="w-14 h-14 bg-[#fefcf8]/90 backdrop-blur rounded-xl border-2 border-[#8ba888] flex items-center justify-center active:bg-[#e0e7da] active:scale-95 transition-all shadow-md touch-none"
          onPointerDown={handlePointerDown('down')}
          onPointerUp={handlePointerUp('down')}
        >
          <ArrowDown className="text-[#5a5a40] drop-shadow-sm" size={28} />
        </button>
        <div />
      </div>

      {/* Action Button */}
      <div className="pointer-events-auto mb-4 mr-4">
        <button
          className="w-20 h-20 bg-[#5a5a40] text-white rounded-2xl border-4 border-[#8ba888] flex items-center justify-center shadow-xl active:scale-95 active:bg-black transition-all touch-none"
          onPointerDown={handlePointerDown('repair')}
          onPointerUp={handlePointerUp('repair')}
        >
          <Wrench className="text-white drop-shadow-md" size={36} />
        </button>
      </div>
    </div>
  );
}
