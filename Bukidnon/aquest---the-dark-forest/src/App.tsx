/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameRenderer } from './game/canvasRenderer';
import { 
  LEVELS, 
  BUCKET_PICKUP_RADIUS, 
  HOUSE_DELIVERY_RADIUS, 
  PLAYER_SIZE, 
  LEVEL_TIME_LIMIT,
  CREATURE_MAX_STAMINA,
  CREATURE_STAMINA_DRAIN_RATE,
  CREATURE_REST_DURATION
} from './game/constants';
import { soundEngine } from './audio/soundEngine';
import { Creature, GameState, Particle, PlayerStats, Vector2D, WaterBucket } from './types';
import { HUD } from './components/HUD';
import { StartScreen } from './components/StartScreen';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';
import { LevelClearModal } from './components/LevelClearModal';
import { PauseModal } from './components/PauseModal';
import { TouchControls } from './components/TouchControls';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<GameRenderer | null>(null);

  // Game Lifecycle State
  const [gameState, setGameState] = useState<GameState>('menu');
  const [currentLevelIdx, setCurrentLevelIdx] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Stats
  const [stats, setStats] = useState<PlayerStats>({
    lives: 3,
    maxLives: 3,
    stamina: 100,
    maxStamina: 100,
    isSprinting: false,
    flashlightOn: true,
    battery: 100,
    maxBattery: 100,
    invulnerableTime: 0,
    score: 0,
    totalBucketsDelivered: 0,
    timeRemaining: LEVEL_TIME_LIMIT,
    maxTime: LEVEL_TIME_LIMIT,
    timeElapsed: 0,
    nearMisses: 0,
    carryingBucketId: null,
    bucketsDeliveredInLevel: 0,
  });

  const [buckets, setBuckets] = useState<WaterBucket[]>([]);
  const currentLevel = LEVELS[currentLevelIdx] || LEVELS[0];

  // Mutable Game Loop State in Refs for 60fps responsiveness
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const touchDirRef = useRef<Vector2D>({ x: 0, y: 0 });
  const mousePosRef = useRef<Vector2D>({ x: 0, y: 0 });

  const playerPosRef = useRef<Vector2D>({ ...currentLevel.spawnPoint });
  const playerFacingAngleRef = useRef<number>(-Math.PI / 2);
  const playerWalkCycleRef = useRef<number>(0);
  const playerMovingRef = useRef<boolean>(false);

  const creaturesRef = useRef<Creature[]>([]);
  const jumpscareTimerRef = useRef<number>(0);

  const bucketsRef = useRef<WaterBucket[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const screenShakeRef = useRef<number>(0);
  const statsRef = useRef<PlayerStats>(stats);
  const footstepTimerRef = useRef<number>(0);

  // Sync statsRef
  useEffect(() => {
    statsRef.current = stats;
  }, [stats]);

  // Initialize Level entities
  const initLevel = useCallback((levelIdx: number, resetLives: boolean = false) => {
    const lvl = LEVELS[levelIdx] || LEVELS[0];
    setCurrentLevelIdx(levelIdx);

    playerPosRef.current = { ...lvl.spawnPoint };
    playerFacingAngleRef.current = -Math.PI / 2; // Facing up into forest
    playerMovingRef.current = false;
    jumpscareTimerRef.current = 0;

    // Setup buckets
    const initialBuckets: WaterBucket[] = lvl.bucketPositions.map((pos, idx) => ({
      id: `bucket-${levelIdx}-${idx}`,
      x: pos.x,
      y: pos.y,
      collected: false,
      delivered: false,
      pulsePhase: Math.random() * Math.PI * 2,
    }));
    bucketsRef.current = initialBuckets;
    setBuckets(initialBuckets);

    // Setup creatures multiplying per level
    const spawns = lvl.creatureSpawns || [lvl.creatureSpawn];
    const initialCreatures: Creature[] = spawns.map((spawn, idx) => {
      const offsetX = (idx % 2 === 0 ? 1 : -1) * (200 + idx * 50);
      const offsetY = (idx > 1 ? -1 : 1) * (160 + idx * 40);
      return {
        id: `creature-${levelIdx}-${idx}`,
        x: spawn.x,
        y: spawn.y,
        targetX: spawn.x,
        targetY: spawn.y,
        state: 'wandering',
        speed: lvl.creatureSpeed,
        sightRadius: lvl.creatureSightRadius,
        huntTimer: 0,
        stamina: CREATURE_MAX_STAMINA,
        maxStamina: CREATURE_MAX_STAMINA,
        restTimer: 0,
        animFrame: 0,
        legPhase: (idx * Math.PI) / 2,
        lastSeenPlayerPos: null,
        patrolPoints: [
          { x: Math.max(100, Math.min(lvl.mapWidth - 100, spawn.x - offsetX)), y: Math.max(100, Math.min(lvl.mapHeight - 100, spawn.y)) },
          { x: Math.max(100, Math.min(lvl.mapWidth - 100, spawn.x + offsetX)), y: Math.max(100, Math.min(lvl.mapHeight - 100, spawn.y + offsetY)) },
          { x: Math.max(100, Math.min(lvl.mapWidth - 100, spawn.x)), y: Math.max(100, Math.min(lvl.mapHeight - 100, spawn.y - offsetY)) },
          { x: Math.max(100, Math.min(lvl.mapWidth - 100, spawn.x - offsetX * 0.6)), y: Math.max(100, Math.min(lvl.mapHeight - 100, spawn.y + offsetY * 0.8)) },
        ],
        currentPatrolIdx: idx % 4,
      };
    });
    creaturesRef.current = initialCreatures;

    particlesRef.current = [];
    screenShakeRef.current = 0;

    setStats((prev) => ({
      ...prev,
      lives: resetLives ? 3 : prev.lives,
      invulnerableTime: 0,
      flashlightOn: true,
      timeRemaining: LEVEL_TIME_LIMIT,
      carryingBucketId: null,
      bucketsDeliveredInLevel: 0,
    }));
  }, []);

  // Handle Game Start
  const handleStartGame = () => {
    soundEngine.init();
    soundEngine.setMute(isMuted);
    initLevel(0, true);
    setGameState('playing');
  };

  // Handle Retry after Game Over
  const handleRetry = () => {
    initLevel(currentLevelIdx, true);
    setGameState('playing');
  };

  // Handle Level Advance
  const handleNextLevel = () => {
    const nextIdx = currentLevelIdx + 1;
    if (nextIdx < LEVELS.length) {
      initLevel(nextIdx, false);
      setGameState('playing');
    } else {
      setGameState('victory');
    }
  };

  // Toggle Flashlight
  const handleToggleFlashlight = useCallback(() => {
    setStats((prev) => {
      const nextState = !prev.flashlightOn;
      soundEngine.playFlashlightClick(nextState);
      return { ...prev, flashlightOn: nextState };
    });
  }, []);

  // Toggle Mute
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    soundEngine.setMute(nextMuted);
  };

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = true;
      keysRef.current[e.code] = true;

      // Toggle flashlight with F
      if (e.key.toLowerCase() === 'f') {
        handleToggleFlashlight();
      }

      // Pause with Escape or P
      if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
        setGameState((prev) => (prev === 'playing' ? 'paused' : prev === 'paused' ? 'playing' : prev));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key.toLowerCase()] = false;
      keysRef.current[e.code] = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      mousePosRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [handleToggleFlashlight]);

  // Main 60 FPS Game Loop
  useEffect(() => {
    if (!rendererRef.current) {
      rendererRef.current = new GameRenderer();
    }

    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1); // clamp delta time
      lastTime = time;

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');

      if (canvas && ctx && rendererRef.current && gameState === 'playing') {
        const lvl = LEVELS[currentLevelIdx] || LEVELS[0];
        const currentStats = statsRef.current;

        // 1. Calculate Player Movement
        // Character speed is exactly the same as creature speed in this level!
        const playerSpeed = lvl.creatureSpeed;

        let moveX = 0;
        let moveY = 0;

        const keys = keysRef.current;
        if (keys['w'] || keys['arrowup']) moveY -= 1;
        if (keys['s'] || keys['arrowdown']) moveY += 1;
        if (keys['a'] || keys['arrowleft']) moveX -= 1;
        if (keys['d'] || keys['arrowright']) moveX += 1;

        // Add touch input if active
        if (touchDirRef.current.x !== 0 || touchDirRef.current.y !== 0) {
          moveX += touchDirRef.current.x;
          moveY += touchDirRef.current.y;
        }

        const moveMag = Math.hypot(moveX, moveY);
        const isMoving = moveMag > 0.05;
        playerMovingRef.current = isMoving;

        if (isMoving) {
          const normX = (moveX / moveMag) * playerSpeed;
          const normY = (moveY / moveMag) * playerSpeed;

          let newX = playerPosRef.current.x + normX;
          let newY = playerPosRef.current.y + normY;

          // Map boundary collision
          newX = Math.max(PLAYER_SIZE, Math.min(lvl.mapWidth - PLAYER_SIZE, newX));
          newY = Math.max(PLAYER_SIZE, Math.min(lvl.mapHeight - PLAYER_SIZE, newY));

          // Obstacle collision detection
          for (const obs of lvl.obstacles) {
            const obsRadius = obs.radius || Math.max(obs.width, obs.height) / 2;
            const dist = Math.hypot(newX - obs.x, newY - obs.y);
            const minDist = PLAYER_SIZE + obsRadius;

            if (dist < minDist) {
              const angle = Math.atan2(newY - obs.y, newX - obs.x);
              newX = obs.x + Math.cos(angle) * minDist;
              newY = obs.y + Math.sin(angle) * minDist;
            }
          }

          playerPosRef.current = { x: newX, y: newY };
          playerWalkCycleRef.current += 0.24;

          // Player footstep audio & dust particles
          footstepTimerRef.current += dt;
          if (footstepTimerRef.current > 0.34) {
            footstepTimerRef.current = 0;
            soundEngine.playFootstep();

            particlesRef.current.push({
              x: newX + (Math.random() - 0.5) * 8,
              y: newY + 8,
              vx: (Math.random() - 0.5) * 10,
              vy: (Math.random() - 0.5) * 10,
              life: 0.35,
              maxLife: 0.35,
              size: 2,
              color: '#334155',
              alpha: 0.35,
            });
          }
        }

        // 2. Flashlight & Facing Direction (Mouse or Movement)
        const camX = Math.max(0, Math.min(lvl.mapWidth - canvas.width, playerPosRef.current.x - canvas.width / 2));
        const camY = Math.max(0, Math.min(lvl.mapHeight - canvas.height, playerPosRef.current.y - canvas.height / 2));
        const playerScreenX = playerPosRef.current.x - camX;
        const playerScreenY = playerPosRef.current.y - camY;

        const mouseDx = mousePosRef.current.x - playerScreenX;
        const mouseDy = mousePosRef.current.y - playerScreenY;
        if (Math.hypot(mouseDx, mouseDy) > 30) {
          playerFacingAngleRef.current = Math.atan2(mouseDy, mouseDx);
        } else if (isMoving) {
          playerFacingAngleRef.current = Math.atan2(moveY, moveX);
        }

        // 3. Update Timers (5-Minute Countdown & Invulnerability)
        const newTimeRemaining = Math.max(0, currentStats.timeRemaining - dt);
        const newInvuln = Math.max(0, currentStats.invulnerableTime - dt);

        if (newTimeRemaining <= 0 && currentStats.timeRemaining > 0) {
          soundEngine.playGameOver();
          setGameState('game_over');
        }

        // 4. Update Jumpscare Timer
        if (jumpscareTimerRef.current > 0) {
          jumpscareTimerRef.current = Math.max(0, jumpscareTimerRef.current - dt);
        }

        // 5. Multiple Creatures AI & Stamina System
        const creatures = creaturesRef.current;
        let minCreatureDist = Infinity;
        let anyCreatureHunting = false;
        let anyCreatureResting = false;

        for (const creature of creatures) {
          const distToPlayer = Math.hypot(playerPosRef.current.x - creature.x, playerPosRef.current.y - creature.y);
          const angleToPlayer = Math.atan2(playerPosRef.current.y - creature.y, playerPosRef.current.x - creature.x);

          if (distToPlayer < minCreatureDist) {
            minCreatureDist = distToPlayer;
          }
          if (creature.state === 'hunting') anyCreatureHunting = true;
          if (creature.state === 'resting') anyCreatureResting = true;

          // Flashlight Illuminating Check (Cone geometry)
          const angleFromPlayerToCreature = Math.atan2(creature.y - playerPosRef.current.y, creature.x - playerPosRef.current.x);
          let angleDiff = Math.abs(playerFacingAngleRef.current - angleFromPlayerToCreature);
          while (angleDiff > Math.PI) angleDiff = Math.abs(angleDiff - Math.PI * 2);

          const isDirectlyIlluminated =
            currentStats.flashlightOn &&
            distToPlayer < lvl.flashlightRadius &&
            angleDiff < lvl.flashlightAngle / 2;

          const isPlayerRevealedByLight =
            currentStats.flashlightOn &&
            distToPlayer < creature.sightRadius;

          // State Transitions for Creature
          if (creature.state === 'resting') {
            // Creature is exhausted and catching breath
            creature.restTimer -= dt;
            // Regenerate stamina back to full
            creature.stamina = Math.min(
              creature.maxStamina, 
              creature.stamina + (creature.maxStamina / CREATURE_REST_DURATION) * dt
            );

            if (creature.restTimer <= 0 || creature.stamina >= creature.maxStamina) {
              // Finished resting, resume patrol
              creature.state = 'wandering';
              creature.stamina = creature.maxStamina;
            }
          } else {
            // Flashlight-Only Detection logic:
            // The creature CANNOT locate the player unless the flashlight is illuminated / ON!
            if (!currentStats.flashlightOn) {
              // Darkness stealth: creature loses player immediately if light is off
              if (creature.state === 'hunting') {
                creature.huntTimer -= dt * 3.0; // rapidly lose track in the dark
                if (creature.huntTimer <= 0) {
                  creature.state = 'wandering';
                  creature.lastSeenPlayerPos = null;
                }
              }
            } else {
              // Flashlight is ON: check if creature spots the player or is illuminated
              if ((isDirectlyIlluminated || isPlayerRevealedByLight) && creature.stamina > 10) {
                if (creature.state !== 'hunting') {
                  soundEngine.playCreatureScreech();
                  setStats((prev) => ({ ...prev, nearMisses: prev.nearMisses + 1 }));
                }
                creature.state = 'hunting';
                creature.huntTimer = 4.0;
                creature.lastSeenPlayerPos = { ...playerPosRef.current };
              } else if (creature.state === 'hunting') {
                creature.huntTimer -= dt;
                if (creature.huntTimer <= 0) {
                  creature.state = 'wandering';
                }
              }
            }

            // Stamina consumption / recovery when active
            if (creature.state === 'hunting') {
              creature.stamina -= CREATURE_STAMINA_DRAIN_RATE * dt;
              if (creature.stamina <= 0) {
                // Creature exhausts its stamina!
                creature.stamina = 0;
                creature.state = 'resting';
                creature.restTimer = CREATURE_REST_DURATION;
                soundEngine.playCreatureExhaustedBreath();
              }
            } else {
              // Wandering gently recovers stamina
              creature.stamina = Math.min(creature.maxStamina, creature.stamina + 14 * dt);
            }
          }

          // Creature Movement
          let nextCreatureX = creature.x;
          let nextCreatureY = creature.y;

          if (creature.state === 'hunting') {
            // Relentless chase at matched speed with character
            const cDx = playerPosRef.current.x - creature.x;
            const cDy = playerPosRef.current.y - creature.y;
            const cDist = Math.hypot(cDx, cDy);
            if (cDist > 5) {
              const chaseSpeed = lvl.creatureSpeed; // Exact same speed as character
              nextCreatureX += (cDx / cDist) * chaseSpeed;
              nextCreatureY += (cDy / cDist) * chaseSpeed;
              creature.legPhase += chaseSpeed * 0.14;
            }
          } else if (creature.state === 'wandering') {
            // Patrol movement
            const curPatrol = creature.patrolPoints[creature.currentPatrolIdx];
            const distToPatrol = Math.hypot(curPatrol.x - creature.x, curPatrol.y - creature.y);
            if (distToPatrol < 40) {
              creature.currentPatrolIdx = (creature.currentPatrolIdx + 1) % creature.patrolPoints.length;
            }
            const cDx = curPatrol.x - creature.x;
            const cDy = curPatrol.y - creature.y;
            const cDist = Math.hypot(cDx, cDy);
            if (cDist > 5) {
              const wanderSpeed = lvl.creatureSpeed * 0.65;
              nextCreatureX += (cDx / cDist) * wanderSpeed;
              nextCreatureY += (cDy / cDist) * wanderSpeed;
              creature.legPhase += wanderSpeed * 0.1;
            }
          }

          // Creature Obstacle Collision (Trees, Rocks, Fences, Wells cannot be passed through!)
          const creatureRadius = 22;
          for (const obs of lvl.obstacles) {
            const obsRadius = obs.radius || Math.max(obs.width, obs.height) / 2;
            const dist = Math.hypot(nextCreatureX - obs.x, nextCreatureY - obs.y);
            const minDist = creatureRadius + obsRadius;

            if (dist < minDist) {
              const angle = Math.atan2(nextCreatureY - obs.y, nextCreatureX - obs.x);
              nextCreatureX = obs.x + Math.cos(angle) * minDist;
              nextCreatureY = obs.y + Math.sin(angle) * minDist;
            }
          }

          // Boundary clamp for creature
          creature.x = Math.max(30, Math.min(lvl.mapWidth - 30, nextCreatureX));
          creature.y = Math.max(30, Math.min(lvl.mapHeight - 30, nextCreatureY));

          // 6. Creature Attack / Collision with Player (Only when NOT resting)
          const attackDistance = 36;
          if (
            distToPlayer < attackDistance && 
            currentStats.invulnerableTime <= 0 && 
            creature.state !== 'resting'
          ) {
            // TRIGGER VISCERAL JUMPSCARE
            jumpscareTimerRef.current = 1.0;
            soundEngine.playJumpscare();
            screenShakeRef.current = 1.8;

            const remainingLives = currentStats.lives - 1;

            // Push creature backwards so player isn't instantly trapped
            creature.x -= Math.cos(angleToPlayer) * 180;
            creature.y -= Math.sin(angleToPlayer) * 180;
            creature.state = 'wandering';
            creature.huntTimer = 0;

            // If player was carrying a bucket, drop it at current position
            if (currentStats.carryingBucketId) {
              const droppedId = currentStats.carryingBucketId;
              bucketsRef.current = bucketsRef.current.map((b) =>
                b.id === droppedId ? { ...b, collected: false, x: playerPosRef.current.x, y: playerPosRef.current.y } : b
              );
              setBuckets([...bucketsRef.current]);
            }

            setStats((prev) => ({
              ...prev,
              lives: remainingLives,
              invulnerableTime: 2.8,
              carryingBucketId: null,
            }));

            if (remainingLives <= 0) {
              soundEngine.playGameOver();
              setTimeout(() => {
                setGameState('game_over');
              }, 850);
            }
          }
        }

        // Update cinematic running horror audio based on closest creature
        soundEngine.updateCreatureProximity(minCreatureDist, 650, anyCreatureHunting, anyCreatureResting);

        // 7. Water Bucket Pickup & Safehouse Delivery Logic
        let carryingId = currentStats.carryingBucketId;
        let deliveredCount = currentStats.bucketsDeliveredInLevel;

        // If player is not carrying a bucket, check if they can pick one up
        if (!carryingId) {
          let updatedBuckets = [...bucketsRef.current];
          let justPickedUp = false;

          updatedBuckets = updatedBuckets.map((b) => {
            if (!b.collected && !b.delivered) {
              const bDist = Math.hypot(playerPosRef.current.x - b.x, playerPosRef.current.y - b.y);
              if (bDist < BUCKET_PICKUP_RADIUS && !justPickedUp) {
                soundEngine.playBucketPickup();
                justPickedUp = true;
                carryingId = b.id;

                // Splash particles
                for (let p = 0; p < 14; p++) {
                  const pAngle = Math.random() * Math.PI * 2;
                  const pSpeed = 30 + Math.random() * 60;
                  particlesRef.current.push({
                    x: b.x,
                    y: b.y,
                    vx: Math.cos(pAngle) * pSpeed,
                    vy: Math.sin(pAngle) * pSpeed,
                    life: 0.5 + Math.random() * 0.3,
                    maxLife: 0.8,
                    size: 2.5 + Math.random() * 2,
                    color: '#38bdf8',
                    alpha: 0.9,
                  });
                }

                return { ...b, collected: true };
              }
            }
            return b;
          });

          if (justPickedUp) {
            bucketsRef.current = updatedBuckets;
            setBuckets(updatedBuckets);
            setStats((prev) => ({ ...prev, carryingBucketId: carryingId }));
          }
        } else {
          // Player is carrying a bucket! Check if they reached the house
          const distToHouse = Math.hypot(
            playerPosRef.current.x - lvl.housePosition.x,
            playerPosRef.current.y - lvl.housePosition.y
          );

          if (distToHouse < HOUSE_DELIVERY_RADIUS) {
            // Bucket Delivered to Safehouse!
            soundEngine.playHouseDelivery();
            const deliveredId = carryingId;
            carryingId = null;
            deliveredCount += 1;

            bucketsRef.current = bucketsRef.current.map((b) =>
              b.id === deliveredId ? { ...b, delivered: true, collected: true } : b
            );
            setBuckets([...bucketsRef.current]);

            // Holy burst particles at house
            for (let p = 0; p < 24; p++) {
              const pAngle = Math.random() * Math.PI * 2;
              const pSpeed = 40 + Math.random() * 80;
              particlesRef.current.push({
                x: lvl.housePosition.x,
                y: lvl.housePosition.y - 20,
                vx: Math.cos(pAngle) * pSpeed,
                vy: Math.sin(pAngle) * pSpeed,
                life: 0.8 + Math.random() * 0.4,
                maxLife: 1.2,
                size: 3 + Math.random() * 3,
                color: '#fbbf24',
                alpha: 0.95,
              });
            }

            setStats((prev) => ({
              ...prev,
              carryingBucketId: null,
              bucketsDeliveredInLevel: deliveredCount,
              totalBucketsDelivered: prev.totalBucketsDelivered + 1,
              score: prev.score + 1000,
            }));

            // Check if all buckets for this stage have been delivered!
            if (deliveredCount >= lvl.numBuckets) {
              soundEngine.playLevelClear();
              setGameState('level_clear');
            }
          }
        }

        // Update overall stats
        setStats((prev) => ({
          ...prev,
          invulnerableTime: newInvuln,
          timeRemaining: newTimeRemaining,
          timeElapsed: prev.timeElapsed + dt,
        }));

        // 7. Update Particles
        particlesRef.current = particlesRef.current.filter((p) => {
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.life -= dt;
          p.alpha = Math.max(0, p.life / p.maxLife);
          return p.life > 0;
        });

        // 8. Screen shake decay
        if (screenShakeRef.current > 0) {
          screenShakeRef.current = Math.max(0, screenShakeRef.current - dt * 2.5);
        }

        // 9. Render Complete Frame
        rendererRef.current.render({
          ctx,
          canvasWidth: canvas.width,
          canvasHeight: canvas.height,
          playerPos: playerPosRef.current,
          playerFacingAngle: playerFacingAngleRef.current,
          playerMoving: playerMovingRef.current,
          playerWalkCycle: playerWalkCycleRef.current,
          stats: statsRef.current,
          creatures: creaturesRef.current,
          buckets: bucketsRef.current,
          level: lvl,
          obstacles: lvl.obstacles,
          particles: particlesRef.current,
          screenShake: screenShakeRef.current,
          time: time / 1000,
          jumpscareProgress: jumpscareTimerRef.current,
        });
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [gameState, currentLevelIdx]);

  // Handle Resize of Canvas
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !canvasRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      canvasRef.current.width = width;
      canvasRef.current.height = height;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const collectedBucketsInLevel = buckets.filter((b) => b.collected).length;

  return (
    <div
      ref={containerRef}
      id="aquest-app-container"
      className="relative w-screen h-screen bg-black overflow-hidden select-none font-sans"
    >
      {/* Game Canvas */}
      <canvas
        ref={canvasRef}
        id="game-canvas"
        className="w-full h-full block cursor-crosshair"
      />

      {/* In-Game HUD */}
      {gameState === 'playing' && (
        <>
          <HUD
            stats={stats}
            currentLevel={currentLevel.levelNumber}
            totalLevels={LEVELS.length}
            bucketsCollected={collectedBucketsInLevel}
            totalBucketsInLevel={currentLevel.numBuckets}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onPause={() => setGameState('paused')}
            onToggleFlashlight={handleToggleFlashlight}
          />

          {/* Virtual touch controls for mobile / tablet devices */}
          <TouchControls
            onMoveChange={(dir) => {
              touchDirRef.current = dir;
            }}
            onFlashlightToggle={handleToggleFlashlight}
            flashlightOn={stats.flashlightOn}
          />
        </>
      )}

      {/* Start Screen */}
      {gameState === 'menu' && (
        <StartScreen onStart={handleStartGame} />
      )}

      {/* Level Clear Modal */}
      {gameState === 'level_clear' && (
        <LevelClearModal
          completedLevel={currentLevel}
          nextLevel={currentLevelIdx + 1 < LEVELS.length ? LEVELS[currentLevelIdx + 1] : null}
          onNextLevel={handleNextLevel}
        />
      )}

      {/* Game Over Modal */}
      {gameState === 'game_over' && (
        <GameOverModal
          stats={stats}
          currentLevel={currentLevel.levelNumber}
          onRetry={handleRetry}
          onMainMenu={() => setGameState('menu')}
        />
      )}

      {/* Victory Modal */}
      {gameState === 'victory' && (
        <VictoryModal
          stats={stats}
          onPlayAgain={() => {
            initLevel(0, true);
            setGameState('playing');
          }}
        />
      )}

      {/* Pause Modal */}
      {gameState === 'paused' && (
        <PauseModal
          onResume={() => setGameState('playing')}
          onRestartLevel={() => {
            initLevel(currentLevelIdx, false);
            setGameState('playing');
          }}
          onMainMenu={() => setGameState('menu')}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}
    </div>
  );
}
