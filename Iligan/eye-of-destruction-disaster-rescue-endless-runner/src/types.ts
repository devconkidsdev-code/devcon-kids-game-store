export type GameMode = 'TITLE' | 'RUNNER' | 'STOP_AREA' | 'AREA_CLEAR' | 'CAMPAIGN_VICTORY' | 'GAME_OVER' | 'FREE_EXPLORE';

export type Lane = -1 | 0 | 1; // Left (-3.5), Center (0), Right (3.5)

export interface PlayerState {
  lane: Lane;
  targetX: number;
  currentX: number;
  y: number;
  z: number;
  isJumping: boolean;
  isSliding: boolean;
  jumpVelocity: number;
  slideTimer: number;
  speed: number;
  baseSpeed: number;
  distanceTraveled: number;
  targetDistance: number; // Distance needed to reach stopping area
  health: number;
  maxHealth: number;
  shield: boolean;
  medicalSupplies: number;
  repairMaterials: number;
  coins: number;
  score: number;
}

export interface ResidentVitalSigns {
  heartRate: number;
  oxygenLevel: number;
  condition: 'CRITICAL' | 'STABILIZING' | 'RECOVERED';
}

export interface ResidentTreatmentStep {
  id: string;
  name: string;
  actionDesc: string;
  requiredKits: number;
  completed: boolean;
}

export interface Resident {
  id: string;
  name: string;
  role: string;
  story: string;
  quote: string;
  position: [number, number, number]; // [x, y, z] in stop area
  isRescued: boolean;
  requiredMedKits: number;
  injuredType: 'debris_trapped' | 'smoke_inhalation' | 'fracture' | 'exhaustion';
  // Interactive healing extensions
  healthPercent: number; // 0 to 100
  treatmentStage: number; // 0: untreated, 1: triage/stabilized, 2: fully recovered
  treatmentSteps: ResidentTreatmentStep[];
  vitalSigns: ResidentVitalSigns;
  thankYouQuote: string;
}

export interface BuildingRepairPhase {
  id: string;
  name: string;
  actionDesc: string;
  requiredMaterials: number;
  completed: boolean;
}

export interface BuildingInspection {
  structuralDamage: string;
  utilityStatus: string;
  safetyHazard: string;
  reconstructionPlan: string;
}

export interface Building {
  id: string;
  name: string;
  type: 'hospital' | 'residential' | 'fire_station' | 'school' | 'power_plant' | 'water_tower' | 'city_hall' | 'library';
  position: [number, number, number]; // [x, y, z]
  rotation: number;
  damageLevel: number; // 100 = fully damaged, 0 = restored
  requiredMaterials: number;
  repairProgress: number; // 0 to 100
  isRepaired: boolean;
  description: string;
  benefits: string;
  // Interactive reconstruction extensions
  structuralIntegrity: number; // 0 to 100
  currentPhaseIndex: number;
  repairPhases: BuildingRepairPhase[];
  inspection: BuildingInspection;
  celebrationQuote: string;
}

export interface DisasterArea {
  id: number;
  name: string;
  subtitle: string;
  distanceToReach: number; // e.g. 500 meters
  themeColor: string;
  skyColor: string;
  fogColor: string;
  restoredSkyColor: string;
  restoredFogColor: string;
  storyBrief: string;
  residents: Resident[];
  buildings: Building[];
  isRestored: boolean;
  highScore?: number;
}

export type ObstacleType = 
  | 'RUBBLE_PILE' 
  | 'OVERTURNED_CAR' 
  | 'FALLEN_SIGN_SLIDE' 
  | 'ROAD_BARRIER' 
  | 'ELECTRIC_HAZARD_SLIDE' 
  | 'CRACKED_FISSURE_JUMP'
  | 'RAMP_DEBRIS';

export interface RunnerObstacle {
  id: number;
  lane: Lane;
  z: number;
  type: ObstacleType;
  passed: boolean;
  width?: number;
  height?: number;
}

export type CollectibleType = 'MED_KIT' | 'REPAIR_MATERIAL' | 'SHIELD' | 'COIN' | 'NITRO';

export interface RunnerCollectible {
  id: number;
  lane: Lane;
  z: number;
  type: CollectibleType;
  collected: boolean;
  yOffset?: number;
}

export interface SoundConfig {
  soundEnabled: boolean;
  musicEnabled: boolean;
  masterVolume: number;
}
