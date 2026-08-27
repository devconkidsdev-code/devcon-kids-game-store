import React from 'react';
import { Zap, Volume2, VolumeX, Pause, Shield, Flame, Trophy, Skull } from 'lucide-react';
import { LevelConfig, Player, Boss } from '../types';

interface HUDProps {
  player: Player;
  level: LevelConfig;
  timeRemaining: number;
  timeSpent?: number;
  score: number;
  difficultyTier?: number;
  tierAnnounceText?: string;
  tierAnnounceTimer?: number;
  boss?: Boss | null;
  onThrowRock?: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  player,
  level,
  timeRemaining,
  timeSpent = 0,
  score,
  difficultyTier = 1,
  tierAnnounceText,
  tierAnnounceTimer = 0,
  boss = null,
  onThrowRock,
  isMuted,
  onToggleMute,
  onPause,
}) => {
  const isInfinite = !!level.isInfinite;
  const distanceRemaining = Math.max(0, Math.round(level.distanceToSafeZone - player.distanceTraveled));
  const distanceTraveled = Math.round(player.distanceTraveled);
  
  // Progress calculation
  const progressPercent = isInfinite
    ? Math.min(100, Math.round(((distanceTraveled % 500) / 500) * 100))
    : Math.min(100, Math.round((player.distanceTraveled / level.distanceToSafeZone) * 100));

  const speedKmH = Math.round(player.speed * 2.8);
  const isTimeCritical = !isInfinite && timeRemaining <= 5;

  // Format time (countdown or elapsed)
  const displayTime = isInfinite ? timeSpent : timeRemaining;
  const minutes = Math.floor(displayTime / 60);
  const seconds = Math.floor(displayTime % 60);
  const fraction = Math.floor((displayTime - Math.floor(displayTime)) * 10);
  const formattedMinutes = minutes.toString().padStart(2, '0');
  const formattedSec = seconds.toString().padStart(2, '0');

  return (
    <div className="absolute inset-x-0 top-0 p-3 sm:p-4 pointer-events-none z-20 flex flex-col gap-2 font-sans select-none">
      {/* Dynamic Tier Escalation Surge Banner */}
      {tierAnnounceTimer > 0 && tierAnnounceText && (
        <div className="max-w-md mx-auto w-full animate-bounce">
          <div className="bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-400 p-[2px] rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.8)]">
            <div className="bg-black/90 px-4 py-2 rounded-2xl text-center flex items-center justify-center gap-2">
              <Zap className="w-5 h-5 text-amber-400 animate-spin" />
              <span className="text-sm font-black tracking-wider text-amber-300 uppercase">
                {tierAnnounceText}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Boss Health Status Bar when Boss is active */}
      {boss && (
        <div className="max-w-xl mx-auto w-full pointer-events-auto animate-pulse">
          <div className="bg-gradient-to-r from-red-900/90 via-zinc-900/95 to-red-900/90 border-2 border-red-500/80 p-2.5 rounded-2xl shadow-[0_0_25px_rgba(239,68,68,0.7)] backdrop-blur-md">
            <div className="flex items-center justify-between text-xs font-black mb-1">
              <div className="flex items-center gap-2 text-red-300 uppercase tracking-wider">
                <Skull className="w-4 h-4 text-red-500 animate-bounce" />
                <span>{boss.name}</span>
                <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded border border-red-500/40">
                  {boss.state.toUpperCase()}
                </span>
              </div>
              <span className="font-mono text-red-200">
                {boss.health} / {boss.maxHealth} HP
              </span>
            </div>
            {/* Health Bar Track */}
            <div className="relative w-full h-3 bg-black/90 rounded-full overflow-hidden border border-red-500/50">
              <div
                className="h-full bg-gradient-to-r from-orange-500 via-red-500 to-rose-600 rounded-full transition-all duration-100 shadow-[0_0_12px_rgba(239,68,68,1)]"
                style={{ width: `${Math.max(0, (boss.health / boss.maxHealth) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Top Glassmorphic Navigation Bar */}
      <div className="flex items-center justify-between gap-3 max-w-6xl mx-auto w-full bg-gradient-to-b from-[#0a120a]/95 via-[#0a120a]/75 to-transparent p-2 rounded-3xl border-b border-emerald-500/20 backdrop-blur-md">
        
        {/* Left: Character Name, Title & Stage */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm">{player.character.gender === 'girl' ? '👧' : '👦'}</span>
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.25em] text-emerald-400 font-bold">
                {player.character.title || 'Province Runner'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tighter italic text-white drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] leading-tight">
              {player.character.name?.toUpperCase() || 'ALEXANDER'}
            </h1>
          </div>

          <div className="hidden md:flex flex-col border-l border-emerald-500/30 pl-3">
            <span className="text-[9px] uppercase tracking-widest text-emerald-400/60 font-semibold">
              {isInfinite ? 'Endless Mode' : 'Course'}
            </span>
            <span className="text-xs font-black text-emerald-200 tracking-wider uppercase">
              {level.name}
            </span>
          </div>
        </div>

        {/* Center: Tracker Pill */}
        <div className="hidden sm:flex flex-col items-center">
          {isInfinite ? (
            <div className="px-5 py-1.5 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-emerald-500/20 border border-teal-400/60 backdrop-blur-md rounded-full shadow-[0_0_25px_rgba(45,212,191,0.35)] flex items-center gap-2">
              <Trophy className="w-4 h-4 text-teal-300 animate-pulse" />
              <span className="text-teal-200 font-black tracking-[0.25em] uppercase text-[11px] italic">
                DISTANCE SURVIVED: {distanceTraveled}M
              </span>
              <span className="bg-teal-500/30 text-teal-300 px-2 py-0.5 rounded-full text-[9px] font-extrabold">
                TIER {difficultyTier}
              </span>
            </div>
          ) : (
            <div className="px-5 py-1.5 bg-emerald-500/10 border border-emerald-500/50 backdrop-blur-md rounded-full shadow-[0_0_20px_rgba(16,185,129,0.25)] flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-emerald-300 font-bold tracking-[0.3em] uppercase text-[11px] italic">
                SAFE ZONE: {distanceRemaining}M
              </span>
            </div>
          )}
        </div>

        {/* Right: Time, Vitality (Diamonds), Score & Controls */}
        <div className="flex items-center gap-3 sm:gap-5 pointer-events-auto">
          {/* Time Counter */}
          <div className="text-right flex flex-col items-end">
            <span className="text-[9px] uppercase tracking-widest text-emerald-400/70 font-semibold mb-0.5">
              {isInfinite ? 'Time Survived' : 'Time Left'}
            </span>
            <div className={`font-mono font-bold tracking-wider text-base sm:text-2xl tabular-nums ${
              isTimeCritical ? 'text-red-400 animate-pulse drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]' : 'text-white'
            }`}>
              {isInfinite ? `${formattedMinutes}:${formattedSec}.${fraction}` : `${formattedSec}.${fraction}`}
            </div>
          </div>

          {/* Vitality Diamonds */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] uppercase tracking-widest text-emerald-400/70 font-semibold mb-1">
              Vitality
            </span>
            <div className="flex items-center gap-2.5">
              {[...Array(player.maxLives)].map((_, i) => {
                const active = i < player.lives;
                return (
                  <div
                    key={i}
                    className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rotate-45 transition-all duration-300 ${
                      active
                        ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.9)] scale-100 border border-red-300'
                        : 'bg-zinc-800/80 border border-zinc-700/50 scale-75 opacity-40'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Quick Controls (Audio & Pause) */}
          <div className="flex items-center gap-1.5 pl-2 border-l border-emerald-500/20">
            <button
              onClick={onToggleMute}
              className="p-2 bg-black/60 hover:bg-emerald-950/60 backdrop-blur-md text-emerald-400 rounded-xl border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)] transition-all active:scale-95 cursor-pointer"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              aria-label="Toggle Sound"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-zinc-500" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              onClick={onPause}
              className="p-2 bg-black/60 hover:bg-emerald-950/60 backdrop-blur-md text-emerald-400 rounded-xl border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)] transition-all active:scale-95 cursor-pointer"
              title="Pause Game"
              aria-label="Pause Game"
            >
              <Pause className="w-4 h-4 text-emerald-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Track HUD Bottom Row: Boost Badges, Velocity, Progress Line & Throw Rock Button */}
      <div className="max-w-6xl mx-auto w-full bg-[#0a0f0a]/85 backdrop-blur-md px-4 py-2 rounded-2xl border border-emerald-500/25 shadow-[0_0_20px_rgba(16,185,129,0.1)] pointer-events-auto">
        <div className="flex items-center justify-between text-xs font-bold mb-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-emerald-400 text-[11px] uppercase tracking-wider font-bold">
              Velocity:
            </span>
            <span className="text-white font-mono font-black text-sm flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
              {speedKmH} <span className="text-[10px] text-emerald-400/80 font-normal">KM/H</span>
            </span>

            {/* Active Boost Indicators */}
            {player.boostTimer > 0 && (
              <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/50 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.4)]">
                <Flame className="w-3 h-3" /> MANGO SURGE
              </span>
            )}
            {player.goldenTimer > 0 && (
              <span className="inline-flex items-center gap-1 bg-emerald-400/20 text-emerald-300 border border-emerald-400/60 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                ★ STAR SHIELD
              </span>
            )}

            {isInfinite && (
              <span className="inline-flex items-center gap-1 bg-teal-500/20 text-teal-300 border border-teal-500/40 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                ⚡ TIER {difficultyTier} (+{((difficultyTier - 1) * 8)}% SPEED)
              </span>
            )}

            {/* Throw Rock Quick Button (Always available, highlighted during boss fights) */}
            <button
              onClick={onThrowRock}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer active:scale-90 ${
                boss
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-[0_0_15px_rgba(245,158,11,0.8)] border border-amber-300 animate-bounce'
                  : 'bg-zinc-800/90 text-amber-300 hover:bg-zinc-700/90 border border-amber-500/40'
              }`}
              title="Throw Rock (Spacebar)"
            >
              <span>🪨</span>
              <span>[SPACE] THROW ROCK</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-zinc-400 font-mono text-[11px]">
              SCORE: <span className="text-emerald-300 font-bold">{score.toLocaleString()}</span>
            </span>
            <span className="text-emerald-400 font-mono text-[11px] font-bold">
              {isInfinite ? `${distanceTraveled}M ODYSSEY` : `${progressPercent}% REACHED`}
            </span>
          </div>
        </div>

        {/* Progress Bar with Glowing Laser Track */}
        <div className="relative w-full h-2.5 bg-black/80 rounded-full overflow-hidden border border-emerald-500/30">
          <div
            className={`h-full rounded-full transition-all duration-150 relative shadow-[0_0_12px_rgba(16,185,129,0.8)] ${
              isInfinite
                ? 'bg-gradient-to-r from-teal-500 via-emerald-400 to-cyan-300'
                : 'bg-gradient-to-r from-emerald-600 via-emerald-400 to-teal-300'
            }`}
            style={{ width: `${progressPercent}%` }}
          >
            <div className="absolute right-0 top-0 bottom-0 w-2.5 bg-white rounded-full shadow-[0_0_10px_#ffffff]" />
          </div>
        </div>
      </div>
    </div>
  );
};

