import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX, Sliders } from 'lucide-react';
import { soundSynth } from '../audio/SoundSynth';

interface PauseModalProps {
  onResume: () => void;
  onRetry: () => void;
  onMenu: () => void;
  isMuted: boolean;
  onMuteToggle: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRetry,
  onMenu,
  isMuted,
  onMuteToggle
}) => {
  return (
    <div className="absolute inset-0 z-50 bg-indigo-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-indigo-900/90 border-2 border-indigo-400/40 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(79,70,229,0.3)] text-center flex flex-col items-center">
        <h3 className="text-3xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-yellow-300 to-cyan-300 mb-1">
          PAUSED
        </h3>
        <p className="text-xs text-indigo-300 mb-6 font-medium">Catch your breath before entering the maze</p>

        {/* Audio Volume Toggles */}
        <div className="w-full bg-indigo-950/80 border border-indigo-500/40 rounded-2xl p-3.5 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black uppercase text-indigo-200">
            {isMuted ? <VolumeX className="w-4 h-4 text-pink-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
            <span>Game Audio</span>
          </div>
          <button
            id="pause-mute-btn"
            onClick={onMuteToggle}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer ${
              isMuted
                ? 'bg-pink-500/20 text-pink-400 border border-pink-500/50'
                : 'bg-cyan-500 text-indigo-950 shadow-[0_0_10px_rgba(6,182,212,0.5)]'
            }`}
          >
            {isMuted ? 'MUTED' : 'ACTIVE'}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-3">
          <button
            id="resume-btn"
            onClick={onResume}
            className="w-full py-4 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-indigo-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#0891b2] active:translate-y-1 active:shadow-[0_2px_0_#0891b2] transition cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>RESUME GAME</span>
          </button>

          <button
            id="pause-retry-btn"
            onClick={onRetry}
            className="w-full py-3 px-4 rounded-2xl bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border border-indigo-700/60 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart Level</span>
          </button>

          <button
            id="pause-menu-btn"
            onClick={onMenu}
            className="w-full py-3 px-4 rounded-2xl bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border border-indigo-700/60 transition cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Main Menu</span>
          </button>
        </div>
      </div>
    </div>
  );
};
