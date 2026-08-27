import React, { useEffect, useRef } from 'react';
import {
  Building,
  EarthquakeEvent,
  FloatingText,
  NPCCar,
  Obstacle,
  Particle,
  PlayerCar,
  Road,
  SafeZone,
  SkidMark,
  Survivor,
} from '../types/game';
import { soundEngine } from '../utils/audio';
import {
  INITIAL_BUILDINGS,
  INITIAL_NPC_CARS,
  INITIAL_OBSTACLES,
  INITIAL_PLAYER_CAR,
  INITIAL_ROADS,
  INITIAL_SAFE_ZONE,
  INITIAL_SURVIVORS,
  MAP_HEIGHT,
  MAP_WIDTH,
} from '../utils/mapData';

interface GameCanvasProps {
  isPlaying: boolean;
  isPaused?: boolean;
  onScoreUpdate: (deliveredBatch: number, passengersCount: number) => void;
  onRescueEvent: (type: 'pickup' | 'delivery' | 'earthquake', details: { count?: number; name?: string }) => void;
  onPlayerMoved?: (pos: { x: number; y: number; angle: number }) => void;
  onBuildingStateChanged?: (name: string | null) => void;
  onTogglePause?: () => void;
  onTimeOut: () => void;
  timeRemaining: number;
  isMuted: boolean;
  score: number;
}

// Helper for rounded rectangles that works across all browser engines
const drawSafeRoundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) => {
  const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  if (typeof ctx.roundRect === 'function') {
    try {
      ctx.roundRect(x, y, w, h, radius);
      return;
    } catch {
      // Fallback below
    }
  }
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
};

export const GameCanvas: React.FC<GameCanvasProps> = ({
  isPlaying,
  isPaused = false,
  onScoreUpdate,
  onRescueEvent,
  onPlayerMoved,
  onBuildingStateChanged,
  onTogglePause,
  isMuted,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Game internal state references (for 60fps loop without React re-render lag)
  const playerRef = useRef<PlayerCar>({ ...INITIAL_PLAYER_CAR, passengers: [] });
  const survivorsRef = useRef<Survivor[]>(JSON.parse(JSON.stringify(INITIAL_SURVIVORS)));
  const npcCarsRef = useRef<NPCCar[]>(JSON.parse(JSON.stringify(INITIAL_NPC_CARS)));
  const obstaclesRef = useRef<Obstacle[]>(JSON.parse(JSON.stringify(INITIAL_OBSTACLES)));
  const buildingsRef = useRef(INITIAL_BUILDINGS);
  const roadsRef = useRef<Road[]>(INITIAL_ROADS);
  const safeZoneRef = useRef<SafeZone>(INITIAL_SAFE_ZONE);
  const lastInsideBuildingRef = useRef<Building | null>(null);

  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const skidMarksRef = useRef<SkidMark[]>([]);

  const earthquakeRef = useRef<EarthquakeEvent>({
    isActive: false,
    intensity: 0,
    duration: 0,
    timeLeft: 0,
    epicenter: { x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 },
    warningCountdown: 28, // first tremor in ~28 seconds
  });

  const keysPressedRef = useRef<{ [key: string]: boolean }>({});
  const cameraRef = useRef<{ x: number; y: number; shakeX: number; shakeY: number }>({
    x: INITIAL_PLAYER_CAR.x,
    y: INITIAL_PLAYER_CAR.y,
    shakeX: 0,
    shakeY: 0,
  });

  const lastFrameTimeRef = useRef<number>(performance.now());
  const animationFrameRef = useRef<number | null>(null);
  const lastMiniMapSyncRef = useRef<number>(0);

  // Sync mute state
  useEffect(() => {
    soundEngine.setMuted(isMuted);
  }, [isMuted]);

  // Pause audio handling
  useEffect(() => {
    if (isPaused) {
      soundEngine.stopContinuousSounds();
    }
  }, [isPaused]);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressedRef.current[key] = true;

      // Pause toggle
      if (key === 'p' || key === 'escape') {
        onTogglePause?.();
        return;
      }

      // Special key triggers
      if (key === ' ' || key === 'spacebar') {
        // Honk horn / attract attention
        soundEngine.playHorn();
        const p = playerRef.current;
        addFloatingText(p.x, p.y - 40, '📢 HONK!', '#fbbf24', 18);

        // Alert nearby survivors to sprint to the ambulance
        survivorsRef.current.forEach((s) => {
          if (!s.rescued && !s.delivered && !s.isTrapped) {
            const dist = Math.hypot(p.x - s.x, p.y - s.y);
            if (dist < 600) {
              s.isRunning = true;
              if (Math.random() < 0.4) {
                addFloatingText(s.x, s.y - 25, '🏃 Running to you!', '#38bdf8', 14);
              }
            }
          }
        });

        // Nearby NPC cars honk back or flash headlights
        npcCarsRef.current.forEach((car) => {
          const dist = Math.hypot(p.x - car.x, p.y - car.y);
          if (dist < 400 && Math.random() < 0.4) {
            addFloatingText(car.x, car.y - 30, '📯 Beep!', '#e2e8f0', 13);
          }
        });
      }
      if (key === 'e' || key === 'h') {
        // Toggle siren
        playerRef.current.sirenActive = !playerRef.current.sirenActive;
        soundEngine.setSiren(playerRef.current.sirenActive);
      }
      if (key === 'shift') {
        playerRef.current.isBoosting = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressedRef.current[key] = false;
      if (key === 'shift') {
        playerRef.current.isBoosting = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onTogglePause]);

  // Helper to add floating animated text in world space
  const addFloatingText = (x: number, y: number, text: string, color: string, size = 16) => {
    floatingTextsRef.current.push({
      id: Math.random().toString(),
      x,
      y,
      text,
      color,
      size,
      alpha: 1.0,
      life: 0,
      maxLife: 65,
      vy: -1.2,
    });
  };

  // Helper to add particles
  const addParticle = (
    x: number,
    y: number,
    vx: number,
    vy: number,
    size: number,
    color: string,
    type: Particle['type'],
    maxLife = 30
  ) => {
    particlesRef.current.push({
      x,
      y,
      vx,
      vy,
      size,
      color,
      alpha: 1.0,
      life: 0,
      maxLife,
      type,
    });
  };

  // Reset or restart game state
  useEffect(() => {
    if (isPlaying) {
      playerRef.current = { ...INITIAL_PLAYER_CAR, passengers: [] };
      survivorsRef.current = JSON.parse(JSON.stringify(INITIAL_SURVIVORS));
      obstaclesRef.current = JSON.parse(JSON.stringify(INITIAL_OBSTACLES));
      particlesRef.current = [];
      floatingTextsRef.current = [];
      skidMarksRef.current = [];
      earthquakeRef.current = {
        isActive: false,
        intensity: 0,
        duration: 0,
        timeLeft: 0,
        epicenter: { x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 },
        warningCountdown: 28,
      };
      cameraRef.current = {
        x: INITIAL_PLAYER_CAR.x,
        y: INITIAL_PLAYER_CAR.y,
        shakeX: 0,
        shakeY: 0,
      };
      soundEngine.setSiren(true);
    } else {
      soundEngine.stopContinuousSounds();
    }
  }, [isPlaying]);

  // Main 60FPS Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      if (canvas) {
        const parent = canvas.parentElement;
        const rect = parent ? parent.getBoundingClientRect() : null;
        const w = rect && rect.width > 0 ? Math.floor(rect.width) : window.innerWidth;
        const h = rect && rect.height > 0 ? Math.floor(rect.height) : window.innerHeight;
        canvas.width = Math.max(w, 320);
        canvas.height = Math.max(h, 320);
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && canvas.parentElement) {
      resizeObserver = new ResizeObserver(() => {
        resizeCanvas();
      });
      resizeObserver.observe(canvas.parentElement);
    }

    const gameLoop = (timestamp: number) => {
      const dt = Math.min((timestamp - lastFrameTimeRef.current) / 1000, 0.1);
      lastFrameTimeRef.current = timestamp;

      if (isPlaying) {
        updateGame(dt);
      }

      renderGame(ctx, canvas.width, canvas.height);

      animationFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameRef.current = requestAnimationFrame(gameLoop);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      soundEngine.stopContinuousSounds();
    };
  }, [isPlaying]);

  // ==========================================
  // UPDATE LOGIC
  // ==========================================
  const updateGame = (dt: number) => {
    const player = playerRef.current;
    const keys = keysPressedRef.current;

    // 1. Earthquake periodic trigger & update
    const eq = earthquakeRef.current;
    eq.warningCountdown -= dt;

    if (eq.warningCountdown <= 0 && !eq.isActive) {
      // Trigger new Earthquake!
      eq.isActive = true;
      eq.intensity = 1.0 + Math.random() * 0.8;
      eq.duration = 6.5; // 6.5 seconds of violent shaking
      eq.timeLeft = eq.duration;
      eq.warningCountdown = 35 + Math.random() * 15; // next tremor in 35-50s
      eq.epicenter = {
        x: player.x + (Math.random() - 0.5) * 800,
        y: player.y + (Math.random() - 0.5) * 800,
      };

      soundEngine.playEarthquakeRumble(eq.intensity);
      onRescueEvent('earthquake', {});
      addFloatingText(player.x, player.y - 60, '⚠️ SEISMIC AFTERSHOCK!', '#ef4444', 22);

      // Spawn extra dust and rubble debris nearby
      for (let i = 0; i < 16; i++) {
        const rx = Math.max(50, Math.min(MAP_WIDTH - 50, player.x + (Math.random() - 0.5) * 600));
        const ry = Math.max(50, Math.min(MAP_HEIGHT - 50, player.y + (Math.random() - 0.5) * 600));
        addParticle(rx, ry, (Math.random() - 0.5) * 2, -Math.random() * 2, 8 + Math.random() * 12, '#a8a29e', 'dust', 70);
      }
    }

    if (eq.isActive) {
      eq.timeLeft -= dt;
      if (eq.timeLeft <= 0) {
        eq.isActive = false;
      }
    }

    // 2. Player Vehicle Controls & Acceleration (Simple, responsive arcade driving)
    const isW = keys['w'] || keys['arrowup'];
    const isS = keys['s'] || keys['arrowdown'];
    const isA = keys['a'] || keys['arrowleft'];
    const isD = keys['d'] || keys['arrowright'];

    // Direct, intuitive steering: turn smoothly at any time (including from standstill!)
    const turnRate = 0.065;
    if (isA) {
      player.angle -= turnRate;
    }
    if (isD) {
      player.angle += turnRate;
    }

    // Check if player is on road or off-road
    let onRoad = false;
    for (const r of roadsRef.current) {
      if (player.x >= r.x && player.x <= r.x + r.width && player.y >= r.y && player.y <= r.y + r.height) {
        onRoad = true;
        break;
      }
    }

    // Safe zone is also smooth driving
    const sz = safeZoneRef.current;
    if (player.x >= sz.x && player.x <= sz.x + sz.width && player.y >= sz.y && player.y <= sz.y + sz.height) {
      onRoad = true;
    }

    const currentMaxSpeed = onRoad ? player.maxForwardSpeed : player.maxForwardSpeed * 0.88;
    const currentFriction = onRoad ? player.friction : player.friction * 1.2;

    // Nitro boost recharge & consumption
    if (player.isBoosting && player.boostAvailable > 5 && isW) {
      player.boostAvailable = Math.max(0, player.boostAvailable - dt * 25);
      player.speed = Math.min(player.speed + player.acceleration * 1.8, currentMaxSpeed * 1.35);
      // Boost particles
      addParticle(
        player.x - Math.cos(player.angle) * 35,
        player.y - Math.sin(player.angle) * 35,
        -Math.cos(player.angle) * 3 + (Math.random() - 0.5),
        -Math.sin(player.angle) * 3 + (Math.random() - 0.5),
        6 + Math.random() * 6,
        '#38bdf8',
        'spark',
        20
      );
    } else {
      player.boostAvailable = Math.min(100, player.boostAvailable + dt * 10);
      if (isW) {
        player.speed = Math.min(player.speed + player.acceleration, currentMaxSpeed);
      } else if (isS) {
        // Reverse or brake
        if (player.speed > 0.2) {
          player.speed = Math.max(0, player.speed - player.braking);
          if (player.speed > 3.5) {
            soundEngine.playScreech();
            skidMarksRef.current.push({ x: player.x, y: player.y, angle: player.angle, alpha: 0.5 });
          }
        } else {
          player.speed = Math.max(player.speed - player.acceleration * 0.8, player.maxReverseSpeed);
        }
      } else {
        // Apply friction
        if (player.speed > 0) {
          player.speed = Math.max(0, player.speed - currentFriction);
        } else if (player.speed < 0) {
          player.speed = Math.min(0, player.speed + currentFriction);
        }
      }
    }

    // Tire tracks when turning fast
    if ((isA || isD) && Math.abs(player.speed) > 4.5 && Math.random() < 0.25) {
      skidMarksRef.current.push({ x: player.x, y: player.y, angle: player.angle, alpha: 0.35 });
    }

    // Update position
    const nextX = player.x + Math.cos(player.angle) * player.speed;
    const nextY = player.y + Math.sin(player.angle) * player.speed;

    // 3. Collision with Map Bounds
    const margin = 35;
    player.x = Math.max(margin, Math.min(MAP_WIDTH - margin, nextX));
    player.y = Math.max(margin, Math.min(MAP_HEIGHT - margin, nextY));

    // 4. Collision with Buildings (Smooth sliding along walls, allowing entrance into enterable shelters)
    for (const b of buildingsRef.current) {
      const carRadius = 24;

      if (b.isEnterable && b.entrance) {
        const ent = b.entrance;
        const isInside =
          player.x >= b.x &&
          player.x <= b.x + b.width &&
          player.y >= b.y &&
          player.y <= b.y + b.height;

        const isAtEntrance =
          player.x >= ent.x - 20 &&
          player.x <= ent.x + ent.width + 20 &&
          player.y >= ent.y - 35 &&
          player.y <= ent.y + ent.height + 35;

        if (isInside) {
          // Keep player constrained inside the shelter walls, except at the entrance door opening
          if (player.x - carRadius < b.x) {
            player.x = b.x + carRadius;
            player.speed *= 0.8;
          }
          if (player.x + carRadius > b.x + b.width) {
            player.x = b.x + b.width - carRadius;
            player.speed *= 0.8;
          }
          if (player.y - carRadius < b.y) {
            player.y = b.y + carRadius;
            player.speed *= 0.8;
          }
          if (player.y + carRadius > b.y + b.height) {
            // Allow exit only through the entrance bay
            if (player.x < ent.x || player.x > ent.x + ent.width) {
              player.y = b.y + b.height - carRadius;
              player.speed *= 0.8;
            }
          }
          continue;
        } else if (isAtEntrance) {
          // Passing through entrance gateway
          continue;
        }
      }

      if (
        player.x + carRadius > b.x &&
        player.x - carRadius < b.x + b.width &&
        player.y + carRadius > b.y &&
        player.y - carRadius < b.y + b.height
      ) {
        const overlapLeft = player.x + carRadius - b.x;
        const overlapRight = b.x + b.width - (player.x - carRadius);
        const overlapTop = player.y + carRadius - b.y;
        const overlapBottom = b.y + b.height - (player.y - carRadius);

        const minOverlapX = Math.min(overlapLeft, overlapRight);
        const minOverlapY = Math.min(overlapTop, overlapBottom);

        if (minOverlapX < minOverlapY) {
          if (overlapLeft < overlapRight) {
            player.x = b.x - carRadius;
          } else {
            player.x = b.x + b.width + carRadius;
          }
        } else {
          if (overlapTop < overlapBottom) {
            player.y = b.y - carRadius;
          } else {
            player.y = b.y + b.height + carRadius;
          }
        }

        player.speed *= 0.88; // Smooth friction glide
        if (Math.random() < 0.08) {
          soundEngine.playCrash(player.speed);
          cameraRef.current.shakeX += (Math.random() - 0.5) * 3;
          cameraRef.current.shakeY += (Math.random() - 0.5) * 3;
          addParticle(player.x, player.y, (Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, 4, '#fb923c', 'debris', 18);
        }
        break;
      }
    }

    // Inside enterable building tracking & notification
    let currentInside: Building | null = null;
    for (const b of buildingsRef.current) {
      if (b.isEnterable && player.x >= b.x && player.x <= b.x + b.width && player.y >= b.y && player.y <= b.y + b.height) {
        currentInside = b;
        break;
      }
    }

    if (currentInside !== lastInsideBuildingRef.current) {
      if (currentInside) {
        addFloatingText(player.x, player.y - 60, `🏥 ENTERED: ${currentInside.name}!`, '#38bdf8', 20);
        soundEngine.playPickup();
      } else if (lastInsideBuildingRef.current) {
        addFloatingText(player.x, player.y - 60, `🚗 EXITED: ${lastInsideBuildingRef.current.name}`, '#f59e0b', 18);
      }
      lastInsideBuildingRef.current = currentInside;
      onBuildingStateChanged?.(currentInside ? currentInside.name : null);
    }

    // 5. Collision with Road Obstacles (Rubble, Broken Cars, Fissures)
    for (const obs of obstaclesRef.current) {
      const dx = player.x - obs.x;
      const dy = player.y - obs.y;
      const dist = Math.hypot(dx, dy);
      const hitRadius = (obs.width + player.width) / 2.6;

      if (dist < hitRadius) {
        if (obs.type === 'rubble_pile' || obs.type === 'broken_car' || obs.type === 'barricade') {
          player.speed *= 0.82;
          if (Math.abs(player.speed) > 3) {
            soundEngine.playCrash(player.speed);
            cameraRef.current.shakeX += (Math.random() - 0.5) * 3;
            cameraRef.current.shakeY += (Math.random() - 0.5) * 3;
            addParticle(obs.x, obs.y, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, 4, '#78716c', 'debris', 15);
          }
        } else if (obs.type === 'fissure') {
          player.speed *= 0.92;
        }
      }
    }

    // Update Engine audio
    soundEngine.updateEngineSound(player.speed / player.maxForwardSpeed, isW || isS);

    // 6. Survivor Pickup Mechanics (Glowing Circle Touch Detection)
    const RESCUE_CIRCLE_RADIUS = 125; // Normal glowing rescue circle around the ambulance
    survivorsRef.current.forEach((survivor) => {
      if (survivor.rescued || survivor.delivered) return;

      const dist = Math.hypot(player.x - survivor.x, player.y - survivor.y);
      if (dist <= RESCUE_CIRCLE_RADIUS) {
        if (player.passengers.length < player.maxCapacity) {
          // Pick up survivor on touch with glowing circle!
          survivor.rescued = true;
          player.passengers.push(survivor);

          soundEngine.playPickup();
          onRescueEvent('pickup', { name: survivor.name, count: player.passengers.length });
          onScoreUpdate(-1, player.passengers.length); // inform HUD about passenger count

          addFloatingText(survivor.x, survivor.y - 30, `+1 Rescued: ${survivor.name}!`, '#22c55e', 18);
          addFloatingText(player.x, player.y - 45, `Person Rescued! (${player.passengers.length}/${player.maxCapacity})`, '#38bdf8', 16);

          // Energetic glowing suction stream from survivor to the ambulance
          for (let p = 0; p < 18; p++) {
            const angleToCar = Math.atan2(player.y - survivor.y, player.x - survivor.x);
            const speed = 3 + Math.random() * 5;
            addParticle(
              survivor.x,
              survivor.y,
              Math.cos(angleToCar) * speed + (Math.random() - 0.5) * 2,
              Math.sin(angleToCar) * speed + (Math.random() - 0.5) * 2,
              5 + Math.random() * 4,
              '#4ade80',
              'star',
              35
            );
          }
        } else {
          // Car is full warning
          if (Math.random() < 0.05) {
            addFloatingText(player.x, player.y - 50, '⚠️ VEHICLE FULL! Head to Safe Zone!', '#f59e0b', 16);
          }
        }
      }
    });

    // 7. Safe Zone Delivery Mechanics
    const inSafeZone =
      player.x >= sz.x &&
      player.x <= sz.x + sz.width &&
      player.y >= sz.y &&
      player.y <= sz.y + sz.height;

    if (inSafeZone && player.passengers.length > 0) {
      const deliveredCount = player.passengers.length;

      // Mark passengers delivered
      player.passengers.forEach((p) => {
        p.delivered = true;
      });

      // Clear vehicle passengers
      player.passengers = [];

      // Audio & Events
      soundEngine.playDelivery(deliveredCount);
      onRescueEvent('delivery', { count: deliveredCount });
      onScoreUpdate(deliveredCount, 0);

      addFloatingText(
        sz.x + sz.width / 2,
        sz.y + sz.height / 2 - 20,
        `🎉 ${deliveredCount} PEOPLE SAVED!`,
        '#4ade80',
        26
      );

      // Huge confetti & star burst in Safe Zone
      for (let i = 0; i < 30; i++) {
        const colors = ['#22c55e', '#38bdf8', '#fbbf24', '#f43f5e', '#a855f7'];
        const col = colors[Math.floor(Math.random() * colors.length)];
        addParticle(
          player.x + (Math.random() - 0.5) * 60,
          player.y + (Math.random() - 0.5) * 60,
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 6 - 3,
          6 + Math.random() * 6,
          col,
          'star',
          60
        );
      }
    }

    // 8. Dynamic Evacuees Movement (People Running to Evacuation / Safe Zone!)
    const szCenterX = sz.x + sz.width / 2;
    const szCenterY = sz.y + sz.height / 2;
    survivorsRef.current.forEach((survivor) => {
      if (survivor.rescued || survivor.delivered) return;

      survivor.legPhase = ((survivor.legPhase || 0) + 0.25) % (Math.PI * 2);

      // Trapped people wave in place
      if (survivor.isTrapped) return;

      const distToPlayer = Math.hypot(player.x - survivor.x, player.y - survivor.y);
      const isPlayerNear = distToPlayer < 400 && player.passengers.length < player.maxCapacity;

      if (isPlayerNear) {
        // Run towards player ambulance to be rescued!
        const angle = Math.atan2(player.y - survivor.y, player.x - survivor.x);
        const speed = (survivor.runSpeed || 1.6) * 1.35;
        survivor.x += Math.cos(angle) * speed;
        survivor.y += Math.sin(angle) * speed;
        survivor.facingAngle = angle;

        if (Math.random() < 0.08) {
          addParticle(survivor.x, survivor.y + 4, (Math.random() - 0.5) * 0.5, 0.5, 3, '#78716c', 'dust', 15);
        }
      } else if (survivor.isRunning) {
        // Run towards Central Safe Zone / Evacuation Base
        const angle = Math.atan2(szCenterY - survivor.y, szCenterX - survivor.x);
        const speed = survivor.runSpeed || 1.4;
        survivor.x += Math.cos(angle) * speed;
        survivor.y += Math.sin(angle) * speed;
        survivor.facingAngle = angle;

        if (Math.random() < 0.05) {
          addParticle(survivor.x, survivor.y + 4, (Math.random() - 0.5) * 0.5, 0.5, 3, '#78716c', 'dust', 15);
        }

        // Check if survivor safely reached Safe Zone on foot!
        const insideSafeZoneOnFoot =
          survivor.x >= sz.x &&
          survivor.x <= sz.x + sz.width &&
          survivor.y >= sz.y &&
          survivor.y <= sz.y + sz.height;

        if (insideSafeZoneOnFoot) {
          survivor.delivered = true;
          soundEngine.playDelivery(1);
          onRescueEvent('delivery', { count: 1, name: survivor.name });
          onScoreUpdate(1, player.passengers.length);
          addFloatingText(survivor.x, survivor.y - 30, `🏃 ${survivor.name} reached Safety! (+1)`, '#4ade80', 20);

          for (let i = 0; i < 16; i++) {
            addParticle(
              survivor.x + (Math.random() - 0.5) * 20,
              survivor.y + (Math.random() - 0.5) * 20,
              (Math.random() - 0.5) * 4,
              (Math.random() - 0.5) * 4 - 2,
              5,
              '#22c55e',
              'star',
              40
            );
          }
        }
      }
    });

    // 9. NPC Traffic & Evacuation Vehicles Simulation
    npcCarsRef.current.forEach((car) => {
      // 1. Waypoint steering
      if (car.waypoints && car.waypoints.length > 0) {
        const wp = car.waypoints[car.currentWaypointIndex];
        const dx = wp.x - car.x;
        const dy = wp.y - car.y;
        const distToWp = Math.hypot(dx, dy);

        if (distToWp < 55) {
          car.currentWaypointIndex = (car.currentWaypointIndex + 1) % car.waypoints.length;
        }

        const targetAngle = Math.atan2(dy, dx);
        let angleDiff = targetAngle - car.angle;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        car.angle += angleDiff * 0.07;
      }

      // 2. Obstacle / Player ahead detection for realistic braking & yielding
      let shouldBrake = false;
      const frontDist = 80;
      const frontX = car.x + Math.cos(car.angle) * frontDist;
      const frontY = car.y + Math.sin(car.angle) * frontDist;

      // Distance to player
      const distToPlayer = Math.hypot(player.x - frontX, player.y - frontY);
      if (distToPlayer < 70) {
        shouldBrake = true;
      }

      // Distance to obstacles
      for (const obs of obstaclesRef.current) {
        if (Math.hypot(obs.x - frontX, obs.y - frontY) < 55) {
          shouldBrake = true;
          break;
        }
      }

      car.braking = shouldBrake;
      if (shouldBrake) {
        car.speed = Math.max(0.6, car.speed - 0.25);
      } else {
        car.speed = Math.min(car.maxSpeed, car.speed + 0.12);
      }

      // Move vehicle
      car.x += Math.cos(car.angle) * car.speed;
      car.y += Math.sin(car.angle) * car.speed;

      // Keep inside map limits
      car.x = Math.max(60, Math.min(MAP_WIDTH - 60, car.x));
      car.y = Math.max(60, Math.min(MAP_HEIGHT - 60, car.y));

      // Siren phase animation
      if (car.hasSiren) {
        car.sirenPhase = ((car.sirenPhase || 0) + 0.12) % 1;
      }

      // 3. Collision with Player Vehicle (Realistic bumper bounce)
      const distDirect = Math.hypot(player.x - car.x, player.y - car.y);
      const colRadius = (car.height + player.height) / 3.4;

      if (distDirect < colRadius) {
        const bumpAngle = Math.atan2(player.y - car.y, player.x - car.x);
        player.speed *= 0.75;
        car.speed *= 0.5;

        // Push apart
        const overlap = colRadius - distDirect + 2;
        player.x += Math.cos(bumpAngle) * overlap * 0.5;
        player.y += Math.sin(bumpAngle) * overlap * 0.5;
        car.x -= Math.cos(bumpAngle) * overlap * 0.5;
        car.y -= Math.sin(bumpAngle) * overlap * 0.5;

        soundEngine.playCrash(3.5);
        cameraRef.current.shakeX += (Math.random() - 0.5) * 4;
        cameraRef.current.shakeY += (Math.random() - 0.5) * 4;

        // Spark particles on collision point
        const sparkX = (player.x + car.x) / 2;
        const sparkY = (player.y + car.y) / 2;
        for (let s = 0; s < 6; s++) {
          addParticle(
            sparkX,
            sparkY,
            (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 4,
            4,
            '#fbbf24',
            'spark',
            18
          );
        }
      }
    });

    // 10. Update Camera Tracking with smooth damping and shake
    const targetCamX = player.x + Math.cos(player.angle) * player.speed * 12;
    const targetCamY = player.y + Math.sin(player.angle) * player.speed * 12;

    cameraRef.current.x += (targetCamX - cameraRef.current.x) * 0.08;
    cameraRef.current.y += (targetCamY - cameraRef.current.y) * 0.08;

    // Earthquake screen shake
    if (eq.isActive) {
      const shakeAmt = eq.intensity * 7 * (eq.timeLeft / eq.duration);
      cameraRef.current.shakeX = (Math.random() - 0.5) * shakeAmt * 2;
      cameraRef.current.shakeY = (Math.random() - 0.5) * shakeAmt * 2;
    } else {
      cameraRef.current.shakeX *= 0.85;
      cameraRef.current.shakeY *= 0.85;
    }

    // 9. Update Particles
    for (let i = particlesRef.current.length - 1; i >= 0; i--) {
      const p = particlesRef.current[i];
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.alpha = 1 - p.life / p.maxLife;
      if (p.type === 'smoke' || p.type === 'dust') {
        p.size += 0.15;
      }
      if (p.life >= p.maxLife) {
        particlesRef.current.splice(i, 1);
      }
    }

    // 10. Update Floating Texts
    for (let i = floatingTextsRef.current.length - 1; i >= 0; i--) {
      const ft = floatingTextsRef.current[i];
      ft.life++;
      ft.y += ft.vy;
      ft.alpha = Math.max(0, 1 - ft.life / ft.maxLife);
      if (ft.life >= ft.maxLife) {
        floatingTextsRef.current.splice(i, 1);
      }
    }

    // 11. Maintain Skid marks limit
    if (skidMarksRef.current.length > 300) {
      skidMarksRef.current.splice(0, 20);
    }

    // 12. Throttle sync player position for MiniMap
    const now = performance.now();
    if (onPlayerMoved && now - lastMiniMapSyncRef.current > 100) {
      lastMiniMapSyncRef.current = now;
      onPlayerMoved({ x: player.x, y: player.y, angle: player.angle });
    }
  };

  // ==========================================
  // RENDER ENGINE
  // ==========================================
  const renderGame = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.save();
    ctx.clearRect(0, 0, width, height);

    const camera = cameraRef.current;
    const shakeOffsetX = camera.shakeX;
    const shakeOffsetY = camera.shakeY;

    // Translate world to center on player
    ctx.translate(
      width / 2 - camera.x + shakeOffsetX,
      height / 2 - camera.y + shakeOffsetY
    );

    // 1. Draw Ground Background (Disaster Concrete & Earth)
    drawGround(ctx);

    // 2. Draw Roads Network
    drawRoads(ctx);

    // 3. Draw Skid Marks
    drawSkidMarks(ctx);

    // 4. Draw Safe Zone
    drawSafeZone(ctx);

    // 5. Draw Road Obstacles & Fissures
    drawObstacles(ctx);

    // 6. Draw Buildings
    drawBuildings(ctx);

    // 7. Draw NPC Traffic & Evacuation Vehicles
    drawNPCCars(ctx);

    // 8. Draw Stranded & Running Survivors
    drawSurvivors(ctx);

    // 9. Draw Player Rescue Vehicle & Male Driver
    drawPlayerCar(ctx);

    // 9. Draw Holographic Navigation Arrow (Points to survivor or Safe Zone)
    drawNavigationalArrow(ctx);

    // 10. Draw Particles
    drawParticles(ctx);

    // 11. Draw Floating Text Popups
    drawFloatingTexts(ctx);

    ctx.restore();

    // 12. Earthquake Ambient Screen Vignette / Shake Effect in Screen Space
    if (earthquakeRef.current.isActive) {
      ctx.save();
      const grad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        width * 0.25,
        width / 2,
        height / 2,
        width * 0.75
      );
      grad.addColorStop(0, 'rgba(239, 68, 68, 0)');
      grad.addColorStop(1, `rgba(220, 38, 38, ${0.15 * (earthquakeRef.current.timeLeft / earthquakeRef.current.duration)})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }
  };

  // Ground rendering
  const drawGround = (ctx: CanvasRenderingContext2D) => {
    // Base disaster ground color
    ctx.fillStyle = '#1e2024';
    ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);

    // Ground tile grid texture
    ctx.strokeStyle = '#272a30';
    ctx.lineWidth = 1;
    const tileSize = 100;
    for (let x = 0; x <= MAP_WIDTH; x += tileSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, MAP_HEIGHT);
      ctx.stroke();
    }
    for (let y = 0; y <= MAP_HEIGHT; y += tileSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(MAP_WIDTH, y);
      ctx.stroke();
    }

    // Outer boundary hazard border
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 12;
    ctx.strokeRect(6, 6, MAP_WIDTH - 12, MAP_HEIGHT - 12);
  };

  // Road network rendering
  const drawRoads = (ctx: CanvasRenderingContext2D) => {
    roadsRef.current.forEach((road) => {
      // Asphalt
      ctx.fillStyle = '#33373e';
      ctx.fillRect(road.x, road.y, road.width, road.height);

      // Sidewalk curbs
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 4;
      ctx.strokeRect(road.x, road.y, road.width, road.height);

      // Road Lane Markings
      if (road.direction === 'horizontal') {
        const centerY = road.y + road.height / 2;
        // Center double yellow line
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(road.x, centerY - 2.5);
        ctx.lineTo(road.x + road.width, centerY - 2.5);
        ctx.moveTo(road.x, centerY + 2.5);
        ctx.lineTo(road.x + road.width, centerY + 2.5);
        ctx.stroke();

        // White dashed lane dividers
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.setLineDash([18, 18]);
        ctx.beginPath();
        ctx.moveTo(road.x, centerY - 32);
        ctx.lineTo(road.x + road.width, centerY - 32);
        ctx.moveTo(road.x, centerY + 32);
        ctx.lineTo(road.x + road.width, centerY + 32);
        ctx.stroke();
        ctx.setLineDash([]);
      } else if (road.direction === 'vertical') {
        const centerX = road.x + road.width / 2;
        // Center double yellow line
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(centerX - 2.5, road.y);
        ctx.lineTo(centerX - 2.5, road.y + road.height);
        ctx.moveTo(centerX + 2.5, road.y);
        ctx.lineTo(centerX + 2.5, road.y + road.height);
        ctx.stroke();

        // White dashed lane dividers
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.setLineDash([18, 18]);
        ctx.beginPath();
        ctx.moveTo(centerX - 30, road.y);
        ctx.lineTo(centerX - 30, road.y + road.height);
        ctx.moveTo(centerX + 30, road.y);
        ctx.lineTo(centerX + 30, road.y + road.height);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    });
  };

  // Skid marks
  const drawSkidMarks = (ctx: CanvasRenderingContext2D) => {
    skidMarksRef.current.forEach((sm) => {
      ctx.save();
      ctx.translate(sm.x, sm.y);
      ctx.rotate(sm.angle);
      ctx.fillStyle = `rgba(15, 23, 42, ${sm.alpha})`;
      ctx.fillRect(-6, -16, 12, 6);
      ctx.fillRect(-6, 10, 12, 6);
      ctx.restore();
    });
  };

  // Safe Zone with glowing helipad & medical camp
  const drawSafeZone = (ctx: CanvasRenderingContext2D) => {
    const sz = safeZoneRef.current;
    const time = performance.now() / 1000;

    // Glowing base background
    ctx.fillStyle = '#064e3b';
    ctx.fillRect(sz.x, sz.y, sz.width, sz.height);

    // Grid pattern inside safe zone
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 1;
    for (let x = sz.x; x <= sz.x + sz.width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, sz.y);
      ctx.lineTo(x, sz.y + sz.height);
      ctx.stroke();
    }
    for (let y = sz.y; y <= sz.y + sz.height; y += 40) {
      ctx.beginPath();
      ctx.moveTo(sz.x, y);
      ctx.lineTo(sz.x + sz.width, y);
      ctx.stroke();
    }

    // Glowing Animated Green Perimeter
    const pulse = 0.5 + 0.5 * Math.sin(time * 4);
    ctx.strokeStyle = `rgba(34, 197, 94, ${0.7 + pulse * 0.3})`;
    ctx.lineWidth = 6;
    ctx.strokeRect(sz.x, sz.y, sz.width, sz.height);

    // Corner Beacon Lights
    const corners = [
      { x: sz.x + 10, y: sz.y + 10 },
      { x: sz.x + sz.width - 10, y: sz.y + 10 },
      { x: sz.x + 10, y: sz.y + sz.height - 10 },
      { x: sz.x + sz.width - 10, y: sz.y + sz.height - 10 },
    ];
    corners.forEach((c) => {
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(c.x, c.y, 8, 0, Math.PI * 2);
      ctx.fill();

      // Beacon glow ring
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.5)';
      ctx.beginPath();
      ctx.arc(c.x, c.y, 14 + pulse * 6, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Medical Red Cross / Green Cross in Helipad Center
    const centerX = sz.x + sz.width / 2;
    const centerY = sz.y + sz.height / 2;

    // Helipad Landing Circle
    ctx.strokeStyle = '#4ade80';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
    ctx.stroke();

    // Cross shape
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(centerX - 12, centerY - 45, 24, 90);
    ctx.fillRect(centerX - 45, centerY - 12, 90, 24);

    // Safe Zone Label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SAFE ZONE', centerX, sz.y + 35);
    ctx.font = 'bold 12px system-ui, -apple-system, sans-serif';
    ctx.fillStyle = '#86efac';
    ctx.fillText('DROP OFF SURVIVORS HERE', centerX, sz.y + sz.height - 20);
  };

  // Obstacles, Fissures, Rubble, Broken cars
  const drawObstacles = (ctx: CanvasRenderingContext2D) => {
    obstaclesRef.current.forEach((obs) => {
      ctx.save();
      ctx.translate(obs.x, obs.y);
      ctx.rotate(obs.rotation);

      if (obs.type === 'fissure') {
        // Deep Earthquake Ground Crack
        ctx.fillStyle = '#0a0a0c';
        ctx.beginPath();
        ctx.moveTo(-obs.width / 2, -6);
        ctx.lineTo(-obs.width / 4, 10);
        ctx.lineTo(0, -8);
        ctx.lineTo(obs.width / 4, 12);
        ctx.lineTo(obs.width / 2, -4);
        ctx.lineTo(obs.width / 3, 16);
        ctx.lineTo(-obs.width / 3, 14);
        ctx.closePath();
        ctx.fill();

        // Glowing magma/sparks inside crack
        ctx.strokeStyle = '#ea580c';
        ctx.lineWidth = 2;
        ctx.stroke();
      } else if (obs.type === 'rubble_pile') {
        // Concrete Debris Mound
        ctx.fillStyle = '#57534e';
        ctx.beginPath();
        ctx.arc(0, 0, obs.width / 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Rubble blocks
        ctx.fillStyle = '#78716c';
        ctx.fillRect(-14, -12, 16, 14);
        ctx.fillRect(2, -8, 14, 16);
        ctx.fillRect(-8, 4, 18, 12);

        ctx.strokeStyle = '#292524';
        ctx.lineWidth = 2;
        ctx.strokeRect(-14, -12, 16, 14);
        ctx.strokeRect(2, -8, 14, 16);
      } else if (obs.type === 'broken_car') {
        // Abandoned Crushed Vehicle
        ctx.fillStyle = obs.color || '#dc2626';
        ctx.fillRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height);

        // Broken windshield
        ctx.fillStyle = '#334155';
        ctx.fillRect(-obs.width / 2 + 8, -obs.height / 2 + 4, 12, obs.height - 8);

        // Cracks on windshield
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-obs.width / 2 + 10, -obs.height / 2 + 6);
        ctx.lineTo(-obs.width / 2 + 18, -obs.height / 2 + 16);
        ctx.stroke();

        // Fire / smoke puff
        if (Math.random() < 0.08) {
          addParticle(obs.x, obs.y - 10, (Math.random() - 0.5) * 1.5, -Math.random() * 2, 4 + Math.random() * 4, '#64748b', 'smoke', 35);
        }
      } else if (obs.type === 'barricade') {
        // Warning Barricade
        ctx.fillStyle = '#eab308';
        ctx.fillRect(-obs.width / 2, -6, obs.width, 12);

        ctx.fillStyle = '#1e293b';
        for (let x = -obs.width / 2; x < obs.width / 2; x += 14) {
          ctx.beginPath();
          ctx.moveTo(x, -6);
          ctx.lineTo(x + 7, -6);
          ctx.lineTo(x, 6);
          ctx.lineTo(x - 7, 6);
          ctx.closePath();
          ctx.fill();
        }
      } else if (obs.type === 'hydrant') {
        // Spraying Water Hydrant
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, 0, 8, 0, Math.PI * 2);
        ctx.fill();

        // Water spray particles
        if (Math.random() < 0.4) {
          addParticle(
            obs.x + (Math.random() - 0.5) * 4,
            obs.y + (Math.random() - 0.5) * 4,
            (Math.random() - 0.5) * 4,
            -3 - Math.random() * 3,
            3 + Math.random() * 3,
            '#67e8f9',
            'spark',
            20
          );
        }
      } else if (obs.type === 'fallen_tree') {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-obs.width / 2, -4, obs.width, 8);
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(obs.width / 2 - 10, 0, 16, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  };

  // Buildings with 3D rooftop extrusion, damage, & enterable interior layouts
  const drawBuildings = (ctx: CanvasRenderingContext2D) => {
    const time = performance.now() / 1000;
    const player = playerRef.current;

    buildingsRef.current.forEach((b) => {
      const isPlayerInside =
        b.isEnterable &&
        player.x >= b.x &&
        player.x <= b.x + b.width &&
        player.y >= b.y &&
        player.y <= b.y + b.height;

      // Building base / drop shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.fillRect(b.x + 8, b.y + 12, b.width, b.height);

      // Building Outer Walls
      ctx.fillStyle = b.wallColor;
      ctx.fillRect(b.x, b.y, b.width, b.height);

      if (b.isEnterable) {
        // =====================================
        // ENTERABLE BUILDING INTERIOR LAYOUT
        // =====================================
        // 1. Interior Floor Tile Matrix
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(b.x + 6, b.y + 6, b.width - 12, b.height - 12);

        // Floor Grid
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1;
        for (let fx = b.x + 6; fx < b.x + b.width - 6; fx += 30) {
          ctx.beginPath();
          ctx.moveTo(fx, b.y + 6);
          ctx.lineTo(fx, b.y + b.height - 6);
          ctx.stroke();
        }
        for (let fy = b.y + 6; fy < b.y + b.height - 6; fy += 30) {
          ctx.beginPath();
          ctx.moveTo(b.x + 6, fy);
          ctx.lineTo(b.x + b.width - 6, fy);
          ctx.stroke();
        }

        // 2. Interior Room Partitions & Walls
        ctx.fillStyle = '#334155';
        // Left room divider (Triage Bay)
        ctx.fillRect(b.x + 130, b.y + 10, 8, b.height * 0.55);
        // Right room divider (Relief Depot)
        ctx.fillRect(b.x + b.width - 138, b.y + 10, 8, b.height * 0.55);

        // 3. Triage Hospital Beds / Cots
        const cots = [
          { x: b.x + 35, y: b.y + 35 },
          { x: b.x + 80, y: b.y + 35 },
          { x: b.x + 35, y: b.y + 85 },
          { x: b.x + 80, y: b.y + 85 },
        ];
        cots.forEach((cot) => {
          ctx.fillStyle = '#cbd5e1';
          ctx.fillRect(cot.x, cot.y, 28, 42);
          ctx.fillStyle = '#94a3b8';
          ctx.fillRect(cot.x + 2, cot.y + 2, 24, 10); // Pillow
          // Red cross on bed
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(cot.x + 11, cot.y + 20, 6, 14);
          ctx.fillRect(cot.x + 7, cot.y + 24, 14, 6);
        });

        // 4. Relief Supply Crates & Medical Kits
        const crates = [
          { x: b.x + b.width - 110, y: b.y + 35, color: '#059669' },
          { x: b.x + b.width - 70, y: b.y + 35, color: '#059669' },
          { x: b.x + b.width - 110, y: b.y + 80, color: '#d97706' },
          { x: b.x + b.width - 70, y: b.y + 80, color: '#2563eb' },
        ];
        crates.forEach((cr) => {
          ctx.fillStyle = cr.color;
          ctx.fillRect(cr.x, cr.y, 30, 30);
          ctx.strokeStyle = '#022c22';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(cr.x, cr.y, 30, 30);
          // Medical cross
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(cr.x + 12, cr.y + 6, 6, 18);
          ctx.fillRect(cr.x + 6, cr.y + 12, 18, 6);
        });

        // 5. Interior Room Signs
        ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'center';
        ctx.fillText('TRIAGE WARD', b.x + 70, b.y + 24);
        ctx.fillStyle = '#4ade80';
        ctx.fillText('RELIEF DEPOT', b.x + b.width - 75, b.y + 24);
        ctx.fillStyle = '#facc15';
        ctx.fillText('CENTRAL DISASTER SHELTER', b.x + b.width / 2, b.y + 30);

        // 6. Glowing Green Exit Signs over entrance door
        if (b.entrance) {
          const ent = b.entrance;
          ctx.fillStyle = '#15803d';
          ctx.fillRect(ent.x + 15, ent.y - 8, ent.width - 30, 8);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px system-ui, -apple-system, sans-serif';
          ctx.fillText('EMERGENCY EXIT ⬇', ent.x + ent.width / 2, ent.y - 1);
        }

        // 7. Roof rendering (Only if outside!)
        if (!isPlayerInside) {
          // Roof Top with entrance cutaway
          ctx.fillStyle = b.roofColor;
          ctx.fillRect(b.x + 4, b.y + 4, b.width - 8, b.height - 20);

          // Roof HVAC Units
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(b.x + 20, b.y + 20, 28, 22);
          ctx.fillRect(b.x + b.width - 48, b.y + 20, 28, 22);

          // Big Neon Rooftop Marquee
          const pulse = 0.5 + 0.5 * Math.sin(time * 5);
          ctx.fillStyle = `rgba(14, 165, 233, ${0.85 + pulse * 0.15})`;
          drawSafeRoundRect(ctx, b.x + 20, b.y + b.height / 2 - 22, b.width - 40, 36, 8);
          ctx.fill();
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 13px system-ui, -apple-system, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(`🚨 ${b.name.toUpperCase()} 🚨`, b.x + b.width / 2, b.y + b.height / 2 - 4);
          ctx.font = 'bold 10px system-ui, -apple-system, sans-serif';
          ctx.fillStyle = '#fef08a';
          ctx.fillText('⬇ DRIVE INSIDE TO RESCUE CITIZENS ⬇', b.x + b.width / 2, b.y + b.height / 2 + 10);
        }

        // 8. Entrance Ramps & Chevrons (Rendered at entrance opening)
        if (b.entrance) {
          const ent = b.entrance;
          // Hazard Stripes at threshold
          ctx.fillStyle = '#eab308';
          ctx.fillRect(ent.x, ent.y - 10, ent.width, 22);
          ctx.fillStyle = '#0f172a';
          for (let hx = ent.x; hx < ent.x + ent.width; hx += 16) {
            ctx.beginPath();
            ctx.moveTo(hx, ent.y - 10);
            ctx.lineTo(hx + 8, ent.y - 10);
            ctx.lineTo(hx, ent.y + 12);
            ctx.lineTo(hx - 8, ent.y + 12);
            ctx.closePath();
            ctx.fill();
          }

          // Animated green chevrons on ground outside entrance
          const chevronOffset = (time * 60) % 24;
          ctx.strokeStyle = '#22c55e';
          ctx.lineWidth = 3;
          for (let cy = ent.y + 8; cy < ent.y + 40; cy += 12) {
            const actualY = ent.y + 35 - ((cy + chevronOffset) % 30);
            ctx.beginPath();
            ctx.moveTo(ent.x + ent.width / 2 - 20, actualY + 8);
            ctx.lineTo(ent.x + ent.width / 2, actualY);
            ctx.lineTo(ent.x + ent.width / 2 + 20, actualY + 8);
            ctx.stroke();
          }

          // Entrance Gate Pillars & Flashing Beacons
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(ent.x - 10, ent.y - 12, 10, 24);
          ctx.fillRect(ent.x + ent.width, ent.y - 12, 10, 24);

          const beaconPulse = 0.5 + 0.5 * Math.sin(time * 8);
          ctx.fillStyle = `rgba(56, 189, 248, ${0.6 + beaconPulse * 0.4})`;
          ctx.beginPath();
          ctx.arc(ent.x - 5, ent.y, 8, 0, Math.PI * 2);
          ctx.arc(ent.x + ent.width + 5, ent.y, 8, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // =====================================
        // STANDARD BUILDING ROOF & DETAILS
        // =====================================
        ctx.fillStyle = b.roofColor;
        ctx.fillRect(b.x + 4, b.y + 4, b.width - 8, b.height - 8);

        // Roof HVAC units and details
        ctx.fillStyle = '#475569';
        ctx.fillRect(b.x + 20, b.y + 20, 28, 22);
        ctx.fillRect(b.x + b.width - 48, b.y + 20, 28, 22);

        // Earthquake damage cracks on roof
        if (b.damaged) {
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(b.x + 10, b.y + 10);
          ctx.lineTo(b.x + b.width * 0.4, b.y + b.height * 0.45);
          ctx.lineTo(b.x + b.width * 0.7, b.y + b.height * 0.3);
          ctx.lineTo(b.x + b.width - 10, b.y + b.height - 10);
          ctx.stroke();

          // Smoke puff from damaged buildings
          if (b.damageLevel >= 2 && Math.random() < 0.05) {
            addParticle(
              b.x + b.width / 2 + (Math.random() - 0.5) * 30,
              b.y + b.height / 2 + (Math.random() - 0.5) * 30,
              (Math.random() - 0.5) * 0.8,
              -1.5 - Math.random(),
              8 + Math.random() * 8,
              '#94a3b8',
              'smoke',
              60
            );
          }
        }

        // Building Name Plate
        ctx.fillStyle = '#e2e8f0';
        ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(b.name, b.x + b.width / 2, b.y + b.height / 2 + 4);
      }
    });
  };

  // NPC Emergency & Evacuation Traffic
  const drawNPCCars = (ctx: CanvasRenderingContext2D) => {
    const time = performance.now() / 1000;

    npcCarsRef.current.forEach((car) => {
      ctx.save();
      ctx.translate(car.x, car.y);
      ctx.rotate(car.angle);

      const length = car.height;
      const width = car.width;

      // 1. Vehicle Drop Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(-length / 2 + 3, -width / 2 + 4, length, width);

      // 2. Headlight illumination cones (subtle soft forward beam)
      if (car.headlights) {
        ctx.save();
        const beamGrad = ctx.createLinearGradient(length / 2, 0, length / 2 + 90, 0);
        beamGrad.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
        beamGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.moveTo(length / 2 - 4, -width / 2 + 4);
        ctx.lineTo(length / 2 + 90, -width / 2 - 20);
        ctx.lineTo(length / 2 + 90, width / 2 + 20);
        ctx.lineTo(length / 2 - 4, width / 2 - 4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }

      // 3. Vehicle Body by Type
      if (car.type === 'police') {
        // Police Interceptor
        ctx.fillStyle = '#0f172a';
        drawSafeRoundRect(ctx, -length / 2, -width / 2, length, width, 6);
        ctx.fill();

        // White door & roof panels
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-length / 2 + 16, -width / 2 + 2, length - 32, width - 4);

        // Windshields
        ctx.fillStyle = '#1e293b';
        drawSafeRoundRect(ctx, length / 2 - 28, -width / 2 + 4, 12, width - 8, 2);
        ctx.fill();
        drawSafeRoundRect(ctx, -length / 2 + 14, -width / 2 + 4, 10, width - 8, 2);
        ctx.fill();

        // Bullbar bumper
        ctx.fillStyle = '#334155';
        ctx.fillRect(length / 2 - 4, -width / 2 + 3, 5, width - 6);

        // Police Text
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 8px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('POLICE', 0, 3);

        // Flashing Lightbar
        const pFlash = Math.floor((time * 14) % 2);
        const lCol = pFlash === 0 ? '#ef4444' : '#1e293b';
        const rCol = pFlash === 1 ? '#3b82f6' : '#1e293b';

        ctx.fillStyle = '#0284c7';
        ctx.fillRect(-4, -width / 2 + 6, 8, width - 12);
        ctx.fillStyle = lCol;
        ctx.fillRect(-3, -width / 2 + 7, 6, 7);
        ctx.fillStyle = rCol;
        ctx.fillRect(-3, width / 2 - 14, 6, 7);

        // Lightbar glow
        ctx.fillStyle = pFlash === 0 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(59, 130, 246, 0.4)';
        ctx.beginPath();
        ctx.arc(0, 0, 24, 0, Math.PI * 2);
        ctx.fill();
      } else if (car.type === 'fire_truck') {
        // Fire Rescue Engine #9
        ctx.fillStyle = '#dc2626';
        drawSafeRoundRect(ctx, -length / 2, -width / 2, length, width, 5);
        ctx.fill();

        // Yellow hazard rear chevron stripes
        ctx.fillStyle = '#eab308';
        ctx.fillRect(-length / 2, -width / 2 + 3, 6, width - 6);

        // Chrome bumper
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(length / 2 - 4, -width / 2 + 2, 5, width - 4);

        // Roof ladder rack
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(-length / 2 + 10, -width / 2 + 6, length - 28, 4);
        ctx.fillRect(-length / 2 + 10, width / 2 - 10, length - 28, 4);

        // Windshield
        ctx.fillStyle = '#0f172a';
        drawSafeRoundRect(ctx, length / 2 - 24, -width / 2 + 4, 12, width - 8, 2);
        ctx.fill();

        // Fire text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 8px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('FIRE RESCUE', 2, 3);

        // Dual roof flashers
        const fFlash = Math.floor((time * 10) % 2);
        ctx.fillStyle = fFlash === 0 ? '#ef4444' : '#eab308';
        ctx.beginPath();
        ctx.arc(length / 2 - 16, -width / 2 + 6, 4, 0, Math.PI * 2);
        ctx.arc(length / 2 - 16, width / 2 - 6, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (car.type === 'evacuation_bus') {
        // City Evacuation Metro Bus
        ctx.fillStyle = '#eab308';
        drawSafeRoundRect(ctx, -length / 2, -width / 2, length, width, 6);
        ctx.fill();

        // White roof banner
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(-length / 2 + 10, -width / 2 + 6, length - 20, width - 12);

        // Passenger windows row
        ctx.fillStyle = '#1e293b';
        for (let wx = -length / 2 + 14; wx < length / 2 - 20; wx += 14) {
          ctx.fillRect(wx, -width / 2 + 2, 10, 4);
          ctx.fillRect(wx, width / 2 - 6, 10, 4);
        }

        // Front Windshield
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(length / 2 - 16, -width / 2 + 4, 10, width - 8);

        // Destination Billboard
        ctx.fillStyle = '#15803d';
        ctx.fillRect(length / 2 - 24, -width / 2 + 8, 6, width - 16);
        ctx.fillStyle = '#86efac';
        ctx.font = 'bold 6px system-ui, -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('EVAC', length / 2 - 21, 2);

        // Roof text
        ctx.fillStyle = '#854d0e';
        ctx.font = 'bold 7px system-ui, -apple-system, sans-serif';
        ctx.fillText('CITY EVAC BUS', -2, 2);
      } else {
        // Civilian SUV / Sedan / Medic
        ctx.fillStyle = car.color;
        drawSafeRoundRect(ctx, -length / 2, -width / 2, length, width, 6);
        ctx.fill();

        // Roof panel
        ctx.fillStyle = car.roofColor || '#1e293b';
        drawSafeRoundRect(ctx, -length / 2 + 10, -width / 2 + 4, length - 24, width - 8, 3);
        ctx.fill();

        // Windshields
        ctx.fillStyle = '#0f172a';
        drawSafeRoundRect(ctx, length / 2 - 22, -width / 2 + 5, 8, width - 10, 2);
        ctx.fill();
        drawSafeRoundRect(ctx, -length / 2 + 10, -width / 2 + 5, 6, width - 10, 2);
        ctx.fill();

        // Roof rack for civilian SUV with evacuation luggage
        if (car.type === 'civilian_suv') {
          ctx.fillStyle = '#475569';
          ctx.fillRect(-length / 2 + 14, -width / 2 + 7, length - 32, width - 14);
          // Luggage bags
          ctx.fillStyle = '#f97316';
          ctx.fillRect(-length / 2 + 16, -width / 2 + 9, 8, 6);
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(-length / 2 + 26, -width / 2 + 9, 10, 6);
        }

        // Paramedic van cross
        if (car.type === 'ambulance_npc') {
          ctx.fillStyle = '#10b981';
          ctx.fillRect(-4, -width / 2 + 8, 8, width - 16);
          ctx.fillRect(-8, -2, 16, 4);
        }
      }

      // Headlight bulbs
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(length / 2 - 2, -width / 2 + 5, 2.5, 0, Math.PI * 2);
      ctx.arc(length / 2 - 2, width / 2 - 5, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Taillights (glow bright red when car is braking!)
      ctx.fillStyle = car.braking ? '#ff0000' : '#b91c1c';
      ctx.fillRect(-length / 2, -width / 2 + 4, 3, 5);
      ctx.fillRect(-length / 2, width / 2 - 9, 3, 5);

      if (car.braking) {
        ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';
        ctx.beginPath();
        ctx.arc(-length / 2 - 2, -width / 2 + 6, 6, 0, Math.PI * 2);
        ctx.arc(-length / 2 - 2, width / 2 - 6, 6, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  };

  // Stranded survivors and dynamic running evacuees rendering
  const drawSurvivors = (ctx: CanvasRenderingContext2D) => {
    const time = performance.now() / 1000;
    const player = playerRef.current;

    survivorsRef.current.forEach((survivor) => {
      if (survivor.rescued || survivor.delivered) return;

      const wave = Math.sin(time * 6 + survivor.wavePhase);
      const pulseRing = 18 + Math.sin(time * 4 + survivor.wavePhase) * 6;
      const isRunning = survivor.isRunning && !survivor.isTrapped;
      const legCycle = Math.sin(survivor.legPhase || 0);

      // 1. Pulsing SOS Beacon Ring
      ctx.strokeStyle = isRunning ? 'rgba(34, 197, 94, 0.75)' : 'rgba(245, 158, 11, 0.75)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(survivor.x, survivor.y, pulseRing, 0, Math.PI * 2);
      ctx.stroke();

      // Outer radar pulse
      ctx.strokeStyle = isRunning ? 'rgba(56, 189, 248, 0.3)' : 'rgba(239, 68, 68, 0.3)';
      ctx.beginPath();
      ctx.arc(survivor.x, survivor.y, pulseRing + 12, 0, Math.PI * 2);
      ctx.stroke();

      // 2. Survivor Character Body (Top-down view with rotation when running)
      ctx.save();
      ctx.translate(survivor.x, survivor.y);

      if (isRunning && survivor.facingAngle !== undefined) {
        ctx.rotate(survivor.facingAngle);
      }

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(0, 4, 10, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Animated Running Legs (when running)
      if (isRunning) {
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 3.5;
        // Left leg stride
        ctx.beginPath();
        ctx.moveTo(-4, -2);
        ctx.lineTo(-4 + legCycle * 7, 7);
        ctx.stroke();
        // Right leg stride
        ctx.beginPath();
        ctx.moveTo(4, -2);
        ctx.lineTo(4 - legCycle * 7, 7);
        ctx.stroke();
      }

      // Torso / Shirt
      ctx.fillStyle = survivor.shirtColor;
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();

      // Head / Hair
      ctx.fillStyle = survivor.avatarColor;
      ctx.beginPath();
      ctx.arc(0, -1, 5, 0, Math.PI * 2);
      ctx.fill();

      // Running backpack / emergency kit
      if (isRunning) {
        ctx.fillStyle = '#f97316';
        ctx.fillRect(-5, -7, 10, 4);
      }

      // Arms (Pumping when running, waving when trapped/waiting)
      ctx.strokeStyle = survivor.avatarColor;
      ctx.lineWidth = 3;
      if (isRunning) {
        // Running arm pump
        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.lineTo(-10, -legCycle * 6);
        ctx.moveTo(6, 0);
        ctx.lineTo(10, legCycle * 6);
        ctx.stroke();
      } else {
        // Waving arms
        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.lineTo(-12, -6 + wave * 4);
        ctx.moveTo(6, 0);
        ctx.lineTo(12, -6 - wave * 4);
        ctx.stroke();
      }

      ctx.restore();

      // 3. Overhead Speech Badge / Status
      ctx.save();
      const bubbleY = survivor.y - 28;
      const distToPlayer = Math.hypot(player.x - survivor.x, player.y - survivor.y);

      let badgeBg = '#ef4444';
      let badgeText = 'HELP!';
      let badgeWidth = 48;

      if (isRunning) {
        if (distToPlayer < 400) {
          badgeBg = '#0284c7';
          badgeText = '🏃 RESCUE!';
          badgeWidth = 64;
        } else {
          badgeBg = '#16a34a';
          badgeText = '🏃 EVACUATING';
          badgeWidth = 84;
        }
      }

      ctx.fillStyle = badgeBg;
      drawSafeRoundRect(ctx, survivor.x - badgeWidth / 2, bubbleY - 14, badgeWidth, 18, 6);
      ctx.fill();

      // Bubble tail
      ctx.beginPath();
      ctx.moveTo(survivor.x - 4, bubbleY + 4);
      ctx.lineTo(survivor.x + 4, bubbleY + 4);
      ctx.lineTo(survivor.x, bubbleY + 9);
      ctx.closePath();
      ctx.fill();

      // Text
      ctx.fillStyle = '#ffffff';
      ctx.font = '900 9.5px system-ui, -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(badgeText, survivor.x, bubbleY - 1);
      ctx.restore();
    });
  };

  // Player Rescue Vehicle & Male Rescue Driver
  const drawPlayerCar = (ctx: CanvasRenderingContext2D) => {
    const player = playerRef.current;
    const time = performance.now() / 1000;

    const w = player.height; // along driving axis (82px)
    const h = player.width; // lateral width (44px)
    const isCarFull = player.passengers.length >= player.maxCapacity;
    const rescueRadius = 125; // Normal calibrated rescue circle
    const pulse = Math.sin(time * 4) * 3;
    const currentRadius = rescueRadius + pulse;

    // 1. GLOWING RESCUE COLLECTION CIRCLE (Survivors touching this circle are collected!)
    ctx.save();
    ctx.translate(player.x, player.y);

    // Inner glowing radial gradient field
    const auraGrad = ctx.createRadialGradient(0, 0, 15, 0, 0, currentRadius);
    if (isCarFull) {
      auraGrad.addColorStop(0, 'rgba(245, 158, 11, 0.22)');
      auraGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.10)');
      auraGrad.addColorStop(0.85, 'rgba(245, 158, 11, 0.04)');
      auraGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    } else {
      auraGrad.addColorStop(0, 'rgba(34, 197, 94, 0.25)');
      auraGrad.addColorStop(0.45, 'rgba(6, 182, 212, 0.13)');
      auraGrad.addColorStop(0.85, 'rgba(34, 197, 94, 0.05)');
      auraGrad.addColorStop(1, 'rgba(34, 197, 94, 0)');
    }
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
    ctx.fill();

    // Mid-range tactical radar concentric ring
    ctx.strokeStyle = isCarFull ? 'rgba(245, 158, 11, 0.22)' : 'rgba(56, 189, 248, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 6]);
    ctx.lineDashOffset = time * 15;
    ctx.beginPath();
    ctx.arc(0, 0, currentRadius * 0.52, 0, Math.PI * 2);
    ctx.stroke();

    // Outer glowing dashed boundary ring
    ctx.strokeStyle = isCarFull ? '#f59e0b' : '#22c55e';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([10, 6]);
    ctx.lineDashOffset = -time * 24;
    ctx.beginPath();
    ctx.arc(0, 0, currentRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Expanding scanner wave pulse
    const wavePhase = (time * 1.1) % 1;
    const waveR = 25 + wavePhase * (rescueRadius - 25);
    ctx.strokeStyle = isCarFull
      ? `rgba(245, 158, 11, ${0.45 * (1 - wavePhase)})`
      : `rgba(34, 197, 94, ${0.55 * (1 - wavePhase)})`;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, waveR, 0, Math.PI * 2);
    ctx.stroke();

    // Rotating perimeter sensor corner markers & radar tick marks
    const markerCount = 6;
    for (let i = 0; i < markerCount; i++) {
      const markerAngle = time * 0.6 + (i * Math.PI * 2) / markerCount;
      const mx = Math.cos(markerAngle) * currentRadius;
      const my = Math.sin(markerAngle) * currentRadius;
      
      // Radar cross tick
      ctx.strokeStyle = isCarFull ? '#fbbf24' : '#4ade80';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(mx - Math.cos(markerAngle) * 5, my - Math.sin(markerAngle) * 5);
      ctx.lineTo(mx + Math.cos(markerAngle) * 5, my + Math.sin(markerAngle) * 5);
      ctx.stroke();

      // Glowing dot
      ctx.fillStyle = isCarFull ? '#fbbf24' : '#4ade80';
      ctx.beginPath();
      ctx.arc(mx, my, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Subtle HUD range text indicator on circle edge
    ctx.fillStyle = isCarFull ? 'rgba(251, 191, 36, 0.7)' : 'rgba(74, 222, 128, 0.75)';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(isCarFull ? '⚠️ VEHICLE FULL' : 'RESCUE AURA: 12m', 0, -currentRadius - 6);

    ctx.restore();

    // 2. Main Vehicle Body Rendering
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);

    // Car Drop Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.fillRect(-w / 2 + 4, -h / 2 + 6, w, h);

    // Main Rescue Vehicle Body (Disaster orange & tactical rescue styling)
    ctx.fillStyle = '#ea580c';
    drawSafeRoundRect(ctx, -w / 2, -h / 2, w, h, 8);
    ctx.fill();

    // Rescue vehicle white central stripes
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-w / 2 + 12, -h / 2, w - 24, 6);
    ctx.fillRect(-w / 2 + 12, h / 2 - 6, w - 24, 6);

    // Hood / Front Push Bumper (Bullbar)
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(w / 2 - 8, -h / 2 + 2, 8, h - 4);
    // Grill
    ctx.fillStyle = '#334155';
    ctx.fillRect(w / 2 - 16, -h / 2 + 6, 8, h - 12);

    // Headlight bulbs (compact sleek front lights without triangular cones)
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(w / 2 - 2, -h / 2 + 7, 3, 0, Math.PI * 2);
    ctx.arc(w / 2 - 2, h / 2 - 7, 3, 0, Math.PI * 2);
    ctx.fill();

    // Front Windshield with Male Rescue Driver Inside
    ctx.fillStyle = '#0f172a';
    drawSafeRoundRect(ctx, w / 2 - 38, -h / 2 + 6, 18, h - 12, 3);
    ctx.fill();

    // Driver Character (Male Driver with Rescue Helmet / Cap & Visor)
    const driverX = w / 2 - 28;
    const driverY = -h / 2 + 14;
    // Torso / Rescue Vest
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(driverX, driverY, 6, 0, Math.PI * 2);
    ctx.fill();
    // Helmet / Head
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(driverX + 1, driverY, 4.5, 0, Math.PI * 2);
    ctx.fill();
    // Visor
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(driverX + 3, driverY - 2, 3, 4);

    // Rear Passenger Cabin & Passenger Indicator Icons
    ctx.fillStyle = '#1e293b';
    drawSafeRoundRect(ctx, -w / 2 + 10, -h / 2 + 6, 32, h - 12, 4);
    ctx.fill();

    // Passenger Seats Visualization inside cabin
    const seatCols = 3;
    player.passengers.forEach((passenger, idx) => {
      const col = idx % seatCols;
      const row = Math.floor(idx / seatCols);
      const px = -w / 2 + 18 + col * 9;
      const py = -h / 2 + 12 + row * 10;

      // Passenger avatar dot
      ctx.fillStyle = passenger.shirtColor || '#22c55e';
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Emergency Flashing Lightbar on Roof
    const flashPhase = Math.floor((time * 12) % 4);
    const leftLightColor = flashPhase < 2 ? '#ef4444' : '#1e293b';
    const rightLightColor = flashPhase >= 2 ? '#3b82f6' : '#1e293b';

    // Lightbar frame
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-4, -h / 2 + 4, 10, h - 8);

    // Red beacon
    ctx.fillStyle = player.sirenActive ? leftLightColor : '#7f1d1d';
    ctx.fillRect(-2, -h / 2 + 6, 6, 12);
    // Blue beacon
    ctx.fillStyle = player.sirenActive ? rightLightColor : '#1e3a8a';
    ctx.fillRect(-2, h / 2 - 18, 6, 12);

    // Strobe glow if siren active
    if (player.sirenActive) {
      ctx.fillStyle = flashPhase < 2 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(59, 130, 246, 0.4)';
      ctx.beginPath();
      ctx.arc(0, 0, 32, 0, Math.PI * 2);
      ctx.fill();
    }

    // Tail lights / Brake lights
    const isBraking = keysPressedRef.current['s'] || keysPressedRef.current['arrowdown'];
    ctx.fillStyle = isBraking ? '#ff0000' : '#b91c1c';
    ctx.fillRect(-w / 2, -h / 2 + 4, 4, 8);
    ctx.fillRect(-w / 2, h / 2 - 12, 4, 8);

    if (isBraking) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.5)';
      ctx.beginPath();
      ctx.arc(-w / 2, 0, 20, 0, Math.PI * 2);
      ctx.fill();
    }

    // Vehicle text markings
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('RESCUE 01', 0, 3);

    ctx.restore();
  };

  // Sleek Navigational Target Waypoint (Clean beacon on map, no triangle attached to vehicle)
  const drawNavigationalArrow = (ctx: CanvasRenderingContext2D) => {
    const player = playerRef.current;
    const sz = safeZoneRef.current;
    const isCarFull = player.passengers.length >= player.maxCapacity;

    let targetX = sz.x + sz.width / 2;
    let targetY = sz.y + sz.height / 2;
    let label = 'SAFE ZONE';
    let color = '#22c55e';

    if (!isCarFull) {
      // Find closest unrescued survivor
      let closestDist = Infinity;
      let closestSurvivor: Survivor | null = null;

      survivorsRef.current.forEach((s) => {
        if (s.rescued || s.delivered) return;
        const d = Math.hypot(player.x - s.x, player.y - s.y);
        if (d < closestDist) {
          closestDist = d;
          closestSurvivor = s;
        }
      });

      if (closestSurvivor) {
        targetX = (closestSurvivor as Survivor).x;
        targetY = (closestSurvivor as Survivor).y;
        label = `SURVIVOR (${Math.round(closestDist / 10)}m)`;
        color = '#fbbf24';
      }
    } else {
      const distToSafe = Math.hypot(player.x - targetX, player.y - targetY);
      label = `SAFE ZONE (${Math.round(distToSafe / 10)}m)`;
    }

    // Angle to target
    const angleToTarget = Math.atan2(targetY - player.y, targetX - player.x);
    const beaconDist = 135;
    const beaconX = player.x + Math.cos(angleToTarget) * beaconDist;
    const beaconY = player.y + Math.sin(angleToTarget) * beaconDist;

    // Glowing waypoint dot on perimeter of rescue field
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(beaconX, beaconY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Waypoint pulse ring
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(beaconX, beaconY, 9, 0, Math.PI * 2);
    ctx.stroke();

    // Target label
    ctx.font = 'bold 11px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, beaconX, beaconY + (angleToTarget > 0 ? 18 : -14));
    ctx.restore();
  };

  // Particles rendering
  const drawParticles = (ctx: CanvasRenderingContext2D) => {
    particlesRef.current.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      if (p.type === 'star') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'smoke' || p.type === 'dust') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
      ctx.restore();
    });
  };

  // Floating text messages
  const drawFloatingTexts = (ctx: CanvasRenderingContext2D) => {
    floatingTextsRef.current.forEach((ft) => {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.font = `bold ${ft.size}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';

      // Outline
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.strokeText(ft.text, ft.x, ft.y);

      // Fill
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none">
      <canvas ref={canvasRef} className="block w-full h-full bg-[#18181b] cursor-crosshair" />
    </div>
  );
};
