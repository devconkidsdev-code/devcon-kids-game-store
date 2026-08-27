import React from 'react';
import { RotateCcw, AlertTriangle, Home, Skull, Clock, Droplets } from 'lucide-react';
import { WaterHeroAvatar } from './WaterHeroAvatar';
import { LevelConfig } from '../types';

interface Props {
  level: LevelConfig;
  reason: 'LIVES_DEPLETED' | 'TIMER_EXPIRED' | 'WATER_DEFICIT';
  waterPoints: number;
  onRetryLevel: () => void;
  onGoHome: () => void;
}

export const GameOverModal: React.FC<Props> = ({
  level,
  reason,
  waterPoints,
  onRetryLevel,
  onGoHome,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sky-900/60 backdrop-blur-sm animate-fadeIn" id="game-over-modal">
      <div className="w-full max-w-lg bg-yellow-50 border-8 border-blue-600 rounded-[32px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] text-center relative overflow-hidden animate-scaleUp">
        
        {/* Hurt Avatar */}
        <div className="flex justify-center mb-3">
          <WaterHeroAvatar size={85} mood="hurt" hasWater={false} />
        </div>

        {/* Failure Header Badge */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1 bg-red-500 border-2 border-red-700 rounded-full text-xs font-black text-white uppercase tracking-widest mb-2 shadow-sm">
          <AlertTriangle className="w-4 h-4" />
          <span>MISSION INTERRUPTED</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-red-600 font-heading uppercase tracking-wide">
          WATER SUPPLY FAILED
        </h2>

        {/* Reason Description */}
        <p className="text-sm font-bold text-slate-700 mt-2 px-2 leading-relaxed">
          {reason === 'LIVES_DEPLETED' && (
            <span>The Water Hero ran out of lives after encountering too many snakes! Stay vigilant and plan your paths carefully.</span>
          )}
          {reason === 'TIMER_EXPIRED' && (
            <span>Time ran out before the water could reach the community tank! You need to race quickly to deliver the water in Level 5.</span>
          )}
          {reason === 'WATER_DEFICIT' && (
            <span>Not enough clean water reached the reservoir! Avoid drought areas and toxic puddles that drain your supply.</span>
          )}
        </p>

        {/* Stats card */}
        <div className="grid grid-cols-2 gap-3 my-5">
          <div className="bg-white border-3 border-blue-600 rounded-2xl p-3 text-left shadow-sm">
            <span className="text-[10px] text-blue-900 font-black uppercase block">Current Level</span>
            <span className="text-sm font-black text-blue-600">Level {level.id}: {level.subtitle}</span>
          </div>

          <div className="bg-white border-3 border-blue-600 rounded-2xl p-3 text-left shadow-sm">
            <span className="text-[10px] text-blue-900 font-black uppercase block">Water Carried</span>
            <span className="text-sm font-black text-amber-600">{waterPoints} / {level.requiredWater} drops</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            id="btn-play-again"
            onClick={onRetryLevel}
            className="w-full flex-1 flex items-center justify-center gap-2 py-4 bg-green-500 hover:bg-green-400 text-white font-black text-base rounded-2xl border-b-6 border-green-700 shadow-lg active:translate-y-0.5 active:border-b-2 transition-all cursor-pointer uppercase"
          >
            <RotateCcw className="w-5 h-5" />
            <span>PLAY AGAIN</span>
          </button>

          <button
            id="btn-return-home"
            onClick={onGoHome}
            className="w-full sm:w-auto px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white font-black text-base rounded-2xl border-b-6 border-blue-800 shadow-lg active:translate-y-0.5 active:border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase"
          >
            <Home className="w-4 h-4" />
            <span>MAIN MENU</span>
          </button>
        </div>

      </div>
    </div>
  );
};
