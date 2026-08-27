import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Trash2, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface RiverCleanViewProps {
  levelId: number;
  objectiveText: string;
  onSuccess: (stats: { waterSaved: number; pollutionPrevented: number }) => void;
}

interface RiverItem {
  id: string;
  type: 'plastic' | 'oil_can' | 'tire' | 'clean_bubble' | 'fish';
  name: string;
  icon: string;
  x: number; // 0-100%
  y: number; // 0-100%
  cleaned: boolean;
}

export const RiverCleanView: React.FC<RiverCleanViewProps> = ({
  levelId,
  objectiveText,
  onSuccess,
}) => {
  const [filterLayers, setFilterLayers] = useState({
    sand: false,
    gravel: false,
    charcoal: false,
  });

  const [riverItems, setRiverItems] = useState<RiverItem[]>([
    { id: '1', type: 'plastic', name: 'Plastic Bottle', icon: '🥤', x: 20, y: 30, cleaned: false },
    { id: '2', type: 'oil_can', name: 'Oil Drum', icon: '🛢️', x: 45, y: 60, cleaned: false },
    { id: '3', type: 'tire', name: 'Old Tire', icon: '🛞', x: 70, y: 40, cleaned: false },
    { id: '4', type: 'plastic', name: 'Plastic Bag', icon: '🛍️', x: 35, y: 75, cleaned: false },
    { id: '5', type: 'fish', name: 'Rainbow Trout', icon: '🐟', x: 60, y: 25, cleaned: false },
  ]);

  const [waterClarity, setWaterClarity] = useState(25); // 0-100%
  const [pollutionPrevented, setPollutionPrevented] = useState(0);

  const handleCleanItem = (item: RiverItem) => {
    if (item.cleaned) return;

    if (item.type === 'fish') {
      soundManager.playPop();
      return; // don't remove friendly fish!
    }

    soundManager.playCoin();
    setRiverItems((prev) =>
      prev.map((it) => (it.id === item.id ? { ...it, cleaned: true } : it))
    );
    setPollutionPrevented((p) => p + 1);
    setWaterClarity((c) => Math.min(100, c + 15));
  };

  const handleToggleFilter = (layer: 'sand' | 'gravel' | 'charcoal') => {
    soundManager.playRepair();
    setFilterLayers((prev) => {
      const nextState = { ...prev, [layer]: !prev[layer] };
      const activeCount = Object.values(nextState).filter(Boolean).length;
      setWaterClarity(25 + activeCount * 20 + pollutionPrevented * 10);
      return nextState;
    });
  };

  const allTrashCleaned = riverItems.filter((it) => it.type !== 'fish').every((it) => it.cleaned);
  const allFiltersBuilt = filterLayers.sand && filterLayers.gravel && filterLayers.charcoal;

  const handleFinishCleaning = () => {
    soundManager.playVictory();
    setTimeout(() => {
      onSuccess({ waterSaved: 600 + levelId * 20, pollutionPrevented: pollutionPrevented + 10 });
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-3xl border border-sky-100 shadow-md">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-3 bg-teal-50 p-3.5 rounded-2xl border border-teal-100">
        <div>
          <span className="text-[11px] uppercase font-bold text-teal-700 tracking-wider">
            River Cleanup & Bio-Filtration
          </span>
          <p className="text-xs sm:text-sm font-bold text-slate-800">{objectiveText}</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-slate-500 font-bold uppercase">Water Clarity</span>
          <span className="text-sm font-extrabold text-teal-700">{waterClarity}% Pure</span>
        </div>
      </div>

      {/* River Simulation Canvas */}
      <div className="relative w-full aspect-video max-h-[320px] bg-gradient-to-r from-teal-700 via-cyan-600 to-sky-600 rounded-2xl border-4 border-teal-800 shadow-inner overflow-hidden flex items-center justify-center p-4">
        {/* Animated Water Waves */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#a5f3fc_1px,transparent_1px)] [background-size:24px_24px] animate-pulse" />

        {/* Floating Items in River */}
        {riverItems.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => handleCleanItem(item)}
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 p-2 rounded-full cursor-pointer transition-all ${
              item.cleaned ? 'opacity-0 pointer-events-none scale-50' : 'opacity-100'
            }`}
          >
            <span className="text-2xl sm:text-3xl filter drop-shadow-md">{item.icon}</span>
          </motion.button>
        ))}

        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md px-4 py-1 rounded-full text-white text-xs font-semibold flex items-center gap-1.5 border border-teal-300/40">
          <Trash2 className="w-3.5 h-3.5 text-teal-400" />
          <span>Click floating trash to skim and remove it!</span>
        </div>
      </div>

      {/* 3-Stage Bio-Filter Builder */}
      <div className="mt-4 w-full bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <h4 className="text-xs font-black uppercase text-slate-700 tracking-wider mb-2.5 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-500" />
          Assemble Multi-Layer River Bio-Filter
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <button
            onClick={() => handleToggleFilter('sand')}
            className={`p-3 rounded-xl border flex items-center gap-2.5 text-left cursor-pointer transition-all ${
              filterLayers.sand
                ? 'bg-amber-100 border-amber-300 text-amber-950 font-bold shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-amber-50'
            }`}
          >
            <span className="text-xl">🏖️</span>
            <div>
              <span className="text-xs font-extrabold block">1. Fine Sand Layer</span>
              <span className="text-[10px] text-slate-500">Traps tiny particulate debris</span>
            </div>
          </button>

          <button
            onClick={() => handleToggleFilter('gravel')}
            className={`p-3 rounded-xl border flex items-center gap-2.5 text-left cursor-pointer transition-all ${
              filterLayers.gravel
                ? 'bg-stone-200 border-stone-400 text-stone-950 font-bold shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-stone-50'
            }`}
          >
            <span className="text-xl">🪨</span>
            <div>
              <span className="text-xs font-extrabold block">2. Coarse Gravel</span>
              <span className="text-[10px] text-slate-500">Catches leaves & weeds</span>
            </div>
          </button>

          <button
            onClick={() => handleToggleFilter('charcoal')}
            className={`p-3 rounded-xl border flex items-center gap-2.5 text-left cursor-pointer transition-all ${
              filterLayers.charcoal
                ? 'bg-slate-800 border-slate-900 text-white font-bold shadow-xs'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <span className="text-xl">⬛</span>
            <div>
              <span className="text-xs font-extrabold block">3. Activated Charcoal</span>
              <span className="text-[10px] text-slate-400">Absorbs odors & toxins</span>
            </div>
          </button>
        </div>
      </div>

      {/* Completion Action */}
      <div className="mt-5 w-full flex justify-center">
        {allTrashCleaned && allFiltersBuilt ? (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleFinishCleaning}
            className="px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-extrabold text-sm rounded-2xl shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
            <span>River Pristine & Bio-Filtered! Continue!</span>
          </motion.button>
        ) : (
          <p className="text-xs text-slate-500 text-center">
            Remove all trash from the water and activate all 3 bio-filter layers!
          </p>
        )}
      </div>
    </div>
  );
};
