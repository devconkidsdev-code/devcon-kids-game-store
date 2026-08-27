import React from 'react';

interface Icon2DProps {
  className?: string;
  size?: number;
}

// 2D Rolled Elastic Bandage with unrolling tail and clips
export const BandageRollIcon2D: React.FC<Icon2DProps> = ({ className = "w-8 h-8", size }) => (
  <svg 
    viewBox="0 0 64 64" 
    className={className} 
    style={size ? { width: size, height: size } : undefined}
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="bandageRollGrad" x1="10" y1="10" x2="45" y2="45" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#fef3c7" />
        <stop offset="50%" stopColor="#fde68a" />
        <stop offset="100%" stopColor="#f59e0b" />
      </linearGradient>
      <linearGradient id="bandageTailGrad" x1="20" y1="35" x2="58" y2="52" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="100%" stopColor="#fef08a" />
      </linearGradient>
      <pattern id="bandageTexture" width="6" height="6" patternUnits="userSpaceOnUse">
        <path d="M0 3h6 M3 0v6" stroke="#d97706" strokeWidth="0.6" strokeOpacity="0.4" />
      </pattern>
    </defs>

    {/* Drop shadow */}
    <ellipse cx="32" cy="54" rx="24" ry="5" fill="#000000" fillOpacity="0.35" />

    {/* Unrolled Bandage Strip / Tail */}
    <path 
      d="M26 38 C34 38 42 42 56 46 C59 47 60 51 58 54 C54 58 46 56 36 52 C26 48 20 44 18 42 Z" 
      fill="url(#bandageTailGrad)" 
      stroke="#b45309" 
      strokeWidth="1.5" 
      strokeLinejoin="round"
    />
    <path 
      d="M26 38 C34 38 42 42 56 46 C59 47 60 51 58 54 C54 58 46 56 36 52 C26 48 20 44 18 42 Z" 
      fill="url(#bandageTexture)" 
      opacity="0.7"
    />

    {/* Stitched Edge lines along unrolled strip */}
    <path d="M28 40 C36 40 44 44 56 48" stroke="#10b981" strokeWidth="1" strokeDasharray="2,2" />
    <path d="M20 44 C30 49 40 53 54 55" stroke="#10b981" strokeWidth="1" strokeDasharray="2,2" />

    {/* Main Cylindrical Bandage Roll Body */}
    <path 
      d="M12 22 C12 14 22 10 32 10 C42 10 48 14 48 22 L48 36 C48 44 42 48 32 48 C22 48 12 44 12 36 Z" 
      fill="url(#bandageRollGrad)" 
      stroke="#b45309" 
      strokeWidth="1.8" 
    />
    <path 
      d="M12 22 C12 14 22 10 32 10 C42 10 48 14 48 22 L48 36 C48 44 42 48 32 48 C22 48 12 44 12 36 Z" 
      fill="url(#bandageTexture)" 
      opacity="0.85"
    />

    {/* Concentric Rolled Layers on Top Oval */}
    <ellipse cx="30" cy="20" rx="16" ry="9" fill="#fffbeb" stroke="#b45309" strokeWidth="1.5" />
    <ellipse cx="30" cy="20" rx="11" ry="6" fill="#fef3c7" stroke="#b45309" strokeWidth="1.2" />
    <ellipse cx="30" cy="20" rx="6" ry="3.5" fill="#fde68a" stroke="#d97706" strokeWidth="1" />
    <circle cx="30" cy="20" r="2" fill="#78350f" />

    {/* Fastener Clip on Roll Side */}
    <rect x="36" y="27" width="10" height="8" rx="2" fill="#e2e8f0" stroke="#475569" strokeWidth="1.2" />
    <line x1="39" y1="29" x2="39" y2="33" stroke="#059669" strokeWidth="1.5" />
    <line x1="43" y1="29" x2="43" y2="33" stroke="#059669" strokeWidth="1.5" />

    {/* Red Medical Cross Badge on Bandage */}
    <g transform="translate(18, 26) scale(0.65)">
      <rect x="4" y="0" width="4" height="12" rx="1" fill="#ef4444" />
      <rect x="0" y="4" width="12" height="4" rx="1" fill="#ef4444" />
    </g>
  </svg>
);

// 2D Sterile Gauze Pad & Cotton Dressing (Square Woven Mesh with Peel Pack)
export const GauzePadIcon2D: React.FC<Icon2DProps> = ({ className = "w-8 h-8", size }) => (
  <svg 
    viewBox="0 0 64 64" 
    className={className} 
    style={size ? { width: size, height: size } : undefined}
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="gauzePackGrad" x1="4" y1="4" x2="60" y2="60" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#0284c7" />
        <stop offset="100%" stopColor="#0369a1" />
      </linearGradient>
      <linearGradient id="gauzePadGrad" x1="12" y1="12" x2="52" y2="52" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="60%" stopColor="#f8fafc" />
        <stop offset="100%" stopColor="#e2e8f0" />
      </linearGradient>
      <pattern id="gauzeMeshPattern" width="4" height="4" patternUnits="userSpaceOnUse">
        <path d="M0 2h4 M2 0v4" stroke="#94a3b8" strokeWidth="0.75" />
      </pattern>
    </defs>

    {/* Drop shadow */}
    <rect x="8" y="10" width="48" height="48" rx="8" fill="#000000" fillOpacity="0.3" />

    {/* Medical Sterile Foil Pouch Background */}
    <rect x="6" y="8" width="52" height="48" rx="6" fill="url(#gauzePackGrad)" stroke="#38bdf8" strokeWidth="1.5" />
    
    {/* Sealed Chevrons on Pouch Edge */}
    <line x1="6" y1="14" x2="58" y2="14" stroke="#bae6fd" strokeWidth="1" strokeDasharray="3,2" />
    <line x1="6" y1="50" x2="58" y2="50" stroke="#bae6fd" strokeWidth="1" strokeDasharray="3,2" />
    
    {/* Pouch Label */}
    <text x="32" y="13" textAnchor="middle" fill="#e0f2fe" fontSize="5" fontWeight="bold" fontFamily="monospace" letterSpacing="0.5">STERILE GAUZE 10x10cm</text>

    {/* Multi-Layered Cotton Gauze Sponge (Angled) */}
    {/* Layer 3 (Bottom shadow) */}
    <rect x="18" y="20" width="32" height="30" rx="3" fill="#cbd5e1" stroke="#64748b" strokeWidth="1" transform="rotate(-3 34 35)" />
    {/* Layer 2 (Middle) */}
    <rect x="16" y="19" width="32" height="30" rx="3" fill="#f1f5f9" stroke="#94a3b8" strokeWidth="1" transform="rotate(2 32 34)" />
    
    {/* Layer 1 (Top Primary Gauze Pad) */}
    <rect x="15" y="18" width="34" height="30" rx="3" fill="url(#gauzePadGrad)" stroke="#475569" strokeWidth="1.5" />
    
    {/* Gauze Woven Mesh Texture Overlay */}
    <rect x="15" y="18" width="34" height="30" rx="3" fill="url(#gauzeMeshPattern)" opacity="0.8" />

    {/* Folded Edge Crease Lines on Gauze */}
    <line x1="17" y1="28" x2="47" y2="28" stroke="#cbd5e1" strokeWidth="1.2" />
    <line x1="17" y1="38" x2="47" y2="38" stroke="#cbd5e1" strokeWidth="1.2" />
    <line x1="32" y1="20" x2="32" y2="46" stroke="#cbd5e1" strokeWidth="1.2" />

    {/* Emblazoned Medical Red Cross Emblem on Gauze */}
    <circle cx="32" cy="33" r="8" fill="#ffffff" stroke="#ef4444" strokeWidth="1.2" />
    <rect x="30" y="27" width="4" height="12" rx="1" fill="#ef4444" />
    <rect x="26" y="31" width="12" height="4" rx="1" fill="#ef4444" />

    {/* Sterile Indicator Tag */}
    <rect x="8" y="44" width="14" height="8" rx="2" fill="#10b981" />
    <text x="15" y="50" textAnchor="middle" fill="#ffffff" fontSize="4.5" fontWeight="bold">EO GAS</text>
  </svg>
);

// 2D Adhesive Medical Bandage Strip (Band-Aid)
export const AdhesiveBandageIcon2D: React.FC<Icon2DProps> = ({ className = "w-8 h-8", size }) => (
  <svg 
    viewBox="0 0 64 64" 
    className={className} 
    style={size ? { width: size, height: size } : undefined}
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="bandaidGrad" x1="10" y1="10" x2="54" y2="54" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#fed7aa" />
        <stop offset="100%" stopColor="#f97316" />
      </linearGradient>
    </defs>
    {/* Shadow */}
    <rect x="12" y="16" width="44" height="22" rx="11" fill="#000" fillOpacity="0.3" transform="rotate(-25 34 27)" />
    
    {/* Main Bandage Body */}
    <rect x="10" y="14" width="44" height="22" rx="11" fill="url(#bandaidGrad)" stroke="#c2410c" strokeWidth="1.5" transform="rotate(-25 32 25)" />
    
    {/* Air Breathable Holes */}
    <g transform="rotate(-25 32 25)" fill="#ea580c" opacity="0.6">
      <circle cx="16" cy="20" r="1" />
      <circle cx="20" cy="20" r="1" />
      <circle cx="16" cy="30" r="1" />
      <circle cx="20" cy="30" r="1" />
      <circle cx="44" cy="20" r="1" />
      <circle cx="48" cy="20" r="1" />
      <circle cx="44" cy="30" r="1" />
      <circle cx="48" cy="30" r="1" />
    </g>

    {/* Center Absorbent Gauze Pad */}
    <rect x="25" y="15" width="14" height="20" rx="2" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" transform="rotate(-25 32 25)" />
    
    {/* Red Cross on Center Pad */}
    <g transform="rotate(-25 32 25)">
      <rect x="31" y="20" width="2" height="10" rx="0.5" fill="#ef4444" />
      <rect x="27" y="24" width="10" height="2" rx="0.5" fill="#ef4444" />
    </g>
  </svg>
);

// 2D Trauma Splint & Heavy Compression Gauze Wrap
export const CompressionSplintIcon2D: React.FC<Icon2DProps> = ({ className = "w-8 h-8", size }) => (
  <svg 
    viewBox="0 0 64 64" 
    className={className} 
    style={size ? { width: size, height: size } : undefined}
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="splintGrad" x1="10" y1="10" x2="54" y2="54" gradientUnits="userSpaceOnUse">
        <stop offset="0%" stopColor="#f87171" />
        <stop offset="100%" stopColor="#dc2626" />
      </linearGradient>
    </defs>
    {/* Shadow */}
    <ellipse cx="32" cy="54" rx="22" ry="5" fill="#000" fillOpacity="0.3" />

    {/* Rigid Aluminum Medical Splint Structure (Blue / Gray) */}
    <rect x="18" y="10" width="28" height="42" rx="5" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />
    <rect x="22" y="14" width="20" height="34" rx="3" fill="#38bdf8" />
    
    {/* Heavy Gauze / Elastic Compression Wrap Bandaging Around Splint */}
    {/* Wrap 1 */}
    <rect x="14" y="16" width="36" height="8" rx="2" fill="#fffbeb" stroke="#d97706" strokeWidth="1.2" transform="rotate(-5 32 20)" />
    <line x1="16" y1="20" x2="48" y2="20" stroke="#10b981" strokeWidth="1" strokeDasharray="2,2" transform="rotate(-5 32 20)" />
    
    {/* Wrap 2 */}
    <rect x="14" y="28" width="36" height="8" rx="2" fill="#ffffff" stroke="#d97706" strokeWidth="1.2" transform="rotate(4 32 32)" />
    <line x1="16" y1="32" x2="48" y2="32" stroke="#10b981" strokeWidth="1" strokeDasharray="2,2" transform="rotate(4 32 32)" />

    {/* Wrap 3 */}
    <rect x="14" y="40" width="36" height="8" rx="2" fill="#fef3c7" stroke="#d97706" strokeWidth="1.2" transform="rotate(-4 32 44)" />
    <line x1="16" y1="44" x2="48" y2="44" stroke="#10b981" strokeWidth="1" strokeDasharray="2,2" transform="rotate(-4 32 44)" />

    {/* Tension Hooks / Metal Bandage Clips */}
    <circle cx="44" cy="20" r="2.5" fill="#e2e8f0" stroke="#475569" strokeWidth="1" />
    <circle cx="44" cy="32" r="2.5" fill="#e2e8f0" stroke="#475569" strokeWidth="1" />
    <circle cx="44" cy="44" r="2.5" fill="#e2e8f0" stroke="#475569" strokeWidth="1" />

    {/* Emergency Red Cross Icon */}
    <rect x="25" y="10" width="14" height="5" rx="1" fill="#ef4444" />
    <line x1="32" y1="10" x2="32" y2="15" stroke="#ffffff" strokeWidth="1.5" />
    <line x1="29" y1="12.5" x2="35" y2="12.5" stroke="#ffffff" strokeWidth="1.5" />
  </svg>
);

// 2D Antiseptic Wash & Gauze Swab Set
export const AntisepticGauzeIcon2D: React.FC<Icon2DProps> = ({ className = "w-8 h-8", size }) => (
  <svg 
    viewBox="0 0 64 64" 
    className={className} 
    style={size ? { width: size, height: size } : undefined}
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Shadow */}
    <ellipse cx="32" cy="54" rx="24" ry="5" fill="#000" fillOpacity="0.35" />

    {/* Antiseptic Spray Bottle */}
    <rect x="14" y="24" width="18" height="28" rx="4" fill="#0d9488" stroke="#115e59" strokeWidth="1.5" />
    <rect x="17" y="20" width="12" height="5" fill="#14b8a6" stroke="#115e59" strokeWidth="1" />
    <rect x="19" y="14" width="8" height="7" fill="#ccfbf1" stroke="#115e59" strokeWidth="1" />
    {/* Spray Nozzle */}
    <path d="M27 16 L35 14 L35 18 Z" fill="#f43f5e" />

    {/* Bottle Label with Cross */}
    <rect x="16" y="30" width="14" height="14" rx="2" fill="#ffffff" />
    <rect x="22" y="33" width="2" height="8" fill="#ef4444" />
    <rect x="19" y="36" width="8" height="2" fill="#ef4444" />

    {/* Stack of Sterile Gauze Pads next to it */}
    <rect x="34" y="32" width="22" height="20" rx="3" fill="#e2e8f0" stroke="#64748b" strokeWidth="1" transform="rotate(-6 45 42)" />
    <rect x="33" y="30" width="22" height="20" rx="3" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
    
    {/* Gauze Mesh Cross Hatch */}
    <g stroke="#cbd5e1" strokeWidth="0.8">
      <line x1="35" y1="36" x2="53" y2="36" />
      <line x1="35" y1="42" x2="53" y2="42" />
      <line x1="35" y1="47" x2="53" y2="47" />
      <line x1="39" y1="31" x2="39" y2="49" />
      <line x1="45" y1="31" x2="45" y2="49" />
      <line x1="50" y1="31" x2="50" y2="49" />
    </g>

    {/* Cotton Swab Stick */}
    <line x1="32" y1="12" x2="46" y2="40" stroke="#fde047" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="32" cy="12" r="4" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
  </svg>
);

// 2D Construction Material SVGs for matching high quality
export const ConcreteBricksIcon2D: React.FC<Icon2DProps> = ({ className = "w-8 h-8", size }) => (
  <svg 
    viewBox="0 0 64 64" 
    className={className} 
    style={size ? { width: size, height: size } : undefined}
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Shadow */}
    <ellipse cx="32" cy="54" rx="22" ry="5" fill="#000" fillOpacity="0.35" />

    {/* Bottom Bricks */}
    <rect x="12" y="36" width="18" height="14" rx="2" fill="#d97706" stroke="#78350f" strokeWidth="1.5" />
    <rect x="34" y="36" width="18" height="14" rx="2" fill="#b45309" stroke="#78350f" strokeWidth="1.5" />
    
    {/* Middle Bricks */}
    <rect x="8" y="24" width="22" height="13" rx="2" fill="#f59e0b" stroke="#78350f" strokeWidth="1.5" />
    <rect x="32" y="24" width="24" height="13" rx="2" fill="#d97706" stroke="#78350f" strokeWidth="1.5" />
    
    {/* Top Brick */}
    <rect x="18" y="12" width="28" height="13" rx="2" fill="#fbbf24" stroke="#78350f" strokeWidth="1.5" />
    
    {/* Mortar / Concrete lines */}
    <line x1="10" y1="36.5" x2="54" y2="36.5" stroke="#cbd5e1" strokeWidth="1.8" />
    <line x1="16" y1="24.5" x2="48" y2="24.5" stroke="#cbd5e1" strokeWidth="1.8" />
  </svg>
);

export const RoofBeamsIcon2D: React.FC<Icon2DProps> = ({ className = "w-8 h-8", size }) => (
  <svg 
    viewBox="0 0 64 64" 
    className={className} 
    style={size ? { width: size, height: size } : undefined}
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Shadow */}
    <ellipse cx="32" cy="54" rx="22" ry="5" fill="#000" fillOpacity="0.35" />

    {/* Steel I-Beam 1 */}
    <path d="M12 18 L52 18 L52 24 L36 24 L36 38 L52 38 L52 44 L12 44 L12 38 L28 38 L28 24 L12 24 Z" fill="#0284c7" stroke="#0c4a6e" strokeWidth="1.5" />
    {/* Shingles Overlay */}
    <polygon points="32,10 8,30 56,30" fill="#f59e0b" stroke="#b45309" strokeWidth="1.5" />
    <line x1="20" y1="20" x2="44" y2="20" stroke="#fef08a" strokeWidth="1.5" />
  </svg>
);

export const HeavyWelderIcon2D: React.FC<Icon2DProps> = ({ className = "w-8 h-8", size }) => (
  <svg 
    viewBox="0 0 64 64" 
    className={className} 
    style={size ? { width: size, height: size } : undefined}
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Shadow */}
    <ellipse cx="32" cy="54" rx="22" ry="5" fill="#000" fillOpacity="0.35" />

    {/* Welder Unit Base */}
    <rect x="14" y="22" width="36" height="26" rx="4" fill="#ea580c" stroke="#7c2d12" strokeWidth="1.5" />
    <rect x="20" y="28" width="12" height="8" rx="2" fill="#0f172a" stroke="#38bdf8" strokeWidth="1" />
    <circle cx="40" cy="32" r="4" fill="#38bdf8" />

    {/* Welding Torch & Sparks */}
    <path d="M46 36 Q54 44 48 50 L42 46" stroke="#475569" strokeWidth="2.5" fill="none" />
    <polygon points="50,48 58,45 54,53 62,52 52,58 55,52" fill="#fef08a" stroke="#f59e0b" strokeWidth="0.8" />
  </svg>
);
