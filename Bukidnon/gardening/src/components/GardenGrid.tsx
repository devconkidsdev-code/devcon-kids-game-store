import React, { useState } from 'react';
import { SoilPlot, PlantDefinition, ToolType, WeatherType } from '../types';
import { PlantSvg } from './PlantSvg';
import { Droplet, Sparkles, PlusCircle, Lock, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
}

interface GardenGridProps {
  plots: SoilPlot[];
  plantsById: Record<string, PlantDefinition>;
  selectedTool: ToolType;
  selectedSeed: PlantDefinition | null;
  selectedSeedCount: number;
  currentWeather: WeatherType;
  playerCoins: number;
  playerLevel: number;
  onPlotClick: (plot: SoilPlot, e: React.MouseEvent) => void;
  onUnlockPlot: (plot: SoilPlot) => void;
  onWaterAll: () => void;
  onHarvestAll: () => void;
  onPlantAll: () => void;
}

export const GardenGrid: React.FC<GardenGridProps> = ({
  plots,
  plantsById,
  selectedTool,
  selectedSeed,
  selectedSeedCount,
  currentWeather,
  playerCoins,
  playerLevel,
  onPlotClick,
  onUnlockPlot,
  onWaterAll,
  onHarvestAll,
  onPlantAll,
}) => {
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);

  const readyHarvestCount = plots.filter((p) => p.unlocked && p.plantId && p.growthStage === 4).length;
  const dryPlotsCount = plots.filter((p) => p.unlocked && p.plantId && p.waterLevel <= 20 && p.growthStage < 4).length;
  const emptyPlotsCount = plots.filter((p) => p.unlocked && !p.plantId).length;

  return (
    <div className="relative w-full">
      {/* Quick Action Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 bg-emerald-950/40 p-2.5 rounded-2xl border border-emerald-800/30 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider pl-1">
            Garden Plots ({plots.filter(p => p.unlocked).length}/{plots.length})
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Quick Water All */}
          <button
            id="quick-water-all-btn"
            onClick={onWaterAll}
            disabled={dryPlotsCount === 0 && !plots.some(p => p.unlocked && p.waterLevel < 95)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:hover:bg-sky-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
          >
            <Droplet className="w-3.5 h-3.5 fill-sky-200" />
            <span>Water All</span>
            {dryPlotsCount > 0 && (
              <span className="bg-sky-400 text-sky-950 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {dryPlotsCount}
              </span>
            )}
          </button>

          {/* Quick Harvest All */}
          <button
            id="quick-harvest-all-btn"
            onClick={onHarvestAll}
            disabled={readyHarvestCount === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-emerald-500 hover:from-amber-400 hover:to-emerald-400 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95 cursor-pointer disabled:cursor-not-allowed"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-200 fill-amber-200" />
            <span>Harvest All</span>
            {readyHarvestCount > 0 && (
              <span className="bg-white text-emerald-900 text-[10px] px-1.5 py-0.2 rounded-full font-black">
                {readyHarvestCount}
              </span>
            )}
          </button>

          {/* Quick Plant All */}
          {selectedSeed && selectedSeedCount > 0 && emptyPlotsCount > 0 && (
            <button
              id="quick-plant-all-btn"
              onClick={onPlantAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <span>{selectedSeed.icon}</span>
              <span>Fill Empty ({Math.min(emptyPlotsCount, selectedSeedCount)})</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid of Plots */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
        {plots.map((plot) => {
          const plant = plot.plantId ? plantsById[plot.plantId] : null;
          const isDry = plot.waterLevel <= 0;
          const isGrowing = plot.plantId && plot.growthStage > 0 && plot.growthStage < 4;
          const isReady = plot.plantId && plot.growthStage === 4;

          if (!plot.unlocked) {
            const canAfford = playerCoins >= plot.unlockCost && playerLevel >= plot.unlockLevel;
            return (
              <div
                key={plot.id}
                id={`plot-locked-${plot.id}`}
                onClick={() => onUnlockPlot(plot)}
                className={`relative aspect-square rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-3 text-center transition-all ${
                  canAfford
                    ? 'border-amber-400/60 bg-amber-950/20 hover:bg-amber-950/40 hover:border-amber-400 cursor-pointer shadow-sm hover:scale-[1.02]'
                    : 'border-stone-700/50 bg-stone-900/30 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="w-9 h-9 rounded-full bg-stone-800/80 flex items-center justify-center mb-1.5 text-stone-400">
                  {canAfford ? <PlusCircle className="w-5 h-5 text-amber-400 animate-pulse" /> : <Lock className="w-4 h-4" />}
                </div>
                <span className="text-xs font-bold text-stone-300">Plot #{plot.id + 1}</span>
                <span className="text-[11px] font-semibold text-amber-400 mt-0.5">🪙 {plot.unlockCost}</span>
                <span className="text-[10px] text-stone-400">Lvl {plot.unlockLevel}</span>
              </div>
            );
          }

          return (
            <motion.div
              key={plot.id}
              id={`plot-${plot.id}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => onPlotClick(plot, e)}
              className={`relative aspect-square rounded-2xl border transition-all cursor-pointer select-none overflow-hidden flex flex-col justify-between p-2.5 ${
                isReady
                  ? 'bg-gradient-to-b from-emerald-950/80 to-amber-950/60 border-amber-400 shadow-lg shadow-amber-900/20 ring-2 ring-amber-400/40'
                  : isDry && isGrowing
                  ? 'bg-stone-900/80 border-amber-600/60 ring-1 ring-amber-500/30'
                  : 'bg-emerald-950/40 border-emerald-800/40 hover:border-emerald-500/60'
              }`}
            >
              {/* Plot Header Status */}
              <div className="flex items-center justify-between w-full z-10">
                <span className="text-[10px] font-bold text-stone-400 px-1.5 py-0.5 bg-black/40 rounded-md">
                  #{plot.id + 1}
                </span>

                {/* Moisture Water Indicator */}
                {plot.plantId && (
                  <div
                    className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-xs ${
                      plot.waterLevel > 40
                        ? 'bg-sky-950/80 text-sky-300 border border-sky-600/30'
                        : plot.waterLevel > 0
                        ? 'bg-amber-950/80 text-amber-300 border border-amber-600/30'
                        : 'bg-rose-950/80 text-rose-300 border border-rose-600/40 animate-pulse'
                    }`}
                  >
                    <Droplet className={`w-2.5 h-2.5 ${plot.waterLevel > 0 ? 'fill-sky-400 text-sky-400' : 'text-rose-400'}`} />
                    <span>{Math.round(plot.waterLevel)}%</span>
                  </div>
                )}
              </div>

              {/* Center Plant SVG / Soil Graphics */}
              <div className="relative flex-1 flex items-center justify-center my-1">
                <PlantSvg
                  plant={plant}
                  stage={plot.growthStage}
                  growthProgress={plot.growthProgress}
                  isGoldenReady={plot.isGoldenReady}
                  isWatered={plot.waterLevel > 0}
                />

                {/* Fertilized Glow Badge */}
                {plot.fertilized && (
                  <div className="absolute top-0 right-0 p-1 bg-amber-500 text-amber-950 rounded-full shadow-sm">
                    <Zap className="w-2.5 h-2.5 fill-amber-950" />
                  </div>
                )}

                {/* Needs Water Warning Badge */}
                {isDry && isGrowing && (
                  <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-[1px] rounded-xl flex flex-col items-center justify-center p-1 text-center animate-pulse">
                    <Droplet className="w-5 h-5 text-rose-400 fill-rose-500/50 mb-0.5" />
                    <span className="text-[10px] font-black text-rose-200">Needs Water!</span>
                  </div>
                )}
              </div>

              {/* Bottom Plant Info & Progress Bar */}
              <div className="w-full z-10">
                {plant ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-stone-200 truncate max-w-[80px]">
                        {plant.name}
                      </span>
                      <span className="text-[10px] font-semibold text-emerald-400">
                        {isReady ? '100%' : `${Math.round(plot.growthProgress)}%`}
                      </span>
                    </div>

                    {/* Growth Bar */}
                    <div className="w-full bg-stone-800/90 h-1.5 rounded-full overflow-hidden border border-stone-700/50">
                      <div
                        className={`h-full transition-all duration-300 rounded-full ${
                          isReady
                            ? 'bg-gradient-to-r from-amber-400 to-emerald-400'
                            : isDry
                            ? 'bg-amber-600'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${plot.growthProgress}%` }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-1">
                    <span className="text-[10px] font-semibold text-stone-400 flex items-center justify-center gap-1">
                      {selectedSeed ? `Tap to plant ${selectedSeed.icon}` : 'Empty Soil'}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
