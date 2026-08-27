import React, { useState } from 'react';
import { Play, HelpCircle, Droplets, ShieldCheck, Heart, Skull, Flame, Sparkles, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { WaterHeroAvatar } from './WaterHeroAvatar';
import { LevelConfig } from '../types';

interface Props {
  levels: LevelConfig[];
  onStartGame: (levelId?: number) => void;
  onOpenHowToPlay: () => void;
}

export const StartScreen: React.FC<Props> = ({
  levels,
  onStartGame,
  onOpenHowToPlay,
}) => {
  const [activeZone, setActiveZone] = useState<number>(1);
  const [jumpLevelInput, setJumpLevelInput] = useState<string>('');

  const zones = [
    { id: 1, name: 'The Oasis', range: [1, 20], color: 'from-sky-500 to-blue-600', icon: '🌴' },
    { id: 2, name: 'Dry Arroyos', range: [21, 40], color: 'from-amber-500 to-orange-600', icon: '🏜️' },
    { id: 3, name: 'Toxic Sludge', range: [41, 60], color: 'from-emerald-500 to-teal-700', icon: '☣️' },
    { id: 4, name: 'Sandstone Canyon', range: [61, 80], color: 'from-rose-500 to-red-700', icon: '🧗' },
    { id: 5, name: 'Oasis Sanctuary', range: [81, 100], color: 'from-cyan-500 to-indigo-600', icon: '🏛️' },
  ];

  const zoneLevels = levels.filter(
    (lvl) => lvl.id >= zones[activeZone - 1].range[0] && lvl.id <= zones[activeZone - 1].range[1]
  );

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(jumpLevelInput, 10);
    if (!isNaN(num) && num >= 1 && num <= 100) {
      onStartGame(num);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 flex flex-col items-center justify-center text-center select-none" id="start-screen">
      
      {/* Cartoon Title & Mascot */}
      <div className="relative mb-5">
        <div className="flex justify-center mb-2 animate-float">
          <WaterHeroAvatar size={110} mood="happy" />
        </div>

        <div className="inline-flex items-center gap-1.5 bg-blue-600 text-white rounded-full px-4 py-1 text-xs font-black uppercase tracking-widest mb-2 shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>100 Levels • Dynamic Twists • Save Every Drop</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-black text-blue-600 font-heading tracking-tight drop-shadow-[0_4px_0_rgba(29,78,216,0.25)]">
          WATER HERO
        </h1>
        <p className="text-2xl sm:text-3xl font-black text-amber-500 font-heading mt-0.5 drop-shadow-sm">
          SAVE EVERY DROP
        </p>
      </div>

      {/* Story Card */}
      <div className="w-full max-w-3xl bg-white border-4 border-blue-600 rounded-3xl p-4 sm:p-6 shadow-lg mb-6 text-left">
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-2xl bg-blue-600 border-b-4 border-blue-800 text-white shrink-0 mt-1 shadow-md">
            <Droplets className="w-6 h-6 fill-white" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-blue-900 font-heading uppercase tracking-wide">
              The Village Water Reservoir Mission
            </h3>
            <p className="text-xs sm:text-sm font-bold text-slate-700 leading-relaxed mt-1">
              Water scarcity threatens the community! As the <strong className="text-blue-600">Water Hero</strong> holding a reusable plastic bottle, journey through spacious open maze pathways across <strong>100 unique levels</strong>. Collect clean water drops to fill your bottle, dodge slithering snakes, avoid drought patches, and safely deliver water to high the <strong className="text-emerald-600">Community Water Tank Reservation</strong>!
            </p>
          </div>
        </div>

        {/* Quick legend pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-3 border-t-2 border-blue-100 text-xs">
          <div className="flex items-center gap-2 bg-sky-100 p-2 rounded-xl border-2 border-sky-300 text-sky-900 font-black">
            <span className="text-lg">💧</span>
            <span>+1 Water in Bottle</span>
          </div>
          <div className="flex items-center gap-2 bg-rose-100 p-2 rounded-xl border-2 border-rose-300 text-rose-900 font-black">
            <span className="text-lg">❤️</span>
            <span>+1 Extra Life</span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-100 p-2 rounded-xl border-2 border-emerald-300 text-emerald-900 font-black">
            <span className="text-lg">🐍</span>
            <span>-1 Life (Snake)</span>
          </div>
          <div className="flex items-center gap-2 bg-amber-100 p-2 rounded-xl border-2 border-amber-300 text-amber-900 font-black">
            <span className="text-lg">🏛️</span>
            <span>Raise Reservation</span>
          </div>
        </div>
      </div>

      {/* Main Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-lg justify-center mb-6">
        <button
          id="btn-start-adventure"
          onClick={() => onStartGame(1)}
          className="w-full sm:w-auto flex-1 flex items-center justify-center gap-3 px-8 py-4 bg-green-500 hover:bg-green-400 text-white text-xl font-black rounded-2xl border-b-6 border-green-700 shadow-xl active:translate-y-0.5 active:border-b-2 transition-all cursor-pointer"
        >
          <Play className="w-6 h-6 fill-white" />
          <span>START LEVEL 1</span>
        </button>

        <button
          id="btn-open-guide"
          onClick={onOpenHowToPlay}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 hover:bg-blue-500 text-white text-base font-black rounded-2xl border-b-6 border-blue-800 shadow-xl active:translate-y-0.5 active:border-b-2 transition-all cursor-pointer"
        >
          <HelpCircle className="w-5 h-5 text-cyan-200" />
          <span>HOW TO PLAY</span>
        </button>
      </div>

      {/* 100 Levels Selection Hub */}
      <div className="w-full max-w-3xl bg-white rounded-3xl p-4 sm:p-5 border-4 border-blue-600 shadow-md">
        
        {/* Header & Quick Jump Form */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mb-4 pb-3 border-b-2 border-blue-100">
          <div className="flex items-center gap-2 text-left">
            <Zap className="w-5 h-5 text-amber-500" />
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-blue-900">
                LEVEL SELECTOR (1 - 100)
              </h4>
              <p className="text-[11px] font-bold text-slate-500">
                Pick a zone or jump straight to any level
              </p>
            </div>
          </div>

          {/* Quick Jump Input */}
          <form onSubmit={handleJump} className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="100"
              placeholder="Level # (1-100)"
              value={jumpLevelInput}
              onChange={(e) => setJumpLevelInput(e.target.value)}
              className="w-32 px-3 py-1.5 text-xs font-black bg-blue-50 border-2 border-blue-300 rounded-xl focus:outline-none focus:border-blue-600 text-blue-950 placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="px-3 py-1.5 text-xs font-black bg-blue-600 hover:bg-blue-500 text-white rounded-xl border-b-2 border-blue-800 active:translate-y-0.5 cursor-pointer"
            >
              Jump
            </button>
          </form>
        </div>

        {/* Zone Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-3 scrollbar-none">
          {zones.map((z) => (
            <button
              key={z.id}
              onClick={() => setActiveZone(z.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shrink-0 transition-all cursor-pointer ${
                activeZone === z.id
                  ? 'bg-blue-600 text-white shadow-md border-b-3 border-blue-900'
                  : 'bg-slate-100 hover:bg-blue-50 text-slate-700 border border-slate-200'
              }`}
            >
              <span>{z.icon}</span>
              <span>{z.name}</span>
              <span className="text-[10px] opacity-75">({z.range[0]}-{z.range[1]})</span>
            </button>
          ))}
        </div>

        {/* 20-Level Grid for Active Zone */}
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 gap-2">
          {zoneLevels.map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => onStartGame(lvl.id)}
              title={`${lvl.subtitle} • Twist: ${lvl.twistBadge || 'Standard'} • Water: ${lvl.requiredWater}`}
              className="p-2 bg-yellow-50 hover:bg-blue-100 hover:border-blue-600 border-2 border-blue-300 rounded-xl flex flex-col items-center gap-0.5 group shadow-xs active:translate-y-0.5 transition-all cursor-pointer"
            >
              <span className="w-6 h-6 rounded-lg bg-blue-600 text-white text-[11px] font-black flex items-center justify-center group-hover:bg-green-500 shadow-xs transition-colors">
                {lvl.id}
              </span>
              <span className="text-[9px] font-black text-blue-900 truncate w-full">
                💧 {lvl.requiredWater}
              </span>
              <span className="text-[8px] font-bold text-amber-700 truncate w-full">
                {lvl.twistBadge?.split(' ')[0] || '💧'}
              </span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

