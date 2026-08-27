import React from 'react';
import { ArrowLeft, Trophy, Trash2, Zap } from 'lucide-react';
import { HighScoreEntry } from '../types';

interface LeaderboardModalProps {
  scores: HighScoreEntry[];
  onClearScores: () => void;
  onBack: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  scores,
  onClearScores,
  onBack,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#050805]/95 border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-7 max-w-lg w-full shadow-[0_0_50px_rgba(16,185,129,0.2)] relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Background watermark */}
        <div className="text-[100px] font-black leading-none tracking-tighter text-emerald-500/5 absolute -bottom-6 -right-6 pointer-events-none select-none">
          RECORDS
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-3 z-10">
          <button
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-bold text-emerald-300 hover:text-white bg-black/60 hover:bg-emerald-950/60 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[9px] uppercase tracking-[0.3em] text-emerald-500 font-bold">
              Honor Board
            </span>
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xl sm:text-2xl font-black text-white italic tracking-tight drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                PROVINCE <span className="text-emerald-400">RECORDS</span>
              </h2>
            </div>
          </div>
          {scores.length > 0 ? (
            <button
              onClick={onClearScores}
              className="p-1.5 text-zinc-500 hover:text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg transition-all cursor-pointer"
              title="Reset Records"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-8" />
          )}
        </div>

        {/* Scores List */}
        <div className="overflow-y-auto space-y-2 pr-1 my-2 flex-1 z-10">
          {scores.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-xs bg-black/60 rounded-2xl border border-emerald-500/20">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
              No runs recorded yet. Start sprinting with Alexander to set province records!
            </div>
          ) : (
            scores.map((entry, index) => {
              const rankColor =
                index === 0
                  ? 'text-amber-300 border-amber-500/50 bg-amber-950/30 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                  : index === 1
                  ? 'text-emerald-300 border-emerald-500/40 bg-emerald-950/40'
                  : index === 2
                  ? 'text-teal-300 border-teal-500/30 bg-[#051410]'
                  : 'text-zinc-400 border-emerald-500/15 bg-black/60';

              return (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border ${rankColor} text-xs sm:text-sm`}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-black text-sm w-5 text-center">#{index + 1}</span>
                    <div className="text-left">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white block">{entry.playerName}</span>
                        {entry.isInfinite && (
                          <span className="bg-teal-500/20 text-teal-300 border border-teal-400/40 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase">
                            Tier {entry.difficultyTier || 1}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-emerald-400/80">
                        {entry.levelName} {entry.distance ? `• ${entry.distance}m` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-black text-amber-300 block font-mono">
                      {entry.score.toLocaleString()} PTS
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">{entry.timeSpent}s</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={onBack}
          className="w-full mt-3 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black italic tracking-widest text-sm uppercase rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all active:scale-[0.98] cursor-pointer z-10"
        >
          BACK TO SPRINT
        </button>
      </div>
    </div>
  );
};

