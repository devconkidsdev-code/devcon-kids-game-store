export type TileType =
  | 'grass'         // Walkable terrain
  | 'wall'          // Rock / Cliff obstacle
  | 'water_deep'    // Deep chasm/river (needs bridge or box to cross)
  | 'water_spring'  // Water fountain source
  | 'canal_empty'   // Dried canal bed
  | 'ice'           // Slippery ice surface
  | 'mud'           // Sticky mud
  | 'gate_red'      // Red toggle gate
  | 'gate_blue'     // Blue toggle gate
  | 'gate_yellow'   // Yellow toggle gate
  | 'plate_red'     // Red pressure switch
  | 'plate_blue'    // Blue pressure switch
  | 'plate_yellow'  // Yellow pressure switch
  | 'portal_a'      // Teleport portal A
  | 'portal_b'      // Teleport portal B
  | 'purifier'      // Water filter tile
  | 'bridge_wood';  // Wooden bridge over water

export type BoxType =
  | 'water'         // Full water container (needed to water plants)
  | 'empty_crate'   // Empty wooden box (can become water box if pushed into spring)
  | 'rock'          // Heavy stone block (for plates or bridging pits)
  | 'ice_block'     // Slippery ice cube (slides until obstacle)
  | 'sponge';       // Absorbs water or triggers special plates

export interface BoxEntity {
  id: string;
  x: number;
  y: number;
  type: BoxType;
  waterAmount?: number; // 1 standard, 2 purified
}

export type PlantType =
  | 'sprout'        // Needs 1 water
  | 'flower'        // Needs 1 water
  | 'lotus'         // Needs 1 or 2 water
  | 'ancient_tree'  // Needs 2 water
  | 'cactus';       // Needs 1 water

export interface PlantEntity {
  id: string;
  x: number;
  y: number;
  type: PlantType;
  requiredWater: number;
  currentWater: number;
  isWatered: boolean;
}

export interface DewdropEntity {
  id: string;
  x: number;
  y: number;
  collected: boolean;
}

export interface LevelDefinition {
  id: number;
  name: string;
  biome: 'meadow' | 'canyon' | 'bamboo' | 'highlands' | 'sanctuary';
  width: number;
  height: number;
  playerStart: { x: number; y: number };
  grid: TileType[][]; // grid[y][x]
  boxes: BoxEntity[];
  plants: PlantEntity[];
  dewdrops?: DewdropEntity[];
  parMoves: number;
  hint?: string;
}

export interface GameState {
  levelId: number;
  player: { x: number; y: number; dir: 'up' | 'down' | 'left' | 'right' };
  grid: TileType[][];
  boxes: BoxEntity[];
  plants: PlantEntity[];
  dewdrops: DewdropEntity[];
  gatesOpen: { red: boolean; blue: boolean; yellow: boolean };
  moveCount: number;
  isWon: boolean;
  history: HistoryState[];
  redoStack: HistoryState[];
}

export interface HistoryState {
  player: { x: number; y: number; dir: 'up' | 'down' | 'left' | 'right' };
  grid: TileType[][];
  boxes: BoxEntity[];
  plants: PlantEntity[];
  dewdrops: DewdropEntity[];
  gatesOpen: { red: boolean; blue: boolean; yellow: boolean };
  moveCount: number;
}

export interface LevelProgress {
  levelId: number;
  completed: boolean;
  stars: number; // 1-3
  bestMoves: number;
  unlocked: boolean;
}
