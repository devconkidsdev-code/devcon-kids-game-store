import React from 'react';
import { Trophy, Sparkles, RotateCcw, Flame } from 'lucide-react';
import { PlayerStats } from '../types';

interface VictoryModalProps {
  stats: PlayerStats;
  onPlayAgain: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ stats, onPlayAgain }) => {
  return (
    <div id="victory-modal" className="absolute inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 z-50 animate-fade-in select-none">
      <div className="max-w-lg w-full bg-neutral-950 border border-amber-500/60 p-8 rounded-2xl shadow-[0_0_80px_rgba(245,158,11,0.3)] text-center space-y-6">
        <div className="inline-flex p-4 rounded-full bg-amber-950/60 border border-amber-600 text-amber-400 animate-pulse">
          <Trophy className="w-14 h-14" />
        </div>

        <div className="space-y-1">
          <div className="text-amber-400 font-['VT323',monospace] text-2xl tracking-widest uppercase flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5" /> THE CURSE IS BROKEN <Sparkles className="w-5 h-5" />
          </div>
          <h2 className="text-5xl md:text-6xl font-['Creepster',cursive] text-amber-400 tracking-wider drop-shadow-[0_2px_15px_rgba(245,158,11,0.6)]">
            QUEST COMPLETED!
          </h2>
          <p className="text-neutral-300 font-['VT323',monospace] text-2xl">
            The boy gathered all 15 buckets of holy water and greeted the sunrise.
          </p>
        </div>

        {/* Final score card */}
        <div className="bg-neutral-900/90 p-5 rounded-xl border border-neutral-800 space-y-3 text-sm text-neutral-300">
          <div className="flex justify-between font-['VT323',monospace] text-xl">
            <span className="text-neutral-400">Total Holy Buckets:</span>
            <span className="text-cyan-400 font-bold">15 / 15</span>
          </div>
          <div className="flex justify-between font-['VT323',monospace] text-xl">
            <span className="text-neutral-400">Total Time Taken:</span>
            <span className="text-amber-400 font-bold">{Math.floor(stats.timeElapsed)} seconds</span>
          </div>
          <div className="flex justify-between font-['VT323',monospace] text-xl">
            <span className="text-neutral-400">Lives Remaining:</span>
            <span className="text-red-400 font-bold">{'❤️'.repeat(stats.lives)}</span>
          </div>
          <div className="flex justify-between font-['VT323',monospace] text-xl">
            <span className="text-neutral-400">Creature Dodges:</span>
            <span className="text-emerald-400 font-bold">{stats.nearMisses}</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          id="btn-play-again"
          onClick={onPlayAgain}
          className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-bold font-['VT323',monospace] text-2xl rounded-xl transition-all shadow-[0_0_25px_rgba(245,158,11,0.5)] flex items-center justify-center gap-2 cursor-pointer"
        >
          <RotateCcw className="w-6 h-6" />
          <span>PLAY AGAIN</span>
        </button>
      </div>
    </div>
  );
};
