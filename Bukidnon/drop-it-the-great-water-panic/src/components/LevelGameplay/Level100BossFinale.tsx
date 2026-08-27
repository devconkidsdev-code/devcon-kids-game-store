import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, CloudRain, Sparkles, CheckCircle2, Wrench, Heart, Droplets } from 'lucide-react';
import { CharacterPortrait } from '../CharacterPortraits';
import { BloopAvatar } from '../BloopAvatar';
import { soundManager } from '../../utils/audio';

interface Level100BossFinaleProps {
  onSuccess: (stats: { waterSaved: number; leaksFixed: number; rainwaterCollected: number }) => void;
}

export const Level100BossFinale: React.FC<Level100BossFinaleProps> = ({ onSuccess }) => {
  const [stage, setStage] = useState<1 | 2 | 3 | 4>(1);
  const [pipePatched, setPipePatched] = useState(false);
  const [waterAllocated, setWaterAllocated] = useState(false);
  const [roofValvesOpen, setRoofValvesOpen] = useState(false);
  const [mooMooSnackPatted, setMooMooSnackPatted] = useState(false);

  // Stage 1: Patch Final Valve
  const handlePatchValve = () => {
    soundManager.playRepair();
    setPipePatched(true);
    setTimeout(() => setStage(2), 1200);
  };

  // Stage 2: Ration Final 50L
  const handleAllocateFinalDrops = () => {
    soundManager.playDrop();
    setWaterAllocated(true);
    setTimeout(() => setStage(3), 1200);
  };

  // Stage 3: Open Sky Valves
  const handleOpenSkyValves = () => {
    soundManager.playSplash();
    setRoofValvesOpen(true);
    setTimeout(() => setStage(4), 1200);
  };

  // Stage 4: Gently soothe Moo-Moo with a carrot
  const handleSootheMooMoo = () => {
    soundManager.playMoo();
    setMooMooSnackPatted(true);
    soundManager.playVictory();
    setTimeout(() => {
      onSuccess({
        waterSaved: 5000,
        leaksFixed: 10,
        rainwaterCollected: 10000,
      });
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-3xl border border-sky-100 shadow-md">
      {/* Dramatic Finale Header */}
      <div className="w-full flex items-center justify-between mb-4 bg-gradient-to-r from-sky-900 to-indigo-950 text-white p-4 rounded-2xl shadow-md">
        <div>
          <span className="text-[11px] uppercase font-black text-amber-400 tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            LEVEL 100 • THE LAST DROP
          </span>
          <h2 className="text-sm sm:text-base font-black text-sky-100">
            Day 30: Splashville’s Final Stand Before the Rain
          </h2>
        </div>
        <div className="flex items-center gap-2 bg-rose-500/30 border border-rose-400 px-3 py-1 rounded-xl text-rose-200 text-xs font-black animate-pulse">
          <span>💧 Only 50L Left!</span>
        </div>
      </div>

      {/* Narrative Dramatic Dialogue */}
      <div className="w-full p-4 bg-slate-900 text-white rounded-2xl mb-4 flex items-center gap-4">
        <CharacterPortrait speaker="moo_moo" size={54} />
        <div>
          <span className="text-xs font-extrabold text-amber-300">Moo-Moo the Cow:</span>
          <p className="text-xs sm:text-sm italic text-slate-200">
            “I may have taken a tiny sip from the emergency bucket... but I’m ready to hold on for the rain!”
          </p>
        </div>
      </div>

      {/* Interactive 4-Stage Climax Sequence */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Stage 1 Card */}
        <div
          className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
            pipePatched
              ? 'bg-emerald-50 border-emerald-300'
              : stage === 1
              ? 'bg-sky-50 border-sky-400 shadow-md ring-2 ring-sky-300'
              : 'bg-slate-50 border-slate-200 opacity-60'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-2xl">🔧</span>
              <span className="text-[10px] font-black uppercase text-slate-500">Step 1 of 4</span>
            </div>
            <h4 className="text-xs font-extrabold text-slate-900 mt-2">1. Seal the Reservoir Fracture</h4>
            <p className="text-[11px] text-slate-600">Patch the final hairline crack so zero water drips into the sand.</p>
          </div>
          <div className="mt-3">
            {pipePatched ? (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Sealed Tight!
              </span>
            ) : (
              <button
                disabled={stage !== 1}
                onClick={handlePatchValve}
                className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition"
              >
                Tighten Final Seal!
              </button>
            )}
          </div>
        </div>

        {/* Stage 2 Card */}
        <div
          className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
            waterAllocated
              ? 'bg-emerald-50 border-emerald-300'
              : stage === 2
              ? 'bg-sky-50 border-sky-400 shadow-md ring-2 ring-sky-300'
              : 'bg-slate-50 border-slate-200 opacity-60'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-2xl">🏥</span>
              <span className="text-[10px] font-black uppercase text-slate-500">Step 2 of 4</span>
            </div>
            <h4 className="text-xs font-extrabold text-slate-900 mt-2">2. Clinic & Drinking Emergency Supply</h4>
            <p className="text-[11px] text-slate-600">Guarantee sterile water for medicine and villagers for the final 6 hours.</p>
          </div>
          <div className="mt-3">
            {waterAllocated ? (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Clinic Supplied!
              </span>
            ) : (
              <button
                disabled={stage !== 2}
                onClick={handleAllocateFinalDrops}
                className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition"
              >
                Allocate Rations!
              </button>
            )}
          </div>
        </div>

        {/* Stage 3 Card */}
        <div
          className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
            roofValvesOpen
              ? 'bg-emerald-50 border-emerald-300'
              : stage === 3
              ? 'bg-sky-50 border-sky-400 shadow-md ring-2 ring-sky-300'
              : 'bg-slate-50 border-slate-200 opacity-60'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-2xl">🌧️</span>
              <span className="text-[10px] font-black uppercase text-slate-500">Step 3 of 4</span>
            </div>
            <h4 className="text-xs font-extrabold text-slate-900 mt-2">3. Open Rain Collection Network</h4>
            <p className="text-[11px] text-slate-600">Arm all 10,000 litres of cisterns and rooftop gutters to catch the storm.</p>
          </div>
          <div className="mt-3">
            {roofValvesOpen ? (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Sky Catchers Primed!
              </span>
            ) : (
              <button
                disabled={stage !== 3}
                onClick={handleOpenSkyValves}
                className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition"
              >
                Prime Cisterns!
              </button>
            )}
          </div>
        </div>

        {/* Stage 4 Card */}
        <div
          className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
            mooMooSnackPatted
              ? 'bg-emerald-50 border-emerald-300'
              : stage === 4
              ? 'bg-sky-50 border-sky-400 shadow-md ring-2 ring-sky-300'
              : 'bg-slate-50 border-slate-200 opacity-60'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-2xl">🥕</span>
              <span className="text-[10px] font-black uppercase text-slate-500">Step 4 of 4</span>
            </div>
            <h4 className="text-xs font-extrabold text-slate-900 mt-2">4. Give Moo-Moo a Juicy Carrot Snack</h4>
            <p className="text-[11px] text-slate-600">Keep Moo-Moo content while the storm clouds gather over Splashville!</p>
          </div>
          <div className="mt-3">
            {mooMooSnackPatted ? (
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Moo-Moo is Happy!
              </span>
            ) : (
              <button
                disabled={stage !== 4}
                onClick={handleSootheMooMoo}
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition"
              >
                Feed Crunchy Carrot!
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
