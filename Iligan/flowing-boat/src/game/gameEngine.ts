import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PLAYER_WALK_WIDTH,
  PLAYER_WALK_HEIGHT,
  BOAT_WIDTH,
  BOAT_HEIGHT,
  WALK_SPEED_X,
  WALK_SPEED_Y_FORWARD,
  WALK_SPEED_Y_BACKWARD,
  BOAT_SPEED_X,
  BOAT_BASE_SPEED_Y,
  BOAT_ACCEL_SPEED_Y,
  BOAT_BRAKE_SPEED_Y,
  BOAT_BOOST_SPEED_Y,
  JUMP_GRAVITY,
  JUMP_VELOCITY,
  RIVER_MIN_X,
  RIVER_MAX_X,
  ROUNDS_CONFIG,
  TOTAL_ROUNDS,
  DIFFICULTY_CONFIG,
} from './constants';
import {
  GameStage,
  Difficulty,
  PlayerState,
  Obstacle,
  WaveState,
  GameStats,
  RoundConfig,
} from '../types';
import { ParticleSystem } from './particles';
import { soundManager } from '../audio/soundManager';

export interface InputState {
  left: boolean;
  right: boolean;
  up: boolean;
  down: boolean;
  space: boolean;
}

export class GameEngine {
  public stage: GameStage = 'menu';
  public difficulty: Difficulty = 'normal';
  public currentRound: number = 1;
  public waveSpeedMultiplier: number = 1.0;
  public player: PlayerState;
  public wave: WaveState;
  public obstacles: Obstacle[] = [];
  public particles: ParticleSystem = new ParticleSystem();
  public cameraY = 0;
  public stats: GameStats;

  // Transition state
  public transitionProgress = 0;
  public transitionDuration = 1.6;
  public transitionTimer = 0;

  // Input tracking
  public inputs: InputState = {
    left: false,
    right: false,
    up: false,
    down: false,
    space: false,
  };
  private spaceWasPressed = false;
  private footstepTimer = 0;
  private paddleTimer = 0;

  // Callback events
  public onGameOver?: (reason: string) => void;
  public onVictory?: (stats: GameStats) => void;
  public onRoundCleared?: (stats: GameStats, clearedRound: number, nextRound: number) => void;
  public onStageChange?: (newStage: GameStage) => void;

  constructor() {
    this.player = this.createInitialPlayer();
    this.wave = this.createInitialWave();
    this.stats = this.createInitialStats();
  }

  public getCurrentRoundConfig(): RoundConfig {
    const idx = Math.max(0, Math.min(ROUNDS_CONFIG.length - 1, this.currentRound - 1));
    return ROUNDS_CONFIG[idx];
  }

  public getRoundConfig(): RoundConfig {
    return this.getCurrentRoundConfig();
  }

  public getStage1Length(): number {
    return this.getCurrentRoundConfig().stage1Length;
  }

  public getStage2Length(): number {
    return this.getCurrentRoundConfig().stage2Length;
  }

  public getTotalGameLength(): number {
    return this.getStage1Length() + this.getStage2Length();
  }

  private createInitialPlayer(): PlayerState {
    const config = DIFFICULTY_CONFIG[this.difficulty];
    return {
      x: 375, // Center of path in Stage 1
      y: 180,
      vx: 0,
      vy: 0,
      width: PLAYER_WALK_WIDTH,
      height: PLAYER_WALK_HEIGHT,
      isJumping: false,
      jumpZ: 0,
      jumpVz: 0,
      facing: 'up',
      walkFrame: 0,
      rowFrame: 0,
      health: config.playerHealth,
      maxHealth: config.playerHealth,
      invulnerableTime: 0,
      boostCooldown: 0,
      boostActiveTime: 0,
      isBoosting: false,
      score: 0,
      distanceTraveled: 0,
    };
  }

  private createInitialWave(): WaveState {
    const diffConfig = DIFFICULTY_CONFIG[this.difficulty];
    const roundConfig = this.getCurrentRoundConfig();
    const waveSpeed = diffConfig.waveSpeedStage1 * roundConfig.waveSpeedMultiplier * this.waveSpeedMultiplier;
    return {
      y: -140, // behind player start
      speed: waveSpeed,
      baseSpeed: waveSpeed,
      height: 90,
      foamOffset: 0,
      surgeTimer: 0,
    };
  }

  private createInitialStats(): GameStats {
    return {
      timeElapsed: 0,
      stage1Time: 0,
      stage2Time: 0,
      obstaclesDodged: 0,
      damageTaken: 0,
      boostsUsed: 0,
      starsEarned: 3,
      currentRound: this.currentRound,
      totalRounds: TOTAL_ROUNDS,
      roundStats: [],
    };
  }

  public setWaveSpeedMultiplier(multiplier: number) {
    this.waveSpeedMultiplier = Math.max(0.4, Math.min(2.5, multiplier));
  }

  public startGame(difficulty: Difficulty = 'normal', startingRound: number = 1, waveSpeedMultiplier: number = 1.0) {
    this.difficulty = difficulty;
    this.currentRound = startingRound;
    this.waveSpeedMultiplier = Math.max(0.4, Math.min(2.5, waveSpeedMultiplier));
    this.stats = this.createInitialStats();
    this.startRound(this.currentRound);
  }

  public startRound(roundNumber: number) {
    this.currentRound = roundNumber;
    this.stats.currentRound = roundNumber;
    const diffConfig = DIFFICULTY_CONFIG[this.difficulty];
    const roundConfig = this.getCurrentRoundConfig();

    this.stage = 'stage1_walking';
    this.player = this.createInitialPlayer();
    this.wave = this.createInitialWave();
    this.particles.clear();
    this.cameraY = 0;
    this.transitionProgress = 0;
    this.transitionTimer = 0;

    // Generate round obstacles
    const combinedDensity = diffConfig.obstacleDensity * roundConfig.obstacleDensityMultiplier;
    this.generateCourseObstacles(combinedDensity, roundConfig.biome);

    if (this.onStageChange) this.onStageChange(this.stage);
  }

  public nextRound() {
    if (this.currentRound < TOTAL_ROUNDS) {
      this.startRound(this.currentRound + 1);
    } else {
      this.triggerVictory();
    }
  }

  public retryCurrentRound() {
    this.startRound(this.currentRound);
  }

  private generateCourseObstacles(density: number, biome: 'forest' | 'canyon' | 'storm') {
    this.obstacles = [];
    const stage1Len = this.getStage1Length();
    const totalLen = this.getTotalGameLength();

    // --- Stage 1: Path Obstacles ---
    const pathLeft = 230;
    const pathRight = 520;
    const stage1Step = 180 / density;

    for (let y = 380; y < stage1Len - 180; y += stage1Step + Math.random() * 50) {
      const rand = Math.random();
      const x = pathLeft + Math.random() * (pathRight - pathLeft);

      if (biome === 'forest') {
        if (rand < 0.35) {
          this.obstacles.push({
            id: `s1_rock_${y}`,
            type: 'rock',
            x,
            y,
            width: 38,
            height: 28,
            rotation: (Math.random() - 0.5) * 0.4,
            canJumpOver: true,
            damage: 1,
            active: true,
          });
        } else if (rand < 0.65) {
          this.obstacles.push({
            id: `s1_root_${y}`,
            type: 'tree_root',
            x,
            y,
            width: 50,
            height: 20,
            rotation: (Math.random() - 0.5) * 0.2,
            canJumpOver: true,
            damage: 1,
            active: true,
          });
        } else if (rand < 0.85) {
          this.obstacles.push({
            id: `s1_mud_${y}`,
            type: 'mud_puddle',
            x,
            y,
            width: 55,
            height: 35,
            rotation: 0,
            canJumpOver: true,
            damage: 0,
            speedModifier: 0.5,
            active: true,
          });
        } else {
          this.obstacles.push({
            id: `s1_bush_${y}`,
            type: 'spike_bush',
            x,
            y,
            width: 36,
            height: 36,
            rotation: 0,
            canJumpOver: true,
            damage: 1,
            active: true,
          });
        }
      } else if (biome === 'canyon') {
        if (rand < 0.4) {
          this.obstacles.push({
            id: `s1_crock_${y}`,
            type: 'rock',
            x,
            y,
            width: 42,
            height: 32,
            rotation: (Math.random() - 0.5) * 0.5,
            canJumpOver: true,
            damage: 1,
            active: true,
          });
        } else if (rand < 0.7) {
          this.obstacles.push({
            id: `s1_cbush_${y}`,
            type: 'spike_bush',
            x,
            y,
            width: 40,
            height: 40,
            rotation: 0,
            canJumpOver: true,
            damage: 1,
            active: true,
          });
        } else {
          this.obstacles.push({
            id: `s1_cmud_${y}`,
            type: 'mud_puddle',
            x,
            y,
            width: 60,
            height: 38,
            rotation: 0,
            canJumpOver: true,
            damage: 0,
            speedModifier: 0.45,
            active: true,
          });
        }
      } else {
        // Storm biome
        if (rand < 0.45) {
          this.obstacles.push({
            id: `s1_srock_${y}`,
            type: 'rock',
            x,
            y,
            width: 44,
            height: 32,
            rotation: (Math.random() - 0.5) * 0.6,
            canJumpOver: true,
            damage: 1,
            active: true,
          });
        } else if (rand < 0.75) {
          this.obstacles.push({
            id: `s1_sroot_${y}`,
            type: 'tree_root',
            x,
            y,
            width: 55,
            height: 24,
            rotation: (Math.random() - 0.5) * 0.3,
            canJumpOver: true,
            damage: 1,
            active: true,
          });
        } else {
          this.obstacles.push({
            id: `s1_smud_${y}`,
            type: 'mud_puddle',
            x,
            y,
            width: 65,
            height: 40,
            rotation: 0,
            canJumpOver: true,
            damage: 0,
            speedModifier: 0.4,
            active: true,
          });
        }
      }
    }

    // --- Stage 2: River Rapids Obstacles ---
    const riverLeft = RIVER_MIN_X + 40;
    const riverRight = RIVER_MAX_X - 40;
    const stage2Step = 150 / density;

    for (let y = stage1Len + 240; y < totalLen - 220; y += stage2Step + Math.random() * 45) {
      const rand = Math.random();
      const x = riverLeft + Math.random() * (riverRight - riverLeft);

      // Higher chance of whirlpools in canyon & storm
      const whirlpoolThreshold = biome === 'storm' ? 0.4 : biome === 'canyon' ? 0.3 : 0.2;

      if (rand < 0.28) {
        // River Rock
        this.obstacles.push({
          id: `s2_rock_${y}`,
          type: 'river_rock',
          x,
          y,
          width: 44,
          height: 34,
          rotation: (Math.random() - 0.5) * 0.3,
          canJumpOver: false,
          damage: 1,
          active: true,
        });
      } else if (rand < 0.52) {
        // Floating Log
        this.obstacles.push({
          id: `s2_log_${y}`,
          type: 'floating_log',
          x,
          y,
          width: 68,
          height: 24,
          rotation: (Math.random() - 0.5) * 0.2,
          canJumpOver: true,
          damage: 1,
          active: true,
        });
      } else if (rand < 0.52 + whirlpoolThreshold) {
        // Whirlpool
        this.obstacles.push({
          id: `s2_whirl_${y}`,
          type: 'whirlpool',
          x,
          y,
          width: 74,
          height: 74,
          rotation: 0,
          rotationSpeed: 2.8,
          canJumpOver: false,
          damage: 1,
          whirlpoolRadius: 58,
          whirlpoolForce: biome === 'storm' ? 190 : 160,
          active: true,
        });
      } else if (rand < 0.85) {
        // Water Lily Boost Pickup
        this.obstacles.push({
          id: `s2_lily_${y}`,
          type: 'water_lily_boost',
          x,
          y,
          width: 34,
          height: 34,
          rotation: 0,
          canJumpOver: true,
          damage: 0,
          isCollectible: true,
          active: true,
        });
      } else {
        // Rapids Current
        this.obstacles.push({
          id: `s2_rapids_${y}`,
          type: 'rapids_current',
          x,
          y,
          width: 85,
          height: 105,
          rotation: 0,
          canJumpOver: true,
          damage: 0,
          speedModifier: 1.4,
          active: true,
        });
      }
    }
  }

  // --- Main Update Loop ---

  public update(dt: number) {
    if (this.stage === 'menu' || this.stage === 'game_over' || this.stage === 'victory') {
      this.particles.update(dt);
      return;
    }

    this.stats.timeElapsed += dt;
    if (this.stage === 'stage1_walking') {
      this.stats.stage1Time += dt;
    } else if (this.stage === 'stage2_boat') {
      this.stats.stage2Time += dt;
    }

    // 1. Invulnerability timer & Boost cooldowns
    if (this.player.invulnerableTime > 0) {
      this.player.invulnerableTime -= dt;
    }
    if (this.player.boostCooldown > 0) {
      this.player.boostCooldown -= dt;
    }
    if (this.player.boostActiveTime > 0) {
      this.player.boostActiveTime -= dt;
      if (this.player.boostActiveTime <= 0) {
        this.player.isBoosting = false;
      }
    }

    // 2. Stage Handling
    if (this.stage === 'stage1_walking') {
      this.updateStage1Walking(dt);
    } else if (this.stage === 'transition') {
      this.updateTransition(dt);
    } else if (this.stage === 'stage2_boat') {
      this.updateStage2Boat(dt);
    }

    // 3. Update Wave Chaser AI
    this.updateWave(dt);

    // 4. Update Particles
    this.particles.update(dt);

    // 5. Update Camera
    this.updateCamera(dt);

    // 6. Space key latch
    this.spaceWasPressed = this.inputs.space;

    // 7. Update wave sound proximity
    const distToWave = this.player.y - this.wave.y;
    soundManager.updateWaveRoar(distToWave);
  }

  // --- Stage 1: Walking on Land ---

  private updateStage1Walking(dt: number) {
    let speedX = 0;
    let speedY = 0;
    let inMud = false;

    // Movement checks
    if (this.inputs.left) {
      speedX -= WALK_SPEED_X;
      this.player.facing = 'left';
    }
    if (this.inputs.right) {
      speedX += WALK_SPEED_X;
      this.player.facing = 'right';
    }
    if (this.inputs.up) {
      speedY += WALK_SPEED_Y_FORWARD;
      this.player.facing = 'up';
    }
    if (this.inputs.down) {
      speedY -= WALK_SPEED_Y_BACKWARD;
    }

    // Jump Handling
    if (this.inputs.space && !this.spaceWasPressed && !this.player.isJumping) {
      this.player.isJumping = true;
      this.player.jumpVz = JUMP_VELOCITY;
      soundManager.playJump();
      this.particles.emitDust(this.player.x, this.player.y);
    }

    if (this.player.isJumping) {
      this.player.jumpZ += this.player.jumpVz * dt;
      this.player.jumpVz -= JUMP_GRAVITY * dt;
      if (this.player.jumpZ <= 0) {
        this.player.jumpZ = 0;
        this.player.isJumping = false;
        this.player.jumpVz = 0;
        this.particles.emitDust(this.player.x, this.player.y);
      }
    }

    // Check mud puddles on ground if not jumping
    if (!this.player.isJumping) {
      for (const ob of this.obstacles) {
        if (ob.type === 'mud_puddle' && ob.active) {
          const dx = this.player.x - ob.x;
          const dy = this.player.y - ob.y;
          if (Math.hypot(dx, dy) < (ob.width / 2)) {
            inMud = true;
            if (ob.speedModifier) {
              speedX *= ob.speedModifier;
              speedY *= ob.speedModifier;
            }
            if (Math.random() < 0.2) {
              this.particles.emitDust(this.player.x, this.player.y);
            }
          }
        }
      }
    }

    // Apply Velocity
    this.player.vx = speedX;
    this.player.vy = speedY;
    this.player.x += speedX * dt;
    this.player.y += speedY * dt;

    // Boundaries on Land: Forest on left (x > 210), River bank on right (x < 530)
    const minX = 210;
    const maxX = 530;
    this.player.x = Math.max(minX, Math.min(maxX, this.player.x));

    // Walk animation & footsteps
    if (Math.abs(speedX) > 10 || Math.abs(speedY) > 10) {
      this.player.walkFrame += dt * (inMud ? 6 : 12);
      this.footstepTimer += dt;
      if (this.footstepTimer >= (inMud ? 0.35 : 0.22)) {
        this.footstepTimer = 0;
        soundManager.playFootstep();
        if (!this.player.isJumping) {
          this.particles.emitDust(this.player.x, this.player.y);
        }
      }
    }

    // Check Obstacle Collisions in Stage 1
    for (const ob of this.obstacles) {
      if (!ob.active) continue;
      if (ob.y < this.player.y - 100 || ob.y > this.player.y + 100) continue;

      if (this.checkCollision(this.player, ob)) {
        if (this.player.isJumping && ob.canJumpOver) {
          // Successfully leaped over obstacle!
          continue;
        }

        // Hit obstacle
        if (ob.damage > 0 && this.player.invulnerableTime <= 0) {
          this.takeDamage(ob.damage, 'Stumbled on path obstacle');
          this.particles.emitSplashes(this.player.x, this.player.y, 8, '#d97706');
        }
      }
    }

    // Check if Old Man reached the Small Boat Dock!
    const dockWorldY = this.getStage1Length() - 40;
    if (this.player.y >= dockWorldY - 20) {
      this.triggerBoatTransition();
    }
  }

  // --- Stage Transition Cutscene (Boarding the Boat) ---

  private triggerBoatTransition() {
    this.stage = 'transition';
    this.transitionTimer = 0;
    this.transitionProgress = 0;
    this.player.isJumping = false;
    this.player.jumpZ = 0;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.width = BOAT_WIDTH;
    this.player.height = BOAT_HEIGHT;

    soundManager.playBoardBoat();
    this.particles.emitPickupSparkles(this.player.x, this.player.y + 40);

    if (this.onStageChange) this.onStageChange(this.stage);
  }

  private updateTransition(dt: number) {
    this.transitionTimer += dt;
    this.transitionProgress = Math.min(1, this.transitionTimer / this.transitionDuration);

    // Old man moves to center of river and boards boat
    const targetX = CANVAS_WIDTH / 2;
    const targetY = this.getStage1Length() + 90;

    this.player.x += (targetX - this.player.x) * dt * 3;
    this.player.y += (targetY - this.player.y) * dt * 3;

    if (this.transitionTimer >= this.transitionDuration) {
      this.stage = 'stage2_boat';
      const config = DIFFICULTY_CONFIG[this.difficulty];
      const roundConfig = this.getCurrentRoundConfig();
      const waveSpeed = config.waveSpeedStage2 * roundConfig.waveSpeedMultiplier * this.waveSpeedMultiplier;
      this.wave.speed = waveSpeed;
      this.wave.baseSpeed = waveSpeed;
      if (this.onStageChange) this.onStageChange(this.stage);
    }
  }

  // --- Stage 2: Riding the Boat Downriver ---

  private updateStage2Boat(dt: number) {
    let speedX = 0;
    let speedY = BOAT_BASE_SPEED_Y; // River naturally carries boat forward!

    // Steering
    if (this.inputs.left) {
      speedX -= BOAT_SPEED_X;
    }
    if (this.inputs.right) {
      speedX += BOAT_SPEED_X;
    }

    // Acceleration & Braking
    if (this.inputs.up) {
      speedY = BOAT_ACCEL_SPEED_Y;
    }
    if (this.inputs.down) {
      speedY = BOAT_BRAKE_SPEED_Y;
    }

    // Boat Boost (Spacebar Oar Leap / Surge)
    if (this.inputs.space && !this.spaceWasPressed && this.player.boostCooldown <= 0) {
      this.player.isBoosting = true;
      this.player.boostActiveTime = 0.55;
      this.player.boostCooldown = 1.8;
      this.stats.boostsUsed++;
      soundManager.playBoost();
      this.particles.emitSplashes(this.player.x, this.player.y + 30, 16);
    }

    if (this.player.isBoosting) {
      speedY = BOAT_BOOST_SPEED_Y;
    }

    // Apply Whirlpool & Rapids forces
    for (const ob of this.obstacles) {
      if (!ob.active) continue;
      if (ob.y < this.player.y - 120 || ob.y > this.player.y + 120) continue;

      if (ob.type === 'whirlpool') {
        const dx = ob.x - this.player.x;
        const dy = ob.y - this.player.y;
        const dist = Math.hypot(dx, dy);
        const radius = ob.whirlpoolRadius || 60;

        if (dist < radius) {
          // Whirlpool pulls boat inward and swirls it
          const pullStrength = (1 - dist / radius) * (ob.whirlpoolForce || 160);
          speedX += (dx / dist) * pullStrength;
          speedY += (dy / dist) * pullStrength * 0.5;

          // Tangential swirl
          speedX += (-dy / dist) * pullStrength * 0.8;
          this.player.rowFrame += dt * 5;

          if (dist < 20 && this.player.invulnerableTime <= 0) {
            this.takeDamage(1, 'Trapped in river whirlpool');
            soundManager.playHit();
            this.particles.emitSplashes(this.player.x, this.player.y, 14);
          }
        }
      } else if (ob.type === 'rapids_current') {
        if (this.checkCollision(this.player, ob)) {
          if (ob.speedModifier) {
            speedY *= ob.speedModifier;
          }
          if (Math.random() < 0.3) {
            this.particles.emitBoatWake(this.player.x, this.player.y, true);
          }
        }
      }
    }

    // Update Boat Position
    this.player.vx = speedX;
    this.player.vy = speedY;
    this.player.x += speedX * dt;
    this.player.y += speedY * dt;

    // Boundaries in River
    const minX = RIVER_MIN_X + 25;
    const maxX = RIVER_MAX_X - 25;
    this.player.x = Math.max(minX, Math.min(maxX, this.player.x));

    // Rowing animation & sound
    this.player.rowFrame += dt * (this.player.isBoosting ? 16 : 8);
    this.paddleTimer += dt;
    if (this.paddleTimer >= (this.player.isBoosting ? 0.2 : 0.42)) {
      this.paddleTimer = 0;
      soundManager.playPaddle();
      this.particles.emitBoatWake(this.player.x, this.player.y, this.player.isBoosting);
    }

    // Check Obstacle Collisions in River
    for (const ob of this.obstacles) {
      if (!ob.active) continue;
      if (ob.y < this.player.y - 120 || ob.y > this.player.y + 120) continue;

      if (this.checkCollision(this.player, ob)) {
        if (ob.isCollectible) {
          // Picked up Water Lily!
          ob.active = false;
          soundManager.playPickup();
          this.player.score += 250;
          this.stats.obstaclesDodged++;
          if (this.player.health < this.player.maxHealth) {
            this.player.health = Math.min(this.player.maxHealth, this.player.health + 1);
          }
          this.player.boostCooldown = 0; // instantly refresh boost!
          this.particles.emitPickupSparkles(ob.x, ob.y);
          continue;
        }

        // Check if boosting through log
        if (this.player.isBoosting && ob.type === 'floating_log') {
          // Smashed through log!
          ob.active = false;
          soundManager.playSplash();
          this.stats.obstaclesDodged++;
          this.particles.emitSplashes(ob.x, ob.y, 18);
          continue;
        }

        // Damage Collision
        if (ob.damage > 0 && this.player.invulnerableTime <= 0) {
          this.takeDamage(ob.damage, `Hit ${ob.type.replace('_', ' ')}`);
          soundManager.playHit();
          this.particles.emitSplashes(this.player.x, this.player.y, 16);
        }
      }
    }

    // Check Finish Line Victory or Round Clear Condition!
    const totalLen = this.getTotalGameLength();
    if (this.player.y >= totalLen) {
      if (this.currentRound < TOTAL_ROUNDS) {
        this.triggerRoundCleared();
      } else {
        this.triggerVictory();
      }
    }
  }

  // --- Wave AI & Chasing Mechanics ---

  private updateWave(dt: number) {
    // Wave moves forward relentlessly
    const config = DIFFICULTY_CONFIG[this.difficulty];
    const roundConfig = this.getCurrentRoundConfig();
    const targetBaseSpeed =
      (this.stage === 'stage1_walking' ? config.waveSpeedStage1 : config.waveSpeedStage2) *
      roundConfig.waveSpeedMultiplier *
      this.waveSpeedMultiplier;

    // As player nears the finish line, wave surges for tension
    const totalLen = this.getTotalGameLength();
    const progress = this.player.y / totalLen;
    const speedMultiplier = 1 + progress * 0.15;
    this.wave.speed = targetBaseSpeed * speedMultiplier;

    // If player is too far ahead, wave speeds up slightly (rubber-banding tension)
    const distToPlayer = this.player.y - this.wave.y;
    if (distToPlayer > config.waveCatchupBuffer) {
      this.wave.y += (this.wave.speed + 45) * dt;
    } else {
      this.wave.y += this.wave.speed * dt;
    }

    // Wave spray particles
    if (Math.random() < 0.4) {
      this.particles.emitWaveSpray(CANVAS_WIDTH / 2, this.wave.y, CANVAS_WIDTH);
    }

    // Check if Wave caught the player or boat!
    if (this.wave.y >= this.player.y - 20) {
      this.triggerGameOver('Caught by the giant tidal wave!');
    }
  }

  // --- Camera Scrolling ---

  private updateCamera(dt: number) {
    // Camera smoothly follows player vertically
    const targetCameraY = this.player.y - CANVAS_HEIGHT * 0.65;
    this.cameraY += (targetCameraY - this.cameraY) * dt * 5;
  }

  // --- Collision Detection ---

  private checkCollision(player: PlayerState, ob: Obstacle): boolean {
    const pLeft = player.x - player.width / 2;
    const pRight = player.x + player.width / 2;
    const pTop = player.y - player.height / 2;
    const pBottom = player.y + player.height / 2;

    const oLeft = ob.x - ob.width / 2;
    const oRight = ob.x + ob.width / 2;
    const oTop = ob.y - ob.height / 2;
    const oBottom = ob.y + ob.height / 2;

    return (
      pLeft < oRight &&
      pRight > oLeft &&
      pTop < oBottom &&
      pBottom > oTop
    );
  }

  // --- Damage & Health System ---

  private takeDamage(damage: number, reason: string) {
    this.player.health -= damage;
    this.player.invulnerableTime = 1.2; // 1.2 seconds invulnerability
    this.stats.damageTaken += damage;

    if (this.player.health <= 0) {
      const deathMessage =
        this.stage === 'stage1_walking'
          ? 'The old man collapsed from too many injuries!'
          : 'The boat was wrecked and sank in the rapids!';
      this.triggerGameOver(deathMessage);
    }
  }

  // --- Round Cleared & Victory Triggers ---

  private triggerRoundCleared() {
    this.stage = 'round_cleared';
    soundManager.stopWaveRoar();
    soundManager.playRoundClear();

    // Calculate stars for this round
    let stars = 1;
    if (this.player.health === this.player.maxHealth) {
      stars = 3;
    } else if (this.player.health >= 2) {
      stars = 2;
    }

    const roundConfig = this.getCurrentRoundConfig();
    this.stats.roundStats.push({
      round: this.currentRound,
      title: roundConfig.title,
      time: this.stats.stage1Time + this.stats.stage2Time,
      stars,
      damage: this.stats.damageTaken,
      boosts: this.stats.boostsUsed,
    });

    if (this.onRoundCleared) {
      this.onRoundCleared(this.stats, this.currentRound, this.currentRound + 1);
    }
    if (this.onStageChange) this.onStageChange(this.stage);
  }

  private triggerVictory() {
    this.stage = 'victory';
    soundManager.stopWaveRoar();
    soundManager.playVictory();

    // Calculate stars (1 - 3 stars)
    let stars = 1;
    if (this.player.health === this.player.maxHealth) {
      stars = 3;
    } else if (this.player.health >= 2) {
      stars = 2;
    }
    this.stats.starsEarned = stars;

    const roundConfig = this.getCurrentRoundConfig();
    this.stats.roundStats.push({
      round: this.currentRound,
      title: roundConfig.title,
      time: this.stats.stage1Time + this.stats.stage2Time,
      stars,
      damage: this.stats.damageTaken,
      boosts: this.stats.boostsUsed,
    });

    if (this.onVictory) {
      this.onVictory(this.stats);
    }
    if (this.onStageChange) this.onStageChange(this.stage);
  }

  private triggerGameOver(reason: string) {
    this.stage = 'game_over';
    soundManager.stopWaveRoar();
    soundManager.playGameOver();

    if (this.onGameOver) {
      this.onGameOver(reason);
    }
    if (this.onStageChange) this.onStageChange(this.stage);
  }
}
