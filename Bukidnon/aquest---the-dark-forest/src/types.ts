export interface Vector2D {
  x: number;
  y: number;
}

export interface Obstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: 'tree' | 'well' | 'chest' | 'bush' | 'rock' | 'fence' | 'ruin' | 'house';
  radius?: number;
}

export interface WaterBucket {
  id: string;
  x: number;
  y: number;
  collected: boolean; // picked up or delivered
  delivered: boolean; // brought to house
  pulsePhase: number;
}

export interface Creature {
  id: string;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  state: 'wandering' | 'stalking' | 'hunting' | 'resting' | 'stunned';
  speed: number;
  sightRadius: number;
  huntTimer: number;
  stamina: number;
  maxStamina: number;
  restTimer: number;
  animFrame: number;
  legPhase: number;
  lastSeenPlayerPos: Vector2D | null;
  patrolPoints: Vector2D[];
  currentPatrolIdx: number;
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
}

export interface LevelConfig {
  levelNumber: number;
  title: string;
  subtitle: string;
  mapWidth: number;
  mapHeight: number;
  flashlightRadius: number;
  flashlightAngle: number; // in radians, e.g. Math.PI / 3.5
  creatureSpeed: number;
  creatureSightRadius: number;
  numBuckets: number;
  fogDensity: number; // 0.8 to 0.98
  obstacles: Obstacle[];
  spawnPoint: Vector2D;
  housePosition: Vector2D;
  houseSize: { width: number; height: number };
  creatureSpawn: Vector2D;
  creatureSpawns?: Vector2D[];
  bucketPositions: Vector2D[];
}

export type GameState = 'menu' | 'intro' | 'playing' | 'paused' | 'level_clear' | 'game_over' | 'victory';

export interface PlayerStats {
  lives: number;
  maxLives: number;
  stamina: number;
  maxStamina: number;
  isSprinting: boolean;
  flashlightOn: boolean;
  battery: number;
  maxBattery: number;
  invulnerableTime: number; // timer in seconds
  score: number;
  totalBucketsDelivered: number;
  timeRemaining: number; // 5-minute countdown (300 seconds)
  maxTime: number;
  timeElapsed: number;
  nearMisses: number;
  carryingBucketId: string | null;
  bucketsDeliveredInLevel: number;
}
