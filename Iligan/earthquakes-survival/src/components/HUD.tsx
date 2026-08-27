import React from 'react';
import {
  AlertTriangle,
  Flame,
  Pause,
  Play,
  Flag,
  Radio,
  Volume2,
  VolumeX,
  Home,
} from 'lucide-react';
import { MiniMap } from './MiniMap';

interface HUDProps {
  timeRemaining: number; // in seconds
  score: number; // People saved
  passengersCount: number;
  maxPassengers: number;
  isEarthquakeActive: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onHonk: () => void;
  onPause: () => void;
  onEndGame: () => void;
  isPaused?: boolean;
  insideBuildingName?: string | null;
  playerPos: { x: number; y: number; angle: number };
  safeZone: { x: number; y: number; width: number; height: number };
  activeBannerMessage: string | null;
}

export const HUD: React.FC<HUDProps> = ({
  timeRemaining,
  score,
  passengersCount,
  maxPassengers,
  isEarthquakeActive,
  isMuted,
  onToggleMute,
  onHonk,
  onPause,
  onEndGame,
  isPaused = false,
  insideBuildingName = null,
  playerPos,
  safeZone,
  activeBannerMessage,
}) => {
  // Format seconds to mm:ss
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isUrgent = timeRemaining <= 30 && timeRemaining > 0;
  const isFull = passengersCount >= maxPassengers;

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between select-none z-30">
      {/* VIBRANT PALETTE TOP HEADER & STATS BAR */}
      <header className="pointer-events-auto flex flex-wrap items-center justify-between px-3 sm:px-8 py-2.5 bg-[#222222] border-b-4 border-orange-600 shadow-2xl w-full">
        {/* Left: Branding & Department */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-orange-500">
              Disaster Response Unit
            </span>
          </div>
          <h1 className="text-lg sm:text-2xl font-black uppercase italic leading-none tracking-tight text-white drop-shadow">
            Earthquakes Survival
          </h1>
        </div>

        {/* Center/Right: High-Visibility Metric Counters & Game Controls */}
        <div className="flex items-center gap-3 sm:gap-6 mt-2 sm:mt-0">
          {/* Time Remaining */}
          <div className="text-center px-1">
            <p className="text-[9px] sm:text-xs uppercase text-gray-400 font-semibold tracking-wider">
              Time
            </p>
            <p
              id="hud-timer"
              className={`text-xl sm:text-3xl font-mono font-bold transition-all ${
                isUrgent ? 'text-red-500 animate-pulse scale-105' : 'text-red-500'
              }`}
            >
              {formattedTime}
            </p>
          </div>

          {/* People Saved */}
          <div className="text-center px-1">
            <p className="text-[9px] sm:text-xs uppercase text-gray-400 font-semibold tracking-wider">
              Saved
            </p>
            <p
              id="hud-saved"
              className="text-xl sm:text-3xl font-mono font-bold text-green-500"
            >
              {score}
            </p>
          </div>

          {/* Car Capacity */}
          <div className="text-center px-1">
            <p
              className={`text-[9px] sm:text-xs uppercase font-semibold tracking-wider ${
                isFull ? 'text-yellow-400 animate-bounce' : 'text-gray-400'
              }`}
            >
              Capacity
            </p>
            <p
              id="hud-passengers"
              className={`text-xl sm:text-3xl font-mono font-bold ${
                isFull ? 'text-yellow-400' : 'text-yellow-500'
              }`}
            >
              {passengersCount}/{maxPassengers}
            </p>
          </div>

          <div className="h-6 w-px bg-white/15 hidden sm:block" />

          {/* Pause Button */}
          <button
            onClick={onPause}
            className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-amber-600/20 hover:bg-amber-600/40 text-amber-300 border border-amber-500/50 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
            title="Pause Mission (P / Esc)"
          >
            {isPaused ? <Play className="w-3.5 h-3.5 fill-amber-300" /> : <Pause className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          {/* End Game Button */}
          <button
            onClick={onEndGame}
            className="px-2.5 py-1.5 sm:px-3 sm:py-2 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-500/40 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
            title="End Mission & View Stats"
          >
            <Flag className="w-3.5 h-3.5 text-red-400" />
            <span className="hidden sm:inline">End Game</span>
          </button>

          {/* Audio Mute Toggle */}
          <button
            onClick={onToggleMute}
            className="p-1.5 sm:p-2 bg-[#1a1a1a] hover:bg-[#333] border border-white/10 rounded-xl text-gray-300 hover:text-white transition-all shadow-md active:scale-95 cursor-pointer"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-green-500" />}
          </button>
        </div>
      </header>

      {/* CENTER POPUP / ALERT BANNERS */}
      <div className="flex flex-col items-center justify-center gap-2 pointer-events-none my-auto px-4">
        {/* Inside Enterable Building Badge */}
        {insideBuildingName && (
          <div className="flex items-center gap-2.5 bg-cyan-950/95 border-2 border-cyan-400 text-cyan-200 px-5 py-2 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.45)] font-black text-sm sm:text-base tracking-wide uppercase backdrop-blur-md animate-in zoom-in-95 duration-200">
            <Home className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>INSIDE: {insideBuildingName}</span>
          </div>
        )}

        {/* Seismic Tremor Alert Banner */}
        {isEarthquakeActive && (
          <div className="flex items-center gap-3 bg-red-600 text-white px-6 py-3 rounded-2xl shadow-[0_0_35px_rgba(239,68,68,0.85)] border-2 border-red-300 animate-bounce font-black text-base sm:text-lg tracking-wider uppercase backdrop-blur-md">
            <Flame className="w-6 h-6 animate-pulse text-yellow-300" />
            <span>⚠️ SEISMIC AFTERSHOCK! GROUND SHAKING!</span>
            <AlertTriangle className="w-6 h-6 animate-pulse text-yellow-300" />
          </div>
        )}

        {/* Dynamic Notification Message */}
        {activeBannerMessage && !isEarthquakeActive && (
          <div className="bg-[#1a1a1a]/95 border-2 border-orange-500 text-orange-400 px-5 py-2.5 rounded-xl shadow-2xl font-bold text-sm sm:text-base tracking-wide flex items-center gap-2.5 animate-in fade-in zoom-in-95 duration-200">
            <Radio className="w-4 h-4 text-orange-400 animate-pulse" />
            <span>{activeBannerMessage}</span>
          </div>
        )}
      </div>

      {/* BOTTOM CONTROL & NAVIGATION BAR */}
      <footer className="flex flex-wrap items-end justify-between gap-4 p-4 sm:p-6 w-full pointer-events-none">
        {/* Left: Controls, Keyboard Legend & Virtual D-Pad */}
        <div className="flex flex-col gap-2 pointer-events-auto">
          {/* Virtual D-Pad for Touch/Mouse */}
          <div className="flex items-center gap-2 bg-[#1a1a1a]/95 border border-white/10 p-2 rounded-2xl shadow-2xl backdrop-blur-md">
            {/* Left Button */}
            <button
              onMouseDown={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))}
              onMouseUp={() => window.dispatchEvent(new KeyboardEvent('keyup', { key: 'a' }))}
              onTouchStart={(e) => { e.preventDefault(); window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' })); }}
              onTouchEnd={(e) => { e.preventDefault(); window.dispatchEvent(new KeyboardEvent('keyup', { key: 'a' })); }}
              className="w-11 h-11 bg-[#282828] active:bg-orange-600 hover:bg-[#333] rounded-xl border border-white/10 flex items-center justify-center text-white font-black text-base transition-all select-none cursor-pointer shadow-md"
              title="Steer Left (A / Left Arrow)"
            >
              ◀
            </button>

            {/* Up / Down Stack */}
            <div className="flex flex-col gap-1.5">
              <button
                onMouseDown={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' }))}
                onMouseUp={() => window.dispatchEvent(new KeyboardEvent('keyup', { key: 'w' }))}
                onTouchStart={(e) => { e.preventDefault(); window.dispatchEvent(new KeyboardEvent('keydown', { key: 'w' })); }}
                onTouchEnd={(e) => { e.preventDefault(); window.dispatchEvent(new KeyboardEvent('keyup', { key: 'w' })); }}
                className="w-11 h-9 bg-[#282828] active:bg-orange-600 hover:bg-[#333] rounded-xl border border-white/10 flex items-center justify-center text-white font-black text-sm transition-all select-none cursor-pointer shadow-md"
                title="Drive Forward (W / Up Arrow)"
              >
                ▲
              </button>
              <button
                onMouseDown={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 's' }))}
                onMouseUp={() => window.dispatchEvent(new KeyboardEvent('keyup', { key: 's' }))}
                onTouchStart={(e) => { e.preventDefault(); window.dispatchEvent(new KeyboardEvent('keydown', { key: 's' })); }}
                onTouchEnd={(e) => { e.preventDefault(); window.dispatchEvent(new KeyboardEvent('keyup', { key: 's' })); }}
                className="w-11 h-9 bg-[#282828] active:bg-orange-600 hover:bg-[#333] rounded-xl border border-white/10 flex items-center justify-center text-white font-black text-sm transition-all select-none cursor-pointer shadow-md"
                title="Reverse / Brake (S / Down Arrow)"
              >
                ▼
              </button>
            </div>

            {/* Right Button */}
            <button
              onMouseDown={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' }))}
              onMouseUp={() => window.dispatchEvent(new KeyboardEvent('keyup', { key: 'd' }))}
              onTouchStart={(e) => { e.preventDefault(); window.dispatchEvent(new KeyboardEvent('keydown', { key: 'd' })); }}
              onTouchEnd={(e) => { e.preventDefault(); window.dispatchEvent(new KeyboardEvent('keyup', { key: 'd' })); }}
              className="w-11 h-11 bg-[#282828] active:bg-orange-600 hover:bg-[#333] rounded-xl border border-white/10 flex items-center justify-center text-white font-black text-base transition-all select-none cursor-pointer shadow-md"
              title="Steer Right (D / Right Arrow)"
            >
              ▶
            </button>

            {/* Quick Honk Button */}
            <button
              onClick={onHonk}
              className="px-3 h-11 bg-[#222] hover:bg-[#333] active:bg-amber-600 text-yellow-400 hover:text-white text-xs font-bold rounded-xl border border-white/10 transition-all shadow-md flex items-center gap-1.5 cursor-pointer ml-1 select-none"
            >
              <span>📢 Honk</span>
            </button>
          </div>

          {/* Keyboard Legend */}
          <div className="bg-[#1a1a1a]/90 border border-white/10 rounded-xl px-3.5 py-1.5 shadow-xl backdrop-blur-md flex items-center gap-2.5">
            <div className="text-[11px] font-black text-orange-500 tracking-wider">
              WASD / ARROWS TO DRIVE
            </div>
            <div className="h-3 w-px bg-gray-700" />
            <div className="text-[10px] font-medium text-gray-300 flex items-center gap-1.5">
              <span className="text-green-400 font-bold">✨ Touch Circle Rescues</span>
            </div>
          </div>
        </div>

        {/* Right: GPS MiniMap Radar */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <MiniMap
            playerPos={playerPos}
            safeZone={safeZone}
            survivorsCount={score}
          />
        </div>
      </footer>
    </div>
  );
};

