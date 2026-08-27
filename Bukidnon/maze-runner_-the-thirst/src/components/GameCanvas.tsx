import React, { useRef, useEffect, useCallback } from 'react';
import { GameEngine } from '../game/GameEngine';
import { gameRenderer } from '../game/GameRenderer';

interface GameCanvasProps {
  engine: GameEngine;
  onStateChange: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ engine, onStateChange }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const animationFrameIdRef = useRef<number>(0);

  // Handle Resize
  const updateCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = Math.floor(rect.width * dpr);
    canvas.height = Math.floor(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
  }, []);

  // Main Render & Physics Loop
  useEffect(() => {
    updateCanvasSize();
    const resizeObserver = new ResizeObserver(() => updateCanvasSize());
    if (containerRef.current) resizeObserver.observe(containerRef.current);

    let running = true;

    const gameLoop = (currentTime: number) => {
      if (!running) return;

      const dt = Math.min(0.1, (currentTime - lastTimeRef.current) / 1000);
      lastTimeRef.current = currentTime;

      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const dpr = window.devicePixelRatio || 1;
          ctx.save();
          ctx.scale(dpr, dpr);

          const logicalWidth = canvas.width / dpr;
          const logicalHeight = canvas.height / dpr;

          // Update Engine Logic
          const prevStatus = engine.status;
          engine.update(dt);

          if (engine.status !== prevStatus) {
            onStateChange();
          }

          // Render Game Scene
          gameRenderer.render(ctx, logicalWidth, logicalHeight, engine);

          ctx.restore();
        }
      }

      animationFrameIdRef.current = requestAnimationFrame(gameLoop);
    };

    lastTimeRef.current = performance.now();
    animationFrameIdRef.current = requestAnimationFrame(gameLoop);

    return () => {
      running = false;
      cancelAnimationFrame(animationFrameIdRef.current);
      resizeObserver.disconnect();
    };
  }, [engine, onStateChange, updateCanvasSize]);

  // Keyboard input handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent scrolling
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }
      engine.keys[e.code] = true;

      // Quick hotkeys
      if (e.code === 'KeyP' || e.code === 'Escape') {
        if (engine.status === 'PLAYING') {
          engine.status = 'PAUSED';
          onStateChange();
        } else if (engine.status === 'PAUSED') {
          engine.status = 'PLAYING';
          onStateChange();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      engine.keys[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [engine, onStateChange]);

  // Mouse / Pointer flashlight aiming
  const handlePointerMove = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas || !engine.player) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    // Convert Screen Coords to World Coords
    const worldX = clientX - rect.width / 2 + engine.camera.x;
    const worldY = clientY - rect.height / 2 + engine.camera.y;

    engine.mouseWorldPos = { x: worldX, y: worldY };
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-slate-950 select-none touch-none"
      onPointerMove={handlePointerMove}
    >
      <canvas
        id="game-canvas"
        ref={canvasRef}
        className="block w-full h-full cursor-crosshair"
      />
    </div>
  );
};
