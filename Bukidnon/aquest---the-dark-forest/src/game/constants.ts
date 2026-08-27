import { LevelConfig, Obstacle } from '../types';

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;

export const PLAYER_SIZE = 26;
export const BASE_PLAYER_SPEED = 2.8; // Matched with creature speed per level
export const BUCKET_PICKUP_RADIUS = 40;
export const HOUSE_DELIVERY_RADIUS = 75;
export const LEVEL_TIME_LIMIT = 300; // 5 minutes in seconds

export const CREATURE_MAX_STAMINA = 100;
export const CREATURE_STAMINA_DRAIN_RATE = 18; // per second when hunting
export const CREATURE_REST_DURATION = 3.5; // seconds resting to catch breath

// Helper to create tree obstacles with leafy foliage radius
function createTree(id: string, x: number, y: number): Obstacle {
  return { id, x, y, width: 34, height: 34, type: 'tree', radius: 24 };
}

function createBush(id: string, x: number, y: number): Obstacle {
  return { id, x, y, width: 26, height: 26, type: 'bush', radius: 16 };
}

function createRock(id: string, x: number, y: number): Obstacle {
  return { id, x, y, width: 28, height: 24, type: 'rock', radius: 18 };
}

function createWell(id: string, x: number, y: number): Obstacle {
  return { id, x, y, width: 44, height: 44, type: 'well', radius: 28 };
}

function createChest(id: string, x: number, y: number): Obstacle {
  return { id, x, y, width: 32, height: 26, type: 'chest', radius: 20 };
}

function createFence(id: string, x: number, y: number, width: number, height: number): Obstacle {
  return { id, x, y, width, height, type: 'fence' };
}

export const LEVELS: LevelConfig[] = [
  // LEVEL 1: The Whispering Woods (1 Stalker)
  {
    levelNumber: 1,
    title: "Stage 1: The Whispering Woods",
    subtitle: "1 Creature stalks the woods. Turn OFF your flashlight [F] to sneak past in darkness. Bring 3 buckets home.",
    mapWidth: 1600,
    mapHeight: 1200,
    flashlightRadius: 380,
    flashlightAngle: Math.PI / 3.0,
    creatureSpeed: 2.7, // Level 1 speed (player matches)
    creatureSightRadius: 260,
    numBuckets: 3,
    fogDensity: 0.92,
    spawnPoint: { x: 800, y: 1040 },
    housePosition: { x: 800, y: 1100 },
    houseSize: { width: 120, height: 90 },
    creatureSpawn: { x: 800, y: 350 },
    creatureSpawns: [
      { x: 800, y: 350 },
    ],
    bucketPositions: [
      { x: 300, y: 320 },
      { x: 1350, y: 400 },
      { x: 780, y: 220 },
    ],
    obstacles: [
      // Left cluster
      createTree('t1', 250, 480),
      createTree('t2', 380, 600),
      createTree('t3', 180, 750),
      createTree('t4', 320, 240),
      createBush('b1', 450, 400),
      createBush('b2', 200, 360),
      createRock('r1', 500, 720),
      // Center
      createWell('well-1', 800, 600),
      createTree('t5', 680, 420),
      createTree('t6', 920, 440),
      createTree('t7', 620, 780),
      createTree('t8', 980, 760),
      createFence('f1', 720, 520, 160, 16),
      // Right cluster
      createTree('t9', 1250, 520),
      createTree('t10', 1400, 680),
      createTree('t11', 1150, 300),
      createTree('t12', 1380, 260),
      createBush('b3', 1100, 580),
      createRock('r2', 1300, 850),
      createBush('b4', 1450, 480),
    ],
  },

  // LEVEL 2: The Haunted Clearing (2 Stalkers)
  {
    levelNumber: 2,
    title: "Stage 2: The Haunted Clearing",
    subtitle: "2 Creatures now roam the clearing! The creatures cannot locate you unless illuminated by your flashlight.",
    mapWidth: 1800,
    mapHeight: 1400,
    flashlightRadius: 350,
    flashlightAngle: Math.PI / 3.3,
    creatureSpeed: 2.9, // gradual increase
    creatureSightRadius: 280,
    numBuckets: 3,
    fogDensity: 0.94,
    spawnPoint: { x: 900, y: 1240 },
    housePosition: { x: 900, y: 1300 },
    houseSize: { width: 124, height: 92 },
    creatureSpawn: { x: 450, y: 320 },
    creatureSpawns: [
      { x: 450, y: 320 },
      { x: 1350, y: 360 },
    ],
    bucketPositions: [
      { x: 260, y: 280 },
      { x: 1540, y: 320 },
      { x: 900, y: 680 },
    ],
    obstacles: [
      createWell('well-2', 900, 550),
      createTree('t2-1', 400, 300),
      createTree('t2-2', 550, 450),
      createTree('t2-3', 300, 600),
      createTree('t2-4', 450, 850),
      createTree('t2-5', 250, 1050),
      createTree('t2-6', 650, 1150),
      createBush('b2-1', 350, 450),
      createBush('b2-2', 600, 750),
      createRock('r2-1', 480, 200),
      // Center maze trees
      createTree('t2-7', 720, 400),
      createTree('t2-8', 1080, 400),
      createTree('t2-9', 750, 880),
      createTree('t2-10', 1050, 880),
      createFence('f2-1', 580, 620, 200, 16),
      createFence('f2-2', 1020, 620, 200, 16),
      // Right side
      createTree('t2-11', 1350, 320),
      createTree('t2-12', 1550, 550),
      createTree('t2-13', 1250, 750),
      createTree('t2-14', 1480, 950),
      createTree('t2-15', 1300, 1150),
      createBush('b2-3', 1400, 420),
      createRock('r2-2', 1600, 780),
    ],
  },

  // LEVEL 3: The Ancient Ruins & Graveyard (3 Stalkers)
  {
    levelNumber: 3,
    title: "Stage 3: The Forgotten Graves",
    subtitle: "3 Creatures patrol the tombs! Keep your flashlight dark when nearby to avoid detection.",
    mapWidth: 2000,
    mapHeight: 1500,
    flashlightRadius: 320,
    flashlightAngle: Math.PI / 3.5,
    creatureSpeed: 3.1,
    creatureSightRadius: 320,
    numBuckets: 3,
    fogDensity: 0.95,
    spawnPoint: { x: 1000, y: 1340 },
    housePosition: { x: 1000, y: 1400 },
    houseSize: { width: 128, height: 96 },
    creatureSpawn: { x: 1000, y: 250 },
    creatureSpawns: [
      { x: 400, y: 350 },
      { x: 1000, y: 250 },
      { x: 1600, y: 350 },
    ],
    bucketPositions: [
      { x: 300, y: 240 },
      { x: 1720, y: 260 },
      { x: 1000, y: 480 },
    ],
    obstacles: [
      createWell('well-3a', 600, 450),
      createWell('well-3b', 1400, 450),
      // Tombstones & Ruins
      createRock('grave-1', 850, 800),
      createRock('grave-2', 950, 800),
      createRock('grave-3', 1050, 800),
      createRock('grave-4', 1150, 800),
      createFence('fence-grave', 800, 750, 400, 16),
      // Thick forest edges
      createTree('t3-1', 250, 400),
      createTree('t3-2', 420, 600),
      createTree('t3-3', 280, 850),
      createTree('t3-4', 500, 1100),
      createTree('t3-5', 300, 1300),
      createTree('t3-6', 750, 1200),
      createTree('t3-7', 1250, 1200),
      createTree('t3-8', 1650, 1280),
      createTree('t3-9', 1700, 850),
      createTree('t3-10', 1500, 600),
      createTree('t3-11', 1750, 420),
      createBush('b3-1', 400, 280),
      createBush('b3-2', 1600, 280),
      createBush('b3-3', 1000, 950),
    ],
  },

  // LEVEL 4: The Black Marsh (4 Stalkers)
  {
    levelNumber: 4,
    title: "Stage 4: The Black Marsh",
    subtitle: "4 Creatures encircle the swamp! Move swiftly between safe shadows to deliver all 3 buckets.",
    mapWidth: 2100,
    mapHeight: 1600,
    flashlightRadius: 300,
    flashlightAngle: Math.PI / 3.7,
    creatureSpeed: 3.3,
    creatureSightRadius: 360,
    numBuckets: 3,
    fogDensity: 0.965,
    spawnPoint: { x: 1050, y: 1440 },
    housePosition: { x: 1050, y: 1500 },
    houseSize: { width: 130, height: 96 },
    creatureSpawn: { x: 1050, y: 250 },
    creatureSpawns: [
      { x: 380, y: 300 },
      { x: 850, y: 250 },
      { x: 1250, y: 250 },
      { x: 1720, y: 300 },
    ],
    bucketPositions: [
      { x: 320, y: 350 },
      { x: 1780, y: 350 },
      { x: 1050, y: 750 },
    ],
    obstacles: [
      createWell('well-4', 1050, 850),
      createTree('t4-1', 350, 200),
      createTree('t4-2', 600, 350),
      createTree('t4-3', 400, 600),
      createTree('t4-4', 650, 850),
      createTree('t4-5', 350, 1100),
      createTree('t4-6', 600, 1350),
      createTree('t4-7', 1500, 350),
      createTree('t4-8', 1750, 200),
      createTree('t4-9', 1700, 600),
      createTree('t4-10', 1450, 850),
      createTree('t4-11', 1750, 1100),
      createTree('t4-12', 1500, 1350),
      createFence('f4-1', 800, 500, 18, 260),
      createFence('f4-2', 1300, 500, 18, 260),
      createBush('b4-1', 850, 1150),
      createBush('b4-2', 1250, 1150),
      createRock('r4-1', 500, 750),
      createRock('r4-2', 1600, 750),
    ],
  },

  // LEVEL 5: The Entity's Lair (5 Stalkers - Multiplying climax!)
  {
    levelNumber: 5,
    title: "Stage 5: The Entity's Heart",
    subtitle: "5 Creatures hunt simultaneously! Master the flashlight stealth and stamina windows to escape!",
    mapWidth: 2200,
    mapHeight: 1700,
    flashlightRadius: 280,
    flashlightAngle: Math.PI / 4.0,
    creatureSpeed: 3.5,
    creatureSightRadius: 400,
    numBuckets: 3,
    fogDensity: 0.98,
    spawnPoint: { x: 1100, y: 1540 },
    housePosition: { x: 1100, y: 1600 },
    houseSize: { width: 136, height: 100 },
    creatureSpawn: { x: 1100, y: 220 },
    creatureSpawns: [
      { x: 350, y: 280 },
      { x: 800, y: 200 },
      { x: 1100, y: 220 },
      { x: 1400, y: 200 },
      { x: 1850, y: 280 },
    ],
    bucketPositions: [
      { x: 350, y: 250 },
      { x: 1850, y: 250 },
      { x: 1100, y: 650 },
    ],
    obstacles: [
      createWell('well-5', 1100, 600),
      // Dense spooky labyrinth
      createTree('t5-1', 300, 450),
      createTree('t5-2', 550, 300),
      createTree('t5-3', 450, 750),
      createTree('t5-4', 700, 600),
      createTree('t5-5', 350, 1100),
      createTree('t5-6', 600, 1000),
      createTree('t5-7', 500, 1400),
      createTree('t5-8', 850, 1350),
      createTree('t5-9', 1900, 450),
      createTree('t5-10', 1650, 300),
      createTree('t5-11', 1750, 750),
      createTree('t5-12', 1500, 600),
      createTree('t5-13', 1850, 1100),
      createTree('t5-14', 1600, 1000),
      createTree('t5-15', 1700, 1400),
      createTree('t5-16', 1350, 1350),
      createFence('f5-1', 950, 900, 300, 20),
      createRock('r5-1', 800, 400),
      createRock('r5-2', 1400, 400),
      createBush('b5-1', 1100, 1150),
      createBush('b5-2', 1100, 350),
    ],
  },
];
