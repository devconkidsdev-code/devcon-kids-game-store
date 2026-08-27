export type GameScreen =
  | 'menu'
  | 'map'
  | 'level'
  | 'village'
  | 'journal'
  | 'wardrobe'
  | 'achievements'
  | 'challenges'
  | 'settings'
  | 'credits'
  | 'ending';

export type PanicLevel = 'fine' | 'warning' | 'serious' | 'panic' | 'meltdown';

export type CharacterId =
  | 'bloop'
  | 'moo_moo'
  | 'prof_croak'
  | 'farmer_bramble'
  | 'clucky'
  | 'mr_sludge'
  | 'mayor_puddle'
  | 'pippin_penny'
  | 'dr_flow'
  | 'officer_drop'
  | 'drippy';

export type LevelType =
  | 'action_patrol' // Move around, turn off taps, catch leaks, chase drippies
  | 'pipe_puzzle' // Rotate / connect pipes, fix flow
  | 'detective' // Follow trails, inspect clues, find leaks
  | 'distribution' // Resource management & emergency decisions
  | 'river_clean' // Filter slime, sort trash, restore river
  | 'farm_irrigation' // Drip lines, moisture management, save crops
  | 'rain_harvest' // Build gutters, catch storm water in barrels
  | 'rain_dance' // Rhythm comedy mini-game
  | 'city_meters' // Smart meter leak tracking in Splash City
  | 'boss_finale'; // Level 100 "The Last Drop" multi-stage finale

export interface DialogueLine {
  speaker: CharacterId;
  speakerName: string;
  text: string;
  expression?: 'happy' | 'worried' | 'shocked' | 'confused' | 'excited' | 'proud' | 'mischievous';
}

export interface LevelData {
  id: number; // 1 to 100
  chapter: number; // 1 to 10
  title: string;
  subtitle: string;
  type: LevelType;
  storyIntro: DialogueLine[];
  storyOutro: DialogueLine[];
  objectiveText: string;
  educationalLesson: string;
  educationalTitle: string;
  targetWaterSaved: number; // in Litres / Drops
  timeLimitSec?: number;
  initialWater: number;
  rewards: {
    ecoCoins: number;
    drops: number;
    unlockItemId?: string;
  };
  gridConfig?: {
    rows: number;
    cols: number;
    layout?: string[];
  };
}

export interface ChapterData {
  id: number;
  name: string;
  subtitle: string;
  description: string;
  locationName: string;
  levels: number[]; // Level IDs [1..10]
  colorTheme: string;
  bgGradient: string;
  badge: string;
}

export interface VillageResources {
  cleanWater: number; // current litres in Big Blue Tank
  maxCapacity: number;
  daysRemaining: number; // 30 counting down to 0
  food: number;
  ecoCoins: number;
  health: number; // 0 - 100
  happiness: number; // 0 - 100
  envHealth: number; // 0 - 100
  groundwater: number; // 0 - 100
  pollutionIndex: number; // 0 - 100 (lower is better)
  mooMooSneakUnits: number; // funny cow counter
}

export interface VillageUpgrade {
  id: string;
  name: string;
  category: 'water' | 'eco' | 'farm' | 'storage';
  level: number;
  maxLevel: number;
  cost: number;
  waterBenefit: string;
  desc: string;
  icon: string;
  unlockedAtLevel: number;
}

export interface CosmeticItem {
  id: string;
  name: string;
  type: 'hat' | 'backpack' | 'outfit' | 'accessory' | 'village_decor';
  cost: number;
  icon: string;
  description: string;
  unlocked: boolean;
  equipped?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'action' | 'puzzle' | 'eco' | 'funny';
  icon: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  rewardCoins: number;
}

export interface JournalEntry {
  id: string;
  title: string;
  category: 'scarcity' | 'farming' | 'pollution' | 'rainwater' | 'groundwater' | 'ecosystems';
  unlocked: boolean;
  unlockedLevel: number;
  summary: string;
  realWorldFact: string;
  didYouKnow: string;
  bloopTip: string;
  icon: string;
}

export interface ChallengeMode {
  id: string;
  title: string;
  description: string;
  modifier: string;
  icon: string;
  targetLevel: number;
  completed: boolean;
  highScore: number;
}

export interface LevelReplayStats {
  waterSaved: number;
  waterWasted: number;
  leaksRepaired: number;
  rainwaterCollected: number;
  pollutionPrevented: number;
  cropsSaved: number;
  animalsHelped: number;
  funnyHighlight: string;
}

export interface UserProgress {
  currentLevel: number;
  unlockedLevels: number;
  levelStars: Record<number, number>; // levelId -> 1..3
  levelScores: Record<number, number>;
  totalWaterSaved: number;
  totalLeaksFixed: number;
  totalRainCollected: number;
  totalTreesPlanted: number;
  mooMooSipsCaught: number;
  resources: VillageResources;
  upgrades: Record<string, number>; // upgradeId -> level
  ownedCosmetics: string[];
  equippedCosmetics: {
    hat?: string;
    backpack?: string;
    outfit?: string;
    accessory?: string;
  };
  villageDecorations: string[];
  unlockedAchievements: string[];
  unlockedJournal: string[];
  completedChallenges: string[];
  gameCompleted: boolean;
  endingAchieved?: 'perfect' | 'good' | 'panic';
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  soundVolume: number;
  musicVolume: number;
  subtitles: boolean;
  textSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  colorblindMode: boolean;
  simplifiedControls: boolean;
}
