import React from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Gauge } from 'lucide-react';
import { WAVE_SPEED_PRESETS } from '../game/constants';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  waveSpeedMultiplier: number;
  onChangeWaveSpeed: (multiplier: number) => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  isMuted,
  onToggleMute,
  waveSpeedMultiplier,
  onChangeWaveSpeed,
}) => {
  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-30 animate-in fade-in zoom-in-95 duration-200 text-white">
      <div className="max-w-sm w-full bg-black/60 backdrop-blur-xl border border-white/20 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-center">
        <h3 className="text-2xl font-black italic tracking-tighter text-white">
          GAME PAUSED
        </h3>

        {/* Live Wave Speed Controls */}
        <div className="flex flex-col gap-2 bg-white/5 border border-white/15 p-3 rounded-2xl text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-blue-300">
              <Gauge className="w-3.5 h-3.5 text-blue-400" /> Wave Speed
            </div>
            <span className="text-xs font-mono font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-md border border-blue-400/30">
              {Math.round(waveSpeedMultiplier * 100)}% ({waveSpeedMultiplier.toFixed(2)}x)
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1">
            {WAVE_SPEED_PRESETS.map((preset) => {
              const isActive = Math.abs(waveSpeedMultiplier - preset.multiplier) < 0.04;
              return (
                <button
                  key={preset.id}
                  onClick={() => onChangeWaveSpeed(preset.multiplier)}
                  className={`py-1 px-1 rounded-lg text-[10px] font-semibold transition-all border cursor-pointer text-center ${
                    isActive
                      ? 'bg-sky-500 text-white border-sky-300 font-bold'
                      : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {preset.multiplier}x
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2 pt-0.5">
            <span className="text-[10px] text-white/50 font-mono">0.5x</span>
            <input
              type="range"
              min="0.5"
              max="1.5"
              step="0.05"
              value={waveSpeedMultiplier}
              onChange={(e) => onChangeWaveSpeed(parseFloat(e.target.value))}
              className="flex-1 accent-sky-400 cursor-pointer h-1.5 bg-white/20 rounded-lg"
            />
            <span className="text-[10px] text-white/50 font-mono">1.5x</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            onClick={onResume}
            className="w-full py-3 bg-white hover:bg-gray-100 text-black font-black text-xs uppercase tracking-wider rounded-full flex items-center justify-center gap-2 shadow-lg cursor-pointer"
          >
            <Play className="w-4 h-4 fill-black" /> Resume Run
          </button>

          <button
            onClick={onToggleMute}
            className="w-full py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-full flex items-center justify-center gap-2 cursor-pointer"
          >
            {isMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-red-400" /> Unmute Sound
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-yellow-400" /> Mute Sound
              </>
            )}
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 text-white/70 hover:text-white font-bold text-xs uppercase tracking-wider rounded-full flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" /> Restart Run
          </button>
        </div>
      </div>
    </div>
  );
};


