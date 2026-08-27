import React from 'react';
import { Heart, Droplets, Clock, Volume2, VolumeX, Music, HelpCircle, RotateCcw, Sparkles } from 'lucide-react';
import { LevelConfig } from '../types';

interface HUDProps {
  level: LevelConfig;
  lives: number;
  maxLives: number;
  waterPoints: number;
  score: number;
  timeLeft: number;
  isHurt: boolean;
  soundEnabled: boolean;
  musicEnabled: boolean;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onRestartLevel: () => void;
  onOpenHowToPlay: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  level,
  lives,
  maxLives,
  waterPoints,
  score,
  timeLeft,
  isHurt,
  soundEnabled,
  musicEnabled,
  onToggleSound,
  onToggleMusic,
  onRestartLevel,
  onOpenHowToPlay,
}) => {
  const waterProgress = Math.min(100, Math.round((waterPoints / level.requiredWater) * 100));
  const isGoalMet = waterPoints >= level.requiredWater;
  const isTimerLow = level.hasTimer && timeLeft <= 15;

  return (
    <header className="w-full select-none" id="game-hud">
      {/* Top Bar: Vibrant Blue Header Frame */}
      <div className="bg-blue-600 p-3 sm:p-4 rounded-t-3xl sm:rounded-t-[32px] flex flex-col md:flex-row items-center justify-between text-white shadow-lg gap-3">
        
        {/* Left Section: Zone, Level Number & Rotating Twist */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex flex-col text-left">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tracking-widest uppercase bg-blue-800/80 px-2 py-0.5 rounded-md text-cyan-200">
                {level.zoneName || `ZONE ${Math.min(5, Math.ceil(level.id / 20))}`}
              </span>
              <span className="text-[10px] font-black tracking-wider uppercase bg-amber-500/90 text-amber-950 px-2 py-0.5 rounded-md">
                {level.twistBadge || '💧 Clear Water'}
              </span>
            </div>
            <span className="text-base sm:text-xl font-black font-heading tracking-wide uppercase mt-0.5">
              LEVEL {level.id}/100: {level.subtitle}
            </span>
          </div>

          {/* Mobile Quick Action Buttons */}
          <div className="flex md:hidden items-center gap-1.5">
            <button
              id="btn-toggle-sound-mobile"
              onClick={onToggleSound}
              title={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
              className="p-2 bg-blue-700 hover:bg-blue-500 border-b-4 border-blue-900 rounded-xl text-white active:translate-y-0.5 active:border-b-2 transition-all"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              id="btn-restart-mobile"
              onClick={onRestartLevel}
              title="Restart Level"
              className="p-2 bg-blue-700 hover:bg-blue-500 border-b-4 border-blue-900 rounded-xl text-white active:translate-y-0.5 active:border-b-2 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center & Right Section: Vibrant 3D Metric Badges */}
        <div className="flex items-center flex-wrap justify-center sm:justify-end gap-2 sm:gap-2.5 w-full md:w-auto">
          
          {/* Plastic Bottle Water Meter */}
          <div
            id="water-bottle-counter"
            className={`px-3 py-1.5 rounded-2xl border-b-4 flex items-center gap-2.5 transition-all shadow-md ${
              isGoalMet
                ? 'bg-emerald-600 border-emerald-800 animate-pulse'
                : 'bg-blue-700 border-blue-900'
            }`}
          >
            {/* Plastic Bottle Icon Visual */}
            <div className="relative w-6 h-8 bg-sky-200/40 border-2 border-sky-300 rounded-md flex flex-col justify-end overflow-hidden shadow-inner">
              {/* Bottle Cap */}
              <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-1.5 bg-blue-900 rounded-t-sm" />
              {/* Rising Blue Water Liquid */}
              <div
                className="w-full bg-cyan-400 transition-all duration-300 relative"
                style={{ height: `${waterProgress}%` }}
              >
                <div className="w-full h-1 bg-white/50" />
              </div>
            </div>

            <div className="flex flex-col text-left">
              <span className="text-[9px] font-black uppercase tracking-wider leading-none text-cyan-200">
                PLASTIC BOTTLE
              </span>
              <span className="text-base sm:text-lg font-black font-heading leading-tight">
                {String(waterPoints).padStart(2, '0')} / {String(level.requiredWater).padStart(2, '0')}
              </span>
              <div className="w-14 h-1 bg-black/30 rounded-full overflow-hidden mt-0.5">
                <div
                  className="h-full bg-cyan-300 transition-all duration-300"
                  style={{ width: `${waterProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Tank Reservation Status Badge */}
          <div className={`px-3 py-1.5 rounded-2xl border-b-4 flex items-center gap-2 text-white shadow-md transition-all ${
            isGoalMet 
              ? 'bg-emerald-700 border-emerald-950'
              : waterProgress === 0
              ? 'bg-amber-900 border-amber-950'
              : 'bg-sky-800 border-sky-950'
          }`}>
            <span className="text-xl">{waterProgress === 0 ? '🏜️' : isGoalMet ? '🏛️' : '💧'}</span>
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-black uppercase tracking-wider leading-none text-sky-200">
                TANK STATUS
              </span>
              <span className="text-sm sm:text-base font-black font-heading">
                {waterProgress === 0 ? '0% EMPTY' : `${waterProgress}%`} {isGoalMet ? 'FULL!' : ''}
              </span>
            </div>
          </div>

          {/* Lives Left Metric */}
          <div
            id="lives-counter"
            className={`bg-blue-700 px-3 py-1.5 rounded-2xl border-b-4 border-blue-900 flex items-center gap-2 text-white transition-all shadow-md ${
              isHurt ? 'bg-rose-600 border-rose-800 animate-bounce' : ''
            }`}
          >
            <span className="text-xl sm:text-2xl">❤️</span>
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-black uppercase tracking-wider leading-none opacity-90">
                LIVES
              </span>
              <span className="text-base sm:text-lg font-black font-heading">
                {lives} / {maxLives}
              </span>
            </div>
          </div>

          {/* Timer Display (if level has timer) */}
          {level.hasTimer && (
            <div
              id="timer-counter"
              className={`px-3 py-1.5 rounded-2xl border-b-4 flex items-center gap-2 text-white shadow-md ${
                isTimerLow
                  ? 'bg-rose-600 border-rose-800 animate-pulse'
                  : 'bg-amber-600 border-amber-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] font-black uppercase tracking-wider leading-none opacity-90">
                  TIME
                </span>
                <span className="text-base sm:text-lg font-black font-heading font-mono">
                  {timeLeft}s
                </span>
              </div>
            </div>
          )}

          {/* Total Score Badge */}
          <div className="bg-orange-500 px-3 py-1.5 rounded-2xl border-b-4 border-orange-700 flex items-center gap-2 text-white shadow-md">
            <span className="text-xl">🏆</span>
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-black uppercase tracking-wider leading-none opacity-90">
                SCORE
              </span>
              <span className="text-base sm:text-lg font-black font-heading">
                {score.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Utility Buttons (Desktop) */}
          <div className="hidden md:flex items-center gap-1.5 ml-1">
            <button
              id="btn-toggle-sound"
              onClick={onToggleSound}
              title={soundEnabled ? 'Mute Sound FX' : 'Enable Sound FX'}
              className="p-2 bg-blue-700 hover:bg-blue-500 active:bg-blue-800 border-b-4 border-blue-900 rounded-xl text-white active:translate-y-0.5 active:border-b-2 transition-all"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              id="btn-toggle-music"
              onClick={onToggleMusic}
              title={musicEnabled ? 'Mute Music' : 'Enable Music'}
              className="p-2 bg-blue-700 hover:bg-blue-500 active:bg-blue-800 border-b-4 border-blue-900 rounded-xl text-white active:translate-y-0.5 active:border-b-2 transition-all"
            >
              <Music className="w-4 h-4" />
            </button>

            <button
              id="btn-restart-level"
              onClick={onRestartLevel}
              title="Restart Level"
              className="p-2 bg-blue-700 hover:bg-blue-500 active:bg-blue-800 border-b-4 border-blue-900 rounded-xl text-white active:translate-y-0.5 active:border-b-2 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              id="btn-how-to-play"
              onClick={onOpenHowToPlay}
              title="How to Play"
              className="p-2 bg-blue-700 hover:bg-blue-500 active:bg-blue-800 border-b-4 border-blue-900 rounded-xl text-white active:translate-y-0.5 active:border-b-2 transition-all"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Goal Reached Status Banner */}
      {isGoalMet && (
        <div className="bg-emerald-500 border-b-4 border-emerald-700 py-1.5 px-4 text-center text-xs sm:text-sm font-black text-white flex items-center justify-center gap-2 shadow-inner uppercase tracking-wide animate-pulse">
          <Sparkles className="w-4 h-4 text-yellow-300" />
          <span>Plastic bottle is full of clean water! Walk to the Community Tank to raise the village reservation!</span>
        </div>
      )}
    </header>
  );
};

