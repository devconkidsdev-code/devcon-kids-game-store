import React, { useState } from 'react';
import { Difficulty, GameMode } from '../types';
import { Play, Flame, Trophy, HelpCircle, Volume2, Sparkles, Shield, Droplets } from 'lucide-react';
import { soundSynth } from '../audio/SoundSynth';

interface StartScreenProps {
  onStartCampaign: (difficulty: Difficulty) => void;
  onStartEndless: (difficulty: Difficulty) => void;
  onOpenLeaderboard: () => void;
  onOpenHelp: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  onStartCampaign,
  onStartEndless,
  onOpenLeaderboard,
  onOpenHelp
}) => {
  const [difficulty, setDifficulty] = useState<Difficulty>('NORMAL');

  const handleStartCampaign = () => {
    soundSynth.init();
    soundSynth.playWaterCrop(false);
    onStartCampaign(difficulty);
  };

  const handleStartEndless = () => {
    soundSynth.init();
    soundSynth.playPowerup();
    onStartEndless(difficulty);
  };

  return (
    <div className="absolute inset-0 z-40 bg-indigo-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      {/* Ambient background vibrant blurs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl -ml-20 -mt-20" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl -mr-20 -mb-20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md bg-indigo-900/60 border-2 border-indigo-400/30 rounded-3xl p-6 md:p-8 shadow-[0_0_50px_rgba(236,72,153,0.2)] text-center z-10 flex flex-col items-center">
        {/* Animated Title Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-400 text-indigo-950 text-xs font-black uppercase tracking-wider mb-4 shadow-[0_0_15px_rgba(250,204,21,0.5)]">
          <Droplets className="w-4 h-4 fill-current animate-bounce" />
          <span>Vibrant Arcade Labyrinth</span>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-yellow-300 to-cyan-300 mb-1 drop-shadow-md">
          MAZE RUNNER
        </h1>
        <div className="text-xl md:text-2xl font-black italic text-cyan-300 tracking-wider mb-4 flex items-center justify-center gap-2">
          <span>THE THIRST</span>
          <span className="text-xs bg-pink-500 text-white font-black uppercase px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(236,72,153,0.6)]">
            HYPER JUICE
          </span>
        </div>

        <p className="text-sm text-indigo-100/90 mb-6 leading-relaxed">
          Navigate dark cardboard corridors with your high-beam torch. Keep your water bucket balanced, dodge hazards, and revive wilting crops before the clock runs out!
        </p>

        {/* Difficulty Selector */}
        <div className="w-full mb-6">
          <div className="text-xs font-black uppercase tracking-widest text-indigo-300 mb-2">
            Select Difficulty
          </div>
          <div className="grid grid-cols-3 gap-2 bg-indigo-950/80 p-2 rounded-2xl border border-indigo-500/50">
            {(['RELAXED', 'NORMAL', 'NIGHTMARE'] as Difficulty[]).map(diff => (
              <button
                key={diff}
                id={`diff-${diff.toLowerCase()}-btn`}
                onClick={() => {
                  soundSynth.playFootstep(false);
                  setDifficulty(diff);
                }}
                className={`py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                  difficulty === diff
                    ? diff === 'NIGHTMARE'
                      ? 'bg-pink-500 text-white shadow-[0_4px_0_#be185d] scale-102'
                      : diff === 'RELAXED'
                      ? 'bg-yellow-400 text-indigo-950 shadow-[0_4px_0_#ca8a04] scale-102'
                      : 'bg-cyan-500 text-indigo-950 shadow-[0_4px_0_#0891b2] scale-102'
                    : 'text-indigo-300 hover:text-white hover:bg-indigo-800/60'
                }`}
              >
                {diff === 'RELAXED' && '🌱 Relaxed'}
                {diff === 'NORMAL' && '🏃 Normal'}
                {diff === 'NIGHTMARE' && '🔥 Hard'}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Action Buttons with Vibrant 3D Arcade Styles */}
        <div className="w-full flex flex-col gap-3.5 mb-6">
          <button
            id="start-campaign-btn"
            onClick={handleStartCampaign}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-pink-500 to-indigo-600 hover:from-pink-400 hover:to-indigo-500 text-white font-black text-base md:text-lg uppercase tracking-wider flex items-center justify-center gap-3 shadow-[0_10px_20px_rgba(236,72,153,0.35)] border-b-4 border-indigo-900 active:translate-y-1 active:border-b-0 transition cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>PLAY CAMPAIGN (5 LEVELS)</span>
          </button>

          <button
            id="start-endless-btn"
            onClick={handleStartEndless}
            className="w-full py-3.5 px-6 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-indigo-950 font-black text-sm md:text-base uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_6px_0_#0891b2] active:translate-y-1 active:shadow-[0_2px_0_#0891b2] transition cursor-pointer"
          >
            <Flame className="w-4 h-4 fill-current text-indigo-950" />
            <span>ENDLESS SURVIVAL LABYRINTH</span>
          </button>
        </div>

        {/* Secondary Modals Trigger */}
        <div className="flex items-center justify-center gap-6 w-full border-t border-indigo-800/80 pt-4">
          <button
            id="open-leaderboard-btn"
            onClick={onOpenLeaderboard}
            className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-yellow-400 hover:text-yellow-300 transition cursor-pointer"
          >
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>High Scores</span>
          </button>

          <button
            id="open-help-btn"
            onClick={onOpenHelp}
            className="flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span>How to Play</span>
          </button>
        </div>
      </div>
    </div>
  );
};
