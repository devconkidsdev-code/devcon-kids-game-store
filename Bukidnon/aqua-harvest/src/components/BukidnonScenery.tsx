import React from 'react';

interface BukidnonSceneryProps {
  level: number;
  timeLeft: number;
}

export const BukidnonScenery: React.FC<BukidnonSceneryProps> = ({ level, timeLeft }) => {
  const isUrgent = timeLeft <= 8 && timeLeft > 0;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
      {/* Base Frosted Glass Sky & Nature Gradient */}
      <div 
        className={`absolute inset-0 transition-colors duration-1000 ${
          isUrgent 
            ? 'bg-gradient-to-b from-[#b91c1c]/40 via-[#d97706]/40 to-[#1e3a1e]' 
            : level >= 4 
              ? 'bg-gradient-to-b from-[#0ea5e9]/40 via-[#4ade80]/30 to-[#1b4318]'
              : 'bg-gradient-to-b from-[#87CEEB] via-[#4ADE80]/40 to-[#2D5A27]'
        }`}
      />

      {/* Sky atmospheric top gradient */}
      <div className="absolute top-0 w-full h-[320px] bg-gradient-to-b from-[#87CEEB]/70 via-[#87CEEB]/30 to-transparent" />

      {/* Frosted Atmospheric Light Orbs */}
      <div className="absolute top-[100px] left-0 w-full flex justify-around opacity-35">
        <div className="w-[220px] h-[110px] bg-white blur-[45px] rounded-full" />
        <div className="w-[320px] h-[130px] bg-white blur-[55px] rounded-full mt-10" />
        <div className="w-[180px] h-[90px] bg-white blur-[35px] rounded-full" />
      </div>

      {/* Highland Sun / Frosted Glass Solar Glow */}
      <div className="absolute top-4 right-10 md:right-24 flex items-center justify-center">
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-white/40 blur-2xl animate-pulse" />
        <div className="absolute w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-tr from-yellow-300 via-amber-200 to-white/90 shadow-[0_0_50px_rgba(255,255,255,0.8)] border border-white/50 backdrop-blur-md" />
      </div>

      {/* Soft Mountain Silhouettes (Mount Kitanglad) */}
      <svg
        className="absolute bottom-28 md:bottom-32 left-0 right-0 w-full h-48 md:h-72 object-cover opacity-80"
        viewBox="0 0 1200 300"
        preserveAspectRatio="none"
      >
        {/* Far Kitanglad peak with frosted misty hue */}
        <polygon points="0,300 180,130 380,250 550,80 760,230 980,100 1200,270 1200,300" fill="#3b82f6" opacity="0.25" />
        {/* Mid highland ridges */}
        <polygon points="0,300 120,190 320,120 500,210 680,110 880,180 1080,130 1200,210 1200,300" fill="#15803d" opacity="0.45" />
        {/* Terraced pineapple hills with frosted lush gradient */}
        <polygon points="0,300 220,180 420,230 640,170 840,220 1060,160 1200,200 1200,300" fill="#14532d" opacity="0.75" />
      </svg>

      {/* Highland Terraces Lower Ridge with Frosted Tint */}
      <div className="absolute bottom-24 md:bottom-28 left-0 right-0 h-20 bg-gradient-to-t from-[#1b4318] via-[#245e20]/90 to-transparent" />
      
      {/* Bukidnon Farmland Deep Forest Ground Base */}
      <div className="absolute bottom-0 left-0 right-0 h-24 md:h-28 bg-[#173814] border-t border-white/15" />
      
      {/* Decorative Highland Grass & Flora */}
      <div className="absolute bottom-24 left-6 flex space-x-8 opacity-75">
        <span className="text-xl drop-shadow-sm">🌾</span>
        <span className="text-sm drop-shadow-sm">🌼</span>
        <span className="text-base drop-shadow-sm">🌾</span>
      </div>
      <div className="absolute bottom-24 right-10 flex space-x-6 opacity-75">
        <span className="text-base drop-shadow-sm">🌸</span>
        <span className="text-xl drop-shadow-sm">🌾</span>
        <span className="text-sm drop-shadow-sm">🌻</span>
      </div>
    </div>
  );
};
