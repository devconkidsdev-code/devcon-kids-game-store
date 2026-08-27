import React, { useRef, useEffect } from 'react';
import { BoatCustomization, Obstacle, PathIndex } from '../types/game';
import { PATH_CONFIGS } from '../utils/trackGenerator';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface TrackCanvasProps {
  cameraX: number;
  trackLength: number;
  obstacles: Obstacle[];
  // Active primary boat
  boatX: number;
  boatY: number;
  boatPath: PathIndex;
  boatSpeed: number;
  boatInvincible: boolean;
  boatCustomization: BoatCustomization;
  // Ghost boat (if turn-based run 2)
  ghostData?: { x: number; y: number; path: PathIndex; customization: BoatCustomization } | null;
  // Second simultaneous boat (if simultaneous mode)
  secondBoat?: {
    x: number;
    y: number;
    path: PathIndex;
    speed: number;
    invincible: boolean;
    customization: BoatCustomization;
  } | null;
  shakeTime?: number;
  onCollisionEffectTrigger?: (x: number, y: number) => void;
}

export const TrackCanvas: React.FC<TrackCanvasProps> = ({
  cameraX,
  trackLength,
  obstacles,
  boatX,
  boatY,
  boatPath,
  boatSpeed,
  boatInvincible,
  boatCustomization,
  ghostData,
  secondBoat,
  shakeTime = 0
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  // Path Y coordinates relative to canvas height
  const getPathY = (path: PathIndex, canvasHeight: number) => {
    const laneHeight = (canvasHeight - 140) / 3;
    const topMargin = 70;
    return topMargin + path * laneHeight + laneHeight / 2;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isMounted = true;

    const render = () => {
      if (!isMounted) return;
      timeRef.current += 0.03;
      const t = timeRef.current;

      const width = canvas.width;
      const height = canvas.height;
      const laneHeight = (height - 140) / 3;
      const topMargin = 70;

      // Handle screen shake
      ctx.save();
      if (shakeTime > 0) {
        const shakeMagnitude = Math.min(shakeTime * 14, 12);
        const sx = (Math.random() - 0.5) * shakeMagnitude;
        const sy = (Math.random() - 0.5) * shakeMagnitude;
        ctx.translate(sx, sy);
      }

      // 1. Draw River Grass Banks (Top & Bottom)
      ctx.fillStyle = '#15803d'; // Forest green grass
      ctx.fillRect(0, 0, width, topMargin);
      ctx.fillRect(0, height - 70, width, 70);

      // Grass bank details: sandy edge
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(0, topMargin - 8, width, 8);
      ctx.fillRect(0, height - 70, width, 8);

      // 2. Draw 3 River Paths with distinct water colors and currents
      const pathColors = [
        { bg: '#0284c7', light: '#38bdf8', deep: '#0369a1' }, // Rapids (upper)
        { bg: '#0d9488', light: '#2dd4bf', deep: '#0f766e' }, // Standard (middle)
        { bg: '#059669', light: '#34d399', deep: '#047857' }  // Shallows (lower)
      ];

      for (let p = 0; p < 3; p++) {
        const laneY = topMargin + p * laneHeight;
        const col = pathColors[p];

        // Base water gradient
        const grad = ctx.createLinearGradient(0, laneY, 0, laneY + laneHeight);
        grad.addColorStop(0, col.deep);
        grad.addColorStop(0.5, col.bg);
        grad.addColorStop(1, col.deep);
        ctx.fillStyle = grad;
        ctx.fillRect(0, laneY, width, laneHeight);

        // Highlight currently active player's lane with subtle glow
        if (p === boatPath) {
          ctx.fillStyle = 'rgba(254, 240, 138, 0.06)';
          ctx.fillRect(0, laneY, width, laneHeight);
        }

        // Animated water flow ripples
        ctx.strokeStyle = col.light;
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.38;

        const speedMod = p === 0 ? 1.8 : p === 1 ? 1.2 : 0.75;
        const waveOffset = (t * 85 * speedMod) % 120;

        for (let wx = -waveOffset; wx < width + 100; wx += 90) {
          for (let row = 0; row < 3; row++) {
            const ry = laneY + 20 + row * (laneHeight / 3.5);
            ctx.beginPath();
            ctx.arc(wx + (row * 35), ry + Math.sin(t * 3.2 + wx * 0.02) * 4, 18, 0.1 * Math.PI, 0.9 * Math.PI);
            ctx.stroke();
          }
        }
        ctx.globalAlpha = 1.0;

        // Rapids extra white water froth & whirlpool lines for Path 0
        if (p === 0) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.24)';
          for (let fx = 0; fx < width; fx += 130) {
            const frothX = (fx - (t * 260) % width + width) % width;
            ctx.beginPath();
            ctx.ellipse(frothX, laneY + laneHeight * 0.35 + Math.sin(t * 4 + fx) * 6, 28, 7, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // 3. Lane Dividers (Rope Buoys between paths)
      for (let div = 1; div <= 2; div++) {
        const divY = topMargin + div * laneHeight;
        ctx.strokeStyle = 'rgba(254, 240, 138, 0.45)';
        ctx.setLineDash([8, 8]);
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, divY);
        ctx.lineTo(width, divY);
        ctx.stroke();
        ctx.setLineDash([]);

        // Floating buoy balls along line
        for (let bx = -(cameraX % 100); bx < width; bx += 100) {
          ctx.fillStyle = (Math.floor((cameraX + bx) / 100) % 2 === 0) ? '#ef4444' : '#f8fafc';
          ctx.beginPath();
          ctx.arc(bx, divY, 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 4. Scenery on River Banks (Palm trees, Spectator docks, flags)
      for (let tx = -(cameraX % 200); tx < width + 100; tx += 200) {
        const worldX = cameraX + tx;
        
        // Top bank palm tree
        drawPalmTree(ctx, tx, 35, (worldX % 70) * 0.05);

        // Bottom bank palm tree
        drawPalmTree(ctx, tx + 90, height - 35, (worldX % 60) * 0.05);

        // Spectator cheering pier every 600m
        if (Math.floor(worldX / 600) % 2 === 0 && tx > -50 && tx < width + 50) {
          drawSpectatorPier(ctx, tx + 30, topMargin - 8, t);
        }
      }

      // 5. Start Line & Finish Line
      // Start Line
      const startScreenX = 160 - cameraX;
      if (startScreenX > -100 && startScreenX < width + 100) {
        drawStartLine(ctx, startScreenX, topMargin, laneHeight * 3);
      }

      // Finish Line
      const finishScreenX = trackLength - cameraX;
      if (finishScreenX > -200 && finishScreenX < width + 200) {
        drawFinishLine(ctx, finishScreenX, topMargin, laneHeight * 3, t);
      }

      // 6. Upcoming Danger Proximity Indicators
      // When boat is traveling fast and an obstacle is in the same lane within 240 units ahead
      obstacles.forEach(obs => {
        if (obs.collected || obs.isPickup) return;
        if (obs.path === boatPath) {
          const distAhead = obs.x - boatX;
          if (distAhead > 35 && distAhead < 250) {
            const screenX = Math.min(boatX - cameraX + distAhead * 0.8, width - 40);
            const screenY = getPathY(obs.path, height);
            
            // Draw warning beacon
            ctx.save();
            ctx.fillStyle = Math.sin(t * 15) > 0 ? '#ef4444' : '#facc15';
            ctx.font = 'bold 16px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('⚠️', screenX, screenY - 22);
            ctx.restore();
          }
        }
      });

      // 7. Draw Obstacles & Pickups
      obstacles.forEach(obs => {
        const screenX = obs.x - cameraX;
        if (screenX < -100 || screenX > width + 100) return;
        const screenY = getPathY(obs.path, height);

        drawObstacle(ctx, obs, screenX, screenY, t);
      });

      // 8. Particle Effects (wake, splashes, sparks)
      updateAndDrawParticles(ctx, particlesRef.current, cameraX);

      // Emit wake particles for primary boat
      if (boatSpeed > 0.1) {
        const spawnCount = Math.min(Math.floor(boatSpeed * 2.2) + 1, 5);
        for (let k = 0; k < spawnCount; k++) {
          particlesRef.current.push({
            x: boatX - 32 + (Math.random() - 0.5) * 6,
            y: boatY + (Math.random() - 0.5) * 10,
            vx: -boatSpeed * 2.0 - Math.random() * 1.5,
            vy: (Math.random() - 0.5) * 2,
            size: 4 + Math.random() * 4,
            color: 'rgba(255, 255, 255, 0.75)',
            alpha: 0.85,
            life: 0,
            maxLife: 25 + Math.random() * 15
          });
        }
      }

      // 9. Draw Ghost Boat (if present)
      if (ghostData) {
        const ghostScreenX = ghostData.x - cameraX;
        if (ghostScreenX > -100 && ghostScreenX < width + 100) {
          ctx.save();
          ctx.globalAlpha = 0.55;
          drawBoat(
            ctx,
            ghostScreenX,
            ghostData.y,
            ghostData.customization,
            0,
            false,
            true, // isGhost
            t
          );
          ctx.restore();
        }
      }

      // 10. Draw Second Boat (if simultaneous mode)
      if (secondBoat) {
        const p2ScreenX = secondBoat.x - cameraX;
        if (p2ScreenX > -100 && p2ScreenX < width + 100) {
          drawBoat(
            ctx,
            p2ScreenX,
            secondBoat.y,
            secondBoat.customization,
            secondBoat.speed,
            secondBoat.invincible,
            false,
            t
          );
        }
      }

      // 11. Draw Primary Player Boat
      const boatScreenX = boatX - cameraX;
      drawBoat(
        ctx,
        boatScreenX,
        boatY,
        boatCustomization,
        boatSpeed,
        boatInvincible,
        false,
        t
      );

      ctx.restore();
      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      isMounted = false;
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [cameraX, trackLength, obstacles, boatX, boatY, boatPath, boatSpeed, boatInvincible, boatCustomization, ghostData, secondBoat, shakeTime]);

  return (
    <canvas
      ref={canvasRef}
      width={1000}
      height={480}
      className="w-full h-full object-cover select-none rounded-3xl shadow-2xl border-4 border-sky-600/40"
    />
  );
};

// Helper: Draw animated Boat with customized style & avatar
function drawBoat(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  custom: BoatCustomization,
  speed: number,
  invincible: boolean,
  isGhost: boolean,
  t: number
) {
  ctx.save();
  ctx.translate(x, y);

  // Bobbing water motion
  const bob = Math.sin(t * 8 + x * 0.05) * 2.5;
  ctx.translate(0, bob);

  // Flash when invincible
  if (invincible && Math.floor(t * 20) % 2 === 0) {
    ctx.globalAlpha = 0.35;
  }

  // Ghost holographic glow
  if (isGhost) {
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#38bdf8';
  }

  const length = 62;
  const width = 26;

  // 1. Water Wake / Foam under boat
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.beginPath();
  ctx.ellipse(-length * 0.2, 0, length * 0.55, width * 0.75, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Boat Hull Outer Body
  ctx.fillStyle = custom.boatColor;
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  // Sleek pointed bow at front (+X), square transom at rear (-X)
  ctx.moveTo(length / 2, 0); // Bow tip
  ctx.bezierCurveTo(length / 4, -width / 2, -length / 3, -width / 2, -length / 2, -width * 0.44);
  ctx.lineTo(-length / 2, width * 0.44);
  ctx.bezierCurveTo(-length / 3, width / 2, length / 4, width / 2, length / 2, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // 3. Trim Deck & Racing Stripes
  ctx.fillStyle = custom.trimColor || '#ffffff';
  ctx.beginPath();
  ctx.moveTo(length * 0.3, 0);
  ctx.lineTo(-length * 0.35, -width * 0.32);
  ctx.lineTo(-length * 0.35, width * 0.32);
  ctx.closePath();
  ctx.fill();

  // 4. Cockpit Interior Well (Deepened for character)
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.ellipse(-length * 0.02, 0, length * 0.26, width * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 5. Pilot Character (Woman or Man Captain sitting inside cockpit)
  drawPilotAvatar(ctx, -length * 0.03, 0, custom, speed, t);

  // 6. Cockpit Windshield (Glass reflection above character)
  ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
  ctx.beginPath();
  ctx.arc(length * 0.12, 0, width * 0.34, -Math.PI / 2, Math.PI / 2);
  ctx.fill();
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2;
  ctx.stroke();

  // 7. Outboard Motor & Engine Spray
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(-length / 2 - 7, -width * 0.22, 7, width * 0.44);
  ctx.strokeStyle = '#0f172a';
  ctx.strokeRect(-length / 2 - 7, -width * 0.22, 7, width * 0.44);

  // Propeller jet stream
  if (speed > 0.05) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.moveTo(-length / 2 - 7, 0);
    ctx.lineTo(-length / 2 - 20 - Math.random() * 8, -7);
    ctx.lineTo(-length / 2 - 20 - Math.random() * 8, 7);
    ctx.closePath();
    ctx.fill();
  }

  // 8. Bold Name badge above boat with Captain Gender Emoji
  const genderEmoji = (custom.gender === 'woman' || custom.character?.startsWith('woman')) ? '👩‍✈️' : '👨‍✈️';
  ctx.font = 'bold 11px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(-38, -width - 12, 76, 18);
  ctx.strokeStyle = custom.boatColor;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(-38, -width - 12, 76, 18);

  ctx.fillStyle = '#facc15';
  ctx.fillText(`${genderEmoji} ${custom.name.toUpperCase()}`, 0, -width + 1);

  ctx.restore();
}

// Helper: Pilot Character Avatar inside boat
function drawPilotAvatar(
  ctx: CanvasRenderingContext2D,
  px: number,
  py: number,
  custom: BoatCustomization,
  speed: number,
  t: number
) {
  ctx.save();
  ctx.translate(px, py);

  const isWoman = custom.gender === 'woman' || (custom.character && custom.character.startsWith('woman'));
  const windWave = Math.sin(t * 12 + px) * (speed > 0.1 ? 3 : 1);

  // 1. Torso & Life Vest / Racing Jacket
  ctx.fillStyle = custom.boatColor;
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.5;

  // Shoulders & Body
  ctx.beginPath();
  ctx.ellipse(-2, 0, 8, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Lifejacket straps / vest collar
  ctx.fillStyle = '#facc15';
  ctx.fillRect(-4, -6, 3, 12);
  ctx.fillRect(0, -6, 3, 12);

  // 2. Arms reaching forward to steering wheel
  ctx.strokeStyle = custom.boatColor;
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  // Left arm
  ctx.beginPath();
  ctx.moveTo(-1, -7);
  ctx.lineTo(8, -5);
  ctx.stroke();
  // Right arm
  ctx.beginPath();
  ctx.moveTo(-1, 7);
  ctx.lineTo(8, 5);
  ctx.stroke();

  // Hands (skin tone)
  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.arc(8, -5, 2.5, 0, Math.PI * 2);
  ctx.arc(8, 5, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Steering Wheel
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(10, 0, 6, -Math.PI / 2 + (speed > 0.1 ? Math.sin(t * 6) * 0.4 : 0), Math.PI / 2 + (speed > 0.1 ? Math.sin(t * 6) * 0.4 : 0));
  ctx.stroke();

  // 3. Hair (Back layer for woman's ponytail/long hair)
  if (isWoman) {
    ctx.fillStyle = custom.character === 'woman_racer' ? '#eab308' : custom.character === 'woman_sailor' ? '#dc2626' : '#451a03';
    ctx.beginPath();
    // Ponytail trailing back into the wind
    ctx.moveTo(-6, -2);
    ctx.quadraticCurveTo(-14, windWave - 2, -22, windWave * 1.8);
    ctx.quadraticCurveTo(-14, windWave + 4, -6, 3);
    ctx.closePath();
    ctx.fill();

    // Hair tie
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(-8, windWave * 0.4, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. Head & Face (Skin Tone)
  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // 5. Hair (Front / Top Layer)
  if (isWoman) {
    ctx.fillStyle = custom.character === 'woman_racer' ? '#eab308' : custom.character === 'woman_sailor' ? '#dc2626' : '#451a03';
    // Bangs & side hair
    ctx.beginPath();
    ctx.arc(0, 0, 7.8, -Math.PI * 0.75, Math.PI * 0.15);
    ctx.lineTo(2, -4);
    ctx.lineTo(-2, -6);
    ctx.closePath();
    ctx.fill();
  } else {
    // Man short styled hair
    ctx.fillStyle = custom.character === 'man_racer' ? '#ca8a04' : custom.character === 'man_sailor' ? '#1e293b' : '#451a03';
    ctx.beginPath();
    ctx.arc(0, 0, 7.8, -Math.PI * 0.85, Math.PI * 0.1);
    ctx.lineTo(-1, -4);
    ctx.closePath();
    ctx.fill();
  }

  // 6. Captain's Cap / Racing Visor
  // White/Navy captain cap with visor pointing forward (+X)
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(-1, -1, 7, 5.5, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Cap band
  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(-5, 0, 10, 2.5);

  // Gold Captain Badge / Anchor
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(2, 1, 2, 0, Math.PI * 2);
  ctx.fill();

  // Black Visor brim extending forward
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.ellipse(5, 2, 4.5, 2.5, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // 7. Aviator Racing Goggles / Sunglasses
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(1, -2.5, 6, 4);
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1;
  ctx.strokeRect(1, -2.5, 6, 4);

  // Shiny glass glint
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(2, -2, 2, 1.5);

  ctx.restore();
}

// Helper: Draw Obstacles
function drawObstacle(
  ctx: CanvasRenderingContext2D,
  obs: Obstacle,
  x: number,
  y: number,
  t: number
) {
  ctx.save();
  ctx.translate(x, y);

  const bob = Math.sin(t * 4 + obs.animationOffset) * 3;
  ctx.translate(0, bob);

  switch (obs.type) {
    case 'rock': {
      // Jagged gray river rock
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(-16, 6);
      ctx.lineTo(-12, -14);
      ctx.lineTo(4, -18);
      ctx.lineTo(16, -6);
      ctx.lineTo(14, 12);
      ctx.lineTo(-8, 14);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Rock highlights
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(-10, -10);
      ctx.lineTo(2, -14);
      ctx.lineTo(-2, -4);
      ctx.closePath();
      ctx.fill();

      // White water splash foam around base
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 10, 18, 5, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }

    case 'mine': {
      // Floating spiked sea mine
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Spikes
      for (let s = 0; s < 8; s++) {
        const ang = (s * Math.PI * 2) / 8 + t * 0.6;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ang) * 12, Math.sin(ang) * 12);
        ctx.lineTo(Math.cos(ang) * 20, Math.sin(ang) * 20);
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 3;
        ctx.stroke();
      }

      // Blinking red center beacon
      ctx.fillStyle = Math.sin(t * 12) > 0 ? '#ef4444' : '#7f1d1d';
      ctx.beginPath();
      ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'whirlpool': {
      // Swirling vortex spiral
      ctx.rotate(t * 3.5);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      for (let i = 0; i < 40; i++) {
        const angle = 0.25 * i;
        const r = (i / 40) * 24;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // Deep dark center
      ctx.fillStyle = '#0c4a6e';
      ctx.beginPath();
      ctx.arc(0, 0, 9, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'buoy': {
      // Red & white navigational buoy
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#991b1b';
      ctx.lineWidth = 2;
      ctx.stroke();

      // White middle band
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-12, -4, 24, 8);

      // Warning bell / flag top
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-2, -18, 4, 10);
      ctx.beginPath();
      ctx.arc(0, -18, 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'alligator': {
      // Wandering river alligator with tail swish
      const tailSwish = Math.sin(t * 6 + obs.animationOffset) * 4;
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.ellipse(0, 0, 24, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      // Tail
      ctx.beginPath();
      ctx.moveTo(-20, 0);
      ctx.quadraticCurveTo(-30, tailSwish, -36, tailSwish * 1.5);
      ctx.lineTo(-20, 4);
      ctx.fill();

      // Ridges on back
      ctx.fillStyle = '#166534';
      for (let sc = -12; sc <= 12; sc += 6) {
        ctx.beginPath();
        ctx.moveTo(sc, -8);
        ctx.lineTo(sc + 3, -13);
        ctx.lineTo(sc + 6, -8);
        ctx.fill();
      }

      // Snout with sharp teeth & yellow eyes
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.ellipse(18, 0, 10, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Eyes
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(14, -5, 2.5, 0, Math.PI * 2);
      ctx.arc(14, 5, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'log': {
      // Floating mossy driftwood log with slow drift tilt
      ctx.rotate(((obs.rotation || 0) + Math.sin(t * 2) * 5) * (Math.PI / 180));
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.roundRect(-22, -9, 44, 18, 6);
      ctx.fill();
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Wood rings & moss patch
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(-8, -4, 5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'lilypad': {
      // Peaceful green lotus lily pad
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0.25, Math.PI * 2 - 0.25);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#14532d';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Pink flower
      ctx.fillStyle = '#ec4899';
      for (let p = 0; p < 5; p++) {
        const ang = (p * Math.PI * 2) / 5;
        ctx.beginPath();
        ctx.arc(Math.cos(ang) * 4, Math.sin(ang) * 4, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'sandbar': {
      // Sandy shallow bar with shells
      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.ellipse(0, 0, 26, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.ellipse(0, 0, 20, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'duck_family': {
      // Mama duck with trail of baby ducklings
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(8, 0, 7, 0, Math.PI * 2); // Mama head
      ctx.arc(0, 2, 9, 0, Math.PI * 2); // Mama body
      ctx.fill();
      // Orange beak
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(14, 0); ctx.lineTo(19, 1); ctx.lineTo(14, 3);
      ctx.fill();

      // Baby duckling trailing
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(-14, 2, 4.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }

    case 'turbo_pad': {
      // Glowing neon speed chevron pad
      ctx.fillStyle = 'rgba(16, 185, 129, 0.45)';
      ctx.beginPath();
      ctx.roundRect(-20, -14, 40, 28, 6);
      ctx.fill();
      ctx.strokeStyle = '#10b981';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Pulsing green chevrons
      const pulse = (Math.sin(t * 10) + 1) * 0.5;
      ctx.fillStyle = `rgba(52, 211, 153, ${0.7 + pulse * 0.3})`;
      for (let c = -10; c <= 8; c += 9) {
        ctx.beginPath();
        ctx.moveTo(c, -8);
        ctx.lineTo(c + 7, 0);
        ctx.lineTo(c, 8);
        ctx.lineTo(c + 4, 8);
        ctx.lineTo(c + 11, 0);
        ctx.lineTo(c + 4, -8);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }

    case 'star': {
      // Rotating sparkling gold star
      ctx.rotate(t * 2.5);
      drawStar(ctx, 0, 0, 5, 14, 7, '#facc15', '#ca8a04');

      // Sparkle shine
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-3, -3, 2.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }

  ctx.restore();
}

// Helper: Draw Star
function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number,
  fillColor: string,
  strokeColor: string
) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

// Helper: Draw Palm Tree
function drawPalmTree(ctx: CanvasRenderingContext2D, x: number, y: number, wind: number) {
  ctx.save();
  ctx.translate(x, y);

  // Trunk
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.moveTo(-4, 20);
  ctx.quadraticCurveTo(wind * 8, 0, 0, -16);
  ctx.lineTo(3, -16);
  ctx.quadraticCurveTo(wind * 8 + 4, 0, 4, 20);
  ctx.closePath();
  ctx.fill();

  // Green palm leaves
  ctx.fillStyle = '#15803d';
  for (let i = 0; i < 6; i++) {
    const ang = (i * Math.PI * 2) / 6 + wind;
    ctx.beginPath();
    ctx.ellipse(
      Math.cos(ang) * 14,
      -16 + Math.sin(ang) * 8,
      14,
      5,
      ang,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Coconuts
  ctx.fillStyle = '#451a03';
  ctx.beginPath();
  ctx.arc(-2, -14, 3, 0, Math.PI * 2);
  ctx.arc(2, -14, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

// Helper: Spectator pier on river bank
function drawSpectatorPier(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
  ctx.save();
  ctx.translate(x, y);

  // Wooden dock boardwalk
  ctx.fillStyle = '#854d0e';
  ctx.fillRect(-25, -20, 50, 20);
  ctx.strokeStyle = '#451a03';
  ctx.strokeRect(-25, -20, 50, 20);

  // Cheering spectator characters
  const colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'];
  for (let i = 0; i < 3; i++) {
    const cheer = Math.sin(t * 8 + i * 1.5) * 3;
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.arc(-14 + i * 14, -26 + cheer, 4, 0, Math.PI * 2); // Head
    ctx.fill();

    // Body
    ctx.fillRect(-16 + i * 14, -22 + cheer, 5, 8);
  }

  ctx.restore();
}

// Helper: Start Line Arch
function drawStartLine(ctx: CanvasRenderingContext2D, x: number, y: number, height: number) {
  ctx.save();
  // Checkered start banner across the water
  const tileSize = 20;
  const numTiles = Math.floor(height / tileSize);
  for (let row = 0; row < numTiles; row++) {
    for (let col = 0; col < 2; col++) {
      ctx.fillStyle = (row + col) % 2 === 0 ? '#ffffff' : '#0f172a';
      ctx.fillRect(x + col * tileSize - tileSize, y + row * tileSize, tileSize, tileSize);
    }
  }

  // Start banner text
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(x - 28, y - 30, 56, 24);
  ctx.strokeStyle = '#15803d';
  ctx.strokeRect(x - 28, y - 30, 56, 24);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('START', x, y - 14);

  ctx.restore();
}

// Helper: Finish Line Arch with Confetti & Flags
function drawFinishLine(ctx: CanvasRenderingContext2D, x: number, y: number, height: number, t: number) {
  ctx.save();

  // Checkered finish banner across all 3 lanes
  const tileSize = 22;
  const numTiles = Math.floor(height / tileSize);
  for (let row = 0; row < numTiles; row++) {
    for (let col = 0; col < 3; col++) {
      ctx.fillStyle = (row + col) % 2 === 0 ? '#ffffff' : '#0f172a';
      ctx.fillRect(x + col * tileSize - tileSize * 1.5, y + row * tileSize, tileSize, tileSize);
    }
  }

  // Grand Finish Arch at Top Bank
  ctx.fillStyle = '#eab308';
  ctx.fillRect(x - 60, y - 48, 120, 36);
  ctx.strokeStyle = '#ca8a04';
  ctx.lineWidth = 3;
  ctx.strokeRect(x - 60, y - 48, 120, 36);

  ctx.fillStyle = '#0f172a';
  ctx.font = '900 16px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('🏁 FINISH 🏁', x, y - 24);

  // Inflatable waving tube man at finish
  const wave = Math.sin(t * 6) * 15;
  ctx.strokeStyle = '#ec4899';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(x - 50, y + height + 30);
  ctx.quadraticCurveTo(x - 50 + wave, y + height + 10, x - 50, y + height - 20);
  ctx.stroke();

  ctx.restore();
}

// Helper: Particle simulation
function updateAndDrawParticles(
  ctx: CanvasRenderingContext2D,
  particles: Particle[],
  cameraX: number
) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.life++;
    p.x += p.vx;
    p.y += p.vy;
    p.alpha = 1 - (p.life / p.maxLife);

    if (p.life >= p.maxLife) {
      particles.splice(i, 1);
      continue;
    }

    const screenX = p.x - cameraX;
    ctx.fillStyle = p.color;
    ctx.globalAlpha = Math.max(p.alpha, 0);
    ctx.beginPath();
    ctx.arc(screenX, p.y, p.size * (1 - p.life / p.maxLife * 0.4), 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;
  }
}
