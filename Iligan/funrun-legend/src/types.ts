export type GameState =
  | 'MENU'
  | 'PLAYING'
  | 'PAUSED'
  | 'GAMEOVER'
  | 'VICTORY'
  | 'LEVEL_SELECT'
  | 'HOW_TO_PLAY'
  | 'LEADERBOARD'
  | 'CUSTOMIZE';

export type ObstacleType = 'ROLLING_ROCK' | 'BOUNCING_BOULDER' | 'TREE_TRUNK' | 'ROLLING_LOG' | 'SWINGING_BRANCH' | 'MUD_PIT';

export type PowerupType = 'PROVINCE_MANGO' | 'HERBAL_TONIC' | 'GOLDEN_SNEAKERS' | 'SPEED_BOOST';

export type CharacterGender = 'boy' | 'girl';
export type HairStyle = 'spiky' | 'ponytail' | 'long_braid' | 'short_fade' | 'curly_afro';

export interface CharacterConfig {
  gender: CharacterGender;
  name: string;
  title: string;
  skinTone: string;
  hairColor: string;
  hairStyle: HairStyle;
  jerseyColor: string;
  jerseyNumber: string;
  headbandColor: string;
  shortsColor: string;
  shoesColor: string;
}

export interface Player {
  x: number; // screen position
  y: number; // vertical position (ground = 0, positive = up)
  vy: number; // vertical velocity
  width: number;
  height: number;
  isGrounded: boolean;
  isJumping: boolean;
  isSliding: boolean;
  slideTimer: number;
  speed: number; // current forward speed
  baseSpeed: number;
  maxSpeed: number;
  acceleration: number;
  lives: number;
  maxLives: number;
  invincibleTimer: number; // in seconds after hit
  boostTimer: number;
  goldenTimer: number;
  distanceTraveled: number; // meters
  animationFrame: number;
  runCycle: number;
  state: 'running' | 'jumping' | 'sliding' | 'hit' | 'celebrating';
  character: CharacterConfig;
}

export interface Obstacle {
  id: string;
  type: ObstacleType;
  x: number; // world x position
  y: number; // world y position
  width: number;
  height: number;
  speedX: number; // speed relative to world or moving towards player
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  bounces?: boolean;
  bounceHeight?: number;
  bounceSpeed?: number;
  bounceOffset?: number;
  cleared?: boolean; // player successfully passed/jumped over
}

export interface Powerup {
  id: string;
  type: PowerupType;
  x: number;
  y: number;
  width: number;
  height: number;
  collected: boolean;
  floatOffset: number;
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
  shape?: 'circle' | 'leaf' | 'sparkle' | 'dust';
}

export interface PlayerRock {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  life: number;
  maxLife: number;
  hasCollided?: boolean;
}

export interface BossRock {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  type: 'BOULDER' | 'MAGMA_ROCK' | 'SPIKED_TIMBER' | 'GIANT_CRUSHER';
  bounces?: boolean;
  bounceHeight?: number;
  bounceSpeed?: number;
  bounceOffset?: number;
}

export interface Boss {
  id: string;
  name: string;
  title: string;
  theme: 'countryside' | 'forest' | 'rocky_mountain' | 'legend_ridge';
  x: number; // world/screen x position
  y: number;
  targetX: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  state: 'entering' | 'fighting' | 'throwing' | 'hurt' | 'defeated';
  hurtTimer: number;
  attackTimer: number;
  attackCooldown: number;
  attackPattern: number;
  windupTimer: number;
  introBannerTimer: number;
  floatOffset: number;
  defeatTimer: number;
}

export interface LevelConfig {
  id: number;
  name: string;
  subtitle: string;
  theme: 'countryside' | 'forest' | 'rocky_mountain' | 'legend_ridge';
  distanceToSafeZone: number; // e.g. 1000m
  timeLimitSeconds: number; // e.g. 60s (0 for infinite)
  obstacleFrequency: number; // spawn rate factor
  obstacleTypes: ObstacleType[];
  speedMultiplier: number;
  isInfinite?: boolean;
  backgroundColors: {
    skyTop: string;
    skyBottom: string;
    mountains: string;
    hills: string;
    trees: string;
    ground: string;
    road: string;
  };
  description: string;
}

export interface RunStats {
  levelId: number;
  timeRemaining: number;
  timeSpent: number;
  distance: number;
  obstaclesDodged: number;
  powerupsCollected: number;
  topSpeedKmH: number;
  livesLeft: number;
  score: number;
  rank: 'LEGENDARY' | 'SPEEDSTER' | 'PROVINCE_HERO' | 'RUNNER';
  characterName: string;
  gender: CharacterGender;
  isInfinite?: boolean;
  difficultyTier?: number;
}

export interface HighScoreEntry {
  id: string;
  playerName: string;
  levelId: number;
  levelName: string;
  score: number;
  timeSpent: number;
  date: string;
  gender?: CharacterGender;
  isInfinite?: boolean;
  distance?: number;
  difficultyTier?: number;
}

