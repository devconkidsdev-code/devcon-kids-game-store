import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onHome,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <div id="pause-modal" className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-gradient-to-b from-stone-900 to-amber-950/90 rounded-3xl border-2 border-amber-500/40 p-6 text-stone-100 shadow-2xl text-center">
        <h3 className="text-2xl font-black text-amber-200 mb-5 tracking-tight uppercase">
          GAME PAUSED
        </h3>

        <div className="space-y-3">
          <button
            id="btn-pause-resume"
            onClick={onResume}
            className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-stone-950 font-black text-sm uppercase tracking-wide shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-stone-950" />
            <span>Resume</span>
          </button>

          <button
            id="btn-pause-restart"
            onClick={onRestart}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart Level</span>
          </button>

          <button
            id="btn-pause-sound"
            onClick={onToggleSound}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-red-400" />}
            <span>Sound: {soundEnabled ? 'ON' : 'MUTED'}</span>
          </button>

          <button
            id="btn-pause-home"
            onClick={onHome}
            className="w-full py-2.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-400 hover:text-stone-200 font-bold text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Quit to Title</span>
          </button>
        </div>
      </div>
    </div>
  );
};
