import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { CloudRain, Sparkles, Trophy, Heart, CheckCircle2, RotateCcw, Home, Star } from 'lucide-react';
import { BloopAvatar } from './BloopAvatar';
import { CharacterPortrait } from './CharacterPortraits';
import { UserProgress } from '../types/game';
import { soundManager } from '../utils/audio';

interface Level100EndingCinematicProps {
  progress: UserProgress;
  onReturnToVillage: () => void;
}

export const Level100EndingCinematic: React.FC<Level100EndingCinematicProps> = ({
  progress,
  onReturnToVillage,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Performance calculation for ending determination
  const totalWaterSaved = progress.totalWaterSaved;
  const endingType =
    totalWaterSaved > 15000 && progress.resources.happiness > 70
      ? 'perfect'
      : progress.resources.cleanWater > 0
      ? 'good'
      : 'panic';

  useEffect(() => {
    soundManager.startMusic('drought');
  }, []);

  const handleAdvanceScene = () => {
    soundManager.playClick();
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      soundManager.startMusic('rain');
      soundManager.playSplash();
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.4 },
        colors: ['#38bdf8', '#0284c7', '#67e8f9', '#a5f3fc', '#ffffff'],
      });
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      setStep(5);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/95 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl bg-slate-900 text-white rounded-3xl p-5 sm:p-8 shadow-2xl border-4 border-sky-400 relative overflow-hidden"
      >
        {/* Animated Sky Rain Particles in background */}
        {step >= 3 && (
          <div className="absolute inset-0 pointer-events-none opacity-30 bg-[linear-gradient(to_bottom,transparent_0%,#38bdf8_100%)] animate-pulse" />
        )}

        {/* Scene 1: The Tension at the Tank */}
        {step === 1 && (
          <div className="flex flex-col items-center text-center">
            <span className="text-xs uppercase font-extrabold text-amber-400 tracking-widest mb-1">
              Chapter 10 Finale • Day 30 at Noon
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-sky-100">
              The Big Blue Tank — The Final Drops
            </h2>

            <div className="my-5 flex flex-col items-center">
              <BloopAvatar expression="worried" size={88} />
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg mt-3 leading-relaxed">
                The entire village stands around the empty reservoir in complete silence. Every single tap in Splashville is shut tight.
              </p>
            </div>

            <div className="p-3.5 bg-slate-800/90 rounded-2xl border border-slate-700 max-w-md flex items-center gap-3 text-left">
              <CharacterPortrait speaker="moo_moo" size={48} />
              <div>
                <span className="text-xs font-black text-amber-300">Moo-Moo the Cow:</span>
                <p className="text-xs italic text-slate-200">
                  “I may have taken a tiny sip... but I’m ready! We believe in you, Bloop!”
                </p>
              </div>
            </div>

            <button
              onClick={handleAdvanceScene}
              className="mt-6 px-6 py-3 bg-sky-500 hover:bg-sky-600 font-black text-xs sm:text-sm rounded-2xl shadow-lg cursor-pointer transition"
            >
              Look Up at the Clouds...
            </button>
          </div>
        )}

        {/* Scene 2: The First Drops Fall */}
        {step === 2 && (
          <div className="flex flex-col items-center text-center">
            <span className="text-xs uppercase font-extrabold text-sky-400 tracking-widest mb-1">
              A Whisper in the Breeze
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-sky-100">
              The Sky Slowly Turns Silver...
            </h2>

            <div className="my-6 flex flex-col items-center">
              <motion.div
                animate={{ y: [0, 80] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeIn' }}
                className="text-4xl"
              >
                💧
              </motion.div>
              <BloopAvatar expression="shocked" size={88} />
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg mt-3 leading-relaxed">
                A single cool raindrop lands directly on Bloop’s head. Bloop looks up into the swirling monsoon clouds. Another drop falls. Then another...
              </p>
            </div>

            <button
              onClick={handleAdvanceScene}
              className="mt-4 px-6 py-3 bg-gradient-to-r from-sky-400 to-blue-600 font-black text-xs sm:text-sm rounded-2xl shadow-lg cursor-pointer transition hover:scale-105"
            >
              LET THE MONSOON RAIN BEGIN! 🌧️
            </button>
          </div>
        )}

        {/* Scene 3: The Grand Celebration */}
        {step === 3 && (
          <div className="flex flex-col items-center text-center">
            <span className="text-xs uppercase font-extrabold text-emerald-400 tracking-widest mb-1">
              The Great Monsoon Arrives!
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-sky-200">
              SPLASHVILLE IS SAVED! 🎉
            </h2>

            <div className="my-5 flex flex-col items-center">
              <BloopAvatar isDancing={true} expression="excited" size={96} />
              <p className="text-xs sm:text-sm text-slate-200 max-w-lg mt-3 leading-relaxed">
                Torrents of pure, sparkling rainwater fill the Big Blue Tank to overflowing! The river surges with clear water, ducks dive with joy, Professor Croak sings on his lilypad, and Moo-Moo catches raindrops on her tongue!
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2 w-full max-w-md my-2 text-xs">
              <div className="p-2 bg-sky-950/80 rounded-xl border border-sky-800">
                <span className="text-lg">🐮</span>
                <span className="block font-bold mt-1 text-sky-200">Moo-Moo Singing</span>
              </div>
              <div className="p-2 bg-emerald-950/80 rounded-xl border border-emerald-800">
                <span className="text-lg">🐸</span>
                <span className="block font-bold mt-1 text-emerald-200">Croak Cheering</span>
              </div>
              <div className="p-2 bg-amber-950/80 rounded-xl border border-amber-800">
                <span className="text-lg">🌾</span>
                <span className="block font-bold mt-1 text-amber-200">Crops Blooming</span>
              </div>
            </div>

            <button
              onClick={handleAdvanceScene}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 font-black text-xs sm:text-sm rounded-2xl shadow-lg cursor-pointer transition hover:scale-105"
            >
              View Village Guardian Statistics
            </button>
          </div>
        )}

        {/* Scene 4: Complete Statistics Review & Ending Badge */}
        {step === 4 && (
          <div className="flex flex-col items-center text-center">
            {endingType === 'perfect' && (
              <div className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-400 text-slate-950 font-black text-xs uppercase rounded-full mb-2">
                <Trophy className="w-4 h-4" />
                <span>PERFECT ENDING: “Rainmaker of Splashville”</span>
              </div>
            )}
            {endingType === 'good' && (
              <div className="flex items-center gap-1.5 px-4 py-1.5 bg-sky-400 text-slate-950 font-black text-xs uppercase rounded-full mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>GOOD ENDING: “We Made It!”</span>
              </div>
            )}

            <h2 className="text-xl sm:text-2xl font-black text-sky-100">
              Splashville 30-Day Conservation Record
            </h2>

            {/* Statistics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full my-4 text-left">
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Total Water Saved</span>
                <span className="text-sm font-black text-sky-400 block mt-0.5">
                  {progress.totalWaterSaved.toLocaleString()} L
                </span>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Leaks Repaired</span>
                <span className="text-sm font-black text-emerald-400 block mt-0.5">
                  {progress.totalLeaksFixed} Pipes & Taps
                </span>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Rain Harvested</span>
                <span className="text-sm font-black text-blue-400 block mt-0.5">
                  {progress.totalRainCollected.toLocaleString()} L
                </span>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Pollution Prevented</span>
                <span className="text-sm font-black text-teal-400 block mt-0.5">
                  100% Sludge Filtered
                </span>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Moo-Moo Sips Managed</span>
                <span className="text-sm font-black text-amber-400 block mt-0.5">
                  {progress.mooMooSipsCaught} Troughs
                </span>
              </div>
              <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700">
                <span className="text-[10px] text-slate-400 font-bold uppercase">Village Happiness</span>
                <span className="text-sm font-black text-rose-400 block mt-0.5">
                  {progress.resources.happiness}% Joy
                </span>
              </div>
            </div>

            <button
              onClick={handleAdvanceScene}
              className="mt-3 px-6 py-3 bg-gradient-to-r from-sky-400 to-indigo-600 font-black text-xs sm:text-sm rounded-2xl shadow-lg cursor-pointer transition hover:scale-105"
            >
              The Final Guardian Message...
            </button>
          </div>
        )}

        {/* Scene 5: The Touching Educational Climax & Final Words */}
        {step === 5 && (
          <div className="flex flex-col items-center text-center">
            <BloopAvatar expression="proud" size={80} />

            <div className="my-5 p-4 sm:p-6 bg-slate-800/90 rounded-3xl border border-sky-500/40 max-w-xl">
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                “Water scarcity is real. Clean freshwater is limited, and every community on Earth depends on it. Saving water, preventing pollution, protecting nature, and using water wisely can help protect our shared future.”
              </p>

              <div className="my-6">
                <motion.h1
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-sky-300 via-cyan-200 to-white tracking-wider"
                >
                  EVERY DROP COUNTS.
                </motion.h1>
                <p className="text-sm sm:text-base font-bold text-sky-300 mt-1 italic">
                  What will you do with yours?
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={onReturnToVillage}
                className="px-6 py-3 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg flex items-center gap-2 cursor-pointer transition hover:scale-105"
              >
                <Home className="w-4 h-4" />
                <span>Return to Splashville Hub</span>
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
