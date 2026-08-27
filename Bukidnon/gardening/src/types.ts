export type PlantRarity = 'common' | 'uncommon' | 'rare' | 'exotic' | 'legendary';

export type WeatherType = 'sunny' | 'rainy' | 'golden_hour' | 'starlight';

export type ToolType = 'select' | 'water' | 'plant' | 'harvest' | 'fertilize' | 'clear';

export interface PlantDefinition {
  id: string;
  name: string;
  scientificName: string;
  tier: PlantRarity;
  description: string;
  growthTimeSeconds: number; // base growth time
  waterRequirement: number; // 1-3 waterings needed
  waterDrainRate: number; // seconds per water level drop
  buyPrice: number;
  sellPrice: number;
  xpReward: number;
  unlockLevel: number;
  unlockRequirementText?: string;
  requiredHarvests?: { cropId: string; count: number };
  color: {
    primary: string;
    secondary: string;
    glow?: string;
    foliage: string;
  };
  icon: string;
  flowerType: 'root' | 'grain' | 'berry' | 'flower' | 'fruit_tree' | 'crystal' | 'cosmic' | 'glowing_vine';
  mutationPossibility?: {
    withCropId: string;
    resultCropId: string;
    chance: number; // 0 to 1
  };
}

export interface SoilPlot {
  id: number;
  unlocked: boolean;
  unlockCost: number;
  unlockLevel: number;
  plantId: string | null;
  plantedAt: number | null; // timestamp ms
  growthProgress: number; // 0 to 100
  growthStage: 0 | 1 | 2 | 3 | 4; // 0: empty/soil, 1: seed, 2: sprout, 3: growing/bud, 4: mature ready to harvest
  waterLevel: number; // 0 to 100 (needs > 0 to grow)
  lastWateredAt: number | null;
  fertilized: boolean;
  fertilizerType?: 'speed' | 'double_yield' | 'mutation_boost';
  isGoldenReady?: boolean;
}

export interface InventoryItem {
  id: string;
  count: number;
}

export interface MarketOrder {
  id: string;
  customerName: string;
  customerAvatar: string;
  title: string;
  requirements: { cropId: string; needed: number }[];
  rewardCoins: number;
  rewardXp: number;
  bonusSeedId?: string;
  completed: boolean;
  expiresInSeconds?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  rewardCoins: number;
  rewardSeedId?: string;
}

export interface ToolUpgrade {
  id: string;
  name: string;
  category: 'watering' | 'harvest' | 'soil' | 'sprinkler';
  level: number;
  maxLevel: number;
  currentEffectDescription: string;
  nextEffectDescription?: string;
  cost: number;
  unlockLevel: number;
  icon: string;
}

export interface GameStats {
  totalHarvests: number;
  totalCoinsEarned: number;
  totalWaterings: number;
  exoticSeedsUnlocked: number;
  discoveredCropIds: string[];
  harvestCountsByCrop: Record<string, number>;
  timePlayedSeconds: number;
}

export interface GameSaveState {
  version: number;
  coins: number;
  xp: number;
  level: number;
  selectedSeedId: string;
  selectedTool: ToolType;
  plots: SoilPlot[];
  seedsInventory: Record<string, number>;
  harvestInventory: Record<string, number>;
  unlockedSeedIds: string[];
  toolUpgrades: Record<string, number>;
  stats: GameStats;
  currentWeather: WeatherType;
  weatherTimeRemaining: number;
  activeOrders: MarketOrder[];
  achievements: Achievement[];
  autoSprinklerEnabled: boolean;
  soundEnabled: boolean;
}
