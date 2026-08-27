export type GameScreen = 
  | 'START'
  | 'PLAYING'
  | 'LEVEL_CLEARED'
  | 'GAME_OVER'
  | 'VICTORY'
  | 'HOW_TO_PLAY';

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Position {
  x: number;
  y: number;
}

export type CellType = 'WALL' | 'PATH' | 'DRY_AREA';

export type ItemType = 
  | 'CLEAN_WATER'        // +1 water point
  | 'CONTAMINATED_WATER' // -1 water point
  | 'HEART'              // +1 life (max 3)
  | 'COMMUNITY_TANK';    // Level target / final goal

export interface Item {
  id: string;
  x: number;
  y: number;
  type: ItemType;
  collected?: boolean;
}

export interface Snake {
  id: string;
  x: number;
  y: number;
  dir: Direction;
  animOffset: number;
  speedMultiplier: number;
  moveCooldown: number;
  lastMove: number;
}

export type LevelTwist = 
  | 'STANDARD'            // Clean exploration with spacious paths
  | 'FAST_SNAKES'         // Agile patrolling snakes
  | 'DROUGHT_STORM'       // High heat evaporation zones
  | 'TOXIC_SPILL'         // Contaminated sludge droplets
  | 'TIME_ATTACK'         // Countdown timer pressure
  | 'SPRING_OASIS'        // Abundant clean water & extra heart recovery
  | 'SNAKE_DEN'           // High snake density with wide bypasses
  | 'DESERT_MIRAGE'       // Dry zones + roaming snakes
  | 'MEGA_RESERVOIR'      // High water requirement for large community
  | 'CENTURY_CHALLENGE';  // Grand milestone reservoir challenge

export interface LevelConfig {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  twist: LevelTwist;
  twistTitle: string;
  twistBadge: string;
  zoneName: string;
  gridWidth: number;
  gridHeight: number;
  requiredWater: number;
  cleanDropsCount: number;
  contaminatedDropsCount: number;
  snakesCount: number;
  heartsCount: number;
  dryAreasCount: number;
  hasTimer: boolean;
  timeLimitSec: number;
  snakeMoveInterval: number; // ms between moves
  educationalFact: string;
  educationalTip: string;
}

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

export interface GameStats {
  score: number;
  cleanDropsCollected: number;
  contaminatedDropsHit: number;
  dryTilesStepped: number;
  damageTaken: number;
  heartsCollected: number;
  timeElapsedSec: number;
}

