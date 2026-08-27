import {
  LevelConfig,
  PlayerState,
  AnimalDef,
  GameParticle,
  WaterSource,
  FinishPlantPlot,
  TerrainObstacle,
} from '../types';
import { soundEngine } from '../audio/soundEngine';

export interface ActiveFlare {
  x: number;
  y: number;
  timer: number;
  maxTimer: number;
  radius: number;
}

export interface ActiveStone {
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  x: number;
  y: number;
  progress: number;
  speed: number;
  hasLanded: boolean;
}

export interface GameState {
  level: LevelConfig;
  player: PlayerState;
  animals: AnimalDef[];
  waterSources: WaterSource[];
  finishPlots: FinishPlantPlot[];
  obstacles: TerrainObstacle[];
  particles: GameParticle[];
  flares: ActiveFlare[];
  stones: ActiveStone[];
  isGameOver: boolean;
  isVictory: boolean;
  isPaused: boolean;
  gameTime: number; // in seconds
  screenShake: number;
  weatherTimer: number;
  stealthBonusMaintained: boolean;
}

export class GameEngine {
  public state: GameState;
  private onStateChange?: (state: GameState) => void;

  constructor(level: LevelConfig, onStateChange?: (state: GameState) => void) {
    this.onStateChange = onStateChange;
    this.state = this.initGameState(level);
  }

  public initGameState(level: LevelConfig): GameState {
    const player: PlayerState = {
      x: level.spawnX,
      y: level.spawnY,
      vx: 0,
      vy: 0,
      facingAngle: 0,
      health: 100,
      maxHealth: 100,
      stamina: 100,
      maxStamina: 100,
      waterCarried: 0,
      waterCapacity: level.bucketMaxCapacity,
      isSprinting: false,
      isCrouching: false,
      isInBush: false,
      isInMud: false,
      isInWater: false,
      inventory: {
        flares: level.flaresProvided,
        stones: level.stonesProvided,
        speedTonics: 1,
      },
      activeItem: 'flare',
      invulnerableTimer: 0,
      footstepTimer: 0,
      animFrame: 0,
      animTime: 0,
      isCollecting: false,
      isWatering: false,
    };

    const animals: AnimalDef[] = level.animals.map((a, idx) => ({
      ...a,
      id: `animal_${idx}`,
      state: 'patrol',
      alertMeter: 0,
      fleeTimer: 0,
      currentFrame: 0,
      animTimer: 0,
      attackCooldown: 0,
    }));

    // Clone data to avoid mutations
    const waterSources = JSON.parse(JSON.stringify(level.waterSources));
    const finishPlots = JSON.parse(JSON.stringify(level.finishPlots));
    const obstacles = JSON.parse(JSON.stringify(level.obstacles));

    // Start appropriate ambient soundscape
    const ambType =
      level.weather === 'rain_storm' || level.weather === 'drizzle' ? 'rain' :
      level.biome === 'murky_swamp' ? 'swamp' :
      level.biome === 'pine_forest' || level.biome === 'ancient_sanctuary' ? 'forest' :
      level.biome === 'arid_oasis' || level.biome === 'savannah_plains' ? 'desert' :
      level.biome === 'rocky_canyon' ? 'canyon' : 'forest';
    soundEngine.setAmbience(ambType);

    return {
      level,
      player,
      animals,
      waterSources,
      finishPlots,
      obstacles,
      particles: [],
      flares: [],
      stones: [],
      isGameOver: false,
      isVictory: false,
      isPaused: false,
      gameTime: 0,
      screenShake: 0,
      weatherTimer: 0,
      stealthBonusMaintained: true,
    };
  }

  public resetLevel(level?: LevelConfig) {
    soundEngine.setHeartbeatActive(false);
    this.state = this.initGameState(level || this.state.level);
    if (this.onStateChange) this.onStateChange(this.state);
  }

  // --- INPUT CONTROLS ---
  public updatePlayerInput(keys: { [key: string]: boolean }, mousePos?: { worldX: number; worldY: number }) {
    if (this.state.isGameOver || this.state.isVictory || this.state.isPaused) return;

    const p = this.state.player;
    let dx = 0;
    let dy = 0;

    if (keys['KeyW'] || keys['ArrowUp']) dy -= 1;
    if (keys['KeyS'] || keys['ArrowDown']) dy += 1;
    if (keys['KeyA'] || keys['ArrowLeft']) dx -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) dx += 1;

    // Normalize diagonal
    if (dx !== 0 && dy !== 0) {
      dx *= 0.7071;
      dy *= 0.7071;
    }

    p.isSprinting = !!keys['ShiftLeft'] || !!keys['ShiftRight'];
    p.isCrouching = !!keys['KeyC'] || !!keys['ControlLeft'];

    // Base speed calculation
    let moveSpeed = 3.6;
    if (p.isCrouching) {
      moveSpeed = 1.9; // Stealthy crawl
    } else if (p.isSprinting && p.stamina > 5) {
      moveSpeed = 5.6; // Sprint
    }

    if (p.isInMud) moveSpeed *= 0.55;
    if (p.isInWater) moveSpeed *= 0.72;

    p.vx = dx * moveSpeed;
    p.vy = dy * moveSpeed;

    if (dx !== 0 || dy !== 0) {
      p.facingAngle = Math.atan2(dy, dx);
    } else if (mousePos) {
      p.facingAngle = Math.atan2(mousePos.worldY - p.y, mousePos.worldX - p.x);
    }

    // Action keys
    p.isCollecting = !!keys['Space'];
    p.isWatering = !!keys['KeyE'];
  }

  public triggerActionItem(itemType: 'flare' | 'stone' | 'speed_tonic') {
    if (this.state.isGameOver || this.state.isVictory || this.state.isPaused) return;
    const p = this.state.player;

    if (itemType === 'flare' && p.inventory.flares > 0) {
      p.inventory.flares--;
      soundEngine.playFlareIgnite();
      this.state.flares.push({
        x: p.x,
        y: p.y,
        timer: 7.0, // 7 seconds
        maxTimer: 7.0,
        radius: 360,
      });

      // Spawn bright flare spark particles
      for (let i = 0; i < 25; i++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 1 + Math.random() * 4;
        this.state.particles.push({
          x: p.x,
          y: p.y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          life: 0.6 + Math.random() * 0.5,
          maxLife: 1.1,
          size: 3 + Math.random() * 3,
          color: '#ff4500',
          type: 'spark',
          alpha: 1,
        });
      }
    } else if (itemType === 'stone' && p.inventory.stones > 0) {
      p.inventory.stones--;
      soundEngine.playStoneThrow();
      const throwDist = 260;
      const targetX = p.x + Math.cos(p.facingAngle) * throwDist;
      const targetY = p.y + Math.sin(p.facingAngle) * throwDist;

      this.state.stones.push({
        startX: p.x,
        startY: p.y,
        targetX,
        targetY,
        x: p.x,
        y: p.y,
        progress: 0,
        speed: 3.5,
        hasLanded: false,
      });
    }
  }

  // --- FORCE COMPLETE CURRENT LEVEL TO PROCEED ---
  public forceCompleteLevel() {
    if (this.state.isVictory) return;
    for (const plot of this.state.finishPlots) {
      plot.waterReceived = plot.waterNeeded;
      plot.bloomProgress = 1;
      plot.isFullyHydrated = true;
    }
    this.state.isVictory = true;
    soundEngine.setHeartbeatActive(false);
    soundEngine.playPlantBloom();
    soundEngine.playVictoryJingle();

    // Burst of celebratory radiant blooming petals
    for (const plot of this.state.finishPlots) {
      for (let k = 0; k < 35; k++) {
        const ang = Math.random() * Math.PI * 2;
        const spd = 2 + Math.random() * 5;
        this.state.particles.push({
          x: plot.x,
          y: plot.y,
          vx: Math.cos(ang) * spd,
          vy: Math.sin(ang) * spd,
          life: 1.8,
          maxLife: 1.8,
          size: 5 + Math.random() * 4,
          color: ['#f687b3', '#f6ad55', '#68d391', '#faf089', '#38bdf8'][Math.floor(Math.random() * 5)],
          type: 'petal',
          alpha: 1,
        });
      }
    }

    if (this.onStateChange) {
      this.onStateChange(this.state);
    }
  }

  // --- MAIN SIMULATION STEP ---
  public update(dt: number) {
    if (this.state.isGameOver || this.state.isVictory || this.state.isPaused) return;

    this.state.gameTime += dt;
    this.state.weatherTimer += dt;

    if (this.state.screenShake > 0) {
      this.state.screenShake = Math.max(0, this.state.screenShake - dt * 15);
    }

    this.updatePlayer(dt);
    this.updateFlares(dt);
    this.updateStones(dt);
    this.updateAnimals(dt);
    this.updateWaterAndSanctuary(dt);
    this.updateParticles(dt);
    this.spawnWeatherAtmosphere(dt);

    if (this.onStateChange) {
      this.onStateChange(this.state);
    }
  }

  private updatePlayer(dt: number) {
    const p = this.state.player;
    const lvl = this.state.level;

    // Movement integration with bounding box
    const nextX = p.x + p.vx;
    const nextY = p.y + p.vy;

    // Check collision against hard obstacles (trees, rock clusters)
    let canMoveX = true;
    let canMoveY = true;
    const playerRadius = 18;

    p.isInBush = false;
    p.isInMud = false;
    p.isInWater = false;

    for (const obs of this.state.obstacles) {
      const dist = Math.hypot(p.x - obs.x, p.y - obs.y);
      const obsRad = obs.radius || 30;

      if (obs.type === 'tree' || obs.type === 'rock_cluster') {
        if (Math.hypot(nextX - obs.x, p.y - obs.y) < playerRadius + obsRad * 0.75) {
          canMoveX = false;
        }
        if (Math.hypot(p.x - obs.x, nextY - obs.y) < playerRadius + obsRad * 0.75) {
          canMoveY = false;
        }
      } else if (obs.type === 'dense_bush' && dist < obsRad) {
        p.isInBush = true;
      } else if (obs.type === 'mud_patch' && dist < obsRad) {
        p.isInMud = true;
      }
    }

    // Check water body immersion
    for (const ws of this.state.waterSources) {
      if (Math.hypot(p.x - ws.x, p.y - ws.y) < ws.radius) {
        p.isInWater = true;
      }
    }

    if (canMoveX) p.x = Math.max(playerRadius, Math.min(lvl.mapWidth - playerRadius, nextX));
    if (canMoveY) p.y = Math.max(playerRadius, Math.min(lvl.mapHeight - playerRadius, nextY));

    // Stamina logic
    const isMoving = Math.abs(p.vx) > 0.1 || Math.abs(p.vy) > 0.1;
    if (p.isSprinting && isMoving) {
      p.stamina = Math.max(0, p.stamina - dt * 28);
      if (p.stamina === 0) p.isSprinting = false;
    } else {
      p.stamina = Math.min(p.maxStamina, p.stamina + dt * (isMoving ? 12 : 22));
    }

    // Invulnerability timer
    if (p.invulnerableTimer > 0) {
      p.invulnerableTimer = Math.max(0, p.invulnerableTimer - dt);
    }

    // Footstep audio and particle trail
    if (isMoving) {
      p.footstepTimer += dt;
      const stepInterval = p.isSprinting ? 0.24 : p.isCrouching ? 0.55 : 0.38;
      if (p.footstepTimer >= stepInterval) {
        p.footstepTimer = 0;
        const surface = p.isInWater ? 'water' : p.isInMud ? 'mud' : 'grass';
        soundEngine.playFootstep(surface, p.isSprinting);

        // Step visual dust or ripple
        this.state.particles.push({
          x: p.x,
          y: p.y + 12,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          life: 0.3,
          maxLife: 0.3,
          size: p.isInWater ? 8 : 4,
          color: p.isInWater ? 'rgba(120, 200, 255, 0.4)' : p.isInMud ? 'rgba(90, 60, 30, 0.3)' : 'rgba(100, 140, 70, 0.25)',
          type: p.isInWater ? 'puddle_ripple' : 'footprint',
          alpha: 0.6,
        });
      }
    }

    // Animation frames
    if (isMoving) {
      p.animTime += dt * (p.isSprinting ? 12 : 7);
      p.animFrame = Math.floor(p.animTime) % 4;
    }
  }

  private updateFlares(dt: number) {
    for (let i = this.state.flares.length - 1; i >= 0; i--) {
      const f = this.state.flares[i];
      f.timer -= dt;

      // Spawn periodic smoke/sparks
      if (Math.random() < 0.4) {
        this.state.particles.push({
          x: f.x + (Math.random() - 0.5) * 20,
          y: f.y + (Math.random() - 0.5) * 20,
          vx: (Math.random() - 0.5) * 1.5,
          vy: -2 - Math.random() * 2,
          life: 0.8,
          maxLife: 0.8,
          size: 6 + Math.random() * 8,
          color: 'rgba(80, 80, 80, 0.4)',
          type: 'smoke',
          alpha: 0.5,
        });
      }

      if (f.timer <= 0) {
        this.state.flares.splice(i, 1);
      }
    }
  }

  private updateStones(dt: number) {
    for (let i = this.state.stones.length - 1; i >= 0; i--) {
      const s = this.state.stones[i];
      s.progress += dt * s.speed;

      s.x = s.startX + (s.targetX - s.startX) * Math.min(1, s.progress);
      s.y = s.startY + (s.targetY - s.startY) * Math.min(1, s.progress);

      if (s.progress >= 1 && !s.hasLanded) {
        s.hasLanded = true;
        soundEngine.playFootstep('rock', false);

        // Alert nearby animals to stone position
        for (const a of this.state.animals) {
          const dist = Math.hypot(a.x - s.targetX, a.y - s.targetY);
          if (dist < 380 && a.state !== 'flee') {
            a.state = 'alert';
            a.targetX = s.targetX;
            a.targetY = s.targetY;
            a.alertMeter = 0.8;
          }
        }

        // Particle impact
        for (let j = 0; j < 6; j++) {
          this.state.particles.push({
            x: s.targetX,
            y: s.targetY,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            life: 0.4,
            maxLife: 0.4,
            size: 3,
            color: '#a0aec0',
            type: 'spark',
            alpha: 1,
          });
        }

        this.state.stones.splice(i, 1);
      }
    }
  }

  private updateAnimals(dt: number) {
    const p = this.state.player;
    let anyAnimalChasing = false;

    for (const a of this.state.animals) {
      a.animTimer += dt * 6;
      a.currentFrame = Math.floor(a.animTimer) % 4;

      if (a.attackCooldown > 0) {
        a.attackCooldown = Math.max(0, a.attackCooldown - dt);
      }

      // Check fear of active flares
      let inFlareRange = false;
      let flareX = 0;
      let flareY = 0;
      for (const fl of this.state.flares) {
        const dist = Math.hypot(a.x - fl.x, a.y - fl.y);
        if (dist < fl.radius) {
          inFlareRange = true;
          flareX = fl.x;
          flareY = fl.y;
          break;
        }
      }

      if (inFlareRange) {
        a.state = 'flee';
        a.fleeTimer = 3.5;
        // Flee away from flare
        const angleAway = Math.atan2(a.y - flareY, a.x - flareX);
        a.facingAngle = angleAway;
        a.x += Math.cos(angleAway) * a.chaseSpeed * 1.1 * dt * 60;
        a.y += Math.sin(angleAway) * a.chaseSpeed * 1.1 * dt * 60;
        continue;
      }

      if (a.state === 'flee') {
        a.fleeTimer -= dt;
        if (a.fleeTimer <= 0) {
          a.state = 'patrol';
        }
        continue;
      }

      // SENSORY CHECK: Vision & Hearing against Player
      const distToPlayer = Math.hypot(a.x - p.x, a.y - p.y);
      const angleToPlayer = Math.atan2(p.y - a.y, p.x - a.x);
      let angleDiff = Math.abs(angleToPlayer - a.facingAngle);
      while (angleDiff > Math.PI) angleDiff = Math.PI * 2 - angleDiff;

      // Effective stealth modifier
      let stealthFactor = 1.0;
      if (p.isInBush) stealthFactor *= 0.15; // Hidden in bush
      if (p.isCrouching) stealthFactor *= 0.45; // Crouched crawling
      if (p.isSprinting) stealthFactor *= 1.8; // Loud running

      const canSee = distToPlayer < (a.visionRange * stealthFactor) && angleDiff < a.visionAngle / 2;
      const canHear = distToPlayer < (140 * stealthFactor);

      if (canSee || canHear) {
        if (a.state !== 'chase') {
          a.state = 'alert';
          a.facingAngle = angleToPlayer;
          a.alertMeter = Math.min(1, a.alertMeter + dt * (canSee ? 2.2 : 1.2));

          if (a.alertMeter >= 1) {
            a.state = 'chase';
            soundEngine.playAnimalSound(a.species, 'alert');
            this.state.stealthBonusMaintained = false;
          }
        }
      } else {
        if (a.state === 'alert') {
          a.alertMeter = Math.max(0, a.alertMeter - dt * 0.8);
          if (a.alertMeter === 0) a.state = 'patrol';
        } else if (a.state === 'chase' && distToPlayer > 420) {
          // Lost player
          a.state = 'patrol';
          a.alertMeter = 0;
        }
      }

      // EXECUTE BEHAVIOR
      if (a.state === 'chase') {
        anyAnimalChasing = true;
        a.facingAngle = angleToPlayer;
        const moveDist = a.chaseSpeed * dt * 60;
        a.x += Math.cos(angleToPlayer) * moveDist;
        a.y += Math.sin(angleToPlayer) * moveDist;

        // Attack collision
        if (distToPlayer < a.attackRange && a.attackCooldown === 0 && p.invulnerableTimer === 0) {
          p.health = Math.max(0, p.health - a.damage);
          p.invulnerableTimer = 1.2;
          a.attackCooldown = 1.0;
          this.state.screenShake = 12;
          soundEngine.playPlayerHurt();
          soundEngine.playAnimalSound(a.species, 'attack');

          // Blood / hit particles
          for (let k = 0; k < 12; k++) {
            this.state.particles.push({
              x: p.x,
              y: p.y,
              vx: (Math.random() - 0.5) * 4,
              vy: (Math.random() - 0.5) * 4,
              life: 0.5,
              maxLife: 0.5,
              size: 4,
              color: '#e53e3e',
              type: 'blood',
              alpha: 0.9,
            });
          }

          if (p.health <= 0) {
            this.state.isGameOver = true;
            soundEngine.setHeartbeatActive(false);
            soundEngine.playGameOverSound();
          }
        }
      } else if (a.state === 'patrol') {
        // Patrol around origin point
        if (!a.targetX || Math.hypot(a.x - a.targetX, a.y - a.targetY) < 25) {
          const ang = Math.random() * Math.PI * 2;
          const rad = Math.random() * a.patrolRadius;
          a.targetX = a.originX + Math.cos(ang) * rad;
          a.targetY = a.originY + Math.sin(ang) * rad;
        }

        const angToTarget = Math.atan2(a.targetY - a.y, a.targetX - a.x);
        a.facingAngle = angToTarget;
        a.x += Math.cos(angToTarget) * a.speed * dt * 60;
        a.y += Math.sin(angToTarget) * a.speed * dt * 60;
      }
    }

    // Heartbeat danger audio cue if being chased or below 35% health
    soundEngine.setHeartbeatActive(anyAnimalChasing || p.health < 35);
  }

  private updateWaterAndSanctuary(dt: number) {
    const p = this.state.player;

    // 1. Water Collection from sources
    for (const ws of this.state.waterSources) {
      const dist = Math.hypot(p.x - ws.x, p.y - ws.y);
      if (dist < ws.radius + 25) {
        if (p.isCollecting && p.waterCarried < p.waterCapacity) {
          const fillAmount = Math.min(dt * 18 * ws.purity, p.waterCapacity - p.waterCarried);
          p.waterCarried = Math.min(p.waterCapacity, p.waterCarried + fillAmount);
          soundEngine.playWaterCollect();

          // Liquid gathering splash particles
          for (let i = 0; i < 2; i++) {
            this.state.particles.push({
              x: ws.x + (Math.random() - 0.5) * 30,
              y: ws.y + (Math.random() - 0.5) * 30,
              vx: (p.x - ws.x) * 0.05 + (Math.random() - 0.5),
              vy: (p.y - ws.y) * 0.05 + (Math.random() - 0.5),
              life: 0.35,
              maxLife: 0.35,
              size: 4 + Math.random() * 3,
              color: '#63b3ed',
              type: 'water_drop',
              alpha: 0.8,
            });
          }
        }
      }
    }

    // 2. Pouring water to finish plant plots
    let allPlotsFinished = true;
    for (const plot of this.state.finishPlots) {
      const dist = Math.hypot(p.x - plot.x, p.y - plot.y);

      if (dist < plot.radius + 30) {
        if (p.isWatering && p.waterCarried > 0 && !plot.isFullyHydrated) {
          const pourAmount = Math.min(dt * 14, p.waterCarried, plot.waterNeeded - plot.waterReceived);
          p.waterCarried = Math.max(0, p.waterCarried - pourAmount);
          plot.waterReceived += pourAmount;
          plot.bloomProgress = Math.min(1, plot.waterReceived / plot.waterNeeded);
          soundEngine.playWaterPour();

          // Nourishment splash
          this.state.particles.push({
            x: plot.x + (Math.random() - 0.5) * 40,
            y: plot.y + (Math.random() - 0.5) * 40,
            vx: (Math.random() - 0.5) * 2,
            vy: -2 - Math.random() * 2,
            life: 0.5,
            maxLife: 0.5,
            size: 4,
            color: '#48bb78',
            type: 'water_drop',
            alpha: 0.9,
          });

          if (plot.waterReceived >= plot.waterNeeded && !plot.isFullyHydrated) {
            plot.isFullyHydrated = true;
            soundEngine.playPlantBloom();

            // Burst of radiant blooming petals
            for (let k = 0; k < 35; k++) {
              const ang = Math.random() * Math.PI * 2;
              const spd = 2 + Math.random() * 4;
              this.state.particles.push({
                x: plot.x,
                y: plot.y,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                life: 1.5,
                maxLife: 1.5,
                size: 5 + Math.random() * 4,
                color: ['#f687b3', '#f6ad55', '#68d391', '#faf089'][Math.floor(Math.random() * 4)],
                type: 'petal',
                alpha: 1,
              });
            }
          }
        }
      }

      if (!plot.isFullyHydrated) {
        allPlotsFinished = false;
      }
    }

    // Victory Trigger
    if (allPlotsFinished && !this.state.isVictory) {
      this.state.isVictory = true;
      soundEngine.setHeartbeatActive(false);
      soundEngine.playVictoryJingle();
    }
  }

  private updateParticles(dt: number) {
    for (let i = this.state.particles.length - 1; i >= 0; i--) {
      const pt = this.state.particles[i];
      pt.life -= dt;
      pt.x += pt.vx;
      pt.y += pt.vy;
      pt.alpha = Math.max(0, pt.life / pt.maxLife);

      if (pt.life <= 0) {
        this.state.particles.splice(i, 1);
      }
    }
  }

  private spawnWeatherAtmosphere(dt: number) {
    const w = this.state.level.weather;
    const p = this.state.player;

    if (w === 'rain_storm' || w === 'drizzle') {
      const dropCount = w === 'rain_storm' ? 4 : 2;
      for (let i = 0; i < dropCount; i++) {
        this.state.particles.push({
          x: p.x + (Math.random() - 0.5) * 1200,
          y: p.y - 450 + (Math.random() - 0.5) * 200,
          vx: -3.5,
          vy: 14 + Math.random() * 6,
          life: 0.6,
          maxLife: 0.6,
          size: 2,
          color: 'rgba(180, 220, 255, 0.65)',
          type: 'water_drop',
          alpha: 0.7,
        });
      }
    } else if (w === 'night' || this.state.level.biome === 'murky_swamp') {
      if (Math.random() < 0.12) {
        // Fireflies
        this.state.particles.push({
          x: p.x + (Math.random() - 0.5) * 800,
          y: p.y + (Math.random() - 0.5) * 800,
          vx: (Math.random() - 0.5) * 0.8,
          vy: (Math.random() - 0.5) * 0.8,
          life: 2.0,
          maxLife: 2.0,
          size: 3 + Math.random() * 2,
          color: 'rgba(255, 255, 120, 0.85)',
          type: 'firefly',
          alpha: 0.9,
        });
      }
    }
  }
}
