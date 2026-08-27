import React from 'react';
import { Play, Wind, Trophy, Info, Waves, Clock, Keyboard, ShieldAlert } from 'lucide-react';
import { Difficulty, HighScoreRecord } from '../types';
import { LEVEL_CONFIGS } from '../game/levels';

interface MainMenuProps {
  difficulty: Difficulty;
  onSelectDifficulty: (diff: Difficulty) => void;
  onStartGame: () => void;
  onOpenGuide: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  difficulty,
  onSelectDifficulty,
  onStartGame,
  onOpenGuide,
}) => {
  const levels: Difficulty[] = ['SIGNAL_1', 'SIGNAL_2', 'SIGNAL_3'];
  const currentConfig = LEVEL_CONFIGS[difficulty];

  // Load high scores
  let highScores: HighScoreRecord[] = [];
  try {
    highScores = JSON.parse(localStorage.getItem('bagyo_high_scores') || '[]');
  } catch {
    // Safe catch
  }

  return (
    <div id="main-menu" className="relative w-full min-h-screen bg-[#0f172a] text-white flex flex-col items-center justify-between p-4 sm:p-6 md:p-8 overflow-y-auto font-sans select-none">
      {/* Immersive UI Dot Grid Background Pattern */}
      <div className="absolute inset-0 bg-dot-grid opacity-20 pointer-events-none" />
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-red-600/10 via-cyan-950/20 to-transparent blur-3xl pointer-events-none" />

      {/* Top Header - Immersive UI Style */}
      <header className="relative z-10 w-full max-w-5xl h-16 sm:h-20 flex items-center justify-between px-4 sm:px-8 bg-slate-900/80 border border-slate-700/80 rounded-2xl backdrop-blur-md shadow-2xl">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-600 rounded flex items-center justify-center shadow-[0_0_15px_rgba(220,38,38,0.5)] shrink-0">
            <div className="w-4 h-4 sm:w-6 sm:h-6 border-2 border-white rounded-sm"></div>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tighter uppercase italic text-red-500 leading-none">
              BAGYO
            </h1>
            <span className="text-[9px] sm:text-[10px] font-bold tracking-widest text-slate-400 uppercase">
              EMERGENCY FLOOD PROTOCOL
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-6">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400">Current Hero</span>
            <span className="text-sm font-bold text-slate-100 tracking-wider">DEXTER</span>
          </div>

          <button
            onClick={onOpenGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-600 hover:bg-slate-700 text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors shadow-lg cursor-pointer"
          >
            <Info className="w-4 h-4" />
            <span className="hidden xs:inline">Survival Guide</span>
          </button>
        </div>
      </header>

      {/* Hero / Game Banner */}
      <main className="relative z-10 w-full max-w-5xl my-auto py-6 sm:py-8 flex flex-col items-center text-center">
        {/* Subtitle Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider mb-3">
          <Waves className="w-3.5 h-3.5" /> 60-Second Evacuation Platformer
        </div>

        <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter uppercase italic text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
          BAGYO
        </h1>
        
        <p className="text-sm sm:text-base text-slate-300 font-medium max-w-2xl mt-2 leading-relaxed">
          The tropical superstorm has triggered catastrophic flash flooding! Guide survivor <strong className="text-amber-400">Dexter</strong> across submerged rooftops, gather essential Go-Bag supplies, and reach the <strong className="text-orange-400">Rescue Boat</strong> before the <strong className="text-red-400">1-minute timer</strong> expires!
        </p>

        {/* Hero Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full max-w-4xl my-6 sm:my-8 text-left">
          {/* Card 1: Hero Dexter */}
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-2xl backdrop-blur-sm">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Hero Survivor</span>
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  DEXTER
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Equipped with waterproof rainboots &amp; backpack. Gather supplies across rooftops to boost swimming speed, stamina, and breath.
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-amber-400 font-semibold flex items-center gap-1.5">
              <span>🦺 Life Vest doubles swim speed &amp; air</span>
            </div>
          </div>

          {/* Card 2: 1-Minute Goal */}
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-2xl backdrop-blur-sm">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Mission Goal</span>
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/40 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> 60s LIMIT
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Flood surge rises relentlessly from ground level. Reach the Coast Guard rescue vessel stationed at the apex before 60 seconds!
              </p>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-800 text-[11px] text-red-400 font-semibold flex items-center gap-1.5">
              <span>🌊 Stay above water or surface for air</span>
            </div>
          </div>

          {/* Card 3: WASD Controls */}
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-2xl backdrop-blur-sm">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Controls</span>
                <span className="text-xs font-black px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-500/40 flex items-center gap-1">
                  <Keyboard className="w-3 h-3" /> WASD KEYS
                </span>
              </div>
              <div className="text-xs text-slate-300 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-amber-400 font-bold bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">W / Space</span>
                  <span className="text-[11px] text-slate-400">Jump / Climb / Swim Up</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-amber-400 font-bold bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">A / D</span>
                  <span className="text-[11px] text-slate-400">Move Left / Right</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-amber-400 font-bold bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">S</span>
                  <span className="text-[11px] text-slate-400">Climb Down / Dive</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-emerald-400 font-bold bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">Shift</span>
                  <span className="text-[11px] text-slate-400">Sprint / Turbo Swim</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Typhoon Signal Alert (Difficulty) Selector */}
        <div className="w-full max-w-4xl bg-slate-900/90 border border-slate-700/80 rounded-3xl p-5 sm:p-6 shadow-2xl mb-6 sm:mb-8 text-left backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
                <Wind className="w-4 h-4 text-sky-400" /> Select Typhoon Alert Signal (Difficulty)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Higher signals feature accelerating flood rise speed, gale-force winds, and challenging obstacle layouts.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {levels.map((lvlId) => {
              const cfg = LEVEL_CONFIGS[lvlId];
              const isSelected = difficulty === lvlId;
              return (
                <button
                  key={lvlId}
                  onClick={() => onSelectDifficulty(lvlId)}
                  className={`p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-slate-800/90 border-red-500 shadow-[0_0_25px_rgba(220,38,38,0.3)] ring-2 ring-red-500/30'
                      : 'bg-slate-950/70 border-slate-800 hover:border-slate-600 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                      lvlId === 'SIGNAL_3' ? 'bg-red-950 text-red-400 border border-red-800' :
                      lvlId === 'SIGNAL_2' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                      'bg-yellow-950 text-yellow-400 border border-yellow-800'
                    }`}>
                      {cfg.signalName.split('(')[1]?.replace(')', '') || 'Signal'}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{cfg.windSpeedMph} MPH</span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-100 mb-1">{cfg.name}</h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {cfg.description}
                  </p>

                  <div className="mt-3.5 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{cfg.supplies.length} Supplies</span>
                    <span className="text-cyan-400 font-semibold font-mono">Rise: {cfg.waterRiseSpeed} px/s</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Start Game Button */}
        <div className="flex flex-col items-center gap-3">
          <button
            id="start-game-button"
            onClick={onStartGame}
            className="py-4 px-10 sm:px-14 rounded-2xl bg-gradient-to-r from-red-600 via-amber-500 to-orange-500 hover:from-red-500 hover:to-orange-400 text-white font-black text-lg sm:text-xl flex items-center justify-center gap-3 transition-all cursor-pointer shadow-[0_0_35px_rgba(220,38,38,0.4)] active:scale-95 border border-red-400/40"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>START FLOOD ESCAPE ({currentConfig.name})</span>
          </button>
        </div>

        {/* Leaderboard preview if exists */}
        {highScores.length > 0 && (
          <div className="mt-6 flex items-center gap-2 text-xs text-slate-400 bg-slate-900/60 px-4 py-2 rounded-full border border-slate-800">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>Best Escape Score: <strong className="text-yellow-400 font-mono">{highScores[0].score} pts</strong> ({highScores[0].difficulty})</span>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-5xl text-center py-3 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between border-t border-slate-800/80 gap-2">
        <span className="font-mono text-slate-400">BAGYO • Flood Escape Survival System</span>
        <span>Guide Dexter to the Coast Guard Rescue Boat within 60 seconds</span>
      </footer>
    </div>
  );
};
