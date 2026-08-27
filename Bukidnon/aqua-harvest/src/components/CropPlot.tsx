import React from 'react';
import { Crop } from '../types';
import { CROP_TYPES } from '../utils/levels';

interface CropPlotProps {
  crop: Crop;
  index: number;
  isActive: boolean;
  onPlotClick?: () => void;
}

export const CropPlot: React.FC<CropPlotProps> = ({ crop, index, isActive, onPlotClick }) => {
  const cropInfo = CROP_TYPES.find((c) => c.type === crop.type) || CROP_TYPES[0];
  
  // Moisture classification
  const isParched = crop.moisture < 15;
  const isDry = crop.moisture >= 15 && crop.moisture <= 32;
  const isNeedsWater = crop.moisture <= 32;
  const isOptimal = crop.moisture > 32 && crop.moisture <= 72;
  const isWet = crop.moisture > 72;

  // Plant scale & posture based on moisture
  let plantScale = 'scale-100';
  let plantFilter = '';
  if (isParched) {
    plantScale = 'scale-75 translate-y-2 rotate-6 opacity-75';
    plantFilter = 'saturate-50 brightness-90';
  } else if (isDry) {
    plantScale = 'scale-90 translate-y-1 -rotate-3 opacity-90';
    plantFilter = 'saturate-75';
  } else if (isOptimal) {
    plantScale = 'scale-105 -translate-y-1';
  } else if (isWet) {
    plantScale = 'scale-100';
  }

  // Soil styling based on moisture in Frosted Glass theme
  let soilBg = 'bg-stone-900/90 border-white/20';
  if (isParched) {
    soilBg = 'bg-amber-950/80 border-amber-500/40 shadow-inner';
  } else if (isDry) {
    soilBg = 'bg-stone-900/85 border-amber-600/30';
  } else if (isOptimal) {
    soilBg = 'bg-stone-950/90 border-white/20';
  } else if (isWet) {
    soilBg = 'bg-[#0f241a]/95 border-cyan-500/40 shadow-lg';
  }

  return (
    <div
      id={`crop-plot-${index}`}
      onClick={onPlotClick}
      className={`relative flex flex-col items-center justify-end h-48 sm:h-56 cursor-pointer select-none transition-all duration-200 ${
        isActive ? 'ring-4 ring-yellow-300/90 ring-offset-2 ring-offset-transparent rounded-3xl shadow-[0_0_25px_rgba(253,224,71,0.5)]' : ''
      }`}
    >
      {/* Thirst / Status Frosted Glass Bubble Indicator */}
      <div className="absolute top-0 z-20 flex flex-col items-center">
        {isNeedsWater && (
          <div className="animate-bounce flex flex-col items-center">
            <div className={`px-2.5 py-1 rounded-full text-[11px] font-black text-white shadow-lg flex items-center gap-1 backdrop-blur-md border ${
              isParched 
                ? 'bg-rose-500/40 border-rose-400/80 animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.6)]' 
                : 'bg-amber-500/40 border-amber-300/80 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
            }`}>
              <span className="text-sm">💧</span>
              <span className="whitespace-nowrap tracking-wide">{isParched ? 'CRITICAL!' : 'WATER ME'}</span>
            </div>
            <div className={`w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 ${
              isParched ? 'border-t-rose-500/60' : 'border-t-amber-500/60'
            }`} />
          </div>
        )}

        {isWet && (
          <div className="flex flex-col items-center">
            <div className="px-2.5 py-1 rounded-full text-[10px] font-black text-cyan-100 bg-cyan-500/35 backdrop-blur-md border border-cyan-400/70 shadow-[0_0_12px_rgba(6,182,212,0.4)] flex items-center gap-1">
              <span>⚠️</span>
              <span className="whitespace-nowrap tracking-wide">WET! NO WATER</span>
            </div>
            <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-cyan-500/50" />
          </div>
        )}

        {isOptimal && (
          <div className="flex flex-col items-center opacity-85 hover:opacity-100 transition-opacity">
            <div className="px-2.5 py-0.5 rounded-full text-[10px] font-black text-emerald-100 bg-emerald-500/25 backdrop-blur-md border border-emerald-400/50 shadow-xs flex items-center gap-1">
              <span>🌿</span>
              <span className="tracking-wide">GROWING</span>
            </div>
          </div>
        )}

        {/* Temporary floating feedback text if present */}
        {crop.statusText && (
          <div className="absolute -top-6 bg-white/20 backdrop-blur-xl text-yellow-300 text-xs font-black px-2.5 py-1 rounded-xl border border-yellow-300/80 shadow-2xl whitespace-nowrap animate-fade-in">
            {crop.statusText}
          </div>
        )}
      </div>

      {/* Special Golden Aura if Golden Crop */}
      {crop.isGolden && (
        <div className="absolute inset-x-2 top-8 bottom-12 rounded-full bg-yellow-400/35 blur-lg animate-pulse pointer-events-none" />
      )}

      {/* Crop Plant Visual Representation */}
      <div className={`relative z-10 flex flex-col items-center mb-1 transition-all duration-300 transform ${plantScale} ${plantFilter}`}>
        {/* Render Plant Graphic */}
        <div className="relative flex items-center justify-center">
          {/* Main Plant Emoji / Visual Asset */}
          <span className="text-4xl sm:text-5xl md:text-6xl drop-shadow-lg select-none">
            {cropInfo.icon}
          </span>

          {/* Golden Star for Bonus Crop */}
          {crop.isGolden && (
            <span className="absolute -top-2 -right-2 text-xl animate-spin">
              ✨
            </span>
          )}

          {/* Dewdrops if Wet */}
          {isWet && (
            <div className="absolute -bottom-1 flex space-x-2">
              <span className="text-xs text-cyan-300 animate-ping">💦</span>
              <span className="text-xs text-sky-200">💧</span>
            </div>
          )}

          {/* Dry Smoke/Dust if Parched */}
          {isParched && (
            <div className="absolute -bottom-2 text-xs text-amber-300 animate-pulse opacity-80">
              💨
            </div>
          )}
        </div>

        {/* Crop Name Frosted Glass Label */}
        <span className="text-[10px] sm:text-[11px] font-black text-white bg-white/15 backdrop-blur-md border border-white/25 px-2 py-0.5 rounded-lg mt-0.5 shadow-sm whitespace-nowrap">
          {cropInfo.name.split(' ')[0]}
        </span>
      </div>

      {/* Soil Plot Mound Box - Frosted Glass Container */}
      <div className={`w-full max-w-[110px] sm:max-w-[130px] h-14 sm:h-16 rounded-t-3xl border-t-2 border-x border-white/20 backdrop-blur-md relative flex flex-col justify-end p-2 transition-colors duration-300 shadow-lg ${soilBg}`}>
        {/* Subtle ground lines */}
        <div className="absolute inset-0 opacity-15 pointer-events-none flex flex-col justify-around px-2">
          <div className="h-0.5 bg-white rounded-full w-3/4 mx-auto" />
          <div className="h-0.5 bg-white rounded-full w-1/2 mx-auto" />
        </div>

        {/* Moisture Level Percentage Gauge (Frosted Glass Capsule) */}
        <div className="relative w-full bg-black/50 backdrop-blur-sm rounded-full h-4 border border-white/20 overflow-hidden flex items-center p-0.5 shadow-inner">
          <div
            className={`h-full rounded-full transition-all duration-200 ${
              isParched
                ? 'bg-rose-500 animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.7)]'
                : isDry
                ? 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]'
                : isOptimal
                ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                : 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]'
            }`}
            style={{ width: `${Math.max(4, Math.min(100, crop.moisture))}%` }}
          />

          {/* Moisture % Text Overlay */}
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] tracking-tight">
            {Math.round(crop.moisture)}%
          </span>
        </div>

        {/* Plot Number Badge */}
        <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md text-white border border-white/30 text-[9px] font-black px-2 py-0.5 rounded-full shadow-md">
          #{index + 1}
        </div>
      </div>
    </div>
  );
};
