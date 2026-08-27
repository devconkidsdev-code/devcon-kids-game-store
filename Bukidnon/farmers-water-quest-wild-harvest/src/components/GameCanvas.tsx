import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine, GameState } from '../game/engine';
import { GameRenderer } from '../game/renderer';
import { LevelConfig } from '../types';
import { HUD } from './HUD';

interface GameCanvasProps {
  level: LevelConfig;
  onOpenLevelSelect: () => void;
  onOpenGuide: () => void;
  onOpenAudioSettings: () => void;
  onLevelComplete: (state: GameState) => void;
  onGameOver: (state: GameState) => void;
  onNextLevelDirect?: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  level,
  onOpenLevelSelect,
  onOpenGuide,
  onOpenAudioSettings,
  onLevelComplete,
  onGameOver,
  onNextLevelDirect,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const rendererRef = useRef<GameRenderer | null>(null);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const mousePosRef = useRef<{ worldX: number; worldY: number } | undefined>(undefined);
  const [currentGameState, setCurrentGameState] = useState<GameState | null>(null);

  // Virtual touch joystick state
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [touchVector, setTouchVector] = useState<{ x: number; y: number } | null>(null);

  // Initialize engine when level changes
  useEffect(() => {
    const engine = new GameEngine(level, (newState) => {
      // Periodic react state sync for HUD
      setCurrentGameState({ ...newState });

      if (newState.isVictory) {
        onLevelComplete(newState);
      } else if (newState.isGameOver) {
        onGameOver(newState);
      }
    });

    engineRef.current = engine;
    setCurrentGameState(engine.state);

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        rendererRef.current = new GameRenderer(ctx);
      }
    }
  }, [level, onLevelComplete, onGameOver]);

  // Main game loop (RAF)
  useEffect(() => {
    let lastTime = performance.now();
    let animId: number;

    const loop = (time: number) => {
      const dt = Math.min(0.1, (time - lastTime) / 1000);
      lastTime = time;

      if (engineRef.current && rendererRef.current) {
        // Integrate inputs
        const activeKeys = { ...keysRef.current };

        // Virtual joystick emulation
        if (touchVector) {
          if (touchVector.y < -0.3) activeKeys['KeyW'] = true;
          if (touchVector.y > 0.3) activeKeys['KeyS'] = true;
          if (touchVector.x < -0.3) activeKeys['KeyA'] = true;
          if (touchVector.x > 0.3) activeKeys['KeyD'] = true;
        }

        engineRef.current.updatePlayerInput(activeKeys, mousePosRef.current);
        engineRef.current.update(dt);
        rendererRef.current.render(engineRef.current.state);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [touchVector]);

  // Canvas Resize observer
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current && rendererRef.current) {
        const { clientWidth, clientHeight } = containerRef.current;
        canvasRef.current.width = clientWidth;
        canvasRef.current.height = clientHeight;
        rendererRef.current.resize(clientWidth, clientHeight);
      }
    };

    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
      handleResize();
    }

    window.addEventListener('resize', handleResize);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.code] = true;

      // Item shortcuts
      if (e.code === 'KeyQ' || e.code === 'Digit1') {
        engineRef.current?.triggerActionItem('flare');
      } else if (e.code === 'KeyF' || e.code === 'Digit2') {
        engineRef.current?.triggerActionItem('stone');
      } else if (e.code === 'KeyN') {
        // Complete current level and proceed to next level
        engineRef.current?.forceCompleteLevel();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Touch handlers for mobile virtual joystick
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
    setTouchVector({ x: 0, y: 0 });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!touchStartRef.current) return;
    const touch = e.touches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const maxRadius = 45;
    const dist = Math.hypot(dx, dy);

    if (dist > 0) {
      const clampedDist = Math.min(dist, maxRadius);
      setTouchVector({
        x: (dx / dist) * (clampedDist / maxRadius),
        y: (dy / dist) * (clampedDist / maxRadius),
      });
    }
  };

  const handleTouchEnd = () => {
    touchStartRef.current = null;
    setTouchVector(null);
  };

  const handleActionItem = useCallback((item: 'flare' | 'stone' | 'speed_tonic') => {
    engineRef.current?.triggerActionItem(item);
  }, []);

  const handleCollectWaterToggle = useCallback((active: boolean) => {
    keysRef.current['Space'] = active;
  }, []);

  const handlePourWaterToggle = useCallback((active: boolean) => {
    keysRef.current['KeyE'] = active;
  }, []);

  const handleForceComplete = useCallback(() => {
    engineRef.current?.forceCompleteLevel();
  }, []);

  const handleSkipToNextLevel = useCallback(() => {
    if (onNextLevelDirect) {
      onNextLevelDirect();
    } else {
      engineRef.current?.forceCompleteLevel();
    }
  }, [onNextLevelDirect]);

  return (
    <div
      ref={containerRef}
      id="game-viewport-container"
      className="relative w-full h-full bg-slate-950 overflow-hidden select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <canvas
        ref={canvasRef}
        id="game-primary-canvas"
        className="w-full h-full block cursor-crosshair"
      />

      {/* HUD overlay */}
      {currentGameState && (
        <HUD
          gameState={currentGameState}
          onOpenLevelSelect={onOpenLevelSelect}
          onOpenGuide={onOpenGuide}
          onOpenAudioSettings={onOpenAudioSettings}
          onActionItem={handleActionItem}
          onCollectWaterToggle={handleCollectWaterToggle}
          onPourWaterToggle={handlePourWaterToggle}
          onForceCompleteLevel={handleForceComplete}
          onSkipToNextLevel={handleSkipToNextLevel}
        />
      )}

      {/* Mobile Virtual Touch Joystick Visual */}
      {touchStartRef.current && touchVector && (
        <div
          id="virtual-joystick-base"
          className="pointer-events-none absolute w-24 h-24 rounded-full border-2 border-emerald-400/40 bg-emerald-950/40 backdrop-blur-sm -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-20"
          style={{
            left: `${touchStartRef.current.x}px`,
            top: `${touchStartRef.current.y}px`,
          }}
        >
          <div
            id="virtual-joystick-thumb"
            className="w-10 h-10 rounded-full bg-emerald-400 border-2 border-white shadow-lg transition-transform"
            style={{
              transform: `translate(${touchVector.x * 32}px, ${touchVector.y * 32}px)`,
            }}
          />
        </div>
      )}
    </div>
  );
};
