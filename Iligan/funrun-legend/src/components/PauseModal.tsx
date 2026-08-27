import React from 'react';
import { Play, RotateCcw, Menu } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onMenu,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#050805]/95 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center shadow-[0_0_50px_rgba(16,185,129,0.2)] animate-in fade-in zoom-in-95 duration-150 relative overflow-hidden">
        {/* Background watermark */}
        <div className="text-[70px] font-black leading-none tracking-tighter text-emerald-500/5 absolute -bottom-4 -right-4 pointer-events-none select-none">
          PAUSED
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/15 border border-emerald-500/40 rounded-full text-[9px] font-bold text-emerald-400 tracking-[0.25em] uppercase mb-2">
          Race Paused
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white italic tracking-tight mb-1 drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">
          SPRINT <span className="text-emerald-400">HOLD</span>
        </h2>
        <p className="text-emerald-100/70 text-xs mb-6">
          Alexander is catching his breath on the province track.
        </p>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={onResume}
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black italic tracking-widest text-sm uppercase rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all active:scale-[0.98] cursor-pointer"
          >
            <Play className="w-5 h-5 fill-black" />
            RESUME SPRINT
          </button>

          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 py-3 bg-black/60 hover:bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-2xl transition-all active:scale-95 cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.1)]"
          >
            <RotateCcw className="w-4 h-4 text-emerald-400" />
            RESTART STAGE
          </button>

          <button
            onClick={onMenu}
            className="flex items-center justify-center gap-2 py-3 bg-black/60 hover:bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 text-xs font-bold rounded-2xl transition-all active:scale-95 cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.1)]"
          >
            <Menu className="w-4 h-4 text-emerald-400" />
            EXIT TO MENU
          </button>
        </div>
      </div>
    </div>
  );
};

