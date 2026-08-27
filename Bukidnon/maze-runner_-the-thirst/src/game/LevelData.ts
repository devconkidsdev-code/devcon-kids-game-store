import { LevelConfig } from '../types';

export const CAMPAIGN_LEVELS: LevelConfig[] = [
  {
    levelNumber: 1,
    title: 'The Backyard Box Labyrinth',
    themeName: 'Sunlit Cardboard Garden',
    cols: 9,
    rows: 9,
    timeLimit: 55,
    cropsToWater: 2,
    trapsCount: 2,
    powerUpsCount: 3,
    chasersCount: 1, // 1 Greedy Guzzler
    obstaclesCount: 2, // Rolling barrels / spinning blades
    ambientLight: 0.65,
    targetScore: 2500
  },
  {
    levelNumber: 2,
    title: 'The Forgotten Warehouse',
    themeName: 'Industrial Box Maze',
    cols: 13,
    rows: 13,
    timeLimit: 75,
    cropsToWater: 3,
    trapsCount: 5,
    powerUpsCount: 4,
    chasersCount: 2, // 1 Guzzler + 1 Sprinter
    obstaclesCount: 4, // Rolling barrels & electric laser gates
    ambientLight: 0.55,
    targetScore: 4800
  },
  {
    levelNumber: 3,
    title: 'The Creaky Catacombs',
    themeName: 'Cardboard Tomb of the Ancient Amazon',
    cols: 15,
    rows: 15,
    timeLimit: 90,
    cropsToWater: 4,
    trapsCount: 7,
    powerUpsCount: 5,
    chasersCount: 3, // Guzzlers + Golden Bandit Bonus Catch!
    obstaclesCount: 6, // Spiked Crushers, Rolling Barrels, Electric Gates
    ambientLight: 0.48,
    targetScore: 7200
  },
  {
    levelNumber: 4,
    title: 'The Midnight Labyrinth',
    themeName: 'Pitch Black Dead Ends',
    cols: 17,
    rows: 17,
    timeLimit: 105,
    cropsToWater: 5,
    trapsCount: 10,
    powerUpsCount: 6,
    chasersCount: 4,
    obstaclesCount: 8,
    ambientLight: 0.42,
    targetScore: 10500
  },
  {
    levelNumber: 5,
    title: 'The Mega Thirst Fortress',
    themeName: 'The Ultimate Cardboard Gauntlet',
    cols: 19,
    rows: 19,
    timeLimit: 120,
    cropsToWater: 6,
    trapsCount: 12,
    powerUpsCount: 7,
    chasersCount: 5,
    obstaclesCount: 10,
    ambientLight: 0.38,
    targetScore: 15000
  }
];

export function getEndlessLevelConfig(depth: number): LevelConfig {
  const size = Math.min(23, 9 + depth * 2);
  return {
    levelNumber: depth,
    title: `Endless Maze: Floor ${depth}`,
    themeName: 'Infinite Corrugated Vaults',
    cols: size,
    rows: size,
    timeLimit: Math.max(35, 60 - depth * 3),
    cropsToWater: Math.min(8, 2 + Math.floor(depth * 0.8)),
    trapsCount: Math.min(18, 2 + depth * 2),
    powerUpsCount: Math.min(8, 3 + Math.floor(depth * 0.5)),
    chasersCount: Math.min(6, 1 + Math.floor(depth * 0.75)),
    obstaclesCount: Math.min(12, 2 + depth * 2),
    ambientLight: Math.max(0.35, 0.6 - depth * 0.02),
    targetScore: depth * 3500
  };
}
