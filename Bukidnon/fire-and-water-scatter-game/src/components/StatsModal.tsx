import React from 'react';
import { X, Trophy, Flame, Droplets, Zap, Award } from 'lucide-react';
import { GameStats } from '../types';
import { sound } from '../utils/sound';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GameStats;
  onResetStats: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({ isOpen, onClose, stats, onResetStats }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white border-4 border-amber-300 rounded-3xl shadow-[12px_12px_0px_0px_#fde68a] p-6 relative flex flex-col">
        <button
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="absolute top-4 right-4 w-9 h-9 rounded-2xl bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2 mb-4 font-display">
          <Trophy className="w-6 h-6 text-amber-500 fill-amber-400" />
          <span>Scatter Records & Stats</span>
        </h2>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3.5 bg-sky-50 border-2 border-sky-300 rounded-2xl shadow-[2px_2px_0px_0px_#bae6fd]">
            <span className="text-[11px] font-bold text-sky-800/70 block uppercase">Blitz Best Score</span>
            <span className="text-xl font-black text-sky-600">{stats.highScoreBlitz.toLocaleString()}</span>
          </div>
          <div className="p-3.5 bg-cyan-50 border-2 border-cyan-300 rounded-2xl shadow-[2px_2px_0px_0px_#a5f3fc]">
            <span className="text-[11px] font-bold text-cyan-800/70 block uppercase">Cascade Best Win</span>
            <span className="text-xl font-black text-cyan-600">{stats.highScoreCascade.toLocaleString()}</span>
          </div>
          <div className="p-3.5 bg-amber-50 border-2 border-amber-300 rounded-2xl shadow-[2px_2px_0px_0px_#fde68a]">
            <span className="text-[11px] font-bold text-amber-800/70 block uppercase">Mines Best Profit</span>
            <span className="text-xl font-black text-orange-500">{stats.highScoreMines.toLocaleString()}</span>
          </div>
          <div className="p-3.5 bg-indigo-50 border-2 border-indigo-300 rounded-2xl shadow-[2px_2px_0px_0px_#c7d2fe]">
            <span className="text-[11px] font-bold text-indigo-800/70 block uppercase">Tsunamis Cast</span>
            <span className="text-xl font-black text-indigo-600">{stats.tsunamisTriggered}</span>
          </div>
        </div>

        <div className="space-y-2 text-xs font-bold text-slate-700 bg-amber-50 p-3.5 rounded-2xl border-2 border-amber-200 shadow-[2px_2px_0px_0px_#fde68a] mb-5">
          <div className="flex justify-between">
            <span>Water Diamonds Collected:</span>
            <strong className="text-sky-600 font-black">{stats.totalWaterDiamondsCollected.toLocaleString()}</strong>
          </div>
          <div className="flex justify-between">
            <span>Fire Bombs Defused / Extinguished:</span>
            <strong className="text-orange-600 font-black">{stats.totalFireBombsDefused.toLocaleString()}</strong>
          </div>
          <div className="flex justify-between">
            <span>Total Cascades Won:</span>
            <strong className="text-teal-600 font-black">{stats.totalCascadesWon.toLocaleString()}</strong>
          </div>
        </div>

        <div className="flex gap-2.5">
          <button
            onClick={() => {
              sound.playClick();
              onResetStats();
            }}
            className="flex-1 py-2.5 rounded-2xl bg-white hover:bg-red-50 border-2 border-red-300 text-red-600 text-xs font-black transition-colors cursor-pointer shadow-[2px_2px_0px_0px_#fca5a5]"
          >
            Reset Statistics
          </button>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="flex-1 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-400 border-2 border-orange-600 text-white text-xs font-black transition-colors cursor-pointer shadow-[2px_2px_0px_0px_#c2410c]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
