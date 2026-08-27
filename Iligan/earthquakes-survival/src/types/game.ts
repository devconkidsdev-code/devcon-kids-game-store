export interface Vector2D {
  x: number;
  y: number;
}

export type SurvivorType = 'man' | 'woman' | 'elderly' | 'child' | 'medic';

export interface Survivor {
  id: string;
  x: number;
  y: number;
  name: string;
  type: SurvivorType;
  rescued: boolean;
  delivered: boolean;
  wavePhase: number;
  dialogue?: string;
  avatarColor: string;
  shirtColor: string;
  isTrapped?: boolean;
  isRunning?: boolean;
  runSpeed?: number;
  facingAngle?: number;
  legPhase?: number;
}

export type NPCCarType = 'police' | 'fire_truck' | 'civilian_sedan' | 'civilian_suv' | 'evacuation_bus' | 'ambulance_npc';

export interface NPCCar {
  id: string;
  name: string;
  x: number;
  y: number;
  angle: number; // in radians
  speed: number;
  targetSpeed: number;
  maxSpeed: number;
  width: number; // width across axis
  height: number; // length along travel axis
  type: NPCCarType;
  color: string;
  roofColor?: string;
  hasSiren?: boolean;
  sirenPhase?: number;
  headlights: boolean;
  waypoints: { x: number; y: number }[];
  currentWaypointIndex: number;
  braking?: boolean;
}

export interface Obstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'rubble_pile' | 'collapsed_wall' | 'fissure' | 'broken_car' | 'barricade' | 'fallen_tree' | 'debris_cluster' | 'hydrant';
  rotation: number;
  color?: string;
  damageInflicted?: number;
}

export interface Building {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
  roofColor: string;
  wallColor: string;
  damaged: boolean;
  damageLevel: number; // 0: intact, 1: cracked, 2: partially collapsed, 3: heavy ruins
  crackPoints?: { x: number; y: number }[];
  smokePuff?: boolean;
  isEnterable?: boolean;
  entrance?: {
    x: number;
    y: number;
    width: number;
    height: number;
    side: 'bottom' | 'top' | 'left' | 'right';
  };
}

export interface Road {
  x: number;
  y: number;
  width: number;
  height: number;
  direction: 'horizontal' | 'vertical' | 'intersection' | 'plaza';
  name?: string;
}

export interface SafeZone {
  x: number;
  y: number;
  width: number;
  height: number;
  name: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  maxLife: number;
  life: number;
  type: 'dust' | 'smoke' | 'spark' | 'debris' | 'star' | 'exhaust' | 'siren_glow';
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  vy: number;
}

export interface SkidMark {
  x: number;
  y: number;
  angle: number;
  alpha: number;
}

export interface PlayerCar {
  x: number;
  y: number;
  angle: number; // in radians
  speed: number;
  maxForwardSpeed: number;
  maxReverseSpeed: number;
  acceleration: number;
  braking: number;
  friction: number;
  turnSpeed: number;
  width: number;
  height: number;
  passengers: Survivor[];
  maxCapacity: number;
  sirenActive: boolean;
  headlightsActive: boolean;
  boostAvailable: number; // 0 to 100
  isBoosting: boolean;
  collisionCooldown: number;
  driverName: string;
}

export interface EarthquakeEvent {
  isActive: boolean;
  intensity: number;
  duration: number;
  timeLeft: number;
  epicenter: Vector2D;
  warningCountdown: number;
}

export type GameStatus = 'START' | 'PLAYING' | 'PAUSED' | 'GAMEOVER';

export interface GameStats {
  score: number; // Total people delivered to Safe Zone
  tripsCompleted: number;
  peopleRescuedEver: number;
  largestDeliveryBatch: number;
  earthquakesSurvived: number;
  distanceDriven: number;
}
