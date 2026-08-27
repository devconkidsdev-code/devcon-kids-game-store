import React from 'react';

interface Props {
  size?: number;
  mood?: 'happy' | 'determined' | 'hurt' | 'celebrating';
  hasWater?: boolean;
}

export const WaterHeroAvatar: React.FC<Props> = ({
  size = 64,
  mood = 'determined',
  hasWater = true,
}) => {
  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full drop-shadow-md overflow-visible"
      >
        <defs>
          <radialGradient id="waterBody" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#7dd3fc" />
            <stop offset="45%" stopColor="#38bdf8" />
            <stop offset="90%" stopColor="#0284c7" />
            <stop offset="100%" stopColor="#0369a1" />
          </radialGradient>
          <linearGradient id="flaskGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <linearGradient id="waterFill" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
        </defs>

        {/* Backpack Water Cylinder */}
        <rect
          x="12"
          y="35"
          width="16"
          height="32"
          rx="6"
          fill="url(#flaskGrad)"
          stroke="#1e293b"
          strokeWidth="2.5"
        />
        {/* Backpack Water Window */}
        <rect
          x="14"
          y={hasWater ? '42' : '58'}
          width="12"
          height={hasWater ? '22' : '6'}
          rx="3"
          fill="url(#waterFill)"
          className="transition-all duration-300"
        />
        {/* Backpack straps */}
        <path
          d="M24 38 Q35 44 42 48"
          stroke="#1e293b"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M24 58 Q35 58 42 62"
          stroke="#1e293b"
          strokeWidth="3.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* Feet / Boots */}
        <ellipse cx="38" cy="85" rx="9" ry="6" fill="#f59e0b" stroke="#78350f" strokeWidth="2.5" />
        <ellipse cx="62" cy="85" rx="9" ry="6" fill="#f59e0b" stroke="#78350f" strokeWidth="2.5" />

        {/* Main Water Droplet Body */}
        <path
          d="M 50 12 C 50 12, 22 42, 22 62 C 22 78, 34 88, 50 88 C 66 88, 78 78, 78 62 C 78 42, 50 12, 50 12 Z"
          fill="url(#waterBody)"
          stroke="#0c4a6e"
          strokeWidth="3"
        />

        {/* Glossy highlight shine */}
        <path
          d="M 46 22 C 36 36 30 48 30 58 C 30 52 35 40 46 30 Z"
          fill="#ffffff"
          opacity="0.65"
        />
        <circle cx="34" cy="65" r="3" fill="#ffffff" opacity="0.6" />

        {/* Cute Goggles / Hero Headband */}
        <path
          d="M 28 42 Q 50 40 72 42"
          stroke="#047857"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
        {/* Left Lens */}
        <circle cx="40" cy="46" r="10" fill="#ecfdf5" stroke="#047857" strokeWidth="3" />
        {/* Right Lens */}
        <circle cx="60" cy="46" r="10" fill="#ecfdf5" stroke="#047857" strokeWidth="3" />
        <line x1="48" y1="46" x2="52" y2="46" stroke="#047857" strokeWidth="3" />

        {/* Eyes inside lenses */}
        {mood === 'hurt' ? (
          <>
            <path d="M 36 43 L 44 49 M 44 43 L 36 49" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 56 43 L 64 49 M 64 43 L 56 49" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" />
          </>
        ) : mood === 'celebrating' ? (
          <>
            <path d="M 35 48 Q 40 42 45 48" stroke="#0f172a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M 55 48 Q 60 42 65 48" stroke="#0f172a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <ellipse cx="41" cy="46" rx="4.5" ry="5.5" fill="#0f172a" />
            <circle cx="42.5" cy="44" r="1.8" fill="#ffffff" />
            <ellipse cx="61" cy="46" rx="4.5" ry="5.5" fill="#0f172a" />
            <circle cx="62.5" cy="44" r="1.8" fill="#ffffff" />
          </>
        )}

        {/* Mouth */}
        {mood === 'celebrating' ? (
          <path
            d="M 43 62 Q 50 72 57 62 Z"
            fill="#ef4444"
            stroke="#991b1b"
            strokeWidth="1.5"
          />
        ) : mood === 'hurt' ? (
          <ellipse cx="50" cy="65" rx="4" ry="5" fill="#0f172a" />
        ) : (
          <path
            d="M 44 62 Q 50 67 56 62"
            fill="none"
            stroke="#0c4a6e"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        )}

        {/* Hero Cape hint */}
        <path
          d="M 70 50 Q 82 62 76 74 Q 72 65 68 58"
          fill="#10b981"
          stroke="#047857"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
};
