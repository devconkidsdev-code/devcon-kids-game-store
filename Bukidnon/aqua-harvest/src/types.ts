export type GameStatus = 'MENU' | 'PLAYING' | 'PAUSED' | 'LEVEL_COMPLETE' | 'GAME_OVER';

export type CropType = 'pineapple' | 'corn' | 'cabbage' | 'strawberry' | 'carrot' | 'coffee';

export type MoistureState = 'PARCHED' | 'DRY' | 'OPTIMAL' | 'WET' | 'FLOODED';

export interface Crop {
  id: number;
  type: CropType;
  moisture: number; // 0 to 100
  dryRate: number; // moisture lost per second
  growthStage: number; // 1 to 3
  isGolden?: boolean;
  lastWateredTime?: number;
  statusText?: string;
  statusTimer?: number;
}

export interface LevelConfig {
  level: number;
  cropCount: number;
  targetScore: number;
  timeLimit: number; // seconds
  waterSupply: number; // liters / units
  baseDryRate: number; // average decay
  name: string;
  description: string;
}

export interface WaterParticle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  type: 'score' | 'penalty' | 'combo' | 'water';
}

export interface GameStats {
  score: number;
  level: number;
  lives: number;
  maxLives: number;
  waterRemaining: number;
  maxWater: number;
  timeLeft: number;
  targetScore: number;
  combo: number;
  maxCombo: number;
  cropsWateredCorrectly: number;
  mistakesCount: number;
  waterWastedCount: number;
  accuracy: number;
}
