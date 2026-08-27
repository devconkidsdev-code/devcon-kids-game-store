import { CellType, Direction, Item, LevelConfig, Position, Snake } from '../types';

export interface GeneratedMaze {
  grid: CellType[][];
  width: number;
  height: number;
  playerStart: Position;
  tankPosition: Position;
  items: Item[];
  snakes: Snake[];
}

export function generateLevelMaze(config: LevelConfig): GeneratedMaze {
  // Grid dimensions must be odd for proper maze generation
  const width = config.gridWidth % 2 === 0 ? config.gridWidth + 1 : config.gridWidth;
  const height = config.gridHeight % 2 === 0 ? config.gridHeight + 1 : config.gridHeight;

  // Initialize entire grid with WALL
  const grid: CellType[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => 'WALL' as CellType)
  );

  // Depth-first search recursive backtracker to carve initial paths
  const visited: boolean[][] = Array.from({ length: height }, () =>
    Array.from({ length: width }, () => false)
  );

  function carvePassage(cx: number, cy: number) {
    visited[cy][cx] = true;
    grid[cy][cx] = 'PATH';

    // Directions: UP, RIGHT, DOWN, LEFT
    const dirs: [number, number][] = [
      [0, -2],
      [2, 0],
      [0, 2],
      [-2, 0],
    ];

    // Shuffle directions
    for (let i = dirs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
    }

    for (const [dx, dy] of dirs) {
      const nx = cx + dx;
      const ny = cy + dy;

      if (nx > 0 && nx < width - 1 && ny > 0 && ny < height - 1 && !visited[ny][nx]) {
        // Carve wall between
        grid[cy + dy / 2][cx + dx / 2] = 'PATH';
        carvePassage(nx, ny);
      }
    }
  }

  // Start carving from (1, 1)
  carvePassage(1, 1);

  // ENLARGE & OPEN PATHWAYS: Create abundant connecting passages, crossroads, and loops!
  // 1. Remove 35% of interior walls that sit between two path cells to create open loops and eliminate bottlenecks
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (grid[y][x] === 'WALL') {
        const horiz = grid[y][x - 1] === 'PATH' && grid[y][x + 1] === 'PATH';
        const vert = grid[y - 1][x] === 'PATH' && grid[y + 1][x] === 'PATH';
        if (horiz || vert) {
          // Open 40% of such partition walls
          if (Math.random() < 0.42) {
            grid[y][x] = 'PATH';
          }
        }
      }
    }
  }

  // 2. Create open courtyards / mini-plazas (2x2 or 3x3 open areas) so player and snakes have open rooms to maneuver
  const courtyardCount = Math.floor((width * height) / 80) + 2;
  for (let i = 0; i < courtyardCount; i++) {
    const rx = 2 + Math.floor(Math.random() * (width - 5));
    const ry = 2 + Math.floor(Math.random() * (height - 5));
    for (let dy = 0; dy < 2; dy++) {
      for (let dx = 0; dx < 2; dx++) {
        if (ry + dy > 0 && ry + dy < height - 1 && rx + dx > 0 && rx + dx < width - 1) {
          grid[ry + dy][rx + dx] = 'PATH';
        }
      }
    }
  }

  // 3. Clear open space around Player Start and build the secure OUTSIDE EXIT for the Community Tank
  // Matching the photo structure: Entrance opening at top-left perimeter, Exit opening at bottom-right perimeter
  const playerStart: Position = { x: 0, y: 1 };
  const tankPosition: Position = { x: width - 1, y: height - 2 };

  // Ensure the outer border of the maze is 100% SECURE with thick solid walls all around...
  for (let x = 0; x < width; x++) {
    grid[0][x] = 'WALL';
    grid[height - 1][x] = 'WALL';
  }
  for (let y = 0; y < height; y++) {
    grid[y][0] = 'WALL';
    grid[y][width - 1] = 'WALL';
  }

  // 1. OPENING AT ENTRANCE (Water Hero Starts Outside the Maze Entrance)
  grid[1][0] = 'PATH'; // Outside Start Gate
  grid[1][1] = 'PATH'; // First step inside maze
  grid[1][2] = 'PATH';
  grid[2][1] = 'PATH';

  // 2. OPENING AT EXIT (Community Tank Sits Outside the Maze Exit)
  grid[height - 2][width - 1] = 'PATH'; // Outside Exit Gate to Community Village
  grid[height - 2][width - 2] = 'PATH'; // Path inside leading to the exit
  grid[height - 2][width - 3] = 'PATH';
  grid[height - 3][width - 2] = 'PATH';

  // Find all open path cells excluding start and tank neighborhoods
  const openCells: Position[] = [];
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (grid[y][x] === 'PATH') {
        const isNearStart = Math.abs(x - playerStart.x) <= 1 && Math.abs(y - playerStart.y) <= 1;
        const isNearTank = Math.abs(x - tankPosition.x) <= 1 && Math.abs(y - tankPosition.y) <= 1;
        if (!isNearStart && !isNearTank) {
          openCells.push({ x, y });
        }
      }
    }
  }

  // Shuffle open cells for random item placement
  for (let i = openCells.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [openCells[i], openCells[j]] = [openCells[j], openCells[i]];
  }

  let cellIndex = 0;
  const items: Item[] = [];

  // Place Community Tank item
  items.push({
    id: `tank-${config.id}`,
    x: tankPosition.x,
    y: tankPosition.y,
    type: 'COMMUNITY_TANK',
    collected: false,
  });

  // Apply Dry Areas if level calls for it
  const dryCount = Math.min(config.dryAreasCount, Math.floor(openCells.length * 0.25));
  for (let i = 0; i < dryCount && cellIndex < openCells.length; i++) {
    const pos = openCells[cellIndex++];
    const distFromStart = Math.abs(pos.x - playerStart.x) + Math.abs(pos.y - playerStart.y);
    if (distFromStart >= 4) {
      grid[pos.y][pos.x] = 'DRY_AREA';
    }
  }

  // Eligible cells for pickable items
  const itemEligibleCells = openCells.slice(cellIndex);

  // Place Clean Water Drops
  const cleanCount = config.cleanDropsCount;
  for (let i = 0; i < cleanCount && i < itemEligibleCells.length; i++) {
    const pos = itemEligibleCells[i];
    items.push({
      id: `clean-${i}`,
      x: pos.x,
      y: pos.y,
      type: 'CLEAN_WATER',
      collected: false,
    });
  }

  // Place Contaminated Water Drops
  const contaminatedCount = config.contaminatedDropsCount;
  const contOffset = cleanCount;
  for (let i = 0; i < contaminatedCount && (contOffset + i) < itemEligibleCells.length; i++) {
    const pos = itemEligibleCells[contOffset + i];
    items.push({
      id: `dirty-${i}`,
      x: pos.x,
      y: pos.y,
      type: 'CONTAMINATED_WATER',
      collected: false,
    });
  }

  // Place Hearts
  const heartsCount = config.heartsCount;
  const heartOffset = cleanCount + contaminatedCount;
  for (let i = 0; i < heartsCount && (heartOffset + i) < itemEligibleCells.length; i++) {
    const pos = itemEligibleCells[heartOffset + i];
    items.push({
      id: `heart-${i}`,
      x: pos.x,
      y: pos.y,
      type: 'HEART',
      collected: false,
    });
  }

  // Spawn Snakes away from player (Manhattan distance >= 5) in open areas
  const snakeEligibleCells = openCells.filter(pos => {
    const distFromStart = Math.abs(pos.x - playerStart.x) + Math.abs(pos.y - playerStart.y);
    return distFromStart >= 5 && grid[pos.y][pos.x] === 'PATH';
  });

  const snakes: Snake[] = [];
  const directions: Direction[] = ['UP', 'DOWN', 'LEFT', 'RIGHT'];
  const snakeCount = Math.min(config.snakesCount, snakeEligibleCells.length);

  for (let i = 0; i < snakeCount; i++) {
    const pos = snakeEligibleCells[i % snakeEligibleCells.length];
    snakes.push({
      id: `snake-${i}`,
      x: pos.x,
      y: pos.y,
      dir: directions[Math.floor(Math.random() * directions.length)],
      animOffset: Math.random() * Math.PI * 2,
      speedMultiplier: 0.9 + Math.random() * 0.25,
      moveCooldown: config.snakeMoveInterval,
      lastMove: Date.now() + Math.random() * 300,
    });
  }

  return {
    grid,
    width,
    height,
    playerStart,
    tankPosition,
    items,
    snakes,
  };
}

