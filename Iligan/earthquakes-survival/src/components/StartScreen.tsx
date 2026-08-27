import React from 'react';
import {
  Award,
  Flame,
  Play,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface StartScreenProps {
  onStartGame: () => void;
  highScore: number;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStartGame,
  highScore,
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="text-center max-w-lg w-full p-6 sm:p-8 border-4 border-orange-600 bg-[#1a1a1a] rounded-2xl shadow-[0_0_60px_rgba(234,88,12,0.35)] flex flex-col items-center">
        {/* Top Emergency Pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-600/20 border border-orange-500/40 text-orange-400 text-xs font-black uppercase tracking-widest mb-4">
          <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
          <span>Disaster Emergency Protocol</span>
        </div>

        {/* Title */}
        <h2 className="text-4xl sm:text-5xl font-black uppercase text-orange-500 mb-3 tracking-tight">
          Emergency Alert
        </h2>

        {/* Description */}
        <p className="text-base sm:text-lg text-gray-300 mb-6 leading-relaxed">
          A massive earthquake has hit the city! Rescue citizens and bring them to the{' '}
          <span className="text-green-500 font-bold underline decoration-green-500/50 underline-offset-2">Safe Zone</span>{' '}
          before the timer expires.
        </p>

        {/* Controls & Goal 2-Col Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5 w-full text-sm">
          <div className="bg-white/10 p-3 rounded-xl border border-white/5 text-left flex flex-col justify-between">
            <div className="flex items-center gap-1.5 font-bold text-orange-400 uppercase tracking-wider mb-1 text-xs">
              <Zap className="w-3.5 h-3.5" />
              <span>Controls</span>
            </div>
            <p className="text-gray-200 text-xs font-medium">
              <span className="font-mono font-bold text-amber-300">WASD / Arrows</span> or D-Pad
            </p>
            <p className="text-gray-400 text-[11px] mt-0.5">
              <span className="font-mono text-gray-200">P / Esc</span> Pause • <span className="font-mono text-gray-200">SPACE</span> Horn
            </p>
          </div>

          <div className="bg-white/10 p-3 rounded-xl border border-white/5 text-left flex flex-col justify-between">
            <div className="flex items-center gap-1.5 font-bold text-green-400 uppercase tracking-wider mb-1 text-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Glowing Aura Rescue</span>
            </div>
            <p className="text-gray-200 text-xs font-medium">
              Touch survivors with your <span className="text-green-400 font-bold">glowing aura</span> to collect them!
            </p>
            <p className="text-cyan-300 text-[11px] mt-0.5 font-semibold">
              🏥 Drive inside Metro Shelter on Pine St!
            </p>
          </div>
        </div>

        {/* Best Record */}
        {highScore > 0 && (
          <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1.5 rounded-xl mb-6">
            <Award className="w-4 h-4 text-amber-400" />
            <span>High Score Record: {highScore} People Rescued</span>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={onStartGame}
          className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white font-black text-xl uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-[0_0_30px_rgba(234,88,12,0.6)] hover:shadow-[0_0_40px_rgba(234,88,12,0.8)] cursor-pointer flex items-center justify-center gap-3"
        >
          <Play className="w-6 h-6 fill-white" />
          <span>Start Rescue Mission</span>
        </button>
      </div>
    </div>
  );
};

