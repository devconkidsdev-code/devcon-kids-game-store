import React from 'react';
import { CROPS } from '../data/crops';
import { PlotData } from '../types';

interface PlantPlotProps {
  plot: PlotData;
  isFarmerNear: boolean;
  onPlotClick: (plotId: number) => void;
  onPestClick: (plotId: number, e: React.MouseEvent) => void;
}

export const PlantPlot: React.FC<PlantPlotProps> = ({
  plot,
  isFarmerNear,
  onPlotClick,
  onPestClick,
}) => {
  const crop = CROPS[plot.cropId] || CROPS.carrot;
  const isReady = plot.stage === 3;
  const isDangerouslyDry = plot.moisture < 20 && !plot.isDead;
  const isWithering = plot.isWithered && !plot.isDead;

  // Visual soil style based on moisture
  let soilBg = 'bg-amber-900 border-amber-950'; // standard damp
  if (plot.moisture > 60) {
    soilBg = 'bg-stone-900 border-stone-950 shadow-inner'; // deep moist rich dark
  } else if (plot.moisture < 25) {
    soilBg = 'bg-amber-800/90 border-amber-700/80'; // parched dry
  }

  // Plant scale based on growth and withering
  let plantScale = 0.5 + (plot.growthProgress / 100) * 0.6; // 0.5 to 1.1
  if (isWithering) {
    plantScale = Math.max(0.35, plantScale * 0.75); // visibly shrink when withering!
  }

  return (
    <div
      id={`plot-${plot.id}`}
      onClick={() => onPlotClick(plot.id)}
      className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 flex flex-col items-center justify-between p-1.5 cursor-pointer transition-all duration-200 select-none shadow-md ${soilBg} ${
        isFarmerNear ? 'ring-4 ring-emerald-400/90 scale-105 shadow-xl' : 'hover:scale-[1.02]'
      } ${isWithering ? 'ring-2 ring-red-500 animate-pulse' : ''} ${
        isReady ? 'ring-4 ring-amber-400 shadow-amber-400/50' : ''
      }`}
    >
      {/* Dirt Texture / cracks */}
      <div className="absolute inset-0 rounded-xl opacity-30 pointer-events-none overflow-hidden">
        {plot.moisture < 30 && (
          <svg className="w-full h-full text-amber-950" viewBox="0 0 100 100">
            <path d="M15 20 L35 45 L50 35 L70 65" stroke="currentColor" strokeWidth="1.5" fill="none" />
            <path d="M80 15 L60 30 L75 55" stroke="currentColor" strokeWidth="1.2" fill="none" />
            <path d="M30 75 L45 85 L20 95" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        )}
        {plot.moisture > 60 && (
          <div className="absolute inset-0 bg-blue-900/10 pointer-events-none" />
        )}
      </div>

      {/* Top Status Indicators (Pest / Warning / Ready Tag) */}
      <div className="w-full flex items-center justify-between z-10">
        {/* Stage / Ready badge */}
        {isReady ? (
          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-400 text-stone-900 rounded-md shadow-xs animate-bounce">
            READY! 🧺
          </span>
        ) : isDangerouslyDry ? (
          <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-600 text-white rounded-md shadow-xs animate-pulse flex items-center gap-0.5">
            <span>🔥</span> SHRINKING
          </span>
        ) : (
          <span className="text-[10px] font-semibold text-emerald-200/90 bg-emerald-950/60 px-1.5 py-0.2 rounded-md">
            {Math.round(plot.growthProgress)}%
          </span>
        )}

        {/* Pest (Garden Beetle) if present */}
        {plot.pestPresent && (
          <button
            onClick={(e) => onPestClick(plot.id, e)}
            className="text-base sm:text-lg animate-bounce hover:scale-125 transition-transform bg-red-500/80 rounded-full p-0.5 shadow-md"
            title="Click to shoo pest!"
          >
            🪲
          </button>
        )}
      </div>

      {/* Center Plant Graphic */}
      <div className="relative flex-1 flex items-center justify-center">
        {plot.isDead ? (
          // Dead Withered Dry Twig
          <div className="flex flex-col items-center">
            <span className="text-2xl sm:text-3xl opacity-60 grayscale">🥀</span>
            <span className="text-[9px] text-red-300 font-bold bg-red-950/90 px-1 rounded-sm mt-0.5">
              WITHERED
            </span>
          </div>
        ) : (
          <div
            className="flex flex-col items-center transition-all duration-300 transform"
            style={{
              transform: `scale(${plantScale})`,
              filter: isWithering ? 'sepia(0.6) hue-rotate(-30deg)' : 'none',
            }}
          >
            {plot.stage === 0 && (
              // Seed Mound
              <div className="flex flex-col items-center">
                <div className="w-4 h-2 bg-stone-700 rounded-full border border-stone-600" />
                <div className="w-1.5 h-3 bg-lime-500 rounded-t-full -mt-1 animate-pulse" />
              </div>
            )}

            {plot.stage === 1 && (
              // Young Sprout
              <div className="flex flex-col items-center">
                <span className="text-2xl sm:text-3xl filter drop-shadow-sm">🌱</span>
              </div>
            )}

            {plot.stage === 2 && (
              // Growing Plant with Small Bud
              <div className="flex flex-col items-center relative">
                <span className="text-2xl sm:text-3xl">{crop.emoji}</span>
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-lime-400 rounded-full animate-ping" />
              </div>
            )}

            {plot.stage === 3 && (
              // Mature Harvestable Plant
              <div className="flex flex-col items-center relative group">
                <span className="text-3xl sm:text-4xl animate-pulse filter drop-shadow-md">
                  {crop.emoji}
                </span>
                <span className="absolute -top-2 -right-2 text-xs">✨</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Moisture Bar */}
      <div className="w-full z-10 flex flex-col gap-0.5">
        <div className="flex items-center justify-between text-[9px] text-stone-300 font-semibold px-0.5">
          <span className="flex items-center gap-0.5">
            <span>💧</span>
            <span className={plot.moisture < 25 ? 'text-red-400 font-bold animate-pulse' : ''}>
              {Math.round(plot.moisture)}%
            </span>
          </span>
          <span className="text-[8px] text-amber-200/70">{crop.name}</span>
        </div>

        {/* Moisture Fill Bar */}
        <div className="w-full h-1.5 sm:h-2 bg-stone-950/80 rounded-full overflow-hidden border border-stone-800">
          <div
            className={`h-full rounded-full transition-all duration-150 ${
              plot.moisture > 50
                ? 'bg-gradient-to-r from-sky-500 to-cyan-400'
                : plot.moisture > 25
                ? 'bg-gradient-to-r from-yellow-500 to-amber-400'
                : 'bg-gradient-to-r from-red-600 to-red-400 animate-pulse'
            }`}
            style={{ width: `${Math.max(0, Math.min(100, plot.moisture))}%` }}
          />
        </div>
      </div>

      {/* Floating Wither Warning Icon */}
      {isWithering && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow-lg border border-white animate-bounce flex items-center gap-0.5">
          <span>⚠️</span>
          <span>SHRINKING!</span>
        </div>
      )}
    </div>
  );
};
