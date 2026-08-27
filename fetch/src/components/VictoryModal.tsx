import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Droplets, Clock, Award, Star } from 'lucide-react';
import { LevelResult } from '../types';

interface VictoryModalProps {
  results: LevelResult[];
  onPlayAgain: () => void;
  onMenu: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  results,
  onPlayAgain,
  onMenu,
}) => {
  useEffect(() => {
    // Grand celebration confetti blast
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#38bdf8', '#22c55e', '#f59e0b'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#38bdf8', '#22c55e', '#f59e0b'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const totalScore = results.reduce((acc, r) => acc + r.score, 0);
  const totalWater = results.reduce((acc, r) => acc + r.waterRemaining, 0);
  const avgWater = Math.round(totalWater / (results.length || 1));
  const totalTime = results.reduce((acc, r) => acc + r.timeTaken, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm select-none overflow-y-auto">
      <div className="w-full max-w-lg bg-white border border-[#E2E8F0] rounded-3xl p-6 sm:p-8 shadow-2xl text-center flex flex-col items-center my-auto text-[#2D3748]">
        {/* Trophy Badge */}
        <div className="w-20 h-20 rounded-3xl bg-[#FDFBF7] border border-[#E2E8F0] flex items-center justify-center mb-4 text-amber-500 shadow-xs">
          <Trophy className="w-10 h-10 animate-bounce" />
        </div>

        {/* Title */}
        <h2 className="font-display font-black text-3xl sm:text-4xl text-[#2F4F4F] mb-1">
          Mountain Conquered!
        </h2>
        <p className="text-[#708090] text-sm mb-6">
          You successfully carried the water across all 3 mountain summits!
        </p>

        {/* Grand Score Display */}
        <div className="w-full bg-[#FDFBF7] border border-[#E2E8F0] rounded-2xl p-5 mb-6 shadow-xs">
          <span className="text-xs font-bold text-[#708090] uppercase tracking-widest block mb-1">
            Total Expedition Score
          </span>
          <div className="font-display font-black text-5xl text-[#2F4F4F] mb-3">
            {totalScore}
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#E2E8F0] text-xs">
            <div>
              <span className="text-[#708090] block text-[10px] uppercase font-bold">Avg Water</span>
              <span className="font-mono-num font-bold text-[#00BFFF] text-sm">{avgWater}%</span>
            </div>
            <div>
              <span className="text-[#708090] block text-[10px] uppercase font-bold">Total Time</span>
              <span className="font-mono-num font-bold text-[#2D3748] text-sm">{totalTime.toFixed(1)}s</span>
            </div>
            <div>
              <span className="text-[#708090] block text-[10px] uppercase font-bold">Mastery</span>
              <span className="font-bold text-emerald-600 text-sm flex items-center justify-center gap-0.5">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>Rank S</span>
              </span>
            </div>
          </div>
        </div>

        {/* Level Breakdown List */}
        <div className="w-full space-y-2 mb-6 text-left">
          <span className="text-[11px] font-bold text-[#708090] uppercase tracking-wider block px-1">
            Summits Completed
          </span>
          {results.map((res) => (
            <div
              key={res.levelId}
              className="bg-[#FDFBF7] border border-[#E2E8F0] rounded-xl p-3 flex items-center justify-between"
            >
              <div>
                <span className="font-bold text-xs text-[#2F4F4F] block">
                  Level {res.levelId}
                </span>
                <span className="text-sm font-bold text-[#2D3748]">
                  {res.levelName.replace(/Level \d+ — /, '')}
                </span>
              </div>
              <div className="flex items-center gap-4 text-right">
                <div>
                  <span className="text-xs text-[#00BFFF] font-mono-num font-bold block">
                    {res.waterRemaining}% 💧
                  </span>
                  <span className="text-[11px] text-[#708090] font-mono-num">
                    {res.timeTaken.toFixed(1)}s
                  </span>
                </div>
                <div className="bg-white border border-[#E2E8F0] px-2.5 py-1 rounded-lg">
                  <span className="font-mono-num font-bold text-emerald-600 text-sm">
                    {res.score}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            id="victory-play-again-btn"
            onClick={onPlayAgain}
            className="w-full py-4 px-6 rounded-xl bg-[#2F4F4F] hover:bg-[#233D3D] text-white font-bold text-base flex items-center justify-center gap-2 shadow-md active:scale-98 transition-all cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            <span>PLAY AGAIN</span>
          </button>

          <button
            id="victory-menu-btn"
            onClick={onMenu}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#F1F3F0] border border-[#E2E8F0] text-[#2D3748] font-bold text-xs transition-colors cursor-pointer"
          >
            <span>Back to Title Screen</span>
          </button>
        </div>
      </div>
    </div>
  );
};
