import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, Heart, Building2, RotateCcw, Compass } from 'lucide-react';
import { DisasterArea } from '../types';

interface VictoryModalProps {
  areas: DisasterArea[];
  totalScore: number;
  totalCoins: number;
  onExploreRestoredCity: () => void;
  onReplayCampaign: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  areas,
  totalScore,
  totalCoins,
  onExploreRestoredCity,
  onReplayCampaign
}) => {
  useEffect(() => {
    // Launch celebratory confetti bursts
    const duration = 3.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#38bdf8', '#4ade80', '#f97316', '#facc15']
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#38bdf8', '#4ade80', '#f97316', '#facc15']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  const totalResidentsSaved = areas.reduce((acc, a) => acc + a.residents.filter(r => r.isRescued).length, 0);
  const totalBuildingsRepaired = areas.reduce((acc, a) => acc + a.buildings.filter(b => b.isRepaired).length, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in font-sans">
      <div className="bg-[#151518] border border-green-400/40 rounded max-w-2xl w-full p-6 sm:p-10 shadow-2xl text-white text-center relative overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />

        <div className="relative z-10">
          {/* Trophy & Badge */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded bg-green-400 text-black shadow-xl shadow-green-500/20 mb-4 animate-bounce">
            <Trophy className="w-8 h-8 stroke-[2.5]" />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-green-400/10 border border-green-400/30 text-green-400 text-[10px] font-mono font-bold uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5" /> MISSION COMPLETE • CITY RESTORED
          </div>

          {/* Exact Prompt Headline */}
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white mb-3">
            CITY RESTORED
          </h1>

          {/* Exact Prompt Subtitles */}
          <div className="space-y-1 text-sm sm:text-base text-white/80 font-mono max-w-lg mx-auto mb-7">
            <p className="font-semibold text-white">All residents are safe.</p>
            <p className="font-semibold text-white">All buildings have been repaired.</p>
            <p className="text-green-400">The disaster area is finally at peace.</p>
          </div>

          {/* Accomplishment Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#0c0c0e] border border-white/10 rounded p-4 mb-7 font-mono">
            <div className="text-center p-2 rounded bg-[#151518] border border-white/5">
              <div className="text-[10px] uppercase font-bold text-white/40 flex items-center justify-center gap-1">
                <Heart className="w-3.5 h-3.5 text-green-400" /> SURVIVORS
              </div>
              <div className="text-lg font-black text-green-400 mt-1">
                {totalResidentsSaved} / {totalResidentsSaved}
              </div>
            </div>

            <div className="text-center p-2 rounded bg-[#151518] border border-white/5">
              <div className="text-[10px] uppercase font-bold text-white/40 flex items-center justify-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-sky-400" /> REPAIRED
              </div>
              <div className="text-lg font-black text-sky-400 mt-1">
                {totalBuildingsRepaired} / {totalBuildingsRepaired}
              </div>
            </div>

            <div className="text-center p-2 rounded bg-[#151518] border border-white/5">
              <div className="text-[10px] uppercase font-bold text-white/40">
                SECTORS
              </div>
              <div className="text-lg font-black text-white mt-1">
                {areas.length} / {areas.length}
              </div>
            </div>

            <div className="text-center p-2 rounded bg-[#151518] border border-white/5">
              <div className="text-[10px] uppercase font-bold text-white/40">
                BADGES
              </div>
              <div className="text-lg font-black text-orange-400 mt-1">
                {totalCoins}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 font-mono">
            <button
              id="victory-explore-city-btn"
              onClick={onExploreRestoredCity}
              className="w-full sm:w-auto px-6 py-3 rounded bg-green-400 hover:bg-green-300 text-black font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl active:scale-95 transition cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Restored City</span>
            </button>

            <button
              id="victory-replay-campaign-btn"
              onClick={onReplayCampaign}
              className="w-full sm:w-auto px-6 py-3 rounded bg-[#1c1c21] hover:bg-[#25252b] text-white/80 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-white/10 active:scale-95 transition cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Replay Previous Areas</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

