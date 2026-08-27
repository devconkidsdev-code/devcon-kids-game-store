export type CropId =
  | 'radish'
  | 'carrot'
  | 'strawberry'
  | 'tomato'
  | 'sunflower'
  | 'corn'
  | 'eggplant'
  | 'pumpkin'
  | 'watermelon'
  | 'dragonfruit'
  | 'mystic_orchid'
  | 'golden_rose';

export interface CropConfig {
  id: CropId;
  name: string;
  emoji: string;
  color: string;
  growDuration: number; // in seconds to mature
  drySpeed: number; // moisture loss per second (1.0 = normal)
  witherShrinkSpeed: number; // growth lost per second when moisture is 0
  value: number; // points/coins
  minMoistureToGrow: number; // usually 25%
}

export type GrowthStage = 0 | 1 | 2 | 3; // 0=Seed, 1=Sprout, 2=Growing, 3=Mature Harvestable

export interface PlotData {
  id: number;
  row: number;
  col: number;
  cropId: CropId;
  stage: GrowthStage;
  growthProgress: number; // 0 to 100%
  moisture: number; // 0 to 100%
  isWithered: boolean;
  witherTimer: number; // seconds spent in 0 moisture before death
  isDead: boolean;
  pestPresent: boolean; // if a beetle/crow is nibbling
  pestTimer: number;
  harvestCount: number;
  lastWateredTime: number;
}

export interface LevelConfig {
  levelNumber: number;
  chapter: number;
  chapterName: string;
  title: string;
  description: string;
  gridRows: number;
  gridCols: number;
  allowedCrops: CropId[];
  targetHarvests: number;
  timeLimitSeconds: number;
  maxDeadAllowed: number;
  drySpeedMultiplier: number;
  spawnPests: boolean;
  targetScores: [number, number, number]; // 1-star, 2-star, 3-star thresholds
}

export interface FarmerState {
  x: number; // grid or canvas coordinates
  y: number;
  targetX: number;
  targetY: number;
  facing: 'left' | 'right' | 'up' | 'down';
  isWatering: boolean;
  isWalking: boolean;
  waterLevel: number;
  maxWater: number;
  moveSpeed: number;
  waterRange: number; // radius in tiles or pixels
  splashRadius: number; // single tile vs cross vs 3x3
}

export interface Upgrades {
  canCapacityLevel: number; // +5 water per level
  speedLevel: number; // +20% speed per level
  fertilizerLevel: number; // +25% growth speed
  wellPumpLevel: number; // faster refill
  sprinklerPowerups: number; // consumable cloud/sprinklers
  rainCloudPowerups: number;
}

export interface LevelProgress {
  level: number;
  unlocked: boolean;
  stars: number; // 0 to 3
  highScore: number;
  completed: boolean;
}

export type GameScreen = 'start' | 'level_select' | 'playing' | 'paused' | 'level_complete' | 'game_over' | 'shop';

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
  maxLife: number;
  text?: string;
}
