import React from 'react';

interface WaterWellProps {
  isFarmerNear: boolean;
  onRefillClick: () => void;
  farmerWater: number;
  maxWater: number;
}

export const WaterWell: React.FC<WaterWellProps> = ({
  isFarmerNear,
  onRefillClick,
  farmerWater,
  maxWater,
}) => {
  const needsWater = farmerWater < maxWater;

  return (
    <div
      id="water-well"
      onClick={onRefillClick}
      className={`relative w-28 h-28 sm:w-32 sm:h-32 flex flex-col items-center justify-center p-2 rounded-2xl cursor-pointer transition-all duration-200 select-none shadow-lg ${
        isFarmerNear
          ? 'ring-4 ring-cyan-400 scale-105 shadow-cyan-500/50 bg-sky-950/90 border-2 border-cyan-400'
          : 'bg-stone-900/90 border-2 border-stone-700 hover:scale-102'
      }`}
    >
      {/* Stone Well SVG */}
      <svg viewBox="0 0 100 100" className="w-20 h-20 sm:w-24 sm:h-24 overflow-visible drop-shadow-md">
        {/* Wooden Roof */}
        <polygon points="10,35 50,8 90,35" fill="#78350f" stroke="#451a03" strokeWidth="2" />
        <line x1="50" y1="8" x2="50" y2="35" stroke="#451a03" strokeWidth="1.5" />
        <line x1="30" y1="22" x2="30" y2="35" stroke="#451a03" strokeWidth="1.5" />
        <line x1="70" y1="22" x2="70" y2="35" stroke="#451a03" strokeWidth="1.5" />

        {/* Wooden Support Posts */}
        <rect x="18" y="33" width="6" height="35" fill="#92400e" stroke="#451a03" strokeWidth="1" />
        <rect x="76" y="33" width="6" height="35" fill="#92400e" stroke="#451a03" strokeWidth="1" />

        {/* Cross Beam */}
        <rect x="20" y="38" width="60" height="5" fill="#78350f" rx="1" />

        {/* Pulley & Rope */}
        <circle cx="50" cy="40" r="4" fill="#64748b" />
        <line x1="50" y1="42" x2="50" y2="58" stroke="#fcd34d" strokeWidth="2" />

        {/* Stone Well Wall Base */}
        <ellipse cx="50" cy="65" rx="32" ry="12" fill="#38bdf8" />
        <ellipse cx="50" cy="65" rx="30" ry="10" fill="#0284c7" />

        {/* Well Barrel Cylindrical Walls */}
        <path
          d="M18 65 C18 78, 82 78, 82 65 V82 C82 95, 18 95, 18 82 Z"
          fill="#57534e"
          stroke="#292524"
          strokeWidth="2"
        />

        {/* Brick line patterns */}
        <path d="M22 72 H78" stroke="#44403c" strokeWidth="1.5" />
        <path d="M20 80 H80" stroke="#44403c" strokeWidth="1.5" />
        <path d="M24 87 H76" stroke="#44403c" strokeWidth="1.5" />

        {/* Water Bucket Hanging */}
        <rect x="44" y="55" width="12" height="11" rx="2" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
        <ellipse cx="50" cy="56" rx="5" ry="2" fill="#38bdf8" />

        {/* Sparkling Water Bubbles */}
        <circle cx="46" cy="64" r="2" fill="#ffffff" className="animate-ping" />
        <circle cx="56" cy="67" r="1.5" fill="#e0f2fe" className="animate-bounce" />
      </svg>

      {/* Action Prompt */}
      {needsWater && (
        <div
          className={`absolute -top-3 px-2 py-0.5 rounded-full text-[10px] font-bold text-white shadow-md flex items-center gap-1 ${
            isFarmerNear ? 'bg-cyan-500 animate-bounce' : 'bg-sky-700 animate-pulse'
          }`}
        >
          <span>💧</span>
          <span>{isFarmerNear ? 'REFILL NOW!' : 'WELL PUMP'}</span>
        </div>
      )}

      {/* Label */}
      <span className="text-[10px] font-bold text-cyan-300 mt-1 flex items-center gap-1">
        <span>Water Well</span>
        <span className="text-[9px] opacity-75">({farmerWater}/{maxWater})</span>
      </span>
    </div>
  );
};
