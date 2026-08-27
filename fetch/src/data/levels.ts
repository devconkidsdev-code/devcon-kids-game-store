import { LevelConfig, TileType, PerformanceRating } from '../types';

/*
Tile codes:
0: PATH
1: ROCK_WALL
2: TREE
3: SPRING (Start)
4: VILLAGE (Destination)
5: SCREE (Rough terrain)
6: DEW_SPRING (+10% Water)
7: BRIDGE
*/

// Level 1: Foothills (15 x 11)
// Spring at (1,1), Village at (13,9)
const level1Grid: TileType[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 3, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 2, 1, 1],
  [1, 0, 2, 0, 2, 0, 2, 0, 1, 0, 2, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 2, 2, 2, 0, 1],
  [1, 2, 2, 1, 1, 0, 2, 2, 2, 0, 0, 6, 2, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 2, 0, 0, 0, 1],
  [1, 0, 2, 0, 1, 1, 1, 0, 1, 1, 1, 0, 2, 2, 1],
  [1, 0, 2, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 0, 2, 2, 2, 2, 1, 1, 1, 0, 1, 1, 2, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 4, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// Level 2: Rocky Pass (19 x 13)
// Spring at (1,2), Village at (17,10)
const level2Grid: TileType[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 2, 0, 0, 0, 1, 1, 1, 0, 0, 0, 2, 2, 1, 1, 1, 1],
  [1, 3, 0, 0, 0, 2, 0, 0, 0, 1, 0, 2, 0, 0, 0, 0, 0, 1, 1],
  [1, 1, 2, 2, 0, 2, 2, 1, 0, 1, 0, 2, 2, 1, 1, 2, 0, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 5, 5, 5, 1, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 2, 0, 1],
  [1, 0, 1, 6, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 2, 0, 1],
  [1, 0, 1, 1, 0, 1, 1, 1, 2, 1, 1, 0, 1, 0, 0, 0, 2, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 1],
  [1, 1, 1, 2, 2, 1, 1, 1, 1, 0, 1, 0, 0, 6, 1, 2, 2, 0, 1],
  [1, 0, 0, 0, 0, 0, 5, 5, 0, 0, 1, 1, 1, 0, 1, 0, 0, 4, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// Level 3: High Mountain (23 x 15)
// Spring at (1,1), Village at (21,13)
const level3Grid: TileType[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 3, 0, 0, 1, 0, 0, 0, 0, 1, 1, 6, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1],
  [1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 6, 1, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 7, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 1, 5, 5, 5, 0, 1, 1, 1, 0, 1, 1, 0, 1, 0, 1],
  [1, 1, 1, 0, 1, 1, 1, 0, 1, 5, 1, 5, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 6, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 5, 5, 5, 0, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1],
  [1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0, 4, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

export const LEVELS: LevelConfig[] = [
  {
    id: 1,
    name: 'Level 1 — Foothills',
    subtitle: 'Gentle slopes and pine meadows. A steady start.',
    biome: 'foothills',
    width: 15,
    height: 11,
    grid: level1Grid,
    startPos: { x: 1, y: 1 },
    villagePos: { x: 13, y: 9 },
    baseLeakRate: 1.2, // % per sec
    moveLeakRate: 1.8, // % per sec
    screeLeakRate: 3.0,
    parTime: 25, // seconds
    initialWater: 100,
  },
  {
    id: 2,
    name: 'Level 2 — Rocky Pass',
    subtitle: 'Crags, loose scree, and deceptive canyon forks.',
    biome: 'rocky_pass',
    width: 19,
    height: 13,
    grid: level2Grid,
    startPos: { x: 1, y: 2 },
    villagePos: { x: 17, y: 10 },
    baseLeakRate: 1.8, // % per sec
    moveLeakRate: 2.6, // % per sec
    screeLeakRate: 4.5,
    parTime: 32, // seconds
    initialWater: 100,
  },
  {
    id: 3,
    name: 'Level 3 — High Mountain',
    subtitle: 'Alpine winds, narrow ledges, and sheer drop-offs.',
    biome: 'summit',
    width: 23,
    height: 15,
    grid: level3Grid,
    startPos: { x: 1, y: 1 },
    villagePos: { x: 21, y: 13 },
    baseLeakRate: 2.4, // % per sec
    moveLeakRate: 3.4, // % per sec
    screeLeakRate: 5.5,
    parTime: 40, // seconds
    initialWater: 100,
  },
];

export function getRating(waterPercent: number): { rating: PerformanceRating; color: string; badge: string } {
  if (waterPercent >= 90) {
    return { rating: 'Mountain Master', color: 'text-emerald-400', badge: '🏔️' };
  }
  if (waterPercent >= 70) {
    return { rating: 'Great Fetch', color: 'text-sky-400', badge: '💧' };
  }
  if (waterPercent >= 40) {
    return { rating: 'Close Call', color: 'text-amber-400', badge: '🪣' };
  }
  if (waterPercent > 0) {
    return { rating: 'Just Enough', color: 'text-orange-400', badge: '🪵' };
  }
  return { rating: 'Empty Bucket', color: 'text-rose-400', badge: '⚠️' };
}

export function calculateScore(waterRemaining: number, timeTaken: number, parTime: number): number {
  // Score = Water Remaining * 10 + Time Bonus
  const waterScore = Math.max(0, Math.round(waterRemaining * 10));
  const timeSaved = Math.max(0, parTime - timeTaken);
  const timeBonus = Math.round(timeSaved * 12);
  return waterScore + timeBonus;
}

export function isPassable(tile: TileType): boolean {
  // 0: PATH, 3: SPRING, 4: VILLAGE, 5: SCREE, 6: DEW_SPRING, 7: BRIDGE are all walkable
  // 1: ROCK_WALL, 2: TREE are impassable
  return tile !== 1 && tile !== 2;
}
