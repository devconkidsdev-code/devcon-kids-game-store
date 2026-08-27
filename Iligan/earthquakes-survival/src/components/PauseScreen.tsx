import React from 'react';
import { Play, RotateCcw, Flag, Shield, Clock, Users, Flame, Volume2, VolumeX } from 'lucide-react';

interface PauseScreenProps {
  onResume: () => void;
  onRestart: () => void;
  onEndGame: () => void;
  timeRemaining: number;
  score: number;
  passengersCount: number;
  maxPassengers: number;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseScreen: React.FC<PauseScreenProps> = ({
  onResume,
  onRestart,
  onEndGame,
  timeRemaining,
  score,
  passengersCount,
  maxPassengers,
  isMuted,
  onToggleMute,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="text-center max-w-md w-full p-6 sm:p-8 border-4 border-amber-500 bg-[#1a1a1a] rounded-2xl shadow-[0_0_60px_rgba(245,158,11,0.35)] flex flex-col items-center">
        {/* Top Emergency Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-black uppercase tracking-widest mb-3">
          <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
          <span>Operations Suspended</span>
        </div>

        {/* Title */}
        <h2 className="text-3xl sm:text-4xl font-black uppercase text-amber-400 mb-1 tracking-tight">
          Game Paused
        </h2>
        <p className="text-xs text-gray-400 mb-5">Earthquake disaster rescue clock is currently frozen</p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 w-full mb-6 text-left">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col">
            <div className="flex items-center gap-1 text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">
              <Clock className="w-3 h-3 text-orange-400" />
              <span>Time Left</span>
            </div>
            <span className="text-lg font-mono font-black text-white">{formatTime(timeRemaining)}</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col">
            <div className="flex items-center gap-1 text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">
              <Shield className="w-3 h-3 text-green-400" />
              <span>Safe at Base</span>
            </div>
            <span className="text-lg font-mono font-black text-green-400">{score}</span>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col">
            <div className="flex items-center gap-1 text-gray-400 text-[10px] uppercase font-bold tracking-wider mb-1">
              <Users className="w-3 h-3 text-cyan-400" />
              <span>Onboard</span>
            </div>
            <span className="text-lg font-mono font-black text-cyan-400">
              {passengersCount}/{maxPassengers}
            </span>
          </div>
        </div>

        {/* Quick Shelter Tip */}
        <div className="w-full bg-cyan-950/40 border border-cyan-500/30 rounded-xl p-2.5 mb-5 text-left text-xs text-cyan-200 flex items-center gap-2">
          <span className="text-base">🏥</span>
          <span>Tip: Drive inside the <strong>Metro Disaster Shelter</strong> on Pine St to rescue trapped citizens!</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 w-full">
          {/* Resume Button */}
          <button
            onClick={onResume}
            className="w-full py-3.5 bg-orange-600 hover:bg-orange-500 active:scale-95 text-white font-black text-lg uppercase tracking-wider rounded-xl transition-all shadow-[0_0_25px_rgba(234,88,12,0.5)] cursor-pointer flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>Resume Mission</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5 w-full">
            {/* Restart Button */}
            <button
              onClick={onRestart}
              className="py-3 bg-[#282828] hover:bg-[#333] active:scale-95 text-gray-200 hover:text-white font-bold text-sm uppercase tracking-wider rounded-xl border border-white/10 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
            >
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>Restart</span>
            </button>

            {/* End Game / Conclude Button */}
            <button
              onClick={onEndGame}
              className="py-3 bg-red-950/60 hover:bg-red-900/80 active:scale-95 text-red-200 hover:text-white font-bold text-sm uppercase tracking-wider rounded-xl border border-red-500/40 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
            >
              <Flag className="w-4 h-4 text-red-400" />
              <span>End Mission</span>
            </button>
          </div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            className="mt-1 text-xs text-gray-400 hover:text-gray-200 flex items-center justify-center gap-1.5 py-1.5 cursor-pointer transition-colors"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-green-400" />}
            <span>{isMuted ? 'Unmute Audio' : 'Mute Audio'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
