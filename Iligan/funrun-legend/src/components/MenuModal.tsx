import React from 'react';
import { Play, List, Trophy, HelpCircle, Zap, Shield, Sparkles, Infinity as InfinityIcon } from 'lucide-react';
import { LevelConfig, CharacterConfig } from '../types';

interface MenuModalProps {
  currentLevel: LevelConfig;
  character: CharacterConfig;
  onStartGame: () => void;
  onStartInfinite: () => void;
  onOpenLevelSelect: () => void;
  onOpenLeaderboard: () => void;
  onOpenHowToPlay: () => void;
  onOpenCustomize: () => void;
}

export const MenuModal: React.FC<MenuModalProps> = ({
  currentLevel,
  character,
  onStartGame,
  onStartInfinite,
  onOpenLevelSelect,
  onOpenLeaderboard,
  onOpenHowToPlay,
  onOpenCustomize,
}) => {
  const isGirl = character.gender === 'girl';
  const isInfinite = !!currentLevel.isInfinite;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#050805]/95 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center shadow-[0_0_50px_rgba(16,185,129,0.2)] relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Background glow & watermark */}
        <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 100%, #10b981 0%, transparent 70%)' }} />
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[350px] h-[200px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
        <div className="text-[100px] font-black leading-none tracking-tighter text-white/5 absolute -bottom-6 -right-6 pointer-events-none select-none">
          LeGEND
        </div>

        {/* Hero Eyebrow Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/50 backdrop-blur-md rounded-full shadow-[0_0_20px_rgba(16,185,129,0.2)] mb-3">
          <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
          <span className="text-[10px] uppercase tracking-[0.3em] text-emerald-400 font-bold">
            {isGirl ? 'Province Windrunner' : 'Province Speedster'} {character.name}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl font-black tracking-tighter italic text-white drop-shadow-[0_0_25px_rgba(16,185,129,0.3)]">
          Funrun <span className="text-emerald-400">LeGEND</span>
        </h1>
        <p className="text-emerald-100/70 text-xs sm:text-sm mt-2 max-w-md mx-auto leading-relaxed">
          Sprint as {character.name}, the fastest runner in the province! Dodge rolling rocks and tumbling tree trunks, beat the countdown timer, or test your limits in Endless Infinite Mode!
        </p>

        {/* Customized Character & Active Stage Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-4 text-left">
          {/* Character Quick Info & Customize Button */}
          <div className="flex items-center justify-between bg-black/60 border border-emerald-500/30 rounded-2xl p-3 shadow-inner">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{isGirl ? '👧' : '👦'}</span>
              <div>
                <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block">
                  Runner ({isGirl ? 'Girl' : 'Boy'})
                </span>
                <span className="text-xs font-black text-white">{character.name}</span>
              </div>
            </div>
            <button
              onClick={onOpenCustomize}
              className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/50 rounded-lg text-[10px] font-black text-emerald-300 uppercase tracking-wider transition-all cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.2)]"
            >
              Customize
            </button>
          </div>

          {/* Selected Stage */}
          <div className="flex items-center justify-between bg-black/60 border border-emerald-500/30 rounded-2xl p-3 shadow-inner">
            <div>
              <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider block">
                Active Course
              </span>
              <span className="text-xs font-black text-white truncate max-w-[120px] block">
                {currentLevel.name}
              </span>
            </div>
            <button
              onClick={onOpenLevelSelect}
              className="px-2.5 py-1 bg-black/40 hover:bg-emerald-950/40 border border-zinc-700 rounded-lg text-[10px] font-bold text-zinc-300 uppercase tracking-wider transition-all cursor-pointer"
            >
              Stages
            </button>
          </div>
        </div>

        {/* Mechanics Summary Card */}
        <div className="grid grid-cols-3 gap-2 mb-4 bg-black/60 border border-emerald-500/25 rounded-2xl p-2.5 shadow-inner">
          <div className="flex flex-col items-center">
            <Shield className="w-4 h-4 text-emerald-400 mb-0.5 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Goal</span>
            <span className="text-[9px] text-emerald-400/80">Safe Zone Area</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-3.5 h-3.5 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] rotate-45 mb-1.5 mt-0.5 border border-red-300" />
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Vitality</span>
            <span className="text-[9px] text-red-400/80">3 Life Diamonds</span>
          </div>
          <div className="flex flex-col items-center">
            <Zap className="w-4 h-4 text-emerald-400 mb-0.5 drop-shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            <span className="text-[10px] font-bold text-white uppercase tracking-wider">Sprint</span>
            <span className="text-[9px] text-emerald-400/80">Top Speed Boost</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={onStartGame}
            className="flex items-center justify-center gap-2 w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black italic tracking-widest text-base sm:text-lg uppercase rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all active:scale-[0.98] cursor-pointer"
          >
            <Play className="w-5 h-5 fill-black" />
            START SPRINT ({isInfinite ? 'INFINITE' : 'STAGE'})
          </button>

          {!isInfinite && (
            <button
              onClick={onStartInfinite}
              className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 hover:from-teal-500 hover:to-emerald-400 text-white font-black italic tracking-widest text-sm uppercase rounded-2xl border border-teal-400/50 shadow-[0_0_20px_rgba(45,212,191,0.35)] transition-all active:scale-[0.98] cursor-pointer"
            >
              <InfinityIcon className="w-4 h-4 stroke-[3]" />
              PLAY INFINITE ODYSSEY MODE (ESCALATING SPEED)
            </button>
          )}

          <div className="grid grid-cols-4 gap-2">
            <button
              onClick={onOpenCustomize}
              className="flex items-center justify-center gap-1 py-2 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold rounded-xl transition-all active:scale-95 cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.15)]"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Custom
            </button>

            <button
              onClick={onOpenLevelSelect}
              className="flex items-center justify-center gap-1 py-2 bg-black/60 hover:bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 text-[11px] font-bold rounded-xl transition-all active:scale-95 cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.1)]"
            >
              <List className="w-3.5 h-3.5 text-emerald-400" />
              Stages
            </button>

            <button
              onClick={onOpenHowToPlay}
              className="flex items-center justify-center gap-1 py-2 bg-black/60 hover:bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 text-[11px] font-bold rounded-xl transition-all active:scale-95 cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.1)]"
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
              Guide
            </button>

            <button
              onClick={onOpenLeaderboard}
              className="flex items-center justify-center gap-1 py-2 bg-black/60 hover:bg-emerald-950/60 border border-emerald-500/30 text-emerald-200 text-[11px] font-bold rounded-xl transition-all active:scale-95 cursor-pointer shadow-[0_0_10px_rgba(16,185,129,0.1)]"
            >
              <Trophy className="w-3.5 h-3.5 text-emerald-400" />
              Scores
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};



