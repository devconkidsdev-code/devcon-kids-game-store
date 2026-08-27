import React, { useEffect, useRef } from 'react';
import { GameEngine } from '../game/gameEngine';
import { GameRenderer } from '../game/renderer';

interface GameCanvasProps {
  engine: GameEngine;
  onKeyDown?: (e: KeyboardEvent) => void;
  onKeyUp?: (e: KeyboardEvent) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ engine }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<GameRenderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // Setup Canvas & Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI crisp rendering
    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const width = Math.floor(rect.width);
      const height = Math.floor(rect.height);

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      if (!rendererRef.current) {
        rendererRef.current = new GameRenderer(ctx, width, height);
      } else {
        rendererRef.current.setDimensions(width, height);
      }
    };

    updateCanvasSize();
    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });
    resizeObserver.observe(container);

    // Direct Canvas Touch & Gesture Controls (Zero UI clutter over the runner)
    const handleTouchStart = (e: TouchEvent) => {
      if (engine.gameState !== 'PLAYING') return;
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: performance.now(),
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current || engine.gameState !== 'PLAYING') return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      const duration = performance.now() - touchStartRef.current.time;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (absDx < 20 && absDy < 20 && duration < 350) {
        // Simple tap -> Jump!
        engine.handleJump();
      } else if (absDy > absDx && dy > 30) {
        // Swipe Down -> Slide!
        engine.handleSlide();
      } else if (absDy > absDx && dy < -30) {
        // Swipe Up -> Jump!
        engine.handleJump();
      } else if (absDx > absDy && dx > 30) {
        // Swipe Right -> Sprint burst!
        engine.keys.right = true;
        setTimeout(() => {
          engine.keys.right = false;
        }, 600);
      } else if (absDx > absDy && dx < -30) {
        // Swipe Left -> Brake!
        engine.keys.left = true;
        setTimeout(() => {
          engine.keys.left = false;
        }, 500);
      }

      touchStartRef.current = null;
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (engine.gameState !== 'PLAYING') return;
      const rect = canvas.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      if (clickY > rect.height * 0.65) {
        engine.handleSlide();
      } else {
        engine.handleJump();
      }
    };

    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: true });
    canvas.addEventListener('mousedown', handleMouseDown);

    // Main 60 FPS Game Loop
    const loop = (currentTime: number) => {
      const dt = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      // Update engine state
      if (engine.gameState === 'PLAYING') {
        engine.update(dt);
      }

      // Render frame
      if (rendererRef.current) {
        const isVictory = engine.gameState === 'VICTORY';
        rendererRef.current.render(
          engine.player,
          engine.obstacles,
          engine.powerups,
          engine.particles,
          engine.currentLevel,
          engine.worldOffset,
          isVictory,
          engine.playerRocks,
          engine.bossRocks,
          engine.boss,
          engine.screenShake
        );
      }

      animationFrameRef.current = requestAnimationFrame(loop);
    };

    lastTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(loop);

    return () => {
      resizeObserver.disconnect();
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchend', handleTouchEnd);
      canvas.removeEventListener('mousedown', handleMouseDown);
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [engine]);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-slate-950 select-none">
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
        style={{ touchAction: 'none' }}
      />
    </div>
  );
};
