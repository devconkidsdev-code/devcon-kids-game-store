import { LevelConfig, BiomeType, WeatherType, AnimalSpecies } from '../types';

// Helper to generate deterministic random numbers with seed
function seededRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export function generateLevel(levelNum: number): LevelConfig {
  const seed = levelNum * 997 + 1337;
  let s = seed;
  const rand = () => {
    s += 1;
    return seededRandom(s);
  };

  // Map scale scales with level
  const baseSize = 2000;
  const sizeGrowth = Math.min(2500, levelNum * 80);
  const mapWidth = baseSize + sizeGrowth;
  const mapHeight = baseSize + sizeGrowth;

  // Biome determination
  let biome: BiomeType = 'spring_meadow';
  let weather: WeatherType = 'clear';
  let title = `Level ${levelNum}`;
  let subtitle = 'Nourish the Crops';
  let briefing = 'Collect water and safely revive the parched plants.';

  if (levelNum === 1) {
    biome = 'spring_meadow';
    weather = 'clear';
    title = 'The Homestead Brook';
    subtitle = 'First Harvest Revival';
    briefing = 'Welcome, Farmer! Walk to the clear brook to fill your water bucket (Space/Click), then bring it to the dying heirloom crops at the finish line.';
  } else if (levelNum === 2) {
    biome = 'spring_meadow';
    weather = 'golden_hour';
    title = 'Boar Valley';
    subtitle = 'Territorial Wilds';
    briefing = 'Wild boars roam near the river bank. Crouch in tall bushes to stay undetected, or run when they charge!';
  } else if (levelNum <= 5) {
    biome = 'pine_forest';
    weather = levelNum === 4 ? 'misty_dawn' : 'clear';
    title = `Whispering Pines ${levelNum > 3 ? 'Deep' : 'Trail'}`;
    subtitle = 'Timber Wolf Territory';
    briefing = 'Timber wolves have keen eyesight and can smell you if you sprint. Use flares (Q or 1) to scare them away in an emergency.';
  } else if (levelNum <= 9) {
    biome = 'murky_swamp';
    weather = levelNum === 7 ? 'rain_storm' : levelNum === 8 ? 'night' : 'drizzle';
    title = `Murky Bayou ${levelNum - 5}`;
    subtitle = 'Crocodiles & Sinking Mud';
    briefing = 'Mud will slow your movement! Watch out for alligators submerged in swamp waters. Stick to wooden bridges and dry land.';
  } else if (levelNum <= 14) {
    biome = 'rocky_canyon';
    weather = levelNum === 13 ? 'sunset' : levelNum === 14 ? 'night' : 'golden_hour';
    title = `Redrock Canyon ${levelNum - 10}`;
    subtitle = 'Cougars & Rattlesnakes';
    briefing = 'Mountain cougars stalk silently from canyon shadows. Throw stones (F or 2) to distract predators in another direction!';
  } else if (levelNum <= 18) {
    biome = 'savannah_plains';
    weather = levelNum === 18 ? 'sunset' : 'golden_hour';
    title = `Sunburnt Savannah ${levelNum - 14}`;
    subtitle = 'Rhino Stampede';
    briefing = 'Massive wild rhinos guard the central waterholes. If a rhino spots you, sprint laterally to avoid their relentless charge!';
  } else if (levelNum <= 22) {
    biome = 'arid_oasis';
    weather = levelNum === 21 ? 'rain_storm' : 'clear';
    title = `Dune Oasis ${levelNum - 18}`;
    subtitle = 'Scorching Drought';
    briefing = 'Water is scarce and plants are heavily dehydrated. Plan your path between distant springs carefully.';
  } else if (levelNum <= 25) {
    biome = 'alpine_stream';
    weather = levelNum === 25 ? 'misty_dawn' : 'clear';
    title = `Alpine Ridge ${levelNum - 22}`;
    subtitle = 'Grizzly Sanctuary';
    briefing = 'High altitude crystal streams are guarded by alpha grizzlies and wolf packs. Move with extreme stealth.';
  } else if (levelNum < 30) {
    biome = 'ancient_sanctuary';
    weather = levelNum === 28 ? 'rain_storm' : levelNum === 29 ? 'sunset' : 'misty_dawn';
    title = `Forgotten Grove ${levelNum - 25}`;
    subtitle = 'The Ancient Labyrinth';
    briefing = 'Apex predators converge in the sacred grove. Multiple thirsty plant zones must be fully saturated to open the path.';
  } else {
    // Level 30 - Grand Finale
    biome = 'ancient_sanctuary';
    weather = 'golden_hour';
    title = 'The World Tree Awakening';
    subtitle = 'The Grand Finale (Level 30)';
    briefing = 'The legendary Mother Tree is withering! Gather 150 Liters of sacred water across the entire vast sanctuary, dodge the ultimate wild beasts, and restore the eternal green!';
  }

  // Water goal and capacity
  const waterGoal = levelNum === 1 ? 15 : levelNum === 30 ? 150 : Math.floor(20 + levelNum * 3.8);
  const bucketMaxCapacity = levelNum <= 5 ? 15 : levelNum <= 15 ? 25 : levelNum <= 25 ? 35 : 50;

  // Player spawn (typically bottom-left or center-left)
  const spawnX = 250 + rand() * 200;
  const spawnY = mapHeight - 350 - rand() * 200;

  // Finish plant plots (typically top-right or across the map)
  const finishPlots: LevelConfig['finishPlots'] = [];
  const plotCount = levelNum <= 10 ? 1 : levelNum <= 20 ? 2 : levelNum < 30 ? 3 : 4;
  const waterPerPlot = Math.ceil(waterGoal / plotCount);

  for (let i = 0; i < plotCount; i++) {
    const angle = (Math.PI * 0.15) + (i * 0.25);
    const dist = (mapWidth * 0.6) + rand() * (mapWidth * 0.25);
    const px = Math.min(mapWidth - 200, Math.max(200, spawnX + Math.cos(angle) * dist));
    const py = Math.min(mapHeight - 200, Math.max(200, spawnY - Math.sin(angle) * dist));

    const plantSpeciesList: Array<'ancient_oak' | 'heirloom_crops' | 'sacred_lotus' | 'desert_bloom' | 'golden_wheat' | 'revival_tree'> =
      ['heirloom_crops', 'golden_wheat', 'sacred_lotus', 'desert_bloom', 'ancient_oak', 'revival_tree'];
    const plantSpecies = levelNum === 30 ? 'revival_tree' : plantSpeciesList[(levelNum + i) % plantSpeciesList.length];

    finishPlots.push({
      id: `plot_${i}`,
      x: px,
      y: py,
      radius: levelNum === 30 ? 65 : 45,
      name: levelNum === 30 ? 'The Great Mother Tree' : `Parched ${plantSpecies.replace('_', ' ').toUpperCase()}`,
      species: plantSpecies,
      waterNeeded: waterPerPlot,
      waterReceived: 0,
      isFullyHydrated: false,
      bloomProgress: 0,
    });
  }

  // Water sources (distributed between spawn and finish)
  const waterSources: LevelConfig['waterSources'] = [];
  const waterSourceCount = levelNum <= 3 ? 2 : levelNum <= 12 ? 3 : levelNum <= 24 ? 4 : 6;

  for (let i = 0; i < waterSourceCount; i++) {
    const t = (i + 1) / (waterSourceCount + 1);
    const wx = spawnX + (finishPlots[0].x - spawnX) * t + (rand() - 0.5) * (mapWidth * 0.45);
    const wy = spawnY + (finishPlots[0].y - spawnY) * t + (rand() - 0.5) * (mapHeight * 0.45);

    const clampedX = Math.min(mapWidth - 250, Math.max(250, wx));
    const clampedY = Math.min(mapHeight - 250, Math.max(250, wy));

    const sourceTypes: Array<'spring' | 'river' | 'well' | 'oasis' | 'rain_barrel' | 'waterfall_pool'> =
      biome === 'murky_swamp' ? ['river', 'well'] :
      biome === 'arid_oasis' ? ['oasis', 'well'] :
      biome === 'alpine_stream' ? ['waterfall_pool', 'spring'] :
      ['spring', 'river', 'well'];

    const type = sourceTypes[i % sourceTypes.length];

    waterSources.push({
      id: `water_${i}`,
      type,
      x: clampedX,
      y: clampedY,
      radius: type === 'river' || type === 'oasis' ? 70 : 50,
      purity: 1.0 + (i === 0 ? 0.2 : 0),
      maxSupply: 250,
      currentSupply: 250,
      refillRate: 15,
      name: `${type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')} Source #${i + 1}`,
    });
  }

  // Animals based on level progression & biome
  const animals: LevelConfig['animals'] = [];
  const animalCount = Math.min(22, Math.floor(2 + levelNum * 0.65));

  for (let i = 0; i < animalCount; i++) {
    let species: AnimalSpecies = 'wild_boar';

    if (biome === 'spring_meadow') {
      species = rand() > 0.3 ? 'wild_boar' : 'timber_wolf';
    } else if (biome === 'pine_forest') {
      species = rand() > 0.4 ? 'timber_wolf' : rand() > 0.5 ? 'grizzly_bear' : 'wild_boar';
    } else if (biome === 'murky_swamp') {
      species = rand() > 0.4 ? 'marsh_crocodile' : rand() > 0.5 ? 'rattlesnake' : 'wild_boar';
    } else if (biome === 'rocky_canyon') {
      species = rand() > 0.4 ? 'mountain_cougar' : rand() > 0.5 ? 'rattlesnake' : 'timber_wolf';
    } else if (biome === 'savannah_plains') {
      species = rand() > 0.4 ? 'wild_rhino' : rand() > 0.5 ? 'timber_wolf' : 'mountain_cougar';
    } else if (biome === 'arid_oasis') {
      species = rand() > 0.4 ? 'mountain_cougar' : rand() > 0.5 ? 'rattlesnake' : 'wild_rhino';
    } else if (biome === 'alpine_stream') {
      species = rand() > 0.4 ? 'grizzly_bear' : rand() > 0.5 ? 'timber_wolf' : 'mountain_cougar';
    } else {
      // Ancient Sanctuary
      const all: AnimalSpecies[] = ['timber_wolf', 'grizzly_bear', 'mountain_cougar', 'marsh_crocodile', 'wild_rhino'];
      species = all[Math.floor(rand() * all.length)];
    }

    // Position animals along paths or near water
    const nearWater = rand() > 0.5 && waterSources.length > 0;
    const refPoint = nearWater
      ? waterSources[Math.floor(rand() * waterSources.length)]
      : finishPlots[Math.floor(rand() * finishPlots.length)];

    const angle = rand() * Math.PI * 2;
    const dist = 220 + rand() * 450;
    let ax = refPoint.x + Math.cos(angle) * dist;
    let ay = refPoint.y + Math.sin(angle) * dist;

    ax = Math.min(mapWidth - 150, Math.max(150, ax));
    ay = Math.min(mapHeight - 150, Math.max(150, ay));

    // Avoid spawning directly on player
    const distToPlayer = Math.hypot(ax - spawnX, ay - spawnY);
    if (distToPlayer < 350) {
      ax += 350;
      ay -= 350;
    }

    // Animal stats
    let speed = 2.2;
    let chaseSpeed = 3.8;
    let damage = 20;
    let visionRange = 260;
    let visionAngle = Math.PI * 0.45;
    let size = 26;
    let color = '#8b5a2b';
    let name = 'Wild Boar';

    if (species === 'timber_wolf') {
      speed = 2.6;
      chaseSpeed = 4.4;
      damage = 25;
      visionRange = 320;
      visionAngle = Math.PI * 0.55;
      size = 28;
      color = '#718096';
      name = 'Timber Wolf';
    } else if (species === 'grizzly_bear') {
      speed = 1.8;
      chaseSpeed = 3.9;
      damage = 45;
      visionRange = 240;
      visionAngle = Math.PI * 0.4;
      size = 38;
      color = '#4a2e18';
      name = 'Grizzly Bear';
    } else if (species === 'marsh_crocodile') {
      speed = 1.4;
      chaseSpeed = 4.6; // explosive ambush
      damage = 35;
      visionRange = 220;
      visionAngle = Math.PI * 0.5;
      size = 34;
      color = '#2d4a22';
      name = 'Marsh Crocodile';
    } else if (species === 'mountain_cougar') {
      speed = 2.8;
      chaseSpeed = 4.8;
      damage = 30;
      visionRange = 340;
      visionAngle = Math.PI * 0.5;
      size = 26;
      color = '#c68a4c';
      name = 'Mountain Cougar';
    } else if (species === 'rattlesnake') {
      speed = 1.2;
      chaseSpeed = 2.8;
      damage = 18;
      visionRange = 160;
      visionAngle = Math.PI * 0.35;
      size = 18;
      color = '#8d783d';
      name = 'Rattlesnake';
    } else if (species === 'wild_rhino') {
      speed = 1.9;
      chaseSpeed = 4.5;
      damage = 50;
      visionRange = 280;
      visionAngle = Math.PI * 0.35;
      size = 42;
      color = '#5a5a5a';
      name = 'Wild Rhino';
    }

    animals.push({
      species,
      x: ax,
      y: ay,
      originX: ax,
      originY: ay,
      patrolRadius: 180 + rand() * 160,
      speed,
      chaseSpeed,
      visionRange,
      visionAngle,
      facingAngle: rand() * Math.PI * 2,
      damage,
      attackRange: size + 20,
      attackCooldown: 1.2,
      size,
      color,
      name,
    });
  }

  // Terrain obstacles (trees, rocks, dense bushes for stealth, mud patches)
  const obstacles: LevelConfig['obstacles'] = [];
  const obstacleCount = Math.floor(40 + levelNum * 3.5);

  for (let i = 0; i < obstacleCount; i++) {
    const ox = 150 + rand() * (mapWidth - 300);
    const oy = 150 + rand() * (mapHeight - 300);

    // Keep clear of player spawn and finish plots
    if (Math.hypot(ox - spawnX, oy - spawnY) < 180) continue;
    let tooCloseToFinish = false;
    for (const plot of finishPlots) {
      if (Math.hypot(ox - plot.x, oy - plot.y) < 140) {
        tooCloseToFinish = true;
        break;
      }
    }
    if (tooCloseToFinish) continue;

    const roll = rand();
    if (roll < 0.35) {
      // Dense stealth bush
      obstacles.push({
        x: ox,
        y: oy,
        radius: 35 + rand() * 25,
        type: 'dense_bush',
        providesStealth: true,
        blocksVision: false,
      });
    } else if (roll < 0.65) {
      // Tree
      obstacles.push({
        x: ox,
        y: oy,
        radius: 30 + rand() * 20,
        type: 'tree',
        blocksVision: true,
      });
    } else if (roll < 0.85) {
      // Rock cluster
      obstacles.push({
        x: ox,
        y: oy,
        radius: 25 + rand() * 25,
        type: 'rock_cluster',
        blocksVision: true,
      });
    } else {
      // Mud patch
      obstacles.push({
        x: ox,
        y: oy,
        radius: 50 + rand() * 40,
        type: 'mud_patch',
        slowFactor: 0.55,
      });
    }
  }

  // Items provided based on level
  const flaresProvided = Math.max(2, Math.min(8, Math.floor(1 + levelNum * 0.25)));
  const stonesProvided = Math.max(3, Math.min(12, Math.floor(2 + levelNum * 0.35)));
  const parTimeSeconds = Math.floor(70 + levelNum * 6.5);

  return {
    levelNumber: levelNum,
    title,
    subtitle,
    biome,
    weather,
    mapWidth,
    mapHeight,
    waterGoal,
    bucketMaxCapacity,
    spawnX,
    spawnY,
    animals,
    waterSources,
    finishPlots,
    obstacles,
    flaresProvided,
    stonesProvided,
    parTimeSeconds,
    briefing,
  };
}

export const TOTAL_LEVELS = 30;
