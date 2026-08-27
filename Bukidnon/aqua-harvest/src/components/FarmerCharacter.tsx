import React from 'react';
import { motion } from 'motion/react';

interface FarmerCharacterProps {
  currentPlotIndex: number;
  totalPlots: number;
  isWatering: boolean;
  facingDirection: 'left' | 'right';
}

export const FarmerCharacter: React.FC<FarmerCharacterProps> = ({
  currentPlotIndex,
  totalPlots,
  isWatering,
  facingDirection,
}) => {
  // Calculate percentage along the plots track
  // Total width of plots container is distributed across totalPlots
  const leftPercent = ((currentPlotIndex + 0.5) / totalPlots) * 100;

  return (
    <motion.div
      className="absolute bottom-24 md:bottom-28 z-30 pointer-events-none -translate-x-1/2 flex flex-col items-center"
      initial={false}
      animate={{
        left: `${leftPercent}%`,
        scaleX: facingDirection === 'left' ? -1 : 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 450,
        damping: 32,
      }}
    >
      {/* Smart Water Spray Arc / Droplets effect */}
      {isWatering && (
        <div className="absolute top-14 left-10 md:left-12 flex flex-col items-center pointer-events-none z-40">
          {/* Animated Water Jet Stream */}
          <div className="relative w-8 h-20 md:h-24 overflow-visible">
            {/* Main high pressure water stream */}
            <div className="w-4 h-full bg-gradient-to-b from-cyan-300 via-sky-400 to-blue-500 rounded-b-full opacity-90 animate-pulse shadow-[0_0_12px_rgba(56,189,248,0.9)] transform rotate-12" />
            
            {/* Spray water droplets */}
            <div className="absolute top-4 -left-3 w-3 h-3 bg-cyan-200 rounded-full animate-ping" />
            <div className="absolute top-10 right-0 w-2.5 h-2.5 bg-blue-300 rounded-full animate-bounce" />
            <div className="absolute top-16 -left-2 w-3.5 h-3.5 bg-sky-200 rounded-full animate-pulse" />
            <div className="absolute bottom-0 left-2 w-6 h-6 bg-cyan-300/60 rounded-full blur-xs animate-ping" />
          </div>
        </div>
      )}

      {/* Bukidnon Farmer Character Vector Artwork */}
      <div className="relative w-24 h-28 md:w-28 md:h-32 flex items-center justify-center">
        <svg
          viewBox="0 0 100 120"
          className={`w-full h-full drop-shadow-md transition-transform duration-100 ${
            isWatering ? 'scale-105' : ''
          }`}
        >
          {/* Shadow beneath character */}
          <ellipse cx="50" cy="114" rx="28" ry="6" fill="#1e293b" opacity="0.3" />

          {/* Farmer's Legs / Boots */}
          <rect x="36" y="85" width="10" height="24" rx="3" fill="#1e3a8a" />
          <rect x="54" y="85" width="10" height="24" rx="3" fill="#1e3a8a" />
          <rect x="34" y="104" width="13" height="8" rx="3" fill="#78350f" />
          <rect x="53" y="104" width="13" height="8" rx="3" fill="#78350f" />

          {/* Body / Bukidnon Traditional-Inspired Farming Vest */}
          {/* Inner shirt */}
          <rect x="34" y="55" width="32" height="34" rx="6" fill="#f8fafc" />
          
          {/* Traditional Vest with Bukidnon Red/Blue & geometric motif */}
          <path d="M34,55 L45,55 L45,86 L34,86 Z" fill="#b91c1c" />
          <path d="M55,55 L66,55 L66,86 L55,86 Z" fill="#1d4ed8" />
          {/* Decorative geometric diamonds on vest */}
          <polygon points="40,65 42,62 44,65 42,68" fill="#facc15" />
          <polygon points="40,75 42,72 44,75 42,78" fill="#facc15" />
          <polygon points="58,65 60,62 62,65 60,68" fill="#facc15" />
          <polygon points="58,75 60,72 62,75 60,78" fill="#facc15" />
          
          {/* Belt with Smart Device Battery Holster */}
          <rect x="33" y="82" width="34" height="6" rx="2" fill="#451a03" />
          <rect x="46" y="81" width="8" height="8" rx="2" fill="#f59e0b" />

          {/* Left Arm holding wand base */}
          <rect x="24" y="60" width="12" height="7" rx="3" fill="#f8fafc" />

          {/* Young Farmer Face */}
          <circle cx="50" cy="42" r="16" fill="#d97706" opacity="0.9" />
          
          {/* Cheerful Eyes & Smile */}
          <ellipse cx="45" cy="40" rx="2" ry="2.5" fill="#1e293b" />
          <ellipse cx="55" cy="40" rx="2" ry="2.5" fill="#1e293b" />
          {/* Rosy cheeks */}
          <circle cx="41" cy="44" r="2.5" fill="#f43f5e" opacity="0.6" />
          <circle cx="59" cy="44" r="2.5" fill="#f43f5e" opacity="0.6" />
          {/* Cheerful grin */}
          <path d="M46,47 Q50,52 54,47" stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round" />

          {/* Traditional Bukidnon Woven Salakot Hat */}
          {/* Broad woven brim */}
          <ellipse cx="50" cy="30" rx="38" ry="10" fill="#fde047" stroke="#ca8a04" strokeWidth="2" />
          {/* Woven cone top */}
          <path d="M22,29 Q50,-2 78,29 Z" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
          {/* Ethnic Bukidnon Hat Pattern Ribbon */}
          <path d="M27,27 Q50,22 73,27" stroke="#dc2626" strokeWidth="4" fill="none" />
          <path d="M30,26 Q50,21 70,26" stroke="#2563eb" strokeWidth="2" strokeDasharray="4 2" fill="none" />
          {/* Hat peak knob */}
          <circle cx="50" cy="1" r="3" fill="#991b1b" />

          {/* Right Arm & Smart Watering Device (Hydro-Pulse) */}
          <path d="M62,64 Q74,68 78,74" stroke="#d97706" strokeWidth="6" strokeLinecap="round" fill="none" />
          
          {/* Smart Device Body (Futuristic agricultural tool) */}
          <rect x="74" y="68" width="18" height="12" rx="3" fill="#0f172a" stroke="#0ea5e9" strokeWidth="1.5" />
          {/* Glowing water tank cylinder on wand */}
          <rect x="76" y="70" width="8" height="8" rx="2" fill="#38bdf8" className="animate-pulse" />
          {/* Digital Smart Display Screen */}
          <rect x="85" y="71" width="5" height="6" rx="1" fill="#10b981" />
          {/* Smart Nozzle head */}
          <path d="M88,74 L97,78 L95,84 L88,78 Z" fill="#64748b" stroke="#38bdf8" strokeWidth="1" />
          {/* Nozzle laser/LED tip */}
          <circle cx="96" cy="80" r="2.5" fill="#38bdf8" className={isWatering ? 'animate-ping' : ''} />
        </svg>

        {/* Floating Indicator for Active Plot Arrow */}
        <div className="absolute -top-6 flex flex-col items-center">
          <div className="bg-amber-400 text-amber-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-sm uppercase tracking-wider flex items-center gap-1 border border-amber-500">
            <span>YOU</span>
          </div>
          <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-amber-500" />
        </div>
      </div>
    </motion.div>
  );
};
