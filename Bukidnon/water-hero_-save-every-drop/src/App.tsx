/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CellType, Direction, GameScreen, Item, LevelConfig, Position, Snake } from './types';
import { LEVELS } from './data/levels';
import { generateLevelMaze, GeneratedMaze } from './utils/mazeGenerator';
import { soundManager } from './utils/audio';

import { HUD } from './components/HUD';
import { MazeBoard } from './components/MazeBoard';
import { MobileControls } from './components/MobileControls';
import { StartScreen } from './components/StartScreen';
import { LevelSuccessModal } from './components/LevelSuccessModal';
import { GameOverModal } from './components/GameOverModal';
import { VictoryScreen } from './components/VictoryScreen';
import { HowToPlayModal } from './components/HowToPlayModal';

export default function App() {
  // Game Navigation & State
  const [screen, setScreen] = useState<GameScreen>('START');
  const [currentLevelIndex, setCurrentLevelIndex] = useState<number>(0);
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);

  // Current Level Configuration
  const currentLevel: LevelConfig = LEVELS[currentLevelIndex] || LEVELS[0];

  // Gameplay State
  const [grid, setGrid] = useState<CellType[][]>([]);
  const [playerPos, setPlayerPos] = useState<Position>({ x: 1, y: 1 });
  const [tankPos, setTankPos] = useState<Position>({ x: 1, y: 1 });
  const [items, setItems] = useState<Item[]>([]);
  const [snakes, setSnakes] = useState<Snake[]>([]);

  const [lives, setLives] = useState<number>(3);
  const [waterPoints, setWaterPoints] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isHurt, setIsHurt] = useState<boolean>(false);
  const [isInvulnerable, setIsInvulnerable] = useState<boolean>(false);

  // Overall Campaign Stats
  const [totalCleanDrops, setTotalCleanDrops] = useState<number>(0);
  const [gameOverReason, setGameOverReason] = useState<'LIVES_DEPLETED' | 'TIMER_EXPIRED' | 'WATER_DEFICIT'>('LIVES_DEPLETED');

  // Audio Toggles
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [musicEnabled, setMusicEnabled] = useState<boolean>(true);

  // Active toast/notice banner in HUD
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'info' | 'warning' | 'success' | 'danger' } | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  // Show temporary toast message
  const showToast = useCallback((text: string, type: 'info' | 'warning' | 'success' | 'danger' = 'info') => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage({ text, type });
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  }, []);

  // Initialize and load level
  const loadLevel = useCallback((levelIdx: number) => {
    const config = LEVELS[levelIdx] || LEVELS[0];
    const mazeData: GeneratedMaze = generateLevelMaze(config);

    setGrid(mazeData.grid);
    setPlayerPos(mazeData.playerStart);
    setTankPos(mazeData.tankPosition);
    setItems(mazeData.items);
    setSnakes(mazeData.snakes);

    // Set initial lives: 3 in Level 1, 2 in Levels 2-5 as per instructions
    const startingLives = config.id === 1 ? 3 : 2;
    setLives(startingLives);
    setWaterPoints(0);
    setTimeLeft(config.timeLimitSec);
    setIsInvulnerable(false);
    setIsHurt(false);
    setCurrentLevelIndex(levelIdx);
    setScreen('PLAYING');

    showToast(`Welcome to Level ${config.id}! Collect at least ${config.requiredWater} clean drops.`, 'info');
  }, [showToast]);

  // Start specific level from Menu
  const handleStartGame = (levelId = 1) => {
    const idx = LEVELS.findIndex(l => l.id === levelId);
    setScore(0);
    setTotalCleanDrops(0);
    loadLevel(idx >= 0 ? idx : 0);
    if (musicEnabled) {
      soundManager.startBGM();
    }
  };

  // Move Player Function with collision with walls
  const movePlayerInDirection = useCallback((dir: Direction) => {
    if (screen !== 'PLAYING') return;

    setPlayerPos(current => {
      let dx = 0;
      let dy = 0;
      if (dir === 'UP') dy = -1;
      else if (dir === 'DOWN') dy = 1;
      else if (dir === 'LEFT') dx = -1;
      else if (dir === 'RIGHT') dx = 1;

      const targetX = current.x + dx;
      const targetY = current.y + dy;

      // Check boundaries and wall
      if (
        targetY >= 0 &&
        targetY < grid.length &&
        targetX >= 0 &&
        targetX < (grid[0]?.length || 0) &&
        grid[targetY][targetX] !== 'WALL'
      ) {
        soundManager.playStep();
        return { x: targetX, y: targetY };
      }
      return current;
    });
  }, [screen, grid]);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (screen !== 'PLAYING') return;

      const key = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd', ' '].includes(key)) {
        e.preventDefault();
      }

      if (key === 'arrowup' || key === 'w') {
        movePlayerInDirection('UP');
      } else if (key === 'arrowdown' || key === 's') {
        movePlayerInDirection('DOWN');
      } else if (key === 'arrowleft' || key === 'a') {
        movePlayerInDirection('LEFT');
      } else if (key === 'arrowright' || key === 'd') {
        movePlayerInDirection('RIGHT');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [screen, movePlayerInDirection]);

  // Timer loop for Level 5 or timed levels
  useEffect(() => {
    if (screen !== 'PLAYING' || !currentLevel.hasTimer) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameOverReason('TIMER_EXPIRED');
          soundManager.playGameOver();
          setScreen('GAME_OVER');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [screen, currentLevel.hasTimer]);

  // Snake Patrol AI Loop
  useEffect(() => {
    if (screen !== 'PLAYING') return;

    const intervalTime = currentLevel.snakeMoveInterval || 500;
    const snakeInterval = setInterval(() => {
      setSnakes(prevSnakes => {
        return prevSnakes.map(snake => {
          // Determine possible open directions
          const dirs: { dir: Direction; dx: number; dy: number }[] = [
            { dir: 'UP', dx: 0, dy: -1 },
            { dir: 'DOWN', dx: 0, dy: 1 },
            { dir: 'LEFT', dx: -1, dy: 0 },
            { dir: 'RIGHT', dx: 1, dy: 0 },
          ];

          const validMoves = dirs.filter(({ dx, dy }) => {
            const nx = snake.x + dx;
            const ny = snake.y + dy;
            return (
              ny >= 0 &&
              ny < grid.length &&
              nx >= 0 &&
              nx < (grid[0]?.length || 0) &&
              grid[ny][nx] !== 'WALL'
            );
          });

          if (validMoves.length === 0) return snake;

          // Try continuing in current direction with 60% probability if valid
          const sameDirMove = validMoves.find(m => m.dir === snake.dir);
          let chosenMove = sameDirMove;

          if (!sameDirMove || Math.random() < 0.4) {
            chosenMove = validMoves[Math.floor(Math.random() * validMoves.length)];
          }

          return {
            ...snake,
            x: snake.x + chosenMove.dx,
            y: snake.y + chosenMove.dy,
            dir: chosenMove.dir,
          };
        });
      });
    }, intervalTime);

    return () => clearInterval(snakeInterval);
  }, [screen, currentLevel.snakeMoveInterval, grid]);

  // Item Collection Handler
  const handleCollectItem = (item: Item) => {
    setItems(prev => prev.map(i => (i.id === item.id ? { ...i, collected: true } : i)));

    if (item.type === 'CLEAN_WATER') {
      setWaterPoints(w => w + 1);
      setScore(s => s + 100);
      setTotalCleanDrops(d => d + 1);
    } else if (item.type === 'CONTAMINATED_WATER') {
      setWaterPoints(w => Math.max(0, w - 1));
      setScore(s => Math.max(0, s - 50));
      showToast('Oops! Contaminated sludge reduced 1 water point.', 'danger');
    } else if (item.type === 'HEART') {
      setLives(l => Math.min(3, l + 1));
      setScore(s => s + 50);
      showToast('Heart collected! Restored 1 Life.', 'success');
    }
  };

  // Step on Dry Hazard Area Handler
  const handleStepDryArea = () => {
    setWaterPoints(w => Math.max(0, w - 1));
    showToast('Drought Area: Heat evaporated 1 water point!', 'warning');
  };

  // Snake Bite Collision Handler
  const handleHitSnake = () => {
    if (isInvulnerable) return;

    setIsHurt(true);
    setIsInvulnerable(true);

    setLives(prevLives => {
      const updated = prevLives - 1;
      if (updated <= 0) {
        setGameOverReason('LIVES_DEPLETED');
        soundManager.playGameOver();
        setScreen('GAME_OVER');
        return 0;
      }
      return updated;
    });

    showToast('Snake bite! Lost 1 life.', 'danger');

    setTimeout(() => {
      setIsHurt(false);
    }, 400);

    // 1.5 seconds invulnerability window
    setTimeout(() => {
      setIsInvulnerable(false);
    }, 1500);
  };

  // Reach Community Tank
  const handleReachTank = () => {
    if (waterPoints >= currentLevel.requiredWater) {
      soundManager.playLevelComplete();
      setScore(s => s + 500 + lives * 100);

      if (currentLevelIndex === LEVELS.length - 1) {
        // Final Level 5 Completed -> VICTORY!
        setScreen('VICTORY');
      } else {
        // Level cleared -> Transition Modal
        setScreen('LEVEL_CLEARED');
      }
    }
  };

  // Next Level Action
  const handleNextLevel = () => {
    if (currentLevelIndex < LEVELS.length - 1) {
      loadLevel(currentLevelIndex + 1);
    } else {
      setScreen('VICTORY');
    }
  };

  // Retry Current Level Action
  const handleRetryLevel = () => {
    loadLevel(currentLevelIndex);
  };

  // Sound & Music Toggles
  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    soundManager.soundEnabled = next;
  };

  const handleToggleMusic = () => {
    const next = !musicEnabled;
    setMusicEnabled(next);
    soundManager.musicEnabled = next;
    if (next) {
      soundManager.startBGM();
    } else {
      soundManager.stopBGM();
    }
  };

  return (
    <div className="min-h-screen bg-sky-300 text-slate-900 flex flex-col items-center justify-center p-2 sm:p-4 md:p-6 select-none relative overflow-x-hidden font-sans" style={{ backgroundColor: '#7dd3fc' }}>
      
      {/* Toast Alert floating notice */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-bounce">
          <div
            className={`px-4 py-2 rounded-2xl shadow-2xl border-4 text-xs sm:text-sm font-black uppercase tracking-wide flex items-center gap-2 ${
              toastMessage.type === 'danger'
                ? 'bg-rose-500 border-rose-700 text-white'
                : toastMessage.type === 'warning'
                ? 'bg-amber-500 border-amber-700 text-white'
                : toastMessage.type === 'success'
                ? 'bg-emerald-500 border-emerald-700 text-white'
                : 'bg-blue-600 border-blue-800 text-white'
            }`}
          >
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Game Screen Canvas Container (Framed with Bold 8px Blue Border & 40px Rounded Corners) */}
      <div className="w-full max-w-5xl bg-yellow-50 border-8 border-blue-600 rounded-[32px] sm:rounded-[40px] flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden relative my-auto">
        
        {/* Main Screen Views */}
        {screen === 'START' && (
          <StartScreen
            levels={LEVELS}
            onStartGame={handleStartGame}
            onOpenHowToPlay={() => setShowHowToPlay(true)}
          />
        )}

        {screen === 'PLAYING' && (
          <div className="w-full flex-1 flex flex-col justify-between">
            {/* Top HUD */}
            <HUD
              level={currentLevel}
              lives={lives}
              maxLives={3}
              waterPoints={waterPoints}
              score={score}
              timeLeft={timeLeft}
              isHurt={isHurt}
              soundEnabled={soundEnabled}
              musicEnabled={musicEnabled}
              onToggleSound={handleToggleSound}
              onToggleMusic={handleToggleMusic}
              onRestartLevel={handleRetryLevel}
              onOpenHowToPlay={() => setShowHowToPlay(true)}
            />

            {/* Maze Playing Board Container with Yellow-100 Dot Matrix */}
            <main className="flex-grow p-3 sm:p-5 bg-yellow-100 relative flex flex-col items-center justify-center min-h-[380px]">
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: 'radial-gradient(#92400e 1.5px, transparent 0)',
                  backgroundSize: '36px 36px',
                }}
              />
              
              <MazeBoard
                level={currentLevel}
                grid={grid}
                playerPos={playerPos}
                tankPos={tankPos}
                items={items}
                snakes={snakes}
                lives={lives}
                waterPoints={waterPoints}
                isInvulnerable={isInvulnerable}
                onMovePlayer={(pos) => setPlayerPos(pos)}
                onCollectItem={handleCollectItem}
                onStepDryArea={handleStepDryArea}
                onHitSnake={handleHitSnake}
                onReachTank={handleReachTank}
                onShowMessage={(text, type) => showToast(text, type)}
              />
            </main>

            {/* Footer Bar & Controls */}
            <footer className="bg-white p-3 sm:p-4 flex flex-col sm:flex-row justify-between items-center border-t-8 border-blue-600 gap-3">
              <div className="flex items-center gap-2 order-2 sm:order-1">
                <MobileControls onMove={movePlayerInDirection} />
              </div>
              
              <div className="flex items-center gap-2 order-1 sm:order-2">
                <span className="w-3.5 h-3.5 bg-green-500 rounded-full animate-pulse shrink-0" />
                <span className="text-xs sm:text-sm font-black text-blue-900 uppercase tracking-wide">
                  {waterPoints >= currentLevel.requiredWater
                    ? '🎉 Goal Reached! Deliver to Community Tank!'
                    : `Our community needs ${currentLevel.requiredWater - waterPoints} more drops!`}
                </span>
              </div>
            </footer>
          </div>
        )}

        {/* Modals & Overlays */}
        {screen === 'LEVEL_CLEARED' && (
          <LevelSuccessModal
            level={currentLevel}
            waterPoints={waterPoints}
            lives={lives}
            isLastLevel={currentLevelIndex === LEVELS.length - 1}
            onNextLevel={handleNextLevel}
          />
        )}

        {screen === 'GAME_OVER' && (
          <GameOverModal
            level={currentLevel}
            reason={gameOverReason}
            waterPoints={waterPoints}
            onRetryLevel={handleRetryLevel}
            onGoHome={() => setScreen('START')}
          />
        )}

        {screen === 'VICTORY' && (
          <VictoryScreen
            totalScore={score}
            totalCleanDrops={totalCleanDrops}
            onPlayAgain={() => handleStartGame(1)}
            onGoHome={() => setScreen('START')}
          />
        )}

        {/* How to Play Guide Modal */}
        {showHowToPlay && (
          <HowToPlayModal onClose={() => setShowHowToPlay(false)} />
        )}

      </div>
    </div>
  );
}
