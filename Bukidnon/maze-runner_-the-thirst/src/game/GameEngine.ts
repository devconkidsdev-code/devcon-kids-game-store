import {
  GameStatus,
  GameMode,
  Difficulty,
  Player,
  Camera,
  FloatingText,
  LevelConfig,
  ScoreBreakdown,
  HighScoreRecord
} from '../types';
import { generateMaze, GeneratedMaze } from './MazeGenerator';
import { LightingEngine } from './LightingEngine';
import { ParticleSystem } from './ParticleSystem';
import { soundSynth } from '../audio/SoundSynth';
import { CAMPAIGN_LEVELS, getEndlessLevelConfig } from './LevelData';

export class GameEngine {
  public status: GameStatus = 'MENU';
  public mode: GameMode = 'CAMPAIGN';
  public difficulty: Difficulty = 'NORMAL';
  public currentLevelIndex: number = 0;
  public currentLevelConfig!: LevelConfig;
  public maze!: GeneratedMaze;
  public player!: Player;
  public camera!: Camera;
  public particles: ParticleSystem;
  public lighting: LightingEngine;
  public floatingTexts: FloatingText[] = [];

  public timeLeft: number = 60;
  public prevSecond: number = 60;
  public score: number = 0;
  public combo: number = 1;
  public comboTimer: number = 0;
  public cropsWateredCount: number = 0;
  public totalCropsNeeded: number = 0;
  public damageFlash: number = 0; // 0..1 for red screen edge vignette
  public victoryGlow: number = 0; // 0..1 for golden victory aura
  public gameTime: number = 0; // total elapsed time

  // Input states
  public keys: { [key: string]: boolean } = {};
  public mouseWorldPos = { x: 0, y: 0 };
  public virtualJoystick = { active: false, x: 0, y: 0 };

  // Last score breakdown
  public lastScoreBreakdown: ScoreBreakdown | null = null;

  constructor() {
    this.particles = new ParticleSystem();
    this.lighting = new LightingEngine();
    this.camera = {
      x: 0,
      y: 0,
      shakeX: 0,
      shakeY: 0,
      shakeIntensity: 0,
      shakeDuration: 0,
      zoom: 1.0
    };
  }

  public startCampaign(levelIndex: number = 0, diff: Difficulty = 'NORMAL') {
    this.mode = 'CAMPAIGN';
    this.difficulty = diff;
    this.currentLevelIndex = levelIndex;
    this.currentLevelConfig = CAMPAIGN_LEVELS[levelIndex] || CAMPAIGN_LEVELS[0];
    this.initLevel();
    this.status = 'PLAYING';
    soundSynth.init();
    soundSynth.startBGM();
  }

  public startEndless(depth: number = 1, diff: Difficulty = 'NORMAL') {
    this.mode = 'ENDLESS';
    this.difficulty = diff;
    this.currentLevelIndex = depth;
    this.currentLevelConfig = getEndlessLevelConfig(depth);
    this.initLevel();
    this.status = 'PLAYING';
    soundSynth.init();
    soundSynth.startBGM();
  }

  public nextLevel() {
    if (this.mode === 'CAMPAIGN') {
      if (this.currentLevelIndex + 1 < CAMPAIGN_LEVELS.length) {
        this.currentLevelIndex++;
        this.currentLevelConfig = CAMPAIGN_LEVELS[this.currentLevelIndex];
        this.initLevel();
        this.status = 'PLAYING';
      } else {
        // Completed campaign!
        this.status = 'VICTORY';
      }
    } else {
      this.currentLevelIndex++;
      this.currentLevelConfig = getEndlessLevelConfig(this.currentLevelIndex);
      this.initLevel();
      this.status = 'PLAYING';
    }
  }

  public retryLevel() {
    this.initLevel();
    this.status = 'PLAYING';
    soundSynth.startBGM();
  }

  private initLevel() {
    const tileSize = 64;
    this.maze = generateMaze(this.currentLevelConfig, tileSize);

    let baseWater = 100;
    if (this.difficulty === 'NIGHTMARE') baseWater = 85;
    if (this.difficulty === 'RELAXED') baseWater = 100;

    this.player = {
      x: this.maze.startX,
      y: this.maze.startY,
      prevX: this.maze.startX,
      prevY: this.maze.startY,
      vx: 0,
      vy: 0,
      radius: 20,
      angle: 0,
      aimAngle: 0,
      water: baseWater,
      maxWater: 100,
      lives: 3,
      maxLives: 3,
      speed: 4.8,
      isSprinting: false,
      sloshTilt: 0,
      squashX: 1,
      squashY: 1,
      sweatTimer: 0,
      footstepTimer: 0,
      invincibleTimer: 0,
      powerups: {
        spongeTimer: 0,
        clockBonus: 0,
        nightVisionTimer: 0,
        turboTimer: 0,
        lidTimer: 0
      }
    };

    this.camera.x = this.player.x;
    this.camera.y = this.player.y;
    this.camera.shakeIntensity = 0;
    this.timeLeft = this.currentLevelConfig.timeLimit;
    if (this.difficulty === 'RELAXED') this.timeLeft += 25;
    if (this.difficulty === 'NIGHTMARE') this.timeLeft -= 12;
    this.prevSecond = Math.ceil(this.timeLeft);

    this.cropsWateredCount = 0;
    this.totalCropsNeeded = this.maze.crops.length;
    this.damageFlash = 0;
    this.victoryGlow = 0;
    this.combo = 1;
    this.comboTimer = 0;
    this.particles.clear();
    this.floatingTexts = [];
    soundSynth.stopHeartbeat();

    this.addFloatingText(this.player.x, this.player.y - 40, `Level ${this.currentLevelConfig.levelNumber}: Ready, Runner!`, '#38bdf8', 1.8);
  }

  public update(dt: number) {
    if (this.status !== 'PLAYING') return;

    this.gameTime += dt;

    // Time decay & countdown ticking
    this.timeLeft -= dt;
    const curSecond = Math.ceil(this.timeLeft);
    if (curSecond !== this.prevSecond && this.timeLeft <= 10 && this.timeLeft > 0) {
      soundSynth.playTickTock(this.timeLeft <= 5);
      this.addFloatingText(this.player.x, this.player.y - 50, `⏱️ ${curSecond}s!`, '#ef4444', 1.2);
      this.addCameraShake(3, 0.1);
    }
    this.prevSecond = curSecond;

    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.triggerGameOver('Time Expired! The crops wilted in the heat.');
      return;
    }

    // Heartbeat audio check when timer < 15s or water < 25%
    if (this.timeLeft <= 15 || this.player.water <= 25 || this.player.lives === 1) {
      const bpm = this.timeLeft <= 8 || this.player.water <= 15 || this.player.lives === 1 ? 140 : 100;
      soundSynth.startHeartbeat(bpm);
    } else {
      soundSynth.stopHeartbeat();
    }

    // Decay damage flash & victory glow
    if (this.damageFlash > 0) this.damageFlash = Math.max(0, this.damageFlash - dt * 2.5);
    if (this.victoryGlow > 0) this.victoryGlow = Math.max(0, this.victoryGlow - dt * 2);

    // Update Player & Controls
    this.updatePlayer(dt);

    // Update Obstacles (Rolling Barrels, Saws, Electric Gates)
    this.updateObstacles(dt);

    // Update Traps
    this.updateTraps(dt);

    // Update Crops interaction
    this.updateCrops(dt);

    // Update Wells interaction
    this.updateWells(dt);

    // Update Power-ups
    this.updatePowerUps(dt);

    // Update Chasers & Catchers
    this.updateChasers(dt);

    // Update Spooky Eyes
    this.updateSpookyEyes(dt);

    // Update Particles
    this.particles.update(dt);

    // Update Floating texts
    this.updateFloatingTexts(dt);

    // Update Camera
    this.updateCamera(dt);

    // Update Combo meter
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.combo = 1;
      }
    }

    // Check Exit Portal
    this.checkExit();
  }

  private updatePlayer(dt: number) {
    const p = this.player;

    // Power-up timers decay
    if (p.powerups.spongeTimer > 0) p.powerups.spongeTimer = Math.max(0, p.powerups.spongeTimer - dt);
    if (p.powerups.nightVisionTimer > 0) p.powerups.nightVisionTimer = Math.max(0, p.powerups.nightVisionTimer - dt);
    if (p.powerups.turboTimer > 0) {
      p.powerups.turboTimer = Math.max(0, p.powerups.turboTimer - dt);
      if (Math.random() < 0.3) {
        this.particles.emitSparkles(p.x, p.y, 1);
      }
    }
    if (p.powerups.lidTimer > 0) p.powerups.lidTimer = Math.max(0, p.powerups.lidTimer - dt);
    if (p.invincibleTimer > 0) p.invincibleTimer = Math.max(0, p.invincibleTimer - dt);

    // Movement Input Gathering
    let moveX = 0;
    let moveY = 0;

    if (this.keys['KeyW'] || this.keys['ArrowUp']) moveY -= 1;
    if (this.keys['KeyS'] || this.keys['ArrowDown']) moveY += 1;
    if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveX -= 1;
    if (this.keys['KeyD'] || this.keys['ArrowRight']) moveX += 1;

    // Virtual Joystick support
    if (this.virtualJoystick.active) {
      moveX += this.virtualJoystick.x;
      moveY += this.virtualJoystick.y;
    }

    // Normalize input
    const inputMag = Math.hypot(moveX, moveY);
    if (inputMag > 0.01) {
      moveX = (moveX / Math.max(1, inputMag));
      moveY = (moveY / Math.max(1, inputMag));
    }

    // Sprinting calculation
    const isShift = this.keys['ShiftLeft'] || this.keys['ShiftRight'];
    p.isSprinting = isShift || p.powerups.turboTimer > 0;

    let targetSpeed = p.speed;
    if (p.powerups.turboTimer > 0) targetSpeed *= 1.45;
    else if (p.isSprinting) targetSpeed *= 1.3;

    // Acceleration & Drag
    const accel = 0.45;
    p.vx += moveX * targetSpeed * accel;
    p.vy += moveY * targetSpeed * accel;
    p.vx *= 0.82;
    p.vy *= 0.82;

    p.prevX = p.x;
    p.prevY = p.y;

    // Facing Angle
    const currentSpeed = Math.hypot(p.vx, p.vy);
    if (currentSpeed > 0.2) {
      p.angle = Math.atan2(p.vy, p.vx);
    }

    // Flashlight Aim Angle (smoothly follows movement or mouse)
    const mouseDx = this.mouseWorldPos.x - p.x;
    const mouseDy = this.mouseWorldPos.y - p.y;
    if (Math.hypot(mouseDx, mouseDy) > 30) {
      p.aimAngle = Math.atan2(mouseDy, mouseDx);
    } else if (currentSpeed > 0.2) {
      p.aimAngle = p.angle;
    }

    // Move & Collision with Cardboard Maze Walls
    this.resolveWallCollisions();

    // Footstep audio and subtle water slosh
    if (currentSpeed > 0.6) {
      p.footstepTimer -= dt * (currentSpeed * 1.8);
      if (p.footstepTimer <= 0) {
        p.footstepTimer = 0.28;
        soundSynth.playFootstep(p.water > 0);
        // Add subtle water slosh when moving fast
        if (currentSpeed > 3.8 && Math.random() < 0.4) {
          soundSynth.playSlosh(0.3);
        }
      }

      // Squash and stretch bounce animation
      const bounceFreq = 14;
      p.squashX = 1 + Math.sin(this.gameTime * bounceFreq) * 0.12;
      p.squashY = 1 - Math.sin(this.gameTime * bounceFreq) * 0.12;
      p.sloshTilt = Math.sin(this.gameTime * bounceFreq * 0.5) * 0.25;

      // Slosh drip if sprinting very fast without bucket lid
      if (p.isSprinting && p.powerups.lidTimer <= 0 && p.water > 0) {
        const dripRate = this.difficulty === 'NIGHTMARE' ? 2.5 : 1.2;
        p.water = Math.max(0, p.water - dt * dripRate);
        if (Math.random() < 0.15) {
          this.particles.emitWaterSplash(p.x, p.y, 2, 1.5);
        }
      }
    } else {
      // Idle breathing
      p.squashX = 1 + Math.sin(this.gameTime * 4) * 0.04;
      p.squashY = 1 - Math.sin(this.gameTime * 4) * 0.04;
      p.sloshTilt = 0;
    }

    // Sweat drops when low water or low time or sprinting
    if (p.water <= 25 || this.timeLeft <= 15 || p.isSprinting) {
      p.sweatTimer -= dt;
      if (p.sweatTimer <= 0) {
        p.sweatTimer = 0.4 + Math.random() * 0.3;
        this.particles.emitSweat(p.x, p.y, p.angle);
      }
    }

    // Check Water Depletion (Game Over condition if water runs out and no crops left!)
    if (p.water <= 0) {
      // Check if wells exist to refill
      const activeWells = this.maze.wells.filter(w => !w.depleted);
      if (this.cropsWateredCount < this.totalCropsNeeded && activeWells.length === 0) {
        this.triggerGameOver('Your Bucket Ran Dry! The Thirst caught up with you.');
      }
    }
  }

  private resolveWallCollisions() {
    const p = this.player;
    const tileSize = this.maze.tileSize;
    const tiles = this.maze.tiles;

    // Apply X movement
    p.x += p.vx;
    let minC = Math.max(0, Math.floor((p.x - p.radius) / tileSize));
    let maxC = Math.min(this.maze.cols - 1, Math.floor((p.x + p.radius) / tileSize));
    let minR = Math.max(0, Math.floor((p.y - p.radius) / tileSize));
    let maxR = Math.min(this.maze.rows - 1, Math.floor((p.y + p.radius) / tileSize));

    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        if (tiles[r][c].type === 'WALL') {
          const nearestX = Math.max(c * tileSize, Math.min(p.x, (c + 1) * tileSize));
          const nearestY = Math.max(r * tileSize, Math.min(p.y, (r + 1) * tileSize));
          const dx = p.x - nearestX;
          const dy = p.y - nearestY;
          const dist = Math.hypot(dx, dy);

          if (dist < p.radius) {
            const overlap = p.radius - dist;
            if (dist > 0.001) {
              p.x += (dx / dist) * overlap;
            } else {
              p.x = p.prevX;
            }

            // High impact wall collision
            if (Math.abs(p.vx) > 3.0) {
              this.handleWallImpact(Math.abs(p.vx));
            }
            p.vx = 0;
          }
        }
      }
    }

    // Apply Y movement
    p.y += p.vy;
    minC = Math.max(0, Math.floor((p.x - p.radius) / tileSize));
    maxC = Math.min(this.maze.cols - 1, Math.floor((p.x + p.radius) / tileSize));
    minR = Math.max(0, Math.floor((p.y - p.radius) / tileSize));
    maxR = Math.min(this.maze.rows - 1, Math.floor((p.y + p.radius) / tileSize));

    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        if (tiles[r][c].type === 'WALL') {
          const nearestX = Math.max(c * tileSize, Math.min(p.x, (c + 1) * tileSize));
          const nearestY = Math.max(r * tileSize, Math.min(p.y, (r + 1) * tileSize));
          const dx = p.x - nearestX;
          const dy = p.y - nearestY;
          const dist = Math.hypot(dx, dy);

          if (dist < p.radius) {
            const overlap = p.radius - dist;
            if (dist > 0.001) {
              p.y += (dy / dist) * overlap;
            } else {
              p.y = p.prevY;
            }

            // High impact wall collision
            if (Math.abs(p.vy) > 3.0) {
              this.handleWallImpact(Math.abs(p.vy));
            }
            p.vy = 0;
          }
        }
      }
    }
  }

  private handleWallImpact(speed: number) {
    const p = this.player;
    const impactRatio = Math.min(1.0, speed / 5.5);

    // Screen Shake & Bonk Sound
    this.addCameraShake(impactRatio * 7, 0.2);
    soundSynth.playBonk(impactRatio);

    // Wall cardboard debris burst
    this.particles.emitDebris(p.x, p.y, 6);

    // Water spill penalty (if no bucket lid)
    if (p.powerups.lidTimer <= 0 && p.water > 0) {
      const waterLoss = Math.min(p.water, Math.floor(4 + impactRatio * 8));
      p.water = Math.max(0, p.water - waterLoss);
      this.particles.emitWaterSplash(p.x, p.y, 10, 4.0);
      this.addFloatingText(p.x, p.y - 20, `-${waterLoss}% Water!`, '#f87171', 1.0);

      // Break combo on hard crash
      if (this.combo > 1) {
        this.combo = 1;
        this.comboTimer = 0;
        this.addFloatingText(p.x, p.y - 45, 'Combo Lost!', '#fbbf24', 0.9);
      }
    }
  }

  private updateObstacles(dt: number) {
    const p = this.player;
    if (!this.maze?.obstacles) return;

    this.maze.obstacles.forEach(obs => {
      obs.timer += dt;
      obs.rotation += dt * obs.rotSpeed;

      // Handle Movement along axis
      if (obs.axis === 'HORIZONTAL') {
        obs.x += obs.vx * dt * 60;
        if (obs.vx > 0 && obs.x >= obs.targetX) {
          obs.x = obs.targetX;
          obs.vx = -Math.abs(obs.vx);
          obs.direction = -1;
          this.particles.emitDust(obs.x, obs.y, 4);
        } else if (obs.vx < 0 && obs.x <= obs.startX) {
          obs.x = obs.startX;
          obs.vx = Math.abs(obs.vx);
          obs.direction = 1;
          this.particles.emitDust(obs.x, obs.y, 4);
        }
      } else if (obs.axis === 'VERTICAL') {
        obs.y += obs.vy * dt * 60;
        if (obs.vy > 0 && obs.y >= obs.targetY) {
          obs.y = obs.targetY;
          obs.vy = -Math.abs(obs.vy);
          obs.direction = -1;
          this.particles.emitDust(obs.x, obs.y, 4);
        } else if (obs.vy < 0 && obs.y <= obs.startY) {
          obs.y = obs.startY;
          obs.vy = Math.abs(obs.vy);
          obs.direction = 1;
          this.particles.emitDust(obs.x, obs.y, 4);
        }
      }

      // Handle Periodic Active/Inactive states (for Electric Gate and Spiked Crush)
      if (obs.type === 'ELECTRIC_GATE') {
        const cycle = obs.timer % (obs.period + 1.2);
        obs.active = cycle < obs.period;
        if (obs.active && Math.random() < 0.3) {
          this.particles.emitSparkles(obs.x + (Math.random() - 0.5) * 20, obs.y, 1);
        }
      } else if (obs.type === 'SPIKED_CRUSH') {
        const cycle = obs.timer % obs.period;
        obs.active = cycle < (obs.period * 0.5);
      }

      // Check forgiving collision with player (gentle hitbox for kids)
      const dist = Math.hypot(p.x - obs.x, p.y - obs.y);
      const effectiveRadius = (p.radius + obs.radius) * 0.8;
      
      if (dist < effectiveRadius && p.invincibleTimer <= 0) {
        if (obs.type === 'BEACH_BALL' || obs.type === 'ROLLING_BARREL') {
          soundSynth.playBoing();
          p.vx += (obs.vx || 1) * 1.3;
          p.vy += (obs.vy || 1) * 1.3;
          this.particles.emitSparkles(p.x, p.y, 10);
          this.handleDamage(10, 'Bounced by Beach Ball! 🎈', false);
          this.addFloatingText(p.x, p.y - 35, '🎈 Boing!', '#f43f5e', 1.3);
        } else if (obs.type === 'PINWHEEL' || obs.type === 'SPINNING_SAW') {
          soundSynth.playPinwheelWhoosh();
          const angle = Math.atan2(p.y - obs.y, p.x - obs.x);
          p.vx += Math.cos(angle) * 4.5;
          p.vy += Math.sin(angle) * 4.5;
          this.particles.emitSparkles(p.x, p.y, 10);
          this.handleDamage(8, 'Swirled by Toy Pinwheel! 🌸', false);
          this.addFloatingText(p.x, p.y - 35, '🌸 Whoosh! 💨', '#38bdf8', 1.3);
        } else if (obs.type === 'BUBBLE_VENT' || obs.type === 'ELECTRIC_GATE') {
          soundSynth.playBubblePop();
          const angle = Math.atan2(p.y - obs.y, p.x - obs.x);
          p.vx += Math.cos(angle) * 3.5;
          p.vy += Math.sin(angle) * 3.5;
          this.particles.emitSparkles(p.x, p.y, 12);
          this.handleDamage(8, 'Popped by Soap Bubbles! 🫧', false);
          this.addFloatingText(p.x, p.y - 35, '🫧 Pop! Pop!', '#06b6d4', 1.3);
        } else if (obs.type === 'JELLY_BOUNCER' || obs.type === 'SPIKED_CRUSH') {
          soundSynth.playJellySquish();
          const angle = Math.atan2(p.y - obs.y, p.x - obs.x);
          p.vx += Math.cos(angle) * 4.2;
          p.vy += Math.sin(angle) * 4.2;
          this.particles.emitSparkles(p.x, p.y, 10);
          this.handleDamage(10, 'Squished into Jelly! 🍮', false);
          this.addFloatingText(p.x, p.y - 35, '🍮 Squish! Boing!', '#fb7185', 1.3);
        }
      }

      // Check collision with chasers -> stun them playfully!
      if (this.maze?.chasers) {
        this.maze.chasers.forEach(chaser => {
          if (chaser.state === 'STUNNED') return;
          const cDist = Math.hypot(chaser.x - obs.x, chaser.y - obs.y);
          if (cDist < chaser.radius + obs.radius) {
            chaser.state = 'STUNNED';
            chaser.stunTimer = 3.0;
            soundSynth.playBoing();
            this.particles.emitDebris(chaser.x, chaser.y, 8);
            this.particles.emitSparkles(chaser.x, chaser.y, 10);
            const pts = 400 * this.combo;
            this.score += pts;
            this.addFloatingText(chaser.x, chaser.y - 30, `🎈 BONK! +${pts}`, '#38bdf8', 1.4);
            this.combo = Math.min(5, this.combo + 1);
            this.comboTimer = 6.0;
          }
        });
      }
    });
  }

  private updateTraps(dt: number) {
    const p = this.player;

    this.maze.traps.forEach(trap => {
      trap.timer += dt;
      if (trap.timer >= trap.period) {
        trap.timer = 0;
        trap.active = !trap.active;
        if (trap.type === 'STEAM_VENT' && trap.active) {
          this.particles.emitSteam(trap.x, trap.y);
        }
      }

      // Check collision with player
      const dist = Math.hypot(p.x - trap.x, p.y - trap.y);
      if (dist < p.radius + trap.radius) {
        if (trap.type === 'SPIKES' && trap.active && p.invincibleTimer <= 0) {
          this.handleDamage(18, 'Ouch! Thorns!', true);
        } else if (trap.type === 'STEAM_VENT' && trap.active && p.invincibleTimer <= 0) {
          this.handleDamage(12, 'Scorching Steam!', false);
          // Knockback
          p.vx += (p.x - trap.x) * 0.4;
          p.vy += (p.y - trap.y) * 0.4;
        } else if (trap.type === 'SLIME_PUDDLE') {
          // Slippery slide effect
          p.vx *= 1.15;
          p.vy *= 1.15;
          if (Math.random() < 0.2) {
            this.particles.emitWaterSplash(p.x, p.y, 2, 1.5);
          }
        }
      }
    });
  }

  private handleDamage(waterPenalty: number, reason: string, isLifeLoss: boolean = false) {
    const p = this.player;
    if (p.invincibleTimer > 0) return;

    p.invincibleTimer = 1.6;
    this.damageFlash = 1.0;
    this.addCameraShake(14, 0.4);

    if (isLifeLoss) {
      p.lives = Math.max(0, p.lives - 1);
      soundSynth.playLifeLost();
      this.particles.emitSweat(p.x, p.y, p.angle);
      this.particles.emitDebris(p.x, p.y, 12);
      this.addFloatingText(p.x, p.y - 45, `💔 -1 LIFE! (${p.lives}/${p.maxLives} LEFT)`, '#ef4444', 1.5);
      
      if (p.lives <= 0) {
        this.triggerGameOver(`Game Over! ${reason}`);
        return;
      }
    } else {
      soundSynth.playDamage();
    }

    if (p.powerups.lidTimer <= 0) {
      const lost = Math.min(p.water, waterPenalty);
      p.water = Math.max(0, p.water - lost);
      this.particles.emitWaterSplash(p.x, p.y, 14, 4.5);
      this.addFloatingText(p.x, p.y - 20, `-${lost}% Water! (${reason})`, '#ef4444', 1.2);
    } else {
      this.addFloatingText(p.x, p.y - 20, 'Shielded by Bucket Lid!', '#60a5fa', 1.1);
    }

    this.combo = 1;
    this.comboTimer = 0;
  }

  private updateCrops(dt: number) {
    const p = this.player;

    this.maze.crops.forEach(crop => {
      if (crop.watered) return;

      const dist = Math.hypot(p.x - crop.x, p.y - crop.y);
      if (dist < p.radius + 35) {
        // Player is next to thirsty crop! Water it!
        if (p.water > 0) {
          const waterRequired = this.difficulty === 'NIGHTMARE' ? 20 : 15;
          crop.waterLevel += dt * 70;

          // Water splash towards plant
          if (Math.random() < 0.4) {
            this.particles.emitWaterSplash(crop.x, crop.y, 3, 2.0);
          }

          if (crop.waterLevel >= 100) {
            crop.watered = true;
            crop.waterLevel = 100;
            this.cropsWateredCount++;

            // Deduct water
            p.water = Math.max(0, p.water - waterRequired);

            // Joyful bloom fanfare & bloom particles!
            const isAllClear = this.cropsWateredCount >= this.totalCropsNeeded;
            soundSynth.playWaterCrop(isAllClear);
            this.particles.emitCropBloom(crop.x, crop.y, 30);

            // Combo & Score Bonus
            this.combo = Math.min(5, this.combo + 1);
            this.comboTimer = 7.0; // 7 seconds to maintain combo
            const points = 500 * this.combo;
            this.score += points;

            this.addFloatingText(crop.x, crop.y - 30, `🌸 CROP REVIVED! +${points}`, '#4ade80', 1.4);
            if (this.combo > 1) {
              this.addFloatingText(crop.x, crop.y - 55, `COMBO x${this.combo}!`, '#facc15', 1.2);
            }

            if (isAllClear) {
              this.addFloatingText(p.x, p.y - 70, '✨ ALL CROPS SAVED! RUN TO EXIT! ✨', '#38bdf8', 2.0);
              this.victoryGlow = 1.0;
            }
          }
        } else {
          // No water!
          this.addFloatingText(crop.x, crop.y - 25, 'Bucket is Empty! Find a Well!', '#f87171', 0.8);
        }
      }
    });
  }

  private updateWells(dt: number) {
    const p = this.player;

    this.maze.wells.forEach(well => {
      if (well.depleted) return;

      const dist = Math.hypot(p.x - well.x, p.y - well.y);
      if (dist < p.radius + 32) {
        if (p.water < p.maxWater) {
          p.water = Math.min(p.maxWater, p.water + dt * 65);
          soundSynth.playRefill();
          this.particles.emitWaterSplash(well.x, well.y, 2, 2.0);

          if (p.water >= p.maxWater) {
            this.addFloatingText(well.x, well.y - 30, '💧 BUCKET FULL! 100%', '#38bdf8', 1.3);
          }
        }
      }
    });
  }

  private updatePowerUps(dt: number) {
    const p = this.player;

    this.maze.powerups.forEach(pw => {
      if (pw.collected) return;
      pw.bobOffset += dt * 4;
      pw.sparkleTimer += dt;
      if (pw.sparkleTimer > 0.3) {
        pw.sparkleTimer = 0;
        this.particles.emitSparkles(pw.x, pw.y, 2);
      }

      const dist = Math.hypot(p.x - pw.x, p.y - pw.y);
      if (dist < p.radius + 24) {
        pw.collected = true;
        soundSynth.playPowerup();
        this.particles.emitSparkles(pw.x, pw.y, 16);

        if (pw.type === 'SPONGE') {
          p.water = Math.min(p.maxWater, p.water + 35);
          p.powerups.spongeTimer = 10;
          this.addFloatingText(pw.x, pw.y - 30, '🧽 SUPER SPONGE! +35% Water', '#38bdf8', 1.4);
        } else if (pw.type === 'CLOCK') {
          this.timeLeft += 15;
          this.addFloatingText(pw.x, pw.y - 30, '⏰ CHRONO CLOCK! +15 Seconds', '#facc15', 1.4);
        } else if (pw.type === 'NIGHT_VISION') {
          p.powerups.nightVisionTimer = 12;
          this.addFloatingText(pw.x, pw.y - 30, '🔦 MEGABEAM FLASHLIGHT!', '#4ade80', 1.4);
        } else if (pw.type === 'TURBO_SODA') {
          p.powerups.turboTimer = 8;
          this.addFloatingText(pw.x, pw.y - 30, '⚡ TURBO SODA! Fast Speed!', '#fb923c', 1.4);
        } else if (pw.type === 'BUCKET_LID') {
          p.powerups.lidTimer = 10;
          this.addFloatingText(pw.x, pw.y - 30, '🛡️ BUCKET LID! Spill Proof!', '#a78bfa', 1.4);
        } else if (pw.type === 'HEART') {
          if (p.lives < p.maxLives) {
            p.lives = Math.min(p.maxLives, p.lives + 1);
            soundSynth.playLifeGain();
            this.addFloatingText(pw.x, pw.y - 30, `💖 +1 EXTRA LIFE! (${p.lives}/${p.maxLives})`, '#f43f5e', 1.6);
          } else {
            p.water = Math.min(p.maxWater, p.water + 40);
            this.score += 750;
            soundSynth.playLifeGain();
            this.addFloatingText(pw.x, pw.y - 30, '💖 MAX LIVES! +750 PTS & +40% WATER!', '#fb7185', 1.4);
          }
        }

        this.score += 250;
      }
    });
  }

  private updateChasers(dt: number) {
    const p = this.player;
    const tileSize = this.maze.tileSize;

    this.maze.chasers.forEach(chaser => {
      chaser.animTimer += dt * 6;

      // Handle Stunned / Captured State
      if (chaser.stunTimer > 0) {
        if (chaser.stunTimer < 900) {
          chaser.stunTimer -= dt;
          chaser.state = 'STUNNED';
          chaser.vx *= 0.8;
          chaser.vy *= 0.8;
          chaser.facingAngle += dt * 8; // Spin around comically
          if (Math.random() < 0.2) {
            this.particles.emitSparkles(chaser.x, chaser.y, 1);
          }
          if (chaser.stunTimer <= 0) {
            chaser.state = 'PATROL';
            chaser.patrolTimer = 1.0;
          }
        }
        this.resolveChaserWallCollisions(chaser);
        return;
      }

      const dx = p.x - chaser.x;
      const dy = p.y - chaser.y;
      const dist = Math.hypot(dx, dy);

      // Detection radius (wider if player sprinting / high water slosh)
      const detectRadius = p.isSprinting ? tileSize * 5.5 : tileSize * 4.2;

      // Line of Sight check
      const hasLOS = dist < detectRadius && this.hasLineOfSight(chaser.x, chaser.y, p.x, p.y);

      // Difficulty speed adjustment
      let speedMult = 1.0;
      if (this.difficulty === 'RELAXED') speedMult = 0.75;
      if (this.difficulty === 'NIGHTMARE') speedMult = 1.25;

      const baseSpeed = chaser.speed * speedMult;

      if (chaser.type === 'GOLDEN_BANDIT') {
        // Golden Bandit flees when player gets close, otherwise patrols
        if (dist < tileSize * 4.0) {
          chaser.state = 'FLEE';
          // Run away from player
          const fleeAngle = Math.atan2(-dy, -dx);
          chaser.facingAngle = fleeAngle;
          chaser.vx += Math.cos(fleeAngle) * baseSpeed * 0.35;
          chaser.vy += Math.sin(fleeAngle) * baseSpeed * 0.35;
          if (Math.random() < 0.25) {
            this.particles.emitSparkles(chaser.x, chaser.y, 1);
          }
        } else {
          chaser.state = 'PATROL';
          this.handleChaserPatrol(chaser, dt, baseSpeed);
        }
      } else {
        // GREEDY_GUZZLER or SPEEDY_SPRINTER
        if (hasLOS || (dist < tileSize * 2.8 && chaser.state === 'CHASE')) {
          if (chaser.state === 'PATROL') {
            chaser.state = 'ALERT';
            chaser.alertTimer = 0.28;
            soundSynth.playChaserAlert();
            this.addFloatingText(chaser.x, chaser.y - 25, '❗ DETECTED!', '#ef4444', 1.0);
          }

          if (chaser.state === 'ALERT') {
            chaser.alertTimer -= dt;
            chaser.facingAngle = Math.atan2(dy, dx);
            if (chaser.alertTimer <= 0) {
              chaser.state = 'CHASE';
            }
          } else if (chaser.state === 'CHASE') {
            const chaseAngle = Math.atan2(dy, dx);
            chaser.facingAngle = chaseAngle;
            const chaseSpeed = chaser.type === 'SPEEDY_SPRINTER' ? baseSpeed * 1.2 : baseSpeed;
            chaser.vx += Math.cos(chaseAngle) * chaseSpeed * 0.35;
            chaser.vy += Math.sin(chaseAngle) * chaseSpeed * 0.35;

            // Sprinter smoke puffs
            if (chaser.type === 'SPEEDY_SPRINTER' && Math.random() < 0.25) {
              this.particles.emitDust(chaser.x, chaser.y, 2);
            }
          }
        } else {
          if (chaser.state === 'CHASE') {
            // Lost player, go back to patrol after brief delay
            chaser.state = 'PATROL';
            chaser.patrolTimer = 1.8;
          }
          this.handleChaserPatrol(chaser, dt, baseSpeed * 0.7);
        }
      }

      // Drag
      chaser.vx *= 0.82;
      chaser.vy *= 0.82;

      // Wall collision resolution
      this.resolveChaserWallCollisions(chaser);

      // Facing Angle update from movement
      const moveSpd = Math.hypot(chaser.vx, chaser.vy);
      if (moveSpd > 0.3 && chaser.state !== 'ALERT') {
        chaser.facingAngle = Math.atan2(chaser.vy, chaser.vx);
      }

      // Check Traps Collision with Chasers (Fun Trap Bamboozling!)
      this.maze.traps.forEach(trap => {
        if (!trap.active) return;
        const trapDist = Math.hypot(chaser.x - trap.x, chaser.y - trap.y);
        if (trapDist < chaser.radius + trap.radius) {
          chaser.state = 'STUNNED';
          chaser.stunTimer = 3.5;
          soundSynth.playChaserStunned();
          this.particles.emitDebris(chaser.x, chaser.y, 10);
          this.particles.emitSweat(chaser.x, chaser.y, chaser.facingAngle);
          
          // Reward player for baiting enemy into a trap!
          const bamboozlePoints = 350 * this.combo;
          this.score += bamboozlePoints;
          this.addFloatingText(chaser.x, chaser.y - 30, `💫 TRAP BAMBOOZLE! +${bamboozlePoints}`, '#f59e0b', 1.4);
          this.combo = Math.min(5, this.combo + 1);
          this.comboTimer = 6.0;
        }
      });

      // Check Player Collision
      if (dist < p.radius + chaser.radius) {
        if (chaser.type === 'GOLDEN_BANDIT') {
          if (chaser.isCarryingBonus) {
            chaser.isCarryingBonus = false;
            chaser.stunTimer = 999; // captured!
            soundSynth.playBanditCatch();
            p.water = p.maxWater; // 100% full water
            this.timeLeft += 15;
            const banditBonus = 1200 * this.combo;
            this.score += banditBonus;
            this.particles.emitCropBloom(chaser.x, chaser.y, 35);
            this.addFloatingText(chaser.x, chaser.y - 35, `🌟 GOLDEN BANDIT CAUGHT! +${banditBonus} & 100% WATER!`, '#facc15', 1.6);
            this.victoryGlow = 0.8;
          }
        } else {
          // Guzzler or Sprinter tackle
          if (chaser.state !== 'STUNNED') {
            if (p.invincibleTimer > 0) {
              // Bounced off invincible player
              chaser.vx = -chaser.vx * 1.5;
              chaser.vy = -chaser.vy * 1.5;
            } else {
              soundSynth.playChaserTackle();
              this.addCameraShake(10, 0.3);
              this.damageFlash = 0.8;
              p.invincibleTimer = 1.6;

              if (p.powerups.lidTimer > 0) {
                this.addFloatingText(p.x, p.y - 30, '🛡️ BLOCKED BY BUCKET LID!', '#60a5fa', 1.3);
              } else {
                const waterLoss = Math.min(p.water, this.difficulty === 'NIGHTMARE' ? 16 : 10);
                p.water = Math.max(0, p.water - waterLoss);
                this.particles.emitWaterSplash(p.x, p.y, 12, 3.5);
                this.addFloatingText(p.x, p.y - 30, `💦 TACKLED! -${waterLoss}% Water!`, '#f87171', 1.4);
                this.combo = 1;
                this.comboTimer = 0;
              }

              // Knockback & daze chaser
              chaser.state = 'STUNNED';
              chaser.stunTimer = 1.8;
              chaser.vx = -Math.cos(chaser.facingAngle) * 4;
              chaser.vy = -Math.sin(chaser.facingAngle) * 4;
            }
          }
        }
      }
    });
  }

  private hasLineOfSight(x1: number, y1: number, x2: number, y2: number): boolean {
    const tileSize = this.maze.tileSize;
    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.hypot(dx, dy);
    const steps = Math.ceil(dist / (tileSize * 0.4));
    
    for (let i = 1; i < steps; i++) {
      const px = x1 + (dx * i) / steps;
      const py = y1 + (dy * i) / steps;
      const c = Math.floor(px / tileSize);
      const r = Math.floor(py / tileSize);
      if (r >= 0 && r < this.maze.rows && c >= 0 && c < this.maze.cols) {
        if (this.maze.tiles[r][c].type === 'WALL') {
          return false;
        }
      }
    }
    return true;
  }

  private handleChaserPatrol(chaser: any, dt: number, speed: number) {
    chaser.patrolTimer -= dt;
    if (chaser.patrolTimer <= 0) {
      chaser.patrolTimer = 1.2 + Math.random() * 2.0;
      const angles = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5];
      chaser.facingAngle = angles[Math.floor(Math.random() * angles.length)];
    }
    chaser.vx += Math.cos(chaser.facingAngle) * speed * 0.25;
    chaser.vy += Math.sin(chaser.facingAngle) * speed * 0.25;
  }

  private resolveChaserWallCollisions(chaser: any) {
    const tileSize = this.maze.tileSize;
    const tiles = this.maze.tiles;

    chaser.x += chaser.vx;
    let minC = Math.max(0, Math.floor((chaser.x - chaser.radius) / tileSize));
    let maxC = Math.min(this.maze.cols - 1, Math.floor((chaser.x + chaser.radius) / tileSize));
    let minR = Math.max(0, Math.floor((chaser.y - chaser.radius) / tileSize));
    let maxR = Math.min(this.maze.rows - 1, Math.floor((chaser.y + chaser.radius) / tileSize));

    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        if (tiles[r][c].type === 'WALL') {
          const nearestX = Math.max(c * tileSize, Math.min(chaser.x, (c + 1) * tileSize));
          const nearestY = Math.max(r * tileSize, Math.min(chaser.y, (r + 1) * tileSize));
          const dx = chaser.x - nearestX;
          const dy = chaser.y - nearestY;
          const dist = Math.hypot(dx, dy);

          if (dist < chaser.radius) {
            const overlap = chaser.radius - dist;
            if (dist > 0.001) {
              chaser.x += (dx / dist) * overlap;
            }
            chaser.vx = -chaser.vx * 0.5;
            chaser.patrolTimer = 0;
          }
        }
      }
    }

    chaser.y += chaser.vy;
    minC = Math.max(0, Math.floor((chaser.x - chaser.radius) / tileSize));
    maxC = Math.min(this.maze.cols - 1, Math.floor((chaser.x + chaser.radius) / tileSize));
    minR = Math.max(0, Math.floor((chaser.y - chaser.radius) / tileSize));
    maxR = Math.min(this.maze.rows - 1, Math.floor((chaser.y + chaser.radius) / tileSize));

    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        if (tiles[r][c].type === 'WALL') {
          const nearestX = Math.max(c * tileSize, Math.min(chaser.x, (c + 1) * tileSize));
          const nearestY = Math.max(r * tileSize, Math.min(chaser.y, (r + 1) * tileSize));
          const dx = chaser.x - nearestX;
          const dy = chaser.y - nearestY;
          const dist = Math.hypot(dx, dy);

          if (dist < chaser.radius) {
            const overlap = chaser.radius - dist;
            if (dist > 0.001) {
              chaser.y += (dy / dist) * overlap;
            }
            chaser.vy = -chaser.vy * 0.5;
            chaser.patrolTimer = 0;
          }
        }
      }
    }
  }

  private updateSpookyEyes(dt: number) {
    this.maze.spookyEyes.forEach(eyes => {
      if (eyes.isScared) {
        eyes.alpha -= dt * 3.5;
        if (eyes.alpha <= 0) eyes.alpha = 0;
      } else {
        eyes.blinkTimer -= dt;
        if (eyes.blinkTimer <= 0) {
          eyes.isBlinking = !eyes.isBlinking;
          eyes.blinkTimer = eyes.isBlinking ? 0.18 : 2.0 + Math.random() * 4.0;
        }
      }
    });
  }

  private checkExit() {
    const p = this.player;
    const dist = Math.hypot(p.x - this.maze.exitX, p.y - this.maze.exitY);

    if (dist < p.radius + 28) {
      if (this.cropsWateredCount >= this.totalCropsNeeded) {
        // Complete the Level!
        this.triggerVictory();
      } else {
        // Crops remaining warning
        const remaining = this.totalCropsNeeded - this.cropsWateredCount;
        this.addFloatingText(
          this.maze.exitX,
          this.maze.exitY - 30,
          `🔒 Exit Sealed! ${remaining} Crop${remaining > 1 ? 's' : ''} Still Thirsty!`,
          '#f87171',
          0.9
        );
      }
    }
  }

  private triggerVictory() {
    this.status = 'VICTORY';
    soundSynth.stopBGM();
    soundSynth.stopHeartbeat();
    soundSynth.playVictoryFanfare();

    // Calculate score breakdown
    const baseScore = 1500;
    const waterBonus = Math.floor(this.player.water * 35);
    const timeBonus = Math.floor(this.timeLeft * 40);
    const comboBonus = this.combo * 300;
    const totalScore = this.score + baseScore + waterBonus + timeBonus + comboBonus;

    // Stars calculation: 3 stars if > 60% water and > 30% time remaining
    let stars = 1;
    if (this.player.water >= 40 && this.timeLeft >= 15) stars = 2;
    if (this.player.water >= 70 && this.timeLeft >= 25) stars = 3;

    this.lastScoreBreakdown = {
      baseScore,
      waterBonus,
      timeBonus,
      comboBonus,
      totalScore,
      stars
    };

    // Save High Score
    this.saveHighScore(totalScore, stars);
  }

  private triggerGameOver(reason: string) {
    this.status = 'GAMEOVER';
    soundSynth.stopBGM();
    soundSynth.stopHeartbeat();
    soundSynth.playGameOver();
    this.addFloatingText(this.player.x, this.player.y - 40, reason, '#ef4444', 2.0);
  }

  private saveHighScore(score: number, stars: number) {
    try {
      const recordsKey = 'maze_runner_thirst_scores';
      const existingStr = localStorage.getItem(recordsKey);
      const records: HighScoreRecord[] = existingStr ? JSON.parse(existingStr) : [];

      const newRecord: HighScoreRecord = {
        id: `${Date.now()}-${Math.random()}`,
        date: new Date().toLocaleDateString(),
        level: this.currentLevelConfig.levelNumber,
        score,
        stars,
        waterLeft: Math.round(this.player.water),
        timeLeft: Math.round(this.timeLeft),
        mode: this.mode
      };

      records.unshift(newRecord);
      // Keep top 15
      records.sort((a, b) => b.score - a.score);
      const top15 = records.slice(0, 15);
      localStorage.setItem(recordsKey, JSON.stringify(top15));
    } catch {
      // LocalStorage access fail safe
    }
  }

  public getHighScores(): HighScoreRecord[] {
    try {
      const recordsKey = 'maze_runner_thirst_scores';
      const existingStr = localStorage.getItem(recordsKey);
      return existingStr ? JSON.parse(existingStr) : [];
    } catch {
      return [];
    }
  }

  public addCameraShake(intensity: number, duration: number) {
    this.camera.shakeIntensity = Math.max(this.camera.shakeIntensity, intensity);
    this.camera.shakeDuration = Math.max(this.camera.shakeDuration, duration);
  }

  private updateCamera(dt: number) {
    // Smooth Lerp tracking
    const targetX = this.player.x;
    const targetY = this.player.y;
    this.camera.x += (targetX - this.camera.x) * 0.12;
    this.camera.y += (targetY - this.camera.y) * 0.12;

    // Shake update
    if (this.camera.shakeDuration > 0) {
      this.camera.shakeDuration -= dt;
      this.camera.shakeX = (Math.random() - 0.5) * 2 * this.camera.shakeIntensity;
      this.camera.shakeY = (Math.random() - 0.5) * 2 * this.camera.shakeIntensity;
      this.camera.shakeIntensity *= 0.9;
    } else {
      this.camera.shakeX = 0;
      this.camera.shakeY = 0;
      this.camera.shakeIntensity = 0;
    }
  }

  public addFloatingText(x: number, y: number, text: string, color: string = '#ffffff', scale: number = 1.0) {
    this.floatingTexts.push({
      id: `${Date.now()}-${Math.random()}`,
      x,
      y,
      text,
      color,
      life: 1.2,
      maxLife: 1.2,
      vy: -1.2,
      scale
    });
  }

  private updateFloatingTexts(dt: number) {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      ft.y += ft.vy * dt * 60;
      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }
  }
}
