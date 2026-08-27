import React from 'react';
import { X, Keyboard, ShieldAlert, Droplets, Sparkles, Flame, Eye, Compass, Heart, Radio, Crosshair } from 'lucide-react';

interface ControlsGuideProps {
  onClose: () => void;
}

export const ControlsGuide: React.FC<ControlsGuideProps> = ({ onClose }) => {
  return (
    <div
      id="controls-guide-backdrop"
      className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 z-50 animate-fadeIn"
    >
      <div
        id="controls-guide-card"
        className="bg-[#0a0f0a] border border-emerald-500/40 w-full max-w-3xl max-h-[90vh] flex flex-col shadow-[0_0_40px_rgba(16,185,129,0.2)] overflow-hidden text-emerald-50 relative"
      >
        {/* Tactical Grid Background Overlay */}
        <div className="absolute inset-0 bg-tactical-grid opacity-20 pointer-events-none" />

        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-emerald-500/30 flex items-center justify-between bg-black/60 z-10 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-emerald-950/60 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-mono tracking-[0.2em] text-emerald-400 font-bold">
                OPERATIONAL FIELD MANUAL
              </div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight text-white italic">
                FARMER SURVIVAL & SATELLITE INTERACTION
              </h2>
            </div>
          </div>

          <button
            id="close-guide-btn"
            onClick={onClose}
            className="w-9 h-9 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 z-10 font-mono">
          {/* Key Bindings */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-3 flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-emerald-400" /> TACTICAL MOVEMENT & ACTIONS
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-black/60 p-3 border border-emerald-500/30 flex items-center justify-between">
                <span className="text-emerald-300">Farmer Locomotion</span>
                <div className="flex gap-1 font-mono font-bold text-white">
                  <kbd className="px-2 py-0.5 bg-emerald-950 border border-emerald-500/50 text-emerald-300">W</kbd>
                  <kbd className="px-2 py-0.5 bg-emerald-950 border border-emerald-500/50 text-emerald-300">A</kbd>
                  <kbd className="px-2 py-0.5 bg-emerald-950 border border-emerald-500/50 text-emerald-300">S</kbd>
                  <kbd className="px-2 py-0.5 bg-emerald-950 border border-emerald-500/50 text-emerald-300">D</kbd>
                </div>
              </div>

              <div className="bg-black/60 p-3 border border-emerald-500/30 flex items-center justify-between">
                <span className="text-emerald-300">Sprint Surge (Consumes Stamina)</span>
                <kbd className="px-2.5 py-0.5 bg-emerald-950 border border-emerald-500/50 text-amber-300">
                  Shift
                </kbd>
              </div>

              <div className="bg-black/60 p-3 border border-emerald-500/30 flex items-center justify-between">
                <span className="text-emerald-300">Stealth Crouch (Silent Noise)</span>
                <kbd className="px-2.5 py-0.5 bg-emerald-950 border border-emerald-500/50 text-emerald-300">
                  C / Ctrl
                </kbd>
              </div>

              <div className="bg-black/60 p-3 border border-emerald-500/30 flex items-center justify-between">
                <span className="text-cyan-300">Extract Water from Spring</span>
                <kbd className="px-3 py-0.5 bg-cyan-950/80 text-cyan-300 border border-cyan-500">
                  Space
                </kbd>
              </div>

              <div className="bg-black/60 p-3 border border-emerald-500/30 flex items-center justify-between">
                <span className="text-emerald-300">Hydrate Parched Sector Crops</span>
                <kbd className="px-3 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-400">
                  E
                </kbd>
              </div>

              <div className="bg-black/60 p-3 border border-emerald-500/30 flex items-center justify-between">
                <span className="text-orange-300">Deploy Thermal Flare (Scare Beasts)</span>
                <kbd className="px-2.5 py-0.5 bg-orange-950 text-orange-300 border border-orange-500">
                  Q / 1
                </kbd>
              </div>

              <div className="bg-black/60 p-3 border border-emerald-500/30 flex items-center justify-between">
                <span className="text-slate-300">Toss Acoustic Distraction Stone</span>
                <kbd className="px-2.5 py-0.5 bg-slate-900 text-slate-300 border border-slate-600">
                  F / 2
                </kbd>
              </div>

              <div className="bg-black/60 p-3 border border-amber-500/40 flex items-center justify-between">
                <span className="text-amber-300 font-bold">Complete & Proceed to Next Sector</span>
                <kbd className="px-2.5 py-0.5 bg-amber-950 text-amber-300 border border-amber-500 font-bold">
                  N
                </kbd>
              </div>

              <div className="bg-black/60 p-3 border border-emerald-500/30 flex items-center justify-between">
                <span className="text-emerald-300">Touchscreen Mobile Interface</span>
                <span className="text-emerald-400 font-bold">Virtual Joystick</span>
              </div>
            </div>
          </div>

          {/* Dangerous Wildlife Encyclopedia */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-red-400 mb-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" /> BIO-HAZARD WILDLIFE TELEMETRY
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-black/60 p-3 border border-red-500/30">
                <div className="font-bold text-red-300 flex items-center gap-1.5">
                  🐺 Timber Wolf Pack
                </div>
                <p className="text-slate-400 text-[11px] mt-1 font-sans">
                  Fast pack predator with long vision cones and acoustic tracking. Scared away by active Flares.
                </p>
              </div>

              <div className="bg-black/60 p-3 border border-red-500/30">
                <div className="font-bold text-red-300 flex items-center gap-1.5">
                  🐻 Apex Grizzly Bear
                </div>
                <p className="text-slate-400 text-[11px] mt-1 font-sans">
                  Devastating melee damage. Heavy charge attack. Redirect away with distraction stones.
                </p>
              </div>

              <div className="bg-black/60 p-3 border border-red-500/30">
                <div className="font-bold text-red-300 flex items-center gap-1.5">
                  🐊 Marsh Crocodile
                </div>
                <p className="text-slate-400 text-[11px] mt-1 font-sans">
                  Submerged swamp ambush predator. Explosive lunge when you enter muddy water.
                </p>
              </div>

              <div className="bg-black/60 p-3 border border-red-500/30">
                <div className="font-bold text-red-300 flex items-center gap-1.5">
                  🐆 Mountain Cougar
                </div>
                <p className="text-slate-400 text-[11px] mt-1 font-sans">
                  High-stealth stalker in canyon ridges and rocky terrain.
                </p>
              </div>

              <div className="bg-black/60 p-3 border border-red-500/30">
                <div className="font-bold text-red-300 flex items-center gap-1.5">
                  🦏 Savanna Rhino
                </div>
                <p className="text-slate-400 text-[11px] mt-1 font-sans">
                  Massive kinetic rammer. Dodge sideways to escape straight charge path.
                </p>
              </div>

              <div className="bg-black/60 p-3 border border-red-500/30">
                <div className="font-bold text-red-300 flex items-center gap-1.5">
                  🐍 Venomous Viper
                </div>
                <p className="text-slate-400 text-[11px] mt-1 font-sans">
                  Camouflaged in grassland. Listen to acoustic rattling alerts.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
