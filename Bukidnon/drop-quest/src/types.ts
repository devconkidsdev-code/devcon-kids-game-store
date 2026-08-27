export type GameScreen = 'TITLE' | 'PLAYING' | 'PAUSED' | 'LEVEL_COMPLETE' | 'GAME_OVER' | 'VICTORY';

export interface Vector2D {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Player extends Rect {
  vx: number;
  vy: number;
  isGrounded: boolean;
  facing: 'left' | 'right';
  animFrame: number;
  animTimer: number;
  invulnerableTimer: number; // in seconds
  isRespawning: boolean;
  respawnTimer: number;
  lastSafeX: number;
  lastSafeY: number;
  coyoteTimer: number; // for snappy jump forgiveness
  jumpBufferTimer: number;
  // Water Gun Power-up
  hasWaterGun: boolean;
  waterAmmo: number;
  maxWaterAmmo: number;
  shootCooldown: number;
  // Cartoon Animation & Polish
  squashStretchX?: number;
  squashStretchY?: number;
  blinkTimer?: number;
  expressionTimer?: number;
  expression?: 'normal' | 'happy' | 'determined' | 'surprised' | 'shooting' | 'hurt';
}

export interface QuestionBlock extends Rect {
  id: string;
  hit: boolean;
  bumpOffset: number; // Y bounce visual offset
  bumpVy: number;
  hasItem: boolean;
  itemType?: 'water_gun';
}

export interface PowerUpItem extends Rect {
  id: string;
  type: 'water_gun';
  vx: number;
  vy: number;
  spawnY: number;
  emergeProgress: number; // 0 to 1 as it rises out of the block
  isEmerging: boolean;
  collected: boolean;
  floatTimer: number;
}

export interface WaterBlast extends Rect {
  id: string;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

export interface WaterDrop extends Rect {
  id: string;
  collected: boolean;
  value: number; // percentage or points
  isGolden?: boolean;
  floatOffset: number;
  sparkleTimer: number;
}

export type ObstacleType = 'tree' | 'wall' | 'rock' | 'cactus' | 'scarecrow';

export interface WeedEnemy extends Rect {
  id: string;
  vx: number;
  facing: 'left' | 'right';
  patrolMinX: number;
  patrolMaxX: number;
  speed: number;
  isSquashed: boolean;
  squashTimer: number; // For brief squish animation before disappearing
  animTimer: number;
  type?: 'spiky_weed' | 'bramble_weed';
}

export interface SunflowerEnemy extends Rect {
  id: string;
  facing: 'left' | 'right';
  fireCooldown: number; // timer until next shot
  fireInterval: number; // seconds between shots
  range: number; // activation detection distance
  isSquashed: boolean;
  squashTimer: number;
  animTimer: number;
  windupTimer: number; // puff/shake before spitting seed
  aimAngle: number;
}

export interface SeedProjectile extends Rect {
  id: string;
  vx: number;
  vy: number;
  rotation: number;
  rotSpeed: number;
  life: number;
  maxLife: number;
}

export interface Obstacle extends Rect {
  id: string;
  type: ObstacleType;
  solid: boolean; // if solid, blocks movement; if hazard, damages on touch
  damageOnTouch?: boolean;
}

export interface Platform extends Rect {
  id: string;
  type: 'wood' | 'hay' | 'stone' | 'cloud' | 'moving';
  oneWay?: boolean; // can jump up through it
  moveRange?: { minX: number; maxX: number; speed: number; direction: number };
}

export interface GroundSegment {
  x: number;
  width: number;
  height: number; // from bottom of level
  hasPitBefore?: boolean;
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
  shape?: 'circle' | 'sparkle' | 'drop' | 'leaf' | 'star' | 'text' | 'ring' | 'bubble' | 'heart' | 'dizzy';
  text?: string;
  rotation?: number;
  rotSpeed?: number;
  scale?: number;
}

export interface LevelConfig {
  id: number;
  name: string;
  subtitle: string;
  width: number;
  height: number;
  groundY: number;
  groundSegments: GroundSegment[];
  platforms: Platform[];
  obstacles: Obstacle[];
  weeds?: Omit<WeedEnemy, 'isSquashed' | 'squashTimer' | 'animTimer'>[];
  sunflowers?: Omit<SunflowerEnemy, 'isSquashed' | 'squashTimer' | 'animTimer' | 'windupTimer' | 'aimAngle' | 'fireCooldown'>[];
  questionBlocks?: QuestionBlock[];
  drops: Omit<WaterDrop, 'collected' | 'floatOffset' | 'sparkleTimer'>[];
  theme: {
    skyTop: string;
    skyBottom: string;
    groundColor: string;
    groundGrassColor: string;
    mountainColor: string;
    cloudColor: string;
    sunColor: string;
  };
  targetDropsCount: number;
  timeLimit?: number;
  cropGoalX: number; // X position of the drought-stricken crop patch at the end
}

export interface GameState {
  screen: GameScreen;
  currentLevelIndex: number;
  lives: number;
  maxLives: number;
  timeLeft: number;
  dropsCollected: number;
  totalDropsInLevel: number;
  progressPercent: number; // 0 to 100
  score: number;
  soundEnabled: boolean;
  cameraX: number;
  cameraY: number;
  isPaused: boolean;
  highScore: number;
  lossReason: 'timeout' | 'lives' | null;
  // Water Blaster Power-up State
  hasWaterGun: boolean;
  waterAmmo: number;
  maxWaterAmmo: number;
}
