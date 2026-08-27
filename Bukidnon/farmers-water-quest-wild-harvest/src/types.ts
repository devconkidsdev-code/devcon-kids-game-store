export type BiomeType =
  | 'spring_meadow'
  | 'pine_forest'
  | 'murky_swamp'
  | 'rocky_canyon'
  | 'savannah_plains'
  | 'arid_oasis'
  | 'alpine_stream'
  | 'ancient_sanctuary';

export type WeatherType = 'clear' | 'golden_hour' | 'misty_dawn' | 'drizzle' | 'rain_storm' | 'sunset' | 'night';

export type AnimalSpecies =
  | 'wild_boar'
  | 'timber_wolf'
  | 'grizzly_bear'
  | 'marsh_crocodile'
  | 'mountain_cougar'
  | 'rattlesnake'
  | 'wild_rhino';

export interface AnimalDef {
  id: string;
  species: AnimalSpecies;
  x: number;
  y: number;
  targetX?: number;
  targetY?: number;
  originX: number;
  originY: number;
  patrolRadius: number;
  speed: number;
  chaseSpeed: number;
  visionRange: number;
  visionAngle: number; // in radians
  facingAngle: number;
  state: 'idle' | 'patrol' | 'alert' | 'chase' | 'flee' | 'attack_cooldown';
  alertMeter: number; // 0 to 1
  damage: number;
  attackRange: number;
  attackCooldown: number;
  fleeTimer: number;
  currentFrame: number;
  animTimer: number;
  size: number;
  color: string;
  name: string;
}

export interface WaterSource {
  id: string;
  type: 'spring' | 'river' | 'well' | 'oasis' | 'rain_barrel' | 'waterfall_pool';
  x: number;
  y: number;
  radius: number;
  purity: number; // 1.0 = normal, 1.5 = high yield
  maxSupply: number;
  currentSupply: number;
  refillRate: number;
  name: string;
}

export interface FinishPlantPlot {
  id: string;
  x: number;
  y: number;
  radius: number;
  name: string;
  species: 'ancient_oak' | 'heirloom_crops' | 'sacred_lotus' | 'desert_bloom' | 'golden_wheat' | 'revival_tree';
  waterNeeded: number;
  waterReceived: number;
  isFullyHydrated: boolean;
  bloomProgress: number; // 0 to 1
}

export interface TerrainObstacle {
  x: number;
  y: number;
  radius?: number;
  width?: number;
  height?: number;
  type: 'tree' | 'rock_cluster' | 'dense_bush' | 'mud_patch' | 'water_body' | 'wooden_bridge' | 'fence';
  slowFactor?: number; // for mud or water
  providesStealth?: boolean; // for dense_bush
  blocksVision?: boolean;
}

export interface LevelConfig {
  levelNumber: number;
  title: string;
  subtitle: string;
  biome: BiomeType;
  weather: WeatherType;
  mapWidth: number;
  mapHeight: number;
  waterGoal: number; // Total liters needed to revive finish plants
  bucketMaxCapacity: number; // Liters player can hold
  spawnX: number;
  spawnY: number;
  animals: Omit<AnimalDef, 'id' | 'state' | 'alertMeter' | 'fleeTimer' | 'currentFrame' | 'animTimer'>[];
  waterSources: WaterSource[];
  finishPlots: FinishPlantPlot[];
  obstacles: TerrainObstacle[];
  flaresProvided: number;
  stonesProvided: number;
  parTimeSeconds: number;
  briefing: string;
}

export interface PlayerInventory {
  flares: number; // Scares predators away in area
  stones: number; // Distracts animals by making sound
  speedTonics: number;
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  facingAngle: number;
  health: number; // 0 to 100
  maxHealth: number;
  stamina: number; // 0 to 100
  maxStamina: number;
  waterCarried: number; // current liters
  waterCapacity: number; // max liters
  isSprinting: boolean;
  isCrouching: boolean; // stealth mode
  isInBush: boolean;
  isInMud: boolean;
  isInWater: boolean;
  inventory: PlayerInventory;
  activeItem: 'flare' | 'stone' | 'speed_tonic' | 'none';
  invulnerableTimer: number;
  footstepTimer: number;
  animFrame: number;
  animTime: number;
  isCollecting: boolean;
  isWatering: boolean;
  statusText?: string;
  statusTimer?: number;
}

export interface GameParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  type: 'water_drop' | 'petal' | 'leaf' | 'spark' | 'smoke' | 'splash' | 'footprint' | 'blood' | 'firefly' | 'puddle_ripple';
  alpha: number;
  rotation?: number;
}

export interface LevelScore {
  stars: number; // 1 to 3
  timeSeconds: number;
  waterDelivered: number;
  stealthBonus: boolean;
  completed: boolean;
}

export interface SoundSettings {
  masterVolume: number;
  effectsVolume: number;
  ambientVolume: number;
  muted: boolean;
}
