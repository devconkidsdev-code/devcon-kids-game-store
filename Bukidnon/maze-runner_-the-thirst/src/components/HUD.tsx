import React from 'react';
import { GameEngine } from '../game/GameEngine';
import { Volume2, VolumeX, Pause, Play, Sparkles, Shield, Zap, Eye, Clock, Heart, AlertTriangle } from 'lucide-react';
import { soundSynth } from '../audio/SoundSynth';

interface HUDProps {
  engine: GameEngine;
  onPauseToggle: () => void;
  onMuteToggle: () => void;
  isMuted: boolean;
  isPaused: boolean;
}

export const HUD: React.FC<HUDProps> = ({
  engine,
  onPauseToggle,
  onMuteToggle,
  isMuted,
  isPaused
}) => {
  const { player, timeLeft, score, combo, cropsWateredCount, totalCropsNeeded, currentLevelConfig } = engine;
  if (!player) return null;

  const waterPercent = Math.max(0, Math.min(100, Math.round((player.water / player.maxWater) * 100)));
  const isWaterLow = waterPercent <= 25;
  const isTimeLow = timeLeft <= 12;
  const isTimeCritical = timeLeft <= 5;
  const lives = player.lives ?? 3;
  const maxLives = player.maxLives ?? 3;

  return (
    <div className="absolute inset-0 pointer-events-none p-3 md:p-6 flex flex-col justify-between select-none">
      {/* Top Header Bar */}
      <div className="flex items-start justify-between w-full gap-2">
        {/* Left: Bucket Water Slosh Gauge & Lives Panel */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
          {/* Bucket Water Slosh Gauge */}
          <div className="flex items-center gap-3 bg-indigo-950/90 backdrop-blur-md border-2 border-cyan-400/40 rounded-3xl p-2.5 md:p-3.5 shadow-[0_0_25px_rgba(6,182,212,0.25)] pointer-events-auto">
            {/* Animated Bucket Container */}
            <div className="relative w-9 h-11 md:w-11 md:h-13 bg-indigo-900/80 rounded-b-2xl rounded-t-sm border-2 border-cyan-300 overflow-hidden flex items-end shadow-inner">
              {/* Water Fill */}
              <div
                className={`w-full transition-all duration-150 relative ${
                  isWaterLow ? 'bg-gradient-to-t from-pink-600 to-rose-400' : 'bg-gradient-to-t from-cyan-500 via-sky-400 to-pink-400'
                }`}
                style={{ height: `${waterPercent}%` }}
              >
                {/* Sloshing top wave */}
                <div className="absolute -top-1.5 left-0 right-0 h-3 bg-white/50 rounded-full animate-pulse" />
              </div>

              {/* Bucket Handle */}
              <div className="absolute -top-2 left-1 right-1 h-3 border-t-2 border-cyan-200 rounded-t-full" />
            </div>

            <div>
              <div className="text-[10px] font-black tracking-widest uppercase text-indigo-300 flex items-center gap-1">
                <span>Bucket Water</span>
                {isWaterLow && <span className="text-pink-400 font-black animate-bounce">⚠️ LOW!</span>}
              </div>
              <div className="flex items-baseline gap-1">
                <span
                  className={`text-xl md:text-2xl font-black tabular-nums ${
                    isWaterLow ? 'text-pink-400' : 'text-cyan-300'
                  }`}
                >
                  {waterPercent}%
                </span>
                <span className="text-xs font-bold text-indigo-400">/ 100</span>
              </div>
              {player.powerups.lidTimer > 0 && (
                <div className="text-[10px] text-pink-300 flex items-center gap-0.5 font-black uppercase">
                  <Shield className="w-3 h-3 text-pink-400" /> Lid ({Math.ceil(player.powerups.lidTimer)}s)
                </div>
              )}
            </div>
          </div>

          {/* Lives Indicator Card */}
          <div className="flex items-center gap-2 bg-indigo-950/90 backdrop-blur-md border-2 border-rose-500/40 rounded-2xl md:rounded-3xl px-3 py-2 md:py-2.5 shadow-lg pointer-events-auto">
            <div className="flex flex-col">
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-wider text-rose-300">Lives</span>
              <div className="flex items-center gap-1 mt-0.5">
                {Array.from({ length: maxLives }).map((_, idx) => (
                  <Heart
                    key={idx}
                    className={`w-4 h-4 md:w-5 md:h-5 transition-all duration-300 ${
                      idx < lives
                        ? 'text-rose-500 fill-rose-500 drop-shadow-[0_0_6px_rgba(244,63,94,0.8)] scale-100'
                        : 'text-slate-600 fill-slate-800/60 scale-90'
                    } ${lives === 1 && idx === 0 ? 'animate-ping' : ''}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Center: Mission Progress & Level Title */}
        <div className="hidden lg:flex flex-col items-center bg-indigo-950/90 backdrop-blur-md border-2 border-indigo-400/30 rounded-3xl px-6 py-2.5 shadow-xl">
          <div className="text-xs font-black text-yellow-400 uppercase tracking-widest flex items-center gap-1.5">
            <span>{currentLevelConfig.title}</span>
            {engine.maze?.obstacles && engine.maze.obstacles.length > 0 && (
              <span className="bg-sky-500/20 border border-sky-400/40 text-sky-300 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                🎈 {engine.maze.obstacles.length} Toys
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-black uppercase tracking-wider text-indigo-200">Revive:</span>
            <div className="flex gap-1.5">
              {Array.from({ length: totalCropsNeeded }).map((_, i) => (
                <span
                  key={i}
                  className={`text-lg transition-transform duration-300 ${
                    i < cropsWateredCount ? 'scale-110 drop-shadow-[0_0_10px_rgba(236,72,153,0.9)]' : 'opacity-30 grayscale'
                  }`}
                >
                  🌸
                </span>
              ))}
            </div>
            <span className="text-xs font-black text-pink-400 ml-1">
              ({cropsWateredCount}/{totalCropsNeeded})
            </span>
          </div>

          {/* Active Chaser Alert Indicator */}
          {engine.maze?.chasers?.some(c => c.state === 'CHASE' || c.state === 'ALERT') && (
            <div className="mt-1 flex items-center gap-1 text-[10px] font-black text-rose-400 uppercase tracking-widest animate-pulse">
              <span>⚠️ CHASER IN PURSUIT! RUN!</span>
            </div>
          )}
        </div>

        {/* Right: Timer & Score Controls */}
        <div className="flex items-center gap-2 md:gap-2.5 pointer-events-auto">
          {/* Countdown Timer Card */}
          <div
            className={`flex items-center gap-2 bg-indigo-950/90 backdrop-blur-md border-2 rounded-2xl md:rounded-3xl p-2.5 md:p-3.5 shadow-xl transition-all ${
              isTimeCritical
                ? 'border-rose-500 bg-rose-950/90 text-rose-300 scale-105 shadow-[0_0_25px_rgba(244,63,94,0.6)] animate-pulse'
                : isTimeLow
                ? 'border-pink-500 text-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.4)]'
                : 'border-yellow-400/40 text-yellow-300'
            }`}
          >
            <Clock
              className={`w-5 h-5 ${
                isTimeCritical
                  ? 'animate-spin text-rose-400'
                  : isTimeLow
                  ? 'animate-pulse text-pink-400'
                  : 'text-yellow-400'
              }`}
            />
            <div>
              <div className="text-[9px] md:text-[10px] uppercase font-black tracking-widest text-indigo-300 flex items-center gap-1">
                <span>Timer</span>
                {isTimeLow && <span className="text-rose-400 text-[8px] font-black">COUNTDOWN!</span>}
              </div>
              <div className="text-xl md:text-2xl font-black tabular-nums leading-none">
                {Math.max(0, Math.ceil(timeLeft))}s
              </div>
            </div>
          </div>

          {/* Score Card */}
          <div className="hidden sm:flex flex-col bg-indigo-950/90 backdrop-blur-md border-2 border-indigo-400/30 rounded-2xl md:rounded-3xl p-2.5 md:p-3.5 shadow-xl min-w-[90px]">
            <div className="text-[9px] md:text-[10px] uppercase font-black tracking-widest text-indigo-300">Score</div>
            <div className="text-lg md:text-xl font-black text-yellow-400 tabular-nums">{score}</div>
          </div>

          {/* Quick Buttons */}
          <button
            id="hud-mute-btn"
            onClick={onMuteToggle}
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="p-2.5 md:p-3 bg-indigo-900/80 hover:bg-indigo-800 border-2 border-indigo-500/50 rounded-2xl text-cyan-300 hover:text-white transition shadow-lg cursor-pointer active:scale-95"
          >
            {isMuted ? <VolumeX className="w-4 h-4 md:w-5 md:h-5 text-pink-400" /> : <Volume2 className="w-4 h-4 md:w-5 md:h-5" />}
          </button>

          <button
            id="hud-pause-btn"
            onClick={onPauseToggle}
            aria-label={isPaused ? 'Resume Game' : 'Pause Game'}
            className="p-2.5 md:p-3 bg-indigo-900/80 hover:bg-indigo-800 border-2 border-indigo-500/50 rounded-2xl text-cyan-300 hover:text-white transition shadow-lg cursor-pointer active:scale-95"
          >
            {isPaused ? <Play className="w-4 h-4 md:w-5 md:h-5 fill-current text-yellow-400" /> : <Pause className="w-4 h-4 md:w-5 md:h-5" />}
          </button>
        </div>
      </div>

      {/* Bottom Floating Bar: Active Power-Ups & Combo Multiplier */}
      <div className="flex items-end justify-between w-full">
        {/* Active Power-Ups */}
        <div className="flex flex-wrap gap-2">
          {player.powerups.nightVisionTimer > 0 && (
            <div className="flex items-center gap-1.5 bg-indigo-950/90 border-2 border-cyan-400 rounded-2xl px-3.5 py-1.5 shadow-[0_0_15px_rgba(6,182,212,0.4)] text-cyan-300 text-xs font-black uppercase animate-pulse">
              <Eye className="w-4 h-4 text-cyan-400" /> Megabeam ({Math.ceil(player.powerups.nightVisionTimer)}s)
            </div>
          )}

          {player.powerups.turboTimer > 0 && (
            <div className="flex items-center gap-1.5 bg-indigo-950/90 border-2 border-yellow-400 rounded-2xl px-3.5 py-1.5 shadow-[0_0_15px_rgba(250,204,21,0.4)] text-yellow-300 text-xs font-black uppercase animate-pulse">
              <Zap className="w-4 h-4 text-yellow-400" /> Turbo ({Math.ceil(player.powerups.turboTimer)}s)
            </div>
          )}

          {player.powerups.spongeTimer > 0 && (
            <div className="flex items-center gap-1.5 bg-indigo-950/90 border-2 border-pink-500 rounded-2xl px-3.5 py-1.5 shadow-[0_0_15px_rgba(236,72,153,0.4)] text-pink-300 text-xs font-black uppercase">
              <Sparkles className="w-4 h-4 text-pink-400" /> Sponge Shield ({Math.ceil(player.powerups.spongeTimer)}s)
            </div>
          )}
        </div>

        {/* Combo Multiplier Pill */}
        {combo > 1 && (
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-pink-500 to-yellow-400 text-indigo-950 px-5 py-2.5 rounded-2xl shadow-[0_6px_0_#ca8a04] font-black text-sm md:text-base uppercase tracking-wider animate-bounce">
            <span>🔥 COMBO x{combo}!</span>
          </div>
        )}
      </div>
    </div>
  );
};
