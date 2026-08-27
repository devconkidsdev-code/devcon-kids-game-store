import React from 'react';

interface FarmerSpriteProps {
  facing: 'left' | 'right' | 'up' | 'down';
  isWalking: boolean;
  isWatering: boolean;
  waterLevel: number;
  maxWater: number;
}

export const FarmerSprite: React.FC<FarmerSpriteProps> = ({
  facing,
  isWalking,
  isWatering,
  waterLevel,
  maxWater,
}) => {
  const isFlipped = facing === 'left';
  const isBack = facing === 'up';

  return (
    <div
      className={`relative w-16 h-20 pointer-events-none select-none transition-transform duration-75 ${
        isWalking ? 'animate-bounce' : ''
      }`}
      style={{
        transform: isFlipped ? 'scaleX(-1)' : 'scaleX(1)',
      }}
    >
      {/* Shadow */}
      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-4 bg-emerald-950/40 rounded-full blur-[2px]" />

      {/* Main Farmer SVG */}
      <svg
        viewBox="0 0 64 80"
        className="w-full h-full drop-shadow-md overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Legs / Boots */}
        <g className={isWalking ? 'animate-pulse' : ''}>
          {/* Left Boot */}
          <rect x="20" y="60" width="9" height="14" rx="4.5" fill="#451a03" />
          <path d="M19 68 H30 V74 C30 75 28 75 27 75 H19 Z" fill="#290f01" />
          {/* Right Boot */}
          <rect x="35" y="60" width="9" height="14" rx="4.5" fill="#451a03" />
          <path d="M34 68 H45 V74 C45 75 43 75 42 75 H34 Z" fill="#290f01" />
        </g>

        {/* Denim Overalls Body */}
        <rect x="18" y="36" width="28" height="28" rx="7" fill="#1d4ed8" />
        {/* Plaid Shirt Sleeves */}
        <rect x="13" y="36" width="9" height="18" rx="4.5" fill="#dc2626" />
        <rect x="42" y="36" width="9" height="18" rx="4.5" fill="#dc2626" />
        {/* Shirt Collar / Pocket */}
        <rect x="24" y="42" width="16" height="13" rx="3" fill="#1e40af" stroke="#60a5fa" strokeWidth="1" />
        {/* Overall Straps */}
        <rect x="22" y="36" width="4" height="14" fill="#1e3a8a" />
        <rect x="38" y="36" width="4" height="14" fill="#1e3a8a" />
        {/* Yellow Brass Buttons */}
        <circle cx="24" cy="46" r="2" fill="#fbbf24" />
        <circle cx="40" cy="46" r="2" fill="#fbbf24" />

        {/* Head */}
        <circle cx="32" cy="24" r="13" fill="#fed7aa" />

        {/* Face features (if not facing back) */}
        {!isBack ? (
          <g>
            {/* Rosy Cheeks */}
            <circle cx="24" cy="28" r="3" fill="#fca5a5" opacity="0.8" />
            <circle cx="40" cy="28" r="3" fill="#fca5a5" opacity="0.8" />
            {/* Eyes */}
            <circle cx="26" cy="23" r="2" fill="#1c1917" />
            <circle cx="38" cy="23" r="2" fill="#1c1917" />
            {/* Sparkle in eyes */}
            <circle cx="25.5" cy="22.5" r="0.7" fill="#ffffff" />
            <circle cx="37.5" cy="22.5" r="0.7" fill="#ffffff" />
            {/* Happy Smile */}
            <path
              d="M28 29 Q32 33 36 29"
              stroke="#7c2d12"
              strokeWidth="2"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        ) : (
          /* Back of head hair */
          <path d="M20 22 Q32 30 44 22 V18 H20 Z" fill="#78350f" />
        )}

        {/* Straw Hat */}
        {/* Hat Brim */}
        <ellipse cx="32" cy="15" rx="26" ry="7" fill="#f59e0b" stroke="#b45309" strokeWidth="1.5" />
        {/* Hat Ribbon */}
        <rect x="20" y="7" width="24" height="4" fill="#dc2626" />
        {/* Hat Crown */}
        <path d="M20 10 Q22 0 32 0 Q42 0 44 10 Z" fill="#fbbf24" stroke="#b45309" strokeWidth="1.5" />

        {/* Watering Can on the side */}
        <g
          className={`transition-transform duration-150 ${
            isWatering ? 'translate-x-3 -translate-y-1 rotate-12' : ''
          }`}
        >
          {/* Can Body */}
          <rect x="44" y="44" width="15" height="15" rx="3" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />
          {/* Handle */}
          <path
            d="M48 44 C48 37, 56 37, 56 44"
            fill="none"
            stroke="#0369a1"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Spout */}
          <path d="M59 52 L66 46" stroke="#0369a1" strokeWidth="3" strokeLinecap="round" />
          <ellipse cx="67" cy="45" rx="2" ry="4" fill="#38bdf8" />
        </g>
      </svg>

      {/* Animated Water Droplets Spray */}
      {isWatering && (
        <div className="absolute top-10 -right-4 w-12 h-14 pointer-events-none flex flex-col items-center justify-start">
          <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping opacity-90 mb-1" />
          <div className="flex gap-1">
            <span className="w-2 h-3 bg-blue-400 rounded-full animate-bounce [animation-delay:50ms]" />
            <span className="w-1.5 h-2.5 bg-cyan-300 rounded-full animate-bounce [animation-delay:150ms]" />
            <span className="w-2 h-3 bg-sky-400 rounded-full animate-bounce [animation-delay:100ms]" />
          </div>
        </div>
      )}

      {/* Water Meter Tag above head */}
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-slate-900/80 backdrop-blur-xs px-2 py-0.5 rounded-full border border-sky-400/40 shadow-xs whitespace-nowrap">
        <span className="text-[10px]">💧</span>
        <div className="w-8 h-1.5 bg-slate-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-200 ${
              waterLevel === 0
                ? 'bg-red-500 animate-pulse'
                : waterLevel < maxWater * 0.3
                ? 'bg-amber-400'
                : 'bg-cyan-400'
            }`}
            style={{ width: `${(waterLevel / maxWater) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
