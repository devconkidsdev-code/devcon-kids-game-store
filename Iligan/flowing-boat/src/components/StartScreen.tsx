import React from 'react';
import { Play, Waves, Ship, Volume2, VolumeX, Award, Gauge } from 'lucide-react';
import { Difficulty } from '../types';
import { DIFFICULTY_CONFIG, WAVE_SPEED_PRESETS } from '../game/constants';

interface StartScreenProps {
  difficulty: Difficulty;
  onSelectDifficulty: (d: Difficulty) => void;
  waveSpeedMultiplier: number;
  onChangeWaveSpeed: (multiplier: number) => void;
  onStartGame: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  highScores: { difficulty: Difficulty; time: number; stars: number }[];
}

export const StartScreen: React.FC<StartScreenProps> = ({
  difficulty,
  onSelectDifficulty,
  waveSpeedMultiplier,
  onChangeWaveSpeed,
  onStartGame,
  isMuted,
  onToggleMute,
  highScores,
}) => {
  return (
    <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-30 overflow-y-auto">
      <div className="max-w-xl w-full bg-black/50 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-5 text-center relative overflow-hidden text-white my-auto">
        {/* Glow accents */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-yellow-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Sound Toggle */}
        <div className="absolute top-4 right-4">
          <button
            onClick={onToggleMute}
            className="p-2.5 rounded-2xl bg-white/10 border border-white/20 text-white/80 hover:text-white transition-colors shadow-md cursor-pointer"
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <VolumeX className="w-5 h-5 text-red-400" /> : <Volume2 className="w-5 h-5" />}
          </button>
        </div>

        {/* Game Title Header */}
        <div className="flex flex-col items-center gap-1.5 mt-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 border border-white/20 rounded-full text-white/80 text-[11px] font-semibold uppercase tracking-[0.2em]">
            <Waves className="w-3.5 h-3.5 text-blue-400" /> 2D River Escape
          </div>
          <h1 className="text-4xl sm:text-5xl font-black italic tracking-tighter text-white drop-shadow-md">
            FLOWING BOAT
          </h1>
          <p className="text-xs sm:text-sm text-white/70 max-w-md mx-auto leading-relaxed">
            Escape the chasing tidal wave! Sprint across the riverbank to reach your wooden boat, then navigate dangerous rapids to cross the finish line!
          </p>
        </div>

        {/* Two Stages Concept Card */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
          <div className="bg-white/5 border border-white/15 p-3.5 rounded-2xl flex flex-col gap-1 backdrop-blur-md">
            <div className="flex items-center gap-2 text-yellow-400 font-bold italic text-xs tracking-tight">
              <span className="text-sm not-italic">🏃</span> STAGE 1: REACH BOAT
            </div>
            <p className="text-[11px] text-white/60 leading-normal">
              Run on land, dodge boulders, mud, and jump over tree roots while staying ahead of the giant wave.
            </p>
          </div>

          <div className="bg-white/5 border border-white/15 p-3.5 rounded-2xl flex flex-col gap-1 backdrop-blur-md">
            <div className="flex items-center gap-2 text-blue-400 font-bold italic text-xs tracking-tight">
              <Ship className="w-3.5 h-3.5" /> STAGE 2: RIDE RAPIDS
            </div>
            <p className="text-[11px] text-white/60 leading-normal">
              Row downriver, steer through rocks, logs, and swirling whirlpools to cross the victory finish line.
            </p>
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="flex flex-col gap-1.5 text-left">
          <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60">
            Select Difficulty
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['easy', 'normal', 'hard'] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => onSelectDifficulty(d)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  difficulty === d
                    ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-500/40 scale-102'
                    : 'bg-white/10 text-white/70 border-white/10 hover:bg-white/15'
                }`}
              >
                {d === 'easy' ? 'Gentle Flow' : d === 'normal' ? 'Wild Current' : 'Raging Rapids'}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-white/50 italic">
            {DIFFICULTY_CONFIG[difficulty].description}
          </p>
        </div>

        {/* Wave Speed Adjustment Control */}
        <div className="flex flex-col gap-2 bg-white/5 border border-white/15 p-3.5 rounded-2xl text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-blue-300">
              <Gauge className="w-3.5 h-3.5 text-blue-400" /> Wave Chaser Speed
            </div>
            <span className="text-xs font-mono font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-md border border-blue-400/30">
              {Math.round(waveSpeedMultiplier * 100)}% Speed ({waveSpeedMultiplier.toFixed(2)}x)
            </span>
          </div>

          {/* Quick Presets */}
          <div className="grid grid-cols-4 gap-1.5">
            {WAVE_SPEED_PRESETS.map((preset) => {
              const isActive = Math.abs(waveSpeedMultiplier - preset.multiplier) < 0.04;
              return (
                <button
                  key={preset.id}
                  onClick={() => onChangeWaveSpeed(preset.multiplier)}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold transition-all border cursor-pointer text-center ${
                    isActive
                      ? 'bg-sky-500 text-white border-sky-300 font-bold shadow-md shadow-sky-500/30'
                      : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white'
                  }`}
                  title={preset.description}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>

          {/* Fine Tuning Slider */}
          <div className="flex items-center gap-3 pt-1">
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

        {/* Controls Info matching Sleek Interface keycaps */}
        <div className="bg-white/5 border border-white/10 p-2.5 rounded-2xl text-xs text-white/80 flex items-center justify-around">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <span className="w-5 h-5 flex items-center justify-center bg-white/20 rounded text-[10px] font-mono font-bold text-white">←</span>
              <span className="w-5 h-5 flex items-center justify-center bg-white/20 rounded text-[10px] font-mono font-bold text-white">↑</span>
              <span className="w-5 h-5 flex items-center justify-center bg-white/20 rounded text-[10px] font-mono font-bold text-white">→</span>
            </div>
            <span className="text-[11px] uppercase tracking-wider font-semibold">Steer & Row</span>
          </div>
          <div className="w-[1px] h-5 bg-white/20" />
          <div className="flex items-center gap-2">
            <span className="px-2 h-5 flex items-center justify-center bg-blue-600 border border-blue-400 rounded text-[10px] font-mono font-bold text-white tracking-tight">SPACE</span>
            <span className="text-[11px] uppercase tracking-wider font-semibold">Jump / Boost</span>
          </div>
        </div>

        {/* Start Game Button */}
        <button
          onClick={onStartGame}
          className="w-full py-3.5 bg-white hover:bg-gray-100 text-black font-black text-base uppercase tracking-wider rounded-full shadow-2xl flex items-center justify-center gap-3 active:scale-98 transition-all cursor-pointer"
        >
          <Play className="w-5 h-5 fill-black" /> Start Survival Run
        </button>

        {/* Best Records */}
        {highScores.length > 0 && (
          <div className="text-xs text-white/60 flex items-center justify-center gap-1.5">
            <Award className="w-4 h-4 text-yellow-400" />
            <span>
              Best Record:{' '}
              <strong className="text-white font-mono">
                {Math.min(...highScores.map((h) => h.time)).toFixed(1)}s
              </strong>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};


