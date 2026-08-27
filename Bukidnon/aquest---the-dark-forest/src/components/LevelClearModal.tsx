import React from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { LevelConfig } from '../types';

interface LevelClearModalProps {
  completedLevel: LevelConfig;
  nextLevel: LevelConfig | null;
  onNextLevel: () => void;
}

export const LevelClearModal: React.FC<LevelClearModalProps> = ({
  completedLevel,
  nextLevel,
  onNextLevel,
}) => {
  return (
    <div id="level-clear-modal" className="absolute inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center p-6 z-40 animate-fade-in select-none">
      <div className="max-w-md w-full bg-neutral-950 border border-cyan-800/80 p-8 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.3)] text-center space-y-6">
        <div className="inline-flex p-3 rounded-full bg-cyan-950/60 border border-cyan-600 text-cyan-400">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-1">
          <div className="text-cyan-400 font-['VT323',monospace] text-xl uppercase tracking-widest">
            STAGE CLEARED!
          </div>
          <h2 className="text-4xl font-['Creepster',cursive] text-cyan-300 tracking-wider">
            {completedLevel.title}
          </h2>
          <p className="text-neutral-300 font-['VT323',monospace] text-2xl pt-2">
            All 3 buckets collected safely!
          </p>
        </div>

        {nextLevel && (
          <div className="bg-neutral-900/90 p-4 rounded-xl border border-neutral-800 text-left space-y-1.5 text-xs text-neutral-300">
            <span className="font-['VT323',monospace] text-lg text-amber-400 block font-bold">
              UPCOMING: {nextLevel.title}
            </span>
            <p className="text-neutral-400">{nextLevel.subtitle}</p>
          </div>
        )}

        <button
          id="btn-next-level"
          onClick={onNextLevel}
          className="w-full py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold font-['VT323',monospace] text-2xl rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>ENTER NEXT REALM</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
