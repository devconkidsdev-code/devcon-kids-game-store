import React, { useState, useEffect, useCallback } from 'react';
import { GameState, LevelDefinition, LevelProgress, HistoryState, BoxEntity, PlantEntity, DewdropEntity, TileType } from './types';
import { LEVELS } from './data/levels';
import { Board } from './components/Board';
import { GameControls } from './components/GameControls';
import { LevelSelect } from './components/LevelSelect';
import { VictoryModal } from './components/VictoryModal';
import { InstructionsModal } from './components/InstructionsModal';
import { LevelEditor } from './components/LevelEditor';
import { HintModal } from './components/HintModal';
import { sound } from './audio/soundEngine';
import { Droplets, Compass, BookOpen, Hammer, Sparkles, RotateCcw, Lightbulb } from 'lucide-react';

const STORAGE_KEY = 'oasis_landscape_puzzle_progress_v1';

export default function App() {
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [activeLevel, setActiveLevel] = useState<LevelDefinition>(LEVELS[0]);
  const [customLevel, setCustomLevel] = useState<LevelDefinition | null>(null);

  // Modals
  const [isLevelSelectOpen, setIsLevelSelectOpen] = useState(false);
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isHintOpen, setIsHintOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Progress tracking in localStorage
  const [progress, setProgress] = useState<Record<number, LevelProgress>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return {
      1: { levelId: 1, completed: false, stars: 0, bestMoves: 0, unlocked: true },
    };
  });

  const saveProgress = (newProgress: Record<number, LevelProgress>) => {
    setProgress(newProgress);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
    } catch {
      // ignore
    }
  };

  // Helper to initialize level state
  const initLevelState = useCallback((lvl: LevelDefinition): GameState => {
    const gridClone = lvl.grid.map(row => [...row]);
    const boxesClone: BoxEntity[] = lvl.boxes.map(b => ({ ...b }));
    const plantsClone: PlantEntity[] = lvl.plants.map(p => ({ ...p }));
    const dewdropsClone: DewdropEntity[] = (lvl.dewdrops || []).map(d => ({ ...d }));

    const redPlate = isEntityOnTileType('plate_red', lvl.playerStart, boxesClone, gridClone);
    const bluePlate = isEntityOnTileType('plate_blue', lvl.playerStart, boxesClone, gridClone);
    const yellowPlate = isEntityOnTileType('plate_yellow', lvl.playerStart, boxesClone, gridClone);

    return {
      levelId: lvl.id,
      player: { x: lvl.playerStart.x, y: lvl.playerStart.y, dir: 'down' },
      grid: gridClone,
      boxes: boxesClone,
      plants: plantsClone,
      dewdrops: dewdropsClone,
      gatesOpen: { red: redPlate, blue: bluePlate, yellow: yellowPlate },
      moveCount: 0,
      isWon: false,
      history: [],
      redoStack: [],
    };
  }, []);

  const [gameState, setGameState] = useState<GameState>(() => initLevelState(LEVELS[0]));

  // Load level by index or definition
  const loadLevel = useCallback((lvl: LevelDefinition) => {
    setActiveLevel(lvl);
    setGameState(initLevelState(lvl));
  }, [initLevelState]);

  const handleSelectLevel = (levelId: number) => {
    const idx = LEVELS.findIndex(l => l.id === levelId);
    if (idx !== -1) {
      setCurrentLevelIndex(idx);
      setCustomLevel(null);
      loadLevel(LEVELS[idx]);
    }
  };

  const handleUnlockAll = () => {
    const unlockedAll: Record<number, LevelProgress> = { ...progress };
    LEVELS.forEach(lvl => {
      unlockedAll[lvl.id] = {
        levelId: lvl.id,
        completed: unlockedAll[lvl.id]?.completed || false,
        stars: unlockedAll[lvl.id]?.stars || 0,
        bestMoves: unlockedAll[lvl.id]?.bestMoves || 0,
        unlocked: true,
      };
    });
    saveProgress(unlockedAll);
  };

  function isEntityOnTileType(
    tileType: TileType,
    player: { x: number; y: number },
    boxes: BoxEntity[],
    grid: TileType[][]
  ): boolean {
    if (grid[player.y] && grid[player.y][player.x] === tileType) return true;
    for (const b of boxes) {
      if (grid[b.y] && grid[b.y][b.x] === tileType) return true;
    }
    return false;
  }

  const findLinkedPortal = (currentTile: TileType, grid: TileType[][]): { x: number; y: number } | null => {
    const targetType = currentTile === 'portal_a' ? 'portal_b' : 'portal_a';
    for (let y = 0; y < grid.length; y++) {
      for (let x = 0; x < grid[y].length; x++) {
        if (grid[y][x] === targetType) {
          return { x, y };
        }
      }
    }
    return null;
  };

  // Movement handler
  const handleMove = useCallback((dx: number, dy: number) => {
    if (gameState.isWon) return;

    setGameState(prevState => {
      const { player, grid, boxes, plants, dewdrops, gatesOpen, moveCount, history } = prevState;
      const width = activeLevel.width;
      const height = activeLevel.height;

      const dir: 'up' | 'down' | 'left' | 'right' =
        dy === -1 ? 'up' : dy === 1 ? 'down' : dx === -1 ? 'left' : 'right';

      const nx = player.x + dx;
      const ny = player.y + dy;

      if (nx < 0 || nx >= width || ny < 0 || ny >= height) {
        return { ...prevState, player: { ...player, dir } };
      }

      const targetTile = grid[ny][nx];

      const isGateClosed =
        (targetTile === 'gate_red' && !gatesOpen.red) ||
        (targetTile === 'gate_blue' && !gatesOpen.blue) ||
        (targetTile === 'gate_yellow' && !gatesOpen.yellow);

      const boxIndex = boxes.findIndex(b => b.x === nx && b.y === ny);

      const historySnapshot: HistoryState = {
        player: { ...player },
        grid: grid.map(row => [...row]),
        boxes: boxes.map(b => ({ ...b })),
        plants: plants.map(p => ({ ...p })),
        dewdrops: dewdrops.map(d => ({ ...d })),
        gatesOpen: { ...gatesOpen },
        moveCount,
      };

      if (boxIndex !== -1) {
        const pushedBox = boxes[boxIndex];
        let nnx = nx + dx;
        let nny = ny + dy;

        const plantIndex = plants.findIndex(p => p.x === nnx && p.y === nny && !p.isWatered);
        if (plantIndex !== -1 && pushedBox.type === 'water') {
          sound.playPush();
          sound.playWaterSplash();
          sound.playBloom();

          const updatedPlants = plants.map((p, idx) => {
            if (idx === plantIndex) {
              const newWater = p.currentWater + 1;
              const isWatered = newWater >= p.requiredWater;
              return { ...p, currentWater: newWater, isWatered };
            }
            return p;
          });

          const updatedBoxes = boxes.filter((_, idx) => idx !== boxIndex);
          const updatedPlayer = { x: nx, y: ny, dir };

          const updatedDewdrops = dewdrops.map(d => {
            if (d.x === updatedPlayer.x && d.y === updatedPlayer.y && !d.collected) {
              sound.playDewdrop();
              return { ...d, collected: true };
            }
            return d;
          });

          const redPlate = isEntityOnTileType('plate_red', updatedPlayer, updatedBoxes, grid);
          const bluePlate = isEntityOnTileType('plate_blue', updatedPlayer, updatedBoxes, grid);
          const yellowPlate = isEntityOnTileType('plate_yellow', updatedPlayer, updatedBoxes, grid);

          const allWatered = updatedPlants.every(p => p.isWatered);
          if (allWatered) {
            sound.playVictory();
            const currentStars = (moveCount + 1) <= activeLevel.parMoves ? 3 : 2;
            const updatedProgress = {
              ...progress,
              [activeLevel.id]: {
                levelId: activeLevel.id,
                completed: true,
                stars: Math.max(progress[activeLevel.id]?.stars || 0, currentStars),
                bestMoves: progress[activeLevel.id]?.bestMoves
                  ? Math.min(progress[activeLevel.id].bestMoves, moveCount + 1)
                  : moveCount + 1,
                unlocked: true,
              },
              [activeLevel.id + 1]: {
                levelId: activeLevel.id + 1,
                completed: progress[activeLevel.id + 1]?.completed || false,
                stars: progress[activeLevel.id + 1]?.stars || 0,
                bestMoves: progress[activeLevel.id + 1]?.bestMoves || 0,
                unlocked: true,
              },
            };
            saveProgress(updatedProgress);
          }

          return {
            ...prevState,
            player: updatedPlayer,
            boxes: updatedBoxes,
            plants: updatedPlants,
            dewdrops: updatedDewdrops,
            gatesOpen: { red: redPlate, blue: bluePlate, yellow: yellowPlate },
            moveCount: moveCount + 1,
            isWon: allWatered,
            history: [...history, historySnapshot],
            redoStack: [],
          };
        }

        if (nnx < 0 || nnx >= width || nny < 0 || nny >= height) {
          return { ...prevState, player: { ...player, dir } };
        }

        const destTile = grid[nny][nnx];
        const isDestGateClosed =
          (destTile === 'gate_red' && !gatesOpen.red) ||
          (destTile === 'gate_blue' && !gatesOpen.blue) ||
          (destTile === 'gate_yellow' && !gatesOpen.yellow);

        const hasOtherBox = boxes.some((b, idx) => idx !== boxIndex && b.x === nnx && b.y === nny);
        const hasPlant = plants.some(p => p.x === nnx && p.y === nny);

        if (destTile === 'wall' || isDestGateClosed || hasOtherBox || hasPlant) {
          return { ...prevState, player: { ...player, dir } };
        }

        let finalBoxX = nnx;
        let finalBoxY = nny;
        let updatedGrid = grid;
        let finalBoxType = pushedBox.type;
        let boxRemoved = false;

        if (destTile === 'ice' && pushedBox.type === 'ice_block') {
          sound.playIceSlide();
          while (
            finalBoxX + dx >= 0 &&
            finalBoxX + dx < width &&
            finalBoxY + dy >= 0 &&
            finalBoxY + dy < height &&
            grid[finalBoxY + dy][finalBoxX + dx] === 'ice' &&
            !boxes.some(b => b.x === finalBoxX + dx && b.y === finalBoxY + dy)
          ) {
            finalBoxX += dx;
            finalBoxY += dy;
          }
        }

        if (destTile === 'water_deep') {
          sound.playWaterSplash();
          boxRemoved = true;
          updatedGrid = grid.map((r, rY) =>
            r.map((c, cX) => (cX === nnx && rY === nny ? 'bridge_wood' : c))
          );
        }

        if (destTile === 'water_spring' && pushedBox.type === 'empty_crate') {
          sound.playWaterSplash();
          sound.playBloom();
          finalBoxType = 'water';
        }

        if (destTile === 'portal_a' || destTile === 'portal_b') {
          const exit = findLinkedPortal(destTile, grid);
          if (exit && !boxes.some(b => b.x === exit.x && b.y === exit.y)) {
            sound.playPortal();
            finalBoxX = exit.x;
            finalBoxY = exit.y;
          }
        }

        sound.playPush();

        const updatedBoxes = boxRemoved
          ? boxes.filter((_, idx) => idx !== boxIndex)
          : boxes.map((b, idx) =>
              idx === boxIndex ? { ...b, x: finalBoxX, y: finalBoxY, type: finalBoxType } : b
            );

        const updatedPlayer = { x: nx, y: ny, dir };

        const updatedDewdrops = dewdrops.map(d => {
          if (d.x === updatedPlayer.x && d.y === updatedPlayer.y && !d.collected) {
            sound.playDewdrop();
            return { ...d, collected: true };
          }
          return d;
        });

        const redPlate = isEntityOnTileType('plate_red', updatedPlayer, updatedBoxes, updatedGrid);
        const bluePlate = isEntityOnTileType('plate_blue', updatedPlayer, updatedBoxes, updatedGrid);
        const yellowPlate = isEntityOnTileType('plate_yellow', updatedPlayer, updatedBoxes, updatedGrid);

        if (redPlate !== gatesOpen.red || bluePlate !== gatesOpen.blue || yellowPlate !== gatesOpen.yellow) {
          sound.playPlateToggle();
        }

        return {
          ...prevState,
          player: updatedPlayer,
          grid: updatedGrid,
          boxes: updatedBoxes,
          dewdrops: updatedDewdrops,
          gatesOpen: { red: redPlate, blue: bluePlate, yellow: yellowPlate },
          moveCount: moveCount + 1,
          history: [...history, historySnapshot],
          redoStack: [],
        };
      }

      if (targetTile === 'wall' || isGateClosed || targetTile === 'water_deep') {
        return { ...prevState, player: { ...player, dir } };
      }

      const isPlantTile = plants.some(p => p.x === nx && p.y === ny);
      if (isPlantTile) {
        return { ...prevState, player: { ...player, dir } };
      }

      sound.playStep();

      let finalPlayerX = nx;
      let finalPlayerY = ny;

      if (targetTile === 'portal_a' || targetTile === 'portal_b') {
        const exit = findLinkedPortal(targetTile, grid);
        if (exit && !boxes.some(b => b.x === exit.x && b.y === exit.y)) {
          sound.playPortal();
          finalPlayerX = exit.x;
          finalPlayerY = exit.y;
        }
      }

      const updatedPlayer = { x: finalPlayerX, y: finalPlayerY, dir };

      const updatedDewdrops = dewdrops.map(d => {
        if (d.x === updatedPlayer.x && d.y === updatedPlayer.y && !d.collected) {
          sound.playDewdrop();
          return { ...d, collected: true };
        }
        return d;
      });

      const redPlate = isEntityOnTileType('plate_red', updatedPlayer, boxes, grid);
      const bluePlate = isEntityOnTileType('plate_blue', updatedPlayer, boxes, grid);
      const yellowPlate = isEntityOnTileType('plate_yellow', updatedPlayer, boxes, grid);

      if (redPlate !== gatesOpen.red || bluePlate !== gatesOpen.blue || yellowPlate !== gatesOpen.yellow) {
        sound.playPlateToggle();
      }

      return {
        ...prevState,
        player: updatedPlayer,
        dewdrops: updatedDewdrops,
        gatesOpen: { red: redPlate, blue: bluePlate, yellow: yellowPlate },
        moveCount: moveCount + 1,
        history: [...history, historySnapshot],
        redoStack: [],
      };
    });
  }, [activeLevel, gameState.isWon, progress]);

  // Undo Move
  const handleUndo = useCallback(() => {
    if (gameState.history.length === 0 || gameState.isWon) return;
    sound.playUndo();

    setGameState(prev => {
      const prevSnapshot = prev.history[prev.history.length - 1];
      const newHistory = prev.history.slice(0, -1);

      const currentSnapshot: HistoryState = {
        player: { ...prev.player },
        grid: prev.grid.map(r => [...r]),
        boxes: prev.boxes.map(b => ({ ...b })),
        plants: prev.plants.map(p => ({ ...p })),
        dewdrops: prev.dewdrops.map(d => ({ ...d })),
        gatesOpen: { ...prev.gatesOpen },
        moveCount: prev.moveCount,
      };

      return {
        ...prev,
        player: prevSnapshot.player,
        grid: prevSnapshot.grid,
        boxes: prevSnapshot.boxes,
        plants: prevSnapshot.plants,
        dewdrops: prevSnapshot.dewdrops,
        gatesOpen: prevSnapshot.gatesOpen,
        moveCount: prevSnapshot.moveCount,
        history: newHistory,
        redoStack: [...prev.redoStack, currentSnapshot],
      };
    });
  }, [gameState.history.length, gameState.isWon]);

  // Redo Move
  const handleRedo = useCallback(() => {
    if (gameState.redoStack.length === 0 || gameState.isWon) return;
    sound.playPush();

    setGameState(prev => {
      const nextSnapshot = prev.redoStack[prev.redoStack.length - 1];
      const newRedo = prev.redoStack.slice(0, -1);

      const currentSnapshot: HistoryState = {
        player: { ...prev.player },
        grid: prev.grid.map(r => [...r]),
        boxes: prev.boxes.map(b => ({ ...b })),
        plants: prev.plants.map(p => ({ ...p })),
        dewdrops: prev.dewdrops.map(d => ({ ...d })),
        gatesOpen: { ...prev.gatesOpen },
        moveCount: prev.moveCount,
      };

      return {
        ...prev,
        player: nextSnapshot.player,
        grid: nextSnapshot.grid,
        boxes: nextSnapshot.boxes,
        plants: nextSnapshot.plants,
        dewdrops: nextSnapshot.dewdrops,
        gatesOpen: nextSnapshot.gatesOpen,
        moveCount: nextSnapshot.moveCount,
        history: [...prev.history, currentSnapshot],
        redoStack: newRedo,
      };
    });
  }, [gameState.redoStack.length, gameState.isWon]);

  // Restart Level
  const handleRestart = useCallback(() => {
    sound.playUndo();
    loadLevel(activeLevel);
  }, [activeLevel, loadLevel]);

  const handleNextLevel = () => {
    if (currentLevelIndex < LEVELS.length - 1) {
      const nextIdx = currentLevelIndex + 1;
      setCurrentLevelIndex(nextIdx);
      setCustomLevel(null);
      loadLevel(LEVELS[nextIdx]);
    }
  };

  const handlePrevLevel = () => {
    if (currentLevelIndex > 0) {
      const prevIdx = currentLevelIndex - 1;
      setCurrentLevelIndex(prevIdx);
      setCustomLevel(null);
      loadLevel(LEVELS[prevIdx]);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        handleMove(0, -1);
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleMove(0, 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        handleMove(-1, 0);
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        handleMove(1, 0);
      } else if (e.key === 'z' || e.key === 'Z' || e.key === 'u' || e.key === 'U') {
        e.preventDefault();
        handleUndo();
      } else if (e.key === 'y' || e.key === 'Y') {
        e.preventDefault();
        handleRedo();
      } else if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        handleRestart();
      } else if (e.key === 'Escape') {
        setIsLevelSelectOpen(false);
        setIsInstructionsOpen(false);
        setIsEditorOpen(false);
        setIsHintOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove, handleUndo, handleRedo, handleRestart]);

  const handleTileClick = (x: number, y: number) => {
    const dx = x - gameState.player.x;
    const dy = y - gameState.player.y;

    if (Math.abs(dx) + Math.abs(dy) === 1) {
      handleMove(dx, dy);
    }
  };

  const handleToggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  const handlePlayCustomLevel = (lvl: LevelDefinition) => {
    setCustomLevel(lvl);
    setActiveLevel(lvl);
    setGameState(initLevelState(lvl));
    setIsEditorOpen(false);
  };

  const wateredCount = gameState.plants.filter(p => p.isWatered).length;
  const totalWaterRequired = gameState.plants.reduce((sum, p) => sum + p.requiredWater, 0);
  const currentWaterGiven = gameState.plants.reduce((sum, p) => sum + p.currentWater, 0);
  const bloomPercentage = totalWaterRequired > 0 ? Math.round((currentWaterGiven / totalWaterRequired) * 100) : 100;

  return (
    <div id="oasis-game-app" className="min-h-screen bg-[#F0FDF4] text-slate-800 flex flex-col justify-between font-sans selection:bg-emerald-500 selection:text-white">
      {/* Header matching Vibrant Palette */}
      <header id="main-header" className="h-20 bg-white border-b-4 border-emerald-100 flex items-center justify-between px-6 sm:px-10 shrink-0 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200 shrink-0">
            <Droplets className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-emerald-800 tracking-tight flex items-center gap-2">
              FLOW & FLOURISH
            </h1>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Landscape Water Box Puzzle
              </span>
            </div>
          </div>
        </div>

        {/* Level Progress Badge & Action Buttons */}
        <div className="flex gap-3 sm:gap-6 items-center">
          {/* Level Progress Indicator */}
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Level Progress</span>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map(dot => {
                const currentChunk = Math.ceil(activeLevel.id / 8);
                return (
                  <div
                    key={dot}
                    className={`w-2.5 h-2.5 rounded-full ${
                      dot <= currentChunk ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                );
              })}
            </div>
          </div>

          {/* Level Number Pill */}
          <div className="bg-blue-50 px-4 sm:px-6 py-2 rounded-2xl border-2 border-blue-200 shadow-xs">
            <span className="text-blue-600 font-black text-lg sm:text-xl">
              {activeLevel.id} / 40
            </span>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              id="header-level-select-btn"
              onClick={() => setIsLevelSelectOpen(true)}
              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              title="View Level Map"
            >
              <Compass className="w-4 h-4 text-emerald-600" />
              <span className="hidden md:inline">Map</span>
            </button>

            <button
              id="header-guide-btn"
              onClick={() => setIsInstructionsOpen(true)}
              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              title="Gardener's Guide"
            >
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span className="hidden md:inline">Guide</span>
            </button>

            <button
              id="header-builder-btn"
              onClick={() => setIsEditorOpen(true)}
              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
              title="Sandbox Editor"
            >
              <Hammer className="w-4 h-4 text-emerald-600" />
              <span className="hidden md:inline">Sandbox</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container with Challenge Sidebar & Board Stage */}
      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6 items-start justify-center">
        {/* Left / Top Challenge Info Panel */}
        <aside className="w-full lg:w-72 bg-white/70 backdrop-blur-sm border-2 border-emerald-100 p-5 sm:p-6 rounded-3xl flex flex-col gap-5 shrink-0 shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs uppercase font-extrabold text-emerald-700 tracking-widest">
                Level {activeLevel.id} Challenge
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full capitalize">
                {activeLevel.biome}
              </span>
            </div>
            <h4 className="text-base font-black text-slate-800 mb-1">
              {activeLevel.name}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Navigate water containers to nourish the withered plants and awaken the blooming sanctuary.
            </p>
          </div>

          <div className="space-y-3">
            {/* Moves Status Card */}
            <div className="bg-white p-3.5 rounded-2xl shadow-xs border border-emerald-100 flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Moves Made</div>
                <div className="text-2xl font-black text-emerald-700 font-mono">
                  {gameState.moveCount}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-400 mb-0.5">Par Moves</div>
                <div className="text-sm font-bold text-slate-600 font-mono">
                  {activeLevel.parMoves}
                </div>
              </div>
            </div>

            {/* Bloom / Hydration Progress */}
            <div className="bg-white p-3.5 rounded-2xl shadow-xs border border-emerald-100">
              <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 mb-1.5">
                <span>Soil Hydration</span>
                <span className="text-blue-600 font-black">{bloomPercentage}%</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${bloomPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col gap-2.5 mt-auto pt-2">
            <button
              id="sidebar-reset-btn"
              onClick={handleRestart}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold shadow-md shadow-emerald-200 uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Level</span>
            </button>

            {activeLevel.hint && (
              <button
                id="sidebar-hint-btn"
                onClick={() => setIsHintOpen(true)}
                className="w-full py-3 bg-white border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 rounded-2xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <Lightbulb className="w-4 h-4 text-amber-500" />
                <span>Hint</span>
              </button>
            )}
          </div>
        </aside>

        {/* Center / Right Board and Game Controls Stage */}
        <main id="game-stage" className="flex-1 flex flex-col items-center justify-center w-full gap-4">
          <Board
            state={gameState}
            level={activeLevel}
            onMove={handleMove}
            onTileClick={handleTileClick}
          />

          <GameControls
            state={gameState}
            level={activeLevel}
            isMuted={isMuted}
            canUndo={gameState.history.length > 0}
            canRedo={gameState.redoStack.length > 0}
            onMove={handleMove}
            onUndo={handleUndo}
            onRedo={handleRedo}
            onRestart={handleRestart}
            onToggleSound={handleToggleSound}
            onOpenLevelSelect={() => setIsLevelSelectOpen(true)}
            onOpenInstructions={() => setIsInstructionsOpen(true)}
            onOpenEditor={() => setIsEditorOpen(true)}
            onOpenHint={() => setIsHintOpen(true)}
            onPrevLevel={handlePrevLevel}
            onNextLevel={handleNextLevel}
            hasPrevLevel={currentLevelIndex > 0}
            hasNextLevel={currentLevelIndex < LEVELS.length - 1}
          />

          {/* Quick Level Selector Bar matching Vibrant Theme layout */}
          <div className="w-full max-w-2xl bg-white/80 border-2 border-emerald-100 rounded-2xl p-3 shadow-xs mt-2">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] font-extrabold uppercase text-emerald-800 tracking-wider">
                Quick Level Jump
              </span>
              <button
                onClick={() => setIsLevelSelectOpen(true)}
                className="text-[11px] font-bold text-emerald-600 hover:underline"
              >
                View Full Map →
              </button>
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              {LEVELS.map(lvl => {
                const isCurrent = lvl.id === activeLevel.id;
                const isCompleted = progress[lvl.id]?.completed;
                const isUnlocked = progress[lvl.id]?.unlocked;

                return (
                  <button
                    key={lvl.id}
                    id={`quick-lvl-${lvl.id}`}
                    disabled={!isUnlocked}
                    onClick={() => handleSelectLevel(lvl.id)}
                    className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold transition-all ${
                      isCurrent
                        ? 'bg-emerald-600 ring-4 ring-emerald-200 text-white font-black shadow-sm scale-105'
                        : isCompleted
                        ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-xs'
                        : isUnlocked
                        ? 'bg-white border-2 border-emerald-200 text-emerald-800 hover:bg-emerald-50'
                        : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                    }`}
                  >
                    {lvl.id}
                  </button>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      {/* Footer info */}
      <footer id="app-footer" className="h-12 bg-emerald-800 text-white/80 flex items-center justify-between px-6 sm:px-10 text-[10px] sm:text-xs uppercase font-bold tracking-[0.15em] shrink-0">
        <div>Flow & Flourish • Landscape Water Box Puzzle</div>
        <div className="hidden sm:block">Keyboard: Arrow Keys / WASD • Undo: Z • Restart: R</div>
        <div>40 Scenic Levels</div>
      </footer>

      {/* Modals with Vibrant Palette Styling */}
      {isLevelSelectOpen && (
        <LevelSelect
          currentLevelId={activeLevel.id}
          progress={progress}
          onSelectLevel={handleSelectLevel}
          onClose={() => setIsLevelSelectOpen(false)}
          onUnlockAll={handleUnlockAll}
        />
      )}

      {isInstructionsOpen && (
        <InstructionsModal onClose={() => setIsInstructionsOpen(false)} />
      )}

      {isEditorOpen && (
        <LevelEditor
          onPlayCustomLevel={handlePlayCustomLevel}
          onClose={() => setIsEditorOpen(false)}
        />
      )}

      {isHintOpen && (
        <HintModal
          level={activeLevel}
          onClose={() => setIsHintOpen(false)}
        />
      )}

      {gameState.isWon && (
        <VictoryModal
          level={activeLevel}
          moveCount={gameState.moveCount}
          dewdropsCollected={gameState.dewdrops.filter(d => d.collected).length}
          totalDewdrops={gameState.dewdrops.length}
          onNextLevel={handleNextLevel}
          onRestart={handleRestart}
          onOpenLevelSelect={() => setIsLevelSelectOpen(true)}
          hasNextLevel={currentLevelIndex < LEVELS.length - 1}
        />
      )}
    </div>
  );
}
