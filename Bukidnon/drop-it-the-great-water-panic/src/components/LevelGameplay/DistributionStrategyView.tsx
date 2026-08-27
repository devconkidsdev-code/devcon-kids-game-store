import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Heart, Apple, Smile, AlertCircle, CheckCircle2 } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface DistributionStrategyViewProps {
  levelId: number;
  objectiveText: string;
  onSuccess: (stats: { waterSaved: number; leaksFixed: number }) => void;
  onFail: (reason: string) => void;
}

export const DistributionStrategyView: React.FC<DistributionStrategyViewProps> = ({
  levelId,
  objectiveText,
  onSuccess,
  onFail,
}) => {
  const TOTAL_AVAILABLE = 500;

  const [allocations, setAllocations] = useState({
    clinic: 120,
    homes: 140,
    animals: 90,
    crops: 100,
    reserve: 50,
  });

  const [simulated, setSimulated] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const currentTotal =
    allocations.clinic + allocations.homes + allocations.animals + allocations.crops + allocations.reserve;
  const isBalanced = currentTotal === TOTAL_AVAILABLE;

  const handleSliderChange = (key: keyof typeof allocations, val: number) => {
    soundManager.playDrop(400 + val);
    setAllocations((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleExecuteDay = () => {
    if (currentTotal > TOTAL_AVAILABLE) {
      soundManager.playPanic();
      setFeedback('You allocated more water than is available in the Big Blue Tank!');
      return;
    }

    if (allocations.clinic < 100) {
      soundManager.playPanic();
      setFeedback('Clinic water is dangerously low! Patients and sanitization need at least 100L.');
      return;
    }

    if (allocations.homes < 100) {
      soundManager.playPanic();
      setFeedback('Villagers do not have enough clean water to drink and cook! Allocate at least 100L to Homes.');
      return;
    }

    soundManager.playVictory();
    setSimulated(true);
    setFeedback('Perfect balance! Clinic is secure, villagers are hydrated, crops are watered, and reserve is maintained!');

    setTimeout(() => {
      onSuccess({ waterSaved: 400 + levelId * 25, leaksFixed: 1 });
    }, 1800);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-3xl border border-sky-100 shadow-md">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4 bg-amber-50 p-3.5 rounded-2xl border border-amber-200">
        <div>
          <span className="text-[11px] uppercase font-bold text-amber-700 tracking-wider">
            Water Budgeting & Distribution
          </span>
          <p className="text-xs sm:text-sm font-bold text-slate-800">{objectiveText}</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-slate-500 font-bold uppercase">Budget</span>
          <span
            className={`text-sm sm:text-base font-extrabold ${
              currentTotal > TOTAL_AVAILABLE ? 'text-red-500 animate-pulse' : 'text-slate-800'
            }`}
          >
            {currentTotal} / {TOTAL_AVAILABLE} L
          </span>
        </div>
      </div>

      {/* Weather Hazard Banner */}
      <div className="w-full mb-4 p-3 bg-orange-100/70 border border-orange-300 rounded-2xl flex items-center gap-3 text-orange-950 text-xs">
        <span className="text-2xl">☀️</span>
        <div>
          <span className="font-extrabold">Professor Croak’s Forecast:</span>
          <p className="text-orange-800">
            Heatwave warning! Maintain at least 50L in Emergency Reserve to buffer midday evaporation!
          </p>
        </div>
      </div>

      {/* Allocation Sliders */}
      <div className="w-full space-y-3.5">
        {/* Clinic */}
        <div className="p-3.5 bg-rose-50/70 rounded-2xl border border-rose-200 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏥</span>
              <div>
                <span className="text-xs font-bold text-rose-950">Village Clinic & Sanitization</span>
                <span className="text-[10px] text-rose-700 block">Min required: 100 L</span>
              </div>
            </div>
            <span className="text-xs font-black text-rose-900 bg-white px-2.5 py-1 rounded-lg border border-rose-200">
              {allocations.clinic} L
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            step="10"
            value={allocations.clinic}
            onChange={(e) => handleSliderChange('clinic', Number(e.target.value))}
            className="w-full accent-rose-500 cursor-pointer"
          />
        </div>

        {/* Homes */}
        <div className="p-3.5 bg-sky-50/70 rounded-2xl border border-sky-200 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏡</span>
              <div>
                <span className="text-xs font-bold text-sky-950">Village Homes & Drinking</span>
                <span className="text-[10px] text-sky-700 block">Min required: 100 L</span>
              </div>
            </div>
            <span className="text-xs font-black text-sky-900 bg-white px-2.5 py-1 rounded-lg border border-sky-200">
              {allocations.homes} L
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="250"
            step="10"
            value={allocations.homes}
            onChange={(e) => handleSliderChange('homes', Number(e.target.value))}
            className="w-full accent-sky-500 cursor-pointer"
          />
        </div>

        {/* Animals */}
        <div className="p-3.5 bg-amber-50/70 rounded-2xl border border-amber-200 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🐮</span>
              <div>
                <span className="text-xs font-bold text-amber-950">Moo-Moo & Animal Troughs</span>
                <span className="text-[10px] text-amber-700 block">Keeps animals healthy</span>
              </div>
            </div>
            <span className="text-xs font-black text-amber-900 bg-white px-2.5 py-1 rounded-lg border border-amber-200">
              {allocations.animals} L
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="150"
            step="10"
            value={allocations.animals}
            onChange={(e) => handleSliderChange('animals', Number(e.target.value))}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>

        {/* Crops */}
        <div className="p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-200 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🌾</span>
              <div>
                <span className="text-xs font-bold text-emerald-950">Farmland & Orchards</span>
                <span className="text-[10px] text-emerald-700 block">Grows village food supply</span>
              </div>
            </div>
            <span className="text-xs font-black text-emerald-900 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
              {allocations.crops} L
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            step="10"
            value={allocations.crops}
            onChange={(e) => handleSliderChange('crops', Number(e.target.value))}
            className="w-full accent-emerald-500 cursor-pointer"
          />
        </div>

        {/* Reserve */}
        <div className="p-3.5 bg-indigo-50/70 rounded-2xl border border-indigo-200 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🛡️</span>
              <div>
                <span className="text-xs font-bold text-indigo-950">Emergency Reserve (Tank Cushion)</span>
                <span className="text-[10px] text-indigo-700 block">Protects against sudden droughts</span>
              </div>
            </div>
            <span className="text-xs font-black text-indigo-900 bg-white px-2.5 py-1 rounded-lg border border-indigo-200">
              {allocations.reserve} L
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="150"
            step="10"
            value={allocations.reserve}
            onChange={(e) => handleSliderChange('reserve', Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>
      </div>

      {/* Feedback Message */}
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-4 p-3 rounded-2xl text-xs font-bold flex items-center gap-2 w-full ${
            simulated
              ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              : 'bg-red-100 text-red-900 border border-red-300'
          }`}
        >
          {simulated ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
          <span>{feedback}</span>
        </motion.div>
      )}

      {/* Confirm & Execute Button */}
      <div className="mt-5 w-full flex justify-center">
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleExecuteDay}
          disabled={simulated}
          className="px-6 py-3 bg-gradient-to-r from-amber-500 to-emerald-600 text-white font-extrabold text-sm rounded-2xl shadow-lg flex items-center gap-2 cursor-pointer"
        >
          <ShieldCheck className="w-5 h-5" />
          <span>Confirm Daily Water Distribution!</span>
        </motion.button>
      </div>
    </div>
  );
};
