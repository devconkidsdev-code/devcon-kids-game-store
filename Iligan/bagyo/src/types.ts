export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'VICTORY' | 'GAMEOVER';

export type Difficulty = 'SIGNAL_1' | 'SIGNAL_2' | 'SIGNAL_3';

export type SupplyType = 
  | 'CANNED_FOOD'
  | 'FLASHLIGHT'
  | 'FIRST_AID'
  | 'RADIO'
  | 'LIFE_VEST'
  | 'BATTERIES'
  | 'ROPE'
  | 'WATER_BOTTLE';

export interface SupplyItem {
  id: string;
  type: SupplyType;
  x: number;
  y: number;
  width: number;
  height: number;
  collected: boolean;
  name: string;
  points: number;
  icon: string;
  color: string;
  description: string;
}

export interface Platform {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'SOLID' | 'ONE_WAY' | 'SLIPPERY' | 'CRUMBLING' | 'FLOATING';
  color?: string;
  durability?: number; // For crumbling platforms
  maxDurability?: number;
  velY?: number; // For floating platforms
  origY?: number;
}

export interface Ladder {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Hazard {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'ELECTRIC' | 'FALLING_DEBRIS' | 'CURRENT' | 'SPIKES';
  active: boolean;
  timer?: number;
  velY?: number;
  velX?: number;
}

export interface DexterPlayer {
  x: number;
  y: number;
  width: number;
  height: number;
  vx: number;
  vy: number;
  isGrounded: boolean;
  isClimbing: boolean;
  isSwimming: boolean;
  isSubmerged: boolean;
  isSprinting: boolean;
  facing: 'left' | 'right';
  oxygen: number; // 0 to 100
  stamina: number; // 0 to 100
  lives: number; // Max 5 lives
  maxLives: number;
  isElectrocuted: boolean;
  electrocutedTimer: number;
  hasLifeVest: boolean;
  hasFlashlight: boolean;
  hasRope: boolean;
  animationFrame: number;
  animationTimer: number;
  isInvulnerable: boolean;
  invulnerableTimer: number;
}

export interface RescueBoat {
  x: number;
  y: number;
  width: number;
  height: number;
  bobTimer: number;
  beaconTimer: number;
  isRescued: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'RAIN' | 'SPLASH' | 'BUBBLE' | 'SPARK' | 'WIND_LEAF' | 'LIGHTNING_DEBRIS';
}

export interface LevelConfig {
  id: Difficulty;
  name: string;
  signalName: string;
  windSpeedMph: number;
  rainfallCategory: string;
  description: string;
  waterRiseSpeed: number; // pixels per second
  worldWidth: number;
  worldHeight: number;
  spawnX: number;
  spawnY: number;
  timeLimit: number; // usually 60 seconds
  platforms: Platform[];
  ladders: Ladder[];
  supplies: SupplyItem[];
  hazards: Hazard[];
  boat: RescueBoat;
  weatherTheme: {
    skyTop: string;
    skyBottom: string;
    rainDensity: number;
    windForce: number;
    thunderFrequency: number;
  };
}

export interface HighScoreRecord {
  id: string;
  date: string;
  difficulty: Difficulty;
  score: number;
  timeLeft: number;
  suppliesCollected: number;
  totalSupplies: number;
  rating: 'S' | 'A' | 'B' | 'C' | 'D';
}

export interface KeyControls {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  sprint: boolean;
}
