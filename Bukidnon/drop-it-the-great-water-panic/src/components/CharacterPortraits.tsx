import React from 'react';
import { CharacterId } from '../types/game';
import { BloopAvatar } from './BloopAvatar';

interface CharacterPortraitProps {
  speaker: CharacterId;
  expression?: 'happy' | 'worried' | 'shocked' | 'confused' | 'excited' | 'proud' | 'mischievous';
  size?: number;
  className?: string;
}

export const CharacterPortrait: React.FC<CharacterPortraitProps> = ({
  speaker,
  expression = 'happy',
  size = 64,
  className = '',
}) => {
  if (speaker === 'bloop') {
    return <BloopAvatar expression={expression} size={size} className={className} />;
  }

  // Vector portraits for all cast members
  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl bg-white shadow-sm border-2 border-slate-200 overflow-hidden select-none p-1 ${className}`}
      style={{ width: size, height: size }}
    >
      {speaker === 'moo_moo' && (
        <svg viewBox="0 0 80 80" className="w-full h-full">
          {/* Cow Head */}
          <circle cx="40" cy="45" r="28" fill="#f8fafc" stroke="#1e293b" strokeWidth="2.5" />
          {/* Black patches */}
          <path d="M 20 30 Q 30 25 35 35 Q 25 45 20 30 Z" fill="#1e293b" />
          <path d="M 52 32 Q 62 28 60 42 Q 50 40 52 32 Z" fill="#1e293b" />
          {/* Horns */}
          <path d="M 22 28 Q 15 15 28 22" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M 58 28 Q 65 15 52 22" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" fill="none" />
          {/* Snout */}
          <ellipse cx="40" cy="55" rx="18" ry="12" fill="#fbcfe8" stroke="#1e293b" strokeWidth="2" />
          <circle cx="34" cy="54" r="2.5" fill="#475569" />
          <circle cx="46" cy="54" r="2.5" fill="#475569" />
          {/* Eyes */}
          <circle cx="30" cy="38" r="3.5" fill="#0f172a" />
          <circle cx="29" cy="37" r="1" fill="#ffffff" />
          <circle cx="50" cy="38" r="3.5" fill="#0f172a" />
          <circle cx="49" cy="37" r="1" fill="#ffffff" />
          {/* Water drop in mouth if sneaky */}
          <circle cx="40" cy="62" r="3" fill="#38bdf8" />
        </svg>
      )}

      {speaker === 'prof_croak' && (
        <svg viewBox="0 0 80 80" className="w-full h-full">
          {/* Frog Head */}
          <ellipse cx="40" cy="48" rx="30" ry="24" fill="#4ade80" stroke="#15803d" strokeWidth="2.5" />
          {/* Eyeballs protruding */}
          <circle cx="25" cy="26" r="12" fill="#4ade80" stroke="#15803d" strokeWidth="2.5" />
          <circle cx="25" cy="26" r="6" fill="#0f172a" />
          <circle cx="23" cy="24" r="2" fill="#ffffff" />
          <circle cx="55" cy="26" r="12" fill="#4ade80" stroke="#15803d" strokeWidth="2.5" />
          <circle cx="55" cy="26" r="6" fill="#0f172a" />
          <circle cx="53" cy="24" r="2" fill="#ffffff" />
          {/* Reporter Glasses / Bowtie */}
          <rect x="34" y="66" width="12" height="6" rx="2" fill="#ef4444" />
          {/* Wide Mouth */}
          <path d="M 22 52 Q 40 64 58 52" stroke="#15803d" strokeWidth="3" fill="none" strokeLinecap="round" />
        </svg>
      )}

      {speaker === 'farmer_bramble' && (
        <svg viewBox="0 0 80 80" className="w-full h-full">
          {/* Straw Hat */}
          <ellipse cx="40" cy="25" rx="34" ry="10" fill="#fde047" stroke="#ca8a04" strokeWidth="2" />
          <path d="M 24 24 C 24 10 56 10 56 24 Z" fill="#eab308" stroke="#ca8a04" strokeWidth="2" />
          {/* Face */}
          <circle cx="40" cy="46" r="20" fill="#fed7aa" stroke="#c2410c" strokeWidth="2" />
          {/* White bushy mustache */}
          <path d="M 28 52 Q 40 48 52 52 Q 40 60 28 52 Z" fill="#ffffff" stroke="#94a3b8" strokeWidth="1.5" />
          {/* Eyes */}
          <circle cx="34" cy="42" r="2.5" fill="#0f172a" />
          <circle cx="46" cy="42" r="2.5" fill="#0f172a" />
          {/* Nose */}
          <circle cx="40" cy="46" r="3.5" fill="#f97316" />
        </svg>
      )}

      {speaker === 'clucky' && (
        <svg viewBox="0 0 80 80" className="w-full h-full">
          {/* Chicken Head */}
          <circle cx="40" cy="44" r="24" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" />
          {/* Red Comb */}
          <path d="M 32 24 Q 36 12 40 24 Q 44 14 48 24 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" />
          {/* Shower cap bubbles! */}
          <circle cx="28" cy="22" r="6" fill="#bae6fd" opacity="0.8" />
          <circle cx="52" cy="22" r="6" fill="#bae6fd" opacity="0.8" />
          {/* Beak */}
          <path d="M 35 44 L 45 44 L 40 54 Z" fill="#f97316" stroke="#c2410c" strokeWidth="2" />
          {/* Eyes */}
          <circle cx="32" cy="38" r="3" fill="#0f172a" />
          <circle cx="31" cy="37" r="1" fill="#ffffff" />
          <circle cx="48" cy="38" r="3" fill="#0f172a" />
          <circle cx="47" cy="37" r="1" fill="#ffffff" />
        </svg>
      )}

      {speaker === 'mr_sludge' && (
        <svg viewBox="0 0 80 80" className="w-full h-full">
          {/* Sludge Character / Factory Boss */}
          <circle cx="40" cy="45" r="24" fill="#a855f7" stroke="#7e22ce" strokeWidth="2" />
          {/* Yellow Top Hat */}
          <rect x="28" y="12" width="24" height="20" fill="#334155" stroke="#0f172a" strokeWidth="2" />
          <line x1="20" y1="32" x2="60" y2="32" stroke="#0f172a" strokeWidth="3" />
          {/* Swirly silly eyes */}
          <circle cx="32" cy="45" r="5" fill="#fef08a" stroke="#854d0e" strokeWidth="1.5" />
          <circle cx="32" cy="45" r="2" fill="#0f172a" />
          <circle cx="48" cy="45" r="5" fill="#fef08a" stroke="#854d0e" strokeWidth="1.5" />
          <circle cx="48" cy="45" r="2" fill="#0f172a" />
          {/* Confused smile */}
          <path d="M 32 58 Q 40 52 48 58" stroke="#0f172a" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </svg>
      )}

      {speaker === 'mayor_puddle' && (
        <svg viewBox="0 0 80 80" className="w-full h-full">
          {/* Mayor Face */}
          <circle cx="40" cy="46" r="22" fill="#fed7aa" stroke="#c2410c" strokeWidth="2" />
          {/* Golden Mayor Chain / Sash */}
          <path d="M 22 58 Q 40 68 58 58" stroke="#eab308" strokeWidth="4" fill="none" />
          {/* Top Hat */}
          <rect x="28" y="10" width="24" height="22" fill="#1e293b" rx="2" />
          <line x1="18" y1="32" x2="62" y2="32" stroke="#1e293b" strokeWidth="3" />
          {/* Monocle */}
          <circle cx="34" cy="44" r="5" stroke="#eab308" strokeWidth="1.5" fill="#e0f2fe" fillOpacity="0.4" />
          <circle cx="46" cy="44" r="2.5" fill="#0f172a" />
          <path d="M 36 54 Q 40 58 44 54" stroke="#0f172a" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      )}

      {speaker === 'pippin_penny' && (
        <svg viewBox="0 0 80 80" className="w-full h-full">
          {/* Pig (Pippin) */}
          <circle cx="30" cy="45" r="18" fill="#f472b6" stroke="#db2777" strokeWidth="2" />
          <ellipse cx="30" cy="50" rx="7" ry="5" fill="#fbcfe8" />
          <circle cx="28" cy="50" r="1.5" fill="#9d174d" />
          <circle cx="32" cy="50" r="1.5" fill="#9d174d" />
          <circle cx="25" cy="40" r="2" fill="#0f172a" />
          <circle cx="35" cy="40" r="2" fill="#0f172a" />
          {/* Duck (Penny) peering behind */}
          <circle cx="56" cy="38" r="14" fill="#fde047" stroke="#ca8a04" strokeWidth="2" />
          <path d="M 62 38 L 72 40 L 62 43 Z" fill="#f97316" />
          <circle cx="54" cy="34" r="2" fill="#0f172a" />
        </svg>
      )}

      {speaker === 'dr_flow' && (
        <svg viewBox="0 0 80 80" className="w-full h-full">
          {/* Doctor with mirror head band */}
          <circle cx="40" cy="46" r="22" fill="#fed7aa" stroke="#0284c7" strokeWidth="2" />
          {/* Headband with reflector */}
          <line x1="18" y1="36" x2="62" y2="36" stroke="#0284c7" strokeWidth="3" />
          <circle cx="40" cy="32" r="7" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" />
          {/* Glasses */}
          <circle cx="34" cy="45" r="4.5" stroke="#334155" strokeWidth="1.5" fill="#ffffff" fillOpacity="0.3" />
          <circle cx="46" cy="45" r="4.5" stroke="#334155" strokeWidth="1.5" fill="#ffffff" fillOpacity="0.3" />
          <line x1="38.5" y1="45" x2="41.5" y2="45" stroke="#334155" strokeWidth="1.5" />
          <path d="M 36 56 Q 40 60 44 56" stroke="#0f172a" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      )}

      {speaker === 'drippy' && (
        <svg viewBox="0 0 80 80" className="w-full h-full">
          {/* Cute Mischievous Tiny Drop */}
          <path
            d="M 40 16 C 48 28, 64 42, 64 56 C 64 70, 52 76, 40 76 C 28 76, 16 70, 16 56 C 16 42, 32 28, 40 16 Z"
            fill="#a7f3d0"
            stroke="#059669"
            strokeWidth="2.5"
          />
          {/* Mischievous Eyes */}
          <circle cx="32" cy="48" r="3.5" fill="#065f46" />
          <circle cx="48" cy="48" r="3.5" fill="#065f46" />
          {/* Cute Tongue */}
          <path d="M 36 58 Q 40 66 44 58 Z" fill="#fb7185" stroke="#065f46" strokeWidth="1.5" />
        </svg>
      )}
    </div>
  );
};
