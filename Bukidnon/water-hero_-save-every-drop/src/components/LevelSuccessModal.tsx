import React from 'react';
import { ArrowRight, Droplets, Heart, Sparkles, Lightbulb, Info } from 'lucide-react';
import { LevelConfig } from '../types';
import { WaterHeroAvatar } from './WaterHeroAvatar';

interface Props {
  level: LevelConfig;
  waterPoints: number;
  lives: number;
  isLastLevel: boolean;
  onNextLevel: () => void;
}

export const LevelSuccessModal: React.FC<Props> = ({
  level,
  waterPoints,
  lives,
  isLastLevel,
  onNextLevel,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-sky-900/60 backdrop-blur-sm animate-fadeIn" id="level-cleared-modal">
      <div className="w-full max-w-lg bg-yellow-50 border-8 border-blue-600 rounded-[32px] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.3)] text-center relative overflow-hidden animate-scaleUp">
        
        {/* Celebrating Avatar */}
        <div className="flex justify-center mb-3">
          <WaterHeroAvatar size={90} mood="celebrating" />
        </div>

        {/* Level Cleared Title */}
        <div className="inline-flex items-center gap-1.5 px-4 py-1 bg-green-500 border-2 border-green-600 rounded-full text-xs font-black text-white uppercase tracking-widest mb-2 shadow-sm">
          <Sparkles className="w-4 h-4" />
          <span>LEVEL {level.id} CLEARED!</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black text-blue-600 font-heading uppercase tracking-wide">
          COMMUNITY SAVED!
        </h2>
        <p className="text-sm font-bold text-slate-700 mt-1">
          You made it outside the maze and delivered <strong className="text-blue-600 font-black">{waterPoints} clean water drops</strong> to the community waiting at the water tank!
        </p>

        {/* Community Villagers Gratitude Banner */}
        <div className="bg-emerald-100 border-2 border-emerald-300 rounded-2xl p-3 my-3 text-left flex items-center gap-3">
          <span className="text-3xl">👨‍👩‍👧‍👦</span>
          <div>
            <span className="text-[10px] font-black uppercase text-emerald-900 block">Village Gratitude</span>
            <p className="text-xs font-bold text-emerald-800">
              The families and children now have clean drinking water to fill their buckets!
            </p>
          </div>
        </div>

        {/* Level Stats Badges */}
        <div className="flex items-center justify-center gap-4 my-4">
          <div className="bg-white border-3 border-blue-600 px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-sm">
            <span className="text-2xl">💧</span>
            <div className="text-left">
              <span className="text-[10px] text-blue-900 font-black block uppercase">Delivered</span>
              <span className="text-base font-black text-blue-600">{waterPoints} drops</span>
            </div>
          </div>

          <div className="bg-white border-3 border-blue-600 px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-sm">
            <span className="text-2xl">❤️</span>
            <div className="text-left">
              <span className="text-[10px] text-blue-900 font-black block uppercase">Health</span>
              <span className="text-base font-black text-rose-500">{lives} / 3 Lives</span>
            </div>
          </div>
        </div>

        {/* Educational Fact / Tip Card */}
        <div className="bg-white border-3 border-blue-600 rounded-2xl p-3.5 text-left mb-6 space-y-2 shadow-sm">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-800 font-bold">
              <strong className="text-blue-600 font-black uppercase">Water Fact:</strong> {level.educationalFact}
            </p>
          </div>
          <div className="flex items-start gap-2 pt-2 border-t border-blue-100">
            <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-800 font-bold">
              <strong className="text-amber-600 font-black uppercase">Action Tip:</strong> {level.educationalTip}
            </p>
          </div>
        </div>

        {/* Next Level Button */}
        <button
          id="btn-next-level"
          onClick={onNextLevel}
          className="w-full flex items-center justify-center gap-2 py-4 bg-green-500 hover:bg-green-400 text-white font-black text-lg rounded-2xl border-b-6 border-green-700 shadow-lg active:translate-y-0.5 active:border-b-2 transition-all cursor-pointer uppercase tracking-wide"
        >
          <span>{isLastLevel ? 'Proceed to Celebration!' : 'Continue to Next Level'}</span>
          <ArrowRight className="w-5 h-5" />
        </button>

      </div>
    </div>
  );
};
