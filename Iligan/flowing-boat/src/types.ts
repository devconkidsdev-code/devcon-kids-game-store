export type GameStage =
  | 'menu'
  | 'stage1_walking'
  | 'transition'
  | 'stage2_boat'
  | 'round_cleared'
  | 'game_over'
  | 'victory';

export type Difficulty = 'easy' | 'normal' | 'hard';

export type BiomeType = 'forest' | 'canyon' | 'storm';

export interface RoundConfig {
  round: number;
  title: string;
  subtitle: string;
  biome: BiomeType;
  stage1Length: number;
  stage2Length: number;
  waveSpeedMultiplier: number;
  obstacleDensityMultiplier: number;
  description: string;
  themeColor: string;
}

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  vx: number;
  vy: number;
}

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  isJumping: boolean;
  jumpZ: number; // height off ground
  jumpVz: number; // vertical jump velocity
  facing: 'left' | 'right' | 'up';
  walkFrame: number;
  rowFrame: number;
  health: number;
  maxHealth: number;
  invulnerableTime: number; // seconds remaining
  boostCooldown: number;
  boostActiveTime: number;
  isBoosting: boolean;
  score: number;
  distanceTraveled: number;
}

export type ObstacleType = 
  | 'rock' 
  | 'tree_root' 
  | 'spike_bush' 
  | 'mud_puddle' // Stage 1
  | 'river_rock' 
  | 'floating_log' 
  | 'whirlpool' 
  | 'rapids_current' // Stage 2
  | 'river_buoy'
  | 'water_lily_boost';

export interface Obstacle {
  id: string;
  type: ObstacleType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  rotationSpeed?: number;
  canJumpOver: boolean;
  damage: number;
  speedModifier?: number; // for mud, rapids
  isCollectible?: boolean;
  active: boolean;
  whirlpoolRadius?: number;
  whirlpoolForce?: number;
}

export interface WaveState {
  y: number; // position along the course (behind player)
  speed: number;
  baseSpeed: number;
  height: number;
  foamOffset: number;
  surgeTimer: number;
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
  shape: 'circle' | 'droplet' | 'foam' | 'leaf' | 'sparkle' | 'ripple';
  scale?: number;
}

export interface GameStats {
  timeElapsed: number;
  stage1Time: number;
  stage2Time: number;
  obstaclesDodged: number;
  damageTaken: number;
  boostsUsed: number;
  bestTime?: number;
  starsEarned: number;
  currentRound: number;
  totalRounds: number;
  roundStats: {
    round: number;
    title: string;
    time: number;
    stars: number;
    damage: number;
    boosts: number;
  }[];
}

export interface HighScoreEntry {
  difficulty: Difficulty;
  time: number;
  stars: number;
  date: string;
}
