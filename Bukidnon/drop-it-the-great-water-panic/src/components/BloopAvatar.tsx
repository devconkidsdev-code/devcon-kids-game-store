import React from 'react';
import { motion } from 'motion/react';

interface BloopAvatarProps {
  expression?: 'happy' | 'worried' | 'shocked' | 'confused' | 'excited' | 'proud' | 'mischievous';
  size?: number;
  hat?: string;
  backpack?: string;
  outfit?: string;
  accessory?: string;
  className?: string;
  isDancing?: boolean;
}

export const BloopAvatar: React.FC<BloopAvatarProps> = ({
  expression = 'happy',
  size = 80,
  hat,
  backpack,
  outfit,
  accessory,
  className = '',
  isDancing = false,
}) => {
  return (
    <motion.div
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
      animate={
        isDancing
          ? {
              y: [0, -12, 0, -6, 0],
              rotate: [-6, 8, -6, 8, 0],
              scale: [1, 1.08, 0.96, 1.04, 1],
            }
          : {
              y: [0, -4, 0],
              scaleY: [1, 1.02, 0.98, 1],
            }
      }
      transition={{
        duration: isDancing ? 0.6 : 2.5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {/* Sparkling Water Aura */}
      {accessory === 'accessory_halo' && (
        <div className="absolute -top-3 w-10 h-3 rounded-full border-2 border-amber-300 bg-amber-100/40 shadow-lg animate-pulse" />
      )}

      {/* Main Bloop SVG Vector */}
      <svg
        viewBox="0 0 100 110"
        className="w-full h-full drop-shadow-md overflow-visible"
      >
        <defs>
          <linearGradient id="bloopBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="50%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="bloopHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="bloopCheekGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f472b6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#fb7185" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Cape if equipped */}
        {outfit === 'outfit_superhero' && (
          <path
            d="M 30 50 Q 15 90 20 105 Q 50 95 80 105 Q 85 90 70 50 Z"
            fill="#ef4444"
            className="animate-pulse"
          />
        )}

        {/* Backpack Straps / Back item */}
        {backpack === 'backpack_bubble' && (
          <g transform="translate(68, 48)">
            <circle cx="10" cy="10" r="12" fill="#bae6fd" stroke="#0284c7" strokeWidth="2.5" opacity="0.85" />
            <circle cx="6" cy="6" r="3" fill="#ffffff" />
            <path d="M 0 0 Q -8 10 0 20" stroke="#0369a1" strokeWidth="3" fill="none" />
          </g>
        )}
        {backpack === 'backpack_sunflower' && (
          <g transform="translate(68, 48)">
            <circle cx="10" cy="10" r="10" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
            <circle cx="10" cy="10" r="5" fill="#78350f" />
          </g>
        )}

        {/* Bloop's Cute Teardrop Body */}
        <path
          d="M 50 10 
             C 62 25, 88 48, 88 74 
             C 88 95, 71 106, 50 106 
             C 29 106, 12 95, 12 74 
             C 12 48, 38 25, 50 10 Z"
          fill="url(#bloopBodyGrad)"
          stroke="#0369a1"
          strokeWidth="3"
        />

        {/* Soft Shiny Light Reflection */}
        <ellipse cx="38" cy="38" rx="10" ry="16" transform="rotate(-25 38 38)" fill="url(#bloopHighlight)" />
        <circle cx="30" cy="62" r="4" fill="#ffffff" opacity="0.7" />

        {/* Farmer Overalls / Scuba Outfits */}
        {outfit === 'outfit_farmer' && (
          <g>
            <path d="M 24 75 Q 50 82 76 75 L 74 100 Q 50 106 26 100 Z" fill="#1e3a8a" stroke="#172554" strokeWidth="2" />
            <rect x="36" y="60" width="6" height="18" fill="#1e3a8a" />
            <rect x="58" y="60" width="6" height="18" fill="#1e3a8a" />
            <circle cx="39" cy="74" r="2" fill="#fbbf24" />
            <circle cx="61" cy="74" r="2" fill="#fbbf24" />
          </g>
        )}

        {/* Blushing Cheeks */}
        <ellipse cx="28" cy="72" rx="6" ry="4" fill="url(#bloopCheekGrad)" />
        <ellipse cx="72" cy="72" rx="6" ry="4" fill="url(#bloopCheekGrad)" />

        {/* Eyes based on expression */}
        {expression === 'happy' || expression === 'proud' ? (
          <g>
            {/* Big Shiny Anime Eyes */}
            <ellipse cx="37" cy="62" rx="6.5" ry="8" fill="#0f172a" />
            <circle cx="35" cy="59" r="2.8" fill="#ffffff" />
            <circle cx="39" cy="65" r="1.2" fill="#ffffff" />

            <ellipse cx="63" cy="62" rx="6.5" ry="8" fill="#0f172a" />
            <circle cx="61" cy="59" r="2.8" fill="#ffffff" />
            <circle cx="65" cy="65" r="1.2" fill="#ffffff" />
          </g>
        ) : expression === 'worried' ? (
          <g>
            <circle cx="37" cy="63" r="6" fill="#0f172a" />
            <circle cx="35" cy="61" r="2.2" fill="#ffffff" />
            <path d="M 31 52 Q 37 56 43 53" stroke="#075985" strokeWidth="2.5" strokeLinecap="round" fill="none" />

            <circle cx="63" cy="63" r="6" fill="#0f172a" />
            <circle cx="61" cy="61" r="2.2" fill="#ffffff" />
            <path d="M 57 53 Q 63 56 69 52" stroke="#075985" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            {/* Sweat drop */}
            <path d="M 76 42 Q 80 48 76 52 Q 72 48 76 42 Z" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" />
          </g>
        ) : expression === 'shocked' ? (
          <g>
            <ellipse cx="36" cy="60" rx="8" ry="9" fill="#0f172a" />
            <circle cx="34" cy="56" r="3.5" fill="#ffffff" />
            <ellipse cx="64" cy="60" rx="8" ry="9" fill="#0f172a" />
            <circle cx="62" cy="56" r="3.5" fill="#ffffff" />
          </g>
        ) : expression === 'mischievous' ? (
          <g>
            <path d="M 30 60 Q 37 54 44 60" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="none" />
            <circle cx="37" cy="62" r="2.5" fill="#0f172a" />
            <path d="M 56 60 Q 63 54 70 60" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="none" />
            <circle cx="63" cy="62" r="2.5" fill="#0f172a" />
          </g>
        ) : (
          <g>
            <circle cx="37" cy="62" r="6.5" fill="#0f172a" />
            <circle cx="35" cy="59" r="2.5" fill="#ffffff" />
            <circle cx="63" cy="62" r="6.5" fill="#0f172a" />
            <circle cx="61" cy="59" r="2.5" fill="#ffffff" />
          </g>
        )}

        {/* Mouth based on expression */}
        {expression === 'happy' || expression === 'proud' ? (
          <path d="M 43 72 Q 50 82 57 72" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="#fda4af" />
        ) : expression === 'worried' ? (
          <path d="M 43 77 Q 50 71 57 77" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        ) : expression === 'shocked' ? (
          <ellipse cx="50" cy="76" rx="5" ry="7" fill="#0f172a" />
        ) : expression === 'mischievous' ? (
          <path d="M 44 74 Q 52 82 58 72" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        ) : (
          <path d="M 45 74 Q 50 78 55 74" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        )}

        {/* Glasses Accessory */}
        {accessory === 'accessory_glasses' && (
          <g>
            <circle cx="37" cy="62" r="10" stroke="#78350f" strokeWidth="2" fill="#ffffff" fillOpacity="0.25" />
            <circle cx="63" cy="62" r="10" stroke="#78350f" strokeWidth="2" fill="#ffffff" fillOpacity="0.25" />
            <line x1="47" y1="62" x2="53" y2="62" stroke="#78350f" strokeWidth="2" />
          </g>
        )}

        {/* Hats */}
        {hat === 'hat_straw' && (
          <g transform="translate(15, -4)">
            <ellipse cx="35" cy="22" rx="36" ry="10" fill="#fde047" stroke="#ca8a04" strokeWidth="2" />
            <path d="M 20 20 C 20 5, 50 5, 50 20 Z" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
            <rect x="20" y="16" width="30" height="4" fill="#ef4444" />
          </g>
        )}
        {hat === 'hat_frog' && (
          <g transform="translate(20, -6)">
            <ellipse cx="30" cy="20" rx="26" ry="12" fill="#22c55e" stroke="#15803d" strokeWidth="2" />
            <circle cx="16" cy="10" r="7" fill="#22c55e" stroke="#15803d" strokeWidth="2" />
            <circle cx="16" cy="10" r="3" fill="#000000" />
            <circle cx="44" cy="10" r="7" fill="#22c55e" stroke="#15803d" strokeWidth="2" />
            <circle cx="44" cy="10" r="3" fill="#000000" />
          </g>
        )}
        {hat === 'hat_detective' && (
          <g transform="translate(18, -4)">
            <ellipse cx="32" cy="22" rx="32" ry="9" fill="#9a3412" stroke="#7c2d12" strokeWidth="2" />
            <path d="M 18 20 Q 32 4 46 20 Z" fill="#7c2d12" stroke="#431407" strokeWidth="2" />
            <rect x="18" y="16" width="28" height="3.5" fill="#f59e0b" />
          </g>
        )}
        {hat === 'hat_raincoat' && (
          <g transform="translate(16, -5)">
            <ellipse cx="34" cy="24" rx="34" ry="11" fill="#facc15" stroke="#ca8a04" strokeWidth="2" />
            <path d="M 20 22 C 20 8, 48 8, 48 22 Z" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
          </g>
        )}
        {hat === 'crown_golden_drop' && (
          <g transform="translate(22, -8)">
            <path d="M 8 20 L 14 6 L 28 14 L 42 6 L 48 20 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="2" />
            <circle cx="14" cy="6" r="3" fill="#38bdf8" />
            <circle cx="28" cy="14" r="3.5" fill="#ef4444" />
            <circle cx="42" cy="6" r="3" fill="#38bdf8" />
          </g>
        )}
      </svg>
    </motion.div>
  );
};
