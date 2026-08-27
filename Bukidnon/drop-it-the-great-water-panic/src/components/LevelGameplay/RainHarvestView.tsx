import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CloudRain, CheckCircle2, Sparkles } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface RainHarvestViewProps {
  levelId: number;
  objectiveText: string;
  onSuccess: (stats: { waterSaved: number; rainwaterCollected: number }) => void;
}

interface RainBarrel {
  id: number;
  label: string;
  hasGutter: boolean;
  collectedLitres: number;
  maxLitres: number;
}

export const RainHarvestView: React.FC<RainHarvestViewProps> = ({
  levelId,
  objectiveText,
  onSuccess,
}) => {
  const [barrels, setBarrels] = useState<RainBarrel[]>([
    { id: 1, label: 'Town Hall Roof Downspout', hasGutter: false, collectedLitres: 0, maxLitres: 300 },
    { id: 2, label: 'Bakery Clay Tile Gutter', hasGutter: false, collectedLitres: 0, maxLitres: 250 },
    { id: 3, label: 'Schoolhouse Cistern', hasGutter: false, collectedLitres: 0, maxLitres: 350 },
    { id: 4, label: 'Barn Tin Roof Collector', hasGutter: false, collectedLitres: 0, maxLitres: 400 },
  ]);

  const [isRaining, setIsRaining] = useState(false);
  const [totalCollected, setTotalCollected] = useState(0);

  const handleConnectGutter = (barrelId: number) => {
    soundManager.playRepair();
    setBarrels((prev) =>
      prev.map((b) => (b.id === barrelId ? { ...b, hasGutter: true } : b))
    );
  };

  const handleStartStorm = () => {
    setIsRaining(true);
    soundManager.playSplash();

    // Fill barrels over time
    const interval = setInterval(() => {
      setBarrels((prev) => {
        let allFull = true;
        let sum = 0;
        const next = prev.map((b) => {
          if (!b.hasGutter) return b;
          const nextVal = Math.min(b.maxLitres, b.collectedLitres + 35);
          if (nextVal < b.maxLitres) allFull = false;
          sum += nextVal;
          return { ...b, collectedLitres: nextVal };
        });

        setTotalCollected(sum);

        if (allFull && next.every((b) => b.hasGutter)) {
          clearInterval(interval);
          soundManager.playVictory();
          setTimeout(() => {
            onSuccess({ waterSaved: 1200 + levelId * 30, rainwaterCollected: sum });
          }, 1500);
        }
        return next;
      });
    }, 300);
  };

  const allGuttersConnected = barrels.every((b) => b.hasGutter);

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-3xl border border-sky-100 shadow-md">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4 bg-sky-50 p-3.5 rounded-2xl border border-sky-200">
        <div>
          <span className="text-[11px] uppercase font-bold text-sky-700 tracking-wider">
            Rooftop Rainwater Harvesting
          </span>
          <p className="text-xs sm:text-sm font-bold text-slate-800">{objectiveText}</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-slate-500 font-bold uppercase">Sky Water Harvested</span>
          <span className="text-sm font-extrabold text-sky-700">{totalCollected} Litres</span>
        </div>
      </div>

      {/* Rain Storm Simulation Banner */}
      <div className="relative w-full aspect-video max-h-[260px] bg-gradient-to-b from-slate-700 via-sky-800 to-indigo-900 rounded-2xl border-4 border-slate-700 overflow-hidden flex flex-col items-center justify-center p-4 text-white">
        <CloudRain className={`w-16 h-16 text-sky-300 ${isRaining ? 'animate-bounce' : ''}`} />
        <h3 className="text-sm sm:text-base font-extrabold mt-2">
          {isRaining ? 'Storm Passing! Barrels Filling with Pristine Rain!' : 'Storm Approaching from the Mountains!'}
        </h3>
        <p className="text-xs text-sky-200 mt-0.5">
          {allGuttersConnected ? 'All gutters ready!' : 'Connect downspouts before opening the storm valves!'}
        </p>
      </div>

      {/* Rain Barrel Network */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full mt-4">
        {barrels.map((barrel) => {
          const fillPercent = (barrel.collectedLitres / barrel.maxLitres) * 100;
          return (
            <div
              key={barrel.id}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <span className="text-3xl">🛢️</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">{barrel.label}</h4>
                  <div className="w-28 bg-slate-200 h-2 rounded-full overflow-hidden mt-1">
                    <div className="h-full bg-sky-500 transition-all" style={{ width: `${fillPercent}%` }} />
                  </div>
                  <span className="text-[10px] text-slate-500 font-bold">
                    {barrel.collectedLitres} / {barrel.maxLitres} L
                  </span>
                </div>
              </div>

              {barrel.hasGutter ? (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Gutter Ready
                </span>
              ) : (
                <button
                  onClick={() => handleConnectGutter(barrel.id)}
                  className="px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition"
                >
                  Connect Gutter
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Button */}
      <div className="mt-5 w-full flex justify-center">
        {!isRaining ? (
          <button
            onClick={handleStartStorm}
            disabled={!allGuttersConnected}
            className={`px-6 py-3 rounded-2xl font-extrabold text-sm shadow-lg flex items-center gap-2 transition cursor-pointer ${
              allGuttersConnected
                ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white hover:scale-105'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <CloudRain className="w-5 h-5" />
            <span>Open Rain Catchment Valves!</span>
          </button>
        ) : (
          <div className="text-xs text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200">
            Harvesting raindrops at maximum efficiency...
          </div>
        )}
      </div>
    </div>
  );
};
