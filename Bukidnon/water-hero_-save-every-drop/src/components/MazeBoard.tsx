import React, { useEffect, useRef, useCallback } from 'react';
import { CellType, Direction, Item, LevelConfig, Particle, Position, Snake } from '../types';
import { soundManager } from '../utils/audio';

interface Props {
  level: LevelConfig;
  grid: CellType[][];
  playerPos: Position;
  tankPos: Position;
  items: Item[];
  snakes: Snake[];
  lives: number;
  waterPoints: number;
  isInvulnerable: boolean;
  onMovePlayer: (newPos: Position) => void;
  onCollectItem: (item: Item) => void;
  onStepDryArea: () => void;
  onHitSnake: () => void;
  onReachTank: () => void;
  onShowMessage: (text: string, type: 'info' | 'warning' | 'success' | 'danger') => void;
}

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  alpha: number;
  vy: number;
  life: number;
}

export const MazeBoard: React.FC<Props> = ({
  level,
  grid,
  playerPos,
  tankPos,
  items,
  snakes,
  waterPoints,
  isInvulnerable,
  onCollectItem,
  onStepDryArea,
  onHitSnake,
  onReachTank,
  onShowMessage,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Smooth interpolated positions for fluid 60fps rendering
  const smoothPlayerRef = useRef<{ x: number; y: number }>({ x: playerPos.x, y: playerPos.y });
  const smoothSnakesRef = useRef<Map<string, { x: number; y: number }>>(new Map());

  // Particles and floating notifications
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const lastDryStepTimeRef = useRef<number>(0);
  const animationFrameIdRef = useRef<number | null>(null);

  // Sync snakes smooth map
  useEffect(() => {
    snakes.forEach(s => {
      if (!smoothSnakesRef.current.has(s.id)) {
        smoothSnakesRef.current.set(s.id, { x: s.x, y: s.y });
      }
    });
  }, [snakes]);

  // Helper to add floating text in canvas world coordinates
  const addFloatingText = useCallback((text: string, gridX: number, gridY: number, color: string) => {
    floatingTextsRef.current.push({
      id: Date.now() + Math.random(),
      text,
      x: gridX + 0.5,
      y: gridY,
      color,
      alpha: 1.0,
      vy: -0.03,
      life: 50,
    });
  }, []);

  // Helper to spawn particle burst
  const spawnParticles = useCallback((gridX: number, gridY: number, color: string, count = 12) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.02 + Math.random() * 0.06;
      particlesRef.current.push({
        id: Math.random(),
        x: gridX + 0.5,
        y: gridY + 0.5,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        size: 3 + Math.random() * 5,
        alpha: 1,
        life: 30 + Math.random() * 20,
        maxLife: 50,
      });
    }
  }, []);

  // Check collision with items and dry areas whenever player moves
  useEffect(() => {
    // 1. Items check
    items.forEach(item => {
      if (!item.collected && item.x === playerPos.x && item.y === playerPos.y) {
        if (item.type === 'CLEAN_WATER') {
          spawnParticles(item.x, item.y, '#38bdf8', 16);
          addFloatingText('+1 Clean Water!', item.x, item.y, '#38bdf8');
          soundManager.playDropPickup();
          onCollectItem(item);
        } else if (item.type === 'CONTAMINATED_WATER') {
          spawnParticles(item.x, item.y, '#a855f7', 16);
          addFloatingText('-1 Water (Polluted!)', item.x, item.y, '#c084fc');
          soundManager.playContaminatedPickup();
          onCollectItem(item);
        } else if (item.type === 'HEART') {
          spawnParticles(item.x, item.y, '#f43f5e', 20);
          addFloatingText('+1 Life!', item.x, item.y, '#fb7185');
          soundManager.playHeartPickup();
          onCollectItem(item);
        } else if (item.type === 'COMMUNITY_TANK') {
          if (waterPoints >= level.requiredWater) {
            spawnParticles(item.x, item.y, '#10b981', 30);
            soundManager.playTankDeliver();
            onReachTank();
          } else {
            const needed = level.requiredWater - waterPoints;
            addFloatingText(`Need ${needed} more drops!`, item.x, item.y, '#f59e0b');
            onShowMessage(`Community tank is thirsty! Collect ${needed} more drops to fill it.`, 'warning');
          }
        }
      }
    });

    // 2. Dry Area Check
    const currentCell = grid[playerPos.y]?.[playerPos.x];
    if (currentCell === 'DRY_AREA') {
      const now = Date.now();
      if (now - lastDryStepTimeRef.current > 600) {
        lastDryStepTimeRef.current = now;
        spawnParticles(playerPos.x, playerPos.y, '#d97706', 10);
        addFloatingText('-1 Water (Drought!)', playerPos.x, playerPos.y, '#f59e0b');
        soundManager.playDryAreaSizzle();
        onStepDryArea();
      }
    }
  }, [playerPos, items, grid, level.requiredWater, waterPoints, onCollectItem, onStepDryArea, onReachTank, onShowMessage, spawnParticles, addFloatingText]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animTime = 0;

    const render = () => {
      animTime += 0.04;
      const width = canvas.width;
      const height = canvas.height;
      const cols = grid[0]?.length || 1;
      const rows = grid.length || 1;

      // Calculate square cell size to fit cleanly inside canvas
      const cellSize = Math.min(width / cols, height / rows);
      const offsetX = (width - cols * cellSize) / 2;
      const offsetY = (height - rows * cellSize) / 2;

      // Clear Canvas with Warm Yellow Base
      ctx.fillStyle = '#fef9c3'; // warm sunny cream yellow-100
      ctx.fillRect(0, 0, width, height);

      // Draw subtle background pattern
      ctx.fillStyle = 'rgba(146, 64, 14, 0.06)';
      for (let x = 0; x < width; x += 24) {
        for (let y = 0; y < height; y += 24) {
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 1. Draw Maze Cells and Outside Community Grounds
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const cell = grid[r][c];
          const px = offsetX + c * cellSize;
          const py = offsetY + r * cellSize;
          const isPerimeter = r === 0 || r === rows - 1 || c === 0 || c === cols - 1;
          const isExitGate = c === tankPos.x && r === tankPos.y;
          const isEntranceGate = c === 0 && r === 1;

          if (isEntranceGate) {
            // OUTSIDE ENTRANCE ZONE: Hero's Starting Base camp outside the labyrinth
            ctx.fillStyle = '#bae6fd'; // sky-200 water spring oasis
            ctx.fillRect(px, py, cellSize, cellSize);

            // Water Hero Start Marker Banner / Flag
            ctx.fillStyle = '#0284c7';
            ctx.fillRect(px + cellSize - 4, py, 4, cellSize);
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(px + cellSize * 0.5, py + cellSize * 0.5, cellSize * 0.35, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#0369a1';
            ctx.font = `bold ${Math.max(7, Math.floor(cellSize * 0.16))}px Fredoka, sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('START', px + cellSize * 0.5, py + cellSize * 0.5);
          } else if (isExitGate) {
            // OUTSIDE EXIT ZONE: Green Lush Village Grounds around the Community Tank (Matching photo layout)
            ctx.fillStyle = '#bbf7d0'; // lush green meadow (emerald-200)
            ctx.fillRect(px, py, cellSize, cellSize);

            // Village grass tufts and flowers
            ctx.fillStyle = '#22c55e';
            ctx.fillRect(px + cellSize * 0.15, py + cellSize * 0.7, 3, 4);
            ctx.fillRect(px + cellSize * 0.75, py + cellSize * 0.25, 3, 4);
            ctx.fillStyle = '#eab308'; // Little daisy flowers
            ctx.beginPath();
            ctx.arc(px + cellSize * 0.2, py + cellSize * 0.3, 2, 0, Math.PI * 2);
            ctx.arc(px + cellSize * 0.8, py + cellSize * 0.75, 2, 0, Math.PI * 2);
            ctx.fill();

            // Exit Gate Stone Archway Posts
            ctx.fillStyle = '#64748b';
            ctx.fillRect(px, py, 4, cellSize);
            ctx.fillStyle = '#334155';
            ctx.fillRect(px + 1, py + 2, 2, cellSize - 4);
          } else if (cell === 'WALL') {
            // Stylized 3D Sandstone & Fortress Wall (Fortified Outer Perimeter)
            const wallBaseColor = isPerimeter ? '#713f12' : '#854d0e';
            const wallTopHighlight = isPerimeter ? '#854d0e' : '#a16207';
            const wallShadow = isPerimeter ? '#451a03' : '#542a04';

            ctx.fillStyle = wallBaseColor;
            ctx.fillRect(px, py, cellSize, cellSize);

            // Wall Bevel Top & Left (highlight)
            ctx.fillStyle = wallTopHighlight;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(px + cellSize, py);
            ctx.lineTo(px + cellSize - 3, py + 3);
            ctx.lineTo(px + 3, py + 3);
            ctx.lineTo(px + 3, py + cellSize - 3);
            ctx.lineTo(px, py + cellSize);
            ctx.closePath();
            ctx.fill();

            // Wall Bevel Bottom & Right (shadow)
            ctx.fillStyle = wallShadow;
            ctx.beginPath();
            ctx.moveTo(px + cellSize, py);
            ctx.lineTo(px + cellSize, py + cellSize);
            ctx.lineTo(px, py + cellSize);
            ctx.lineTo(px + 3, py + cellSize - 3);
            ctx.lineTo(px + cellSize - 3, py + cellSize - 3);
            ctx.lineTo(px + cellSize - 3, py + 3);
            ctx.closePath();
            ctx.fill();

            // Inner Wall Face
            ctx.fillStyle = wallBaseColor;
            ctx.fillRect(px + 3, py + 3, cellSize - 6, cellSize - 6);

            // Fortress stone rivets / brick accents on perimeter walls
            if (isPerimeter) {
              ctx.fillStyle = '#451a03';
              ctx.fillRect(px + 4, py + 4, cellSize - 8, 2);
              ctx.fillRect(px + 4, py + cellSize - 6, cellSize - 8, 2);
              // Stone fortress rivets
              ctx.fillStyle = '#ca8a04';
              ctx.beginPath();
              ctx.arc(px + 6, py + 6, 1.5, 0, Math.PI * 2);
              ctx.arc(px + cellSize - 6, py + 6, 1.5, 0, Math.PI * 2);
              ctx.arc(px + 6, py + cellSize - 6, 1.5, 0, Math.PI * 2);
              ctx.arc(px + cellSize - 6, py + cellSize - 6, 1.5, 0, Math.PI * 2);
              ctx.fill();
            } else {
              ctx.fillStyle = '#713f12';
              ctx.fillRect(px + 6, py + 6, cellSize - 12, 2);
              ctx.fillRect(px + 6, py + cellSize - 8, cellSize - 12, 2);
            }
          } else if (cell === 'DRY_AREA') {
            // Cracked Earth / Drought Hazard Ground (Vibrant Orange Sand)
            ctx.fillStyle = '#fed7aa'; // orange-200
            ctx.fillRect(px, py, cellSize, cellSize);

            ctx.fillStyle = '#fdba74'; // orange-300
            ctx.fillRect(px + 1, py + 1, cellSize - 2, cellSize - 2);

            // Cracked soil veins
            ctx.strokeStyle = '#c2410c';
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(px + cellSize * 0.2, py + cellSize * 0.15);
            ctx.lineTo(px + cellSize * 0.5, py + cellSize * 0.5);
            ctx.lineTo(px + cellSize * 0.8, py + cellSize * 0.35);
            ctx.moveTo(px + cellSize * 0.5, py + cellSize * 0.5);
            ctx.lineTo(px + cellSize * 0.4, py + cellSize * 0.85);
            ctx.stroke();

            // Heat shimmer steam ripples
            const steamOffset = Math.sin(animTime * 3 + c + r) * 2;
            ctx.strokeStyle = 'rgba(234, 88, 12, 0.5)';
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.moveTo(px + cellSize * 0.3, py + cellSize * 0.8 + steamOffset);
            ctx.lineTo(px + cellSize * 0.3, py + cellSize * 0.5 + steamOffset);
            ctx.moveTo(px + cellSize * 0.7, py + cellSize * 0.7 - steamOffset);
            ctx.lineTo(px + cellSize * 0.7, py + cellSize * 0.4 - steamOffset);
            ctx.stroke();
          } else {
            // Open fertile Sunny Pathway (yellow-50 / cream)
            ctx.fillStyle = '#fefce8';
            ctx.fillRect(px, py, cellSize, cellSize);

            // Subtle path stone dots
            ctx.fillStyle = '#fef08a';
            ctx.fillRect(px + 1, py + 1, cellSize - 2, cellSize - 2);

            ctx.fillStyle = '#fde047';
            ctx.fillRect(px + cellSize * 0.3, py + cellSize * 0.3, 2, 2);
            ctx.fillRect(px + cellSize * 0.7, py + cellSize * 0.7, 2, 2);
          }
        }
      }

      // 2. Draw Items on Path
      items.forEach(item => {
        if (item.collected) return;
        const ix = offsetX + (item.x + 0.5) * cellSize;
        const iy = offsetY + (item.y + 0.5) * cellSize;
        const bob = Math.sin(animTime * 4 + item.x * 2 + item.y * 3) * (cellSize * 0.08);

        if (item.type === 'CLEAN_WATER') {
          // Cartoon Clean Water Droplet
          const r = cellSize * 0.32;
          ctx.save();
          ctx.translate(ix, iy + bob);

          // Droplet Shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
          ctx.beginPath();
          ctx.ellipse(0, cellSize * 0.35, r * 0.8, r * 0.3, 0, 0, Math.PI * 2);
          ctx.fill();

          // Droplet Body
          const grad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, 0, 0, 0, r);
          grad.addColorStop(0, '#bae6fd');
          grad.addColorStop(0.5, '#38bdf8');
          grad.addColorStop(1, '#0284c7');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(0, -r * 1.2);
          ctx.bezierCurveTo(r * 1.1, -r * 0.2, r * 1.1, r * 0.9, 0, r * 0.9);
          ctx.bezierCurveTo(-r * 1.1, r * 0.9, -r * 1.1, -r * 0.2, 0, -r * 1.2);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#0369a1';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Glossy Sparkle Highlight
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.ellipse(-r * 0.3, -r * 0.2, r * 0.25, r * 0.12, -Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        } else if (item.type === 'CONTAMINATED_WATER') {
          // Toxic Bubbling Sludge Droplet
          const r = cellSize * 0.32;
          ctx.save();
          ctx.translate(ix, iy + bob);

          // Shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.beginPath();
          ctx.ellipse(0, cellSize * 0.35, r * 0.8, r * 0.3, 0, 0, Math.PI * 2);
          ctx.fill();

          // Toxic Body
          const grad = ctx.createRadialGradient(-r * 0.2, -r * 0.2, 0, 0, 0, r);
          grad.addColorStop(0, '#d8b4fe');
          grad.addColorStop(0.4, '#a855f7');
          grad.addColorStop(1, '#581c87');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(0, -r * 1.1);
          ctx.bezierCurveTo(r * 1.2, -r * 0.2, r * 1.0, r * 1.0, 0, r * 0.9);
          ctx.bezierCurveTo(-r * 1.0, r * 1.0, -r * 1.2, -r * 0.2, 0, -r * 1.1);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#3b0764';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Toxic Bubbles
          ctx.fillStyle = '#4ade80';
          ctx.beginPath();
          ctx.arc(r * 0.3, r * 0.1, r * 0.18, 0, Math.PI * 2);
          ctx.arc(-r * 0.2, r * 0.3, r * 0.14, 0, Math.PI * 2);
          ctx.fill();

          // Warning Cross / Skull Marker
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(-r * 0.2, -r * 0.3);
          ctx.lineTo(r * 0.2, -r * 0.3);
          ctx.moveTo(0, -r * 0.5);
          ctx.lineTo(0, -r * 0.1);
          ctx.stroke();

          ctx.restore();
        } else if (item.type === 'HEART') {
          // Cartoon Heart
          const r = cellSize * 0.3;
          const beat = Math.sin(animTime * 6) * 0.12 + 1.0;
          ctx.save();
          ctx.translate(ix, iy);
          ctx.scale(beat, beat);

          // Glow
          ctx.fillStyle = 'rgba(244, 63, 94, 0.3)';
          ctx.beginPath();
          ctx.arc(0, 0, r * 1.4, 0, Math.PI * 2);
          ctx.fill();

          // Heart Shape
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.moveTo(0, r * 0.6);
          ctx.bezierCurveTo(-r * 1.2, -r * 0.2, -r * 1.0, -r * 1.0, 0, -r * 0.4);
          ctx.bezierCurveTo(r * 1.0, -r * 1.0, r * 1.2, -r * 0.2, 0, r * 0.6);
          ctx.fill();

          ctx.strokeStyle = '#be123c';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          // Heart Shine
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.beginPath();
          ctx.ellipse(-r * 0.35, -r * 0.4, r * 0.2, r * 0.1, -Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      });

      // 3. Draw Community Tank (Final Destination & Water Reservation)
      {
        const tx = offsetX + (tankPos.x + 0.5) * cellSize;
        const ty = offsetY + (tankPos.y + 0.5) * cellSize;
        const isReady = waterPoints >= level.requiredWater;
        const fillPct = Math.min(1, waterPoints / level.requiredWater);

        ctx.save();
        ctx.translate(tx, ty);

        // Ground Reservation Platform Glow
        if (isReady) {
          ctx.fillStyle = 'rgba(16, 185, 129, 0.45)';
          ctx.beginPath();
          ctx.arc(0, 0, cellSize * 0.75, 0, Math.PI * 2);
          ctx.fill();

          // Pulsing delivery beacon ring
          const beaconSize = cellSize * (0.65 + Math.sin(animTime * 6) * 0.15);
          ctx.strokeStyle = 'rgba(52, 211, 153, 0.7)';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.arc(0, 0, beaconSize, 0, Math.PI * 2);
          ctx.stroke();

          // Fountain water splash sparkles around tank
          for (let sp = 0; sp < 4; sp++) {
            const spAngle = animTime * 4 + (sp * Math.PI) / 2;
            const spDist = cellSize * 0.45;
            const spX = Math.cos(spAngle) * spDist;
            const spY = Math.sin(spAngle) * spDist - cellSize * 0.2;
            ctx.fillStyle = '#67e8f9';
            ctx.beginPath();
            ctx.arc(spX, spY, 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // Thirsty village distress aura when tank is empty
          ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
          ctx.beginPath();
          ctx.arc(0, 0, cellSize * 0.65, 0, Math.PI * 2);
          ctx.fill();
        }

        // Tank Wooden / Steel Base Legs
        ctx.fillStyle = '#5c2b09';
        ctx.fillRect(-cellSize * 0.38, cellSize * 0.22, cellSize * 0.16, cellSize * 0.26);
        ctx.fillRect(cellSize * 0.22, cellSize * 0.22, cellSize * 0.16, cellSize * 0.26);

        // Cross brace supports
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(-cellSize * 0.3, cellSize * 0.25);
        ctx.lineTo(cellSize * 0.3, cellSize * 0.45);
        ctx.moveTo(cellSize * 0.3, cellSize * 0.25);
        ctx.lineTo(-cellSize * 0.3, cellSize * 0.45);
        ctx.stroke();

        // Main Tank Reservoir Body (Rusty Steel Tank when dry, vibrant blue when filled)
        const tankW = cellSize * 0.86;
        const tankH = cellSize * 0.72;
        const grad = ctx.createLinearGradient(-tankW / 2, 0, tankW / 2, 0);
        if (fillPct === 0) {
          // Dry / Parched Tank Exterior
          grad.addColorStop(0, '#78350f');
          grad.addColorStop(0.3, '#92400e');
          grad.addColorStop(0.7, '#b45309');
          grad.addColorStop(1, '#451a03');
        } else {
          grad.addColorStop(0, '#0369a1');
          grad.addColorStop(0.3, '#38bdf8');
          grad.addColorStop(0.7, '#0ea5e9');
          grad.addColorStop(1, '#0c4a6e');
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(-tankW / 2, -tankH / 2, tankW, tankH, 7);
        ctx.fill();
        ctx.strokeStyle = isReady ? '#34d399' : fillPct === 0 ? '#ef4444' : '#0369a1';
        ctx.lineWidth = isReady ? 3 : 1.8;
        ctx.stroke();

        // Iron reinforcement bands around tank
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-tankW / 2, -tankH * 0.32, tankW, 2.5);
        ctx.fillRect(-tankW / 2, tankH * 0.2, tankW, 2.5);

        // Water Reservation Glass Gauge Window
        const winW = tankW * 0.68;
        const winH = tankH * 0.52;
        const winX = -winW / 2;
        const winY = -winH / 2 + 1;

        // Dark tank interior (Shows empty dust/cracks if 0%)
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.roundRect(winX, winY, winW, winH, 4);
        ctx.fill();

        // If tank is 0% empty, draw dry rust / thirsty empty indicator
        if (fillPct === 0) {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.25)';
          ctx.fillRect(winX + 2, winY + 2, winW - 4, winH - 4);
          
          // Thirsty cross / empty marker
          ctx.fillStyle = '#ef4444';
          ctx.font = `bold ${Math.max(9, Math.floor(cellSize * 0.16))}px Fredoka, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('0% DRY', 0, winY + winH * 0.5);
        }

        // Water Reservation level rising in tank as hero gathers water drops
        const curWaterH = winH * fillPct;
        if (curWaterH > 0) {
          const waterGrad = ctx.createLinearGradient(0, winY + winH - curWaterH, 0, winY + winH);
          waterGrad.addColorStop(0, '#7dd3fc');
          waterGrad.addColorStop(1, '#0284c7');

          ctx.save();
          ctx.beginPath();
          ctx.roundRect(winX, winY, winW, winH, 4);
          ctx.clip();

          // Animated water waves
          ctx.fillStyle = waterGrad;
          ctx.beginPath();
          const waveY = winY + winH - curWaterH;
          ctx.moveTo(winX, winY + winH);
          ctx.lineTo(winX, waveY);
          for (let wx = 0; wx <= winW; wx += 4) {
            const wy = waveY + Math.sin(animTime * 6 + (wx / winW) * Math.PI * 4) * 2;
            ctx.lineTo(winX + wx, wy);
          }
          ctx.lineTo(winX + winW, winY + winH);
          ctx.closePath();
          ctx.fill();

          // Glass reflection gleam
          ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
          ctx.fillRect(winX + 2, winY + 2, 3, winH - 4);

          ctx.restore();
        }

        // Reservation Gauge Tick Marks
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        for (let t = 1; t <= 3; t++) {
          const ty = winY + (winH * t) / 4;
          ctx.beginPath();
          ctx.moveTo(winX + winW - 5, ty);
          ctx.lineTo(winX + winW - 1, ty);
          ctx.stroke();
        }

        // Tank Tap / Pipe Outflow
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(tankW / 2 - 1, 0, cellSize * 0.14, cellSize * 0.1);
        ctx.fillRect(tankW / 2 + cellSize * 0.09, 0, cellSize * 0.05, cellSize * 0.18);

        // Community Village Backdrop (Cottages, Waiting Villagers who need water!)
        // 1. Village House / Community Shelter on the edge
        ctx.save();
        ctx.fillStyle = '#92400e'; // Cottage wall
        ctx.fillRect(-cellSize * 0.48, -cellSize * 0.45, cellSize * 0.22, cellSize * 0.24);
        ctx.fillStyle = '#dc2626'; // Red cottage roof
        ctx.beginPath();
        ctx.moveTo(-cellSize * 0.52, -cellSize * 0.45);
        ctx.lineTo(-cellSize * 0.37, -cellSize * 0.62);
        ctx.lineTo(-cellSize * 0.22, -cellSize * 0.45);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#fbbf24'; // Warm lit window
        ctx.fillRect(-cellSize * 0.43, -cellSize * 0.38, cellSize * 0.08, cellSize * 0.08);

        // 2. Waiting Villagers (Community people holding water buckets!)
        // Villager 1 (Left of tank)
        const cheerBounce = isReady ? Math.sin(animTime * 10) * 3 : 0;
        ctx.fillStyle = '#f59e0b'; // Villager dress
        ctx.beginPath();
        ctx.roundRect(-cellSize * 0.38, -cellSize * 0.12 - cheerBounce, cellSize * 0.14, cellSize * 0.2, 3);
        ctx.fill();
        ctx.fillStyle = '#fed7aa'; // Villager face
        ctx.beginPath();
        ctx.arc(-cellSize * 0.31, -cellSize * 0.18 - cheerBounce, cellSize * 0.07, 0, Math.PI * 2);
        ctx.fill();
        // Villager bucket
        ctx.fillStyle = '#64748b';
        ctx.fillRect(-cellSize * 0.45, -cellSize * 0.05 - cheerBounce, cellSize * 0.08, cellSize * 0.1);

        // Villager 2 (Right of tank)
        const cheerBounce2 = isReady ? Math.sin(animTime * 10 + Math.PI) * 3 : 0;
        ctx.fillStyle = '#3b82f6'; // Villager shirt
        ctx.beginPath();
        ctx.roundRect(cellSize * 0.24, -cellSize * 0.12 - cheerBounce2, cellSize * 0.14, cellSize * 0.2, 3);
        ctx.fill();
        ctx.fillStyle = '#fed7aa'; // Villager face
        ctx.beginPath();
        ctx.arc(cellSize * 0.31, -cellSize * 0.18 - cheerBounce2, cellSize * 0.07, 0, Math.PI * 2);
        ctx.fill();
        // Villager cheer hands when full
        if (isReady) {
          ctx.strokeStyle = '#fed7aa';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(cellSize * 0.26, -cellSize * 0.1 - cheerBounce2);
          ctx.lineTo(cellSize * 0.22, -cellSize * 0.24 - cheerBounce2);
          ctx.moveTo(cellSize * 0.36, -cellSize * 0.1 - cheerBounce2);
          ctx.lineTo(cellSize * 0.40, -cellSize * 0.24 - cheerBounce2);
          ctx.stroke();
        }
        ctx.restore();

        // "COMMUNITY TANK" wooden signpost banner
        ctx.save();
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-cellSize * 0.38, -tankH * 0.54, cellSize * 0.76, cellSize * 0.18);
        ctx.fillStyle = '#fef08a';
        ctx.font = `bold ${Math.max(8, Math.floor(cellSize * 0.14))}px Fredoka, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('COMMUNITY', 0, -tankH * 0.45);
        ctx.restore();

        // Community Tank Badge & Text
        if (isReady) {
          // Animated Star Badge for Ready State
          const starScale = 1.0 + Math.sin(animTime * 8) * 0.15;
          ctx.save();
          ctx.translate(0, -tankH * 0.76);
          ctx.scale(starScale, starScale);
          ctx.fillStyle = '#fbbf24';
          ctx.font = `bold ${Math.floor(cellSize * 0.38)}px Fredoka, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('⭐', 0, 0);
          ctx.restore();

          // "DELIVER!" prompt
          ctx.fillStyle = '#34d399';
          ctx.font = `bold ${Math.max(10, Math.floor(cellSize * 0.22))}px Fredoka, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 3;
          ctx.fillText('DELIVER!', 0, 0);
        } else if (fillPct === 0) {
          // Empty tank calling for help
          ctx.fillStyle = '#fca5a5';
          ctx.font = `bold ${Math.max(9, Math.floor(cellSize * 0.18))}px Fredoka, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 3;
          ctx.fillText(`NEEDS ${level.requiredWater}💧`, 0, 0);
        } else {
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${Math.max(10, Math.floor(cellSize * 0.2))}px Fredoka, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 3;
          ctx.fillText(`${waterPoints}/${level.requiredWater}`, 0, 0);
        }

        ctx.restore();
      }

      // 4. Draw Snakes (Animated Slithering Hazards)
      snakes.forEach(snake => {
        // Interpolate smooth movement
        const currentSmooth = smoothSnakesRef.current.get(snake.id) || { x: snake.x, y: snake.y };
        currentSmooth.x += (snake.x - currentSmooth.x) * 0.18;
        currentSmooth.y += (snake.y - currentSmooth.y) * 0.18;
        smoothSnakesRef.current.set(snake.id, currentSmooth);

        const sx = offsetX + (currentSmooth.x + 0.5) * cellSize;
        const sy = offsetY + (currentSmooth.y + 0.5) * cellSize;
        const wiggle = Math.sin(animTime * 6 + snake.animOffset) * (cellSize * 0.1);

        ctx.save();
        ctx.translate(sx, sy);

        // Snake shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(0, cellSize * 0.25, cellSize * 0.35, cellSize * 0.15, 0, 0, Math.PI * 2);
        ctx.fill();

        // Snake segments (curved body)
        const bodyRadius = cellSize * 0.22;
        const segments = 4;
        for (let i = segments; i >= 0; i--) {
          const segOffset = i * (cellSize * 0.1);
          const segWiggle = Math.sin(animTime * 6 + snake.animOffset + i * 0.8) * (cellSize * 0.08);

          let segX = 0;
          let segY = 0;
          if (snake.dir === 'LEFT') segX = segOffset;
          else if (snake.dir === 'RIGHT') segX = -segOffset;
          else if (snake.dir === 'UP') segY = segOffset;
          else segY = -segOffset;

          // Color gradient for snake body
          ctx.fillStyle = i % 2 === 0 ? '#15803d' : '#84cc16';
          ctx.beginPath();
          ctx.arc(segX + (snake.dir === 'UP' || snake.dir === 'DOWN' ? segWiggle : 0),
                  segY + (snake.dir === 'LEFT' || snake.dir === 'RIGHT' ? segWiggle : 0),
                  bodyRadius * (1 - i * 0.12), 0, Math.PI * 2);
          ctx.fill();
        }

        // Snake Head
        ctx.fillStyle = '#16a34a';
        ctx.beginPath();
        ctx.arc(0, 0, bodyRadius * 1.1, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#14532d';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Eyes
        const eyeAngle = snake.dir === 'LEFT' ? Math.PI : snake.dir === 'RIGHT' ? 0 : snake.dir === 'UP' ? -Math.PI / 2 : Math.PI / 2;
        const ex1 = Math.cos(eyeAngle - 0.5) * (bodyRadius * 0.6);
        const ey1 = Math.sin(eyeAngle - 0.5) * (bodyRadius * 0.6);
        const ex2 = Math.cos(eyeAngle + 0.5) * (bodyRadius * 0.6);
        const ey2 = Math.sin(eyeAngle + 0.5) * (bodyRadius * 0.6);

        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(ex1, ey1, bodyRadius * 0.35, 0, Math.PI * 2);
        ctx.arc(ex2, ey2, bodyRadius * 0.35, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(ex1, ey1, bodyRadius * 0.18, 0, Math.PI * 2);
        ctx.arc(ex2, ey2, bodyRadius * 0.18, 0, Math.PI * 2);
        ctx.fill();

        // Flickering red tongue
        if (Math.sin(animTime * 8 + snake.animOffset) > 0.3) {
          const tx = Math.cos(eyeAngle) * (bodyRadius * 1.5);
          const ty = Math.sin(eyeAngle) * (bodyRadius * 1.5);
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(Math.cos(eyeAngle) * bodyRadius, Math.sin(eyeAngle) * bodyRadius);
          ctx.lineTo(tx, ty);
          ctx.lineTo(tx + Math.cos(eyeAngle + 0.5) * 4, ty + Math.sin(eyeAngle + 0.5) * 4);
          ctx.moveTo(tx, ty);
          ctx.lineTo(tx + Math.cos(eyeAngle - 0.5) * 4, ty + Math.sin(eyeAngle - 0.5) * 4);
          ctx.stroke();
        }

        ctx.restore();
      });

      // 5. Draw Player (Water Hero Holding a Plastic Bottle)
      {
        // Smoothly interpolate player coordinates for silky movement
        smoothPlayerRef.current.x += (playerPos.x - smoothPlayerRef.current.x) * 0.24;
        smoothPlayerRef.current.y += (playerPos.y - smoothPlayerRef.current.y) * 0.24;

        const hx = offsetX + (smoothPlayerRef.current.x + 0.5) * cellSize;
        const hy = offsetY + (smoothPlayerRef.current.y + 0.5) * cellSize;
        const heroSize = cellSize * 0.88;
        const bottleFillPct = Math.min(1, waterPoints / level.requiredWater);

        // Invulnerability blinking
        const shouldDraw = !isInvulnerable || Math.floor(animTime * 15) % 2 === 0;

        if (shouldDraw) {
          ctx.save();
          ctx.translate(hx, hy);

          // Hero Ground Shadow
          ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
          ctx.beginPath();
          ctx.ellipse(0, heroSize * 0.42, heroSize * 0.38, heroSize * 0.16, 0, 0, Math.PI * 2);
          ctx.fill();

          // Backpack Water Pack on hero back
          ctx.fillStyle = '#334155';
          ctx.beginPath();
          ctx.roundRect(-heroSize * 0.44, -heroSize * 0.22, heroSize * 0.2, heroSize * 0.44, 4);
          ctx.fill();
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.roundRect(-heroSize * 0.42, -heroSize * 0.08, heroSize * 0.16, heroSize * 0.26, 2);
          ctx.fill();

          // Boots (walking bobbing animation)
          const walkBob = Math.sin(animTime * 10) * (heroSize * 0.04);
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.ellipse(-heroSize * 0.18, heroSize * 0.38 + walkBob, heroSize * 0.12, heroSize * 0.08, 0, 0, Math.PI * 2);
          ctx.ellipse(heroSize * 0.18, heroSize * 0.38 - walkBob, heroSize * 0.12, heroSize * 0.08, 0, 0, Math.PI * 2);
          ctx.fill();

          // Water Droplet Hero Body
          const grad = ctx.createRadialGradient(-heroSize * 0.1, -heroSize * 0.1, 0, 0, 0, heroSize * 0.45);
          grad.addColorStop(0, '#7dd3fc');
          grad.addColorStop(0.5, '#38bdf8');
          grad.addColorStop(1, '#0284c7');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(0, -heroSize * 0.45);
          ctx.bezierCurveTo(heroSize * 0.45, -heroSize * 0.1, heroSize * 0.45, heroSize * 0.4, 0, heroSize * 0.4);
          ctx.bezierCurveTo(-heroSize * 0.45, heroSize * 0.4, -heroSize * 0.45, -heroSize * 0.1, 0, -heroSize * 0.45);
          ctx.closePath();
          ctx.fill();
          ctx.strokeStyle = '#0369a1';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Highlight body shine
          ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
          ctx.beginPath();
          ctx.ellipse(-heroSize * 0.18, -heroSize * 0.15, heroSize * 0.12, heroSize * 0.06, -Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();

          // Goggles Headband
          ctx.strokeStyle = '#047857';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(-heroSize * 0.32, -heroSize * 0.05);
          ctx.lineTo(heroSize * 0.32, -heroSize * 0.05);
          ctx.stroke();

          // Goggle Lenses
          ctx.fillStyle = '#ecfdf5';
          ctx.strokeStyle = '#047857';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(-heroSize * 0.12, -heroSize * 0.05, heroSize * 0.14, 0, Math.PI * 2);
          ctx.arc(heroSize * 0.12, -heroSize * 0.05, heroSize * 0.14, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Eyes
          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(-heroSize * 0.11, -heroSize * 0.05, heroSize * 0.06, 0, Math.PI * 2);
          ctx.arc(heroSize * 0.13, -heroSize * 0.05, heroSize * 0.06, 0, Math.PI * 2);
          ctx.fill();

          // Eye glint
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(-heroSize * 0.09, -heroSize * 0.07, heroSize * 0.025, 0, Math.PI * 2);
          ctx.arc(heroSize * 0.15, -heroSize * 0.07, heroSize * 0.025, 0, Math.PI * 2);
          ctx.fill();

          // Smile
          ctx.strokeStyle = '#0c4a6e';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(0, heroSize * 0.12, heroSize * 0.1, 0.2, Math.PI - 0.2);
          ctx.stroke();

          // --- PLASTIC WATER BOTTLE HELD IN PLAYER'S HANDS ---
          const bottleSway = Math.sin(animTime * 8) * (heroSize * 0.03);
          const bX = heroSize * 0.24;
          const bY = heroSize * 0.04 + bottleSway;
          const bW = heroSize * 0.26;
          const bH = heroSize * 0.44;

          ctx.save();
          ctx.translate(bX, bY);

          // Plastic Bottle Outer Body (Translucent Plastic Bottle)
          ctx.fillStyle = 'rgba(240, 249, 255, 0.75)';
          ctx.beginPath();
          ctx.roundRect(-bW / 2, -bH / 2, bW, bH, 5);
          ctx.fill();
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 1.6;
          ctx.stroke();

          // Blue Screw Cap on Bottle
          ctx.fillStyle = '#0284c7';
          ctx.beginPath();
          ctx.roundRect(-bW * 0.35, -bH / 2 - bH * 0.2, bW * 0.7, bH * 0.2, 2);
          ctx.fill();
          ctx.strokeStyle = '#0369a1';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Cap Carry Handle Loop
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(0, -bH / 2 - bH * 0.22, bW * 0.22, Math.PI, 0);
          ctx.stroke();

          // Water Level inside Plastic Bottle
          const curBH = (bH - 4) * bottleFillPct;
          if (curBH > 0) {
            ctx.save();
            ctx.beginPath();
            ctx.roundRect(-bW / 2 + 1.5, -bH / 2 + 1.5, bW - 3, bH - 3, 4);
            ctx.clip();

            const bWaterGrad = ctx.createLinearGradient(0, bH / 2 - curBH, 0, bH / 2);
            bWaterGrad.addColorStop(0, '#38bdf8');
            bWaterGrad.addColorStop(1, '#0284c7');

            ctx.fillStyle = bWaterGrad;
            ctx.beginPath();
            const bWaveY = bH / 2 - curBH;
            ctx.moveTo(-bW / 2, bH / 2);
            ctx.lineTo(-bW / 2, bWaveY);
            for (let wx = 0; wx <= bW; wx += 2) {
              const wy = bWaveY + Math.sin(animTime * 8 + (wx / bW) * Math.PI * 3) * 1.5;
              ctx.lineTo(-bW / 2 + wx, wy);
            }
            ctx.lineTo(bW / 2, bH / 2);
            ctx.closePath();
            ctx.fill();

            // Rising water bubbles in bottle
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            const bBubbleY = (animTime * 15) % curBH;
            ctx.beginPath();
            ctx.arc(bW * 0.1, bH / 2 - bBubbleY, 1.2, 0, Math.PI * 2);
            ctx.arc(-bW * 0.15, bH / 2 - ((bBubbleY + curBH * 0.5) % curBH), 1, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
          }

          // Plastic Bottle Side Measurement Tick Marks
          ctx.strokeStyle = 'rgba(2, 132, 199, 0.5)';
          ctx.lineWidth = 1;
          for (let tm = 1; tm <= 3; tm++) {
            const tmy = bH / 2 - (bH * tm) / 4;
            ctx.beginPath();
            ctx.moveTo(-bW / 2 + 2, tmy);
            ctx.lineTo(-bW / 2 + 5, tmy);
            ctx.stroke();
          }

          // Plastic Gleam / Specular Highlight
          ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
          ctx.fillRect(bW * 0.15, -bH / 2 + 3, 2, bH - 6);

          ctx.restore();

          // Hero Hands Gripping the Plastic Bottle
          ctx.fillStyle = '#67e8f9';
          ctx.strokeStyle = '#0284c7';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(heroSize * 0.14, heroSize * 0.08 + bottleSway, heroSize * 0.08, 0, Math.PI * 2);
          ctx.arc(heroSize * 0.35, heroSize * 0.12 + bottleSway, heroSize * 0.08, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Water sparkle trail from bottle if carrying water
          if (bottleFillPct > 0 && Math.sin(animTime * 6) > 0.4) {
            ctx.fillStyle = '#38bdf8';
            ctx.beginPath();
            ctx.arc(heroSize * 0.38, heroSize * 0.02, 1.8, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        }
      }

      // 6. Draw Particles
      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 1;
        p.alpha = Math.max(0, p.life / p.maxLife);

        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        const px = offsetX + p.x * cellSize;
        const py = offsetY + p.y * cellSize;

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      // 7. Draw Floating Text Badges
      for (let i = floatingTextsRef.current.length - 1; i >= 0; i--) {
        const ft = floatingTextsRef.current[i];
        ft.y += ft.vy;
        ft.life -= 1;
        ft.alpha = Math.max(0, ft.life / 50);

        if (ft.life <= 0) {
          floatingTextsRef.current.splice(i, 1);
          continue;
        }

        const fx = offsetX + ft.x * cellSize;
        const fy = offsetY + ft.y * cellSize;

        ctx.save();
        ctx.font = `bold ${Math.max(12, Math.floor(cellSize * 0.32))}px Fredoka, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = ft.color;
        ctx.shadowColor = 'rgba(0,0,0,0.8)';
        ctx.shadowBlur = 4;
        ctx.globalAlpha = ft.alpha;
        ctx.fillText(ft.text, fx, fy);
        ctx.restore();
      }

      animationFrameIdRef.current = requestAnimationFrame(render);
    };

    animationFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [grid, items, snakes, playerPos, tankPos, waterPoints, level.requiredWater, isInvulnerable]);

  // Check collision with snakes
  useEffect(() => {
    if (isInvulnerable) return;

    snakes.forEach(snake => {
      // Direct collision or passing through
      const dist = Math.abs(snake.x - playerPos.x) + Math.abs(snake.y - playerPos.y);
      if (dist < 0.8) {
        spawnParticles(playerPos.x, playerPos.y, '#ef4444', 20);
        addFloatingText('-1 Life! (Snake!)', playerPos.x, playerPos.y, '#f87171');
        soundManager.playSnakeBite();
        onHitSnake();
      }
    });
  }, [playerPos, snakes, isInvulnerable, onHitSnake, spawnParticles, addFloatingText]);

  // Resize canvas when container resizes
  useEffect(() => {
    const handleResize = () => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const displayWidth = Math.floor(rect.width);
      const displayHeight = Math.floor(rect.height);

      canvas.width = displayWidth * dpr;
      canvas.height = displayHeight * dpr;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full aspect-square max-w-[620px] mx-auto rounded-2xl sm:rounded-3xl overflow-hidden border-4 border-yellow-800/30 shadow-inner bg-yellow-100 flex items-center justify-center"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block touch-none"
      />
    </div>
  );
};
