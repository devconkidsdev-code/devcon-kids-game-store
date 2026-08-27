import React from 'react';
import { RotateCcw, Waves, Skull, ArrowLeft } from 'lucide-react';
import { GameStats } from '../game/engine';
import { LevelConfig } from '../types';

interface GameOverModalProps {
  stats: GameStats;
  level: LevelConfig;
  onRetry: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  stats,
  level,
  onRetry,
  onMainMenu,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none font-sans">
      <div className="bg-slate-900 border border-red-500/50 rounded-2xl w-full max-w-md p-6 sm:p-8 flex flex-col items-center text-center shadow-[0_0_50px_rgba(220,38,38,0.25)] relative overflow-hidden backdrop-blur-xl">
        {/* Top Hazard Glow */}
        <div className="absolute -top-24 inset-x-0 h-36 bg-red-600/20 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-dot-grid opacity-10 pointer-events-none" />

        {/* Hazard Badge */}
        <div className="relative z-10 w-16 h-16 rounded-2xl bg-red-950/90 border border-red-500/60 flex items-center justify-center text-red-400 mb-4 shadow-[0_0_20px_rgba(220,38,38,0.4)] animate-bounce">
          <Skull className="w-8 h-8" />
        </div>

        {/* Title */}
        <div className="relative z-10">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-red-400 block mb-1">
            ALERT // MISSION TERMINATED
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase italic">
            EVACUATION FAILED
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-300 mt-2 max-w-xs leading-relaxed">
            {stats.gameOverReason || 'The torrential typhoon floodwaters overtook Dexter before reaching safety.'}
          </p>
        </div>

        {/* Stats Grid Card */}
        <div className="relative z-10 w-full bg-slate-950/70 border border-slate-800 rounded-xl p-4 my-5 space-y-2.5 shadow-inner">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span className="uppercase tracking-wider text-[10px]">Alert Signal</span>
            <span className="font-bold text-slate-200">{level.signalName}</span>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-400">
            <span className="uppercase tracking-wider text-[10px]">Time Survived</span>
            <span className="font-mono font-bold text-red-400">{stats.timeElapsed.toFixed(1)}s / 60.0s</span>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-400">
            <span className="uppercase tracking-wider text-[10px]">Supplies Gathered</span>
            <span className="font-mono font-bold text-emerald-400">
              {stats.suppliesCollected} / {stats.totalSupplies}
            </span>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-800/80 pt-2.5">
            <span className="uppercase tracking-wider text-[10px] font-bold">Total Score</span>
            <span className="font-mono font-black text-lg text-yellow-400">{stats.score}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="relative z-10 w-full flex flex-col sm:flex-row gap-3">
          <button
            onClick={onMainMenu}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-600 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" /> Main Menu
          </button>

          <button
            onClick={onRetry}
            className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(220,38,38,0.5)] border border-red-400/40 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" /> RETRY ESCAPE
          </button>
        </div>

        {/* Tactical Survival Tip */}
        <div className="relative z-10 mt-4 text-[11px] text-slate-400 flex items-center gap-1.5 bg-slate-950/40 px-3 py-1.5 rounded-lg border border-slate-800/60">
          <Waves className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Tip: Gather the 🦺 Life Vest to double swim speed &amp; breath underwater!</span>
        </div>
      </div>
    </div>
  );
};
