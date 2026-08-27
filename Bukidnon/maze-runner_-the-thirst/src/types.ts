export type GameStatus = 'MENU' | 'PLAYING' | 'PAUSED' | 'VICTORY' | 'GAMEOVER' | 'LEVEL_TRANSITION';

export type GameMode = 'CAMPAIGN' | 'ENDLESS' | 'TIME_ATTACK';

export type Difficulty = 'RELAXED' | 'NORMAL' | 'NIGHTMARE';

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  vx: number;
  vy: number;
}

export interface Player {
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  vx: number;
  vy: number;
  radius: number;
  angle: number; // facing angle in radians
  aimAngle: number; // flashlight angle
  water: number; // 0 to 100
  maxWater: number;
  lives: number; // current lives (e.g. 3)
  maxLives: number; // max lives (e.g. 3)
  speed: number;
  isSprinting: boolean;
  sloshTilt: number; // bucket tilt for visual effect
  squashX: number;
  squashY: number;
  sweatTimer: number;
  footstepTimer: number;
  invincibleTimer: number;
  powerups: {
    spongeTimer: number;
    clockBonus: number;
    nightVisionTimer: number;
    turboTimer: number;
    lidTimer: number; // lid prevents slosh on bumps
  };
}

export type TileType = 
  | 'WALL'
  | 'FLOOR'
  | 'START'
  | 'EXIT'
  | 'CROP'
  | 'WATER_WELL';

export interface Tile {
  x: number; // grid coordinates
  y: number;
  type: TileType;
  wallVariant: number; // for cardboard texture variation (0..3)
  watered?: boolean; // for CROP
  waterLevel?: number; // 0..100 for blooming animation
  wellDepleted?: boolean;
}

export type TrapType = 'SPIKES' | 'STEAM_VENT' | 'SLIME_PUDDLE' | 'CARDBOARD_FLAP';

export type ChaserType = 'GREEDY_GUZZLER' | 'SPEEDY_SPRINTER' | 'GOLDEN_BANDIT';
export type ChaserState = 'PATROL' | 'ALERT' | 'CHASE' | 'STUNNED' | 'FLEE';

export interface Chaser {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  speed: number;
  type: ChaserType;
  state: ChaserState;
  stunTimer: number;
  patrolTimer: number;
  animTimer: number;
  facingAngle: number;
  alertTimer: number;
  targetX: number;
  targetY: number;
  isCarryingBonus: boolean;
  tauntText?: string;
  tauntTimer?: number;
}

export interface Trap {
  id: string;
  x: number; // world x
  y: number; // world y
  type: TrapType;
  active: boolean;
  timer: number;
  period: number;
  radius: number;
  triggered: boolean;
}

export type PowerUpType = 'SPONGE' | 'CLOCK' | 'NIGHT_VISION' | 'TURBO_SODA' | 'BUCKET_LID' | 'HEART';

export type ObstacleType = 
  | 'BEACH_BALL' 
  | 'PINWHEEL' 
  | 'BUBBLE_VENT' 
  | 'JELLY_BOUNCER'
  | 'ROLLING_BARREL' 
  | 'SPINNING_SAW' 
  | 'ELECTRIC_GATE' 
  | 'SPIKED_CRUSH';

export interface Obstacle {
  id: string;
  type: ObstacleType;
  x: number;
  y: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  vx: number;
  vy: number;
  radius: number;
  speed: number;
  rotation: number;
  rotSpeed: number;
  active: boolean;
  timer: number;
  period: number;
  direction: number; // 1 or -1
  axis: 'HORIZONTAL' | 'VERTICAL' | 'STATIONARY_SPIN';
  length?: number; // for electric gate beam width
}

export interface PowerUp {
  id: string;
  x: number;
  y: number;
  type: PowerUpType;
  bobOffset: number;
  collected: boolean;
  sparkleTimer: number;
}

export interface SpookyEyes {
  id: string;
  x: number;
  y: number;
  blinkTimer: number;
  isBlinking: boolean;
  isScared: boolean; // scurries away when light shines
  alpha: number;
  color: string;
}

export interface OverheadLight {
  x: number;
  y: number;
  radius: number;
  color: string;
  flickerOffset: number;
  intensity: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  maxLife: number;
  life: number;
  color: string;
  type: 'WATER' | 'DUST' | 'BLOOM' | 'DEBRIS' | 'SWEAT' | 'SPARKLE' | 'STEAM' | 'SMOKE';
  rotation?: number;
  vRot?: number;
  alpha?: number;
}

export interface FloatingText {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
  vy: number;
  scale: number;
  badge?: string;
}

export interface LevelConfig {
  levelNumber: number;
  title: string;
  themeName: string;
  cols: number;
  rows: number;
  timeLimit: number; // seconds
  cropsToWater: number;
  trapsCount: number;
  powerUpsCount: number;
  chasersCount?: number;
  obstaclesCount?: number;
  ambientLight: number; // 0.05 to 0.3
  targetScore: number;
}

export interface ScoreBreakdown {
  baseScore: number;
  waterBonus: number;
  timeBonus: number;
  comboBonus: number;
  totalScore: number;
  stars: number; // 1 to 3
}

export interface HighScoreRecord {
  id: string;
  date: string;
  level: number;
  score: number;
  stars: number;
  waterLeft: number;
  timeLeft: number;
  mode: GameMode;
}

export interface Camera {
  x: number;
  y: number;
  shakeX: number;
  shakeY: number;
  shakeIntensity: number;
  shakeDuration: number;
  zoom: number;
}
