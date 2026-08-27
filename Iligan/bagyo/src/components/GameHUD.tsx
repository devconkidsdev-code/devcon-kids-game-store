import React from 'react';
import { GameStats } from '../game/engine';
import { LevelConfig } from '../types';
import { 
  Activity, 
  Wind, 
  Volume2, 
  VolumeX, 
  Pause, 
  Zap,
  Info,
  Waves,
  Heart
} from 'lucide-react';

interface GameHUDProps {
  stats: GameStats;
  level: LevelConfig;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onOpenGuide: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  level,
  isMuted,
  onToggleMute,
  onPause,
  onOpenGuide,
}) => {
  const isUrgent = stats.timeLeft <= 10.0;
  const isSubmerged = stats.oxygen < 95;
  const suppliesPercent = Math.min(100, Math.round((stats.suppliesCollected / Math.max(1, stats.totalSupplies)) * 100));

  // Format digital countdown e.g., "00:42.08"
  const minutes = Math.floor(stats.timeLeft / 60);
  const seconds = Math.floor(stats.timeLeft % 60);
  const milliseconds = Math.floor((stats.timeLeft % 1) * 100);
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;

  // Flood water depth calculation from ground
  const currentDepthMeters = Math.max(0, (2400 - stats.waterLevel) / 100).toFixed(2);

  // Supply item icons representation
  const collectedSupplies = level.supplies.filter(s => s.collected);
  const totalSupplySlots = Math.min(level.supplies.length, 5); // Show up to 5 slots in HUD widget
  const emptySlotsCount = Math.max(0, totalSupplySlots - collectedSupplies.length);

  return (
    <div id="game-hud-container" className="absolute inset-0 pointer-events-none flex flex-col justify-between select-none z-40 overflow-hidden">
      {/* Top Header - Immersive UI Glassmorphism Bar */}
      <header className="h-16 sm:h-20 flex items-center justify-between px-4 sm:px-8 md:px-10 bg-slate-900/80 border-b border-slate-700 backdrop-blur-md z-50 pointer-events-auto">
        {/* Brand & Alert Signal */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-600 rounded flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.5)] shrink-0">
            <div className="w-4 h-4 sm:w-6 sm:h-6 border-2 border-white rounded-sm"></div>
          </div>
          <div>
            <h1 className="text-xl sm:text-3xl font-black tracking-tighter uppercase italic text-red-500 leading-none">
              BAGYO
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`inline-block w-1.5 h-1.5 rounded-full ${
                level.id === 'SIGNAL_3' ? 'bg-red-400 animate-ping' : level.id === 'SIGNAL_2' ? 'bg-amber-400' : 'bg-yellow-400'
              }`} />
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {level.signalName.split('(')[0].trim()} • {level.windSpeedMph} MPH
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Digital Countdown, Lives, Hero badge, and quick controls */}
        <div className="flex items-center gap-3 sm:gap-6 md:gap-8">
          {/* 5-Lives Visual Display in Header */}
          <div className="flex flex-col items-center">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-slate-400">Lives</span>
            <div className="flex items-center gap-1 mt-0.5" id="hud-lives-header">
              {Array.from({ length: 5 }).map((_, idx) => {
                const isAlive = idx < (stats.lives ?? 5);
                return (
                  <span 
                    key={idx}
                    className={`text-sm sm:text-base transition-all select-none ${
                      isAlive 
                        ? 'opacity-100 scale-100 drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]' 
                        : 'opacity-25 grayscale scale-75'
                    }`}
                  >
                    ❤️
                  </span>
                );
              })}
            </div>
          </div>

          <div className="h-8 sm:h-10 w-px bg-slate-700 hidden sm:block"></div>

          {/* Digital Time Remaining */}
          <div className="flex flex-col items-end">
            <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em] text-slate-400">Time Remaining</span>
            <span className={`text-xl sm:text-3xl md:text-4xl font-mono font-bold tracking-tight drop-shadow-[0_0_10px_rgba(248,113,113,0.4)] ${
              isUrgent ? 'text-red-400 animate-pulse' : 'text-red-400'
            }`}>
              {formattedTime}
            </span>
          </div>

          <div className="h-8 sm:h-10 w-px bg-slate-700 hidden xs:block"></div>

          {/* Current Hero */}
          <div className="flex-col items-end hidden sm:flex">
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Current Hero</span>
            <span className="text-lg sm:text-xl font-bold tracking-wider text-white">DEXTER</span>
          </div>

          <div className="h-8 sm:h-10 w-px bg-slate-700 hidden sm:block"></div>

          {/* Action buttons (Guide, Audio, Pause) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              id="guide-button"
              onClick={onOpenGuide}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 shadow-md transition-colors cursor-pointer"
              title="Survival Go-Bag Guide"
            >
              <Info className="w-4 h-4 text-sky-400" />
            </button>

            <button
              id="mute-button"
              onClick={onToggleMute}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 shadow-md transition-colors cursor-pointer"
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            <button
              id="pause-button"
              onClick={onPause}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 shadow-md transition-colors cursor-pointer"
              title="Pause Game"
            >
              <Pause className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>
      </header>

      {/* Floating Tactical Widgets (Supplies Gathered & Dexter Vitals) */}
      <div className="relative flex-1 w-full p-3 sm:p-6 pointer-events-none">
        {/* Top-Left: Dexter Vitals Card */}
        <div className="absolute top-3 sm:top-6 left-3 sm:left-6 z-30 bg-slate-800/90 border border-slate-600 p-3 sm:p-4 rounded-xl backdrop-blur-sm shadow-2xl pointer-events-auto w-48 sm:w-56" id="dexter-vitals-card">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Dexter Status</span>
            <span className="font-mono text-xs font-bold text-yellow-400">{stats.score} pts</span>
          </div>

          {/* 5-Lives Health Segments */}
          <div className="space-y-1 mb-2.5 pb-2 border-b border-slate-700/60">
            <div className="flex justify-between text-[10px] font-semibold">
              <span className="flex items-center gap-1 text-slate-300">
                <Heart className={`w-3 h-3 ${(stats.lives ?? 5) <= 1 ? 'text-red-500 animate-ping' : 'text-red-500 fill-red-500'}`} /> Lives Remaining
              </span>
              <span className={`font-mono font-bold ${(stats.lives ?? 5) <= 1 ? 'text-red-400 animate-pulse' : 'text-red-400'}`}>
                {stats.lives ?? 5}/5
              </span>
            </div>
            <div className="flex items-center gap-1 pt-0.5">
              {Array.from({ length: 5 }).map((_, i) => {
                const active = i < (stats.lives ?? 5);
                return (
                  <div
                    key={i}
                    className={`flex-1 h-2 rounded-sm transition-all ${
                      active 
                        ? ((stats.lives ?? 5) <= 1 ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]' : (stats.lives ?? 5) <= 2 ? 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]' : 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.6)]') 
                        : 'bg-slate-700 opacity-40'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Oxygen Gauge */}
          <div className="space-y-1 mb-2.5">
            <div className="flex justify-between text-[10px] font-semibold">
              <span className={`flex items-center gap-1 ${isSubmerged ? 'text-cyan-300 animate-pulse font-bold' : 'text-slate-400'}`}>
                <Activity className="w-3 h-3 text-cyan-400" /> Oxygen / Air
              </span>
              <span className="font-mono text-cyan-300">{Math.round(stats.oxygen)}%</span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-150 rounded-full ${
                  stats.oxygen < 30 ? 'bg-red-500 animate-pulse' : stats.oxygen < 60 ? 'bg-amber-400' : 'bg-cyan-400'
                }`}
                style={{ width: `${stats.oxygen}%` }}
              />
            </div>
          </div>

          {/* Stamina Gauge */}
          <div className="space-y-1">
            <div className="flex justify-between text-[10px] font-semibold text-slate-400">
              <span className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-emerald-400" /> Stamina (Sprint)
              </span>
              <span className="font-mono text-emerald-300">{Math.round(stats.stamina)}%</span>
            </div>
            <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-400 transition-all duration-150 rounded-full"
                style={{ width: `${stats.stamina}%` }}
              />
            </div>
          </div>
        </div>

        {/* Top-Right: Supplies Gathered Floating Widget (Matching Immersive UI) */}
        <div className="absolute top-3 sm:top-6 right-3 sm:right-6 z-30 bg-slate-800/90 border border-slate-600 p-3 sm:p-4 rounded-xl backdrop-blur-sm shadow-2xl pointer-events-auto">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400">
              Supplies Gathered
            </h3>
            <span className="font-mono text-xs font-bold text-emerald-400 ml-2">
              {stats.suppliesCollected}/{stats.totalSupplies}
            </span>
          </div>

          {/* Slot Grid */}
          <div className="flex gap-2 sm:gap-3">
            {collectedSupplies.slice(0, 4).map((supply) => (
              <div 
                key={supply.id} 
                className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-500/20 border border-emerald-500 rounded-lg flex items-center justify-center shadow-[inset_0_0_10px_rgba(16,185,129,0.3)] transition-transform hover:scale-105"
                title={`${supply.name} (+${supply.points} pts)`}
              >
                <span className="text-lg sm:text-xl">{supply.icon}</span>
              </div>
            ))}

            {Array.from({ length: Math.min(3, emptySlotsCount) }).map((_, i) => (
              <div 
                key={`empty-${i}`} 
                className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-700 border border-slate-600 rounded-lg flex items-center justify-center opacity-40 italic text-[10px] text-slate-300"
              >
                Empty
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="mt-3 sm:mt-4 w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full transition-all duration-300 rounded-full" 
              style={{ width: `${suppliesPercent}%` }}
            />
          </div>

          <p className="text-[10px] mt-2 text-slate-400 text-center italic">
            {stats.suppliesCollected} of {stats.totalSupplies} Essential Items Found
          </p>
        </div>

        {/* Emergency Alert notification when flood is high or time running out */}
        {isUrgent && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 bg-red-600/90 border border-red-400 px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.6)] animate-bounce pointer-events-auto">
            <span className="text-white text-xs font-black uppercase tracking-widest">
              ⚠ CRITICAL FLOOD SURGE PEAKING!
            </span>
          </div>
        )}
      </div>

      {/* Bottom Status Bar - Immersive UI Mission Control Footer */}
      <footer className="h-20 sm:h-24 bg-slate-950/95 border-t border-slate-800 px-4 sm:px-8 md:px-10 flex items-center justify-between z-50 pointer-events-auto backdrop-blur-md">
        {/* Left: Movement Controls WASD preview */}
        <div className="flex items-center gap-4 sm:gap-8">
          <div className="flex items-center gap-3">
            <div className="grid grid-cols-3 gap-1">
              <div></div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-800 border border-slate-600 rounded flex items-center justify-center font-bold text-xs text-slate-200 shadow-inner">W</div>
              <div></div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-800 border border-slate-600 rounded flex items-center justify-center font-bold text-xs text-slate-200 shadow-inner">A</div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-800 border border-slate-600 rounded flex items-center justify-center font-bold text-xs text-slate-200 shadow-inner">S</div>
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-slate-800 border border-slate-600 rounded flex items-center justify-center font-bold text-xs text-slate-200 shadow-inner">D</div>
            </div>
            <span className="text-slate-400 text-xs font-medium uppercase tracking-wider leading-tight hidden xs:inline-block">
              Movement<br />Controls
            </span>
          </div>
        </div>

        {/* Center: Mission Objective */}
        <div className="flex flex-col items-center justify-center text-center px-2">
          <p className="text-slate-500 text-[9px] sm:text-[10px] uppercase tracking-widest mb-0.5 sm:mb-1">
            Mission Objective
          </p>
          <p className="text-white font-medium text-xs sm:text-sm">
            Navigate the rooftops and reach the <span className="text-orange-500 font-bold">Rescue Boat</span> before time expires.
          </p>
        </div>

        {/* Right: Current Depth & Flood Surge Level */}
        <div className="text-right">
          <p className="text-slate-500 text-[9px] sm:text-[10px] uppercase tracking-widest">
            Current Depth
          </p>
          <p className="text-cyan-400 font-mono text-base sm:text-xl font-bold flex items-center justify-end gap-1">
            {currentDepthMeters}m <span className="text-red-500 text-xs animate-pulse">▲</span>
          </p>
        </div>
      </footer>
    </div>
  );
};
