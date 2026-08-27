import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Zap } from 'lucide-react';
import { KeyControls } from '../types';

interface ControlsOverlayProps {
  onKeyChange: (key: keyof KeyControls, pressed: boolean) => void;
}

export const ControlsOverlay: React.FC<ControlsOverlayProps> = ({ onKeyChange }) => {
  return (
    <div id="touch-controls-overlay" className="sm:hidden absolute bottom-4 inset-x-4 flex items-end justify-between pointer-events-none select-none z-20 font-sans">
      {/* Left: Tactical D-Pad */}
      <div className="grid grid-cols-3 gap-1.5 bg-slate-900/85 p-2 rounded-2xl border border-slate-700/80 backdrop-blur-md shadow-2xl pointer-events-auto">
        <div />
        <button
          id="btn-touch-w"
          className="w-12 h-12 flex items-center justify-center bg-slate-800/90 active:bg-amber-500 text-slate-100 active:text-slate-950 rounded-xl border border-slate-600 active:border-amber-300 font-bold active:scale-90 transition-all shadow-md"
          onTouchStart={(e) => { e.preventDefault(); onKeyChange('up', true); }}
          onTouchEnd={(e) => { e.preventDefault(); onKeyChange('up', false); }}
          onMouseDown={() => onKeyChange('up', true)}
          onMouseUp={() => onKeyChange('up', false)}
        >
          <ArrowUp className="w-6 h-6" />
        </button>
        <div />

        <button
          id="btn-touch-a"
          className="w-12 h-12 flex items-center justify-center bg-slate-800/90 active:bg-amber-500 text-slate-100 active:text-slate-950 rounded-xl border border-slate-600 active:border-amber-300 font-bold active:scale-90 transition-all shadow-md"
          onTouchStart={(e) => { e.preventDefault(); onKeyChange('left', true); }}
          onTouchEnd={(e) => { e.preventDefault(); onKeyChange('left', false); }}
          onMouseDown={() => onKeyChange('left', true)}
          onMouseUp={() => onKeyChange('left', false)}
        >
          <ArrowLeft className="w-6 h-6" />
        </button>

        <button
          id="btn-touch-s"
          className="w-12 h-12 flex items-center justify-center bg-slate-800/90 active:bg-amber-500 text-slate-100 active:text-slate-950 rounded-xl border border-slate-600 active:border-amber-300 font-bold active:scale-90 transition-all shadow-md"
          onTouchStart={(e) => { e.preventDefault(); onKeyChange('down', true); }}
          onTouchEnd={(e) => { e.preventDefault(); onKeyChange('down', false); }}
          onMouseDown={() => onKeyChange('down', true)}
          onMouseUp={() => onKeyChange('down', false)}
        >
          <ArrowDown className="w-6 h-6" />
        </button>

        <button
          id="btn-touch-d"
          className="w-12 h-12 flex items-center justify-center bg-slate-800/90 active:bg-amber-500 text-slate-100 active:text-slate-950 rounded-xl border border-slate-600 active:border-amber-300 font-bold active:scale-90 transition-all shadow-md"
          onTouchStart={(e) => { e.preventDefault(); onKeyChange('right', true); }}
          onTouchEnd={(e) => { e.preventDefault(); onKeyChange('right', false); }}
          onMouseDown={() => onKeyChange('right', true)}
          onMouseUp={() => onKeyChange('right', false)}
        >
          <ArrowRight className="w-6 h-6" />
        </button>
      </div>

      {/* Right: Action Buttons (Jump / Sprint) */}
      <div className="flex flex-col gap-2.5 pointer-events-auto">
        <button
          id="btn-touch-sprint"
          className="w-14 h-14 flex flex-col items-center justify-center bg-emerald-600 active:bg-emerald-400 text-slate-950 rounded-2xl border border-emerald-300 font-black shadow-[0_0_15px_rgba(16,185,129,0.3)] active:scale-90 transition-all text-[10px]"
          onTouchStart={(e) => { e.preventDefault(); onKeyChange('sprint', true); }}
          onTouchEnd={(e) => { e.preventDefault(); onKeyChange('sprint', false); }}
          onMouseDown={() => onKeyChange('sprint', true)}
          onMouseUp={() => onKeyChange('sprint', false)}
        >
          <Zap className="w-5 h-5 fill-current" />
          <span>TURBO</span>
        </button>

        <button
          id="btn-touch-jump"
          className="w-16 h-16 flex flex-col items-center justify-center bg-red-600 active:bg-red-500 text-white rounded-2xl border border-red-400 font-black shadow-[0_0_20px_rgba(220,38,38,0.4)] active:scale-90 transition-all text-[11px]"
          onTouchStart={(e) => { e.preventDefault(); onKeyChange('up', true); }}
          onTouchEnd={(e) => { e.preventDefault(); onKeyChange('up', false); }}
          onMouseDown={() => onKeyChange('up', true)}
          onMouseUp={() => onKeyChange('up', false)}
        >
          <ArrowUp className="w-6 h-6 stroke-[3]" />
          <span>JUMP</span>
        </button>
      </div>
    </div>
  );
};
