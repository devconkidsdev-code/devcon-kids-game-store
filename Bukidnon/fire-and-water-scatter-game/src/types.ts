export type GameMode = 'blitz' | 'cascade' | 'mines';

export type BlitzControlStyle = 'slash' | 'catch' | 'click';

export interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'water' | 'fire' | 'steam' | 'spark' | 'bubble' | 'text';
  text?: string;
}

export interface BlitzItem {
  id: number;
  type: 'water_diamond' | 'fire_bomb' | 'ice_diamond' | 'cluster_diamond' | 'mega_fire_bomb' | 'shield_bubble';
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  vRot: number;
  radius: number;
  size: number;
  fuseTimer: number; // For bombs (in seconds or ticks)
  maxFuse: number;
  hp?: number;
  isDefused?: boolean;
  isSliced?: boolean;
  slicedAngle?: number;
  slicedProgress?: number;
  created: number;
}

export interface TrailPoint {
  x: number;
  y: number;
  time: number;
}

export interface GameStats {
  highScoreBlitz: number;
  highScoreCascade: number;
  highScoreMines: number;
  totalWaterDiamondsCollected: number;
  totalFireBombsDefused: number;
  totalCascadesWon: number;
  tsunamisTriggered: number;
}

export interface GridSymbol {
  id: string;
  type: 'water_diamond' | 'fire_bomb' | 'water_drop' | 'water_shell' | 'fire_spark' | 'steam_crystal' | 'ocean_pearl';
  value: number;
  multiplier?: number;
  highlight?: boolean;
  exploding?: boolean;
}
