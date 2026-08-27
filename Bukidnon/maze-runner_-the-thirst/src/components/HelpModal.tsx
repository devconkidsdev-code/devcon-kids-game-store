import React from 'react';
import { X, Droplets, Zap, Shield, Sparkles, Clock, Eye, AlertTriangle, Play } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 z-50 bg-indigo-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-indigo-900/90 border-2 border-cyan-400/40 rounded-3xl p-6 shadow-[0_0_50px_rgba(6,182,212,0.25)] text-center flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-indigo-800">
          <h3 className="text-xl font-black italic tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-yellow-300 to-cyan-300">
            HOW TO PLAY & SURVIVAL GUIDE
          </h3>
          <button
            id="close-help-btn"
            onClick={onClose}
            aria-label="Close Guide"
            className="p-2 text-indigo-300 hover:text-white rounded-xl hover:bg-indigo-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto my-4 space-y-4 text-left text-xs md:text-sm pr-1">
          {/* Controls */}
          <div className="bg-indigo-950/80 border border-indigo-500/40 rounded-2xl p-4">
            <h4 className="font-black text-cyan-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
              🎮 Movement Controls
            </h4>
            <div className="grid grid-cols-2 gap-2 text-indigo-200 text-xs">
              <div>
                <span className="font-bold text-white">WASD / Arrows:</span> Move runner
              </div>
              <div>
                <span className="font-bold text-white">Shift / SPRINT:</span> Turbo speed
              </div>
              <div>
                <span className="font-bold text-white">Pointer / Touch:</span> Aim Beam
              </div>
              <div>
                <span className="font-bold text-white">Virtual Joystick:</span> Mobile thumbstick
              </div>
            </div>
          </div>

          {/* Core Objectives */}
          <div className="bg-indigo-950/80 border border-indigo-500/40 rounded-2xl p-4">
            <h4 className="font-black text-yellow-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
              🌾 Core Mission: Revive Thirsty Crops
            </h4>
            <p className="text-indigo-200 text-xs leading-relaxed">
              Find wilting dry crop plots 🌾 inside the dark maze. Stand next to them to pour your bucket's water until flowers blossom! Once all crops in the level are hydrated, the Exit Portal 🚪 unlocks!
            </p>
          </div>

          {/* Water Slosh Physics & Danger */}
          <div className="bg-indigo-950/80 border border-indigo-500/40 rounded-2xl p-4">
            <h4 className="font-black text-pink-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
              <Droplets className="w-4 h-4 text-pink-400 fill-current" /> Bucket Slosh Physics & Traps
            </h4>
            <ul className="list-disc list-inside text-indigo-200 text-xs space-y-1">
              <li><strong className="text-white">Wall Bonks:</strong> Slamming into cardboard walls at high speed sloshes water out!</li>
              <li><strong className="text-white">Continuous Sprinting:</strong> Causes mild slosh drips if prolonged.</li>
              <li><strong className="text-white">Spike Traps & Steam:</strong> Deal heavy damage and spill water!</li>
              <li><strong className="text-white">Water Wells:</strong> Stand on stone wells 💧 to refill your bucket to 100%!</li>
            </ul>
          </div>

          {/* Lives & Survival */}
          <div className="bg-indigo-950/80 border border-rose-500/40 rounded-2xl p-4">
            <h4 className="font-black text-rose-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
              💖 Lives System & Heart Pickups
            </h4>
            <p className="text-indigo-200 text-xs leading-relaxed mb-2">
              You start with <strong className="text-rose-400 font-bold">3 Lives (❤️ ❤️ ❤️)</strong>. Taking direct hits from hazardous obstacles (rolling barrels, spinning saws, laser gates) or spike traps depletes a life. Collect <strong className="text-pink-300 font-bold">💖 Heart Crates</strong> to restore lost lives!
            </p>
          </div>

          {/* Kid-Friendly Bouncy Obstacles */}
          <div className="bg-indigo-950/80 border border-amber-500/40 rounded-2xl p-4">
            <h4 className="font-black text-yellow-300 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
              🎈 Fun & Bouncy Maze Toys
            </h4>
            <div className="space-y-1.5 text-xs text-indigo-200">
              <div>
                <strong className="text-yellow-300">⚽ Bouncy Beach Ball:</strong> Rolls gently along the hall. Bounce around it or jump past!
              </div>
              <div>
                <strong className="text-pink-300">🌸 Rainbow Pinwheel:</strong> Spins cheerfully and blows soft breezy puffs!
              </div>
              <div>
                <strong className="text-cyan-300">🫧 Bubble Sprinkler:</strong> Puffs floating iridescent soap bubbles you can pop!
              </div>
              <div>
                <strong className="text-rose-300">🍮 Wobbly Jell-O:</strong> Jiggles happily in place with cute blinking eyes!
              </div>
              <div className="pt-1 text-sky-300">
                <strong>💡 Kid Tip:</strong> If silly chasers run into a beach ball or pinwheel, they get boinged into dizzy stars!
              </div>
            </div>
          </div>

          {/* Power-Up Treats */}
          <div className="bg-indigo-950/80 border border-indigo-500/40 rounded-2xl p-4">
            <h4 className="font-black text-yellow-300 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-yellow-400" /> Mystery Surprise Boxes
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs text-indigo-200">
              <div className="flex items-center gap-1.5">
                <span>💖</span> <strong>Extra Life:</strong> +1 Player Heart (up to 3)
              </div>
              <div className="flex items-center gap-1.5">
                <span>🧽</span> <strong>Super Sponge:</strong> +35% Water refill
              </div>
              <div className="flex items-center gap-1.5">
                <span>⏰</span> <strong>Golden Clock:</strong> +15 Seconds
              </div>
              <div className="flex items-center gap-1.5">
                <span>🔦</span> <strong>Megabeam:</strong> Massive flashlight cone
              </div>
              <div className="flex items-center gap-1.5">
                <span>🛡️</span> <strong>Bucket Lid:</strong> Zero splash on crashes
              </div>
              <div className="flex items-center gap-1.5">
                <span>⚡</span> <strong>Turbo Soda:</strong> Super sprint speed
              </div>
            </div>
          </div>

          {/* Chasers & Maze Challenges */}
          <div className="bg-indigo-950/80 border border-emerald-500/40 rounded-2xl p-4">
            <h4 className="font-black text-emerald-400 mb-2 flex items-center gap-1.5 uppercase tracking-wider">
              👾 Chasers & Catch Challenges
            </h4>
            <div className="space-y-2 text-xs text-indigo-200">
              <div>
                <strong className="text-emerald-300">👹 Greedy Guzzlers:</strong> Patrol hallways and chase you when in sight to steal water from your bucket!
              </div>
              <div>
                <strong className="text-cyan-300">🏃 Speedy Sprinters:</strong> Fast runners with visors that dash in rapid pursuit bursts!
              </div>
              <div>
                <strong className="text-yellow-300">⭐ Golden Bandit:</strong> Runs away when you approach! Chase and catch him for <span className="text-yellow-300 font-bold">+1200 pts, +15s Time & 100% Water!</span>
              </div>
              <div>
                <strong className="text-pink-300">💫 Trap Juking:</strong> Lure chasers into steam vents or spikes to stun them and earn huge bonus points!
              </div>
            </div>
          </div>
        </div>

        <button
          id="help-got-it-btn"
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-indigo-950 font-black text-xs uppercase tracking-widest shadow-[0_6px_0_#0891b2] active:translate-y-1 active:shadow-[0_2px_0_#0891b2] transition cursor-pointer"
        >
          GOT IT, LET'S RUN!
        </button>
      </div>
    </div>
  );
};
