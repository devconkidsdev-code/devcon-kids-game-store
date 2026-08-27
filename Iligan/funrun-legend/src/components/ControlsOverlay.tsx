import React from 'react';

// The bulky "Province Navigation" and "Action Control" blocks have been removed as requested.
// This component now only provides a discreet, non-blocking desktop key hint at the very bottom center.
export const ControlsOverlay: React.FC = () => {
  return (
    <div className="absolute inset-x-0 bottom-2 pointer-events-none z-10 select-none flex justify-center items-center px-4">
      <div className="hidden sm:flex items-center gap-2 bg-black/50 backdrop-blur-md px-3.5 py-1 rounded-full border border-emerald-500/30 text-[10px] font-mono text-emerald-200/80 shadow-md">
        <span className="text-amber-400 font-bold">SPACE = THROW ROCK 🪨</span>
        <span className="text-emerald-500/40">•</span>
        <span className="text-emerald-400 font-bold">▲ / W = JUMP</span>
        <span className="text-emerald-500/40">•</span>
        <span>▼ / S = SLIDE</span>
        <span className="text-emerald-500/40">•</span>
        <span>► / D = SPRINT</span>
        <span className="text-emerald-500/40">•</span>
        <span>◄ / A = BRAKE</span>
      </div>
    </div>
  );
};
