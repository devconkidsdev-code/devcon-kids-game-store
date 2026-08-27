import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, 
  BriefcaseMedical, 
  Wrench, 
  Building2, 
  Users, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  AlertCircle,
  Truck,
  ShieldCheck,
  Zap,
  Activity,
  ChevronLeft,
  ChevronRight,
  Flame,
  Stethoscope,
  Hammer,
  Radio,
  Eye,
  Info,
  GripVertical,
  XCircle,
  Check,
  Package,
  Layers,
  Sparkle,
  MousePointerClick
} from 'lucide-react';
import { DisasterArea, Resident, Building } from '../types';
import { sound } from '../audio/soundEffects';
import { TwoDimensionalSurvivorTriage, BodyPartId } from './TwoDimensionalSurvivorTriage';
import { TwoDimensionalBuildingRepair, BuildingSectionId } from './TwoDimensionalBuildingRepair';
import {
  BandageRollIcon2D,
  GauzePadIcon2D,
  CompressionSplintIcon2D,
  AdhesiveBandageIcon2D,
  ConcreteBricksIcon2D,
  RoofBeamsIcon2D,
  HeavyWelderIcon2D
} from './MedicalSupplyIcons2D';

export type DraggableItemType = 'MED' | 'MATERIAL';

export interface DraggableItem {
  id: string;
  type: DraggableItemType;
  name: string;
  shortLabel: string;
  cost: number;
  description: string;
  color: 'emerald' | 'amber';
  targetCategory: 'survivor' | 'building';
}

interface RescueRepairOverlayProps {
  area: DisasterArea;
  medSupplies: number;
  repairMaterials: number;
  onRescueResident: (residentId: string) => void;
  onRepairBuilding: (buildingId: string) => void;
  onAdvanceResidentTreatment: (residentId: string) => void;
  onAdvanceBuildingPhase: (buildingId: string) => void;
  selectedResidentId: string | null;
  selectedBuildingId: string | null;
  onSelectResident: (residentId: string | null) => void;
  onSelectBuilding: (buildingId: string | null) => void;
  onContinueToNextArea: () => void;
  onRestockSupplies: () => void;
  repairingBuildingId: string | null;
  repairProgress: number;
  raycastTarget?: (clientX: number, clientY: number) => { type: 'resident' | 'building'; id: string } | null;
}

export const RescueRepairOverlay: React.FC<RescueRepairOverlayProps> = ({
  area,
  medSupplies,
  repairMaterials,
  onRescueResident,
  onRepairBuilding,
  onAdvanceResidentTreatment,
  onAdvanceBuildingPhase,
  selectedResidentId,
  selectedBuildingId,
  onSelectResident,
  onSelectBuilding,
  onContinueToNextArea,
  onRestockSupplies,
  repairingBuildingId,
  repairProgress,
}) => {
  // Navigation / View Tabs
  type ViewMode = 'SURVIVOR_TRIAGE' | 'BUILDING_REPAIR' | 'SECTOR_OVERVIEW';
  const [viewMode, setViewMode] = useState<ViewMode>('SURVIVOR_TRIAGE');

  // Currently focused indices
  const [currentResidentIndex, setCurrentResidentIndex] = useState<number>(0);
  const [currentBuildingIndex, setCurrentBuildingIndex] = useState<number>(0);

  // Active 2D limb/section state tracking
  // Key format: `${residentId}_${bodyPartId}` -> boolean
  const [healedLimbsState, setHealedLimbsState] = useState<Record<string, boolean>>({});
  const [justHealedPart, setJustHealedPart] = useState<BodyPartId | null>(null);

  // Key format: `${buildingId}_${sectionId}` -> boolean
  const [repairedSectionsState, setRepairedSectionsState] = useState<Record<string, boolean>>({});
  const [justRepairedSection, setJustRepairedSection] = useState<BuildingSectionId | null>(null);

  // Hover states for previewing
  const [hoveredBodyPart, setHoveredBodyPart] = useState<BodyPartId | null>(null);
  const [hoveredBuildingSection, setHoveredBuildingSection] = useState<BuildingSectionId | null>(null);

  // Dynamic UI alerts and dialogues
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeDialogue, setActiveDialogue] = useState<{ name: string; quote: string } | null>(null);

  // 2D Supplies Rack with specific Bandages, Gauze, and Repair Materials
  const suppliesList: DraggableItem[] = [
    {
      id: 'item_bandage',
      type: 'MED',
      name: 'Elastic Bandage Roll',
      shortLabel: 'Bandage Roll',
      cost: 1,
      description: '2D rolled elastic bandage for wrapping sprains and securing dressings',
      color: 'emerald',
      targetCategory: 'survivor',
    },
    {
      id: 'item_gauze',
      type: 'MED',
      name: 'Sterile Cotton Gauze Pad',
      shortLabel: 'Gauze Pad',
      cost: 1,
      description: '2D sterile absorbent mesh gauze dressing for abrasions & deep wounds',
      color: 'emerald',
      targetCategory: 'survivor',
    },
    {
      id: 'item_trauma_splint',
      type: 'MED',
      name: 'Compression Splint & Wrap',
      shortLabel: 'Trauma Splint',
      cost: 1,
      description: '2D orthopedic fracture splint with tension gauze bandaging',
      color: 'emerald',
      targetCategory: 'survivor',
    },
    {
      id: 'item_bricks',
      type: 'MATERIAL',
      name: 'Structural Concrete & Bricks',
      shortLabel: 'Wall Bricks',
      cost: 1,
      description: 'Patches deep wall fissures and load-bearing pillars',
      color: 'amber',
      targetCategory: 'building',
    },
    {
      id: 'item_roof_beams',
      type: 'MATERIAL',
      name: 'Steel Roof Beams & Shingles',
      shortLabel: 'Roof Beams',
      cost: 1,
      description: 'Rebuilds collapsed roof gables and shingles',
      color: 'amber',
      targetCategory: 'building',
    },
    {
      id: 'item_welder',
      type: 'MATERIAL',
      name: 'Heavy Welder & Glass Panes',
      shortLabel: 'Welder & Glass',
      cost: 1,
      description: 'Restores shattered windows and power hubs',
      color: 'amber',
      targetCategory: 'building',
    },
  ];

  // Currently selected / equipped item (defaults to first medical item or material depending on tab)
  const [selectedSupplyItem, setSelectedSupplyItem] = useState<DraggableItem | null>(suppliesList[0]);

  // Helper to render 2D SVG supply illustration
  const renderSupplyIcon2D = (id: string, className = "w-8 h-8") => {
    switch (id) {
      case 'item_bandage':
        return <BandageRollIcon2D className={className} />;
      case 'item_gauze':
        return <GauzePadIcon2D className={className} />;
      case 'item_trauma_splint':
        return <CompressionSplintIcon2D className={className} />;
      case 'item_bricks':
        return <ConcreteBricksIcon2D className={className} />;
      case 'item_roof_beams':
        return <RoofBeamsIcon2D className={className} />;
      case 'item_welder':
        return <HeavyWelderIcon2D className={className} />;
      default:
        return <BriefcaseMedical className={className} />;
    }
  };

  // Derived state
  const totalResidents = area.residents.length;
  const rescuedCount = area.residents.filter(r => r.isRescued).length;
  const allResidentsRescued = rescuedCount === totalResidents;

  const totalBuildings = area.buildings.length;
  const repairedCount = area.buildings.filter(b => b.isRepaired).length;
  const allBuildingsRepaired = repairedCount === totalBuildings;

  const activeResident = area.residents[currentResidentIndex] || area.residents[0];
  const activeBuilding = area.buildings[currentBuildingIndex] || area.buildings[0];

  const isAreaComplete = allResidentsRescued && allBuildingsRepaired;

  // Switch selected item default when switching views
  useEffect(() => {
    if (viewMode === 'SURVIVOR_TRIAGE') {
      setSelectedSupplyItem(suppliesList[0]); // Bandage
    } else if (viewMode === 'BUILDING_REPAIR') {
      setSelectedSupplyItem(suppliesList[3]); // Bricks
    }
  }, [viewMode]);

  // Synchronization with external selections
  useEffect(() => {
    if (selectedResidentId) {
      const idx = area.residents.findIndex(r => r.id === selectedResidentId);
      if (idx !== -1) {
        setCurrentResidentIndex(idx);
        setViewMode('SURVIVOR_TRIAGE');
      }
    }
  }, [selectedResidentId, area.residents]);

  useEffect(() => {
    if (selectedBuildingId) {
      const idx = area.buildings.findIndex(b => b.id === selectedBuildingId);
      if (idx !== -1) {
        setCurrentBuildingIndex(idx);
        setViewMode('BUILDING_REPAIR');
      }
    }
  }, [selectedBuildingId, area.buildings]);

  // Auto-dismiss toasts
  useEffect(() => {
    if (warningMessage) {
      const t = setTimeout(() => setWarningMessage(null), 3500);
      return () => clearTimeout(t);
    }
  }, [warningMessage]);

  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(null), 2500);
      return () => clearTimeout(t);
    }
  }, [successMessage]);

  // Handle Specific 2D Body Part Treatment by clicking
  const handleTreatBodyPart = (partId: BodyPartId, item?: DraggableItem) => {
    if (!activeResident) return;

    // Use passed item or equipped item or default to bandage/gauze
    const supplyToUse = item || selectedSupplyItem || suppliesList[0];

    const limbKey = `${activeResident.id}_${partId}`;
    if (healedLimbsState[limbKey] || activeResident.isRescued) {
      sound.playWrongDropWarning();
      setWarningMessage(`ℹ️ This injury is already fully dressed and stabilized!`);
      return;
    }

    if (medSupplies < supplyToUse.cost) {
      sound.playWrongDropWarning();
      setWarningMessage(`⚠️ Out of Medical Supplies! Click 'Restock Van' to grab more bandages & gauze.`);
      return;
    }

    // Apply treatment
    sound.playValidDropSuccess();
    sound.playMedicalPulse();
    sound.playHealSigh();

    setJustHealedPart(partId);
    setTimeout(() => setJustHealedPart(null), 1200);

    const updatedState = { ...healedLimbsState, [limbKey]: true };
    setHealedLimbsState(updatedState);

    const partLabels: Record<BodyPartId, string> = {
      left_hand: 'Left Hand & Wrist',
      right_hand: 'Right Hand & Arm',
      left_leg: 'Left Leg (Rubble Trauma)',
      right_leg: 'Right Leg & Ankle',
      chest: 'Chest & Airway',
    };

    setSuccessMessage(`✨ Dressed and stabilized ${partLabels[partId]} with ${supplyToUse.shortLabel} on ${activeResident.name}!`);
    setActiveDialogue({ name: activeResident.name, quote: `Thank you Rose! The ${supplyToUse.shortLabel} relieved the pain immediately!` });

    // Advance resident overall treatment
    onAdvanceResidentTreatment(activeResident.id);

    // Check if all 5 parts are now healed
    const all5Parts: BodyPartId[] = ['left_hand', 'right_hand', 'left_leg', 'right_leg', 'chest'];
    const allHealed = all5Parts.every(p => updatedState[`${activeResident.id}_${p}`]);

    if (allHealed) {
      onRescueResident(activeResident.id);
      sound.playRescueSuccess();
      setSuccessMessage(`🎉 ${activeResident.name} has made a 100% full recovery!`);
    }
  };

  // Handle Specific 2D Building Section Repair by clicking
  const handleRepairBuildingSection = (sectionId: BuildingSectionId, item?: DraggableItem) => {
    if (!activeBuilding) return;

    // Use passed item or equipped item or default to bricks/welder
    const materialToUse = item || selectedSupplyItem || suppliesList[3];

    const secKey = `${activeBuilding.id}_${sectionId}`;
    if (repairedSectionsState[secKey] || activeBuilding.isRepaired) {
      sound.playWrongDropWarning();
      setWarningMessage(`ℹ️ This architectural section is already 100% repaired and reinforced!`);
      return;
    }

    if (repairMaterials < materialToUse.cost) {
      sound.playWrongDropWarning();
      setWarningMessage(`⚠️ Out of Repair Materials! Click 'Restock Van' to grab more supplies.`);
      return;
    }

    // Apply repair
    sound.playValidDropSuccess();
    sound.playWelderSparks();

    setJustRepairedSection(sectionId);
    setTimeout(() => setJustRepairedSection(null), 1200);

    const updatedState = { ...repairedSectionsState, [secKey]: true };
    setRepairedSectionsState(updatedState);

    const secLabels: Record<BuildingSectionId, string> = {
      roof: 'Damaged Roof & Gables',
      cracked_wall_left: 'Cracked West Wall',
      cracked_wall_right: 'Cracked East Facade',
      broken_window: 'Shattered Windows',
      power_junction: 'Power & Utility Hub',
    };

    setSuccessMessage(`⚡ Reconstructed and reinforced ${secLabels[sectionId]} on ${activeBuilding.name}!`);

    // Advance building overall reconstruction
    onAdvanceBuildingPhase(activeBuilding.id);

    // Check if all 5 sections are repaired
    const all5Sections: BuildingSectionId[] = ['roof', 'cracked_wall_left', 'cracked_wall_right', 'broken_window', 'power_junction'];
    const allRepaired = all5Sections.every(s => updatedState[`${activeBuilding.id}_${s}`]);

    if (allRepaired) {
      onRepairBuilding(activeBuilding.id);
      sound.playBuildingRestored();
      sound.playStructurePhaseComplete();
      setSuccessMessage(`🏛️ ${activeBuilding.name} is 100% restored! Emergency power online.`);
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-auto bg-slate-950/90 backdrop-blur-md p-2 sm:p-4 md:p-6 flex flex-col justify-between z-20 select-none overflow-y-auto">
      
      {/* ========================================================
          TOP NAVIGATION & DISASTER COMMAND BAR
      ======================================================== */}
      <div className="w-full max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2.5 border-b border-white/10 text-white">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1">
              <MousePointerClick className="w-3 h-3" />
              <span>1-CLICK RESCUE & REPAIR SYSTEM</span>
            </span>
            <span className="text-white/30">•</span>
            <span className="text-xs font-mono text-white/60 uppercase">{area.name}</span>
          </div>
          <h1 className="text-lg sm:text-xl font-black text-white tracking-tight uppercase mt-0.5">
            Disaster Response Station
          </h1>
        </div>

        {/* View Mode Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-[#151518] p-1 rounded-lg border border-white/10">
          <button
            id="tab-survivor-triage"
            onClick={() => {
              setViewMode('SURVIVOR_TRIAGE');
              sound.playHeartbeat();
            }}
            className={`px-3 py-1.5 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition ${
              viewMode === 'SURVIVOR_TRIAGE'
                ? 'bg-emerald-500 text-black shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5" />
            <span>2D Survivor Triage ({rescuedCount}/{totalResidents})</span>
          </button>

          <button
            id="tab-building-repair"
            onClick={() => {
              setViewMode('BUILDING_REPAIR');
              sound.playWelderSparks();
            }}
            className={`px-3 py-1.5 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition ${
              viewMode === 'BUILDING_REPAIR'
                ? 'bg-amber-500 text-black shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>2D Building Repair ({repairedCount}/{totalBuildings})</span>
          </button>

          <button
            id="tab-sector-overview"
            onClick={() => setViewMode('SECTOR_OVERVIEW')}
            className={`px-2.5 py-1.5 rounded text-xs font-mono font-bold flex items-center gap-1.5 transition ${
              viewMode === 'SECTOR_OVERVIEW'
                ? 'bg-sky-500 text-black shadow-lg'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Overview</span>
          </button>
        </div>
      </div>

      {/* Dynamic Alerts & Toasts */}
      {warningMessage && (
        <div 
          id="rescue-warning-toast"
          className="w-full max-w-2xl mx-auto my-1.5 bg-red-950/95 border border-red-500 rounded-lg p-2.5 shadow-2xl backdrop-blur-xl animate-bounce flex items-center gap-3 text-white z-30"
        >
          <div className="w-7 h-7 rounded bg-red-500 flex items-center justify-center shrink-0 text-black font-bold">
            <AlertCircle className="w-4 h-4" />
          </div>
          <div className="flex-1 text-xs font-mono font-medium text-red-200">
            {warningMessage}
          </div>
          <button onClick={() => setWarningMessage(null)} className="text-white/60 hover:text-white text-xs font-mono px-1">✕</button>
        </div>
      )}

      {successMessage && (
        <div 
          id="rescue-success-toast"
          className="w-full max-w-2xl mx-auto my-1.5 bg-emerald-950/95 border border-emerald-500 rounded-lg p-2.5 shadow-2xl backdrop-blur-xl animate-fade-in flex items-center gap-3 text-white z-30"
        >
          <div className="w-7 h-7 rounded bg-emerald-500 flex items-center justify-center shrink-0 text-black font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex-1 text-xs font-mono font-medium text-emerald-200">
            {successMessage}
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-white/60 hover:text-white text-xs font-mono px-1">✕</button>
        </div>
      )}

      {/* Survivor Speech Toast */}
      {activeDialogue && !warningMessage && (
        <div className="w-full max-w-2xl mx-auto my-1.5 bg-[#151518]/95 border border-emerald-500/40 rounded-lg p-2.5 shadow-2xl backdrop-blur-xl animate-fade-in flex items-start gap-3 text-white">
          <div className="w-7 h-7 rounded bg-emerald-500 flex items-center justify-center shrink-0 text-black font-bold text-xs">
            <Heart className="w-3.5 h-3.5 fill-current" />
          </div>
          <div className="flex-1">
            <div className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
              {activeDialogue.name}
            </div>
            <p className="text-xs text-white/90 italic mt-0.5">"{activeDialogue.quote}"</p>
          </div>
          <button onClick={() => setActiveDialogue(null)} className="text-white/40 hover:text-white text-xs font-mono px-1">✕</button>
        </div>
      )}

      {/* ========================================================
          MAIN INTERACTIVE 2D RESCUE STAGE
      ======================================================== */}
      <div className="w-full max-w-5xl mx-auto my-2">
        {viewMode === 'SURVIVOR_TRIAGE' && activeResident && (
          <div>
            {/* Resident Selector Strip */}
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setCurrentResidentIndex((prev) => (prev > 0 ? prev - 1 : area.residents.length - 1));
                    sound.playHeartbeat();
                  }}
                  className="p-1 rounded bg-white/5 hover:bg-white/15 text-white/80 transition"
                  title="Previous Survivor"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-bold text-white">
                  Survivor {currentResidentIndex + 1} of {totalResidents}: <span className="text-emerald-400">{activeResident.name}</span>
                </span>
                <button
                  onClick={() => {
                    setCurrentResidentIndex((prev) => (prev < area.residents.length - 1 ? prev + 1 : 0));
                    sound.playHeartbeat();
                  }}
                  className="p-1 rounded bg-white/5 hover:bg-white/15 text-white/80 transition"
                  title="Next Survivor"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Tab Switchers */}
              <div className="flex items-center gap-1.5">
                {area.residents.map((res, i) => (
                  <button
                    key={res.id}
                    onClick={() => {
                      setCurrentResidentIndex(i);
                      sound.playHeartbeat();
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                      currentResidentIndex === i
                        ? 'bg-emerald-500 text-black font-bold'
                        : res.isRescued
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {res.name.split(' ')[0]} {res.isRescued && '✓'}
                  </button>
                ))}
              </div>
            </div>

            {/* 2D Survivor Anatomical Component */}
            <TwoDimensionalSurvivorTriage
              resident={activeResident}
              activeDragItem={selectedSupplyItem}
              hoveredBodyPart={hoveredBodyPart}
              onHoverBodyPart={setHoveredBodyPart}
              onTreatBodyPart={handleTreatBodyPart}
              healedParts={healedLimbsState}
              justHealedPart={justHealedPart}
            />
          </div>
        )}

        {viewMode === 'BUILDING_REPAIR' && activeBuilding && (
          <div>
            {/* Building Selector Strip */}
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setCurrentBuildingIndex((prev) => (prev > 0 ? prev - 1 : area.buildings.length - 1));
                    sound.playWelderSparks();
                  }}
                  className="p-1 rounded bg-white/5 hover:bg-white/15 text-white/80 transition"
                  title="Previous Structure"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-xs font-mono font-bold text-white">
                  Structure {currentBuildingIndex + 1} of {totalBuildings}: <span className="text-amber-400">{activeBuilding.name}</span>
                </span>
                <button
                  onClick={() => {
                    setCurrentBuildingIndex((prev) => (prev < area.buildings.length - 1 ? prev + 1 : 0));
                    sound.playWelderSparks();
                  }}
                  className="p-1 rounded bg-white/5 hover:bg-white/15 text-white/80 transition"
                  title="Next Structure"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Tab Switchers */}
              <div className="flex items-center gap-1.5">
                {area.buildings.map((bld, i) => (
                  <button
                    key={bld.id}
                    onClick={() => {
                      setCurrentBuildingIndex(i);
                      sound.playWelderSparks();
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                      currentBuildingIndex === i
                        ? 'bg-amber-500 text-black font-bold'
                        : bld.isRepaired
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    {bld.name.split(' ')[0]} {bld.isRepaired && '✓'}
                  </button>
                ))}
              </div>
            </div>

            {/* 2D Building Repair Component */}
            <TwoDimensionalBuildingRepair
              building={activeBuilding}
              activeDragItem={selectedSupplyItem}
              hoveredSection={hoveredBuildingSection}
              onHoverSection={setHoveredBuildingSection}
              onRepairSection={handleRepairBuildingSection}
              repairedSections={repairedSectionsState}
              justRepairedSection={justRepairedSection}
            />
          </div>
        )}

        {viewMode === 'SECTOR_OVERVIEW' && (
          <div className="bg-[#101014] border border-white/10 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 text-xs font-mono">
              <span className="text-white/60">Disaster Sector Map: {area.name}</span>
              <span className="text-emerald-400 font-bold">
                {rescuedCount + repairedCount} / {totalResidents + totalBuildings} Objectives Complete
              </span>
            </div>

            {/* Survivors Grid */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-emerald-400 border-b border-white/10 pb-1.5">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>Injured Survivors ({rescuedCount}/{totalResidents})</span>
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {area.residents.map((res, i) => (
                  <div
                    key={res.id}
                    onClick={() => {
                      setCurrentResidentIndex(i);
                      setViewMode('SURVIVOR_TRIAGE');
                    }}
                    className={`p-3 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition ${
                      res.isRescued
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-white/60'
                        : 'bg-[#151518] hover:bg-[#1c1c21] border-white/10 text-white'
                    }`}
                  >
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        <span>{res.name}</span>
                        <span className="text-[10px] font-mono text-emerald-400">[{res.role}]</span>
                      </div>
                      <div className="text-[10px] text-white/50">{res.story}</div>
                    </div>

                    <button className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {res.isRescued ? 'INSPECT' : 'OPEN TRIAGE'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Buildings Grid */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono font-bold text-amber-400 border-b border-white/10 pb-1.5">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  <span>Damaged Structures ({repairedCount}/{totalBuildings})</span>
                </span>
              </div>
              <div className="space-y-2">
                {area.buildings.map((bld, i) => (
                  <div
                    key={bld.id}
                    onClick={() => {
                      setCurrentBuildingIndex(i);
                      setViewMode('BUILDING_REPAIR');
                    }}
                    className={`p-3 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition ${
                      bld.isRepaired
                        ? 'bg-amber-950/20 border-amber-500/30 text-white/60'
                        : 'bg-[#151518] hover:bg-[#1c1c21] border-white/10 text-white'
                    }`}
                  >
                    <div>
                      <div className="font-bold flex items-center gap-1.5">
                        <span>{bld.name}</span>
                        <span className="text-[10px] font-mono text-white/40">[{bld.type}]</span>
                      </div>
                      <div className="text-[10px] text-white/50">{bld.benefits}</div>
                    </div>

                    <button className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {bld.isRepaired ? 'INSPECT' : 'OPEN REPAIR'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================
          2D FIELD SUPPLY RACK (CLICK TO SELECT OR CLICK ACTION)
      ======================================================== */}
      <div className="w-full max-w-5xl mx-auto mt-2 bg-[#0c0c0e]/95 border border-white/15 rounded-xl p-3 shadow-2xl backdrop-blur-xl text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-2 mb-2">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Rose's Emergency Supplies <span className="text-white/40 font-normal">(Click any supply or directly click targets above to treat/repair)</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className={`px-2 py-0.5 rounded font-bold flex items-center gap-1 ${
                medSupplies > 0 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400'
              }`}>
                <BriefcaseMedical className="w-3.5 h-3.5" />
                {medSupplies} Med Kits
              </span>
              <span className={`px-2 py-0.5 rounded font-bold flex items-center gap-1 ${
                repairMaterials > 0 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-red-500/20 text-red-400'
              }`}>
                <Wrench className="w-3.5 h-3.5" />
                {repairMaterials} Materials
              </span>
            </div>

            <button
              id="restock-supplies-btn"
              onClick={onRestockSupplies}
              className="bg-orange-500 hover:bg-orange-400 text-black text-xs font-mono font-bold px-3 py-1 rounded flex items-center gap-1.5 transition active:scale-95 shrink-0"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Restock Van</span>
            </button>
          </div>
        </div>

        {/* 2D Supply Cards with Click-to-Equip Selection */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {suppliesList.map((item) => {
            const hasEnough = item.type === 'MED' ? medSupplies >= item.cost : repairMaterials >= item.cost;
            const isSelected = selectedSupplyItem?.id === item.id;

            return (
              <div
                key={item.id}
                id={`supply-card-${item.id}`}
                onClick={() => {
                  if (!hasEnough) {
                    sound.playWrongDropWarning();
                    setWarningMessage(`⚠️ Out of ${item.type === 'MED' ? 'Medical Kits' : 'Repair Materials'}! Click Restock Van.`);
                    return;
                  }
                  sound.playDragPickup();
                  setSelectedSupplyItem(item);
                  setSuccessMessage(`Selected ${item.name} for treatment/repairs`);
                }}
                className={`p-2 rounded-lg border cursor-pointer transition relative flex items-center gap-2 select-none ${
                  isSelected
                    ? item.color === 'emerald'
                      ? 'bg-emerald-900/60 border-emerald-400 ring-2 ring-emerald-400 scale-[1.02] shadow-lg'
                      : 'bg-amber-900/60 border-amber-400 ring-2 ring-amber-400 scale-[1.02] shadow-lg'
                    : hasEnough
                      ? item.color === 'emerald'
                        ? 'bg-emerald-950/30 hover:bg-emerald-900/40 border-emerald-500/30 hover:border-emerald-400 shadow'
                        : 'bg-amber-950/30 hover:bg-amber-900/40 border-amber-500/30 hover:border-amber-400 shadow'
                      : 'bg-white/5 border-white/10 opacity-40 cursor-not-allowed'
                }`}
                title={item.description}
              >
                {/* 2D Rendered Icon */}
                <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-black/40 border border-white/10">
                  {renderSupplyIcon2D(item.id, "w-8 h-8")}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold truncate leading-tight">
                    {item.shortLabel}
                  </div>
                  <div className="text-[9px] text-white/50 truncate font-mono">
                    {isSelected ? '✓ SELECTED' : item.type === 'MED' ? 'Medical' : 'Material'}
                  </div>
                </div>

                {isSelected && (
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================
          BOTTOM SECTOR COMPLETION & NEXT AREA DEPARTURE BAR
      ======================================================== */}
      <div className="w-full max-w-5xl mx-auto mt-2 pt-2.5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-white">
        <div className="text-xs font-mono text-white/60 text-center sm:text-left">
          {isAreaComplete ? (
            <span className="text-emerald-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> All survivors stabilized and all damaged structures 100% repaired!
            </span>
          ) : (
            <span>
              Remaining in Sector: <strong className="text-emerald-400">{totalResidents - rescuedCount} injured</strong> and <strong className="text-amber-400">{totalBuildings - repairedCount} buildings</strong>.
            </span>
          )}
        </div>

        {isAreaComplete ? (
          <button
            id="depart-next-sector-btn"
            onClick={onContinueToNextArea}
            className="w-full sm:w-auto px-6 py-2 rounded-lg bg-emerald-400 hover:bg-emerald-300 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-2xl transition active:scale-95"
          >
            <span>Depart to Next Disaster Sector</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            disabled
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/30 font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed"
          >
            <span>Treat All Injuries & Repair Buildings to Proceed</span>
          </button>
        )}
      </div>
    </div>
  );
};
