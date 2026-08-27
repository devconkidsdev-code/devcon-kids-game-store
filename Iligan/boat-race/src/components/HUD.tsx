import React from 'react';
import { BoatCustomization, GamePhase, PathIndex, RacingMode } from '../types/game';
import { PATH_CONFIGS } from '../utils/trackGenerator';
import { Heart, Volume2, VolumeX, Music, HelpCircle, Pause, Play, Compass, Zap, Trophy, ShieldAlert } from 'lucide-react';

interface HUDProps {
  phase: GamePhase;
  roundNumber: 1 | 2;
  activePlayerId: 'player1' | 'player2';
  mode: RacingMode;
  timeLeft: number;
  timeElapsed: number;
  currentPath: PathIndex;
  player1Custom: BoatCustomization;
  player2Custom: BoatCustomization;
  p1Lives: number;
  p2Lives: number;
  p1Distance: number;
  p2Distance: number;
  trackLength: number;
  p1Score: number;
  p2Score: number;
  currentSpeedKts: number;
  soundEnabled: boolean;
  musicEnabled: boolean;
  onToggleSound: () => void;
  onToggleMusic: () => void;
  onOpenRules: () => void;
  onTogglePause: () => void;
  isPaused: boolean;
}

export const HUD: React.FC<HUDProps> = ({
  phase,
  roundNumber,
  activePlayerId,
  mode,
  timeLeft,
  timeElapsed,
  currentPath,
  player1Custom,
  player2Custom,
  p1Lives,
  p2Lives,
  p1Distance,
  p2Distance,
  trackLength,
  p1Score,
  p2Score,
  currentSpeedKts,
  soundEnabled,
  musicEnabled,
  onToggleSound,
  onToggleMusic,
  onOpenRules,
  onTogglePause,
  isPaused
}) => {
  const pathConfig = PATH_CONFIGS[currentPath];
  const p1Progress = Math.min(Math.max((p1Distance / trackLength) * 100, 0), 100);
  const p2Progress = Math.min(Math.max((p2Distance / trackLength) * 100, 0), 100);

  const isTimerCritical = timeLeft <= 10;

  // Format timer as 00:XX
  const formattedSeconds = Math.max(0, Math.floor(timeLeft)).toString().padStart(2, '0');
  const formattedMillis = Math.max(0, Math.floor((timeLeft % 1) * 10)).toString();

  return (
    <div className="w-full flex flex-col gap-3 select-none">
      {/* Bold Typography Main Header */}
      <header className="bg-sky-800/95 p-4 md:p-5 flex flex-wrap justify-between items-center border-b-4 border-sky-950 rounded-3xl shadow-2xl backdrop-blur-md">
        
        {/* Left: Stage info */}
        <div className="flex flex-col">
          <span className="text-[11px] font-black tracking-widest uppercase text-sky-300/80">
            Current Stage
          </span>
          <div className="flex items-center gap-2">
            <span className="text-2xl md:text-3xl font-black italic tracking-tight text-white drop-shadow-md">
              ROUND 0{roundNumber}
            </span>
            <span className="bg-yellow-400 text-sky-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-md tracking-wider">
              {mode === 'turn_based' 
                ? (activePlayerId === 'player1' ? "P1 RUN" : "P2 RUN")
                : 'DUEL'}
            </span>
          </div>
        </div>

        {/* Center: Hero Bold Title */}
        <div className="flex flex-col items-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter drop-shadow-2xl italic flex items-center gap-2 sm:gap-3">
            <span className="text-yellow-400">BOAT</span>
            <span className="text-white">RACE</span>
          </h1>
          <span className="text-[10px] font-black tracking-[0.3em] uppercase text-sky-200/60 hidden sm:inline">
            2-Player River Championship
          </span>
        </div>

        {/* Right: High-Visibility Time Remaining & Utility Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`flex flex-col items-end px-3 py-1.5 rounded-2xl border-2 transition-all ${
            isTimerCritical 
              ? 'bg-red-950/80 border-red-500/80 shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse' 
              : 'bg-sky-900/80 border-yellow-400/50 shadow-md'
          }`}>
            <span className="text-[10px] sm:text-[11px] font-black tracking-wider uppercase text-yellow-300 flex items-center gap-1">
              <span>⏱️</span> TIME LEFT
            </span>
            <span className={`text-2xl sm:text-3xl font-mono font-black tracking-wider drop-shadow-md ${
              isTimerCritical ? 'text-red-400 font-extrabold' : 'text-yellow-400'
            }`}>
              00:{formattedSeconds}.{formattedMillis}
            </span>
          </div>

          <div className="flex items-center gap-1 bg-sky-900/80 p-1 rounded-2xl border-2 border-sky-700/60">
            <button
              onClick={onToggleSound}
              aria-label="Toggle Sound"
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                soundEnabled 
                  ? 'bg-sky-600 text-yellow-300 shadow-sm' 
                  : 'text-sky-400/50 hover:text-white'
              }`}
              title="Toggle Sound Effects"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={onToggleMusic}
              aria-label="Toggle Music"
              className={`p-2 rounded-xl transition-all cursor-pointer ${
                musicEnabled 
                  ? 'bg-sky-600 text-yellow-300 shadow-sm' 
                  : 'text-sky-400/50 hover:text-white'
              }`}
              title="Toggle Music"
            >
              <Music className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenRules}
              aria-label="Rules"
              className="p-2 rounded-xl text-yellow-300 hover:bg-sky-700 transition-all cursor-pointer"
              title="Rules"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {(phase === 'racing' || phase === 'paused') && (
              <button
                onClick={onTogglePause}
                aria-label={isPaused ? 'Resume' : 'Pause'}
                className="p-2 rounded-xl bg-yellow-400 text-sky-950 font-black hover:bg-yellow-300 transition-all cursor-pointer"
                title={isPaused ? 'Resume' : 'Pause'}
              >
                {isPaused ? <Play className="w-4 h-4 fill-sky-950" /> : <Pause className="w-4 h-4 fill-sky-950" />}
              </button>
            )}
          </div>
        </div>

      </header>

      {/* Second Row: Bold Player Cards & Lane Status Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        
        {/* Player 1 Card (Red Boat) */}
        <div className={`p-4 rounded-3xl border-2 transition-all shadow-xl flex flex-col justify-between ${
          activePlayerId === 'player1' || mode === 'simultaneous'
            ? 'bg-red-950/40 border-red-500 ring-4 ring-red-500/30'
            : 'bg-sky-950/50 border-white/10 opacity-70'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-red-200 uppercase tracking-tighter flex items-center gap-2">
                <span>{player1Custom.name}</span>
                {activePlayerId === 'player1' && (
                  <span className="bg-yellow-400 text-sky-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                    ACTIVE
                  </span>
                )}
              </h2>
              <span className="text-xs font-bold text-red-300/90 flex items-center gap-1">
                <span>{player1Custom.gender === 'woman' ? '👩‍✈️' : '👨‍✈️'}</span>
                <span>{player1Custom.characterName}</span>
              </span>
            </div>
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md border-2 border-white/30"
              style={{ backgroundColor: player1Custom.boatColor }}
            >
              🚤
            </div>
          </div>

          {/* 5 Lives Heart Display & Numeric Life Count */}
          <div className="my-3 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-sky-200 flex items-center gap-1">
                <span>❤️</span> Lives: <strong className="text-white text-sm font-black">{p1Lives} / 5</strong>
              </span>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                p1Lives >= 4 ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40' :
                p1Lives >= 2 ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40' :
                'bg-red-500/30 text-red-300 border border-red-500/40 animate-pulse'
              }`}>
                {p1Lives === 5 ? 'MAX HP' : p1Lives > 1 ? `${p1Lives} REMAINING` : 'CRITICAL!'}
              </span>
            </div>
            <div className="flex gap-1.5">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`text-2xl transition-all duration-200 ${
                    i < p1Lives 
                      ? 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.8)] scale-100' 
                      : 'text-white/20 grayscale scale-90'
                  }`}
                >
                  ❤️
                </span>
              ))}
            </div>
          </div>

          {/* Large Bold Score */}
          <div className="flex items-baseline justify-between border-t border-white/10 pt-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-sky-300/70">Score</span>
            <div className="text-3xl font-black text-white tracking-tight">
              {p1Score.toLocaleString()}<span className="text-xs ml-1 opacity-60 font-bold">PTS</span>
            </div>
          </div>
        </div>

        {/* Center: Lane Status Panel (Matching Design HTML) */}
        <div className="bg-sky-900/60 p-4 rounded-3xl border-2 border-white/15 shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-black tracking-widest text-blue-300">
              River Lane Status
            </span>
            <span className="text-xs font-black text-yellow-300 bg-yellow-400/20 px-2 py-0.5 rounded-full border border-yellow-400/40">
              SPEED: {currentSpeedKts.toFixed(0)} KTS
            </span>
          </div>

          {/* 3-Tier Lane Status Box */}
          <div className="h-28 w-full bg-black/40 rounded-2xl relative overflow-hidden border border-white/15 flex flex-col">
            
            {/* Lane 1: Rapid Rapids */}
            <div className={`flex-1 border-b border-white/10 flex items-center justify-between px-3 text-xs font-black transition-all ${
              currentPath === 0 ? 'bg-sky-500/40 text-cyan-300 shadow-inner' : 'text-sky-300/60'
            }`}>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span>PATH 1: RAPID RAPIDS</span>
              </div>
              <span className="text-[10px] font-black bg-cyan-500/30 text-cyan-200 px-2 py-0.5 rounded uppercase">
                +25% FLOW
              </span>
            </div>

            {/* Lane 2: Standard Stream */}
            <div className={`flex-1 border-b border-white/10 flex items-center justify-between px-3 text-xs font-black transition-all ${
              currentPath === 1 ? 'bg-yellow-400/30 text-yellow-300 shadow-inner' : 'text-yellow-300/60'
            }`}>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                <span>PATH 2: STANDARD STREAM</span>
              </div>
              <span className="text-[10px] font-black bg-yellow-400/30 text-yellow-200 px-2 py-0.5 rounded uppercase">
                MODERATE
              </span>
            </div>

            {/* Lane 3: Serene Shallows */}
            <div className={`flex-1 flex items-center justify-between px-3 text-xs font-black transition-all ${
              currentPath === 2 ? 'bg-emerald-500/40 text-emerald-300 shadow-inner' : 'text-emerald-300/60'
            }`}>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span>PATH 3: SERENE SHALLOWS</span>
              </div>
              <span className="text-[10px] font-black bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded uppercase">
                CALM PASS
              </span>
            </div>

          </div>

          <div className="text-[10px] font-black text-center text-sky-200/80 mt-2 uppercase tracking-wider">
            Current: <strong className="text-yellow-300">{pathConfig.name}</strong> ({pathConfig.perk})
          </div>
        </div>

        {/* Player 2 Card (Blue Boat) */}
        <div className={`p-4 rounded-3xl border-2 transition-all shadow-xl flex flex-col justify-between ${
          activePlayerId === 'player2' || mode === 'simultaneous'
            ? 'bg-blue-950/40 border-blue-500 ring-4 ring-blue-500/30'
            : 'bg-sky-950/50 border-white/10 opacity-70'
        }`}>
          <div className="flex items-center justify-between">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md border-2 border-white/30"
              style={{ backgroundColor: player2Custom.boatColor }}
            >
              🚤
            </div>
            <div className="text-right">
              <h2 className="text-xl font-black text-blue-200 uppercase tracking-tighter flex items-center justify-end gap-2">
                {activePlayerId === 'player2' && (
                  <span className="bg-yellow-400 text-sky-950 text-[10px] font-black px-2 py-0.5 rounded-full">
                    ACTIVE
                  </span>
                )}
                <span>{player2Custom.name}</span>
              </h2>
              <span className="text-xs font-bold text-blue-300/90 flex items-center justify-end gap-1">
                <span>{player2Custom.gender === 'woman' ? '👩‍✈️' : '👨‍✈️'}</span>
                <span>{player2Custom.characterName}</span>
              </span>
            </div>
          </div>

          {/* 5 Lives Heart Display & Numeric Life Count */}
          <div className="my-3 flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                p2Lives >= 4 ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40' :
                p2Lives >= 2 ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40' :
                'bg-red-500/30 text-red-300 border border-red-500/40 animate-pulse'
              }`}>
                {p2Lives === 5 ? 'MAX HP' : p2Lives > 1 ? `${p2Lives} REMAINING` : 'CRITICAL!'}
              </span>
              <span className="text-[11px] font-black uppercase tracking-wider text-sky-200 flex items-center gap-1">
                <span>❤️</span> Lives: <strong className="text-white text-sm font-black">{p2Lives} / 5</strong>
              </span>
            </div>
            <div className="flex gap-1.5 justify-end">
              {[...Array(5)].map((_, i) => (
                <span
                  key={i}
                  className={`text-2xl transition-all duration-200 ${
                    i < p2Lives 
                      ? 'text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.8)] scale-100' 
                      : 'text-white/20 grayscale scale-90'
                  }`}
                >
                  ❤️
                </span>
              ))}
            </div>
          </div>

          {/* Large Bold Score */}
          <div className="flex items-baseline justify-between border-t border-white/10 pt-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-sky-300/70">Score</span>
            <div className="text-3xl font-black text-white tracking-tight">
              {p2Score.toLocaleString()}<span className="text-xs ml-1 opacity-60 font-bold">PTS</span>
            </div>
          </div>
        </div>

      </div>

      {/* River Track Distance Progress Bar (Bold Checkered Bar) */}
      <div className="bg-sky-950/90 border-2 border-sky-800 rounded-2xl p-3 flex items-center gap-3 shadow-lg">
        <span className="text-xs font-black text-yellow-400 uppercase tracking-widest shrink-0 italic">
          FINISH TRACK
        </span>
        <div className="relative flex-1 h-5 bg-sky-900/90 rounded-xl border border-white/20 overflow-visible">
          {/* Checkered pattern background */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-sky-800 via-sky-700 to-sky-800 opacity-80" />

          {/* Player 1 mini marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-100 flex flex-col items-center z-10"
            style={{ left: `${p1Progress}%` }}
          >
            <div className="w-6 h-6 bg-blue-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-black shadow-lg">
              P1
            </div>
          </div>

          {/* Player 2 mini marker */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-100 flex flex-col items-center z-10"
            style={{ left: `${p2Progress}%` }}
          >
            <div className="w-6 h-6 bg-red-500 border-2 border-white rounded-full flex items-center justify-center text-[10px] font-black shadow-lg">
              P2
            </div>
          </div>

          {/* Finish Line icon */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 text-lg">
            🏁
          </div>
        </div>
        <span className="text-xs font-mono font-black text-yellow-300 shrink-0">
          {Math.round(p1Distance)}m / {trackLength}m
        </span>
      </div>
    </div>
  );
};
