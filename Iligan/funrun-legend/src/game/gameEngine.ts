import { soundManager } from '../audio/soundManager';
import { GameState, LevelConfig, Obstacle, Particle, Player, Powerup, RunStats, CharacterConfig, PlayerRock, Boss, BossRock } from '../types';
import { DEFAULT_BOY_CHARACTER } from './characterPresets';

export class GameEngine {
  public player: Player;
  public character: CharacterConfig = DEFAULT_BOY_CHARACTER;
  public obstacles: Obstacle[] = [];
  public powerups: Powerup[] = [];
  public particles: Particle[] = [];
  public playerRocks: PlayerRock[] = [];
  public bossRocks: BossRock[] = [];
  public boss: Boss | null = null;
  public currentLevel: LevelConfig;
  public gameState: GameState = 'MENU';
  
  public timeRemaining: number = 45;
  public timeSpent: number = 0;
  public worldOffset: number = 0;
  public obstaclesDodged: number = 0;
  public powerupsCollected: number = 0;
  public topSpeed: number = 0;
  public score: number = 0;
  public rockThrowCooldown: number = 0;
  public bossDefeatedCount: number = 0;

  // Infinite Mode State
  public difficultyTier: number = 1;
  public tierAnnounceTimer: number = 0;
  public tierAnnounceText: string = '';

  private lastSpawnDistance: number = 0;
  private lastPowerupDistance: number = 0;
  private lastBossMilestone: number = 0;
  private bossSpawnedThisRun: boolean = false;
  public screenShake: number = 0;
  private isWarningPlayed: boolean = false;

  // Key states
  public keys: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
    jump: boolean;
  } = {
    up: false,
    down: false,
    left: false,
    right: false,
    jump: false,
  };

  private onStateChangeCallback?: (state: GameState, stats?: RunStats) => void;

  constructor(
    level: LevelConfig,
    character?: CharacterConfig,
    onStateChange?: (state: GameState, stats?: RunStats) => void
  ) {
    this.currentLevel = level;
    if (character) {
      this.character = character;
    }
    this.onStateChangeCallback = onStateChange;
    this.player = this.createInitialPlayer();
    this.resetLevel(level);
  }

  public setCharacter(character: CharacterConfig) {
    this.character = character;
    this.player.character = character;
  }

  public setOnStateChange(cb: (state: GameState, stats?: RunStats) => void) {
    this.onStateChangeCallback = cb;
  }

  private createInitialPlayer(): Player {
    return {
      x: 120,
      y: 0,
      vy: 0,
      width: 40,
      height: 52,
      isGrounded: true,
      isJumping: false,
      isSliding: false,
      slideTimer: 0,
      speed: 10,
      baseSpeed: 10,
      maxSpeed: 20,
      acceleration: 0.1,
      lives: 3,
      maxLives: 3,
      invincibleTimer: 0,
      boostTimer: 0,
      goldenTimer: 0,
      distanceTraveled: 0,
      animationFrame: 0,
      runCycle: 0,
      state: 'running',
      character: this.character,
    };
  }

  public resetLevel(level: LevelConfig) {
    this.currentLevel = level;
    this.timeRemaining = level.isInfinite ? 0 : level.timeLimitSeconds;
    this.timeSpent = 0;
    this.worldOffset = 0;
    this.obstaclesDodged = 0;
    this.powerupsCollected = 0;
    this.topSpeed = 0;
    this.score = 0;
    this.rockThrowCooldown = 0;
    this.bossDefeatedCount = 0;
    this.lastSpawnDistance = 30; // initial grace run
    this.lastPowerupDistance = 80;
    this.lastBossMilestone = 0;
    this.bossSpawnedThisRun = false;
    this.obstacles = [];
    this.powerups = [];
    this.particles = [];
    this.playerRocks = [];
    this.bossRocks = [];
    this.boss = null;
    this.screenShake = 0;
    this.isWarningPlayed = false;
    this.difficultyTier = 1;
    this.tierAnnounceTimer = 0;
    this.tierAnnounceText = '';

    this.player = {
      ...this.createInitialPlayer(),
      baseSpeed: 11 * level.speedMultiplier,
      maxSpeed: 22 * level.speedMultiplier,
      speed: 11 * level.speedMultiplier,
    };
  }

  public startGame(level?: LevelConfig) {
    if (level) {
      this.resetLevel(level);
    }
    this.gameState = 'PLAYING';
    soundManager.startMusic();
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback('PLAYING');
    }
  }

  public pauseGame() {
    if (this.gameState === 'PLAYING') {
      this.gameState = 'PAUSED';
      soundManager.stopMusic();
      if (this.onStateChangeCallback) {
        this.onStateChangeCallback('PAUSED');
      }
    }
  }

  public resumeGame() {
    if (this.gameState === 'PAUSED') {
      this.gameState = 'PLAYING';
      soundManager.startMusic();
      if (this.onStateChangeCallback) {
        this.onStateChangeCallback('PLAYING');
      }
    }
  }

  public handleJump() {
    if (this.gameState !== 'PLAYING') return;
    if (this.player.isGrounded && !this.player.isSliding) {
      this.player.isGrounded = false;
      this.player.isJumping = true;
      this.player.vy = 14.5;
      this.player.state = 'jumping';
      soundManager.playJump();
      this.spawnJumpDust();
    }
  }

  public handleSlide() {
    if (this.gameState !== 'PLAYING') return;
    if (this.player.isGrounded && !this.player.isSliding) {
      this.player.isSliding = true;
      this.player.slideTimer = 0.55; // 0.55 seconds slide
      this.player.height = 22; // Low profile hitbox
      this.player.state = 'sliding';
      soundManager.playSlide();
      this.spawnSlideDust();
    }
  }

  public throwRock() {
    if (this.gameState !== 'PLAYING') return;
    if (this.rockThrowCooldown > 0) return;

    this.rockThrowCooldown = 0.22; // rapid throw responsive cooldown

    const playerThrowX = this.player.x + (this.player.isSliding ? 42 : 26);
    const playerThrowY = this.player.y + (this.player.isSliding ? 14 : 26);

    const rock: PlayerRock = {
      id: Math.random().toString(),
      x: playerThrowX,
      y: playerThrowY,
      vx: 560 + this.player.speed * 8,
      vy: this.player.isJumping ? 45 : 18,
      size: 14,
      rotation: Math.random() * Math.PI,
      rotationSpeed: 0.35,
      life: 2.2,
      maxLife: 2.2,
    };

    this.playerRocks.push(rock);
    soundManager.playThrowRock();
    this.spawnThrowParticles(playerThrowX, playerThrowY);
  }

  public update(dt: number) {
    if (this.gameState !== 'PLAYING') return;

    // Cap dt for smooth physics
    const delta = Math.min(dt, 0.05);
    this.timeSpent += delta;

    // Screen Shake decay
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - delta * 18);
    }

    // Rock Throw Cooldown decay
    if (this.rockThrowCooldown > 0) {
      this.rockThrowCooldown = Math.max(0, this.rockThrowCooldown - delta);
    }

    if (this.currentLevel.isInfinite) {
      // Infinite Mode: Difficulty increases over time
      const calculatedTier = 1 + Math.floor(this.timeSpent / 22);
      if (calculatedTier > this.difficultyTier) {
        this.difficultyTier = calculatedTier;
        this.tierAnnounceTimer = 2.4;
        this.tierAnnounceText = `⚡ TIER ${calculatedTier}: DIFFICULTY SURGE (+${(calculatedTier - 1) * 8}% SPEED)!`;
        soundManager.playBoost();
        this.spawnTierUpParticles();
      }

      if (this.tierAnnounceTimer > 0) {
        this.tierAnnounceTimer = Math.max(0, this.tierAnnounceTimer - delta);
      }

      // Base speed scales smoothly with difficulty tier
      const tierSpeedBonus = (this.difficultyTier - 1) * 0.08;
      this.player.baseSpeed = 11 * this.currentLevel.speedMultiplier * (1 + tierSpeedBonus);
      this.player.maxSpeed = 22 * this.currentLevel.speedMultiplier * (1 + tierSpeedBonus);
    } else {
      // Standard Stage Mode: Count down time limit
      this.timeRemaining = Math.max(0, this.timeRemaining - delta);

      // Timer countdown audio warning
      if (this.timeRemaining <= 5 && !this.isWarningPlayed) {
        soundManager.playTimerWarning();
        if (Math.floor(this.timeRemaining) !== Math.floor(this.timeRemaining + delta)) {
          soundManager.playTimerWarning();
        }
      }

      // Check Time Expired Game Over
      if (this.timeRemaining <= 0) {
        this.triggerGameOver('Time ran out before reaching the Safe Zone!');
        return;
      }
    }

    // Update Timers
    if (this.player.invincibleTimer > 0) {
      this.player.invincibleTimer = Math.max(0, this.player.invincibleTimer - delta);
    }
    if (this.player.boostTimer > 0) {
      this.player.boostTimer = Math.max(0, this.player.boostTimer - delta);
    }
    if (this.player.goldenTimer > 0) {
      this.player.goldenTimer = Math.max(0, this.player.goldenTimer - delta);
    }

    // Update Player Speed
    let targetSpeed = this.player.baseSpeed;
    if (this.keys.right) {
      targetSpeed = this.player.maxSpeed; // Sprint!
    } else if (this.keys.left) {
      targetSpeed = this.player.baseSpeed * 0.7; // Brake
    }

    if (this.player.boostTimer > 0) {
      targetSpeed *= 1.35;
    }
    if (this.player.goldenTimer > 0) {
      targetSpeed *= 1.25;
    }

    // Smooth speed acceleration
    this.player.speed += (targetSpeed - this.player.speed) * 0.1;

    // Track Top Speed (km/h)
    const currentSpeedKmH = Math.round(this.player.speed * 2.8);
    if (currentSpeedKmH > this.topSpeed) {
      this.topSpeed = currentSpeedKmH;
    }

    // Update Distance
    const forwardStep = this.player.speed * delta * 12;
    this.player.distanceTraveled += forwardStep * 0.1;
    this.worldOffset += forwardStep * 3.5;
    this.score += Math.round(forwardStep * 1.5);

    // Update Run Cycle Animation
    if (this.player.isGrounded && !this.player.isSliding) {
      this.player.runCycle = (this.player.runCycle + this.player.speed * delta * 1.2) % (Math.PI * 2);
    }

    // Update Jump Physics
    if (!this.player.isGrounded) {
      this.player.y += this.player.vy;
      this.player.vy -= 0.85; // Gravity

      if (this.player.y <= 0) {
        this.player.y = 0;
        this.player.vy = 0;
        this.player.isGrounded = true;
        this.player.isJumping = false;
        this.player.state = this.player.isSliding ? 'sliding' : 'running';
        this.spawnJumpDust();
      }
    }

    // Update Slide
    if (this.player.isSliding) {
      this.player.slideTimer -= delta;
      if (this.player.slideTimer <= 0) {
        this.player.isSliding = false;
        this.player.height = 52; // Restore height hitbox
        this.player.state = 'running';
      }
    }

    // Continuous Arrow Key Actions
    if (this.keys.up || this.keys.jump) {
      this.handleJump();
    }
    if (this.keys.down) {
      this.handleSlide();
    }

    // Spawn Obstacles, Powerups & Bosses
    this.manageSpawns(delta);

    // Update Boss & Boss Attacks
    this.updateBoss(delta);

    // Update Projectiles
    this.updatePlayerRocks(delta);
    this.updateBossRocks(delta);

    // Update Obstacles
    this.updateObstacles(delta);

    // Update Powerups
    this.updatePowerups(delta);

    // Update Particles
    this.updateParticles(delta);

    // Check Safe Zone Victory Condition (Stage Mode only: Boss must be defeated or past distance)
    if (!this.currentLevel.isInfinite && this.player.distanceTraveled >= this.currentLevel.distanceToSafeZone) {
      this.triggerVictory();
    }
  }

  private manageSpawns(delta: number) {
    if (!this.currentLevel.isInfinite) {
      const distanceRemaining = this.currentLevel.distanceToSafeZone - this.player.distanceTraveled;
      // Don't spawn inside the safe zone (last 60m)
      if (distanceRemaining < 60) return;
    }

    // Check Boss Spawning Condition
    if (!this.boss) {
      if (!this.currentLevel.isInfinite) {
        // Stage Boss appears around 48% through the course
        if (!this.bossSpawnedThisRun && this.player.distanceTraveled >= this.currentLevel.distanceToSafeZone * 0.48) {
          this.spawnBoss();
          this.bossSpawnedThisRun = true;
        }
      } else {
        // Infinite Mode: Boss emerges every ~380m
        if (this.player.distanceTraveled - this.lastBossMilestone >= 380) {
          this.spawnBoss();
          this.lastBossMilestone = this.player.distanceTraveled;
        }
      }
    }

    // If boss is actively fighting, reduce background obstacle clutter so player can focus on dodging boss boulders & throwing rocks
    const isBossActive = !!this.boss && this.boss.state !== 'defeated';

    // Obstacle Spawn Interval with escalating frequency
    const freqMultiplier = this.currentLevel.isInfinite
      ? 1 + Math.min(2.0, (this.difficultyTier - 1) * 0.15)
      : 1;

    const baseInterval = (isBossActive ? 280 : 140) / (this.currentLevel.obstacleFrequency * freqMultiplier);
    const spawnDistanceInterval = baseInterval * (0.8 + Math.random() * 0.4);

    if (this.player.distanceTraveled - this.lastSpawnDistance > spawnDistanceInterval) {
      this.spawnObstacle();
      this.lastSpawnDistance = this.player.distanceTraveled;
    }

    // Powerup Spawn Interval (every ~180-250m)
    if (this.player.distanceTraveled - this.lastPowerupDistance > 200 + Math.random() * 80) {
      this.spawnPowerup();
      this.lastPowerupDistance = this.player.distanceTraveled;
    }
  }

  private spawnBoss() {
    const levelId = this.currentLevel.id;
    let name = 'Batu the River Titan';
    let title = 'Ancient Boulder Guardian';
    let maxHealth = 8;
    let theme: LevelConfig['theme'] = this.currentLevel.theme;

    if (this.currentLevel.isInfinite) {
      const tier = this.difficultyTier;
      name = `Titan Goliath [Tier ${tier}]`;
      title = 'Colossal Rock Emperor';
      maxHealth = 8 + tier * 3;
    } else if (levelId === 2) {
      name = 'Kahoy the Forest Behemoth';
      title = 'Lord of Bamboo Rapids';
      maxHealth = 12;
    } else if (levelId === 3) {
      name = 'Apo the Magma Colossus';
      title = 'Titan of Volcanic Foothills';
      maxHealth = 16;
    } else if (levelId === 4) {
      name = 'Mayon the Supreme Boulder King';
      title = 'Overlord of The Legend Ridge';
      maxHealth = 22;
    }

    this.boss = {
      id: Math.random().toString(),
      name,
      title,
      theme,
      x: 880,
      y: 0,
      targetX: 620,
      width: 95,
      height: 115,
      health: maxHealth,
      maxHealth,
      state: 'entering',
      hurtTimer: 0,
      attackTimer: 1.5,
      attackCooldown: Math.max(1.4, 2.4 - (this.difficultyTier - 1) * 0.1),
      attackPattern: 0,
      windupTimer: 0,
      introBannerTimer: 3.2,
      floatOffset: 0,
      defeatTimer: 0,
    };

    this.screenShake = 14;
    soundManager.playBossRoar();
  }

  private updateBoss(delta: number) {
    if (!this.boss) return;
    const boss = this.boss;

    if (boss.introBannerTimer > 0) {
      boss.introBannerTimer = Math.max(0, boss.introBannerTimer - delta);
    }

    if (boss.state === 'entering') {
      boss.x += (boss.targetX - boss.x) * 3.5 * delta;
      if (Math.abs(boss.x - boss.targetX) < 12) {
        boss.x = boss.targetX;
        boss.state = 'fighting';
      }
      return;
    }

    if (boss.state === 'defeated') {
      boss.defeatTimer -= delta;
      boss.y -= 25 * delta; // Sinking into ground crumbling
      if (Math.random() < 0.4) {
        this.spawnShatterParticles(boss.x + Math.random() * boss.width, boss.y + Math.random() * boss.height);
      }
      if (boss.defeatTimer <= 0) {
        this.boss = null;
      }
      return;
    }

    if (boss.state === 'hurt') {
      boss.hurtTimer -= delta;
      boss.x = boss.targetX + (Math.random() * 8 - 4);
      if (boss.hurtTimer <= 0) {
        boss.state = 'fighting';
        boss.x = boss.targetX;
      }
      return;
    }

    // Fighting / Throwing State
    boss.floatOffset += delta * 2.5;
    boss.x = boss.targetX + Math.sin(boss.floatOffset) * 12;

    boss.attackTimer -= delta;
    if (boss.attackTimer <= 0.6 && boss.state !== 'throwing') {
      boss.state = 'throwing';
      boss.windupTimer = 0.6;
    }

    if (boss.attackTimer <= 0) {
      this.bossThrowRock();
      boss.state = 'fighting';
      boss.attackPattern = (boss.attackPattern + 1) % 3;
      boss.attackTimer = boss.attackCooldown * (0.85 + Math.random() * 0.35);
    }
  }

  private bossThrowRock() {
    if (!this.boss) return;
    const bx = this.boss.x + 10;
    const by = this.boss.y + 60;

    const pattern = this.boss.attackPattern;
    const speedBoostFactor = this.currentLevel.isInfinite
      ? 1 + Math.min(0.6, (this.difficultyTier - 1) * 0.08)
      : 1 + (this.currentLevel.id - 1) * 0.08;

    if (pattern === 0) {
      // Pattern 0: Low rolling heavy boulder
      this.bossRocks.push({
        id: Math.random().toString(),
        x: bx,
        y: 0,
        vx: -(320 + Math.random() * 40) * speedBoostFactor,
        vy: 0,
        size: 38,
        rotation: 0,
        rotationSpeed: -0.2,
        type: 'BOULDER',
      });
      soundManager.playThrowRock();
    } else if (pattern === 1) {
      // Pattern 1: High Bouncing Magma Rock (Jump or Clash in mid-air!)
      this.bossRocks.push({
        id: Math.random().toString(),
        x: bx,
        y: 0,
        vx: -(290 + Math.random() * 50) * speedBoostFactor,
        vy: 0,
        size: 34,
        rotation: 0,
        rotationSpeed: -0.25,
        type: 'MAGMA_ROCK',
        bounces: true,
        bounceHeight: 92,
        bounceSpeed: 3.6,
        bounceOffset: 0,
      });
      soundManager.playThrowRock();
    } else {
      // Pattern 2: Dual Barrage (High arch + Ground roller or Spiked Timber)
      this.bossRocks.push({
        id: Math.random().toString(),
        x: bx,
        y: 0,
        vx: -(340 + Math.random() * 50) * speedBoostFactor,
        vy: 0,
        size: 36,
        rotation: 0,
        rotationSpeed: -0.2,
        type: 'BOULDER',
      });

      if (this.currentLevel.id >= 2 || this.difficultyTier >= 2) {
        setTimeout(() => {
          if (this.boss && this.boss.state !== 'defeated') {
            this.bossRocks.push({
              id: Math.random().toString(),
              x: this.boss.x + 10,
              y: 20,
              vx: -(310 + Math.random() * 40) * speedBoostFactor,
              vy: 0,
              size: 32,
              rotation: 0,
              rotationSpeed: -0.2,
              type: 'MAGMA_ROCK',
              bounces: true,
              bounceHeight: 80,
              bounceSpeed: 4.0,
              bounceOffset: 0.5,
            });
            soundManager.playThrowRock();
          }
        }, 280);
      }
      soundManager.playThrowRock();
    }

    this.spawnThrowParticles(bx, by);
  }

  private updatePlayerRocks(delta: number) {
    for (let i = this.playerRocks.length - 1; i >= 0; i--) {
      const rock = this.playerRocks[i];
      rock.x += rock.vx * delta;
      rock.y += rock.vy * delta;
      rock.vy -= 140 * delta; // Gravity arc
      if (rock.y < 0) rock.y = 0;
      rock.rotation += rock.rotationSpeed;
      rock.life -= delta;

      // Particle sparks behind thrown rock
      if (Math.random() < 0.45) {
        this.particles.push({
          x: rock.x,
          y: 360 - rock.y - rock.size / 2,
          vx: -(Math.random() * 2 + 1),
          vy: Math.random() * 2 - 1,
          size: 3,
          color: '#FBBF24',
          alpha: 0.8,
          life: 0,
          maxLife: 0.25,
          shape: 'sparkle',
        });
      }

      // Check collision with Obstacles (Shatter them!)
      let collided = false;
      for (let j = this.obstacles.length - 1; j >= 0; j--) {
        const obs = this.obstacles[j];
        if (this.checkRockObstacleCollision(rock, obs)) {
          soundManager.playRockShatter();
          this.spawnShatterParticles(obs.x + obs.width / 2, obs.y + obs.height / 2);
          this.obstacles.splice(j, 1);
          this.score += 150;
          this.obstaclesDodged++;
          collided = true;
          break;
        }
      }

      // Check collision with Boss Rocks (Mid-air clash defense!)
      if (!collided) {
        for (let k = this.bossRocks.length - 1; k >= 0; k--) {
          const br = this.bossRocks[k];
          const dist = Math.hypot(rock.x - (br.x + br.size / 2), rock.y - (br.y + br.size / 2));
          if (dist < (rock.size + br.size) * 0.6) {
            soundManager.playRockShatter();
            this.spawnShatterParticles(br.x + br.size / 2, br.y + br.size / 2);
            this.bossRocks.splice(k, 1);
            this.score += 250;
            collided = true;
            break;
          }
        }
      }

      // Check collision with Boss!
      if (!collided && this.boss && this.boss.state !== 'defeated') {
        const boss = this.boss;
        const bLeft = boss.x + 10;
        const bRight = boss.x + boss.width - 10;
        const bBottom = boss.y;
        const bTop = boss.y + boss.height;

        if (rock.x > bLeft && rock.x < bRight && rock.y >= bBottom && rock.y <= bTop) {
          // Boss Takes Hit!
          boss.health = Math.max(0, boss.health - 1);
          boss.state = 'hurt';
          boss.hurtTimer = 0.32;
          this.screenShake = 7;
          soundManager.playBossHurt();
          this.spawnShatterParticles(rock.x, rock.y);
          this.score += 300;
          collided = true;

          // Check Boss Defeat!
          if (boss.health <= 0) {
            this.defeatBoss(boss);
          }
        }
      }

      if (collided || rock.life <= 0 || rock.x > 850) {
        this.playerRocks.splice(i, 1);
      }
    }
  }

  private defeatBoss(boss: Boss) {
    boss.state = 'defeated';
    boss.defeatTimer = 2.5;
    this.bossDefeatedCount++;
    this.score += 3500;
    this.screenShake = 16;
    soundManager.playBossDefeated();

    // Giant explosion of fireworks & particles
    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 9 + 4;
      this.particles.push({
        x: boss.x + boss.width / 2,
        y: 360 - boss.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 5 + Math.random() * 6,
        color: ['#F59E0B', '#10B981', '#EF4444', '#3B82F6', '#FBBF24'][i % 5],
        alpha: 1,
        life: 0,
        maxLife: 1.0,
        shape: 'sparkle',
      });
    }

    // Drop Rewards (Mango & Herbal Tonic!)
    this.powerups.push({
      id: Math.random().toString(),
      type: 'PROVINCE_MANGO',
      x: boss.x - 40,
      y: 20,
      width: 28,
      height: 28,
      collected: false,
      floatOffset: 0,
    });

    this.powerups.push({
      id: Math.random().toString(),
      type: 'HERBAL_TONIC',
      x: boss.x + 20,
      y: 25,
      width: 28,
      height: 28,
      collected: false,
      floatOffset: 1.5,
    });
  }

  private updateBossRocks(delta: number) {
    const playerBox = {
      x: this.player.x,
      y: this.player.y,
      width: this.player.width,
      height: this.player.height,
    };

    for (let i = this.bossRocks.length - 1; i >= 0; i--) {
      const br = this.bossRocks[i];
      br.x += (br.vx - this.player.speed * 18) * delta;
      br.rotation += br.rotationSpeed;

      if (br.bounces && br.bounceHeight && br.bounceSpeed) {
        br.bounceOffset = (br.bounceOffset || 0) + delta * br.bounceSpeed;
        br.y = Math.abs(Math.sin(br.bounceOffset)) * br.bounceHeight;
      }

      // Check Collision with Player
      const rockBox = {
        x: br.x,
        y: br.y,
        width: br.size,
        height: br.size,
      };

      if (this.checkCollision(playerBox, rockBox as unknown as Obstacle)) {
        if (this.player.goldenTimer > 0) {
          soundManager.playRockShatter();
          this.spawnShatterParticles(br.x + br.size / 2, br.y + br.size / 2);
          this.bossRocks.splice(i, 1);
          this.score += 200;
          continue;
        }

        if (this.player.invincibleTimer <= 0) {
          this.player.lives = Math.max(0, this.player.lives - 1);
          this.player.invincibleTimer = 1.8;
          this.screenShake = 10;
          soundManager.playHit();
          this.spawnHitParticles();
          this.bossRocks.splice(i, 1);

          if (this.player.lives <= 0) {
            this.triggerGameOver('Struck down by the Boss boulder attack! All lives lost.');
            return;
          }
          continue;
        }
      }

      if (br.x < -150) {
        this.bossRocks.splice(i, 1);
      }
    }
  }

  private checkRockObstacleCollision(rock: PlayerRock, obs: Obstacle): boolean {
    const oLeft = obs.x;
    const oRight = obs.x + obs.width;
    const oBottom = obs.y;
    const oTop = obs.y + obs.height;

    return (
      rock.x + rock.size / 2 > oLeft &&
      rock.x - rock.size / 2 < oRight &&
      rock.y + rock.size / 2 > oBottom &&
      rock.y - rock.size / 2 < oTop
    );
  }

  private spawnThrowParticles(x: number, y: number) {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x,
        y: 360 - y,
        vx: Math.random() * 3 + 1,
        vy: Math.random() * 2 - 1,
        size: 3 + Math.random() * 2,
        color: '#FBBF24',
        alpha: 0.9,
        life: 0,
        maxLife: 0.25,
        shape: 'sparkle',
      });
    }
  }

  private spawnObstacle() {
    const types = this.currentLevel.obstacleTypes;
    const type = types[Math.floor(Math.random() * types.length)];
    const screenWidth = 850;
    const speedBoostFactor = this.currentLevel.isInfinite
      ? 1 + Math.min(1.0, (this.difficultyTier - 1) * 0.08)
      : 1;

    let obs: Obstacle;
    switch (type) {
      case 'BOUNCING_BOULDER':
        obs = {
          id: Math.random().toString(),
          type,
          x: screenWidth + Math.random() * 100,
          y: 0,
          width: 38,
          height: 38,
          speedX: -(180 + Math.random() * 60) * speedBoostFactor,
          speedY: 0,
          rotation: 0,
          rotationSpeed: -0.1,
          bounces: true,
          bounceHeight: 85 + Math.min(30, (this.difficultyTier - 1) * 5),
          bounceSpeed: 3.5 + Math.min(1.5, (this.difficultyTier - 1) * 0.2),
          bounceOffset: Math.random() * Math.PI,
        };
        break;
      case 'SWINGING_BRANCH':
        // Suspended high log - forces player to SLIDE
        obs = {
          id: Math.random().toString(),
          type,
          x: screenWidth + Math.random() * 80,
          y: 34, // floating above ground
          width: 70,
          height: 32,
          speedX: -(140 + Math.random() * 40) * speedBoostFactor,
          speedY: 0,
          rotation: 0,
          rotationSpeed: 0,
        };
        break;
      case 'ROLLING_LOG':
        obs = {
          id: Math.random().toString(),
          type,
          x: screenWidth + Math.random() * 60,
          y: 0,
          width: 34,
          height: 34,
          speedX: -(210 + Math.random() * 70) * speedBoostFactor,
          speedY: 0,
          rotation: 0,
          rotationSpeed: -0.15,
        };
        break;
      case 'TREE_TRUNK':
        obs = {
          id: Math.random().toString(),
          type,
          x: screenWidth + Math.random() * 80,
          y: 0,
          width: 48,
          height: 28,
          speedX: -(130 + Math.random() * 30) * speedBoostFactor,
          speedY: 0,
          rotation: 0,
          rotationSpeed: 0,
        };
        break;
      case 'MUD_PIT':
        obs = {
          id: Math.random().toString(),
          type,
          x: screenWidth + Math.random() * 90,
          y: 0,
          width: 65,
          height: 12,
          speedX: -(120 + Math.random() * 20) * speedBoostFactor,
          speedY: 0,
          rotation: 0,
          rotationSpeed: 0,
        };
        break;
      case 'ROLLING_ROCK':
      default:
        obs = {
          id: Math.random().toString(),
          type: 'ROLLING_ROCK',
          x: screenWidth + Math.random() * 80,
          y: 0,
          width: 32,
          height: 32,
          speedX: -(190 + Math.random() * 60) * speedBoostFactor,
          speedY: 0,
          rotation: 0,
          rotationSpeed: -0.12,
        };
        break;
    }

    this.obstacles.push(obs);
  }

  private spawnPowerup() {
    const types: Powerup['type'][] = ['PROVINCE_MANGO', 'PROVINCE_MANGO', 'HERBAL_TONIC', 'GOLDEN_SNEAKERS'];
    const type = types[Math.floor(Math.random() * types.length)];
    const screenWidth = 850;

    const pu: Powerup = {
      id: Math.random().toString(),
      type,
      x: screenWidth + Math.random() * 50,
      y: 20 + Math.random() * 45, // floating at jumping height
      width: 28,
      height: 28,
      collected: false,
      floatOffset: Math.random() * Math.PI * 2,
    };

    this.powerups.push(pu);
  }

  private updateObstacles(delta: number) {
    const playerBox = {
      x: this.player.x,
      y: this.player.y,
      width: this.player.width,
      height: this.player.height,
    };

    for (let i = this.obstacles.length - 1; i >= 0; i--) {
      const obs = this.obstacles[i];
      // World movement + forward player speed relative motion
      obs.x += (obs.speedX - this.player.speed * 20) * delta;
      obs.rotation += obs.rotationSpeed;

      if (obs.bounces && obs.bounceHeight && obs.bounceSpeed) {
        obs.bounceOffset = (obs.bounceOffset || 0) + delta * obs.bounceSpeed;
        obs.y = Math.abs(Math.sin(obs.bounceOffset)) * obs.bounceHeight;
      }

      // Check Dodge cleared count
      if (!obs.cleared && obs.x + obs.width < this.player.x) {
        obs.cleared = true;
        this.obstaclesDodged++;
        this.score += 50;
      }

      // Check Collision with player
      if (this.checkCollision(playerBox, obs)) {
        this.handleObstacleHit(obs, i);
      }

      // Remove offscreen
      if (obs.x < -150) {
        this.obstacles.splice(i, 1);
      }
    }
  }

  private updatePowerups(delta: number) {
    const playerBox = {
      x: this.player.x,
      y: this.player.y,
      width: this.player.width,
      height: this.player.height,
    };

    for (let i = this.powerups.length - 1; i >= 0; i--) {
      const pu = this.powerups[i];
      pu.x -= this.player.speed * 20 * delta;

      if (!pu.collected && this.checkPowerupCollision(playerBox, pu)) {
        this.collectPowerup(pu);
        this.powerups.splice(i, 1);
        continue;
      }

      if (pu.x < -100) {
        this.powerups.splice(i, 1);
      }
    }
  }

  private checkCollision(p: { x: number; y: number; width: number; height: number }, o: Obstacle): boolean {
    // Generous player hitbox padding for fair, responsive arcade gameplay
    const paddingX = 8;
    const paddingY = 6;

    const pLeft = p.x + paddingX;
    const pRight = p.x + p.width - paddingX;
    const pBottom = p.y;
    const pTop = p.y + p.height - paddingY;

    const oLeft = o.x + 4;
    const oRight = o.x + o.width - 4;
    const oBottom = o.y;
    const oTop = o.y + o.height - 4;

    return (
      pLeft < oRight &&
      pRight > oLeft &&
      pBottom < oTop &&
      pTop > oBottom
    );
  }

  private checkPowerupCollision(p: { x: number; y: number; width: number; height: number }, pu: Powerup): boolean {
    return (
      p.x < pu.x + pu.width + 12 &&
      p.x + p.width > pu.x - 12 &&
      p.y < pu.y + pu.height + 15 &&
      p.y + p.height > pu.y - 15
    );
  }

  private handleObstacleHit(obs: Obstacle, index: number) {
    // If player is Golden Invincible, shatter the obstacle!
    if (this.player.goldenTimer > 0) {
      soundManager.playHit();
      this.spawnShatterParticles(obs.x + obs.width / 2, obs.y + obs.height / 2);
      this.obstacles.splice(index, 1);
      this.score += 150;
      return;
    }

    // If currently invincible (after recent hit), ignore
    if (this.player.invincibleTimer > 0) {
      return;
    }

    // Lose 1 Life!
    this.player.lives = Math.max(0, this.player.lives - 1);
    this.player.invincibleTimer = 1.8; // 1.8s invulnerability
    this.screenShake = 8;
    soundManager.playHit();
    this.spawnHitParticles();

    // Eliminate obstacle that caused hit
    this.obstacles.splice(index, 1);

    // Check Elimination
    if (this.player.lives <= 0) {
      this.triggerGameOver('Alexander was struck by moving obstacles! All lives lost.');
    }
  }

  private collectPowerup(pu: Powerup) {
    pu.collected = true;
    this.powerupsCollected++;
    this.score += 250;
    soundManager.playCollect();
    this.spawnSparkles(pu.x, pu.y);

    switch (pu.type) {
      case 'PROVINCE_MANGO':
        this.player.boostTimer = 4.5;
        soundManager.playBoost();
        break;
      case 'HERBAL_TONIC':
        if (this.player.lives < this.player.maxLives) {
          this.player.lives++;
        }
        break;
      case 'GOLDEN_SNEAKERS':
        this.player.goldenTimer = 6.0;
        soundManager.playBoost();
        break;
    }
  }

  private triggerGameOver(reason: string) {
    this.gameState = 'GAMEOVER';
    soundManager.stopMusic();
    soundManager.playGameOver();

    const stats = this.getRunStats('RUNNER');
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback('GAMEOVER', stats);
    }
  }

  private triggerVictory() {
    this.gameState = 'VICTORY';
    soundManager.stopMusic();
    soundManager.playVictory();

    let rank: RunStats['rank'] = 'PROVINCE_HERO';
    if (this.currentLevel.isInfinite) {
      const dist = this.player.distanceTraveled;
      if (dist >= 2500) rank = 'LEGENDARY';
      else if (dist >= 1400) rank = 'SPEEDSTER';
      else if (dist >= 600) rank = 'PROVINCE_HERO';
      else rank = 'RUNNER';
    } else {
      if (this.player.lives === 3 && this.timeRemaining > this.currentLevel.timeLimitSeconds * 0.4) {
        rank = 'LEGENDARY';
      } else if (this.player.lives >= 2) {
        rank = 'SPEEDSTER';
      }
    }

    const stats = this.getRunStats(rank);
    if (this.onStateChangeCallback) {
      this.onStateChangeCallback('VICTORY', stats);
    }
  }

  public getRunStats(rank: 'LEGENDARY' | 'SPEEDSTER' | 'PROVINCE_HERO' | 'RUNNER'): RunStats {
    let finalRank = rank;
    if (this.currentLevel.isInfinite) {
      const dist = this.player.distanceTraveled;
      if (dist >= 2500) finalRank = 'LEGENDARY';
      else if (dist >= 1400) finalRank = 'SPEEDSTER';
      else if (dist >= 600) finalRank = 'PROVINCE_HERO';
      else finalRank = 'RUNNER';
    }

    return {
      levelId: this.currentLevel.id,
      timeRemaining: Math.round(this.timeRemaining * 10) / 10,
      timeSpent: Math.round(this.timeSpent * 10) / 10,
      distance: Math.round(this.player.distanceTraveled),
      obstaclesDodged: this.obstaclesDodged,
      powerupsCollected: this.powerupsCollected,
      topSpeedKmH: this.topSpeed,
      livesLeft: this.player.lives,
      score: this.score,
      rank: finalRank,
      characterName: this.character.name,
      gender: this.character.gender,
      isInfinite: this.currentLevel.isInfinite,
      difficultyTier: this.difficultyTier,
    };
  }

  private spawnTierUpParticles() {
    for (let i = 0; i < 28; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      this.particles.push({
        x: this.player.x + 20,
        y: 360 - this.player.y - 25,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2,
        size: 5 + Math.random() * 4,
        color: i % 3 === 0 ? '#34D399' : i % 3 === 1 ? '#FBBF24' : '#60A5FA',
        alpha: 1,
        life: 0,
        maxLife: 0.8,
        shape: 'sparkle',
      });
    }
  }

  private updateParticles(delta: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * delta * 60;
      p.y += p.vy * delta * 60;
      p.life += delta;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }
  }

  private spawnJumpDust() {
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: this.player.x + 10 + Math.random() * 20,
        y: 360 - 5,
        vx: -(Math.random() * 2 + 1),
        vy: -(Math.random() * 1.5),
        size: 3 + Math.random() * 3,
        color: '#BCAAA4',
        alpha: 0.8,
        life: 0,
        maxLife: 0.35,
      });
    }
  }

  private spawnSlideDust() {
    for (let i = 0; i < 8; i++) {
      this.particles.push({
        x: this.player.x + Math.random() * 40,
        y: 360 - 2,
        vx: -(Math.random() * 3 + 2),
        vy: -(Math.random() * 1.2),
        size: 4 + Math.random() * 4,
        color: '#D7CCC8',
        alpha: 0.9,
        life: 0,
        maxLife: 0.45,
      });
    }
  }

  private spawnHitParticles() {
    for (let i = 0; i < 18; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 2;
      this.particles.push({
        x: this.player.x + 20,
        y: 360 - this.player.y - 25,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 4 + Math.random() * 4,
        color: i % 2 === 0 ? '#E53935' : '#FFD54F',
        alpha: 1,
        life: 0,
        maxLife: 0.5,
      });
    }
  }

  private spawnShatterParticles(x: number, y: number) {
    for (let i = 0; i < 16; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 3;
      this.particles.push({
        x,
        y: 360 - y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 5,
        color: '#8D6E63',
        alpha: 1,
        life: 0,
        maxLife: 0.6,
      });
    }
  }

  private spawnSparkles(x: number, y: number) {
    for (let i = 0; i < 10; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 3 + 1;
      this.particles.push({
        x: x + 14,
        y: 360 - y - 14,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 3,
        color: '#FFD700',
        alpha: 1,
        life: 0,
        maxLife: 0.4,
      });
    }
  }
}
