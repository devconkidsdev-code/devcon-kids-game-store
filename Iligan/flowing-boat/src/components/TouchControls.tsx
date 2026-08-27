import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Zap } from 'lucide-react';
import { InputState } from '../game/gameEngine';

interface TouchControlsProps {
  onInputChange: (key: keyof InputState, value: boolean) => void;
  isStage2: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onInputChange,
  isStage2,
}) => {
  const handleTouch = (key: keyof InputState, isPressed: boolean) => {
    onInputChange(key, isPressed);
  };

  return (
    <div className="absolute inset-x-0 bottom-4 px-5 flex justify-between items-end pointer-events-none select-none z-20 md:hidden">
      {/* Directional Pad */}
      <div className="relative w-36 h-36 pointer-events-auto">
        {/* Up */}
        <button
          onTouchStart={() => handleTouch('up', true)}
          onTouchEnd={() => handleTouch('up', false)}
          onMouseDown={() => handleTouch('up', true)}
          onMouseUp={() => handleTouch('up', false)}
          className="absolute top-0 left-12 w-12 h-12 bg-black/50 active:bg-blue-600 border border-white/20 active:border-blue-400 rounded-2xl flex items-center justify-center text-white shadow-xl active:scale-95 transition-transform backdrop-blur-md"
          aria-label="Up"
        >
          <ArrowUp className="w-6 h-6" />
        </button>

        {/* Down */}
        <button
          onTouchStart={() => handleTouch('down', true)}
          onTouchEnd={() => handleTouch('down', false)}
          onMouseDown={() => handleTouch('down', true)}
          onMouseUp={() => handleTouch('down', false)}
          className="absolute bottom-0 left-12 w-12 h-12 bg-black/50 active:bg-blue-600 border border-white/20 active:border-blue-400 rounded-2xl flex items-center justify-center text-white shadow-xl active:scale-95 transition-transform backdrop-blur-md"
          aria-label="Down"
        >
          <ArrowDown className="w-6 h-6" />
        </button>

        {/* Left */}
        <button
          onTouchStart={() => handleTouch('left', true)}
          onTouchEnd={() => handleTouch('left', false)}
          onMouseDown={() => handleTouch('left', true)}
          onMouseUp={() => handleTouch('left', false)}
          className="absolute top-12 left-0 w-12 h-12 bg-black/50 active:bg-blue-600 border border-white/20 active:border-blue-400 rounded-2xl flex items-center justify-center text-white shadow-xl active:scale-95 transition-transform backdrop-blur-md"
          aria-label="Left"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        {/* Right */}
        <button
          onTouchStart={() => handleTouch('right', true)}
          onTouchEnd={() => handleTouch('right', false)}
          onMouseDown={() => handleTouch('right', true)}
          onMouseUp={() => handleTouch('right', false)}
          className="absolute top-12 right-0 w-12 h-12 bg-black/50 active:bg-blue-600 border border-white/20 active:border-blue-400 rounded-2xl flex items-center justify-center text-white shadow-xl active:scale-95 transition-transform backdrop-blur-md"
          aria-label="Right"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      {/* Action Button */}
      <div className="pointer-events-auto">
        <button
          onTouchStart={() => handleTouch('space', true)}
          onTouchEnd={() => handleTouch('space', false)}
          onMouseDown={() => handleTouch('space', true)}
          onMouseUp={() => handleTouch('space', false)}
          className={`w-20 h-20 rounded-3xl font-bold flex flex-col items-center justify-center shadow-xl border active:scale-90 transition-all ${
            isStage2
              ? 'bg-blue-600 active:bg-blue-700 text-white border-blue-400 shadow-blue-500/50'
              : 'bg-white active:bg-gray-100 text-black border-white'
          }`}
          aria-label={isStage2 ? 'Boost' : 'Jump'}
        >
          <Zap className={`w-7 h-7 ${isStage2 ? 'fill-white' : 'fill-black'}`} />
          <span className="text-[11px] uppercase tracking-wider mt-0.5 font-black">
            {isStage2 ? 'BOOST' : 'JUMP'}
          </span>
        </button>
      </div>
    </div>
  );
};

