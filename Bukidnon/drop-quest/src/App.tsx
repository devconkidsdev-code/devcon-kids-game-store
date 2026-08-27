import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine, InputState } from './game/engine';
import { GameRenderer } from './game/renderer';
import { LEVELS } from './game/levels';
import { GameState } from './types';
import { sound } from './game/audio';
import { HUD } from './components/HUD';
import { TouchControls } from './components/TouchControls';
import { TitleScreen } from './components/TitleScreen';
import { LevelCompleteModal } from './components/LevelCompleteModal';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';
import { PauseModal } from './components/PauseModal';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const rendererRef = useRef<GameRenderer | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const gameTimeRef = useRef<number>(0);

  // Input states
  const inputRef = useRef<InputState>({
    left: false,
    right: false,
    jump: false,
    jumpJustPressed: false,
    shoot: false,
    shootJustPressed: false,
  });

  // Track max unlocked level
  const [unlockedLevel, setUnlockedLevel] = useState<number>(0);

  // Synchronized React Game State for HUD and Modals
  const [gameState, setGameState] = useState<GameState>(() => {
    const initialEngine = new GameEngine(LEVELS[0]);
    engineRef.current = initialEngine;
    return initialEngine.state;
  });

  // Keep screen mode in React state for immediate conditional rendering
  const [screen, setScreen] = useState<'TITLE' | 'PLAYING' | 'PAUSED' | 'LEVEL_COMPLETE' | 'GAME_OVER' | 'VICTORY'>('TITLE');

  // Initialize Canvas & Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    rendererRef.current = new GameRenderer(ctx);

    const handleResize = () => {
      if (!containerRef.current || !canvas) return;
      const rect = containerRef.current.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.scale(dpr, dpr);
    };

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    handleResize();

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      // Prevent page scrolling on space & arrows
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e.key)) {
        e.preventDefault();
      }

      // Pause toggle
      if (key === 'escape' || key === 'p') {
        if (screen === 'PLAYING') {
          togglePause();
        }
        return;
      }

      if (key === 'arrowleft' || key === 'a') {
        inputRef.current.left = true;
      } else if (key === 'arrowright' || key === 'd') {
        inputRef.current.right = true;
      } else if (key === 'arrowup' || key === 'w') {
        if (!inputRef.current.jump) {
          inputRef.current.jumpJustPressed = true;
        }
        inputRef.current.jump = true;
      } else if (key === ' ' || key === 'space' || key === 'spacebar' || key === 'f' || key === 'j' || key === 'x' || key === 'k' || key === 'z' || key === 'shift' || key === 'control') {
        if (!inputRef.current.shoot) {
          inputRef.current.shootJustPressed = true;
        }
        inputRef.current.shoot = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();

      if (key === 'arrowleft' || key === 'a') {
        inputRef.current.left = false;
      } else if (key === 'arrowright' || key === 'd') {
        inputRef.current.right = false;
      } else if (key === 'arrowup' || key === 'w') {
        inputRef.current.jump = false;
      } else if (key === ' ' || key === 'space' || key === 'spacebar' || key === 'f' || key === 'j' || key === 'x' || key === 'k' || key === 'z' || key === 'shift' || key === 'control') {
        inputRef.current.shoot = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [screen]);

  // Game Loop
  useEffect(() => {
    let active = true;

    const loop = (currentTime: number) => {
      if (!active) return;

      const dt = Math.min((currentTime - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = currentTime;
      gameTimeRef.current += dt;

      const engine = engineRef.current;
      const renderer = rendererRef.current;
      const canvas = canvasRef.current;
      const container = containerRef.current;

      if (engine && renderer && canvas && container) {
        const viewportWidth = container.clientWidth;
        const viewportHeight = container.clientHeight;

        // Run engine update if currently playing
        if (screen === 'PLAYING' && !engine.state.isPaused) {
          const updatedState = engine.update(dt, inputRef.current, viewportWidth);
          // Consume single-frame triggers
          inputRef.current.jumpJustPressed = false;
          inputRef.current.shootJustPressed = false;

          // Check for screen state transitions from engine
          if (updatedState.screen !== screen) {
            setScreen(updatedState.screen);
            if (updatedState.screen === 'LEVEL_COMPLETE') {
              setUnlockedLevel(prev => Math.max(prev, updatedState.currentLevelIndex + 1));
            }
          }
          setGameState({ ...updatedState });
        }

        // Render scene
        const cameraX = engine.state.cameraX;
        const level = engine.level;

        renderer.drawBackground(viewportWidth, viewportHeight, cameraX, level, gameTimeRef.current);
        renderer.drawGround(level, cameraX, viewportWidth, viewportHeight);
        renderer.drawPlatforms(level.platforms, cameraX, gameTimeRef.current);
        renderer.drawQuestionBlocks(engine.questionBlocks, cameraX, gameTimeRef.current);
        renderer.drawPowerUps(engine.powerUps, cameraX, gameTimeRef.current);
        renderer.drawObstacles(level.obstacles, cameraX);
        renderer.drawCropGoal(level, cameraX, engine.state.progressPercent, gameTimeRef.current);
        renderer.drawDrops(engine.drops, cameraX, gameTimeRef.current);
        renderer.drawWeeds(engine.weeds, cameraX, gameTimeRef.current);
        renderer.drawSunflowers(engine.sunflowers, cameraX, gameTimeRef.current);
        renderer.drawSeedProjectiles(engine.seedProjectiles, cameraX);
        renderer.drawWaterBlasts(engine.waterBlasts, cameraX, gameTimeRef.current);
        renderer.drawPlayer(engine.player, cameraX, engine.state.progressPercent, gameTimeRef.current);
        renderer.drawParticles(engine.particles, cameraX);
      }

      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      active = false;
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [screen]);

  // Sync background music with screen changes & user interaction
  useEffect(() => {
    if (screen === 'PAUSED') {
      sound.pauseMusic();
    } else {
      sound.resumeMusic();
    }
  }, [screen]);

  // Unlock Web Audio and start lively background music on initial user interaction
  useEffect(() => {
    const handleFirstUserInteraction = () => {
      sound.startMusic();
      window.removeEventListener('pointerdown', handleFirstUserInteraction);
      window.removeEventListener('keydown', handleFirstUserInteraction);
      window.removeEventListener('touchstart', handleFirstUserInteraction);
    };

    window.addEventListener('pointerdown', handleFirstUserInteraction, { once: true });
    window.addEventListener('keydown', handleFirstUserInteraction, { once: true });
    window.addEventListener('touchstart', handleFirstUserInteraction, { once: true });

    return () => {
      window.removeEventListener('pointerdown', handleFirstUserInteraction);
      window.removeEventListener('keydown', handleFirstUserInteraction);
      window.removeEventListener('touchstart', handleFirstUserInteraction);
    };
  }, []);

  // Action handlers
  const handleStartGame = useCallback((levelIndex: number = 0) => {
    sound.startMusic();
    const targetLevel = LEVELS[levelIndex] || LEVELS[0];
    if (!engineRef.current) {
      engineRef.current = new GameEngine(targetLevel, 5, 0);
    } else {
      engineRef.current.resetLevel(targetLevel, false);
    }
    setGameState({ ...engineRef.current.state, screen: 'PLAYING' });
    setScreen('PLAYING');
  }, []);

  const handleNextLevel = useCallback(() => {
    if (!engineRef.current) return;
    const nextIdx = engineRef.current.state.currentLevelIndex + 1;
    if (nextIdx < LEVELS.length) {
      const nextLevel = LEVELS[nextIdx];
      engineRef.current.resetLevel(nextLevel, true);
      setGameState({ ...engineRef.current.state, screen: 'PLAYING' });
      setScreen('PLAYING');
    } else {
      // Completed all levels!
      setScreen('VICTORY');
    }
  }, []);

  const handleReplayLevel = useCallback(() => {
    if (!engineRef.current) return;
    const currentLevel = LEVELS[engineRef.current.state.currentLevelIndex];
    engineRef.current.resetLevel(currentLevel, false);
    setGameState({ ...engineRef.current.state, screen: 'PLAYING' });
    setScreen('PLAYING');
  }, []);

  const handleToggleSound = useCallback(() => {
    const nextState = !sound.isEnabled();
    sound.setEnabled(nextState);
    if (engineRef.current) {
      engineRef.current.state.soundEnabled = nextState;
      setGameState(prev => ({ ...prev, soundEnabled: nextState }));
    }
  }, []);

  const togglePause = useCallback(() => {
    if (!engineRef.current) return;
    const nextPaused = !engineRef.current.state.isPaused;
    engineRef.current.state.isPaused = nextPaused;
    setScreen(nextPaused ? 'PAUSED' : 'PLAYING');
    setGameState(prev => ({ ...prev, isPaused: nextPaused }));
  }, []);

  const handleReturnToTitle = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.state.isPaused = false;
    }
    setScreen('TITLE');
  }, []);

  const currentLevelConfig = LEVELS[gameState.currentLevelIndex] || LEVELS[0];

  return (
    <div
      id="app-root"
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden bg-stone-950 select-none font-sans"
    >
      {/* 2D Platformer Game Canvas */}
      <canvas
        id="game-canvas"
        ref={canvasRef}
        className="w-full h-full block touch-none"
      />

      {/* In-Game HUD (Always visible during gameplay and pause) */}
      {(screen === 'PLAYING' || screen === 'PAUSED') && (
        <>
          <HUD
            state={gameState}
            levelName={currentLevelConfig.name}
            onToggleSound={handleToggleSound}
            onTogglePause={togglePause}
          />
          <TouchControls
            onLeftChange={val => { inputRef.current.left = val; }}
            onRightChange={val => { inputRef.current.right = val; }}
            onJumpChange={val => {
              if (val && !inputRef.current.jump) {
                inputRef.current.jumpJustPressed = true;
              }
              inputRef.current.jump = val;
            }}
            hasWaterGun={gameState.hasWaterGun}
            waterAmmo={gameState.waterAmmo}
            onShootChange={val => {
              if (val && !inputRef.current.shoot) {
                inputRef.current.shootJustPressed = true;
              }
              inputRef.current.shoot = val;
            }}
          />
        </>
      )}

      {/* Title / Start Screen */}
      {screen === 'TITLE' && (
        <TitleScreen
          onStartGame={handleStartGame}
          unlockedLevel={unlockedLevel}
        />
      )}

      {/* Level Complete Screen */}
      {screen === 'LEVEL_COMPLETE' && (
        <LevelCompleteModal
          state={gameState}
          levelName={currentLevelConfig.name}
          onNextLevel={handleNextLevel}
          onReplayLevel={handleReplayLevel}
        />
      )}

      {/* Game Over Screen */}
      {screen === 'GAME_OVER' && (
        <GameOverModal
          state={gameState}
          onRetry={handleReplayLevel}
          onHome={handleReturnToTitle}
        />
      )}

      {/* Victory Screen */}
      {screen === 'VICTORY' && (
        <VictoryModal
          state={gameState}
          onPlayAgain={() => handleStartGame(0)}
          onHome={handleReturnToTitle}
        />
      )}

      {/* Pause Menu */}
      {screen === 'PAUSED' && (
        <PauseModal
          onResume={togglePause}
          onRestart={handleReplayLevel}
          onHome={handleReturnToTitle}
          soundEnabled={gameState.soundEnabled}
          onToggleSound={handleToggleSound}
        />
      )}
    </div>
  );
}
