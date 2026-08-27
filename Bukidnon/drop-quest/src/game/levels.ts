import { LevelConfig } from '../types';

export const LEVELS: LevelConfig[] = [
  // =========================================================================
  // LEVEL 1: GREEN MEADOWS (Tutorial & Gentle Start)
  // Designed to be very simple and welcoming:
  // - 100% continuous solid ground with NO pits or fatal falls
  // - Very few, harmless obstacles (2 decorative trees and 1 small rock)
  // - Only 1 slow, easily squashed weed with huge jump room
  // - Zero aggressive sunflowers
  // - 1 early [?] Mystery Question Block so players discover the Super Water Gun
  // - 15 easily collected water drops in smooth gentle arcs
  // =========================================================================
  {
    id: 1,
    name: 'Level 1: Green Meadows',
    subtitle: 'A gentle start! Collect 15 water drops to revive the thirsty meadow.',
    width: 2200,
    height: 600,
    groundY: 480,
    targetDropsCount: 15,
    timeLimit: 75,
    cropGoalX: 2050,
    theme: {
      skyTop: '#60a5fa',
      skyBottom: '#dbeafe',
      groundColor: '#b47b42',
      groundGrassColor: '#65a30d',
      mountainColor: '#86efac',
      cloudColor: '#ffffff',
      sunColor: '#fde047',
    },
    // Continuous solid ground with ZERO pits
    groundSegments: [
      { x: 0, width: 2200, height: 120 },
    ],
    // Low, wide, friendly platforms
    platforms: [
      { id: 'p1-1', x: 260, y: 390, width: 150, height: 20, type: 'wood' },
      { id: 'p1-2', x: 480, y: 330, width: 160, height: 20, type: 'hay' },
      { id: 'p1-3', x: 720, y: 390, width: 140, height: 20, type: 'wood' },
      { id: 'p1-4', x: 960, y: 340, width: 150, height: 20, type: 'hay' },
      { id: 'p1-5', x: 1200, y: 380, width: 140, height: 20, type: 'wood' },
      { id: 'p1-6', x: 1420, y: 320, width: 160, height: 20, type: 'wood' },
      { id: 'p1-7', x: 1680, y: 380, width: 150, height: 20, type: 'hay' },
    ],
    // Very few, non-damaging obstacles with wide open spaces
    obstacles: [
      { id: 'obs1-1', x: 380, y: 430, width: 45, height: 50, type: 'rock', solid: true },
      { id: 'obs1-2', x: 880, y: 380, width: 60, height: 100, type: 'tree', solid: false },
      { id: 'obs1-3', x: 1560, y: 380, width: 65, height: 100, type: 'tree', solid: false },
    ],
    // Only 1 gentle, slow weed
    weeds: [
      { id: 'w1-1', x: 1020, y: 442, width: 34, height: 38, patrolMinX: 920, patrolMaxX: 1350, speed: 45, vx: 45, facing: 'right', type: 'spiky_weed' },
    ],
    // No sunflowers in Level 1 for relaxed early play
    sunflowers: [],
    // 1 Question Block for players to try the Super Water Gun
    questionBlocks: [
      { id: 'qb1-1', x: 540, y: 250, width: 36, height: 36, hit: false, bumpOffset: 0, bumpVy: 0, hasItem: true, itemType: 'water_gun' },
    ],
    drops: [
      { id: 'd1-1', x: 140, y: 435, width: 24, height: 32, value: 6.67 },
      { id: 'd1-2', x: 220, y: 435, width: 24, height: 32, value: 6.67 },
      { id: 'd1-3', x: 330, y: 345, width: 24, height: 32, value: 6.67 },
      { id: 'd1-4', x: 560, y: 285, width: 24, height: 32, value: 6.67 },
      { id: 'd1-5', x: 680, y: 435, width: 24, height: 32, value: 6.67 },
      { id: 'd1-6', x: 790, y: 345, width: 24, height: 32, value: 6.67 },
      { id: 'd1-7', x: 920, y: 435, width: 24, height: 32, value: 6.67 },
      { id: 'd1-8', x: 1030, y: 295, width: 24, height: 32, value: 6.67 },
      { id: 'd1-9', x: 1180, y: 435, width: 24, height: 32, value: 6.67 },
      { id: 'd1-10', x: 1270, y: 335, width: 24, height: 32, value: 6.67 },
      { id: 'd1-11', x: 1500, y: 275, width: 24, height: 32, value: 6.67, isGolden: true },
      { id: 'd1-12', x: 1620, y: 435, width: 24, height: 32, value: 6.67 },
      { id: 'd1-13', x: 1750, y: 335, width: 24, height: 32, value: 6.67 },
      { id: 'd1-14', x: 1880, y: 435, width: 24, height: 32, value: 6.67 },
      { id: 'd1-15', x: 2000, y: 410, width: 24, height: 32, value: 6.67 },
    ],
  },

  // =========================================================================
  // LEVEL 2: SUNNY ORCHARDS & HAYFIELDS
  // Introduces:
  // - 1 small pit with an easy wooden platform crossing
  // - 2 slow weed enemies
  // - 1 high sunflower with very slow reload time (3.8s)
  // - 2 Question Blocks with Water Guns
  // - 20 water drops
  // =========================================================================
  {
    id: 2,
    name: 'Level 2: Sunny Orchards',
    subtitle: 'Collect 20 water drops across the orchard and watch your step over the ditch!',
    width: 2800,
    height: 600,
    groundY: 480,
    targetDropsCount: 20,
    timeLimit: 65,
    cropGoalX: 2650,
    theme: {
      skyTop: '#38bdf8',
      skyBottom: '#bae6fd',
      groundColor: '#b8824a',
      groundGrassColor: '#7ba646',
      mountainColor: '#a8c6a5',
      cloudColor: '#ffffff',
      sunColor: '#facc15',
    },
    groundSegments: [
      { x: 0, width: 1100, height: 120 },
      // 1 gentle pit: 1100 to 1250 (150px gap)
      { x: 1250, width: 1550, height: 120, hasPitBefore: true },
    ],
    platforms: [
      { id: 'p2-1', x: 260, y: 390, width: 140, height: 20, type: 'wood' },
      { id: 'p2-2', x: 460, y: 320, width: 150, height: 20, type: 'hay' },
      { id: 'p2-3', x: 680, y: 390, width: 130, height: 20, type: 'wood' },
      { id: 'p2-4', x: 900, y: 330, width: 140, height: 20, type: 'hay' },
      // Bridging platform across pit
      { id: 'p2-5', x: 1120, y: 370, width: 120, height: 20, type: 'wood' },
      { id: 'p2-6', x: 1360, y: 390, width: 140, height: 20, type: 'hay' },
      { id: 'p2-7', x: 1580, y: 310, width: 150, height: 20, type: 'wood' },
      { id: 'p2-8', x: 1820, y: 240, width: 130, height: 20, type: 'wood' },
      { id: 'p2-9', x: 2080, y: 390, width: 140, height: 20, type: 'hay' },
      { id: 'p2-10', x: 2320, y: 320, width: 150, height: 20, type: 'wood' },
    ],
    obstacles: [
      { id: 'obs2-1', x: 380, y: 430, width: 45, height: 50, type: 'rock', solid: true },
      { id: 'obs2-2', x: 600, y: 380, width: 60, height: 100, type: 'tree', solid: false },
      { id: 'obs2-3', x: 1480, y: 410, width: 50, height: 70, type: 'wall', solid: true },
      { id: 'obs2-4', x: 1980, y: 380, width: 65, height: 100, type: 'tree', solid: false },
      { id: 'obs2-5', x: 2480, y: 430, width: 45, height: 50, type: 'rock', solid: true },
    ],
    weeds: [
      { id: 'w2-1', x: 440, y: 442, width: 34, height: 38, patrolMinX: 300, patrolMaxX: 850, speed: 60, vx: -60, facing: 'left', type: 'spiky_weed' },
      { id: 'w2-2', x: 1680, y: 442, width: 34, height: 38, patrolMinX: 1450, patrolMaxX: 2050, speed: 65, vx: 65, facing: 'right', type: 'spiky_weed' },
    ],
    sunflowers: [
      // 1 high sunflower with gentle 3.6s fire cooldown
      { id: 'sf2-1', x: 1870, y: 192, width: 36, height: 48, facing: 'left', fireInterval: 3.6, range: 450 },
    ],
    questionBlocks: [
      { id: 'qb2-1', x: 520, y: 240, width: 36, height: 36, hit: false, bumpOffset: 0, bumpVy: 0, hasItem: true, itemType: 'water_gun' },
      { id: 'qb2-2', x: 1640, y: 230, width: 36, height: 36, hit: false, bumpOffset: 0, bumpVy: 0, hasItem: true, itemType: 'water_gun' },
    ],
    drops: [
      { id: 'd2-1', x: 140, y: 435, width: 24, height: 32, value: 5 },
      { id: 'd2-2', x: 230, y: 435, width: 24, height: 32, value: 5 },
      { id: 'd2-3', x: 330, y: 345, width: 24, height: 32, value: 5 },
      { id: 'd2-4', x: 530, y: 275, width: 24, height: 32, value: 5 },
      { id: 'd2-5', x: 740, y: 345, width: 24, height: 32, value: 5 },
      { id: 'd2-6', x: 860, y: 435, width: 24, height: 32, value: 5 },
      { id: 'd2-7', x: 970, y: 285, width: 24, height: 32, value: 5 },
      { id: 'd2-8', x: 1170, y: 325, width: 24, height: 32, value: 5 },
      { id: 'd2-9', x: 1300, y: 435, width: 24, height: 32, value: 5 },
      { id: 'd2-10', x: 1430, y: 345, width: 24, height: 32, value: 5 },
      { id: 'd2-11', x: 1650, y: 265, width: 24, height: 32, value: 5 },
      { id: 'd2-12', x: 1890, y: 195, width: 24, height: 32, value: 5, isGolden: true },
      { id: 'd2-13', x: 1920, y: 435, width: 24, height: 32, value: 5 },
      { id: 'd2-14', x: 2040, y: 435, width: 24, height: 32, value: 5 },
      { id: 'd2-15', x: 2150, y: 345, width: 24, height: 32, value: 5 },
      { id: 'd2-16', x: 2280, y: 435, width: 24, height: 32, value: 5 },
      { id: 'd2-17', x: 2390, y: 275, width: 24, height: 32, value: 5, isGolden: true },
      { id: 'd2-18', x: 2480, y: 435, width: 24, height: 32, value: 5 },
      { id: 'd2-19', x: 2560, y: 435, width: 24, height: 32, value: 5 },
      { id: 'd2-20', x: 2640, y: 410, width: 24, height: 32, value: 5 },
    ],
  },

  // =========================================================================
  // LEVEL 3: DUSTY VALLEYS & WINDMILLS
  // Introduces:
  // - 2 chasms with a moving platform
  // - Spiky cactus hazard patches
  // - 3 patrolling weeds (spiky & bramble)
  // - 2 active sunflowers
  // - 25 water drops
  // =========================================================================
  {
    id: 3,
    name: 'Level 3: Dusty Valleys',
    subtitle: 'Hop across moving platforms, dodge thorny cacti, and collect 25 water drops!',
    width: 3400,
    height: 600,
    groundY: 480,
    targetDropsCount: 25,
    timeLimit: 60,
    cropGoalX: 3250,
    theme: {
      skyTop: '#5a9fe0',
      skyBottom: '#fde0b2',
      groundColor: '#aa7138',
      groundGrassColor: '#8a9b3e',
      mountainColor: '#c49e7b',
      cloudColor: '#fff9ed',
      sunColor: '#ffaa3b',
    },
    groundSegments: [
      { x: 0, width: 850, height: 120 },
      // Pit 1: 850 to 1020 (170px gap)
      { x: 1020, width: 900, height: 120, hasPitBefore: true },
      // Pit 2: 1920 to 2090 (170px gap)
      { x: 2090, width: 1310, height: 120, hasPitBefore: true },
    ],
    platforms: [
      { id: 'p3-1', x: 250, y: 390, width: 130, height: 20, type: 'wood' },
      { id: 'p3-2', x: 450, y: 300, width: 140, height: 20, type: 'hay' },
      { id: 'p3-3', x: 650, y: 220, width: 120, height: 20, type: 'wood' },
      // Moving platform across pit 1
      {
        id: 'p3-4',
        x: 870,
        y: 370,
        width: 120,
        height: 20,
        type: 'moving',
        moveRange: { minX: 860, maxX: 1000, speed: 65, direction: 1 },
      },
      { id: 'p3-5', x: 1120, y: 380, width: 130, height: 20, type: 'wood' },
      { id: 'p3-6', x: 1320, y: 290, width: 150, height: 20, type: 'stone' },
      { id: 'p3-7', x: 1540, y: 210, width: 130, height: 20, type: 'wood' },
      { id: 'p3-8', x: 1750, y: 300, width: 120, height: 20, type: 'cloud' },
      // Moving platform across pit 2
      {
        id: 'p3-9',
        x: 1940,
        y: 370,
        width: 120,
        height: 20,
        type: 'moving',
        moveRange: { minX: 1930, maxX: 2070, speed: 70, direction: 1 },
      },
      { id: 'p3-10', x: 2200, y: 380, width: 130, height: 20, type: 'hay' },
      { id: 'p3-11', x: 2420, y: 300, width: 140, height: 20, type: 'wood' },
      { id: 'p3-12', x: 2640, y: 220, width: 130, height: 20, type: 'stone' },
      { id: 'p3-13', x: 2880, y: 320, width: 140, height: 20, type: 'hay' },
      { id: 'p3-14', x: 3080, y: 240, width: 120, height: 20, type: 'wood' },
    ],
    obstacles: [
      { id: 'obs3-1', x: 350, y: 420, width: 40, height: 60, type: 'cactus', solid: false, damageOnTouch: true },
      { id: 'obs3-2', x: 550, y: 400, width: 50, height: 80, type: 'wall', solid: true },
      { id: 'obs3-3', x: 1240, y: 380, width: 65, height: 100, type: 'tree', solid: false },
      { id: 'obs3-4', x: 1450, y: 420, width: 40, height: 60, type: 'cactus', solid: false, damageOnTouch: true },
      { id: 'obs3-5', x: 1680, y: 400, width: 55, height: 80, type: 'wall', solid: true },
      { id: 'obs3-6', x: 2320, y: 420, width: 40, height: 60, type: 'cactus', solid: false, damageOnTouch: true },
      { id: 'obs3-7', x: 2540, y: 380, width: 65, height: 100, type: 'tree', solid: false },
      { id: 'obs3-8', x: 2780, y: 400, width: 55, height: 80, type: 'wall', solid: true },
      { id: 'obs3-9', x: 3000, y: 420, width: 40, height: 60, type: 'cactus', solid: false, damageOnTouch: true },
    ],
    weeds: [
      { id: 'w3-1', x: 220, y: 442, width: 34, height: 38, patrolMinX: 100, patrolMaxX: 520, speed: 70, vx: 70, facing: 'right', type: 'spiky_weed' },
      { id: 'w3-2', x: 1160, y: 442, width: 34, height: 38, patrolMinX: 1040, patrolMaxX: 1420, speed: 75, vx: -75, facing: 'left', type: 'bramble_weed' },
      { id: 'w3-3', x: 2240, y: 442, width: 34, height: 38, patrolMinX: 2120, patrolMaxX: 2520, speed: 80, vx: 80, facing: 'right', type: 'bramble_weed' },
    ],
    sunflowers: [
      { id: 'sf3-1', x: 680, y: 172, width: 36, height: 48, facing: 'left', fireInterval: 2.8, range: 460 },
      { id: 'sf3-2', x: 1580, y: 162, width: 36, height: 48, facing: 'left', fireInterval: 2.6, range: 480 },
    ],
    questionBlocks: [
      { id: 'qb3-1', x: 480, y: 220, width: 36, height: 36, hit: false, bumpOffset: 0, bumpVy: 0, hasItem: true, itemType: 'water_gun' },
      { id: 'qb3-2', x: 1380, y: 210, width: 36, height: 36, hit: false, bumpOffset: 0, bumpVy: 0, hasItem: true, itemType: 'water_gun' },
      { id: 'qb3-3', x: 2480, y: 220, width: 36, height: 36, hit: false, bumpOffset: 0, bumpVy: 0, hasItem: true, itemType: 'water_gun' },
    ],
    drops: [
      { id: 'd3-1', x: 140, y: 435, width: 24, height: 32, value: 4 },
      { id: 'd3-2', x: 300, y: 345, width: 24, height: 32, value: 4 },
      { id: 'd3-3', x: 510, y: 255, width: 24, height: 32, value: 4 },
      { id: 'd3-4', x: 710, y: 175, width: 24, height: 32, value: 4, isGolden: true },
      { id: 'd3-5', x: 890, y: 325, width: 24, height: 32, value: 4 },
      { id: 'd3-6', x: 1040, y: 435, width: 24, height: 32, value: 4 },
      { id: 'd3-7', x: 1180, y: 335, width: 24, height: 32, value: 4 },
      { id: 'd3-8', x: 1380, y: 245, width: 24, height: 32, value: 4 },
      { id: 'd3-9', x: 1600, y: 165, width: 24, height: 32, value: 4 },
      { id: 'd3-10', x: 1800, y: 255, width: 24, height: 32, value: 4 },
      { id: 'd3-11', x: 1980, y: 325, width: 24, height: 32, value: 4 },
      { id: 'd3-12', x: 2120, y: 435, width: 24, height: 32, value: 4 },
      { id: 'd3-13', x: 2260, y: 335, width: 24, height: 32, value: 4 },
      { id: 'd3-14', x: 2480, y: 255, width: 24, height: 32, value: 4 },
      { id: 'd3-15', x: 2700, y: 175, width: 24, height: 32, value: 4, isGolden: true },
      { id: 'd3-16', x: 2820, y: 435, width: 24, height: 32, value: 4 },
      { id: 'd3-17', x: 2940, y: 275, width: 24, height: 32, value: 4 },
      { id: 'd3-18', x: 3120, y: 195, width: 24, height: 32, value: 4 },
      { id: 'd3-19', x: 3120, y: 435, width: 24, height: 32, value: 4 },
      { id: 'd3-20', x: 420, y: 435, width: 24, height: 32, value: 4 },
      { id: 'd3-21', x: 780, y: 435, width: 24, height: 32, value: 4 },
      { id: 'd3-22', x: 1500, y: 435, width: 24, height: 32, value: 4 },
      { id: 'd3-23', x: 1860, y: 435, width: 24, height: 32, value: 4 },
      { id: 'd3-24', x: 2600, y: 435, width: 24, height: 32, value: 4 },
      { id: 'd3-25', x: 3240, y: 410, width: 24, height: 32, value: 4 },
    ],
  },

  // =========================================================================
  // LEVEL 4: SUNSCORCHED CANYON & RUINS
  // Introduces:
  // - 3 deep canyon chasms with fast moving platforms & cloud bridges
  // - 4 agile weeds and 3 seed-spitting sunflowers (2.1s reload)
  // - Rich puzzle platforming across ancient stone pillars
  // - 28 water drops
  // =========================================================================
  {
    id: 4,
    name: 'Level 4: Sunscorched Canyon',
    subtitle: 'Leap across deep chasms, dodge rapid sunflower seeds, and gather 28 drops!',
    width: 4000,
    height: 600,
    groundY: 480,
    targetDropsCount: 28,
    timeLimit: 55,
    cropGoalX: 3850,
    theme: {
      skyTop: '#ea580c',
      skyBottom: '#fed7aa',
      groundColor: '#964b28',
      groundGrassColor: '#b08a38',
      mountainColor: '#b86043',
      cloudColor: '#ffe4cf',
      sunColor: '#f97316',
    },
    groundSegments: [
      { x: 0, width: 750, height: 120 },
      // Pit 1: 750 to 940 (190px gap)
      { x: 940, width: 800, height: 120, hasPitBefore: true },
      // Pit 2: 1740 to 1930 (190px gap)
      { x: 1930, width: 850, height: 120, hasPitBefore: true },
      // Pit 3: 2780 to 2980 (200px gap)
      { x: 2980, width: 1020, height: 120, hasPitBefore: true },
    ],
    platforms: [
      { id: 'p4-1', x: 220, y: 390, width: 130, height: 20, type: 'wood' },
      { id: 'p4-2', x: 420, y: 300, width: 130, height: 20, type: 'stone' },
      { id: 'p4-3', x: 600, y: 210, width: 110, height: 20, type: 'cloud' },
      // Moving platform 1 over pit 1
      {
        id: 'p4-4',
        x: 780,
        y: 350,
        width: 110,
        height: 20,
        type: 'moving',
        moveRange: { minX: 760, maxX: 910, speed: 85, direction: 1 },
      },
      { id: 'p4-5', x: 1020, y: 380, width: 130, height: 20, type: 'hay' },
      { id: 'p4-6', x: 1240, y: 290, width: 140, height: 20, type: 'wood' },
      { id: 'p4-7', x: 1460, y: 200, width: 130, height: 20, type: 'stone' },
      { id: 'p4-8', x: 1640, y: 290, width: 110, height: 20, type: 'cloud' },
      // Moving platform 2 over pit 2
      {
        id: 'p4-9',
        x: 1780,
        y: 360,
        width: 110,
        height: 20,
        type: 'moving',
        moveRange: { minX: 1750, maxX: 1900, speed: 90, direction: 1 },
      },
      { id: 'p4-10', x: 2020, y: 380, width: 130, height: 20, type: 'hay' },
      { id: 'p4-11', x: 2240, y: 280, width: 140, height: 20, type: 'wood' },
      { id: 'p4-12', x: 2460, y: 190, width: 130, height: 20, type: 'stone' },
      { id: 'p4-13', x: 2660, y: 280, width: 110, height: 20, type: 'cloud' },
      // Cloud hop over pit 3
      { id: 'p4-14', x: 2820, y: 350, width: 100, height: 20, type: 'cloud' },
      { id: 'p4-15', x: 3080, y: 380, width: 130, height: 20, type: 'wood' },
      { id: 'p4-16', x: 3300, y: 290, width: 140, height: 20, type: 'hay' },
      { id: 'p4-17', x: 3520, y: 200, width: 130, height: 20, type: 'stone' },
      { id: 'p4-18', x: 3700, y: 280, width: 120, height: 20, type: 'cloud' },
    ],
    obstacles: [
      { id: 'obs4-1', x: 300, y: 420, width: 40, height: 60, type: 'cactus', solid: false, damageOnTouch: true },
      { id: 'obs4-2', x: 500, y: 400, width: 55, height: 80, type: 'wall', solid: true },
      { id: 'obs4-3', x: 1140, y: 420, width: 40, height: 60, type: 'cactus', solid: false, damageOnTouch: true },
      { id: 'obs4-4', x: 1360, y: 380, width: 65, height: 100, type: 'tree', solid: false },
      { id: 'obs4-5', x: 1560, y: 400, width: 55, height: 80, type: 'wall', solid: true },
      { id: 'obs4-6', x: 2140, y: 420, width: 40, height: 60, type: 'cactus', solid: false, damageOnTouch: true },
      { id: 'obs4-7', x: 2360, y: 380, width: 65, height: 100, type: 'tree', solid: false },
      { id: 'obs4-8', x: 2580, y: 400, width: 55, height: 80, type: 'wall', solid: true },
      { id: 'obs4-9', x: 3200, y: 420, width: 40, height: 60, type: 'cactus', solid: false, damageOnTouch: true },
      { id: 'obs4-10', x: 3420, y: 400, width: 55, height: 80, type: 'wall', solid: true },
      { id: 'obs4-11', x: 3620, y: 420, width: 40, height: 60, type: 'cactus', solid: false, damageOnTouch: true },
    ],
    weeds: [
      { id: 'w4-1', x: 220, y: 442, width: 34, height: 38, patrolMinX: 100, patrolMaxX: 460, speed: 85, vx: 85, facing: 'right', type: 'spiky_weed' },
      { id: 'w4-2', x: 1080, y: 442, width: 34, height: 38, patrolMinX: 960, patrolMaxX: 1320, speed: 90, vx: -90, facing: 'left', type: 'bramble_weed' },
      { id: 'w4-3', x: 2060, y: 442, width: 34, height: 38, patrolMinX: 1950, patrolMaxX: 2320, speed: 95, vx: 95, facing: 'right', type: 'spiky_weed' },
      { id: 'w4-4', x: 3120, y: 442, width: 34, height: 38, patrolMinX: 3000, patrolMaxX: 3400, speed: 100, vx: -100, facing: 'left', type: 'bramble_weed' },
    ],
    sunflowers: [
      { id: 'sf4-1', x: 470, y: 252, width: 36, height: 48, facing: 'left', fireInterval: 2.2, range: 480 },
      { id: 'sf4-2', x: 1510, y: 152, width: 36, height: 48, facing: 'left', fireInterval: 2.1, range: 500 },
      { id: 'sf4-3', x: 2510, y: 142, width: 36, height: 48, facing: 'left', fireInterval: 2.0, range: 500 },
    ],
    questionBlocks: [
      { id: 'qb4-1', x: 420, y: 220, width: 36, height: 36, hit: false, bumpOffset: 0, bumpVy: 0, hasItem: true, itemType: 'water_gun' },
      { id: 'qb4-2', x: 1340, y: 210, width: 36, height: 36, hit: false, bumpOffset: 0, bumpVy: 0, hasItem: true, itemType: 'water_gun' },
      { id: 'qb4-3', x: 2340, y: 200, width: 36, height: 36, hit: false, bumpOffset: 0, bumpVy: 0, hasItem: true, itemType: 'water_gun' },
      { id: 'qb4-4', x: 3400, y: 210, width: 36, height: 36, hit: false, bumpOffset: 0, bumpVy: 0, hasItem: true, itemType: 'water_gun' },
    ],
    drops: [
      { id: 'd4-1', x: 130, y: 435, width: 24, height: 32, value: 3.57 },
      { id: 'd4-2', x: 270, y: 345, width: 24, height: 32, value: 3.57 },
      { id: 'd4-3', x: 470, y: 255, width: 24, height: 32, value: 3.57 },
      { id: 'd4-4', x: 650, y: 165, width: 24, height: 32, value: 3.57, isGolden: true },
      { id: 'd4-5', x: 830, y: 300, width: 24, height: 32, value: 3.57 },
      { id: 'd4-6', x: 980, y: 435, width: 24, height: 32, value: 3.57 },
      { id: 'd4-7', x: 1080, y: 335, width: 24, height: 32, value: 3.57 },
      { id: 'd4-8', x: 1300, y: 245, width: 24, height: 32, value: 3.57 },
      { id: 'd4-9', x: 1520, y: 155, width: 24, height: 32, value: 3.57, isGolden: true },
      { id: 'd4-10', x: 1700, y: 245, width: 24, height: 32, value: 3.57 },
      { id: 'd4-11', x: 1830, y: 310, width: 24, height: 32, value: 3.57 },
      { id: 'd4-12', x: 1980, y: 435, width: 24, height: 32, value: 3.57 },
      { id: 'd4-13', x: 2080, y: 335, width: 24, height: 32, value: 3.57 },
      { id: 'd4-14', x: 2300, y: 235, width: 24, height: 32, value: 3.57 },
      { id: 'd4-15', x: 2520, y: 145, width: 24, height: 32, value: 3.57, isGolden: true },
      { id: 'd4-16', x: 2710, y: 235, width: 24, height: 32, value: 3.57 },
      { id: 'd4-17', x: 2870, y: 300, width: 24, height: 32, value: 3.57 },
      { id: 'd4-18', x: 3020, y: 435, width: 24, height: 32, value: 3.57 },
      { id: 'd4-19', x: 3140, y: 335, width: 24, height: 32, value: 3.57 },
      { id: 'd4-20', x: 3360, y: 245, width: 24, height: 32, value: 3.57 },
      { id: 'd4-21', x: 3580, y: 155, width: 24, height: 32, value: 3.57 },
      { id: 'd4-22', x: 3750, y: 235, width: 24, height: 32, value: 3.57 },
      { id: 'd4-23', x: 380, y: 435, width: 24, height: 32, value: 3.57 },
      { id: 'd4-24', x: 1420, y: 435, width: 24, height: 32, value: 3.57 },
      { id: 'd4-25', x: 2420, y: 435, width: 24, height: 32, value: 3.57 },
      { id: 'd4-26', x: 3500, y: 435, width: 24, height: 32, value: 3.57 },
      { id: 'd4-27', x: 3740, y: 435, width: 24, height: 32, value: 3.57 },
      { id: 'd4-28', x: 3840, y: 410, width: 24, height: 32, value: 3.57 },
    ],
  },

  // =========================================================================
  // LEVEL 5: THE SCORCHED OASIS SUMMIT (Grand Finale)
  // The ultimate master trial:
  // - 4 deep chasms across twilight ancient pillars and sky bridges
  // - 5 fierce weeds and 4 rapid seed-spitting sunflowers (1.8s reload)
  // - Dual synchronized moving lifts and high cloud jumps
  // - 4 Question Blocks with Super Water Guns
  // - 32 sparkling drops including 4 Golden Dewdrops
  // =========================================================================
  {
    id: 5,
    name: 'Level 5: Oasis Summit',
    subtitle: 'The grand finale! Brave towering ruins and rapid fire to bring rain to the summit oasis!',
    width: 4600,
    height: 600,
    groundY: 480,
    targetDropsCount: 32,
    timeLimit: 55,
    cropGoalX: 4450,
    theme: {
      skyTop: '#6d28d9',
      skyBottom: '#f97316',
      groundColor: '#78350f',
      groundGrassColor: '#d97706',
      mountainColor: '#831843',
      cloudColor: '#fce7f3',
      sunColor: '#fbbf24',
    },
    groundSegments: [
      { x: 0, width: 650, height: 120 },
      // Pit 1: 650 to 860 (210px gap)
      { x: 860, width: 720, height: 120, hasPitBefore: true },
      // Pit 2: 1580 to 1800 (220px gap)
      { x: 1800, width: 750, height: 120, hasPitBefore: true },
      // Pit 3: 2550 to 2780 (230px gap)
      { x: 2780, width: 720, height: 120, hasPitBefore: true },
      // Pit 4: 3500 to 3740 (240px gap)
      { x: 3740, width: 860, height: 120, hasPitBefore: true },
    ],
    platforms: [
      { id: 'p5-1', x: 200, y: 390, width: 120, height: 20, type: 'wood' },
      { id: 'p5-2', x: 380, y: 300, width: 130, height: 20, type: 'stone' },
      { id: 'p5-3', x: 540, y: 210, width: 100, height: 20, type: 'cloud' },
      // Moving lift over pit 1
      {
        id: 'p5-4',
        x: 700,
        y: 350,
        width: 110,
        height: 20,
        type: 'moving',
        moveRange: { minX: 680, maxX: 830, speed: 90, direction: 1 },
      },
      { id: 'p5-5', x: 920, y: 380, width: 120, height: 20, type: 'hay' },
      { id: 'p5-6', x: 1120, y: 290, width: 140, height: 20, type: 'wood' },
      { id: 'p5-7', x: 1320, y: 200, width: 130, height: 20, type: 'stone' },
      { id: 'p5-8', x: 1500, y: 290, width: 110, height: 20, type: 'cloud' },
      // Moving lift over pit 2
      {
        id: 'p5-9',
        x: 1650,
        y: 360,
        width: 110,
        height: 20,
        type: 'moving',
        moveRange: { minX: 1620, maxX: 1770, speed: 95, direction: 1 },
      },
      { id: 'p5-10', x: 1880, y: 380, width: 120, height: 20, type: 'hay' },
      { id: 'p5-11', x: 2080, y: 280, width: 130, height: 20, type: 'wood' },
      { id: 'p5-12', x: 2280, y: 190, width: 140, height: 20, type: 'stone' },
      { id: 'p5-13', x: 2470, y: 280, width: 100, height: 20, type: 'cloud' },
      // Cloud step over pit 3
      { id: 'p5-14', x: 2620, y: 340, width: 110, height: 20, type: 'cloud' },
      { id: 'p5-15', x: 2860, y: 380, width: 120, height: 20, type: 'wood' },
      { id: 'p5-16', x: 3060, y: 290, width: 130, height: 20, type: 'hay' },
      { id: 'p5-17', x: 3260, y: 200, width: 140, height: 20, type: 'stone' },
      { id: 'p5-18', x: 3440, y: 290, width: 100, height: 20, type: 'cloud' },
      // Moving lift over pit 4
      {
        id: 'p5-19',
        x: 3580,
        y: 360,
        width: 110,
        height: 20,
        type: 'moving',
        moveRange: { minX: 3540, maxX: 3700, speed: 100, direction: 1 },
      },
      { id: 'p5-20', x: 3820, y: 380, width: 130, height: 20, type: 'wood' },
      { id: 'p5-21', x: 4040, y: 290, width: 140, height: 20, type: 'hay' },
      { id: 'p5-22', x: 4260, y: 200, width: 130, height: 20, type: 'stone' },
    ],
    obstacles: [
      { id: 'obs5-1', x: 300, y: 420, width: 40, height: 60, type: 'cactus', solid: false, damageOnTouch: true },
      { id: 'obs5-2', x: 480, y: 400, width: 55, height: 80, type: 'wall', solid: true },
      { id: 'obs5-3', x: 1040, y: 420, width: 40, height: 60, type: 'cactus', solid: false, damageOnTouch: true },
      { id: 'obs5-4', x: 1240, y: 380, width: 65, height: 100, type: 'tree', solid: false },
      { id: 'obs5-5', x: 1440, y: 400, width: 55, height: 80, type: 'wall', solid: true },
      { id: 'obs5-6', x: 1980, y: 420, width: 40, height: 60, type: 'cactus', solid: false, damageOnTouch: true },
      { id: 'obs5-7', x: 2180, y: 380, width: 65, height: 100, type: 'tree', solid: false },
      { id: 'obs5-8', x: 2380, y: 400, width: 55, height: 80, type: 'wall', solid: true },
      { id: 'obs5-9', x: 2940, y: 420, width: 40, height: 60, type: 'cactus', solid: false, damageOnTouch: true },
      { id: 'obs5-10', x: 3140, y: 400, width: 55, height: 80, type: 'wall', solid: true },
      { id: 'obs5-11', x: 3900, y: 420, width: 40, height: 60, type: 'cactus', solid: false, damageOnTouch: true },
      { id: 'obs5-12', x: 4120, y: 380, width: 65, height: 100, type: 'tree', solid: false },
      { id: 'obs5-13', x: 4320, y: 400, width: 55, height: 80, type: 'wall', solid: true },
    ],
    weeds: [
      { id: 'w5-1', x: 220, y: 442, width: 34, height: 38, patrolMinX: 100, patrolMaxX: 470, speed: 90, vx: 90, facing: 'right', type: 'spiky_weed' },
      { id: 'w5-2', x: 1000, y: 442, width: 34, height: 38, patrolMinX: 880, patrolMaxX: 1350, speed: 100, vx: -100, facing: 'left', type: 'bramble_weed' },
      { id: 'w5-3', x: 1950, y: 442, width: 34, height: 38, patrolMinX: 1820, patrolMaxX: 2300, speed: 105, vx: 105, facing: 'right', type: 'spiky_weed' },
      { id: 'w5-4', x: 2900, y: 442, width: 34, height: 38, patrolMinX: 2800, patrolMaxX: 3260, speed: 110, vx: -110, facing: 'left', type: 'bramble_weed' },
      { id: 'w5-5', x: 3880, y: 442, width: 34, height: 38, patrolMinX: 3760, patrolMaxX: 4220, speed: 115, vx: 115, facing: 'right', type: 'spiky_weed' },
    ],
    sunflowers: [
      { id: 'sf5-1', x: 420, y: 252, width: 36, height: 48, facing: 'left', fireInterval: 1.9, range: 500 },
      { id: 'sf5-2', x: 1360, y: 152, width: 36, height: 48, facing: 'left', fireInterval: 1.8, range: 520 },
      { id: 'sf5-3', x: 2320, y: 142, width: 36, height: 48, facing: 'left', fireInterval: 1.8, range: 520 },
      { id: 'sf5-4', x: 3300, y: 152, width: 36, height: 48, facing: 'left', fireInterval: 1.7, range: 530 },
    ],
    questionBlocks: [
      { id: 'qb5-1', x: 380, y: 220, width: 36, height: 36, hit: false, bumpOffset: 0, bumpVy: 0, hasItem: true, itemType: 'water_gun' },
      { id: 'qb5-2', x: 1220, y: 210, width: 36, height: 36, hit: false, bumpOffset: 0, bumpVy: 0, hasItem: true, itemType: 'water_gun' },
      { id: 'qb5-3', x: 2180, y: 200, width: 36, height: 36, hit: false, bumpOffset: 0, bumpVy: 0, hasItem: true, itemType: 'water_gun' },
      { id: 'qb5-4', x: 3160, y: 210, width: 36, height: 36, hit: false, bumpOffset: 0, bumpVy: 0, hasItem: true, itemType: 'water_gun' },
    ],
    drops: [
      { id: 'd5-1', x: 120, y: 435, width: 24, height: 32, value: 3.125 },
      { id: 'd5-2', x: 250, y: 345, width: 24, height: 32, value: 3.125 },
      { id: 'd5-3', x: 430, y: 255, width: 24, height: 32, value: 3.125 },
      { id: 'd5-4', x: 590, y: 165, width: 24, height: 32, value: 3.125, isGolden: true },
      { id: 'd5-5', x: 750, y: 300, width: 24, height: 32, value: 3.125 },
      { id: 'd5-6', x: 900, y: 435, width: 24, height: 32, value: 3.125 },
      { id: 'd5-7', x: 990, y: 335, width: 24, height: 32, value: 3.125 },
      { id: 'd5-8', x: 1180, y: 245, width: 24, height: 32, value: 3.125 },
      { id: 'd5-9', x: 1380, y: 155, width: 24, height: 32, value: 3.125, isGolden: true },
      { id: 'd5-10', x: 1550, y: 245, width: 24, height: 32, value: 3.125 },
      { id: 'd5-11', x: 1710, y: 310, width: 24, height: 32, value: 3.125 },
      { id: 'd5-12', x: 1860, y: 435, width: 24, height: 32, value: 3.125 },
      { id: 'd5-13', x: 1950, y: 335, width: 24, height: 32, value: 3.125 },
      { id: 'd5-14', x: 2150, y: 235, width: 24, height: 32, value: 3.125 },
      { id: 'd5-15', x: 2340, y: 145, width: 24, height: 32, value: 3.125, isGolden: true },
      { id: 'd5-16', x: 2520, y: 235, width: 24, height: 32, value: 3.125 },
      { id: 'd5-17', x: 2680, y: 295, width: 24, height: 32, value: 3.125 },
      { id: 'd5-18', x: 2840, y: 435, width: 24, height: 32, value: 3.125 },
      { id: 'd5-19', x: 2920, y: 335, width: 24, height: 32, value: 3.125 },
      { id: 'd5-20', x: 3120, y: 245, width: 24, height: 32, value: 3.125 },
      { id: 'd5-21', x: 3320, y: 155, width: 24, height: 32, value: 3.125, isGolden: true },
      { id: 'd5-22', x: 3500, y: 245, width: 24, height: 32, value: 3.125 },
      { id: 'd5-23', x: 3640, y: 310, width: 24, height: 32, value: 3.125 },
      { id: 'd5-24', x: 3800, y: 435, width: 24, height: 32, value: 3.125 },
      { id: 'd5-25', x: 3900, y: 335, width: 24, height: 32, value: 3.125 },
      { id: 'd5-26', x: 4100, y: 245, width: 24, height: 32, value: 3.125 },
      { id: 'd5-27', x: 4320, y: 155, width: 24, height: 32, value: 3.125 },
      { id: 'd5-28', x: 360, y: 435, width: 24, height: 32, value: 3.125 },
      { id: 'd5-29', x: 1300, y: 435, width: 24, height: 32, value: 3.125 },
      { id: 'd5-30', x: 2240, y: 435, width: 24, height: 32, value: 3.125 },
      { id: 'd5-31', x: 3200, y: 435, width: 24, height: 32, value: 3.125 },
      { id: 'd5-32', x: 4440, y: 410, width: 24, height: 32, value: 3.125 },
    ],
  },
];
