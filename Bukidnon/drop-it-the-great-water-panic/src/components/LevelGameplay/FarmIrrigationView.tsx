import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sprout, Droplets, CheckCircle2, AlertTriangle } from 'lucide-react';
import { soundManager } from '../../utils/audio';

interface FarmIrrigationViewProps {
  levelId: number;
  objectiveText: string;
  onSuccess: (stats: { waterSaved: number; cropsSaved: number }) => void;
}

interface CropPlot {
  id: number;
  cropName: string;
  icon: string;
  hasDripLine: boolean;
  moisturePercent: number; // 0-100% (target is 70-90%)
  health: 'dry' | 'optimal' | 'flooded';
}

export const FarmIrrigationView: React.FC<FarmIrrigationViewProps> = ({
  levelId,
  objectiveText,
  onSuccess,
}) => {
  const [plots, setPlots] = useState<CropPlot[]>([
    { id: 1, cropName: 'Sweet Carrots', icon: '🥕', hasDripLine: false, moisturePercent: 20, health: 'dry' },
    { id: 2, cropName: 'Crisp Lettuce', icon: '🥬', hasDripLine: false, moisturePercent: 30, health: 'dry' },
    { id: 3, cropName: 'Sun Tomatoes', icon: '🍅', hasDripLine: false, moisturePercent: 15, health: 'dry' },
    { id: 4, cropName: 'Golden Sorghum', icon: '🌾', hasDripLine: false, moisturePercent: 25, health: 'dry' },
    { id: 5, cropName: 'Ruby Strawberries', icon: '🍓', hasDripLine: false, moisturePercent: 35, health: 'dry' },
    { id: 6, cropName: 'Sweet Corn', icon: '🌽', hasDripLine: false, moisturePercent: 10, health: 'dry' },
  ]);

  const [waterUsed, setWaterUsed] = useState(0);

  const handleInstallDrip = (plotId: number) => {
    soundManager.playRepair();
    setPlots((prev) =>
      prev.map((plot) => {
        if (plot.id !== plotId) return plot;
        const newMoisture = Math.min(85, plot.moisturePercent + 55);
        return {
          ...plot,
          hasDripLine: true,
          moisturePercent: newMoisture,
          health: newMoisture >= 60 && newMoisture <= 90 ? 'optimal' : newMoisture > 90 ? 'flooded' : 'dry',
        };
      })
    );
    setWaterUsed((w) => w + 20); // Drip uses only 20L per crop!
  };

  const allOptimal = plots.every((p) => p.hasDripLine && p.health === 'optimal');

  const handleHarvestSuccess = () => {
    soundManager.playVictory();
    setTimeout(() => {
      onSuccess({ waterSaved: 800 + levelId * 25, cropsSaved: 6 });
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 sm:p-6 bg-white rounded-3xl border border-sky-100 shadow-md">
      {/* Header */}
      <div className="w-full flex items-center justify-between mb-4 bg-lime-50 p-3.5 rounded-2xl border border-lime-200">
        <div>
          <span className="text-[11px] uppercase font-bold text-lime-800 tracking-wider">
            Precision Drip Irrigation
          </span>
          <p className="text-xs sm:text-sm font-bold text-slate-800">{objectiveText}</p>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-slate-500 font-bold uppercase">Water Efficiency</span>
          <span className="text-sm font-extrabold text-lime-700">95% (Drip Emitters)</span>
        </div>
      </div>

      {/* Farm Plots Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
        {plots.map((plot) => (
          <div
            key={plot.id}
            className={`p-3.5 rounded-2xl border-2 transition-all flex flex-col justify-between ${
              plot.health === 'optimal'
                ? 'bg-emerald-50/80 border-emerald-300 shadow-xs'
                : 'bg-amber-50/70 border-amber-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-3xl">{plot.icon}</span>
              <span
                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                  plot.health === 'optimal'
                    ? 'bg-emerald-200 text-emerald-900'
                    : 'bg-amber-200 text-amber-900'
                }`}
              >
                {plot.health === 'optimal' ? 'Optimal Moisture' : 'Needs Water'}
              </span>
            </div>

            <div className="my-2">
              <h4 className="text-xs font-extrabold text-slate-800">{plot.cropName}</h4>
              {/* Moisture Meter */}
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1.5">
                <div
                  className={`h-full rounded-full transition-all ${
                    plot.health === 'optimal' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ width: `${plot.moisturePercent}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 font-bold block mt-0.5">
                Soil Moisture: {plot.moisturePercent}% (Target: 70-85%)
              </span>
            </div>

            {plot.hasDripLine ? (
              <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold bg-white/80 p-2 rounded-xl border border-emerald-200">
                <Droplets className="w-4 h-4 text-sky-500" />
                <span>Micro-Drip Active</span>
              </div>
            ) : (
              <button
                onClick={() => handleInstallDrip(plot.id)}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-1 cursor-pointer transition"
              >
                <Sprout className="w-3.5 h-3.5" />
                <span>Install Drip Line</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Completion Button */}
      <div className="mt-5 w-full flex justify-center">
        {allOptimal ? (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleHarvestSuccess}
            className="px-6 py-3 bg-gradient-to-r from-lime-600 to-emerald-600 text-white font-extrabold text-sm rounded-2xl shadow-lg flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-200" />
            <span>Crops Thriving with Minimum Water! Complete!</span>
          </motion.button>
        ) : (
          <p className="text-xs text-slate-500 text-center">
            Install precision drip lines on all 6 crop patches to achieve optimal soil moisture!
          </p>
        )}
      </div>
    </div>
  );
};
