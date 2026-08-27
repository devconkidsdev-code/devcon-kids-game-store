import React from 'react';
import { ArrowLeft, ArrowUp, ArrowDown, ArrowRight, Shield, Zap } from 'lucide-react';

interface HowToPlayModalProps {
  onBack: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onBack }) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="bg-[#050805]/95 border-2 border-emerald-500/40 rounded-3xl p-5 sm:p-7 max-w-xl w-full shadow-[0_0_50px_rgba(16,185,129,0.2)] relative overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] flex flex-col">
        {/* Background watermark */}
        <div className="text-[100px] font-black leading-none tracking-tighter text-emerald-500/5 absolute -bottom-6 -right-6 pointer-events-none select-none">
          GUIDE
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
          <div className="flex flex-col">
            <span className="text-[9px] uppercase tracking-[0.3em] text-emerald-500 font-bold">
              Field Manual
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white italic tracking-tight drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              HOW TO <span className="text-emerald-400">PLAY</span>
            </h2>
          </div>
          <div className="w-14" />
        </div>

        {/* Content */}
        <div className="overflow-y-auto space-y-3 text-left text-xs sm:text-sm text-emerald-100 pr-1 my-2 z-10">
          {/* Lore */}
          <div className="bg-emerald-950/30 border border-emerald-500/30 p-3 rounded-2xl">
            <span className="font-black text-emerald-400 uppercase tracking-widest text-xs block mb-1">
              🏃 Alexander's Province Challenge
            </span>
            <p className="text-zinc-300 text-xs leading-relaxed">
              Alexander is renowned as the fastest runner across the entire province. To defend his legendary title, sprint through dangerous terrain filled with rolling rocks and timber trunks to reach the Safe Zone before the clock runs out!
            </p>
          </div>

          {/* Controls */}
          <div className="bg-black/60 border border-emerald-500/25 p-3.5 rounded-2xl">
            <span className="font-bold text-white uppercase tracking-widest text-[11px] block mb-2 text-emerald-400">
              🎮 Action Keymap (Keyboard / Touch Buttons)
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 bg-[#050e05] border border-amber-500/30 p-2 rounded-xl">
                <div className="p-1.5 bg-amber-500/20 text-amber-300 rounded-lg border border-amber-500/40 font-black text-xs">
                  🪨
                </div>
                <div>
                  <span className="font-bold block text-amber-300">SPACE / Button</span>
                  <span className="text-[10px] text-zinc-400">Throw Rock at Boss & Obstacles!</span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-[#050e05] border border-emerald-500/20 p-2 rounded-xl">
                <div className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/40">
                  <ArrowUp className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold block text-white">UP / W</span>
                  <span className="text-[10px] text-zinc-400">Jump over rocks & logs</span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-[#050e05] border border-emerald-500/20 p-2 rounded-xl">
                <div className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/40">
                  <ArrowDown className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold block text-white">DOWN / S</span>
                  <span className="text-[10px] text-zinc-400">Slide under swinging timber</span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-[#050e05] border border-emerald-500/20 p-2 rounded-xl">
                <div className="p-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg border border-emerald-500/40">
                  <ArrowRight className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-bold block text-white">RIGHT / D</span>
                  <span className="text-[10px] text-zinc-400">Alexander Sprint Surge</span>
                </div>
              </div>
            </div>
          </div>

          {/* Boss Fight & Combat */}
          <div className="bg-gradient-to-r from-red-950/40 via-orange-950/30 to-zinc-950/50 border border-orange-500/40 p-3 rounded-2xl">
            <span className="font-black text-orange-400 uppercase tracking-widest text-xs block mb-1 flex items-center gap-1.5">
              🌋 Epic Titan Boss Battles
            </span>
            <p className="text-zinc-300 text-xs leading-relaxed">
              Titan Guardians emerge during critical course sections and Infinite Odyssey tiers! They fling massive boulders and magma projectiles. <strong>Press SPACEBAR to throw rocks</strong> to shatter incoming debris and deplete the Boss's health bar!
            </p>
          </div>

          {/* Rules & Powerups */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-red-950/20 border border-red-500/30 p-3 rounded-2xl">
              <span className="flex items-center gap-1.5 font-bold text-red-400 text-xs mb-1">
                <div className="w-3 h-3 bg-red-500 rotate-45" /> 3 Lives Vitality System
              </span>
              <p className="text-[11px] text-zinc-300 leading-snug">
                Colliding with rolling rocks or tree trunks costs 1 vitality diamond.
              </p>
            </div>

            <div className="bg-emerald-950/20 border border-emerald-500/30 p-3 rounded-2xl">
              <span className="flex items-center gap-1 font-bold text-emerald-300 text-xs mb-1">
                <Shield className="w-3.5 h-3.5 text-emerald-400" /> Safe Zone Countdown
              </span>
              <p className="text-[11px] text-zinc-300 leading-snug">
                Each course has a countdown. Sprint to reach the Safe Haven before zero!
              </p>
            </div>
          </div>

          {/* Pickups */}
          <div className="bg-black/60 border border-emerald-500/25 p-3 rounded-2xl">
            <span className="font-bold text-emerald-400 uppercase tracking-widest text-[11px] block mb-2">
              ⭐ Province Track Pickups
            </span>
            <div className="grid grid-cols-3 gap-2 text-[11px]">
              <div className="flex flex-col items-center text-center p-2 bg-[#050e05] border border-emerald-500/20 rounded-xl">
                <span className="text-base">🥭</span>
                <span className="font-bold text-amber-300 text-[10px]">Province Mango</span>
                <span className="text-[9px] text-zinc-400">Speed Surge</span>
              </div>
              <div className="flex flex-col items-center text-center p-2 bg-[#050e05] border border-emerald-500/20 rounded-xl">
                <span className="text-base">🧪</span>
                <span className="font-bold text-red-400 text-[10px]">Herbal Tonic</span>
                <span className="text-[9px] text-zinc-400">+1 Vitality</span>
              </div>
              <div className="flex flex-col items-center text-center p-2 bg-[#050e05] border border-emerald-500/20 rounded-xl">
                <span className="text-base">👟</span>
                <span className="font-bold text-emerald-300 text-[10px]">Golden Shoes</span>
                <span className="text-[9px] text-zinc-400">Star Shield</span>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={onBack}
          className="w-full mt-3 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black italic tracking-widest text-sm uppercase rounded-2xl shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all active:scale-[0.98] cursor-pointer z-10"
        >
          READY, LET'S SPRINT!
        </button>
      </div>
    </div>
  );
};

