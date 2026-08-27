import React from 'react';
import { PlantDefinition } from '../types';

interface PlantSvgProps {
  plant?: PlantDefinition | null;
  stage: 0 | 1 | 2 | 3 | 4;
  growthProgress: number; // 0 to 100
  isGoldenReady?: boolean;
  isWatered: boolean;
}

export const PlantSvg: React.FC<PlantSvgProps> = ({
  plant,
  stage,
  growthProgress,
  isGoldenReady,
  isWatered,
}) => {
  if (!plant || stage === 0) {
    // Empty plot with tilled soil grooves
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full select-none" fill="none">
        <ellipse cx="50" cy="58" rx="36" ry="18" fill={isWatered ? '#3b2416' : '#5c3a21'} />
        <ellipse cx="50" cy="55" rx="30" ry="14" fill={isWatered ? '#2c1a0e' : '#4a2e19'} />
        {/* Furrows */}
        <path d="M 28 54 Q 50 62 72 54" stroke={isWatered ? '#1c1008' : '#3d2514'} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M 32 50 Q 50 56 68 50" stroke={isWatered ? '#1c1008' : '#3d2514'} strokeWidth="2" strokeLinecap="round" />
        <path d="M 34 58 Q 50 64 66 58" stroke={isWatered ? '#1c1008' : '#3d2514'} strokeWidth="2" strokeLinecap="round" />
        {/* Soil pebbles */}
        <circle cx="42" cy="53" r="1.5" fill="#8d5b36" opacity="0.6" />
        <circle cx="58" cy="56" r="1.8" fill="#8d5b36" opacity="0.6" />
        <circle cx="49" cy="60" r="1.2" fill="#8d5b36" opacity="0.6" />
      </svg>
    );
  }

  const primaryColor = plant.color.primary;
  const secondaryColor = plant.color.secondary;
  const foliageColor = plant.color.foliage;
  const glowColor = plant.color.glow || primaryColor;
  const isExoticOrLegendary = plant.tier === 'exotic' || plant.tier === 'legendary';

  return (
    <div className="relative w-full h-full flex items-center justify-center pointer-events-none">
      {/* Soil base */}
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
        <defs>
          <radialGradient id={`glow-${plant.id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={glowColor} stopOpacity="0.7" />
            <stop offset="100%" stopColor={glowColor} stopOpacity="0" />
          </radialGradient>

          <filter id={`filter-glow-${plant.id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Soil mound */}
        <ellipse cx="50" cy="72" rx="36" ry="16" fill={isWatered ? '#2f1b10' : '#4d2d18'} />
        <ellipse cx="50" cy="70" rx="30" ry="12" fill={isWatered ? '#24140a' : '#3f2412'} />
        <path d="M 28 69 Q 50 75 72 69" stroke={isWatered ? '#150a04' : '#2b170a'} strokeWidth="2" strokeLinecap="round" />

        {/* Stage 1: Seed planted */}
        {stage === 1 && (
          <g className="animate-pulse">
            <ellipse cx="50" cy="66" rx="5" ry="3.5" fill="#854d0e" />
            <ellipse cx="50" cy="65" rx="3.5" ry="2" fill="#ca8a04" />
            {isExoticOrLegendary && (
              <circle cx="50" cy="64" r="7" fill={`url(#glow-${plant.id})`} opacity="0.8" />
            )}
          </g>
        )}

        {/* Stage 2: Small Sprout */}
        {stage === 2 && (
          <g className="transition-transform duration-300">
            {/* Small stem */}
            <path d="M 50 68 Q 49 56 50 50" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" />
            {/* Left baby leaf */}
            <path d="M 50 55 C 42 53 38 46 42 43 C 46 40 49 48 50 55" fill="#22c55e" />
            {/* Right baby leaf */}
            <path d="M 50 52 C 58 50 62 43 58 40 C 54 37 51 45 50 52" fill="#4ade80" />
            {isExoticOrLegendary && (
              <circle cx="50" cy="46" r="10" fill={`url(#glow-${plant.id})`} opacity="0.6" />
            )}
          </g>
        )}

        {/* Stage 3: Growing / Bud Stage */}
        {stage === 3 && (
          <g className="transition-transform duration-300">
            {/* Main stem */}
            <path d="M 50 70 Q 48 48 50 38" stroke={foliageColor} strokeWidth="4" strokeLinecap="round" />
            {/* Lower foliage */}
            <path d="M 49 58 C 36 56 30 48 36 44 C 42 40 47 50 49 58" fill={foliageColor} />
            <path d="M 51 54 C 64 52 70 44 64 40 C 58 36 53 46 51 54" fill="#22c55e" />
            {/* Mid leaves */}
            <path d="M 49 46 C 40 43 38 35 43 32 C 48 30 50 38 49 46" fill={foliageColor} />
            {/* Flower / Crop Bud */}
            <circle cx="50" cy="36" r="6" fill={primaryColor} opacity="0.9" />
            <circle cx="50" cy="36" r="3.5" fill={secondaryColor} />
            {isExoticOrLegendary && (
              <circle cx="50" cy="36" r="14" fill={`url(#glow-${plant.id})`} opacity="0.7" />
            )}
          </g>
        )}

        {/* Stage 4: Mature Ready to Harvest */}
        {stage === 4 && (
          <g
            className="origin-bottom animate-bounce-subtle"
            filter={isExoticOrLegendary ? `url(#filter-glow-${plant.id})` : undefined}
          >
            {/* Specialized Flower & Crop Types */}
            {plant.flowerType === 'root' && (
              <>
                {/* Lush leafy green top */}
                <path d="M 50 62 Q 40 38 32 30 C 28 26 36 28 42 36 Q 48 44 49 58" fill={foliageColor} />
                <path d="M 50 62 Q 60 38 68 30 C 72 26 64 28 58 36 Q 52 44 51 58" fill="#16a34a" />
                <path d="M 50 60 Q 50 28 50 22 C 47 22 48 34 50 60" stroke="#4ade80" strokeWidth="2.5" />
                {/* Carrot / Radish root peeking through */}
                <path d="M 43 60 C 43 52 57 52 57 60 C 57 68 53 74 50 76 C 47 74 43 68 43 60 Z" fill={primaryColor} />
                <path d="M 46 59 Q 50 61 54 59" stroke={secondaryColor} strokeWidth="1.5" strokeLinecap="round" />
                <path d="M 45 64 Q 50 66 55 64" stroke={secondaryColor} strokeWidth="1.5" strokeLinecap="round" />
              </>
            )}

            {plant.flowerType === 'grain' && (
              <>
                {/* Golden wheat / corn stalks */}
                <path d="M 50 70 Q 46 45 48 24" stroke={foliageColor} strokeWidth="3" strokeLinecap="round" />
                <path d="M 50 70 Q 54 48 56 26" stroke={foliageColor} strokeWidth="2.5" strokeLinecap="round" />
                {/* Grain Ears */}
                <ellipse cx="48" cy="24" rx="5" ry="12" fill={primaryColor} />
                <ellipse cx="56" cy="26" rx="4.5" ry="10" fill={secondaryColor} />
                <ellipse cx="42" cy="34" rx="4" ry="8" fill={primaryColor} />
                <ellipse cx="58" cy="36" rx="4" ry="8" fill={secondaryColor} />
                {/* Beards / Whiskers */}
                <path d="M 48 14 L 44 6 M 48 16 L 52 8 M 56 18 L 60 10" stroke={primaryColor} strokeWidth="1.5" />
              </>
            )}

            {plant.flowerType === 'berry' && (
              <>
                {/* Bush structure */}
                <path d="M 50 70 Q 48 52 50 42" stroke="#15803d" strokeWidth="4" strokeLinecap="round" />
                <ellipse cx="50" cy="46" rx="20" ry="14" fill={foliageColor} />
                <ellipse cx="42" cy="44" rx="14" ry="12" fill="#16a34a" />
                <ellipse cx="58" cy="44" rx="14" ry="12" fill="#22c55e" />
                {/* Hanging ripe berries */}
                <circle cx="38" cy="48" r="6" fill={primaryColor} />
                <circle cx="36" cy="46" r="1.5" fill="#ffffff" opacity="0.6" />
                <circle cx="52" cy="42" r="6.5" fill={secondaryColor} />
                <circle cx="50" cy="40" r="1.8" fill="#ffffff" opacity="0.6" />
                <circle cx="62" cy="50" r="5.5" fill={primaryColor} />
                <circle cx="60" cy="48" r="1.5" fill="#ffffff" opacity="0.6" />
                <circle cx="48" cy="54" r="5.8" fill={primaryColor} />
              </>
            )}

            {plant.flowerType === 'flower' && (
              <>
                {/* Graceful stem */}
                <path d="M 50 70 Q 48 48 50 32" stroke={foliageColor} strokeWidth="3.5" strokeLinecap="round" />
                {/* Broad leaves */}
                <path d="M 49 56 C 32 54 26 44 34 38 C 42 34 47 48 49 56" fill={foliageColor} />
                <path d="M 51 52 C 68 50 74 40 66 34 C 60 30 53 44 51 52" fill="#22c55e" />
                {/* Petals */}
                <g className="origin-center">
                  <circle cx="50" cy="24" r="9" fill={primaryColor} />
                  <circle cx="42" cy="30" r="8" fill={secondaryColor} />
                  <circle cx="58" cy="30" r="8" fill={secondaryColor} />
                  <circle cx="44" cy="38" r="7.5" fill={primaryColor} />
                  <circle cx="56" cy="38" r="7.5" fill={primaryColor} />
                  {/* Flower Center */}
                  <circle cx="50" cy="32" r="5" fill="#fde047" />
                  <circle cx="50" cy="32" r="2.5" fill="#ca8a04" />
                </g>
              </>
            )}

            {plant.flowerType === 'crystal' && (
              <>
                {/* Crystal shard clusters */}
                <path d="M 50 70 L 50 48" stroke="#0f766e" strokeWidth="4" strokeLinecap="round" />
                {/* Main Shard */}
                <polygon points="50,14 42,38 50,60 58,38" fill={primaryColor} opacity="0.95" />
                <polygon points="50,14 50,60 58,38" fill={secondaryColor} opacity="0.8" />
                {/* Side Shards */}
                <polygon points="34,26 30,46 42,54 44,38" fill={secondaryColor} opacity="0.9" />
                <polygon points="66,26 56,38 58,54 70,46" fill={primaryColor} opacity="0.9" />
                {/* Facet Highlights */}
                <line x1="50" y1="16" x2="50" y2="58" stroke="#ffffff" strokeWidth="1.5" opacity="0.7" />
                <line x1="34" y1="28" x2="42" y2="52" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
                <circle cx="50" cy="30" r="1.5" fill="#ffffff" />
              </>
            )}

            {plant.flowerType === 'cosmic' && (
              <>
                {/* Swirling celestial stem */}
                <path d="M 50 70 Q 42 50 50 36 Q 58 24 50 16" stroke="#6366f1" strokeWidth="3" strokeLinecap="round" />
                {/* Nebula Core */}
                <circle cx="50" cy="28" r="18" fill={`url(#glow-${plant.id})`} />
                <circle cx="50" cy="28" r="11" fill={primaryColor} />
                <circle cx="50" cy="28" r="7" fill={secondaryColor} />
                {/* Orbiting star rings */}
                <ellipse cx="50" cy="28" rx="20" ry="6" fill="none" stroke="#fcd34d" strokeWidth="1.5" strokeDasharray="3,2" />
                <circle cx="68" cy="27" r="2.5" fill="#fef08a" />
                <circle cx="32" cy="29" r="2" fill="#67e8f9" />
                <polygon points="50,22 52,27 57,28 52,29 50,34 48,29 43,28 48,27" fill="#ffffff" />
              </>
            )}

            {/* Sparkles / Aura for exotic plants */}
            {isExoticOrLegendary && (
              <g className="animate-spin-slow origin-center">
                <circle cx="28" cy="22" r="1.5" fill="#ffffff" />
                <circle cx="72" cy="24" r="2" fill="#ffffff" />
                <circle cx="34" cy="52" r="1.2" fill="#fef08a" />
                <circle cx="66" cy="50" r="1.8" fill="#a7f3d0" />
                <circle cx="50" cy="10" r="2" fill="#ffffff" />
              </g>
            )}

            {/* Golden Harvest ready shine */}
            {isGoldenReady && (
              <g>
                <circle cx="50" cy="35" r="24" fill="none" stroke="#facc15" strokeWidth="2" strokeDasharray="4,4" className="animate-spin-slow" />
                <polygon points="50,6 52,11 57,12 52,13 50,18 48,13 43,12 48,11" fill="#facc15" />
              </g>
            )}
          </g>
        )}
      </svg>

      {/* Ripe badge / Ready indicator */}
      {stage === 4 && (
        <div className="absolute -top-2 bg-gradient-to-r from-amber-500 to-emerald-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-full shadow-md animate-bounce">
          HARVEST
        </div>
      )}
    </div>
  );
};
