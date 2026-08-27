import { LevelConfig, Tile, Trap, PowerUp, SpookyEyes, OverheadLight, Chaser, ChaserType, Obstacle, ObstacleType } from '../types';

export interface GeneratedMaze {
  tiles: Tile[][];
  cols: number;
  rows: number;
  tileSize: number;
  startX: number;
  startY: number;
  exitX: number;
  exitY: number;
  crops: { x: number; y: number; id: string; watered: boolean; waterLevel: number }[];
  wells: { x: number; y: number; id: string; depleted: boolean }[];
  traps: Trap[];
  powerups: PowerUp[];
  chasers: Chaser[];
  obstacles: Obstacle[];
  spookyEyes: SpookyEyes[];
  overheadLights: OverheadLight[];
}

export function generateMaze(config: LevelConfig, tileSize: number = 64): GeneratedMaze {
  // Ensure odd dimensions for proper wall-corridor grid
  let cols = config.cols % 2 === 0 ? config.cols + 1 : config.cols;
  let rows = config.rows % 2 === 0 ? config.rows + 1 : config.rows;

  // Initialize all as WALL
  const grid: number[][] = Array.from({ length: rows }, () => Array(cols).fill(1)); // 1 = WALL, 0 = FLOOR

  // Recursive Backtracker maze generation
  const stack: [number, number][] = [];
  const startC = 1;
  const startR = 1;
  grid[startR][startC] = 0;
  stack.push([startC, startR]);

  const directions = [
    [0, -2], // Up
    [2, 0],  // Right
    [0, 2],  // Down
    [-2, 0]  // Left
  ];

  while (stack.length > 0) {
    const [curC, curR] = stack[stack.length - 1];
    const neighbors: [number, number, number, number][] = [];

    // Shuffle directions for randomness
    const shuffledDirs = [...directions].sort(() => Math.random() - 0.5);

    for (const [dc, dr] of shuffledDirs) {
      const nc = curC + dc;
      const nr = curR + dr;
      if (nc > 0 && nc < cols - 1 && nr > 0 && nr < rows - 1 && grid[nr][nc] === 1) {
        neighbors.push([nc, nr, curC + dc / 2, curR + dr / 2]);
      }
    }

    if (neighbors.length > 0) {
      const [nc, nr, midC, midR] = neighbors[Math.floor(Math.random() * neighbors.length)];
      grid[midR][midC] = 0;
      grid[nr][nc] = 0;
      stack.push([nc, nr]);
    } else {
      stack.pop();
    }
  }

  // Braid the maze slightly (remove ~12% of walls to create loops & tactical shortcuts)
  for (let r = 2; r < rows - 2; r += 2) {
    for (let c = 2; c < cols - 2; c += 2) {
      if (grid[r][c] === 1 && Math.random() < 0.14) {
        // Only remove if it connects two corridors
        const horizontal = grid[r][c - 1] === 0 && grid[r][c + 1] === 0;
        const vertical = grid[r - 1][c] === 0 && grid[r + 1][c] === 0;
        if (horizontal || vertical) {
          grid[r][c] = 0;
        }
      }
    }
  }

  // Find all floor tiles and dead-ends
  const floorTiles: [number, number][] = [];
  const deadEnds: [number, number][] = [];

  for (let r = 1; r < rows - 1; r++) {
    for (let c = 1; c < cols - 1; c++) {
      if (grid[r][c] === 0) {
        floorTiles.push([c, r]);
        // Count surrounding walls
        let wallCount = 0;
        if (grid[r - 1][c] === 1) wallCount++;
        if (grid[r + 1][c] === 1) wallCount++;
        if (grid[r][c - 1] === 1) wallCount++;
        if (grid[r][c + 1] === 1) wallCount++;

        if (wallCount >= 3 && !(c === 1 && r === 1)) {
          deadEnds.push([c, r]);
        }
      }
    }
  }

  // Determine Exit point (furthest or far corner dead end)
  let exitC = cols - 2;
  let exitR = rows - 2;
  while (grid[exitR][exitC] === 1 && exitC > 1) {
    exitC--;
    if (grid[exitR][exitC] === 1) exitR--;
  }

  // Place Start and Exit
  const startX = (1 + 0.5) * tileSize;
  const startY = (1 + 0.5) * tileSize;
  const exitX = (exitC + 0.5) * tileSize;
  const exitY = (exitR + 0.5) * tileSize;

  // Build Tile structure
  const tiles: Tile[][] = [];
  for (let r = 0; r < rows; r++) {
    const rowTiles: Tile[] = [];
    for (let c = 0; c < cols; c++) {
      const isWall = grid[r][c] === 1;
      let type: Tile['type'] = isWall ? 'WALL' : 'FLOOR';
      if (c === 1 && r === 1) type = 'START';
      else if (c === exitC && r === exitR) type = 'EXIT';

      rowTiles.push({
        x: c,
        y: r,
        type,
        wallVariant: Math.floor(Math.random() * 4),
        watered: false,
        waterLevel: 0
      });
    }
    tiles.push(rowTiles);
  }

  // Scatter Thirsty Crops (at least config.cropsToWater, prioritized in dead-ends or corridors)
  const crops: GeneratedMaze['crops'] = [];
  const shuffledDeadEnds = [...deadEnds].sort(() => Math.random() - 0.5);
  const shuffledFloors = [...floorTiles].filter(([c, r]) => !(c === 1 && r === 1) && !(c === exitC && r === exitR)).sort(() => Math.random() - 0.5);

  const numCrops = Math.max(1, config.cropsToWater);
  for (let i = 0; i < numCrops; i++) {
    const spot = shuffledDeadEnds.pop() || shuffledFloors.pop();
    if (spot) {
      const [c, r] = spot;
      tiles[r][c].type = 'CROP';
      crops.push({
        x: (c + 0.5) * tileSize,
        y: (r + 0.5) * tileSize,
        id: `crop-${i}-${c}-${r}`,
        watered: false,
        waterLevel: 0
      });
    }
  }

  // Scatter 1-2 Water Wells for emergency refills if maze is large
  const wells: GeneratedMaze['wells'] = [];
  const numWells = config.cols >= 15 ? 2 : 1;
  for (let i = 0; i < numWells; i++) {
    const spot = shuffledFloors.pop();
    if (spot) {
      const [c, r] = spot;
      tiles[r][c].type = 'WATER_WELL';
      wells.push({
        x: (c + 0.5) * tileSize,
        y: (r + 0.5) * tileSize,
        id: `well-${i}-${c}-${r}`,
        depleted: false
      });
    }
  }

  // Scatter Traps
  const traps: Trap[] = [];
  const trapTypes: Trap['type'][] = ['SPIKES', 'STEAM_VENT', 'SLIME_PUDDLE', 'CARDBOARD_FLAP'];
  const trapCount = config.trapsCount;
  for (let i = 0; i < trapCount; i++) {
    const spot = shuffledFloors.pop();
    if (spot) {
      const [c, r] = spot;
      const tType = trapTypes[Math.floor(Math.random() * trapTypes.length)];
      traps.push({
        id: `trap-${i}`,
        x: (c + 0.5) * tileSize,
        y: (r + 0.5) * tileSize,
        type: tType,
        active: true,
        timer: Math.random() * 2,
        period: 2.2 + Math.random() * 1.5,
        radius: tileSize * 0.38,
        triggered: false
      });
    }
  }

  // Scatter Power-up Boxes (including Heart Life Boosters)
  const powerups: PowerUp[] = [];
  const pTypes: PowerUp['type'][] = ['SPONGE', 'CLOCK', 'NIGHT_VISION', 'TURBO_SODA', 'BUCKET_LID', 'HEART'];
  const powerCount = config.powerUpsCount;
  for (let i = 0; i < powerCount; i++) {
    const spot = shuffledDeadEnds.pop() || shuffledFloors.pop();
    if (spot) {
      const [c, r] = spot;
      // 25% chance of heart if powerups > 2
      const chosenType = (i === 0 && config.levelNumber >= 1) ? 'HEART' : pTypes[Math.floor(Math.random() * pTypes.length)];
      powerups.push({
        id: `powerup-${i}`,
        x: (c + 0.5) * tileSize,
        y: (r + 0.5) * tileSize,
        type: chosenType,
        bobOffset: Math.random() * Math.PI * 2,
        collected: false,
        sparkleTimer: 0
      });
    }
  }

  // Scatter Fun Chasers (Greedy Guzzlers, Speedy Sprinters, and Golden Bandits)
  const chasers: Chaser[] = [];
  const chaserCount = config.chasersCount !== undefined ? config.chasersCount : (config.levelNumber >= 1 ? 1 : 0);
  
  // Find floor spots away from start position (distance > 3.5 tiles)
  const validChaserSpots = [...floorTiles].filter(([c, r]) => {
    const distFromStart = Math.hypot(c - 1, r - 1);
    return distFromStart >= 4;
  }).sort(() => Math.random() - 0.5);

  for (let i = 0; i < chaserCount; i++) {
    const spot = validChaserSpots.pop();
    if (spot) {
      const [c, r] = spot;
      let cType: ChaserType = 'GREEDY_GUZZLER';
      let speed = 3.3 + Math.random() * 0.4;
      let isCarryingBonus = false;

      // Varied chaser types per level
      if (i === 1 && (config.levelNumber >= 2 || config.cols >= 13)) {
        cType = 'SPEEDY_SPRINTER';
        speed = 4.2 + Math.random() * 0.5;
      } else if (i === 2 && (config.levelNumber >= 3 || Math.random() < 0.4)) {
        cType = 'GOLDEN_BANDIT';
        speed = 3.8;
        isCarryingBonus = true;
      } else if (i >= 3) {
        cType = i % 2 === 0 ? 'SPEEDY_SPRINTER' : 'GREEDY_GUZZLER';
        speed = 3.5 + Math.random() * 0.6;
      }

      chasers.push({
        id: `chaser-${i}-${cType}`,
        x: (c + 0.5) * tileSize,
        y: (r + 0.5) * tileSize,
        vx: 0,
        vy: 0,
        radius: tileSize * 0.32,
        speed,
        type: cType,
        state: 'PATROL',
        stunTimer: 0,
        patrolTimer: 1 + Math.random() * 2,
        animTimer: Math.random() * 5,
        facingAngle: Math.random() * Math.PI * 2,
        alertTimer: 0,
        targetX: (c + 0.5) * tileSize,
        targetY: (r + 0.5) * tileSize,
        isCarryingBonus,
        tauntTimer: 0
      });
    }
  }

  // Scatter Spooky Blinking Eyes in dark dead ends
  const spookyEyes: SpookyEyes[] = [];
  const eyeColors = ['#ff3366', '#ffcc00', '#33ff88', '#9933ff', '#00e5ff'];
  const remainingDeadEnds = shuffledDeadEnds.slice(0, 6);
  remainingDeadEnds.forEach((spot, idx) => {
    const [c, r] = spot;
    spookyEyes.push({
      id: `eyes-${idx}`,
      x: (c + 0.5) * tileSize,
      y: (r + 0.5) * tileSize,
      blinkTimer: 1.5 + Math.random() * 3,
      isBlinking: false,
      isScared: false,
      alpha: 1,
      color: eyeColors[idx % eyeColors.length]
    });
  });

  // Generate Dynamic Obstacles (Rolling Barrels, Spinning Saws, Electric Laser Gates, Spiked Crushers)
  const obstacles: Obstacle[] = [];
  const obstacleCount = config.obstaclesCount !== undefined ? config.obstaclesCount : (config.levelNumber >= 1 ? 2 : 0);

  // Find straight hallway segments for rolling barrels and electric gates
  const horizontalSegments: { r: number; startC: number; endC: number }[] = [];
  const verticalSegments: { c: number; startR: number; endR: number }[] = [];

  // Detect horizontal hallways of length >= 3
  for (let r = 1; r < rows - 1; r++) {
    let startC = -1;
    for (let c = 1; c < cols - 1; c++) {
      if (grid[r][c] === 0) {
        if (startC === -1) startC = c;
      } else {
        if (startC !== -1 && (c - startC) >= 3) {
          horizontalSegments.push({ r, startC, endC: c - 1 });
        }
        startC = -1;
      }
    }
    if (startC !== -1 && (cols - 1 - startC) >= 3) {
      horizontalSegments.push({ r, startC, endC: cols - 2 });
    }
  }

  // Detect vertical hallways of length >= 3
  for (let c = 1; c < cols - 1; c++) {
    let startR = -1;
    for (let r = 1; r < rows - 1; r++) {
      if (grid[r][c] === 0) {
        if (startR === -1) startR = r;
      } else {
        if (startR !== -1 && (r - startR) >= 3) {
          verticalSegments.push({ c, startR, endR: r - 1 });
        }
        startR = -1;
      }
    }
    if (startR !== -1 && (rows - 1 - startR) >= 3) {
      verticalSegments.push({ c, startR, endR: rows - 2 });
    }
  }

  const allSegments = [
    ...horizontalSegments.map(s => ({ ...s, axis: 'HORIZONTAL' as const })),
    ...verticalSegments.map(s => ({ ...s, axis: 'VERTICAL' as const }))
  ].filter(s => {
    // Keep distance from start tile
    if (s.axis === 'HORIZONTAL') {
      return !(s.r === 1 && s.startC <= 2);
    } else {
      return !(s.c === 1 && s.startR <= 2);
    }
  }).sort(() => Math.random() - 0.5);

  const obstacleTypes: ObstacleType[] = ['BEACH_BALL', 'PINWHEEL', 'BUBBLE_VENT', 'JELLY_BOUNCER'];

  for (let i = 0; i < obstacleCount; i++) {
    const seg = allSegments.pop();
    const oType: ObstacleType = obstacleTypes[i % obstacleTypes.length];
    
    if (seg) {
      if (seg.axis === 'HORIZONTAL') {
        const startX = (seg.startC + 0.5) * tileSize;
        const targetX = (seg.endC + 0.5) * tileSize;
        const y = (seg.r + 0.5) * tileSize;
        // Gentle, predictable speed for kids
        const speed = 1.3 + Math.random() * 0.4;

        obstacles.push({
          id: `obstacle-${i}-${oType}`,
          type: oType === 'BUBBLE_VENT' ? 'BUBBLE_VENT' : oType === 'PINWHEEL' ? 'PINWHEEL' : 'BEACH_BALL',
          x: startX,
          y: y,
          startX,
          startY: y,
          targetX,
          targetY: y,
          vx: speed,
          vy: 0,
          radius: tileSize * 0.32,
          speed,
          rotation: 0,
          rotSpeed: 3.5,
          active: true,
          timer: Math.random() * 2,
          period: 2.2 + Math.random() * 1.2,
          direction: 1,
          axis: 'HORIZONTAL',
          length: tileSize * 0.85
        });
      } else {
        const x = (seg.c + 0.5) * tileSize;
        const startY = (seg.startR + 0.5) * tileSize;
        const targetY = (seg.endR + 0.5) * tileSize;
        const speed = 1.3 + Math.random() * 0.4;

        obstacles.push({
          id: `obstacle-${i}-${oType}`,
          type: oType === 'BUBBLE_VENT' ? 'BUBBLE_VENT' : oType === 'JELLY_BOUNCER' ? 'JELLY_BOUNCER' : 'BEACH_BALL',
          x: x,
          y: startY,
          startX: x,
          startY,
          targetX: x,
          targetY,
          vx: 0,
          vy: speed,
          radius: tileSize * 0.32,
          speed,
          rotation: 0,
          rotSpeed: 3.5,
          active: true,
          timer: Math.random() * 2,
          period: 2.2 + Math.random() * 1.2,
          direction: 1,
          axis: 'VERTICAL',
          length: tileSize * 0.85
        });
      }
    } else {
      // Fallback: place a cute stationary pinwheel or bubble vent at a random floor tile
      const spot = shuffledFloors.pop();
      if (spot) {
        const [c, r] = spot;
        obstacles.push({
          id: `obstacle-${i}-stationary`,
          type: i % 2 === 0 ? 'PINWHEEL' : 'BUBBLE_VENT',
          x: (c + 0.5) * tileSize,
          y: (r + 0.5) * tileSize,
          startX: (c + 0.5) * tileSize,
          startY: (r + 0.5) * tileSize,
          targetX: (c + 0.5) * tileSize,
          targetY: (r + 0.5) * tileSize,
          vx: 0,
          vy: 0,
          radius: tileSize * 0.32,
          speed: 0,
          rotation: 0,
          rotSpeed: 3.0,
          active: true,
          timer: Math.random() * 2,
          period: 2.5,
          direction: 1,
          axis: 'STATIONARY_SPIN',
          length: tileSize * 0.85
        });
      }
    }
  }

  // Overhead Industrial Flickering Lights at notable intersections
  const overheadLights: OverheadLight[] = [];
  const lightColors = ['rgba(255, 220, 160, 0.45)', 'rgba(200, 240, 255, 0.35)', 'rgba(255, 180, 120, 0.4)'];
  for (let r = 3; r < rows - 3; r += 4) {
    for (let c = 3; c < cols - 3; c += 4) {
      if (grid[r][c] === 0 && Math.random() < 0.7) {
        overheadLights.push({
          x: (c + 0.5) * tileSize,
          y: (r + 0.5) * tileSize,
          radius: tileSize * 2.8,
          color: lightColors[Math.floor(Math.random() * lightColors.length)],
          flickerOffset: Math.random() * 10,
          intensity: 0.8 + Math.random() * 0.2
        });
      }
    }
  }

  return {
    tiles,
    cols,
    rows,
    tileSize,
    startX,
    startY,
    exitX,
    exitY,
    crops,
    wells,
    traps,
    powerups,
    chasers,
    obstacles,
    spookyEyes,
    overheadLights
  };
}
