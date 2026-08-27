import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Footprints, FileText, CheckCircle2, HelpCircle } from 'lucide-react';
import { CharacterPortrait } from '../CharacterPortraits';
import { CharacterId } from '../../types/game';
import { soundManager } from '../../utils/audio';

interface DetectiveViewProps {
  levelId: number;
  objectiveText: string;
  onSuccess: (stats: { waterSaved: number; leaksFixed: number }) => void;
}

interface Clue {
  id: string;
  title: string;
  icon: string;
  description: string;
  found: boolean;
  x: number; // percentage
  y: number; // percentage
}

interface Suspect {
  id: CharacterId;
  name: string;
  role: string;
  alibi: string;
  guiltyTension: string;
  confession: string;
}

export const DetectiveView: React.FC<DetectiveViewProps> = ({
  levelId,
  objectiveText,
  onSuccess,
}) => {
  const [clues, setClues] = useState<Clue[]>([
    {
      id: 'clue_puddle',
      title: 'Puddle Trail',
      icon: '💧',
      description: 'A trail of fresh water drops leading from the Big Blue Tank toward the barn.',
      found: false,
      x: 25,
      y: 35,
    },
    {
      id: 'clue_footprint',
      title: 'Suspicious Webbed Tracks',
      icon: '🦆',
      description: 'Tiny duck footprints splashed in mud around the emergency valve!',
      found: false,
      x: 65,
      y: 28,
    },
    {
      id: 'clue_rubber_seal',
      title: 'Worn Rubber Gasket',
      icon: '🔧',
      description: 'A cracked tap seal that had been dripping 1 drop every 2 seconds.',
      found: false,
      x: 45,
      y: 70,
    },
    {
      id: 'clue_soap_bubble',
      title: 'Lavender Bath Bubble',
      icon: '🫧',
      description: 'Clucky’s favorite brand of relaxing bubble bath residue near the drain.',
      found: false,
      x: 80,
      y: 65,
    },
  ]);

  const [activeClue, setActiveClue] = useState<Clue | null>(null);
  const [activeSuspect, setActiveSuspect] = useState<Suspect | null>(null);
  const [interrogatedCount, setInterrogatedCount] = useState(0);
  const [isDeductionReady, setIsDeductionReady] = useState(false);
  const [solved, setSolved] = useState(false);

  const suspects: Suspect[] = [
    {
      id: 'moo_moo',
      name: 'Moo-Moo the Cow',
      role: 'Chief Milk Producer & Thirsty Bovine',
      alibi: '“I was meditating near the clover field! Although... I did smell cold, refreshing tank water...”',
      guiltyTension: 'Licking lips nervously.',
      confession: '“Okay! I took three small buckets of water for my afternoon tea party!”',
    },
    {
      id: 'clucky',
      name: 'Clucky the Chicken',
      role: 'Feathered Cleanliness Enthusiast',
      alibi: '“Bawk! A lady needs her 45-minute spa routine to keep her feathers fluffy!”',
      guiltyTension: 'Wearing a tiny shower cap.',
      confession: '“Fine! I left the sink tap running while admiring my reflection in the mirror!”',
    },
    {
      id: 'farmer_bramble',
      name: 'Farmer Bramble',
      role: 'Berry Grower',
      alibi: '“I was wrestling my runaway sprinkler! It has a mind of its own, I swear!”',
      guiltyTension: 'Soaked boots dripping water.',
      confession: '“I forgot to turn off the garden hose before taking my afternoon nap!”',
    },
  ];

  const handleClueClick = (clue: Clue) => {
    soundManager.playDrop();
    setActiveClue(clue);
    setClues((prev) =>
      prev.map((c) => (c.id === clue.id ? { ...c, found: true } : c))
    );
  };

  const handleInterrogate = (suspect: Suspect) => {
    soundManager.playClick();
    setActiveSuspect(suspect);
    setInterrogatedCount((c) => c + 1);
  };

  const foundCluesCount = clues.filter((c) => c.found).length;

  const handleSolveMystery = () => {
    soundManager.playVictory();
    setSolved(true);
    setTimeout(() => {
      onSuccess({ waterSaved: 500 + levelId * 20, leaksFixed: 3 });
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-3xl border border-sky-100 shadow-md">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-3 bg-indigo-50 p-3 rounded-2xl border border-indigo-100">
        <div>
          <span className="text-[11px] uppercase font-bold text-indigo-600 tracking-wider">
            Detective Investigation
          </span>
          <p className="text-xs sm:text-sm font-bold text-slate-800">{objectiveText}</p>
        </div>
        <div className="flex items-center gap-2 text-xs font-extrabold text-indigo-700 bg-white px-3 py-1.5 rounded-xl border border-indigo-200">
          <Search className="w-4 h-4" />
          <span>Clues: {foundCluesCount} / {clues.length}</span>
        </div>
      </div>

      {/* Crime Scene Area */}
      <div className="relative w-full aspect-video max-h-[340px] bg-gradient-to-b from-indigo-900 via-slate-800 to-slate-950 rounded-2xl border-4 border-indigo-950 shadow-inner overflow-hidden flex items-center justify-center p-4">
        {/* Crime Scene Backdrop Illustration Elements */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Big Blue Tank in background */}
        <div className="absolute top-4 left-6 flex flex-col items-center opacity-60">
          <div className="w-16 h-20 bg-sky-500 rounded-t-2xl border-2 border-sky-300" />
          <span className="text-[9px] text-sky-200 font-bold mt-1">Big Blue Tank</span>
        </div>

        {/* Interactive Clue Spots */}
        {clues.map((clue) => (
          <motion.button
            key={clue.id}
            onClick={() => handleClueClick(clue)}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            style={{ left: `${clue.x}%`, top: `${clue.y}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 p-2.5 rounded-full border-2 cursor-pointer shadow-lg transition-all ${
              clue.found
                ? 'bg-emerald-500/80 border-white text-white'
                : 'bg-amber-400/90 border-white text-slate-900 animate-bounce'
            }`}
          >
            <span className="text-lg">{clue.icon}</span>
          </motion.button>
        ))}

        {/* Detective Bloop looking around */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-indigo-950/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-indigo-400/40 text-indigo-100 text-xs">
          <span>🕵️</span>
          <span>Click glowing spots to inspect clues!</span>
        </div>
      </div>

      {/* Clue Details Modal / Card */}
      {activeClue && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 w-full p-3 bg-sky-50 rounded-2xl border border-sky-200 flex items-center justify-between gap-3"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl p-2 bg-white rounded-xl shadow-xs">{activeClue.icon}</span>
            <div>
              <h4 className="text-xs sm:text-sm font-extrabold text-sky-950">{activeClue.title}</h4>
              <p className="text-xs text-slate-600">{activeClue.description}</p>
            </div>
          </div>
          <button
            onClick={() => setActiveClue(null)}
            className="text-xs px-3 py-1 bg-white border border-sky-300 rounded-lg font-bold text-sky-800 hover:bg-sky-100 cursor-pointer"
          >
            Done
          </button>
        </motion.div>
      )}

      {/* Suspect Interrogation Row */}
      <div className="mt-4 w-full">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
          Interrogate Suspects
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {suspects.map((s) => (
            <button
              key={s.id}
              onClick={() => handleInterrogate(s)}
              className="p-3 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 transition-all flex items-center gap-3 text-left cursor-pointer"
            >
              <CharacterPortrait speaker={s.id} size={44} />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-900">{s.name}</span>
                <span className="text-[10px] text-slate-500 line-clamp-1">{s.role}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Interrogation Dialogue Bubble */}
      {activeSuspect && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-3 w-full p-4 bg-indigo-900 text-white rounded-2xl shadow-lg flex flex-col gap-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CharacterPortrait speaker={activeSuspect.id} size={36} />
              <span className="text-xs font-black text-indigo-200">{activeSuspect.name}</span>
            </div>
            <span className="text-[10px] bg-indigo-800 px-2 py-0.5 rounded text-indigo-300">
              {activeSuspect.guiltyTension}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-medium italic text-indigo-100">
            {foundCluesCount >= 3 ? activeSuspect.confession : activeSuspect.alibi}
          </p>
        </motion.div>
      )}

      {/* Final Deduction Button */}
      <div className="mt-5 w-full flex justify-center">
        {foundCluesCount >= 3 ? (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSolveMystery}
            disabled={solved}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-extrabold text-sm rounded-2xl shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
            <span>{solved ? 'Mystery Solved!' : 'Conclude Detective Report!'}</span>
          </motion.button>
        ) : (
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <HelpCircle className="w-4 h-4" />
            Find at least 3 clues in the scene before drawing conclusions!
          </p>
        )}
      </div>
    </div>
  );
};
