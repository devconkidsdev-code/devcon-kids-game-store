import React from 'react';
import { Play, RotateCcw, ArrowLeft, Volume2, VolumeX, Shield } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onMainMenu: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onMainMenu,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md select-none font-sans">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-sm p-6 sm:p-8 flex flex-col items-center text-center shadow-[0_0_50px_rgba(0,0,0,0.8)] relative overflow-hidden backdrop-blur-xl">
        <div className="absolute inset-0 bg-dot-grid opacity-10 pointer-events-none" />

        {/* Top Header Badge */}
        <div className="relative z-10 w-14 h-14 rounded-2xl bg-slate-800/90 border border-slate-700 flex items-center justify-center text-amber-400 mb-3 shadow-lg">
          <Shield className="w-7 h-7" />
        </div>

        <div className="relative z-10">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400 block mb-1">
            STANDBY // SYSTEM PAUSED
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight uppercase italic">
            GAME PAUSED
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Timer and flood surge are suspended.
          </p>
        </div>

        <div className="relative z-10 w-full space-y-2.5 my-5">
          <button
            onClick={onResume}
            className="w-full py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-95 border border-amber-300"
          >
            <Play className="w-4 h-4 fill-current" /> RESUME ESCAPE
          </button>

          <button
            onClick={onRestart}
            className="w-full py-3 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-600 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" /> Restart Level
          </button>

          <button
            onClick={onToggleMute}
            className="w-full py-3 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-600"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>{isMuted ? 'Unmute Audio' : 'Mute Audio'}</span>
          </button>

          <button
            onClick={onMainMenu}
            className="w-full py-3 px-4 rounded-xl bg-slate-950/70 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-800 active:scale-95"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Return to Main Menu
          </button>
        </div>

        <span className="relative z-10 text-[11px] text-slate-500 font-mono">Press ESC or P to Resume</span>
      </div>
    </div>
  );
};

