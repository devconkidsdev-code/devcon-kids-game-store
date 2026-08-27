import React from 'react';
import { Heart, Droplets, Trophy, Clock, Volume2, VolumeX, Pause, Play } from 'lucide-react';
import { GameStats } from '../types';

interface GameHUDProps {
  stats: GameStats;
  isMuted: boolean;
  isPaused: boolean;
  onToggleMute: () => void;
  onTogglePause: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  isMuted,
  isPaused,
  onToggleMute,
  onTogglePause,
}) => {
  const isTimeCritical = stats.timeLeft <= 10;
  const isWaterLow = stats.waterRemaining <= (stats.maxWater * 0.25);
  const targetProgress = Math.min(100, Math.round((stats.score / stats.targetScore) * 100));

  return (
    <header className="relative z-30 w-full max-w-5xl mx-auto px-2 sm:px-4 pt-2 sm:pt-4">
      {/* Main Frosted Glass Nav Container */}
      <div className="bg-white/15 backdrop-blur-xl border border-white/30 rounded-3xl p-2.5 sm:p-3 shadow-[0_8px_32px_rgba(0,0,0,0.25)] text-white flex flex-wrap items-center justify-between gap-2 sm:gap-4">
        
        {/* Left Section: Level & Target Glass Metric Cards */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Level Glass Badge */}
          <div className="bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1.5 rounded-2xl shadow-lg flex flex-col items-center min-w-[58px]">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-white/80 font-extrabold">LEVEL</span>
            <span className="text-xl sm:text-2xl font-black text-white leading-none drop-shadow-sm">{stats.level}</span>
          </div>

          {/* Score & Progress Glass Card */}
          <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl px-3 py-1.5 shadow-lg flex flex-col min-w-[110px] sm:min-w-[140px]">
            <div className="flex items-center justify-between text-xs font-black">
              <span className="flex items-center gap-1 text-white/90 text-[10px] sm:text-xs uppercase tracking-wider">
                <Trophy className="w-3.5 h-3.5 text-yellow-300 drop-shadow-xs" />
                <span>Score</span>
              </span>
              <span className="text-yellow-300 drop-shadow-xs font-mono">{stats.score} / {stats.targetScore}</span>
            </div>
            
            {/* Target Progress Bar */}
            <div className="w-full bg-black/30 backdrop-blur-sm rounded-full h-2 border border-white/20 mt-1 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-yellow-300 to-amber-400 transition-all duration-300 shadow-[0_0_8px_rgba(250,204,21,0.6)]"
                style={{ width: `${targetProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center: Frosted Capsule for Lives & Countdown Timer */}
        <div className="flex items-center gap-2 sm:gap-4 bg-black/35 backdrop-blur-xl border border-white/20 rounded-full px-3.5 sm:px-5 py-1.5 shadow-inner">
          {/* Lives (3 Hearts) */}
          <div className="flex items-center gap-1">
            {Array.from({ length: stats.maxLives }).map((_, i) => {
              const isAlive = i < stats.lives;
              return (
                <Heart
                  key={i}
                  className={`w-5 h-5 sm:w-6 sm:h-6 transition-all duration-300 ${
                    isAlive
                      ? 'text-rose-500 fill-rose-500 scale-100 drop-shadow-[0_0_8px_rgba(244,63,94,0.7)] animate-[pulse_2s_ease-in-out_infinite]'
                      : 'text-white/20 fill-white/10 scale-90 opacity-30'
                  }`}
                />
              );
            })}
          </div>

          <div className="h-5 w-[1px] bg-white/20" />

          {/* Countdown Timer with Status Bulb */}
          <div className="flex items-center gap-1.5 font-black">
            <span className={`w-2.5 h-2.5 rounded-full ${isTimeCritical ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'}`} />
            <Clock className={`w-4 h-4 ${isTimeCritical ? 'text-rose-400 animate-pulse' : 'text-white/80'}`} />
            <span className={`text-base sm:text-lg font-mono tracking-tight ${isTimeCritical ? 'text-rose-300 font-extrabold animate-pulse' : 'text-white'}`}>
              {stats.timeLeft}s
            </span>
          </div>
        </div>

        {/* Right Section: Smart Water Tank & Frosted Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Water Tank Capacity Gauge */}
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border backdrop-blur-md shadow-lg transition-colors ${
            isWaterLow 
              ? 'bg-rose-500/25 border-rose-400/60 text-rose-100 shadow-[0_0_15px_rgba(244,63,94,0.3)]' 
              : 'bg-white/20 border-white/30 text-white'
          }`}>
            <Droplets className={`w-5 h-5 ${isWaterLow ? 'text-rose-300 animate-bounce' : 'text-cyan-300 drop-shadow-xs'}`} />
            <div className="flex flex-col min-w-[70px] sm:min-w-[85px]">
              <div className="flex justify-between text-[10px] font-black tracking-wider">
                <span className="text-white/80">WATER</span>
                <span className={isWaterLow ? 'text-rose-300 font-extrabold' : 'text-cyan-300'}>
                  {Math.round(stats.waterRemaining)}L
                </span>
              </div>
              <div className="w-full bg-black/35 rounded-full h-2 border border-white/20 overflow-hidden mt-0.5 p-0.2">
                <div
                  className={`h-full rounded-full transition-all duration-150 ${
                    isWaterLow ? 'bg-rose-500' : 'bg-gradient-to-r from-blue-500 to-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.6)]'
                  }`}
                  style={{ width: `${Math.max(0, Math.min(100, (stats.waterRemaining / stats.maxWater) * 100))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Action Controls: Pause & Sound */}
          <div className="flex items-center gap-1.5">
            <button
              id="hud-mute-btn"
              onClick={onToggleMute}
              className="p-2 rounded-2xl bg-white/15 hover:bg-white/25 active:bg-white/35 backdrop-blur-md text-white border border-white/30 transition-all shadow-md active:scale-95 cursor-pointer"
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              aria-label="Toggle Sound"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-300" /> : <Volume2 className="w-4 h-4 text-emerald-300" />}
            </button>

            <button
              id="hud-pause-btn"
              onClick={onTogglePause}
              className="p-2 rounded-2xl bg-white/15 hover:bg-white/25 active:bg-white/35 backdrop-blur-md text-white border border-white/30 transition-all shadow-md active:scale-95 cursor-pointer"
              title={isPaused ? 'Resume Game' : 'Pause Game'}
              aria-label="Toggle Pause"
            >
              {isPaused ? <Play className="w-4 h-4 text-yellow-300" /> : <Pause className="w-4 h-4 text-white" />}
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Combo Streak Badge */}
      {stats.combo > 1 && (
        <div className="absolute top-18 right-6 z-40 bg-white/25 backdrop-blur-xl text-white font-black text-xs sm:text-sm px-3.5 py-1.5 rounded-full shadow-[0_8px_32px_rgba(245,158,11,0.5)] border border-yellow-300/80 animate-bounce flex items-center gap-1.5">
          <span>⚡</span>
          <span className="text-yellow-300">COMBO x{stats.combo}!</span>
          <span className="text-[10px] bg-black/40 px-2 py-0.5 rounded-full font-mono text-amber-200 border border-white/20">
            +{(stats.combo - 1) * 2} BONUS
          </span>
        </div>
      )}
    </header>
  );
};
