import React from 'react';
import { ArrowUp, ArrowDown, Zap, Octagon, Volume2 } from 'lucide-react';
import { RacingMode } from '../types/game';
import { soundManager } from '../utils/audio';

interface ControlDeckProps {
  mode: RacingMode;
  activePlayerId: 'player1' | 'player2';
  // Primary player control states / callbacks
  onRunPress: (isPressed: boolean) => void;
  onStopPress: (isPressed: boolean) => void;
  onUpPress: () => void;
  onDownPress: () => void;
  isRunning: boolean;
  isStopping: boolean;
  canMoveUp: boolean;
  canMoveDown: boolean;
  // Simultaneous P2 controls (if mode === 'simultaneous')
  p2Controls?: {
    onRunPress: (isPressed: boolean) => void;
    onStopPress: (isPressed: boolean) => void;
    onUpPress: () => void;
    onDownPress: () => void;
    isRunning: boolean;
    isStopping: boolean;
    canMoveUp: boolean;
    canMoveDown: boolean;
  };
  onHorn: () => void;
}

export const ControlDeck: React.FC<ControlDeckProps> = ({
  mode,
  activePlayerId,
  onRunPress,
  onStopPress,
  onUpPress,
  onDownPress,
  isRunning,
  isStopping,
  canMoveUp,
  canMoveDown,
  p2Controls,
  onHorn
}) => {
  // If Simultaneous mode is enabled
  if (mode === 'simultaneous' && p2Controls) {
    return (
      <footer className="w-full bg-sky-950 p-4 md:p-6 border-t-8 border-sky-900 rounded-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.4)] select-none grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Player 1 Controls (WASD) - Red Boat */}
        <div className="bg-red-950/40 border-2 border-red-500/60 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-black text-red-300 text-sm uppercase tracking-wider flex items-center gap-1.5">
              <span>🚤</span> Red Boat Controls <span className="text-xs text-red-200 font-bold">[WASD]</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Direction */}
            <div className="flex flex-col gap-2">
              <button
                disabled={!canMoveUp}
                onClick={onUpPress}
                className={`h-14 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 border-b-4 transition-all cursor-pointer ${
                  canMoveUp
                    ? 'bg-sky-700 hover:bg-sky-600 text-white border-sky-900 active:border-b-0 active:translate-y-1'
                    : 'bg-sky-900/40 text-sky-400/40 border-sky-950 cursor-not-allowed opacity-50'
                }`}
              >
                <ArrowUp className="w-4 h-4" />
                <span>UP PATH (W)</span>
              </button>

              <button
                disabled={!canMoveDown}
                onClick={onDownPress}
                className={`h-14 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 border-b-4 transition-all cursor-pointer ${
                  canMoveDown
                    ? 'bg-sky-700 hover:bg-sky-600 text-white border-sky-900 active:border-b-0 active:translate-y-1'
                    : 'bg-sky-900/40 text-sky-400/40 border-sky-950 cursor-not-allowed opacity-50'
                }`}
              >
                <ArrowDown className="w-4 h-4" />
                <span>DOWN PATH (S)</span>
              </button>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                onMouseDown={() => onRunPress(true)}
                onMouseUp={() => onRunPress(false)}
                onMouseLeave={() => onRunPress(false)}
                onTouchStart={() => onRunPress(true)}
                onTouchEnd={() => onRunPress(false)}
                className={`h-14 rounded-2xl font-black text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isRunning
                    ? 'bg-emerald-400 text-white translate-y-1 border-b-0 shadow-inner'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-white border-b-6 border-emerald-700 active:border-b-0 active:translate-y-1'
                }`}
              >
                <span className="text-xl">🔥</span>
                <span>RUN (D)</span>
              </button>

              <button
                onMouseDown={() => onStopPress(true)}
                onMouseUp={() => onStopPress(false)}
                onMouseLeave={() => onStopPress(false)}
                onTouchStart={() => onStopPress(true)}
                onTouchEnd={() => onStopPress(false)}
                className={`h-14 rounded-2xl font-black text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  isStopping
                    ? 'bg-red-500 text-white translate-y-1 border-b-0 shadow-inner'
                    : 'bg-red-600 hover:bg-red-500 text-white border-b-6 border-red-800 active:border-b-0 active:translate-y-1'
                }`}
              >
                <span className="text-xl">🛑</span>
                <span>STOP (A)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Player 2 Controls (Arrows) - Blue Boat */}
        <div className="bg-blue-950/40 border-2 border-blue-500/60 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-black text-blue-300 text-sm uppercase tracking-wider flex items-center gap-1.5">
              <span>🚤</span> Blue Boat Controls <span className="text-xs text-blue-200 font-bold">[Arrows]</span>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Direction */}
            <div className="flex flex-col gap-2">
              <button
                disabled={!p2Controls.canMoveUp}
                onClick={p2Controls.onUpPress}
                className={`h-14 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 border-b-4 transition-all cursor-pointer ${
                  p2Controls.canMoveUp
                    ? 'bg-sky-700 hover:bg-sky-600 text-white border-sky-900 active:border-b-0 active:translate-y-1'
                    : 'bg-sky-900/40 text-sky-400/40 border-sky-950 cursor-not-allowed opacity-50'
                }`}
              >
                <ArrowUp className="w-4 h-4" />
                <span>UP PATH (↑)</span>
              </button>

              <button
                disabled={!p2Controls.canMoveDown}
                onClick={p2Controls.onDownPress}
                className={`h-14 rounded-2xl font-black text-xs flex items-center justify-center gap-1.5 border-b-4 transition-all cursor-pointer ${
                  p2Controls.canMoveDown
                    ? 'bg-sky-700 hover:bg-sky-600 text-white border-sky-900 active:border-b-0 active:translate-y-1'
                    : 'bg-sky-900/40 text-sky-400/40 border-sky-950 cursor-not-allowed opacity-50'
                }`}
              >
                <ArrowDown className="w-4 h-4" />
                <span>DOWN PATH (↓)</span>
              </button>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button
                onMouseDown={() => p2Controls.onRunPress(true)}
                onMouseUp={() => p2Controls.onRunPress(false)}
                onMouseLeave={() => p2Controls.onRunPress(false)}
                onTouchStart={() => p2Controls.onRunPress(true)}
                onTouchEnd={() => p2Controls.onRunPress(false)}
                className={`h-14 rounded-2xl font-black text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  p2Controls.isRunning
                    ? 'bg-emerald-400 text-white translate-y-1 border-b-0 shadow-inner'
                    : 'bg-emerald-500 hover:bg-emerald-400 text-white border-b-6 border-emerald-700 active:border-b-0 active:translate-y-1'
                }`}
              >
                <span className="text-xl">🔥</span>
                <span>RUN (→)</span>
              </button>

              <button
                onMouseDown={() => p2Controls.onStopPress(true)}
                onMouseUp={() => p2Controls.onStopPress(false)}
                onMouseLeave={() => p2Controls.onStopPress(false)}
                onTouchStart={() => p2Controls.onStopPress(true)}
                onTouchEnd={() => p2Controls.onStopPress(false)}
                className={`h-14 rounded-2xl font-black text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  p2Controls.isStopping
                    ? 'bg-red-500 text-white translate-y-1 border-b-0 shadow-inner'
                    : 'bg-red-600 hover:bg-red-500 text-white border-b-6 border-red-800 active:border-b-0 active:translate-y-1'
                }`}
              >
                <span className="text-xl">🛑</span>
                <span>STOP (←)</span>
              </button>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Turn-based Bold Typography Deck (Matching Design HTML exactly)
  const isP1 = activePlayerId === 'player1';

  return (
    <footer className="w-full bg-sky-950 p-4 sm:p-6 md:p-8 flex flex-col md:flex-row justify-between items-center border-t-8 border-sky-900 rounded-3xl shadow-[0_-10px_30px_rgba(0,0,0,0.3)] gap-4 select-none">
      
      {/* Left: Stop & Full Run Chunky Arcade Buttons */}
      <div className="flex gap-3 sm:gap-4 w-full md:w-auto h-24 sm:h-28">
        
        {/* STOP BUTTON */}
        <button
          onMouseDown={() => onStopPress(true)}
          onMouseUp={() => onStopPress(false)}
          onMouseLeave={() => onStopPress(false)}
          onTouchStart={() => onStopPress(true)}
          onTouchEnd={() => onStopPress(false)}
          className={`w-28 sm:w-36 h-full bg-red-600 hover:bg-red-500 rounded-2xl flex flex-col items-center justify-center group transition-all cursor-pointer ${
            isStopping 
              ? 'border-b-0 translate-y-2 bg-red-700 shadow-inner' 
              : 'border-b-8 border-red-800 active:border-b-0 active:translate-y-2'
          }`}
          title="Stop or Slow Boat (A / ←)"
        >
          <span className="text-3xl sm:text-4xl">🛑</span>
          <span className="font-black text-xs sm:text-sm mt-1 uppercase text-white tracking-wider">STOP</span>
          <span className="text-[9px] font-bold text-red-200 opacity-75">[A / ←]</span>
        </button>

        {/* FULL RUN BUTTON */}
        <button
          onMouseDown={() => onRunPress(true)}
          onMouseUp={() => onRunPress(false)}
          onMouseLeave={() => onRunPress(false)}
          onTouchStart={() => onRunPress(true)}
          onTouchEnd={() => onRunPress(false)}
          className={`flex-1 sm:w-56 h-full bg-emerald-500 hover:bg-emerald-400 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
            isRunning 
              ? 'border-b-0 translate-y-2 bg-emerald-600 shadow-inner ring-4 ring-emerald-300/40' 
              : 'border-b-8 border-emerald-700 active:border-b-0 active:translate-y-2 shadow-lg'
          }`}
          title="Full Speed Run (Space / D / →)"
        >
          <span className="text-3xl sm:text-4xl">🔥</span>
          <span className="font-black text-xl sm:text-2xl leading-none mt-1 uppercase text-white tracking-tight italic">FULL RUN</span>
          <span className="text-[10px] font-bold text-emerald-100 opacity-80 mt-0.5">[Space / D / →]</span>
        </button>

      </div>

      {/* Center: Path Control (Up Path / Down Path) */}
      <div className="flex-1 px-2 sm:px-6 w-full flex flex-col items-center">
        <div className="text-[11px] font-black tracking-[0.3em] uppercase text-sky-300/80 mb-2">
          River Path Control
        </div>
        <div className="flex gap-3 w-full max-w-md justify-center">
          
          <button
            disabled={!canMoveUp}
            onClick={onUpPress}
            className={`flex-1 h-16 rounded-2xl flex items-center justify-center gap-2 font-black text-sm uppercase tracking-wider transition-all cursor-pointer ${
              canMoveUp
                ? 'bg-sky-700 hover:bg-sky-600 text-white border-b-4 border-sky-900 active:border-b-0 active:translate-y-1 shadow-md'
                : 'bg-sky-900/40 text-sky-400/40 border-sky-950 cursor-not-allowed opacity-50'
            }`}
            title="Move to Upper Path (W / ↑)"
          >
            <ArrowUp className="w-5 h-5 stroke-[3]" />
            <div className="flex flex-col text-left leading-tight">
              <span>UP PATH</span>
              <span className="text-[9px] text-sky-300 font-bold opacity-80">[W / ↑]</span>
            </div>
          </button>

          <button
            disabled={!canMoveDown}
            onClick={onDownPress}
            className={`flex-1 h-16 rounded-2xl flex items-center justify-center gap-2 font-black text-sm uppercase tracking-wider transition-all cursor-pointer ${
              canMoveDown
                ? 'bg-sky-700 hover:bg-sky-600 text-white border-b-4 border-sky-900 active:border-b-0 active:translate-y-1 shadow-md'
                : 'bg-sky-900/40 text-sky-400/40 border-sky-950 cursor-not-allowed opacity-50'
            }`}
            title="Move to Lower Path (S / ↓)"
          >
            <ArrowDown className="w-5 h-5 stroke-[3]" />
            <div className="flex flex-col text-left leading-tight">
              <span>DOWN PATH</span>
              <span className="text-[9px] text-sky-300 font-bold opacity-80">[S / ↓]</span>
            </div>
          </button>

        </div>
      </div>

      {/* Right: Driver Indicator & Horn Honk */}
      <div className="flex items-center gap-3 w-full md:w-auto justify-end">
        <button
          onClick={() => {
            soundManager.playHorn();
            onHorn();
          }}
          className="h-16 px-6 bg-yellow-400 hover:bg-yellow-300 text-sky-950 font-black text-base italic rounded-2xl border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1 transition-all flex items-center gap-2 shadow-lg cursor-pointer shrink-0"
          title="Honk Boat Horn (H)"
        >
          <Volume2 className="w-5 h-5 stroke-[2.5]" />
          <span>HONK (H)</span>
        </button>
      </div>

    </footer>
  );
};
