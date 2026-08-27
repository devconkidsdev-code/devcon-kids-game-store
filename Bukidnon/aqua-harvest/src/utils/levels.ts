import { LevelConfig, CropType } from '../types';

export const CROP_TYPES: { type: CropType; name: string; icon: string; bonusPoints: number; color: string }[] = [
  { type: 'pineapple', name: 'Bukidnon Sweet Pineapple', icon: '🍍', bonusPoints: 1, color: '#f59e0b' },
  { type: 'corn', name: 'Highland Golden Corn', icon: '🌽', bonusPoints: 1, color: '#eab308' },
  { type: 'cabbage', name: 'Cool Valley Cabbage', icon: '🥬', bonusPoints: 1, color: '#22c55e' },
  { type: 'strawberry', name: 'Mountain Strawberry', icon: '🍓', bonusPoints: 1, color: '#ef4444' },
  { type: 'carrot', name: 'Crisp Terraced Carrot', icon: '🥕', bonusPoints: 1, color: '#f97316' },
  { type: 'coffee', name: 'Kitanglad Arabica Coffee', icon: '☕', bonusPoints: 2, color: '#854d0e' },
];

export const BASE_LEVELS: LevelConfig[] = [
  {
    level: 1,
    name: 'Kitanglad Sunrise',
    description: 'Gentle morning dew. Learn to spot dry crops and practice smart watering!',
    cropCount: 5,
    targetScore: 8,
    timeLimit: 45,
    waterSupply: 110,
    baseDryRate: 2.4,
  },
  {
    level: 2,
    name: 'Dahilayan Breeze',
    description: 'Highland breeze dries soil steadily. Keep an eye on multiple plots!',
    cropCount: 6,
    targetScore: 15,
    timeLimit: 40,
    waterSupply: 95,
    baseDryRate: 3.1,
  },
  {
    level: 3,
    name: 'Sumilao Terraces',
    description: 'Bright sun warms the ridges. Crops dry quicker and water becomes precious!',
    cropCount: 7,
    targetScore: 22,
    timeLimit: 36,
    waterSupply: 85,
    baseDryRate: 3.8,
  },
  {
    level: 4,
    name: 'Manolo Heatwave',
    description: 'Afternoon heatwave! Rapid drying demands fast reflexes and zero water waste.',
    cropCount: 8,
    targetScore: 30,
    timeLimit: 32,
    waterSupply: 80,
    baseDryRate: 4.5,
  },
  {
    level: 5,
    name: 'Bukidnon Master Grower',
    description: 'The ultimate arcade trial! 9 active plots, ultra fast drying, surgical precision.',
    cropCount: 9,
    targetScore: 40,
    timeLimit: 28,
    waterSupply: 75,
    baseDryRate: 5.2,
  },
];

export function getLevelConfig(levelNumber: number): LevelConfig {
  if (levelNumber <= BASE_LEVELS.length) {
    return BASE_LEVELS[levelNumber - 1];
  }
  
  // Endless scaling past level 5
  const extraLevels = levelNumber - 5;
  return {
    level: levelNumber,
    name: `Highland Grand Master Lv.${levelNumber}`,
    description: `Hardcore farming frenzy! Scorching sun, extreme drying speed, and strict water limits.`,
    cropCount: Math.min(9, 8 + Math.floor(extraLevels / 2)),
    targetScore: 40 + extraLevels * 12,
    timeLimit: Math.max(24, 28 - extraLevels),
    waterSupply: Math.max(65, 75 - extraLevels * 2),
    baseDryRate: 5.2 + extraLevels * 0.4,
  };
}
