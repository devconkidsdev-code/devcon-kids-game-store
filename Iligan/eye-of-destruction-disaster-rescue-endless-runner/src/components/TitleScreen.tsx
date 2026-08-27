import React from 'react';
import { Play, HelpCircle, Shield, BriefcaseMedical, Wrench, Sparkles, MapPin, Terminal } from 'lucide-react';

interface TitleScreenProps {
  onStartGame: () => void;
  onOpenHowToPlay: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenHowToPlay
}) => {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-4 bg-[#0c0c0e]/95 backdrop-blur-md animate-fade-in text-white select-none bg-grid-pattern">
      <div className="max-w-xl w-full text-center flex flex-col items-center">
        {/* Geometric Brand Emblem */}
        <div className="w-14 h-14 bg-orange-500 rounded flex items-center justify-center font-black text-3xl text-black mb-4 shadow-lg">
          E
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl font-black tracking-tighter text-white uppercase leading-none">
          EYE OF <span className="text-orange-500">DESTRUCTION</span>
        </h1>
        <p className="text-[11px] sm:text-xs text-white/50 font-mono tracking-widest uppercase mt-2">
          3D Disaster Rescue & City Restoration Runner
        </p>

        {/* Story Synopsis Box */}
        <div className="mt-5 p-4 rounded bg-[#151518] border border-white/10 text-xs font-mono text-white/70 leading-relaxed text-left space-y-2 max-w-lg shadow-2xl">
          <div className="flex items-center gap-2 text-[10px] text-orange-400 font-bold uppercase tracking-wider pb-1 border-b border-white/5">
            <Terminal className="w-3.5 h-3.5" />
            <span>Mission Briefing // Protocol: Rose-01</span>
          </div>
          <p>
            A catastrophic disaster has leveled the urban grid. Expressways are obstructed by hazardous debris, high-rises are compromised, and survivors are trapped in the rubble.
          </p>
          <p>
            Command <strong className="text-white">Rose</strong> in her high-performance mobile rescue unit: pilot the 3-lane transit routes, gather vital medical & structural cargo, reach perimeter checkpoints, and restore each sector to peace.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-3 gap-2 w-full max-w-lg my-4 text-[11px] font-mono">
          <div className="p-3 rounded bg-[#151518] border border-white/10 flex flex-col items-center text-center">
            <div className="w-7 h-7 rounded bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <strong className="text-white text-xs">3-LANE RUN</strong>
            <span className="text-white/40 text-[10px]">Jump, Slide & Dodge</span>
          </div>

          <div className="p-3 rounded bg-[#151518] border border-white/10 flex flex-col items-center text-center">
            <div className="w-7 h-7 rounded bg-green-400/10 border border-green-400/30 text-green-400 flex items-center justify-center mb-1.5">
              <BriefcaseMedical className="w-3.5 h-3.5" />
            </div>
            <strong className="text-white text-xs">TRIAGE</strong>
            <span className="text-white/40 text-[10px]">Heal All Survivors</span>
          </div>

          <div className="p-3 rounded bg-[#151518] border border-white/10 flex flex-col items-center text-center">
            <div className="w-7 h-7 rounded bg-sky-400/10 border border-sky-400/30 text-sky-400 flex items-center justify-center mb-1.5">
              <Wrench className="w-3.5 h-3.5" />
            </div>
            <strong className="text-white text-xs">REBUILD</strong>
            <span className="text-white/40 text-[10px]">Full Restoration</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-md">
          <button
            id="start-mission-btn"
            onClick={onStartGame}
            className="w-full sm:flex-1 py-3.5 px-6 rounded bg-orange-500 hover:bg-orange-400 text-black font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl transition active:scale-95 cursor-pointer font-mono"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Launch Mission</span>
          </button>

          <button
            id="how-to-play-title-btn"
            onClick={onOpenHowToPlay}
            className="w-full sm:w-auto py-3.5 px-5 rounded bg-[#151518] hover:bg-[#202026] border border-white/10 text-white/80 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer font-mono"
          >
            <HelpCircle className="w-4 h-4 text-white/60" />
            <span>Manual</span>
          </button>
        </div>
      </div>
    </div>
  );
};

