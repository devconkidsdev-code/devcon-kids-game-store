import React, { useState, useEffect } from 'react';
import { Award, Trophy, RotateCcw, ArrowRight, ArrowLeft, Sparkles } from 'lucide-react';
import { GameStats } from '../game/engine';
import { LevelConfig, Difficulty, HighScoreRecord } from '../types';

interface VictoryModalProps {
  stats: GameStats;
  level: LevelConfig;
  onPlayNextLevel: (nextDiff: Difficulty) => void;
  onRetry: () => void;
  onMainMenu: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  stats,
  level,
  onPlayNextLevel,
  onRetry,
  onMainMenu,
}) => {
  const [highScores, setHighScores] = useState<HighScoreRecord[]>([]);

  useEffect(() => {
    try {
      const records: HighScoreRecord[] = JSON.parse(localStorage.getItem('bagyo_high_scores') || '[]');
      setHighScores(records);
    } catch {
      // Safe catch
    }
  }, []);

  const getNextDifficulty = (): Difficulty | null => {
    if (level.id === 'SIGNAL_1') return 'SIGNAL_2';
    if (level.id === 'SIGNAL_2') return 'SIGNAL_3';
    return null;
  };

  const nextDiff = getNextDifficulty();

  const getRatingBadgeColor = (rating: string) => {
    switch (rating) {
      case 'S': return 'bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.6)]';
      case 'A': return 'bg-emerald-500 text-slate-950 border-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.6)]';
      case 'B': return 'bg-sky-500 text-slate-950 border-sky-300 shadow-[0_0_15px_rgba(14,165,233,0.6)]';
      default: return 'bg-slate-500 text-white border-slate-400';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn select-none font-sans">
      <div className="bg-slate-900 border border-emerald-500/50 rounded-3xl w-full max-w-lg p-6 sm:p-8 flex flex-col items-center text-center shadow-[0_0_50px_rgba(16,185,129,0.25)] relative overflow-hidden backdrop-blur-xl">
        {/* Top Victory Golden Halo */}
        <div className="absolute -top-24 inset-x-0 h-40 bg-emerald-500/20 blur-3xl pointer-events-none" />
        <div className="absolute inset-0 bg-dot-grid opacity-10 pointer-events-none" />

        {/* Victory Trophy Badge */}
        <div className="relative z-10 mb-3">
          <div className="w-20 h-20 rounded-3xl bg-emerald-950/90 border border-emerald-500/60 flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.4)]">
            <Trophy className="w-10 h-10 text-yellow-400 animate-bounce" />
          </div>
          <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-2 flex items-center justify-center font-black text-sm shadow-lg ${getRatingBadgeColor(stats.rating)}`}>
            {stats.rating}
          </div>
        </div>

        {/* Title */}
        <div className="relative z-10">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-emerald-400 block mb-1">
            MISSION SUCCESS // RESCUED
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase italic">
            EVACUATION SUCCESSFUL!
          </h2>
          <p className="text-xs sm:text-sm font-medium text-slate-300 mt-1 max-w-sm leading-relaxed">
            Dexter reached the Coast Guard Rescue Boat before the 1-minute flood deadline!
          </p>
        </div>

        {/* Stats Grid */}
        <div className="relative z-10 w-full grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-5">
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 flex flex-col items-center shadow-inner">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Time Left</span>
            <span className="text-base sm:text-lg font-black font-mono text-red-400 mt-0.5">
              {stats.timeLeft.toFixed(1)}s
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 flex flex-col items-center shadow-inner">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Supplies</span>
            <span className="text-base sm:text-lg font-black font-mono text-emerald-400 mt-0.5">
              {stats.suppliesCollected}/{stats.totalSupplies}
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 flex flex-col items-center shadow-inner">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Rating</span>
            <span className="text-base sm:text-lg font-black font-mono text-yellow-400 mt-0.5">
              Grade {stats.rating}
            </span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 flex flex-col items-center shadow-inner">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Final Score</span>
            <span className="text-base sm:text-lg font-black font-mono text-yellow-400 mt-0.5">
              {stats.score}
            </span>
          </div>
        </div>

        {/* High Score History List */}
        {highScores.length > 0 && (
          <div className="relative z-10 w-full bg-slate-950/60 border border-slate-800/80 rounded-2xl p-3.5 mb-5 text-left shadow-inner">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-2 px-1">
              <span className="flex items-center gap-1.5 uppercase tracking-wider text-[10px]"><Award className="w-3.5 h-3.5 text-amber-400" /> Leaderboard Top Escapes</span>
              <span className="uppercase tracking-wider text-[10px]">Score</span>
            </div>
            <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1 text-xs">
              {highScores.slice(0, 3).map((rec, i) => (
                <div key={rec.id || i} className="flex justify-between items-center bg-slate-900/80 px-2.5 py-1.5 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-400 text-[11px]">#{i + 1}</span>
                    <span className="font-semibold text-slate-200">{rec.difficulty.replace('_', ' ')}</span>
                    <span className="text-[10px] text-red-400 font-mono">({rec.timeLeft}s left)</span>
                  </div>
                  <span className="font-mono font-bold text-yellow-400">{rec.score} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="relative z-10 w-full flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={onMainMenu}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-600 active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" /> Menu
          </button>

          <button
            onClick={onRetry}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer border border-slate-600 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" /> Replay
          </button>

          {nextDiff ? (
            <button
              onClick={() => onPlayNextLevel(nextDiff)}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-[0_0_20px_rgba(16,185,129,0.5)] active:scale-95 border border-emerald-300/40"
            >
              Next Signal <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onMainMenu}
              className="flex-1 py-3 px-4 rounded-xl bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 border border-yellow-300"
            >
              <Sparkles className="w-4 h-4" /> ALL CLEAR!
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
