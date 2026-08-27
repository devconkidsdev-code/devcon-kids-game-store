import React from 'react';
import { GameMode } from '../types';
import { Sparkles, Flame, Droplets, Volume2, VolumeX, BarChart3, HelpCircle } from 'lucide-react';
import { sound } from '../utils/sound';

interface NavbarProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenStats: () => void;
  onOpenHelp: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onSelectMode,
  isMuted,
  onToggleMute,
  onOpenStats,
  onOpenHelp,
}) => {
  return (
    <header className="w-full bg-amber-100/95 backdrop-blur-md border-b-4 border-amber-300 shadow-sm sticky top-0 z-30 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center -space-x-2">
            <div className="w-9 h-9 rounded-2xl bg-sky-500 border-2 border-sky-600 flex items-center justify-center text-lg shadow-[2px_2px_0px_0px_#0284c7]">
              💎
            </div>
            <div className="w-9 h-9 rounded-2xl bg-orange-500 border-2 border-orange-600 flex items-center justify-center text-lg shadow-[2px_2px_0px_0px_#c2410c]">
              💣
            </div>
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 flex items-center gap-1.5 font-display">
              <span className="text-slate-900">SCATTER</span>
              <span className="text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-lg border border-orange-300">FIRE</span>
              <span className="text-amber-700 font-bold">&</span>
              <span className="text-sky-600 bg-sky-100 px-1.5 py-0.5 rounded-lg border border-sky-300">WATER</span>
            </h1>
            <p className="text-[11px] font-bold text-amber-900/70 hidden sm:block">
              Bomb = Fire 🔥 · Diamond = Water 💧
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <nav className="flex items-center bg-amber-200/90 p-1.5 rounded-2xl border-2 border-amber-300 shadow-[2px_2px_0px_0px_#fde68a]">
          <button
            id="tab-mode-blitz"
            onClick={() => {
              sound.playClick();
              onSelectMode('blitz');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              currentMode === 'blitz'
                ? 'bg-orange-500 text-white shadow-[2px_2px_0px_0px_#c2410c] border border-orange-600'
                : 'text-amber-950 hover:bg-amber-100/70'
            }`}
          >
            <span>⚔️</span>
            <span className="hidden xs:inline">Scatter Blitz</span>
          </button>

          <button
            id="tab-mode-cascade"
            onClick={() => {
              sound.playClick();
              onSelectMode('cascade');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              currentMode === 'cascade'
                ? 'bg-sky-500 text-white shadow-[2px_2px_0px_0px_#0284c7] border border-sky-600'
                : 'text-amber-950 hover:bg-amber-100/70'
            }`}
          >
            <span>🎰</span>
            <span className="hidden xs:inline">Cascade Grid</span>
          </button>

          <button
            id="tab-mode-mines"
            onClick={() => {
              sound.playClick();
              onSelectMode('mines');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
              currentMode === 'mines'
                ? 'bg-red-500 text-white shadow-[2px_2px_0px_0px_#b91c1c] border border-red-600'
                : 'text-amber-950 hover:bg-amber-100/70'
            }`}
          >
            <span>💣</span>
            <span className="hidden xs:inline">Mines Scatter</span>
          </button>
        </nav>

        {/* Actions: Sound, Stats, Help */}
        <div className="flex items-center gap-2">
          <button
            id="btn-toggle-sound"
            onClick={() => {
              onToggleMute();
              sound.playClick();
            }}
            aria-label="Toggle Sound"
            className="w-9 h-9 rounded-xl bg-white hover:bg-amber-100 border-2 border-amber-300 text-slate-800 flex items-center justify-center transition-transform active:scale-95 shadow-[2px_2px_0px_0px_#fde68a] cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-sky-600" />}
          </button>

          <button
            id="btn-open-stats"
            onClick={() => {
              sound.playClick();
              onOpenStats();
            }}
            aria-label="Open Statistics"
            className="w-9 h-9 rounded-xl bg-white hover:bg-amber-100 border-2 border-amber-300 text-amber-900 flex items-center justify-center transition-transform active:scale-95 shadow-[2px_2px_0px_0px_#fde68a] cursor-pointer"
          >
            <BarChart3 className="w-4 h-4" />
          </button>

          <button
            id="btn-open-help"
            onClick={() => {
              sound.playClick();
              onOpenHelp();
            }}
            aria-label="Open Game Guide"
            className="w-9 h-9 rounded-xl bg-white hover:bg-amber-100 border-2 border-amber-300 text-amber-900 flex items-center justify-center transition-transform active:scale-95 shadow-[2px_2px_0px_0px_#fde68a] cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
