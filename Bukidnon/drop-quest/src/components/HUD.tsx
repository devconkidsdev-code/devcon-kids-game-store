import React from 'react';
import { Heart, Timer, Droplets, Volume2, VolumeX, Pause, Play, Sparkles, Zap } from 'lucide-react';
import { GameState } from '../types';

interface HUDProps {
  state: GameState;
  levelName: string;
  onToggleSound: () => void;
  onTogglePause: () => void;
}

export const HUD: React.FC<HUDProps> = ({ state, levelName, onToggleSound, onTogglePause }) => {
  const isTimeCritical = state.timeLeft <= 10;
  const isHealthCritical = state.lives <= 1;

  return (
    <div id="game-hud" className="absolute top-0 left-0 right-0 p-3 sm:p-4 pointer-events-none select-none z-20">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-4">
        
        {/* Left: Lives & Level */}
        <div className="flex items-center gap-2 sm:gap-3 bg-amber-950/80 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl border border-amber-500/30 shadow-lg pointer-events-auto">
          <div className="flex items-center gap-1">
            {Array.from({ length: state.maxLives }).map((_, i) => (
              <Heart
                key={i}
                id={`hud-heart-${i}`}
                className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 ${
                  i < state.lives
                    ? 'text-red-500 fill-red-500 drop-shadow-[0_0_8px_rgba(239,68,68,0.6)]'
                    : 'text-stone-600 fill-stone-800'
                } ${isHealthCritical && i === 0 ? 'animate-bounce' : ''}`}
              />
            ))}
          </div>

          <div className="h-4 w-px bg-amber-500/30 hidden sm:block" />

          <div className="hidden sm:block">
            <span className="text-xs uppercase font-bold tracking-wider text-amber-200/80 block leading-tight">
              {levelName.split(':')[0]}
            </span>
            <span className="text-sm font-extrabold text-amber-100 leading-tight">
              {state.score} <span className="text-xs font-medium text-amber-300">PTS</span>
            </span>
          </div>
        </div>

        {/* Center: Timer & Water Progress & Water Gun Ammo */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Timer */}
          <div
            id="hud-timer"
            className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl border shadow-lg transition-colors ${
              isTimeCritical
                ? 'bg-red-950/90 border-red-500 text-red-200 animate-pulse'
                : 'bg-amber-950/80 border-amber-500/30 text-amber-100'
            }`}
          >
            <Timer className={`w-4 h-4 sm:w-5 sm:h-5 ${isTimeCritical ? 'text-red-400 animate-spin' : 'text-amber-400'}`} />
            <span className="font-mono font-black text-base sm:text-xl tracking-tight">
              {Math.ceil(state.timeLeft)}s
            </span>
          </div>

          {/* Super Water Gun Power-Up Badge (if acquired) */}
          {state.hasWaterGun && (
            <div
              id="hud-watergun"
              className="flex items-center gap-2 bg-gradient-to-r from-sky-950/90 via-cyan-950/90 to-blue-950/90 backdrop-blur-md px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-2xl border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.4)] animate-pulse"
            >
              <div className="w-6 h-6 rounded-lg bg-cyan-500/30 border border-cyan-400 flex items-center justify-center text-cyan-300">
                <Zap className="w-4 h-4 fill-cyan-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-cyan-300 tracking-wider uppercase leading-none">
                  WATER BLASTER
                </span>
                <span className="font-mono text-xs sm:text-sm font-bold text-white leading-tight">
                  {state.waterAmmo} <span className="text-[10px] text-cyan-200 font-sans font-normal hidden sm:inline">[SPACE to Shoot]</span>
                </span>
              </div>
            </div>
          )}

          {/* Drops Progress Bar */}
          <div
            id="hud-progress"
            className="flex items-center gap-2 sm:gap-3 bg-amber-950/80 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl border border-amber-500/30 shadow-lg min-w-[130px] sm:min-w-[200px]"
          >
            <Droplets className="w-5 h-5 text-sky-400 fill-sky-400/30 shrink-0" />
            <div className="flex-1">
              <div className="flex justify-between items-center text-[10px] sm:text-xs font-bold text-sky-200 mb-1">
                <span>HYDRATION</span>
                <span>{state.progressPercent}%</span>
              </div>
              {/* Progress Track */}
              <div className="w-full h-2.5 sm:h-3 bg-stone-900/80 rounded-full overflow-hidden p-0.5 border border-sky-500/20">
                <div
                  className="h-full bg-gradient-to-r from-sky-500 via-cyan-400 to-blue-500 rounded-full transition-all duration-300 relative shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                  style={{ width: `${state.progressPercent}%` }}
                >
                  {state.progressPercent > 10 && (
                    <Sparkles className="w-2.5 h-2.5 text-white absolute right-0.5 top-0 animate-pulse" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Audio & Pause Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            id="btn-sound-toggle"
            onClick={onToggleSound}
            aria-label={state.soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
            className="p-2 sm:p-2.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-500/30 text-amber-200 hover:text-white transition-all shadow-md active:scale-95 cursor-pointer"
          >
            {state.soundEnabled ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-stone-400" />}
          </button>

          <button
            id="btn-pause-toggle"
            onClick={onTogglePause}
            aria-label={state.isPaused ? 'Resume Game' : 'Pause Game'}
            className="p-2 sm:p-2.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-500/30 text-amber-200 hover:text-white transition-all shadow-md active:scale-95 cursor-pointer"
          >
            {state.isPaused ? <Play className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" /> : <Pause className="w-4 h-4 sm:w-5 sm:h-5" />}
          </button>
        </div>

      </div>
    </div>
  );
};
