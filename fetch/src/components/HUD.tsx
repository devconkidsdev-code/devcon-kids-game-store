import React from 'react';
import { Volume2, VolumeX, RotateCcw, Pause, Play } from 'lucide-react';
import { LevelConfig } from '../types';

interface HUDProps {
  level: LevelConfig;
  water: number;
  timeElapsed: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onRestart: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  level,
  water,
  timeElapsed,
  isMuted,
  onToggleMute,
  onRestart,
  isPaused,
  onTogglePause,
}) => {
  const waterPercent = Math.max(0, Math.round(water));
  const isCritical = waterPercent <= 25 && waterPercent > 0;
  const isWarning = waterPercent <= 50 && waterPercent > 25;

  return (
    <header className="w-full h-16 border-b border-[#E2E8F0] px-4 sm:px-8 flex items-center justify-between bg-white shadow-xs z-10 select-none shrink-0 text-[#2D3748]">
      {/* Brand & Level Indicator */}
      <div className="flex items-center gap-3 sm:gap-4">
        <span className="text-xl sm:text-2xl font-black tracking-tighter text-[#2F4F4F]">
          FETCH
        </span>
        <span className="h-4 w-[1px] bg-[#E2E8F0] hidden xs:inline-block"></span>
        <span className="uppercase tracking-widest text-[11px] sm:text-xs font-bold text-[#708090]">
          Level {level.id}: {level.name.replace(/Level \d+ — /, '')}
        </span>
      </div>

      {/* Water Meter & Time Indicator */}
      <div className="flex items-center gap-4 sm:gap-8 md:gap-12">
        {/* Water Supply */}
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] sm:text-xs font-bold uppercase text-[#708090] tracking-wider">
              Water Supply
            </span>
            <span
              className={`text-xs sm:text-sm font-mono font-bold ${
                isCritical
                  ? 'text-rose-600 animate-pulse'
                  : isWarning
                  ? 'text-amber-500'
                  : 'text-[#00BFFF]'
              }`}
            >
              {waterPercent}%
            </span>
          </div>
          <div className="w-24 sm:w-44 md:w-48 h-2.5 sm:h-3 bg-[#E2E8F0] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-100 ${
                isCritical
                  ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                  : isWarning
                  ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
                  : 'bg-[#00BFFF] shadow-[0_0_8px_rgba(0,191,255,0.5)]'
              }`}
              style={{ width: `${waterPercent}%` }}
            />
          </div>
        </div>

        {/* Time */}
        <div className="flex flex-col items-center">
          <span className="text-[10px] sm:text-xs font-bold uppercase text-[#708090] tracking-wider">
            Time
          </span>
          <span className="text-sm sm:text-xl font-mono font-bold text-[#2D3748]">
            {timeElapsed.toFixed(2)}s
          </span>
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        <button
          id="sound-toggle-btn"
          onClick={onToggleMute}
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
          className="w-8 h-8 rounded border border-[#E2E8F0] hover:border-[#708090] bg-white flex items-center justify-center text-[#708090] hover:text-[#2F4F4F] transition-colors cursor-pointer"
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-[#A0AEC0]" />
          ) : (
            <Volume2 className="w-4 h-4 text-[#00BFFF]" />
          )}
        </button>

        <button
          id="restart-level-btn"
          onClick={onRestart}
          title="Restart Level (R)"
          className="w-8 h-8 rounded border border-[#E2E8F0] hover:border-[#708090] bg-white flex items-center justify-center font-bold text-xs text-[#2D3748] hover:text-[#2F4F4F] transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          id="pause-game-btn"
          onClick={onTogglePause}
          title={isPaused ? 'Resume Game' : 'Pause Game'}
          className="w-8 h-8 rounded border border-[#E2E8F0] hover:border-[#708090] bg-white flex items-center justify-center text-[#2D3748] hover:text-[#2F4F4F] transition-colors cursor-pointer"
        >
          {isPaused ? <Play className="w-4 h-4 text-[#00BFFF]" /> : <Pause className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
