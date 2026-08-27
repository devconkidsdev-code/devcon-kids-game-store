import React from 'react';
import { HighScoreRecord } from '../types';
import { Trophy, Star, X, Droplets, Clock, Calendar } from 'lucide-react';

interface LeaderboardModalProps {
  records: HighScoreRecord[];
  onClose: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ records, onClose }) => {
  return (
    <div className="absolute inset-0 z-50 bg-indigo-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-indigo-900/90 border-2 border-pink-500/40 rounded-3xl p-6 shadow-[0_0_50px_rgba(236,72,153,0.3)] text-center flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-indigo-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-400 text-indigo-950 rounded-2xl shadow-[0_0_15px_rgba(250,204,21,0.5)] font-black">
              <Trophy className="w-5 h-5 fill-current" />
            </div>
            <div className="text-left">
              <h3 className="text-xl font-black italic tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-yellow-300">
                ARCADE LEADERBOARD
              </h3>
              <p className="text-xs text-indigo-300 font-medium">Local Champion Records</p>
            </div>
          </div>
          <button
            id="close-leaderboard-btn"
            onClick={onClose}
            aria-label="Close High Scores"
            className="p-2 text-indigo-300 hover:text-white rounded-xl hover:bg-indigo-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto my-4 space-y-2 pr-1">
          {records.length === 0 ? (
            <div className="py-12 text-center text-indigo-300 text-sm font-bold">
              No runs recorded yet. Complete a level to claim the top score!
            </div>
          ) : (
            records.map((rec, idx) => (
              <div
                key={rec.id}
                className="flex items-center justify-between bg-indigo-950/80 border border-indigo-500/40 rounded-2xl p-3.5 text-xs md:text-sm hover:border-pink-500/50 transition"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs ${
                      idx === 0
                        ? 'bg-yellow-400 text-indigo-950 shadow-[0_0_10px_rgba(250,204,21,0.6)]'
                        : idx === 1
                        ? 'bg-cyan-400 text-indigo-950'
                        : idx === 2
                        ? 'bg-pink-500 text-white'
                        : 'bg-indigo-900 text-indigo-300'
                    }`}
                  >
                    {idx + 1}
                  </span>
                  <div className="text-left">
                    <div className="font-black text-white flex items-center gap-2">
                      <span>Level {rec.level}</span>
                      <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/40">
                        {rec.mode}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-indigo-300 mt-0.5 font-semibold">
                      <span className="flex items-center gap-0.5 text-cyan-400 font-bold">
                        <Droplets className="w-3 h-3 fill-current" /> {rec.waterLeft}%
                      </span>
                      <span className="flex items-center gap-0.5 text-yellow-400 font-bold">
                        <Clock className="w-3 h-3" /> {rec.timeLeft}s
                      </span>
                      <span className="flex items-center gap-0.5 text-indigo-400">
                        <Calendar className="w-3 h-3" /> {rec.date}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Score & Stars */}
                <div className="text-right">
                  <div className="font-black text-base md:text-lg text-yellow-400 tabular-nums">
                    {rec.score}
                  </div>
                  <div className="flex items-center justify-end gap-0.5 text-yellow-400">
                    {Array.from({ length: rec.stars }).map((_, s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-current" />
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Close button */}
        <button
          id="leaderboard-back-btn"
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-widest shadow-[0_4px_0_#4338ca] transition cursor-pointer"
        >
          Back to Game
        </button>
      </div>
    </div>
  );
};
