import React from 'react';
import { 
  Building2, 
  Wrench, 
  Hammer, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  ShieldCheck, 
  AlertTriangle,
  Info,
  Layers,
  Flame
} from 'lucide-react';
import { Building } from '../types';
import { DraggableItem } from './RescueRepairOverlay';
import { 
  ConcreteBricksIcon2D, 
  RoofBeamsIcon2D, 
  HeavyWelderIcon2D 
} from './MedicalSupplyIcons2D';

export type BuildingSectionId = 'roof' | 'cracked_wall_left' | 'cracked_wall_right' | 'broken_window' | 'power_junction';

export interface BuildingBrokenSection {
  id: BuildingSectionId;
  name: string;
  damageDesc: string;
  actionRequired: string;
  suggestedMaterial: string;
  materialType: 'roof' | 'bricks' | 'welder';
  isRepaired: boolean;
  requiredItemTypes: string[];
  targetArea: {
    cx: number;
    cy: number;
    rx: number;
    ry: number;
    label: string;
  };
}

interface TwoDimensionalBuildingRepairProps {
  building: Building;
  activeDragItem: DraggableItem | null;
  hoveredSection: BuildingSectionId | null;
  onHoverSection: (sectionId: BuildingSectionId | null) => void;
  onRepairSection: (sectionId: BuildingSectionId, item?: DraggableItem) => void;
  repairedSections: Record<string, boolean>; // key: `${building.id}_${sectionId}`
  justRepairedSection: BuildingSectionId | null;
}

export const TwoDimensionalBuildingRepair: React.FC<TwoDimensionalBuildingRepairProps> = ({
  building,
  activeDragItem,
  hoveredSection,
  onHoverSection,
  onRepairSection,
  repairedSections,
  justRepairedSection,
}) => {
  // Define architectural broken sections for this building
  const sections: BuildingBrokenSection[] = [
    {
      id: 'roof',
      name: 'Damaged Roof & Gables',
      damageDesc: 'Collapsed rafters, shattered tiles, and exposed roof truss',
      actionRequired: 'Fit steel roof beams & weather-sealed shingles',
      suggestedMaterial: 'Steel Roof Beams',
      materialType: 'roof',
      isRepaired: repairedSections[`${building.id}_roof`] || building.isRepaired,
      requiredItemTypes: ['MATERIAL', 'item_roof_beams', 'item_repair_mats'],
      targetArea: { cx: 200, cy: 90, rx: 75, ry: 30, label: 'Damaged Roof' },
    },
    {
      id: 'cracked_wall_left',
      name: 'Cracked West Wall & Masonry',
      damageDesc: 'Deep structural fissure and crumbling load-bearing bricks',
      actionRequired: 'Inject structural concrete & reinforce foundation',
      suggestedMaterial: 'Wall Bricks & Concrete',
      materialType: 'bricks',
      isRepaired: repairedSections[`${building.id}_cracked_wall_left`] || building.isRepaired,
      requiredItemTypes: ['MATERIAL', 'item_bricks', 'item_repair_mats'],
      targetArea: { cx: 125, cy: 220, rx: 32, ry: 45, label: 'Cracked Left Wall' },
    },
    {
      id: 'cracked_wall_right',
      name: 'Cracked East Facade & Pillar',
      damageDesc: 'Displaced exterior masonry and severed corner support',
      actionRequired: 'Align support jacks & lay insulated brickwork',
      suggestedMaterial: 'Wall Bricks & Concrete',
      materialType: 'bricks',
      isRepaired: repairedSections[`${building.id}_cracked_wall_right`] || building.isRepaired,
      requiredItemTypes: ['MATERIAL', 'item_bricks', 'item_repair_mats'],
      targetArea: { cx: 275, cy: 220, rx: 32, ry: 45, label: 'Cracked Right Facade' },
    },
    {
      id: 'broken_window',
      name: 'Shattered Windows & Frames',
      damageDesc: 'Blown-out double pane glass with jagged exposed frames',
      actionRequired: 'Install reinforced architectural glazing',
      suggestedMaterial: 'Heavy Welder & Glass',
      materialType: 'welder',
      isRepaired: repairedSections[`${building.id}_broken_window`] || building.isRepaired,
      requiredItemTypes: ['MATERIAL', 'item_welder', 'item_repair_mats'],
      targetArea: { cx: 200, cy: 190, rx: 35, ry: 25, label: 'Broken Windows' },
    },
    {
      id: 'power_junction',
      name: 'Severed Power & Utility Hub',
      damageDesc: 'Sparking electrical conduits and disabled emergency circuit',
      actionRequired: 'Weld grounding bus & reconnect regional power',
      suggestedMaterial: 'Heavy Welder & Glass',
      materialType: 'welder',
      isRepaired: repairedSections[`${building.id}_power_junction`] || building.isRepaired,
      requiredItemTypes: ['MATERIAL', 'item_welder', 'item_repair_mats'],
      targetArea: { cx: 200, cy: 330, rx: 40, ry: 30, label: 'Power Junction' },
    },
  ];

  const totalSections = sections.length;
  const repairedCount = sections.filter(s => s.isRepaired).length;
  const isFullyRestored = repairedCount === totalSections || building.isRepaired;
  const calculatedIntegrity = Math.min(100, Math.max(15, Math.round((repairedCount / totalSections) * 100)));

  return (
    <div className="w-full bg-[#0a0a0c] border border-amber-500/30 rounded-xl p-3 sm:p-5 shadow-2xl relative overflow-hidden">
      {/* Background Blueprint Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f59e0b10_1px,transparent_1px),linear-gradient(to_bottom,#f59e0b10_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

      {/* Top Building Info Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3 mb-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
            isFullyRestored 
              ? 'bg-amber-500/20 border-amber-400 text-amber-400' 
              : 'bg-orange-500/20 border-orange-500 text-orange-400 animate-pulse'
          }`}>
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white">{building.name}</h3>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/10 text-amber-400 border border-amber-400/20">
                {building.type}
              </span>
            </div>
            <p className="text-xs text-white/50">{building.benefits}</p>
          </div>
        </div>

        {/* Live Integrity Diagnostic */}
        <div className="flex items-center gap-2 sm:gap-4 bg-[#151518] border border-white/10 px-3 py-1.5 rounded-lg text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className={`w-4 h-4 ${isFullyRestored ? 'text-amber-400' : 'text-orange-400'}`} />
            <span className="text-white/60">Integrity:</span>
            <strong className={isFullyRestored ? 'text-amber-400' : 'text-orange-400'}>
              {calculatedIntegrity}%
            </strong>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-1.5">
            <Zap className={`w-4 h-4 ${isFullyRestored ? 'text-emerald-400' : 'text-rose-500 animate-pulse'}`} />
            <span className="text-white/60">Power Grid:</span>
            <strong className={isFullyRestored ? 'text-emerald-400' : 'text-rose-400'}>
              {isFullyRestored ? 'ONLINE (100%)' : 'OFFLINE'}
            </strong>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-1.5">
            <span className="text-white/60">Reconstruction:</span>
            <strong className="text-amber-400">{repairedCount}/{totalSections} Sections</strong>
          </div>
        </div>
      </div>

      {/* Main 2D Interactive Building Architectural Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center relative z-10">
        
        {/* Left Side: 2D Building Diagram */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative bg-[#121215] border border-white/10 rounded-xl p-3 sm:p-4 overflow-hidden">
          
          {/* Dynamic Click Hint Floating Banner */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-mono bg-black/70 backdrop-blur-md px-3 py-1.5 rounded border border-white/10 z-20">
            <span className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Wrench className="w-3.5 h-3.5" />
              <span>2D BUILDING REPAIR & RECONSTRUCTION</span>
            </span>
            <span className="text-white/70 text-[10px]">
              ⚡ Click any broken section or card below to repair
            </span>
          </div>

          {/* Interactive SVG Building Graphic */}
          <div className="relative w-full max-w-[420px] aspect-[420/440] flex items-center justify-center my-2">
            <svg 
              viewBox="0 0 420 440" 
              className="w-full h-full drop-shadow-2xl select-none"
            >
              <defs>
                {/* Glowing Gradients */}
                <radialGradient id="repairGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="damageGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.7" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </radialGradient>
                <pattern id="brickPattern" width="16" height="8" patternUnits="userSpaceOnUse">
                  <path d="M0 0h16v8H0z" fill="#1e293b" />
                  <path d="M0 4h16 M8 0v4 M0 4v4 M16 4v4" stroke="#334155" strokeWidth="1" />
                </pattern>
                <pattern id="repairedBrickPattern" width="16" height="8" patternUnits="userSpaceOnUse">
                  <path d="M0 0h16v8H0z" fill="#0f172a" />
                  <path d="M0 4h16 M8 0v4 M0 4v4 M16 4v4" stroke="#475569" strokeWidth="1" />
                </pattern>
              </defs>

              {/* Ground Shadow & Foundation Floor */}
              <ellipse cx="210" cy="415" rx="190" ry="18" fill="#000000" fillOpacity="0.5" />
              <rect x="50" y="390" width="320" height="24" rx="4" fill="#0f172a" stroke="#334155" strokeWidth="2" />

              {/* --- MAIN STRUCTURE BODY --- */}
              <rect 
                x="80" 
                y="130" 
                width="260" 
                height="260" 
                fill={isFullyRestored ? "url(#repairedBrickPattern)" : "url(#brickPattern)"} 
                stroke="#475569" 
                strokeWidth="3" 
                rx="4"
              />

              {/* --- 1. ROOF SECTION --- */}
              {sections[0].isRepaired ? (
                // Fully Restored Reinforced Roof
                <g id="2d-repaired-roof">
                  <polygon points="210,40 50,130 370,130" fill="#0284c7" stroke="#38bdf8" strokeWidth="3" />
                  <polygon points="210,55 75,130 345,130" fill="#0369a1" />
                  {/* Steel Trusses */}
                  <line x1="210" y1="40" x2="210" y2="130" stroke="#bae6fd" strokeWidth="2.5" />
                  <line x1="130" y1="85" x2="210" y2="130" stroke="#bae6fd" strokeWidth="2" />
                  <line x1="290" y1="85" x2="210" y2="130" stroke="#bae6fd" strokeWidth="2" />
                  {/* Shingle detail lines */}
                  <line x1="110" y1="100" x2="310" y2="100" stroke="#0284c7" strokeWidth="2" />
                  <circle cx="210" cy="40" r="6" fill="#38bdf8" />
                </g>
              ) : (
                // Broken & Collapsed Roof
                <g id="2d-broken-roof">
                  <circle cx="200" cy="90" r="45" fill="url(#damageGlow)" className="animate-pulse" />
                  <polygon points="210,40 50,130 180,130 190,95 210,110 240,90 260,130 370,130" fill="#451a03" stroke="#ef4444" strokeWidth="2.5" />
                  {/* Jagged holes & splintered rafters */}
                  <polygon points="175,85 205,120 185,130" fill="#000000" />
                  <polygon points="225,95 255,125 240,130" fill="#000000" />
                  <line x1="160" y1="65" x2="190" y2="105" stroke="#f87171" strokeWidth="3" />
                  <line x1="260" y1="65" x2="230" y2="105" stroke="#f87171" strokeWidth="3" />
                </g>
              )}

              {/* --- 2. CRACKED WEST WALL (LEFT) --- */}
              {sections[1].isRepaired ? (
                // Repaired & Reinforced West Wall
                <g id="2d-repaired-left-wall">
                  <rect x="82" y="140" width="70" height="180" fill="#1e293b" fillOpacity="0.4" />
                  {/* Reinforced Titanium / Steel Support Pillar */}
                  <rect x="85" y="140" width="16" height="248" fill="#334155" stroke="#f59e0b" strokeWidth="1.5" />
                  <line x1="93" y1="140" x2="93" y2="388" stroke="#fef08a" strokeWidth="2" strokeDasharray="6,4" />
                  <circle cx="93" cy="200" r="3" fill="#10b981" />
                  <circle cx="93" cy="280" r="3" fill="#10b981" />
                </g>
              ) : (
                // Severe Wall Fracture
                <g id="2d-broken-left-wall">
                  <circle cx="125" cy="220" r="32" fill="url(#damageGlow)" className="animate-pulse" />
                  <path d="M100,150 L115,190 L95,230 L120,270 L105,320" stroke="#ef4444" strokeWidth="4" fill="none" strokeLinecap="round" />
                  <path d="M115,190 L135,210" stroke="#dc2626" strokeWidth="2.5" fill="none" />
                  <path d="M95,230 L80,245" stroke="#dc2626" strokeWidth="2.5" fill="none" />
                  <polygon points="105,210 115,225 100,230" fill="#000000" />
                </g>
              )}

              {/* --- 3. CRACKED EAST FACADE (RIGHT) --- */}
              {sections[2].isRepaired ? (
                // Repaired East Facade
                <g id="2d-repaired-right-wall">
                  <rect x="268" y="140" width="70" height="180" fill="#1e293b" fillOpacity="0.4" />
                  {/* Reinforced Support Column */}
                  <rect x="319" y="140" width="16" height="248" fill="#334155" stroke="#f59e0b" strokeWidth="1.5" />
                  <line x1="327" y1="140" x2="327" y2="388" stroke="#fef08a" strokeWidth="2" strokeDasharray="6,4" />
                  <circle cx="327" cy="200" r="3" fill="#10b981" />
                  <circle cx="327" cy="280" r="3" fill="#10b981" />
                </g>
              ) : (
                // Deep Facade Fracture
                <g id="2d-broken-right-wall">
                  <circle cx="275" cy="220" r="32" fill="url(#damageGlow)" className="animate-pulse" />
                  <path d="M315,150 L295,195 L320,240 L290,285 L310,330" stroke="#ef4444" strokeWidth="4" fill="none" strokeLinecap="round" />
                  <path d="M295,195 L275,215" stroke="#dc2626" strokeWidth="2.5" fill="none" />
                  <polygon points="300,215 315,230 305,240" fill="#000000" />
                </g>
              )}

              {/* --- 4. WINDOWS SECTION --- */}
              {sections[3].isRepaired ? (
                // Repaired Reinforced Architectural Glazing
                <g id="2d-repaired-windows">
                  {/* Window Frame Left */}
                  <rect x="150" y="165" width="45" height="55" rx="3" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
                  <line x1="172.5" y1="165" x2="172.5" y2="220" stroke="#38bdf8" strokeWidth="2" />
                  <line x1="150" y1="192.5" x2="195" y2="192.5" stroke="#38bdf8" strokeWidth="2" />
                  <polygon points="152,167 170,167 152,190" fill="#ffffff" fillOpacity="0.4" />

                  {/* Window Frame Right */}
                  <rect x="225" y="165" width="45" height="55" rx="3" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
                  <line x1="247.5" y1="165" x2="247.5" y2="220" stroke="#38bdf8" strokeWidth="2" />
                  <line x1="225" y1="192.5" x2="270" y2="192.5" stroke="#38bdf8" strokeWidth="2" />
                  <polygon points="227,167 245,167 227,190" fill="#ffffff" fillOpacity="0.4" />
                </g>
              ) : (
                // Shattered Windows
                <g id="2d-broken-windows">
                  <circle cx="210" cy="190" r="38" fill="url(#damageGlow)" className="animate-pulse" />
                  <rect x="150" y="165" width="45" height="55" rx="3" fill="#0f172a" stroke="#ef4444" strokeWidth="2" />
                  <path d="M152,170 L170,195 L160,218" stroke="#f87171" strokeWidth="2" fill="none" />
                  <polygon points="175,170 190,190 180,195" fill="#ef4444" opacity="0.4" />

                  <rect x="225" y="165" width="45" height="55" rx="3" fill="#0f172a" stroke="#ef4444" strokeWidth="2" />
                  <path d="M227,175 L250,190 L235,215" stroke="#f87171" strokeWidth="2" fill="none" />
                  <polygon points="250,170 268,185 260,200" fill="#ef4444" opacity="0.4" />
                </g>
              )}

              {/* --- 5. POWER & UTILITY JUNCTION (DOOR / BASE) --- */}
              {sections[4].isRepaired ? (
                // Energized Power Junction & Reinforced Door
                <g id="2d-repaired-power-junction">
                  <rect x="165" y="275" width="90" height="115" rx="4" fill="#0f172a" stroke="#10b981" strokeWidth="2.5" />
                  {/* Security Door Paneling */}
                  <rect x="175" y="285" width="70" height="95" rx="2" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
                  {/* Energized Indicator & Conduit */}
                  <circle cx="210" cy="305" r="8" fill="#10b981" className="animate-pulse" />
                  <Zap className="w-3.5 h-3.5 text-black" x="203" y="298" />
                  <line x1="165" y1="330" x2="255" y2="330" stroke="#10b981" strokeWidth="2" strokeDasharray="4,2" />
                  <line x1="210" y1="315" x2="210" y2="380" stroke="#10b981" strokeWidth="2" />
                </g>
              ) : (
                // Sparking Short-Circuited Junction
                <g id="2d-broken-power-junction">
                  <circle cx="210" cy="330" r="36" fill="url(#damageGlow)" className="animate-pulse" />
                  <rect x="165" y="275" width="90" height="115" rx="4" fill="#18181b" stroke="#ef4444" strokeWidth="2" />
                  {/* Severed Wires with Sparks */}
                  <path d="M185,290 Q170,320 195,330" stroke="#f59e0b" strokeWidth="2.5" fill="none" strokeDasharray="3,2" />
                  <path d="M235,290 Q250,320 225,330" stroke="#38bdf8" strokeWidth="2.5" fill="none" strokeDasharray="3,2" />
                  <polygon points="205,320 215,310 210,325 220,315 212,335" fill="#fef08a" stroke="#f59e0b" strokeWidth="1" />
                </g>
              )}

              {/* --- INTERACTIVE CLICK TARGET ZONES --- */}
              {sections.map((sec) => {
                const isHovered = hoveredSection === sec.id;
                const isRepairingThis = justRepairedSection === sec.id;

                return (
                  <g 
                    key={sec.id}
                    id={`building-section-target-${sec.id}`}
                    className="cursor-pointer"
                    onPointerEnter={() => onHoverSection(sec.id)}
                    onPointerLeave={() => {
                      if (hoveredSection === sec.id) onHoverSection(null);
                    }}
                    onClick={() => {
                      onRepairSection(sec.id, activeDragItem || undefined);
                    }}
                  >
                    {/* Pulsing Target Ring */}
                    <ellipse
                      cx={sec.targetArea.cx}
                      cy={sec.targetArea.cy}
                      rx={sec.targetArea.rx + (isHovered ? 8 : 0)}
                      ry={sec.targetArea.ry + (isHovered ? 8 : 0)}
                      fill={
                        sec.isRepaired
                          ? 'transparent'
                          : isHovered
                            ? 'rgba(245, 158, 11, 0.35)'
                            : 'rgba(239, 68, 68, 0.2)'
                      }
                      stroke={
                        sec.isRepaired
                          ? 'transparent'
                          : isHovered
                            ? '#f59e0b'
                            : '#f87171'
                      }
                      strokeWidth={isHovered ? 3.5 : 2}
                      strokeDasharray={sec.isRepaired ? 'none' : '6,4'}
                      className={!sec.isRepaired ? 'transition-all duration-150' : ''}
                    />

                    {/* Interactive Target Reticle */}
                    {!sec.isRepaired && (
                      <g transform={`translate(${sec.targetArea.cx - 13}, ${sec.targetArea.cy - 13})`}>
                        <circle cx="13" cy="13" r="13" fill="#0f172a" stroke={isHovered ? '#f59e0b' : '#f87171'} strokeWidth="1.8" />
                        <line x1="13" y1="4" x2="13" y2="22" stroke={isHovered ? '#f59e0b' : '#f87171'} strokeWidth="1.8" />
                        <line x1="4" y1="13" x2="22" y2="13" stroke={isHovered ? '#f59e0b' : '#f87171'} strokeWidth="1.8" />
                        <circle cx="13" cy="13" r="3" fill={isHovered ? '#f59e0b' : '#f87171'} />
                      </g>
                    )}

                    {/* Just Repaired Sparkle Effect */}
                    {isRepairingThis && (
                      <g transform={`translate(${sec.targetArea.cx - 20}, ${sec.targetArea.cy - 20})`}>
                        <circle cx="20" cy="20" r="35" fill="url(#repairGlow)" className="animate-ping" />
                        <text x="20" y="25" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="bold" stroke="#000" strokeWidth="0.5">⚡ REPAIRED!</text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Structure Celebration Banner */}
          <div className="w-full mt-2 p-2.5 bg-black/60 border border-white/10 rounded-lg text-xs font-mono text-white flex items-center justify-between">
            <span className="italic text-amber-300">
              "{isFullyRestored ? "Structure 100% restored and power grid energized! Community shelter active." : building.description}"
            </span>
            <span className="text-[10px] font-bold text-white/50 shrink-0 ml-2">
              {repairedCount}/{totalSections} SECTIONS RESTORED
            </span>
          </div>
        </div>

        {/* Right Side: Specific Broken Sections Checklist with 2D Visual Icons */}
        <div className="lg:col-span-5 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-white uppercase tracking-wider mb-1">
            <span className="flex items-center gap-1.5 text-amber-400">
              <Hammer className="w-4 h-4" />
              <span>Architectural Damage Blueprint</span>
            </span>
            <span className="text-white/40 text-[10px]">
              {isFullyRestored ? 'ALL SECTIONS RESTORED' : 'CLICK TO REPAIR'}
            </span>
          </div>

          {/* Interactive Section Cards */}
          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            {sections.map((sec) => {
              const isHovered = hoveredSection === sec.id;

              return (
                <div
                  key={sec.id}
                  id={`section-card-${sec.id}`}
                  onPointerEnter={() => onHoverSection(sec.id)}
                  onPointerLeave={() => {
                    if (hoveredSection === sec.id) onHoverSection(null);
                  }}
                  onClick={() => {
                    onRepairSection(sec.id, activeDragItem || undefined);
                  }}
                  className={`p-2.5 rounded-lg border text-xs transition-all duration-150 relative cursor-pointer ${
                    sec.isRepaired
                      ? 'bg-amber-950/20 border-amber-500/30 text-white/70'
                      : isHovered
                        ? 'bg-amber-900/60 border-amber-400 ring-2 ring-amber-400 scale-[1.02] text-white shadow-lg'
                        : 'bg-[#151518] hover:bg-[#1c1c21] border-white/10 text-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    
                    {/* 2D Supply Material Icon Preview */}
                    <div className="shrink-0 pt-0.5">
                      {sec.materialType === 'roof' && <RoofBeamsIcon2D className="w-8 h-8" />}
                      {sec.materialType === 'bricks' && <ConcreteBricksIcon2D className="w-8 h-8" />}
                      {sec.materialType === 'welder' && <HeavyWelderIcon2D className="w-8 h-8" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-bold flex items-center gap-1.5 flex-wrap">
                        <span className={sec.isRepaired ? 'text-amber-400' : 'text-white'}>
                          {sec.name}
                        </span>
                        {!sec.isRepaired ? (
                          <span className="text-[9px] font-mono bg-orange-500/20 text-orange-400 border border-orange-500/30 px-1.5 py-0.5 rounded">
                            Damaged
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
                            Repaired
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] text-white/50 mt-0.5 leading-tight">
                        {sec.isRepaired ? (
                          <span className="text-amber-300/80 font-mono">Reinforced with {sec.suggestedMaterial} ✓</span>
                        ) : (
                          <span>{sec.damageDesc}</span>
                        )}
                      </div>

                      {!sec.isRepaired && (
                        <div className="text-[9px] font-mono text-amber-400 mt-1 flex items-center gap-1">
                          <span>Material:</span>
                          <strong className="text-amber-300">{sec.suggestedMaterial}</strong>
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center self-center">
                      {sec.isRepaired ? (
                        <span className="flex items-center gap-1 text-amber-400 font-mono text-[10px] font-bold bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" /> REPAIRED
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onRepairSection(sec.id, activeDragItem || undefined);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold font-mono text-[10px] uppercase flex items-center gap-1 active:scale-95 transition shadow"
                        >
                          <Wrench className="w-3 h-3" />
                          <span>REPAIR</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Help Tip */}
          <div className="mt-1 p-2 bg-black/40 border border-white/5 rounded text-[10px] font-mono text-white/60 flex items-center gap-2">
            <RoofBeamsIcon2D className="w-5 h-5 shrink-0" />
            <span>Click any damaged area or the <strong>REPAIR</strong> button to reconstruct using your materials.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
