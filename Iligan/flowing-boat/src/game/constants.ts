import { Difficulty, RoundConfig } from '../types';

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

// Stage Distance Settings (in world units)
export const STAGE_1_LENGTH = 2600; // Distance to boat on land/shore
export const STAGE_2_LENGTH = 5800; // Distance to finish line on river
export const TOTAL_GAME_LENGTH = STAGE_1_LENGTH + STAGE_2_LENGTH;

// Rounds Configuration
export const ROUNDS_CONFIG: RoundConfig[] = [
  {
    round: 1,
    title: 'Emerald Forest Riverbank',
    subtitle: 'Sunny shores & winding blue rapids',
    biome: 'forest',
    stage1Length: 2400,
    stage2Length: 5400,
    waveSpeedMultiplier: 1.0,
    obstacleDensityMultiplier: 1.0,
    description: 'Sprint across grassy riverbanks to reach the boat, then navigate gentle blue river waters.',
    themeColor: '#38bdf8',
  },
  {
    round: 2,
    title: 'Sunset Canyon Rapids',
    subtitle: 'Sandstone cliffs & amber whirlpools',
    biome: 'canyon',
    stage1Length: 2600,
    stage2Length: 5800,
    waveSpeedMultiplier: 1.08,
    obstacleDensityMultiplier: 1.2,
    description: 'Traverse rocky desert canyon trails and navigate high-speed ember currents with tricky vortices.',
    themeColor: '#f97316',
  },
  {
    round: 3,
    title: 'Stormy Mountain Gorge',
    subtitle: 'Thunder torrent & relentless tidal surge',
    biome: 'storm',
    stage1Length: 2800,
    stage2Length: 6400,
    waveSpeedMultiplier: 1.16,
    obstacleDensityMultiplier: 1.35,
    description: 'The ultimate survival trial! Escape through dark rainy crags and survive tempestuous white-water rapids.',
    themeColor: '#818cf8',
  },
];

export const TOTAL_ROUNDS = ROUNDS_CONFIG.length;

// Player physical dimensions
export const PLAYER_WALK_WIDTH = 34;
export const PLAYER_WALK_HEIGHT = 44;

export const BOAT_WIDTH = 48;
export const BOAT_HEIGHT = 80;

// Movement speeds
export const WALK_SPEED_X = 260; // pixels per second
export const WALK_SPEED_Y_FORWARD = 290;
export const WALK_SPEED_Y_BACKWARD = 180;

export const BOAT_SPEED_X = 280;
export const BOAT_BASE_SPEED_Y = 320;
export const BOAT_ACCEL_SPEED_Y = 460;
export const BOAT_BRAKE_SPEED_Y = 200;
export const BOAT_BOOST_SPEED_Y = 620;

export const JUMP_GRAVITY = 1100;
export const JUMP_VELOCITY = 460;

// River boundaries
export const RIVER_BANK_WIDTH = 120; // grass/shore width on sides
export const RIVER_MIN_X = 140;
export const RIVER_MAX_X = CANVAS_WIDTH - 140;

// Difficulty Settings
export const DIFFICULTY_CONFIG: Record<
  Difficulty,
  {
    name: string;
    description: string;
    waveSpeedStage1: number;
    waveSpeedStage2: number;
    obstacleDensity: number;
    playerHealth: number;
    waveCatchupBuffer: number;
  }
> = {
  easy: {
    name: 'Gentle Current (Easy)',
    description: 'Slower chasing wave, forgiving obstacles, 4 hearts.',
    waveSpeedStage1: 175,
    waveSpeedStage2: 230,
    obstacleDensity: 0.65,
    playerHealth: 4,
    waveCatchupBuffer: 280,
  },
  normal: {
    name: 'Wild River (Normal)',
    description: 'Balanced thrilling escape, dynamic obstacles, 3 hearts.',
    waveSpeedStage1: 215,
    waveSpeedStage2: 270,
    obstacleDensity: 1.0,
    playerHealth: 3,
    waveCatchupBuffer: 220,
  },
  hard: {
    name: 'Raging Rapids (Hard)',
    description: 'High-speed relentless wave, dense hazards, 3 hearts.',
    waveSpeedStage1: 250,
    waveSpeedStage2: 310,
    obstacleDensity: 1.35,
    playerHealth: 3,
    waveCatchupBuffer: 170,
  },
};

export interface WaveSpeedPreset {
  id: string;
  label: string;
  multiplier: number;
  description: string;
}

export const WAVE_SPEED_PRESETS: WaveSpeedPreset[] = [
  { id: 'slow', label: 'Slow (0.75x)', multiplier: 0.75, description: 'Relaxed scenic escape' },
  { id: 'normal', label: 'Standard (1.0x)', multiplier: 1.0, description: 'Default balanced pace' },
  { id: 'fast', label: 'Fast (1.2x)', multiplier: 1.2, description: 'Urgent high-stakes pursuit' },
  { id: 'extreme', label: 'Extreme (1.4x)', multiplier: 1.4, description: 'Heart-pounding survival trial' },
];

