import React, { useEffect, useRef } from 'react';
import { LevelConfig, Particle, TileType } from '../types';
import { soundManager } from '../utils/audio';
import { isPassable } from '../data/levels';

interface GameCanvasProps {
  level: LevelConfig;
  water: number;
  setWater: React.Dispatch<React.SetStateAction<number>>;
  onWin: () => void;
  onLose: () => void;
  isPaused: boolean;
  activeDirection: { x: number; y: number } | null;
  onPlayerPosChange?: (pos: { x: number; y: number }) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  level,
  water,
  setWater,
  onWin,
  onLose,
  isPaused,
  activeDirection,
  onPlayerPosChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Player state refs for 60fps loop
  const playerRef = useRef({
    x: level.startPos.x,
    y: level.startPos.y,
    targetX: level.startPos.x,
    targetY: level.startPos.y,
    facing: 'down' as 'up' | 'down' | 'left' | 'right',
    isMoving: false,
    walkFrame: 0,
    strideTime: 0,
    currentTileType: 3 as TileType,
  });

  // Collected dew tiles in current level run
  const collectedDewsRef = useRef<Set<string>>(new Set());

  // Floating text popups (e.g. "+10% 💧")
  const popupsRef = useRef<Array<{ x: number; y: number; text: string; color: string; life: number; maxLife: number }>>([]);

  // Particles
  const particlesRef = useRef<Particle[]>([]);

  // Key tracking
  const keysRef = useRef<{ [key: string]: boolean }>({});

  // Reset when level changes
  useEffect(() => {
    playerRef.current = {
      x: level.startPos.x,
      y: level.startPos.y,
      targetX: level.startPos.x,
      targetY: level.startPos.y,
      facing: 'down',
      isMoving: false,
      walkFrame: 0,
      strideTime: 0,
      currentTileType: 3,
    };
    collectedDewsRef.current.clear();
    popupsRef.current = [];
    particlesRef.current = [];
  }, [level]);

  // Keyboard listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
        e.preventDefault();
        keysRef.current[key] = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(key)) {
        keysRef.current[key] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Main 60fps game loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    let lastDripSpawnTime = 0;
    let lastWarningSoundTime = 0;

    const gameLoop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1); // clamp delta
      lastTime = currentTime;

      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) {
        animationFrameId = requestAnimationFrame(gameLoop);
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Handle Resize & DPR
      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const displayWidth = Math.floor(rect.width);
      const displayHeight = Math.floor(rect.height);

      if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);

      // Grid dimensions & Tile Sizing
      const tileSize = Math.min(
        displayWidth / (level.width + 0.5),
        displayHeight / (level.height + 0.5)
      );

      const offsetX = Math.floor((displayWidth - level.width * tileSize) / 2);
      const offsetY = Math.floor((displayHeight - level.height * tileSize) / 2);

      // 1. UPDATE GAME STATE (if not paused & water > 0)
      if (!isPaused && water > 0) {
        // Read directional inputs
        let dx = 0;
        let dy = 0;

        if (keysRef.current['arrowup'] || keysRef.current['w']) dy -= 1;
        if (keysRef.current['arrowdown'] || keysRef.current['s']) dy += 1;
        if (keysRef.current['arrowleft'] || keysRef.current['a']) dx -= 1;
        if (keysRef.current['arrowright'] || keysRef.current['d']) dx += 1;

        // Virtual D-pad override
        if (activeDirection) {
          dx = activeDirection.x;
          dy = activeDirection.y;
        }

        // Normalize diagonal speed
        if (dx !== 0 && dy !== 0) {
          dx *= 0.7071;
          dy *= 0.7071;
        }

        const p = playerRef.current;
        const speed = 4.2; // tiles per second

        let isMoving = dx !== 0 || dy !== 0;

        if (isMoving) {
          if (Math.abs(dx) > Math.abs(dy)) {
            p.facing = dx > 0 ? 'right' : 'left';
          } else {
            p.facing = dy > 0 ? 'down' : 'up';
          }

          // Calculate new potential position with wall collision sliding
          const newX = p.x + dx * speed * dt;
          const newY = p.y + dy * speed * dt;

          const playerRadius = 0.28;

          // Helper to check if a tile coordinate is solid
          const isSolid = (tx: number, ty: number) => {
            if (tx < 0 || tx >= level.width || ty < 0 || ty >= level.height) return true;
            return !isPassable(level.grid[ty][tx]);
          };

          // Check X movement
          let canMoveX = true;
          const minTx = Math.floor(newX - playerRadius);
          const maxTx = Math.floor(newX + playerRadius);
          const currentMinTy = Math.floor(p.y - playerRadius);
          const currentMaxTy = Math.floor(p.y + playerRadius);

          for (let ty = currentMinTy; ty <= currentMaxTy; ty++) {
            if (isSolid(minTx, ty) || isSolid(maxTx, ty)) {
              canMoveX = false;
              break;
            }
          }

          if (canMoveX) {
            p.x = newX;
          }

          // Check Y movement
          let canMoveY = true;
          const currentMinTx = Math.floor(p.x - playerRadius);
          const currentMaxTx = Math.floor(p.x + playerRadius);
          const minTy = Math.floor(newY - playerRadius);
          const maxTy = Math.floor(newY + playerRadius);

          for (let tx = currentMinTx; tx <= currentMaxTx; tx++) {
            if (isSolid(tx, minTy) || isSolid(tx, maxTy)) {
              canMoveY = false;
              break;
            }
          }

          if (canMoveY) {
            p.y = newY;
          }

          p.strideTime += dt * 8;
          p.walkFrame = Math.sin(p.strideTime);

          // Footstep audio
          if (Math.sin(p.strideTime) > 0.95) {
            soundManager.playStep();
          }
        } else {
          p.walkFrame = 0;
        }

        p.isMoving = isMoving;

        // Current tile
        const currentGridX = Math.round(p.x);
        const currentGridY = Math.round(p.y);
        const currentTile = level.grid[currentGridY]?.[currentGridX] ?? 0;
        p.currentTileType = currentTile;

        if (onPlayerPosChange) {
          onPlayerPosChange({ x: p.x, y: p.y });
        }

        // Check Dew Spring collection
        const dewKey = `${currentGridX},${currentGridY}`;
        if (currentTile === 6 && !collectedDewsRef.current.has(dewKey)) {
          collectedDewsRef.current.add(dewKey);
          soundManager.playRefill();
          setWater((prev) => Math.min(100, prev + 10));

          // Dew pickup popup & sparkles
          popupsRef.current.push({
            x: currentGridX,
            y: currentGridY,
            text: '+10% 💧',
            color: '#38bdf8',
            life: 1.2,
            maxLife: 1.2,
          });

          for (let i = 0; i < 16; i++) {
            const angle = (Math.PI * 2 * i) / 16;
            particlesRef.current.push({
              x: (currentGridX + 0.5) * tileSize + offsetX,
              y: (currentGridY + 0.5) * tileSize + offsetY,
              vx: Math.cos(angle) * (40 + Math.random() * 40),
              vy: Math.sin(angle) * (40 + Math.random() * 40),
              life: 0.6,
              maxLife: 0.6,
              size: 3 + Math.random() * 2,
              color: '#38bdf8',
              alpha: 1,
              type: 'sparkle',
            });
          }
        }

        // Check Win Condition (Village reached!)
        const distToVillage = Math.hypot(p.x - level.villagePos.x, p.y - level.villagePos.y);
        if (distToVillage < 0.65) {
          onWin();
          return;
        }

        // Calculate Water Depletion
        let currentLeakRate = level.baseLeakRate;
        if (isMoving) {
          currentLeakRate += level.moveLeakRate;
        }
        if (currentTile === 5) {
          // Scree rough terrain
          currentLeakRate += level.screeLeakRate;
        }

        const waterLoss = currentLeakRate * dt;
        setWater((prev) => {
          const next = Math.max(0, prev - waterLoss);
          if (next <= 0 && prev > 0) {
            onLose();
          }
          return next;
        });

        // Water warning sound
        if (water < 20 && water > 0) {
          if (currentTime - lastWarningSoundTime > 1200) {
            soundManager.playWarning();
            lastWarningSoundTime = currentTime;
          }
        }

        // Spawn falling water droplets from bucket
        const dripInterval = isMoving ? 140 : (currentTile === 5 ? 80 : 320);
        if (currentTime - lastDripSpawnTime > dripInterval) {
          lastDripSpawnTime = currentTime;
          soundManager.playDrip();

          // Spawn particle behind player
          const bucketOffsetX = p.facing === 'right' ? 8 : (p.facing === 'left' ? -8 : 6);
          const bucketOffsetY = 4;

          const screenPX = (p.x + 0.5) * tileSize + offsetX + bucketOffsetX;
          const screenPY = (p.y + 0.5) * tileSize + offsetY + bucketOffsetY;

          particlesRef.current.push({
            x: screenPX,
            y: screenPY,
            vx: (Math.random() - 0.5) * 12,
            vy: 20 + Math.random() * 20,
            life: 0.35,
            maxLife: 0.35,
            size: 2.5 + Math.random() * 1.5,
            color: '#38bdf8',
            alpha: 0.9,
            type: 'water',
          });
        }
      }

      // Update Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const pt = particlesRef.current[i];
        pt.x += pt.vx * dt;
        pt.y += pt.vy * dt;
        pt.life -= dt;
        pt.alpha = Math.max(0, pt.life / pt.maxLife);

        if (pt.life <= 0) {
          // If water drop finished falling, create tiny puddle splash
          if (pt.type === 'water') {
            particlesRef.current.push({
              x: pt.x,
              y: pt.y,
              vx: 0,
              vy: 0,
              life: 1.5,
              maxLife: 1.5,
              size: 4 + Math.random() * 2,
              color: '#0284c7',
              alpha: 0.6,
              type: 'splash',
            });
          }
          particlesRef.current.splice(i, 1);
        }
      }

      // Update Popups
      for (let i = popupsRef.current.length - 1; i >= 0; i--) {
        const pop = popupsRef.current[i];
        pop.life -= dt;
        pop.y -= dt * 0.5;
        if (pop.life <= 0) {
          popupsRef.current.splice(i, 1);
        }
      }

      // 2. RENDER STAGE
      // Clear Background
      ctx.fillStyle = '#F1F3F0'; // Soft stone/slate light background
      ctx.fillRect(0, 0, displayWidth, displayHeight);

      // Render Maze Background Container (Geometric Balance white card with #708090 border)
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.roundRect(offsetX - 6, offsetY - 6, level.width * tileSize + 12, level.height * tileSize + 12, 12);
      ctx.fill();

      ctx.strokeStyle = '#708090';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Render Grid Tiles
      for (let y = 0; y < level.height; y++) {
        for (let x = 0; x < level.width; x++) {
          const tile = level.grid[y][x];
          const tx = x * tileSize + offsetX;
          const ty = y * tileSize + offsetY;
          const isDewCollected = collectedDewsRef.current.has(`${x},${y}`);

          renderTile(ctx, tile, tx, ty, tileSize, currentTime, isDewCollected, level.biome);
        }
      }

      // Render Particles (Splashes and trail puddles)
      for (const pt of particlesRef.current) {
        if (pt.type === 'splash') {
          ctx.save();
          ctx.fillStyle = `rgba(0, 191, 255, ${pt.alpha * 0.4})`;
          ctx.beginPath();
          ctx.ellipse(pt.x, pt.y, pt.size, pt.size * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // Render Spring Visual Effects
      const springScreenX = (level.startPos.x + 0.5) * tileSize + offsetX;
      const springScreenY = (level.startPos.y + 0.5) * tileSize + offsetY;
      renderSpringSource(ctx, springScreenX, springScreenY, tileSize, currentTime);

      // Render Village Destination Effects
      const villageScreenX = (level.villagePos.x + 0.5) * tileSize + offsetX;
      const villageScreenY = (level.villagePos.y + 0.5) * tileSize + offsetY;
      renderVillageGoal(ctx, villageScreenX, villageScreenY, tileSize, currentTime);

      // Render Player Character & Bucket
      const p = playerRef.current;
      const playerScreenX = (p.x + 0.5) * tileSize + offsetX;
      const playerScreenY = (p.y + 0.5) * tileSize + offsetY;

      renderPlayer(
        ctx,
        playerScreenX,
        playerScreenY,
        tileSize,
        p.facing,
        p.walkFrame,
        p.isMoving,
        water
      );

      // Render Falling Droplet Particles & Sparkles
      for (const pt of particlesRef.current) {
        if (pt.type !== 'splash') {
          ctx.save();
          ctx.fillStyle = pt.color;
          ctx.globalAlpha = pt.alpha;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // Render Floating Popups
      for (const pop of popupsRef.current) {
        const popScreenX = (pop.x + 0.5) * tileSize + offsetX;
        const popScreenY = (pop.y + 0.5) * tileSize + offsetY;
        ctx.save();
        ctx.font = 'bold 14px Outfit, sans-serif';
        ctx.fillStyle = pop.color;
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0,0,0,0.4)';
        ctx.shadowBlur = 4;
        ctx.globalAlpha = Math.min(1, pop.life / 0.4);
        ctx.fillText(pop.text, popScreenX, popScreenY);
        ctx.restore();
      }

      ctx.restore();
      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [level, isPaused, water, onWin, onLose, activeDirection, onPlayerPosChange, setWater]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full flex items-center justify-center overflow-hidden touch-none p-2"
    >
      <canvas ref={canvasRef} className="block cursor-default shadow-lg rounded-xl" />
    </div>
  );
};

// Helper: Tile Rendering (Geometric Balance Theme)
function renderTile(
  ctx: CanvasRenderingContext2D,
  tile: TileType,
  x: number,
  y: number,
  size: number,
  time: number,
  isDewCollected: boolean,
  biome: 'foothills' | 'rocky_pass' | 'summit'
) {
  if (tile === 0 || tile === 3 || tile === 4) {
    // Crisp White Trail with subtle border
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(x + 1, y + 1, size - 2, size - 2, 2);
    ctx.fill();

    ctx.strokeStyle = '#F1F3F0';
    ctx.lineWidth = 1;
    ctx.stroke();
  } else if (tile === 1) {
    // Rock Crag / Wall (Geometric Slate #708090)
    ctx.fillStyle = '#708090';
    ctx.beginPath();
    ctx.roundRect(x + 1, y + 1, size - 2, size - 2, 3);
    ctx.fill();

    // Geometric facet highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.fillRect(x + 2, y + 2, size - 4, 2);
  } else if (tile === 2) {
    // Geometric Pine Tree (Deep Forest Slate #2F4F4F)
    ctx.fillStyle = '#708090';
    ctx.beginPath();
    ctx.roundRect(x + 1, y + 1, size - 2, size - 2, 3);
    ctx.fill();

    // Clean geometric tree silhouette
    const centerX = x + size * 0.5;
    const bottomY = y + size * 0.85;

    ctx.fillStyle = '#2F4F4F';
    ctx.beginPath();
    ctx.moveTo(centerX, y + size * 0.15);
    ctx.lineTo(centerX + size * 0.32, bottomY);
    ctx.lineTo(centerX - size * 0.32, bottomY);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#3E6B6B';
    ctx.beginPath();
    ctx.moveTo(centerX, y + size * 0.25);
    ctx.lineTo(centerX + size * 0.24, bottomY - size * 0.2);
    ctx.lineTo(centerX - size * 0.24, bottomY - size * 0.2);
    ctx.closePath();
    ctx.fill();
  } else if (tile === 5) {
    // Scree / Rough Terrain (#E2E8F0 with slate specks)
    ctx.fillStyle = '#E2E8F0';
    ctx.beginPath();
    ctx.roundRect(x + 1, y + 1, size - 2, size - 2, 2);
    ctx.fill();

    ctx.fillStyle = '#708090';
    for (let i = 0; i < 4; i++) {
      const rx = x + size * (0.25 + (i * 0.2) % 0.6);
      const ry = y + size * (0.25 + ((i * 3) % 4) * 0.2);
      ctx.fillRect(rx, ry, size * 0.1, size * 0.1);
    }
  } else if (tile === 6) {
    // Dew Spring (+10% Water) - #00BFFF
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(x + 1, y + 1, size - 2, size - 2, 2);
    ctx.fill();

    if (!isDewCollected) {
      const bobY = Math.sin(time * 0.005 + x) * (size * 0.08);
      const dewX = x + size * 0.5;
      const dewY = y + size * 0.5 + bobY;

      ctx.fillStyle = 'rgba(0, 191, 255, 0.25)';
      ctx.beginPath();
      ctx.arc(dewX, dewY, size * 0.35, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#00BFFF';
      ctx.beginPath();
      ctx.arc(dewX, dewY, size * 0.22, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(dewX - size * 0.06, dewY - size * 0.06, size * 0.06, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = 'rgba(0, 191, 255, 0.2)';
      ctx.beginPath();
      ctx.arc(x + size * 0.5, y + size * 0.5, size * 0.16, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (tile === 7) {
    // Wooden Bridge (#8B4513)
    ctx.fillStyle = '#E2E8F0';
    ctx.fillRect(x, y, size, size);

    ctx.fillStyle = '#8B4513';
    for (let p = 0; p < 3; p++) {
      const plankY = y + p * (size / 3) + 1;
      ctx.fillRect(x + 2, plankY, size - 4, size / 3 - 2);
    }
  }
}

// Helper: Spring Source Destination Visuals
function renderSpringSource(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number
) {
  // Geometric #00BFFF Spring
  ctx.fillStyle = '#00BFFF';
  ctx.beginPath();
  ctx.roundRect(x - size * 0.44, y - size * 0.44, size * 0.88, size * 0.88, 4);
  ctx.fill();

  const ripple1 = ((time * 0.002) % 1);
  ctx.strokeStyle = `rgba(255, 255, 255, ${1 - ripple1})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.1 + ripple1 * (size * 0.22), 0, Math.PI * 2);
  ctx.stroke();

  // "SPRING" Label
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 9px Outfit, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('SPRING', x, y + 3);
}

// Helper: Village Goal Visuals
function renderVillageGoal(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  time: number
) {
  // Geometric #2F4F4F Village Goal
  ctx.fillStyle = '#2F4F4F';
  ctx.beginPath();
  ctx.roundRect(x - size * 0.44, y - size * 0.44, size * 0.88, size * 0.88, 4);
  ctx.fill();

  const pulse = Math.sin(time * 0.005) * 2;
  ctx.strokeStyle = '#38A169';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x - size * 0.48 - pulse * 0.5, y - size * 0.48 - pulse * 0.5, size * 0.96 + pulse, size * 0.96 + pulse, 5);
  ctx.stroke();

  // "VILLAGE" Label
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 9px Outfit, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('VILLAGE', x, y + 3);
}

// Helper: Player Character & Leaking Bucket Rendering (Geometric Balance)
function renderPlayer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  facing: 'up' | 'down' | 'left' | 'right',
  walkFrame: number,
  isMoving: boolean,
  waterPercent: number
) {
  ctx.save();
  ctx.translate(x, y);

  // Player Shadow
  ctx.fillStyle = 'rgba(45, 55, 72, 0.25)';
  ctx.beginPath();
  ctx.ellipse(0, size * 0.26, size * 0.22, size * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  const legOffset = isMoving ? walkFrame * (size * 0.1) : 0;

  // Legs / Boots
  ctx.fillStyle = '#2D3748';
  ctx.fillRect(-size * 0.12, size * 0.1 + legOffset, size * 0.08, size * 0.15);
  ctx.fillRect(size * 0.04, size * 0.1 - legOffset, size * 0.08, size * 0.15);

  // Body Parka (Geometric Deep Teal / Forest Slate #2F4F4F)
  ctx.fillStyle = '#2F4F4F';
  ctx.beginPath();
  ctx.roundRect(-size * 0.16, -size * 0.12, size * 0.32, size * 0.26, 4);
  ctx.fill();

  // Head / Knit Beanie
  ctx.fillStyle = '#D97706';
  ctx.beginPath();
  ctx.arc(0, -size * 0.22, size * 0.14, 0, Math.PI * 2);
  ctx.fill();

  // Face
  ctx.fillStyle = '#FED7AA';
  ctx.beginPath();
  ctx.arc(0, -size * 0.18, size * 0.09, 0, Math.PI * 2);
  ctx.fill();

  // ================= BUCKET (#8B4513 with #00BFFF water) =================
  let bucketX = size * 0.18;
  let bucketY = -size * 0.02;

  if (facing === 'left') {
    bucketX = -size * 0.18;
  } else if (facing === 'up') {
    bucketX = size * 0.14;
    bucketY = -size * 0.1;
  }

  const sway = isMoving ? walkFrame * 0.15 : 0;

  ctx.save();
  ctx.translate(bucketX, bucketY);
  ctx.rotate(sway);

  // Bucket Body (#8B4513)
  const bW = size * 0.18;
  const bH = size * 0.2;
  ctx.fillStyle = '#8B4513';
  ctx.beginPath();
  ctx.roundRect(-bW * 0.45, -bH * 0.5, bW * 0.9, bH, 2);
  ctx.fill();

  // Water level inside bucket (#00BFFF)
  if (waterPercent > 0) {
    const waterFillH = (bH * 0.75) * (waterPercent / 100);
    ctx.fillStyle = '#00BFFF';
    ctx.fillRect(-bW * 0.35, (bH * 0.4) - waterFillH, bW * 0.7, waterFillH);
  }

  ctx.restore();
  ctx.restore();
}
