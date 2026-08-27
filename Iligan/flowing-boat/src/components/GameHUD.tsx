import React from 'react';
import { Heart, Zap, Volume2, VolumeX, Pause, Compass } from 'lucide-react';
import { GameStage, PlayerState, WaveState } from '../types';

interface GameHUDProps {
  stage: GameStage;
  player: PlayerState;
  wave: WaveState;
  currentRound: number;
  totalRounds: number;
  biomeName: string;
  stage1Length: number;
  totalGameLength: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stage,
  player,
  wave,
  currentRound,
  totalRounds,
  biomeName,
  stage1Length,
  totalGameLength,
  isMuted,
  onToggleMute,
  onPause,
}) => {
  const isStage2 = stage === 'stage2_boat';
  const isTransition = stage === 'transition';

  // Overall course progress (0 to 100%)
  const totalProgress = Math.min(100, Math.max(0, (player.y / totalGameLength) * 100));
  const dockProgress = (stage1Length / totalGameLength) * 100;

  // Wave distance behind player
  const waveGap = Math.max(0, Math.round(player.y - wave.y));
  const isWaveDangerouslyClose = waveGap < 95;

  return (
    <header className="absolute inset-x-0 top-0 p-3 sm:p-4 pointer-events-none flex flex-col gap-2.5 z-10">
      {/* Top Main Sleek Bar */}
      <div className="flex items-center justify-between gap-2.5">
        {/* Brand & Round Chip */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl px-3.5 py-2 border border-white/20 shadow-lg pointer-events-auto flex items-center gap-2.5">
          <h1 className="text-white text-sm sm:text-base font-black italic tracking-tighter">
            FLOWING BOAT
          </h1>
          <div className="h-4 w-[1px] bg-white/20" />
          <div className="flex items-center gap-1.5 bg-blue-600/60 px-2 py-0.5 rounded-lg border border-blue-400/40 text-[11px] font-bold text-blue-100">
            <Compass className="w-3 h-3 text-blue-300" />
            <span>R{currentRound}/{totalRounds}: {biomeName}</span>
          </div>
        </div>

        {/* Hearts & Boost Gauge */}
        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20 shadow-lg pointer-events-auto">
          {/* Hearts */}
          <div className="flex items-center gap-1">
            {Array.from({ length: player.maxHealth }).map((_, i) => (
              <Heart
                key={i}
                className={`w-5 h-5 transition-transform duration-300 ${
                  i < player.health
                    ? 'text-red-500 fill-red-500 scale-100 drop-shadow-md'
                    : 'text-white/20 fill-white/10 scale-90'
                }`}
              />
            ))}
          </div>

          <div className="h-4 w-[1px] bg-white/20 mx-1" />

          {/* Jump / Boost Pill */}
          <div
            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border transition-all ${
              player.boostCooldown <= 0 && !player.isJumping
                ? isStage2
                  ? 'bg-blue-600 text-white border-blue-400 shadow-lg shadow-blue-500/50'
                  : 'bg-white text-black border-white shadow-md'
                : 'bg-white/10 text-white/40 border-white/10'
            }`}
          >
            <Zap
              className={`w-3 h-3 ${
                player.boostCooldown <= 0 && !player.isJumping
                  ? isStage2
                    ? 'fill-white'
                    : 'fill-black'
                  : 'fill-transparent'
              }`}
            />
            <span>{isStage2 ? 'BOOST' : 'JUMP'}</span>
          </div>
        </div>

        {/* Sound & Pause Controls */}
        <div className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 shadow-lg pointer-events-auto">
          <button
            onClick={onToggleMute}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={onPause}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            title="Pause Game"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sleek Central Mission Progress & Wave Distance Dashboard */}
      <div className="w-full max-w-xl mx-auto bg-black/40 backdrop-blur-md border border-white/20 rounded-2xl p-3 sm:p-4 flex items-center justify-between text-white shadow-xl pointer-events-auto">
        {/* Mission Progress */}
        <div className="flex flex-col gap-1 flex-1 pr-3">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] text-white/60">
            <span>Mission Progress (Round {currentRound})</span>
            <span className="font-mono text-white/80">{Math.round(totalProgress)}%</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-base sm:text-lg font-bold italic tracking-tight uppercase truncate">
              {isTransition
                ? 'BOARDING BOAT'
                : isStage2
                ? 'RIDING THE FLOW'
                : 'REACH THE BOAT'}
            </span>
            <div className="flex-1 max-w-[140px] sm:max-w-[180px] h-2 bg-white/20 rounded-full overflow-hidden relative">
              <div
                className="absolute top-0 bottom-0 w-1 bg-yellow-300 z-10"
                style={{ left: `${dockProgress}%` }}
              />
              <div
                className="h-full bg-yellow-400 transition-all duration-150 rounded-full"
                style={{ width: `${totalProgress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="h-9 w-[1px] bg-white/20 mx-1"></div>

        {/* Wave Distance Meter */}
        <div className="text-right pl-3 flex flex-col items-end">
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/60">
            Wave Distance
          </span>
          <div
            className={`text-xl sm:text-2xl font-mono font-bold leading-none mt-0.5 ${
              isWaveDangerouslyClose
                ? 'text-red-400 animate-pulse'
                : 'text-blue-300'
            }`}
          >
            {waveGap}.0m
          </div>
        </div>
      </div>
    </header>
  );
};


