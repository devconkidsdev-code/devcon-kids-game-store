export type TileType = 
  | 0 // PATH (Mountain trail / dirt)
  | 1 // ROCK_WALL (Mountain crags / impassable)
  | 2 // TREE (Pine forest / impassable)
  | 3 // SPRING (Starting point - bubbling water source)
  | 4 // VILLAGE (Destination - cozy mountain hamlet)
  | 5 // SCREE (Rocky rough terrain - causes extra slosh/water loss)
  | 6 // DEW_SPRING (Mini water source / dew droplet - restores +10% water)
  | 7 // BRIDGE (Wooden planks over chasm);

export interface LevelConfig {
  id: number;
  name: string;
  subtitle: string;
  biome: 'foothills' | 'rocky_pass' | 'summit';
  width: number;
  height: number;
  grid: TileType[][];
  startPos: { x: number; y: number };
  villagePos: { x: number; y: number };
  baseLeakRate: number; // percentage per second while idle
  moveLeakRate: number; // percentage per second while moving
  screeLeakRate: number; // percentage per second on scree
  parTime: number; // seconds for maximum time bonus
  initialWater: number;
}

export type PerformanceRating = 
  | 'Mountain Master'
  | 'Great Fetch'
  | 'Close Call'
  | 'Just Enough'
  | 'Empty Bucket';

export interface LevelResult {
  levelId: number;
  levelName: string;
  waterRemaining: number;
  timeTaken: number;
  score: number;
  rating: PerformanceRating;
  ratingColor: string;
  isNewBest?: boolean;
}

export type GameState = 
  | 'START'
  | 'PLAYING'
  | 'PAUSED'
  | 'LEVEL_COMPLETE'
  | 'GAME_OVER'
  | 'ALL_LEVELS_COMPLETE';

export interface GameStats {
  totalScore: number;
  levelsCompleted: number;
  totalWaterSaved: number;
  bestScores: Record<number, LevelResult>;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
  type: 'water' | 'splash' | 'footprint' | 'smoke' | 'sparkle' | 'dew' | 'ripple';
}
