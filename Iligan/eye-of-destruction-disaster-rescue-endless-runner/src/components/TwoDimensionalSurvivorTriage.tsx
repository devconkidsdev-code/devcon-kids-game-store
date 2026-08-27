import React from 'react';
import { 
  Heart, 
  Activity, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Stethoscope, 
  Smile, 
  Frown,
  Zap,
  Info
} from 'lucide-react';
import { Resident } from '../types';
import { DraggableItem } from './RescueRepairOverlay';
import { 
  BandageRollIcon2D, 
  GauzePadIcon2D, 
  CompressionSplintIcon2D, 
  AdhesiveBandageIcon2D 
} from './MedicalSupplyIcons2D';

export type BodyPartId = 'left_hand' | 'right_hand' | 'left_leg' | 'right_leg' | 'chest';

export interface BodyPartInjury {
  id: BodyPartId;
  name: string;
  injuryName: string;
  description: string;
  suggestedSupply: string;
  supplyType: 'bandage' | 'gauze' | 'splint';
  isHealed: boolean;
  requiredItemTypes: string[]; // ['MED', 'item_bandage', 'item_gauze', etc.]
  targetArea: {
    cx: number;
    cy: number;
    rx: number;
    ry: number;
    label: string;
  };
}

interface TwoDimensionalSurvivorTriageProps {
  resident: Resident;
  activeDragItem: DraggableItem | null;
  hoveredBodyPart: BodyPartId | null;
  onHoverBodyPart: (partId: BodyPartId | null) => void;
  onTreatBodyPart: (partId: BodyPartId, item?: DraggableItem) => void;
  healedParts: Record<string, boolean>; // key: `${resident.id}_${partId}`
  justHealedPart: BodyPartId | null;
}

export const TwoDimensionalSurvivorTriage: React.FC<TwoDimensionalSurvivorTriageProps> = ({
  resident,
  activeDragItem,
  hoveredBodyPart,
  onHoverBodyPart,
  onTreatBodyPart,
  healedParts,
  justHealedPart,
}) => {
  // Define anatomical injury zones with specific 2D bandage and gauze requirements
  const bodyParts: BodyPartInjury[] = [
    {
      id: 'left_hand',
      name: 'Left Hand & Wrist',
      injuryName: 'Laceration & Wrist Sprain',
      description: 'Open scrape with active bleeding from shattered glass and rubble',
      suggestedSupply: 'Elastic Bandage Roll',
      supplyType: 'bandage',
      isHealed: healedParts[`${resident.id}_left_hand`] || resident.isRescued,
      requiredItemTypes: ['MED', 'item_bandage', 'item_gauze', 'item_med_kit'],
      targetArea: { cx: 105, cy: 220, rx: 28, ry: 28, label: 'Injured Left Hand' },
    },
    {
      id: 'right_hand',
      name: 'Right Hand & Arm',
      injuryName: 'Deep Abrasion & Trauma',
      description: 'Exposed epidermal tearing requiring sterile cotton gauze dressing',
      suggestedSupply: 'Sterile Gauze Pad',
      supplyType: 'gauze',
      isHealed: healedParts[`${resident.id}_right_hand`] || resident.isRescued,
      requiredItemTypes: ['MED', 'item_bandage', 'item_gauze', 'item_med_kit'],
      targetArea: { cx: 295, cy: 220, rx: 28, ry: 28, label: 'Injured Right Hand' },
    },
    {
      id: 'left_leg',
      name: 'Left Leg & Knee',
      injuryName: 'Crush Trauma & Fracture',
      description: 'Severe bone fracture requiring rigid splint with tight gauze wrap',
      suggestedSupply: 'Compression Splint & Gauze',
      supplyType: 'splint',
      isHealed: healedParts[`${resident.id}_left_leg`] || resident.isRescued,
      requiredItemTypes: ['MED', 'item_trauma_splint', 'item_bandage', 'item_gauze', 'item_med_kit'],
      targetArea: { cx: 145, cy: 360, rx: 32, ry: 36, label: 'Crushed Left Leg' },
    },
    {
      id: 'right_leg',
      name: 'Right Leg & Ankle',
      injuryName: 'Sprained Ankle & Cut',
      description: 'Swollen ankle joint needing figure-8 elastic bandage stabilization',
      suggestedSupply: 'Elastic Bandage Wrap',
      supplyType: 'bandage',
      isHealed: healedParts[`${resident.id}_right_leg`] || resident.isRescued,
      requiredItemTypes: ['MED', 'item_bandage', 'item_gauze', 'item_trauma_splint', 'item_med_kit'],
      targetArea: { cx: 255, cy: 360, rx: 32, ry: 36, label: 'Injured Right Leg' },
    },
    {
      id: 'chest',
      name: 'Chest & Ribs',
      injuryName: 'Smoke Inhalation & Contusion',
      description: 'Restricted airflow and chest bruise needing sterile compress & oxygen',
      suggestedSupply: 'Sterile Gauze Compress',
      supplyType: 'gauze',
      isHealed: healedParts[`${resident.id}_chest`] || resident.isRescued,
      requiredItemTypes: ['MED', 'item_gauze', 'item_bandage', 'item_med_kit'],
      targetArea: { cx: 200, cy: 175, rx: 38, ry: 30, label: 'Chest Trauma' },
    },
  ];

  const totalParts = bodyParts.length;
  const healedCount = bodyParts.filter(p => p.isHealed).length;
  const isFullyRecovered = healedCount === totalParts || resident.isRescued;
  const calculatedHealth = Math.min(100, Math.max(20, Math.round((healedCount / totalParts) * 100)));

  return (
    <div className="w-full bg-[#0a0a0c] border border-emerald-500/30 rounded-xl p-3 sm:p-5 shadow-2xl relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

      {/* Top Triage Info Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3 mb-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
            isFullyRecovered 
              ? 'bg-emerald-500/20 border-emerald-400 text-emerald-400' 
              : 'bg-orange-500/20 border-orange-500 text-orange-400 animate-pulse'
          }`}>
            {isFullyRecovered ? (
              <Smile className="w-6 h-6" />
            ) : (
              <Frown className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white">{resident.name}</h3>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/10 text-emerald-400 border border-emerald-400/20">
                {resident.role}
              </span>
            </div>
            <p className="text-xs text-white/50">{resident.story}</p>
          </div>
        </div>

        {/* Live Vitals Indicator */}
        <div className="flex items-center gap-2 sm:gap-4 bg-[#151518] border border-white/10 px-3 py-1.5 rounded-lg text-xs font-mono">
          <div className="flex items-center gap-1.5">
            <Heart className={`w-4 h-4 ${isFullyRecovered ? 'text-emerald-400' : 'text-rose-500 animate-ping'}`} />
            <span className="text-white/60">Condition:</span>
            <strong className={isFullyRecovered ? 'text-emerald-400' : 'text-rose-400'}>
              {isFullyRecovered ? 'STABILIZED (100%)' : `CRITICAL (${calculatedHealth}%)`}
            </strong>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="text-white/60">Pulse:</span>
            <span className="text-emerald-400 font-bold">{isFullyRecovered ? '72 BPM' : '118 BPM'}</span>
          </div>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-1.5">
            <span className="text-white/60">Bandaged:</span>
            <strong className="text-emerald-400">{healedCount}/{totalParts} Limbs</strong>
          </div>
        </div>
      </div>

      {/* Main 2D Interactive Anatomical Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center relative z-10">
        
        {/* Left Side: 2D Anatomical Character Diagram */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative bg-[#121215] border border-white/10 rounded-xl p-3 sm:p-4 overflow-hidden">
          
          {/* Dynamic Click Hint Floating Banner */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between text-[11px] font-mono bg-black/70 backdrop-blur-md px-3 py-1.5 rounded border border-white/10 z-20">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>2D ANATOMICAL TRIAGE DIAGNOSTIC</span>
            </span>
            <span className="text-white/70 text-[10px]">
              🎯 Click any injury or card below to apply Bandages & Gauze
            </span>
          </div>

          {/* Interactive SVG Human Anatomy Graphic */}
          <div className="relative w-full max-w-[380px] aspect-[380/440] flex items-center justify-center my-2">
            <svg 
              viewBox="0 0 400 440" 
              className="w-full h-full drop-shadow-2xl select-none"
            >
              <defs>
                {/* Glowing Aura Gradients */}
                <radialGradient id="healGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="injuryGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="skinTone" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fed7aa" />
                  <stop offset="100%" stopColor="#fba779" />
                </linearGradient>
                <linearGradient id="clothTone" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#334155" />
                  <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>
                <linearGradient id="pantsTone" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
                <linearGradient id="bandagePattern" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="50%" stopColor="#fef3c7" />
                  <stop offset="100%" stopColor="#fde68a" />
                </linearGradient>
              </defs>

              {/* Shadow Base */}
              <ellipse cx="200" cy="415" rx="120" ry="14" fill="#000000" fillOpacity="0.5" />

              {/* --- HEAD & FACE --- */}
              <g id="2d-survivor-head">
                {/* Hair */}
                <path d="M165,65 Q200,30 235,65 Q245,95 235,105 Q200,90 165,105 Z" fill="#451a03" />
                {/* Face */}
                <ellipse cx="200" cy="80" rx="30" ry="34" fill="url(#skinTone)" stroke="#ea580c" strokeWidth="1" />
                {/* Eyes */}
                {isFullyRecovered ? (
                  <g stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round">
                    {/* Happy eyes */}
                    <path d="M188,78 Q192,72 196,78" fill="none" />
                    <path d="M204,78 Q208,72 212,78" fill="none" />
                  </g>
                ) : (
                  <g fill="#1e293b">
                    {/* Distressed eyes */}
                    <ellipse cx="190" cy="78" rx="2.5" ry="3" />
                    <ellipse cx="210" cy="78" rx="2.5" ry="3" />
                    {/* Pain eyebrows */}
                    <line x1="184" y1="72" x2="194" y2="75" stroke="#451a03" strokeWidth="2" />
                    <line x1="216" y1="72" x2="206" y2="75" stroke="#451a03" strokeWidth="2" />
                  </g>
                )}
                {/* Nose */}
                <path d="M200,82 L198,87 L202,87" stroke="#ea580c" strokeWidth="1.5" fill="none" />
                {/* Mouth */}
                {isFullyRecovered ? (
                  <path d="M192,95 Q200,103 208,95" stroke="#dc2626" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                ) : (
                  <path d="M192,98 Q200,92 208,98" stroke="#7f1d1d" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                )}
                {/* Dirt & Scratches on Face */}
                {!isFullyRecovered && (
                  <g stroke="#78350f" strokeWidth="1.5" strokeLinecap="round" opacity="0.6">
                    <line x1="178" y1="72" x2="185" y2="76" />
                    <line x1="215" y1="84" x2="223" y2="88" />
                  </g>
                )}
              </g>

              {/* --- TORSO & CHEST --- */}
              <g id="2d-survivor-torso">
                <path d="M165,114 L235,114 L245,230 L155,230 Z" fill="url(#clothTone)" stroke="#0f172a" strokeWidth="2" />
                {/* Collar */}
                <polygon points="185,114 200,130 215,114" fill="url(#skinTone)" />
                {/* Emergency responder belt / harness */}
                <line x1="155" y1="215" x2="245" y2="215" stroke="#f59e0b" strokeWidth="6" />
                <rect x="193" y="210" width="14" height="10" rx="2" fill="#cbd5e1" stroke="#475569" strokeWidth="1" />
              </g>

              {/* --- LEFT HAND & ARM (SURVIVOR'S RIGHT) --- */}
              <g id="2d-left-arm">
                {/* Upper arm */}
                <path d="M165,115 L125,180 L140,188 L175,130 Z" fill="url(#clothTone)" />
                {/* Forearm & Hand */}
                <path d="M125,180 L105,225 L92,218 L115,175 Z" fill="url(#skinTone)" stroke="#ea580c" strokeWidth="1" />
                <circle cx="100" cy="222" r="10" fill="url(#skinTone)" />
              </g>

              {/* --- RIGHT HAND & ARM (SURVIVOR'S LEFT) --- */}
              <g id="2d-right-arm">
                {/* Upper arm */}
                <path d="M235,115 L275,180 L260,188 L225,130 Z" fill="url(#clothTone)" />
                {/* Forearm & Hand */}
                <path d="M275,180 L295,225 L308,218 L285,175 Z" fill="url(#skinTone)" stroke="#ea580c" strokeWidth="1" />
                <circle cx="300" cy="222" r="10" fill="url(#skinTone)" />
              </g>

              {/* --- LEGS & PANTS --- */}
              <g id="2d-survivor-legs">
                {/* Left Leg */}
                <path d="M160,230 L135,325 L145,395 L120,400 L115,390 L125,320 L150,230 Z" fill="url(#pantsTone)" />
                {/* Left Boot */}
                <path d="M145,395 L115,395 L110,410 L155,410 Z" fill="#0f172a" stroke="#334155" strokeWidth="1" />

                {/* Right Leg */}
                <path d="M240,230 L265,325 L255,395 L280,400 L285,390 L275,320 L250,230 Z" fill="url(#pantsTone)" />
                {/* Right Boot */}
                <path d="M255,395 L285,395 L290,410 L245,410 Z" fill="#0f172a" stroke="#334155" strokeWidth="1" />
              </g>

              {/* ========================================================
                  DETAILED 2D WOUND DRESSINGS, BANDAGES & GAUZE
              ======================================================== */}

              {/* 1. LEFT HAND WOUND / BANDAGE */}
              {bodyParts[0].isHealed ? (
                // Authentic 2D Layered Elastic Bandage Wrap on Left Wrist
                <g id="2d-healed-left-hand-bandage">
                  <circle cx="105" cy="220" r="24" fill="#10b981" fillOpacity="0.15" />
                  {/* Spiral Elastic Bandage Layers */}
                  <rect x="92" y="202" width="26" height="36" rx="4" fill="url(#bandagePattern)" stroke="#059669" strokeWidth="1.5" transform="rotate(15 105 220)" />
                  <line x1="90" y1="210" x2="118" y2="216" stroke="#d97706" strokeWidth="1.5" strokeDasharray="3,2" />
                  <line x1="92" y1="222" x2="120" y2="228" stroke="#d97706" strokeWidth="1.5" strokeDasharray="3,2" />
                  {/* Metal Bandage Fastener Clip */}
                  <rect x="100" y="214" width="8" height="12" rx="1.5" fill="#94a3b8" stroke="#334155" strokeWidth="1" />
                  <circle cx="104" cy="217" r="1" fill="#0f172a" />
                  <circle cx="104" cy="223" r="1" fill="#0f172a" />
                  {/* Small Medical Cross Emblem */}
                  <rect x="99" y="204" width="10" height="3" fill="#10b981" rx="0.5" />
                  <rect x="102.5" y="200.5" width="3" height="10" fill="#10b981" rx="0.5" />
                </g>
              ) : (
                // Open Bleeding Laceration
                <g id="2d-injured-left-hand">
                  <circle cx="105" cy="220" r="22" fill="url(#injuryGlow)" className="animate-pulse" opacity="0.85" />
                  <path d="M96,212 Q105,225 114,216 Q108,230 102,232" stroke="#dc2626" strokeWidth="3" fill="none" strokeLinecap="round" />
                  <circle cx="104" cy="222" r="3" fill="#dc2626" />
                  <circle cx="98" cy="228" r="2" fill="#ef4444" />
                </g>
              )}

              {/* 2. RIGHT HAND WOUND / GAUZE PAD */}
              {bodyParts[1].isHealed ? (
                // Authentic 2D Sterile Cotton Gauze Pad with Medical Adhesive Tape
                <g id="2d-healed-right-hand-gauze">
                  <circle cx="295" cy="220" r="24" fill="#10b981" fillOpacity="0.15" />
                  {/* Square Cotton Gauze Dressing */}
                  <rect x="280" y="204" width="30" height="32" rx="3" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" transform="rotate(-10 295 220)" />
                  {/* Gauze Mesh Crosshatch Pattern */}
                  <g stroke="#94a3b8" strokeWidth="0.8" opacity="0.6">
                    <line x1="284" y1="210" x2="308" y2="210" />
                    <line x1="284" y1="216" x2="308" y2="216" />
                    <line x1="284" y1="222" x2="308" y2="222" />
                    <line x1="284" y1="228" x2="308" y2="228" />
                    <line x1="288" y1="206" x2="288" y2="232" />
                    <line x1="294" y1="206" x2="294" y2="232" />
                    <line x1="300" y1="206" x2="300" y2="232" />
                    <line x1="306" y1="206" x2="306" y2="232" />
                  </g>
                  {/* Adhesive Surgical Tape Strips (Crossed) */}
                  <rect x="272" y="217" width="46" height="6" rx="1" fill="#fef08a" fillOpacity="0.85" stroke="#eab308" strokeWidth="1" transform="rotate(-10 295 220)" />
                  <rect x="292" y="198" width="6" height="44" rx="1" fill="#fef08a" fillOpacity="0.85" stroke="#eab308" strokeWidth="1" transform="rotate(-10 295 220)" />
                  {/* Green Cross on Gauze */}
                  <rect x="292" y="218" width="6" height="2" fill="#10b981" />
                  <rect x="294" y="216" width="2" height="6" fill="#10b981" />
                </g>
              ) : (
                // Open Epidermal Abrasion
                <g id="2d-injured-right-hand">
                  <circle cx="295" cy="220" r="22" fill="url(#injuryGlow)" className="animate-pulse" opacity="0.85" />
                  <path d="M288,212 Q298,220 304,228 Q290,225 286,220" stroke="#dc2626" strokeWidth="3" fill="none" strokeLinecap="round" />
                  <circle cx="296" cy="218" r="3.5" fill="#dc2626" />
                  <circle cx="304" cy="225" r="2" fill="#ef4444" />
                </g>
              )}

              {/* 3. LEFT LEG TRAUMA / COMPRESSION SPLINT */}
              {bodyParts[2].isHealed ? (
                // Authentic 2D Orthopedic Leg Splint with Spiral Compression Bandage
                <g id="2d-healed-left-leg-splint">
                  <circle cx="145" cy="360" r="30" fill="#10b981" fillOpacity="0.15" />
                  {/* Rigid Orthopedic Support Bars */}
                  <rect x="122" y="325" width="6" height="70" rx="2" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
                  <rect x="156" y="325" width="6" height="70" rx="2" fill="#0284c7" stroke="#38bdf8" strokeWidth="1" />
                  {/* Spiral Elastic Compression Wrap */}
                  <rect x="124" y="332" width="36" height="12" rx="2" fill="url(#bandagePattern)" stroke="#059669" strokeWidth="1" transform="rotate(-5 142 338)" />
                  <rect x="124" y="352" width="36" height="12" rx="2" fill="url(#bandagePattern)" stroke="#059669" strokeWidth="1" transform="rotate(-5 142 358)" />
                  <rect x="124" y="372" width="36" height="12" rx="2" fill="url(#bandagePattern)" stroke="#059669" strokeWidth="1" transform="rotate(-5 142 378)" />
                  {/* Tightening Straps & Buckles */}
                  <circle cx="142" cy="338" r="3" fill="#f59e0b" />
                  <circle cx="142" cy="358" r="3" fill="#f59e0b" />
                  <circle cx="142" cy="378" r="3" fill="#f59e0b" />
                </g>
              ) : (
                // Severe Fracture & Crush Bleeding
                <g id="2d-injured-left-leg">
                  <circle cx="145" cy="360" r="28" fill="url(#injuryGlow)" className="animate-pulse" opacity="0.85" />
                  <path d="M135,340 L150,365 L138,385" stroke="#ef4444" strokeWidth="4" fill="none" strokeLinecap="round" />
                  <polygon points="142,355 148,360 140,365" fill="#dc2626" />
                  <circle cx="146" cy="362" r="3" fill="#7f1d1d" />
                </g>
              )}

              {/* 4. RIGHT LEG TRAUMA / FIGURE-8 BANDAGE WRAP */}
              {bodyParts[3].isHealed ? (
                // Authentic 2D Elastic Bandage Wrap on Right Ankle
                <g id="2d-healed-right-leg-bandage">
                  <circle cx="255" cy="360" r="30" fill="#10b981" fillOpacity="0.15" />
                  {/* Layered Elastic Wrappings */}
                  <rect x="238" y="335" width="34" height="14" rx="3" fill="url(#bandagePattern)" stroke="#059669" strokeWidth="1.2" transform="rotate(8 255 342)" />
                  <rect x="238" y="355" width="34" height="14" rx="3" fill="url(#bandagePattern)" stroke="#059669" strokeWidth="1.2" transform="rotate(-8 255 362)" />
                  <rect x="238" y="375" width="34" height="14" rx="3" fill="url(#bandagePattern)" stroke="#059669" strokeWidth="1.2" transform="rotate(6 255 382)" />
                  {/* Elastic Bandage Seam & Clips */}
                  <line x1="240" y1="342" x2="270" y2="342" stroke="#d97706" strokeWidth="1" strokeDasharray="2,2" />
                  <line x1="240" y1="362" x2="270" y2="362" stroke="#d97706" strokeWidth="1" strokeDasharray="2,2" />
                  <line x1="240" y1="382" x2="270" y2="382" stroke="#d97706" strokeWidth="1" strokeDasharray="2,2" />
                  <rect x="252" y="358" width="6" height="8" rx="1" fill="#94a3b8" />
                </g>
              ) : (
                // Ankle Sprain & Tissue Tear
                <g id="2d-injured-right-leg">
                  <circle cx="255" cy="360" r="28" fill="url(#injuryGlow)" className="animate-pulse" opacity="0.85" />
                  <path d="M265,345 L248,365 L260,380" stroke="#ef4444" strokeWidth="3.5" fill="none" strokeLinecap="round" />
                  <circle cx="254" cy="365" r="3" fill="#dc2626" />
                </g>
              )}

              {/* 5. CHEST CONTUSION / STERILE COMPRESS */}
              {bodyParts[4].isHealed ? (
                // Authentic 2D Sterile Chest Compress & Oxygen Cannula
                <g id="2d-healed-chest-compress">
                  <rect x="175" y="155" width="50" height="38" rx="4" fill="#ffffff" stroke="#10b981" strokeWidth="2" />
                  <g stroke="#cbd5e1" strokeWidth="0.8" opacity="0.7">
                    <line x1="180" y1="165" x2="220" y2="165" />
                    <line x1="180" y1="175" x2="220" y2="175" />
                    <line x1="180" y1="185" x2="220" y2="185" />
                  </g>
                  {/* Medical Red Cross on Chest Dressing */}
                  <rect x="195" y="167" width="10" height="14" fill="#dc2626" rx="1" />
                  <rect x="190" y="171" width="20" height="6" fill="#dc2626" rx="1" />
                  <circle cx="200" cy="174" r="18" fill="#10b981" fillOpacity="0.2" stroke="#10b981" strokeWidth="1.5" />
                </g>
              ) : (
                <g id="2d-hypoxia-chest">
                  <circle cx="200" cy="175" r="26" fill="url(#injuryGlow)" className="animate-pulse" opacity="0.85" />
                  <path d="M190,175 L196,168 L202,182 L206,173 L212,175" stroke="#ef4444" strokeWidth="2.5" fill="none" />
                </g>
              )}

              {/* --- INTERACTIVE 2D CLICK TARGET ZONES --- */}
              {bodyParts.map((part) => {
                const isHovered = hoveredBodyPart === part.id;
                const isHealingThis = justHealedPart === part.id;

                return (
                  <g 
                    key={part.id}
                    id={`bodypart-target-${part.id}`}
                    className="cursor-pointer"
                    onPointerEnter={() => onHoverBodyPart(part.id)}
                    onPointerLeave={() => {
                      if (hoveredBodyPart === part.id) onHoverBodyPart(null);
                    }}
                    onClick={() => {
                      onTreatBodyPart(part.id, activeDragItem || undefined);
                    }}
                  >
                    {/* Pulsing Target Ring */}
                    <ellipse
                      cx={part.targetArea.cx}
                      cy={part.targetArea.cy}
                      rx={part.targetArea.rx + (isHovered ? 8 : 0)}
                      ry={part.targetArea.ry + (isHovered ? 8 : 0)}
                      fill={
                        part.isHealed
                          ? 'transparent'
                          : isHovered
                            ? 'rgba(16, 185, 129, 0.45)'
                            : 'rgba(239, 68, 68, 0.2)'
                      }
                      stroke={
                        part.isHealed
                          ? 'transparent'
                          : isHovered
                            ? '#10b981'
                            : '#f87171'
                      }
                      strokeWidth={isHovered ? 3.5 : 2}
                      strokeDasharray={part.isHealed ? 'none' : '6,4'}
                      className={!part.isHealed ? 'transition-all duration-150' : ''}
                    />

                    {/* Interactive Target Reticle Icon with Crosshair */}
                    {!part.isHealed && (
                      <g transform={`translate(${part.targetArea.cx - 13}, ${part.targetArea.cy - 13})`}>
                        <circle cx="13" cy="13" r="13" fill="#0f172a" stroke={isHovered ? '#10b981' : '#f87171'} strokeWidth="1.8" />
                        <line x1="13" y1="4" x2="13" y2="22" stroke={isHovered ? '#10b981' : '#f87171'} strokeWidth="1.8" />
                        <line x1="4" y1="13" x2="22" y2="13" stroke={isHovered ? '#10b981' : '#f87171'} strokeWidth="1.8" />
                        <circle cx="13" cy="13" r="3" fill={isHovered ? '#10b981' : '#f87171'} />
                      </g>
                    )}

                    {/* Just Healed Sparkle Animation */}
                    {isHealingThis && (
                      <g transform={`translate(${part.targetArea.cx - 20}, ${part.targetArea.cy - 20})`}>
                        <circle cx="20" cy="20" r="32" fill="url(#healGlow)" className="animate-ping" />
                        <text x="20" y="25" textAnchor="middle" fill="#ffffff" fontSize="15" fontWeight="bold" stroke="#000" strokeWidth="0.5">✨ DRESSED!</text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Survivor Status Quote Badge */}
          <div className="w-full mt-2 p-2.5 bg-black/60 border border-white/10 rounded-lg text-xs font-mono text-white flex items-center justify-between">
            <span className="italic text-emerald-300">
              "{isFullyRecovered ? resident.thankYouQuote || "Rose! All my bandages and gauze are securely dressed. Thank you!" : resident.quote}"
            </span>
            <span className="text-[10px] font-bold text-white/50 shrink-0 ml-2">
              {healedCount}/{totalParts} INJURIES DRESSED
            </span>
          </div>
        </div>

        {/* Right Side: Visible Trauma Diagnostics with 2D Medical Supply Icons */}
        <div className="lg:col-span-5 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-white uppercase tracking-wider mb-1">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Stethoscope className="w-4 h-4" />
              <span>Visible Trauma Diagnostics</span>
            </span>
            <span className="text-white/40 text-[10px]">
              {isFullyRecovered ? 'ALL DRESSINGS APPLIED' : 'CLICK TO APPLY BANDAGE'}
            </span>
          </div>

          {/* Interactive Limb Cards with 2D Visual Items */}
          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            {bodyParts.map((part) => {
              const isHovered = hoveredBodyPart === part.id;

              return (
                <div
                  key={part.id}
                  id={`limb-card-${part.id}`}
                  onPointerEnter={() => onHoverBodyPart(part.id)}
                  onPointerLeave={() => {
                    if (hoveredBodyPart === part.id) onHoverBodyPart(null);
                  }}
                  onClick={() => {
                    onTreatBodyPart(part.id, activeDragItem || undefined);
                  }}
                  className={`p-2.5 rounded-lg border text-xs transition-all duration-150 relative cursor-pointer ${
                    part.isHealed
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-white/70'
                      : isHovered
                        ? 'bg-emerald-900/60 border-emerald-400 ring-2 ring-emerald-400 scale-[1.02] text-white shadow-lg'
                        : 'bg-[#151518] hover:bg-[#1c1c21] border-white/10 text-white'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    
                    {/* 2D Supply Icon Preview on Card */}
                    <div className="shrink-0 pt-0.5">
                      {part.supplyType === 'bandage' && <BandageRollIcon2D className="w-8 h-8" />}
                      {part.supplyType === 'gauze' && <GauzePadIcon2D className="w-8 h-8" />}
                      {part.supplyType === 'splint' && <CompressionSplintIcon2D className="w-8 h-8" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-bold flex items-center gap-1.5 flex-wrap">
                        <span className={part.isHealed ? 'text-emerald-400' : 'text-white'}>
                          {part.name}
                        </span>
                        {!part.isHealed ? (
                          <span className="text-[9px] font-mono bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded">
                            {part.injuryName}
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded">
                            Dressed
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] text-white/50 mt-0.5 leading-tight">
                        {part.isHealed ? (
                          <span className="text-emerald-300/80 font-mono">Dressed with {part.suggestedSupply} ✓</span>
                        ) : (
                          <span>{part.description}</span>
                        )}
                      </div>

                      {!part.isHealed && (
                        <div className="text-[9px] font-mono text-emerald-400 mt-1 flex items-center gap-1">
                          <span>Dressing:</span>
                          <strong className="text-emerald-300">{part.suggestedSupply}</strong>
                        </div>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center self-center">
                      {part.isHealed ? (
                        <span className="flex items-center gap-1 text-emerald-400 font-mono text-[10px] font-bold bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" /> DRESSED
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTreatBodyPart(part.id, activeDragItem || undefined);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold font-mono text-[10px] uppercase flex items-center gap-1 active:scale-95 transition shadow"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>TREAT</span>
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
            <BandageRollIcon2D className="w-5 h-5 shrink-0" />
            <span>Click any injured body part or the <strong>TREAT</strong> button to apply bandages & gauze dressings.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
