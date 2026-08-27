import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine, GameStats } from './game/engine';
import { Difficulty, GameState, KeyControls } from './types';
import { GameHUD } from './components/GameHUD';
import { ControlsOverlay } from './components/ControlsOverlay';
import { MainMenu } from './components/MainMenu';
import { SurvivalGuideModal } from './components/SurvivalGuideModal';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';
import { PauseModal } from './components/PauseModal';
import { soundManager } from './audio/soundManager';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>('MENU');
  const [difficulty, setDifficulty] = useState<Difficulty>('SIGNAL_1');
  const [showGuide, setShowGuide] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(soundManager.getIsMuted());
  const [gameStats, setGameStats] = useState<GameStats>({
    score: 0,
    timeLeft: 60.0,
    timeElapsed: 0,
    waterLevel: 2200,
    suppliesCollected: 0,
    totalSupplies: 8,
    dangerDistance: 1000,
    oxygen: 100,
    stamina: 100,
    lives: 5,
    maxLives: 5,
    gameOverReason: '',
    rating: 'A',
  });

  // Handle Resize of Canvas
  const updateCanvasDimensions = useCallback(() => {
    if (!canvasRef.current || !containerRef.current) return;
    const width = containerRef.current.clientWidth || window.innerWidth;
    const height = containerRef.current.clientHeight || window.innerHeight;
    canvasRef.current.width = width;
    canvasRef.current.height = height;
  }, []);

  // Initialize Game Engine
  useEffect(() => {
    if (!canvasRef.current) return;

    updateCanvasDimensions();
    const engine = new GameEngine(canvasRef.current);
    engine.onUpdateUI = (stats, state) => {
      setGameStats({ ...stats });
      setGameState(state);
    };
    engineRef.current = engine;

    // Resize observer
    const ro = new ResizeObserver(() => {
      updateCanvasDimensions();
    });
    if (containerRef.current) {
      ro.observe(containerRef.current);
    }

    // Keyboard event handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default page scrolling for WASD and arrows during game
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        if (engineRef.current?.state === 'PLAYING') {
          e.preventDefault();
        }
      }

      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (engineRef.current?.state === 'PLAYING') {
          engineRef.current.pauseGame();
        } else if (engineRef.current?.state === 'PAUSED') {
          engineRef.current.resumeGame();
        }
      }

      engineRef.current?.handleKeyDown(e.code);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      engineRef.current?.handleKeyUp(e.code);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      ro.disconnect();
      engine.stopLoop();
    };
  }, [updateCanvasDimensions]);

  // Start Game
  const handleStartGame = () => {
    if (!engineRef.current) return;
    engineRef.current.setDifficulty(difficulty);
    engineRef.current.startGame();
    setGameState('PLAYING');
  };

  // Retry Level
  const handleRetry = () => {
    if (!engineRef.current) return;
    engineRef.current.resetGame();
    setGameState('PLAYING');
  };

  // Play Next Signal
  const handlePlayNextLevel = (nextDiff: Difficulty) => {
    setDifficulty(nextDiff);
    if (!engineRef.current) return;
    engineRef.current.setDifficulty(nextDiff);
    engineRef.current.resetGame();
    setGameState('PLAYING');
  };

  // Return to Main Menu
  const handleMainMenu = () => {
    if (!engineRef.current) return;
    engineRef.current.stopLoop();
    engineRef.current.state = 'MENU';
    setGameState('MENU');
  };

  // Pause & Resume
  const handlePause = () => {
    engineRef.current?.pauseGame();
  };

  const handleResume = () => {
    engineRef.current?.resumeGame();
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    soundManager.setMuted(nextMuted);
    setIsMuted(nextMuted);
  };

  // Virtual Key handler for touch
  const handleVirtualKeyChange = (key: keyof KeyControls, pressed: boolean) => {
    engineRef.current?.setVirtualKey(key, pressed);
  };

  return (
    <div id="bagyo-app-root" className="relative w-screen h-screen bg-slate-950 overflow-hidden select-none font-sans">
      {/* Game Canvas Container */}
      <div 
        ref={containerRef} 
        className={`relative w-full h-full ${gameState === 'MENU' ? 'hidden' : 'block'}`}
      >
        <canvas
          ref={canvasRef}
          id="game-canvas"
          className="w-full h-full block cursor-crosshair bg-slate-950"
        />

        {/* In-Game HUD Overlay */}
        {engineRef.current && (
          <GameHUD
            stats={gameStats}
            level={engineRef.current.level}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onPause={handlePause}
            onOpenGuide={() => setShowGuide(true)}
          />
        )}

        {/* Mobile / Touch Controls Overlay */}
        {gameState === 'PLAYING' && (
          <ControlsOverlay onKeyChange={handleVirtualKeyChange} />
        )}
      </div>

      {/* Main Menu Screen */}
      {gameState === 'MENU' && (
        <MainMenu
          difficulty={difficulty}
          onSelectDifficulty={(diff) => setDifficulty(diff)}
          onStartGame={handleStartGame}
          onOpenGuide={() => setShowGuide(true)}
        />
      )}

      {/* Pause Modal */}
      {gameState === 'PAUSED' && (
        <PauseModal
          onResume={handleResume}
          onRestart={handleRetry}
          onMainMenu={handleMainMenu}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* Game Over Modal */}
      {gameState === 'GAMEOVER' && engineRef.current && (
        <GameOverModal
          stats={gameStats}
          level={engineRef.current.level}
          onRetry={handleRetry}
          onMainMenu={handleMainMenu}
        />
      )}

      {/* Victory Modal */}
      {gameState === 'VICTORY' && engineRef.current && (
        <VictoryModal
          stats={gameStats}
          level={engineRef.current.level}
          onPlayNextLevel={handlePlayNextLevel}
          onRetry={handleRetry}
          onMainMenu={handleMainMenu}
        />
      )}

      {/* Survival Go-Bag Guide Modal */}
      {showGuide && (
        <SurvivalGuideModal onClose={() => setShowGuide(false)} />
      )}
    </div>
  );
}
