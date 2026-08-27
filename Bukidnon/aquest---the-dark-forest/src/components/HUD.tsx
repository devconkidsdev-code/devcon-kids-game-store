import React from 'react';
import { Heart, Volume2, VolumeX, Pause, Flashlight, Clock, Home } from 'lucide-react';
import { PlayerStats } from '../types';

interface HUDProps {
  stats: PlayerStats;
  currentLevel: number;
  totalLevels: number;
  bucketsCollected: number;
  totalBucketsInLevel: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onToggleFlashlight: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  stats,
  currentLevel,
  totalLevels,
  totalBucketsInLevel,
  isMuted,
  onToggleMute,
  onPause,
  onToggleFlashlight,
}) => {
  // Format time remaining (e.g. 5:00, 4:59)
  const remainingSec = Math.max(0, Math.floor(stats.timeRemaining ?? 300));
  const minutes = Math.floor(remainingSec / 60);
  const seconds = remainingSec % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  const isTimeCritical = remainingSec <= 60;

  const deliveredCount = stats.bucketsDeliveredInLevel ?? 0;
  const isCarrying = !!stats.carryingBucketId;

  return (
    <div id="game-hud" className="absolute top-0 left-0 right-0 p-4 pointer-events-none flex justify-between items-start select-none z-20">
      {/* Top Left: Game Info & 5-minute Level Timer */}
      <div className="flex flex-col gap-2 pointer-events-auto">
        <div className="flex items-center gap-3 bg-black/85 backdrop-blur-md px-3.5 py-2 rounded-lg border border-neutral-800 shadow-lg">
          <span className="text-red-500 font-bold tracking-wider font-['VT323',monospace] text-2xl">
            AQUEST
          </span>
          <div className="h-4 w-px bg-neutral-700" />
          <div className="flex items-center gap-1.5 text-neutral-300 font-['VT323',monospace] text-xl">
            <span className="text-amber-400">STAGE</span>
            <span className="text-white font-bold">{currentLevel}/{totalLevels}</span>
          </div>
        </div>

        {/* 5-minute Countdown Timer */}
        <div
          id="hud-level-timer"
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border backdrop-blur-md transition-all shadow-md ${
            isTimeCritical
              ? 'bg-red-950/90 border-red-500 text-red-300 animate-pulse drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]'
              : 'bg-black/85 border-neutral-800 text-neutral-200'
          }`}
        >
          <Clock className={`w-4 h-4 ${isTimeCritical ? 'text-red-400 animate-spin' : 'text-amber-400'}`} />
          <span className="font-['VT323',monospace] text-xl tracking-wider font-bold">
            {formattedTime}
          </span>
          <span className="text-[10px] text-neutral-400 font-['VT323',monospace] uppercase tracking-wider">
            {isTimeCritical ? 'HURRY!' : 'TIME'}
          </span>
        </div>

        {/* Delivery objective reminder status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/80 border border-neutral-800 text-xs font-['VT323',monospace] text-lg backdrop-blur-md">
          {isCarrying ? (
            <span className="text-cyan-300 flex items-center gap-1.5 animate-bounce">
              <Home className="w-4 h-4 text-amber-400" /> 🏃 BRING BUCKET TO SAFEHOUSE!
            </span>
          ) : (
            <span className="text-neutral-400 flex items-center gap-1.5">
              <span>🪣</span> Find & carry buckets to house ({deliveredCount}/{totalBucketsInLevel})
            </span>
          )}
        </div>
      </div>

      {/* Top Right: Status Bar (Delivered Buckets + 3 Lives Hearts) */}
      <div className="flex flex-col items-end gap-2 pointer-events-auto">
        <div className="flex items-center gap-4 bg-black/85 backdrop-blur-md px-4 py-2.5 rounded-xl border border-neutral-800 shadow-2xl">
          {/* Delivered Buckets Counter */}
          <div className="flex items-center gap-2 bg-neutral-900/90 px-3 py-1 rounded-md border border-cyan-900/40" title="Buckets safely delivered to house">
            <span className="text-xl">🪣</span>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-['VT323',monospace] text-2xl tracking-wider text-cyan-300">
                  {deliveredCount}/{totalBucketsInLevel}
                </span>
              </div>
              <span className="text-[9px] text-cyan-400/80 font-['VT323',monospace] -mt-1 uppercase">DELIVERED</span>
            </div>
          </div>

          {/* 3 Lives Hearts */}
          <div className="flex items-center gap-1.5 pl-1" title="Remaining Lives">
            {Array.from({ length: stats.maxLives }).map((_, idx) => {
              const isFilled = idx < stats.lives;
              return (
                <Heart
                  key={idx}
                  className={`w-6 h-6 transition-all duration-300 ${
                    isFilled
                      ? 'fill-red-600 text-red-500 scale-100 drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]'
                      : 'fill-transparent text-neutral-700 scale-90'
                  }`}
                />
              );
            })}
          </div>
        </div>

        {/* Action Controls & Quick toggles */}
        <div className="flex items-center gap-2">
          {/* Flashlight toggle */}
          <button
            id="hud-flashlight-toggle"
            onClick={onToggleFlashlight}
            title="Toggle Flashlight (F key)"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-['VT323',monospace] text-lg transition-all ${
              stats.flashlightOn
                ? 'bg-amber-950/70 border-amber-500/60 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                : 'bg-neutral-900/80 border-neutral-800 text-neutral-500'
            }`}
          >
            <Flashlight className={`w-4 h-4 ${stats.flashlightOn ? 'text-amber-400' : 'text-neutral-500'}`} />
            <span>[F] {stats.flashlightOn ? 'LIGHT ON' : 'LIGHT OFF'}</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            id="hud-mute-toggle"
            onClick={onToggleMute}
            className="p-2 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white transition-all"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-neutral-300" />}
          </button>

          {/* Pause Button */}
          <button
            id="hud-pause-button"
            onClick={onPause}
            className="p-2 rounded-lg bg-neutral-900/80 hover:bg-neutral-800 border border-neutral-800 text-neutral-400 hover:text-white transition-all"
            title="Pause Game (ESC / P)"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
