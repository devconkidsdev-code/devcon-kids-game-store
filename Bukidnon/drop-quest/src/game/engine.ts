import { Player, LevelConfig, WaterDrop, Particle, GameState, WeedEnemy, SunflowerEnemy, SeedProjectile, QuestionBlock, PowerUpItem, WaterBlast } from '../types';
import { sound } from './audio';

export interface InputState {
  left: boolean;
  right: boolean;
  jump: boolean;
  jumpJustPressed: boolean;
  shoot?: boolean;
  shootJustPressed?: boolean;
}

export class GameEngine {
  public player: Player;
  public drops: WaterDrop[] = [];
  public weeds: WeedEnemy[] = [];
  public sunflowers: SunflowerEnemy[] = [];
  public seedProjectiles: SeedProjectile[] = [];
  public questionBlocks: QuestionBlock[] = [];
  public powerUps: PowerUpItem[] = [];
  public waterBlasts: WaterBlast[] = [];
  public particles: Particle[] = [];
  public level: LevelConfig;
  public state: GameState;
  public comboCount: number = 0;
  public comboTimer: number = 0;

  // Physics constants
  private readonly GRAVITY = 1200; // px/s^2
  private readonly MAX_FALL_SPEED = 700;
  private readonly MOVE_ACCEL = 1800;
  private readonly MOVE_DECEL = 2000;
  private readonly MAX_SPEED = 280;
  private readonly JUMP_FORCE = -540;
  private readonly MIN_JUMP_FORCE = -220;

  constructor(level: LevelConfig, initialLives: number = 5, initialScore: number = 0) {
    this.level = level;
    this.player = this.createInitialPlayer();
    this.drops = level.drops.map((d, index) => ({
      ...d,
      collected: false,
      floatOffset: index * 0.4,
      sparkleTimer: Math.random() * 2,
    }));
    this.weeds = (level.weeds || []).map(w => ({
      ...w,
      isSquashed: false,
      squashTimer: 0,
      animTimer: Math.random() * 2,
    }));
    this.sunflowers = (level.sunflowers || []).map(sf => ({
      ...sf,
      isSquashed: false,
      squashTimer: 0,
      animTimer: Math.random() * 2,
      windupTimer: 0,
      aimAngle: 0,
      fireCooldown: 1.0 + Math.random() * 1.5,
    }));
    this.questionBlocks = (level.questionBlocks || []).map(qb => ({
      ...qb,
      hit: false,
      bumpOffset: 0,
      bumpVy: 0,
    }));
    this.seedProjectiles = [];
    this.powerUps = [];
    this.waterBlasts = [];

    this.state = {
      screen: 'PLAYING',
      currentLevelIndex: level.id - 1,
      lives: initialLives,
      maxLives: 5,
      timeLeft: level.timeLimit || 60.0,
      dropsCollected: 0,
      totalDropsInLevel: level.drops.length,
      progressPercent: 0,
      score: initialScore,
      soundEnabled: sound.isEnabled(),
      cameraX: 0,
      cameraY: 0,
      isPaused: false,
      highScore: 0,
      lossReason: null,
      hasWaterGun: false,
      waterAmmo: 0,
      maxWaterAmmo: 20,
    };
  }

  private createInitialPlayer(): Player {
    return {
      x: 60,
      y: this.level.groundY - 50,
      width: 32,
      height: 48,
      vx: 0,
      vy: 0,
      isGrounded: false,
      facing: 'right',
      animFrame: 0,
      animTimer: 0,
      invulnerableTimer: 0,
      isRespawning: false,
      respawnTimer: 0,
      lastSafeX: 60,
      lastSafeY: this.level.groundY - 50,
      coyoteTimer: 0,
      jumpBufferTimer: 0,
      hasWaterGun: false,
      waterAmmo: 0,
      maxWaterAmmo: 20,
      shootCooldown: 0,
      squashStretchX: 1,
      squashStretchY: 1,
      blinkTimer: 3.0,
      expressionTimer: 0,
      expression: 'normal',
    };
  }

  public resetLevel(level: LevelConfig, preserveLives: boolean = true) {
    this.level = level;
    const currentLives = preserveLives ? this.state.lives : 5;
    const currentScore = preserveLives ? this.state.score : 0;

    this.player = this.createInitialPlayer();
    this.drops = level.drops.map((d, index) => ({
      ...d,
      collected: false,
      floatOffset: index * 0.4,
      sparkleTimer: Math.random() * 2,
    }));
    this.weeds = (level.weeds || []).map(w => ({
      ...w,
      isSquashed: false,
      squashTimer: 0,
      animTimer: Math.random() * 2,
    }));
    this.sunflowers = (level.sunflowers || []).map(sf => ({
      ...sf,
      isSquashed: false,
      squashTimer: 0,
      animTimer: Math.random() * 2,
      windupTimer: 0,
      aimAngle: 0,
      fireCooldown: 1.0 + Math.random() * 1.5,
    }));
    this.questionBlocks = (level.questionBlocks || []).map(qb => ({
      ...qb,
      hit: false,
      bumpOffset: 0,
      bumpVy: 0,
    }));

    this.seedProjectiles = [];
    this.powerUps = [];
    this.waterBlasts = [];
    this.particles = [];
    this.comboCount = 0;
    this.comboTimer = 0;

    this.state = {
      ...this.state,
      screen: 'PLAYING',
      currentLevelIndex: level.id - 1,
      lives: currentLives,
      timeLeft: level.timeLimit || 60.0,
      dropsCollected: 0,
      totalDropsInLevel: level.drops.length,
      progressPercent: 0,
      score: currentScore,
      cameraX: 0,
      cameraY: 0,
      isPaused: false,
      lossReason: null,
      hasWaterGun: false,
      waterAmmo: 0,
      maxWaterAmmo: 20,
    };
  }

  public update(dt: number, input: InputState, viewportWidth: number): GameState {
    if (this.state.screen !== 'PLAYING' || this.state.isPaused) {
      return this.state;
    }

    // Clamp delta time to avoid large physics steps on lag spikes
    const stepDt = Math.min(dt, 0.05);

    // 1. Timer Countdown
    this.state.timeLeft -= stepDt;
    if (this.state.timeLeft <= 0) {
      this.state.timeLeft = 0;
      this.state.screen = 'GAME_OVER';
      this.state.lossReason = 'timeout';
      sound.playGameOver();
      return this.state;
    }

    // Combo timer
    if (this.comboTimer > 0) {
      this.comboTimer -= stepDt;
      if (this.comboTimer <= 0) {
        this.comboCount = 0;
      }
    }

    // 2. Update Moving Platforms
    this.updateMovingPlatforms(stepDt);

    // 3. Update Question Blocks (Bounce physics)
    this.updateQuestionBlocks(stepDt);

    // 4. Update PowerUp Items (Emerge, Float, Collection)
    this.updatePowerUps(stepDt);

    // 5. Update Water Gun Projectiles
    this.updateWaterBlasts(stepDt);

    // 6. Handle Player Firing
    if (input.shootJustPressed || input.shoot) {
      this.shootWaterGun();
    }

    // 7. Update Player Physics
    this.updatePlayer(stepDt, input);

    // 8. Update Angry Weeds (Patrol, Obstacle Bounce & Mario Stomp)
    this.updateWeeds(stepDt);

    // 9. Update Angry Sunflowers (Aiming, Windup, Seed Spitting & Stomp)
    this.updateSunflowers(stepDt);

    // 10. Update Seed Projectiles (Physics, Collision with Ground/Obstacles & Player Damage)
    this.updateSeedProjectiles(stepDt);

    // 11. Update Water Drops & Check Collection
    this.updateDrops(stepDt);

    // 12. Update Particles
    this.updateParticles(stepDt);

    // 13. Update Camera position (Smooth horizontal follow with clamping)
    const targetCameraX = this.player.x + this.player.width / 2 - viewportWidth / 2;
    const maxCameraX = Math.max(0, this.level.width - viewportWidth);
    this.state.cameraX += (Math.max(0, Math.min(maxCameraX, targetCameraX)) - this.state.cameraX) * 0.12;

    return this.state;
  }

  private updateMovingPlatforms(dt: number) {
    this.level.platforms.forEach(p => {
      if (p.type === 'moving' && p.moveRange) {
        p.x += p.moveRange.direction * p.moveRange.speed * dt;
        if (p.x >= p.moveRange.maxX) {
          p.x = p.moveRange.maxX;
          p.moveRange.direction = -1;
        } else if (p.x <= p.moveRange.minX) {
          p.x = p.moveRange.minX;
          p.moveRange.direction = 1;
        }
      }
    });
  }

  // Update Question Blocks (Bounce physics)
  private updateQuestionBlocks(dt: number) {
    this.questionBlocks.forEach(qb => {
      if (qb.bumpOffset < 0 || qb.bumpVy !== 0) {
        qb.bumpOffset += qb.bumpVy * dt;
        qb.bumpVy += 1400 * dt; // spring gravity back down
        if (qb.bumpOffset >= 0) {
          qb.bumpOffset = 0;
          qb.bumpVy = 0;
        }
      }
    });
  }

  // Update PowerUp Items (Emerge from question block, float, collect)
  private updatePowerUps(dt: number) {
    const p = this.player;

    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const pu = this.powerUps[i];
      pu.floatTimer += dt;

      if (pu.isEmerging) {
        pu.emergeProgress = Math.min(1.0, pu.emergeProgress + dt * 2.2);
        pu.y = pu.spawnY + (1.0 - pu.emergeProgress) * 36;

        // Sparkle while emerging
        if (Math.random() < 0.3) {
          this.addParticle({
            x: pu.x + Math.random() * pu.width,
            y: pu.y + Math.random() * pu.height,
            vx: (Math.random() - 0.5) * 30,
            vy: -Math.random() * 40 - 20,
            size: Math.random() * 4 + 2,
            color: '#00e5ff',
            alpha: 0.9,
            life: 0.35,
            maxLife: 0.35,
            shape: 'sparkle',
          });
        }

        if (pu.emergeProgress >= 1.0) {
          pu.isEmerging = false;
        }
        continue;
      }

      // Floating bobbing effect
      pu.y = pu.spawnY + Math.sin(pu.floatTimer * 4) * 4;

      // Aquatic energy sparkles
      if (Math.random() < 0.25) {
        this.addParticle({
          x: pu.x + Math.random() * pu.width,
          y: pu.y + Math.random() * pu.height,
          vx: (Math.random() - 0.5) * 20,
          vy: -Math.random() * 25 - 10,
          size: Math.random() * 3 + 2,
          color: '#80d8ff',
          alpha: 0.85,
          life: 0.4,
          maxLife: 0.4,
          shape: 'sparkle',
        });
      }

      // Check Collection by Player
      if (this.checkRectOverlap(p, pu) && !pu.collected && !p.isRespawning) {
        pu.collected = true;

        // Equip Super Water Gun!
        p.hasWaterGun = true;
        p.waterAmmo = 20; // 20 pressurized water blasts
        p.maxWaterAmmo = 20;
        this.state.hasWaterGun = true;
        this.state.waterAmmo = p.waterAmmo;
        this.state.maxWaterAmmo = p.maxWaterAmmo;
        this.state.score += 200;

        sound.playPowerUpCollect();

        // Floating announcement text
        this.addParticle({
          x: pu.x + pu.width / 2,
          y: pu.y - 14,
          vx: 0,
          vy: -80,
          size: 18,
          color: '#00e5ff',
          alpha: 1.0,
          life: 1.2,
          maxLife: 1.2,
          shape: 'text',
          text: 'SUPER WATER GUN! +200',
        });

        // Splash burst celebration
        for (let j = 0; j < 20; j++) {
          const angle = Math.random() * Math.PI * 2;
          const spd = Math.random() * 160 + 50;
          this.addParticle({
            x: pu.x + pu.width / 2,
            y: pu.y + pu.height / 2,
            vx: Math.cos(angle) * spd,
            vy: Math.sin(angle) * spd - 50,
            size: Math.random() * 5 + 3,
            color: j % 2 === 0 ? '#00e5ff' : '#29b6f6',
            alpha: 1.0,
            life: 0.6,
            maxLife: 0.6,
            shape: 'drop',
          });
        }

        this.powerUps.splice(i, 1);
      }
    }
  }

  // Shoot pressurized water blast from the Water Gun
  public shootWaterGun() {
    const p = this.player;
    if (!p.hasWaterGun || p.waterAmmo <= 0 || p.shootCooldown > 0 || p.isRespawning || this.state.screen !== 'PLAYING') {
      return;
    }

    p.waterAmmo -= 1;
    p.shootCooldown = 0.20; // Fast responsive semi-auto firing
    this.state.waterAmmo = p.waterAmmo;

    const isLeft = p.facing === 'left';
    const spawnX = isLeft ? p.x - 14 : p.x + p.width - 2;
    const spawnY = p.y + 20;

    const blastSpeed = 560;
    this.waterBlasts.push({
      id: 'wb-' + Date.now() + '-' + Math.random(),
      x: spawnX,
      y: spawnY,
      width: 20,
      height: 14,
      vx: (isLeft ? -blastSpeed : blastSpeed) + p.vx * 0.2,
      vy: -15, // slight lift
      size: 14,
      life: 0.95,
      maxLife: 0.95,
    });

    sound.playWaterGunShot();

    // Muzzle water spray and recoil particles
    for (let i = 0; i < 5; i++) {
      this.addParticle({
        x: spawnX + (isLeft ? 4 : 16),
        y: spawnY + 7,
        vx: (isLeft ? -1 : 1) * (Math.random() * 90 + 50) + (Math.random() - 0.5) * 30,
        vy: (Math.random() - 0.5) * 50 - 10,
        size: Math.random() * 3 + 2,
        color: '#80d8ff',
        alpha: 0.8,
        life: 0.25,
        maxLife: 0.25,
        shape: 'drop',
      });
    }

    // Out of ammo check
    if (p.waterAmmo <= 0) {
      p.hasWaterGun = false;
      this.state.hasWaterGun = false;
    }
  }

  // Update Water Gun Projectiles & Combat Interactions
  private updateWaterBlasts(dt: number) {
    for (let i = this.waterBlasts.length - 1; i >= 0; i--) {
      const wb = this.waterBlasts[i];
      wb.life -= dt;

      if (wb.life <= 0) {
        this.waterBlasts.splice(i, 1);
        continue;
      }

      wb.x += wb.vx * dt;
      wb.y += wb.vy * dt;
      wb.vy += 80 * dt; // gentle water arc

      // Hydro stream bubbly tail
      if (Math.random() < 0.6) {
        this.addParticle({
          x: wb.x + wb.width / 2 + (Math.random() - 0.5) * 6,
          y: wb.y + wb.height / 2 + (Math.random() - 0.5) * 6,
          vx: -wb.vx * 0.08 + (Math.random() - 0.5) * 20,
          vy: (Math.random() - 0.5) * 20,
          size: Math.random() * 3.5 + 1.5,
          color: '#e0f7fa',
          alpha: 0.75,
          life: 0.25,
          maxLife: 0.25,
          shape: 'drop',
        });
      }

      let blastExtinguished = false;

      // 1. Check Collision with Angry Sunflowers (Extinguish / Cleanse sunflower!)
      for (const sf of this.sunflowers) {
        if (!sf.isSquashed && this.checkRectOverlap(wb, sf)) {
          sf.isSquashed = true;
          sf.squashTimer = 0.7;
          blastExtinguished = true;

          this.state.score += 200;
          sound.playWaterGunSplash();

          // Floating "+200 WASHED!"
          this.addParticle({
            x: sf.x + sf.width / 2,
            y: sf.y - 12,
            vx: 0,
            vy: -75,
            size: 16,
            color: '#00e5ff',
            alpha: 1.0,
            life: 0.9,
            maxLife: 0.9,
            shape: 'text',
            text: '+200 WASHED!',
          });

          // Big burst of water + sunflower petals
          for (let j = 0; j < 18; j++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = Math.random() * 160 + 50;
            this.addParticle({
              x: sf.x + sf.width / 2,
              y: sf.y + sf.height / 2,
              vx: Math.cos(angle) * spd,
              vy: Math.sin(angle) * spd - 40,
              size: Math.random() * 5 + 3,
              color: j % 3 === 0 ? '#00e5ff' : j % 2 === 0 ? '#ffb300' : '#ff8f00',
              alpha: 1.0,
              life: 0.55,
              maxLife: 0.55,
              shape: j % 2 === 0 ? 'drop' : 'leaf',
            });
          }
          break;
        }
      }

      if (blastExtinguished) {
        this.waterBlasts.splice(i, 1);
        continue;
      }

      // 2. Check Collision with Incoming Seed Projectiles (Intercept & Deflect!)
      for (let sIdx = this.seedProjectiles.length - 1; sIdx >= 0; sIdx--) {
        const seed = this.seedProjectiles[sIdx];
        if (this.checkRectOverlap(wb, seed)) {
          blastExtinguished = true;
          this.seedProjectiles.splice(sIdx, 1);

          this.state.score += 50;
          sound.playWaterGunSplash();

          // Floating "+50 INTERCEPT!"
          this.addParticle({
            x: seed.x + seed.width / 2,
            y: seed.y - 10,
            vx: 0,
            vy: -60,
            size: 14,
            color: '#80d8ff',
            alpha: 1.0,
            life: 0.7,
            maxLife: 0.7,
            shape: 'text',
            text: '+50 DEFLECT!',
          });

          // Shatter splash
          for (let j = 0; j < 8; j++) {
            this.addParticle({
              x: seed.x + seed.width / 2,
              y: seed.y + seed.height / 2,
              vx: (Math.random() - 0.5) * 110,
              vy: -Math.random() * 80 - 20,
              size: Math.random() * 3 + 2,
              color: j % 2 === 0 ? '#00e5ff' : '#3e2723',
              alpha: 0.9,
              life: 0.35,
              maxLife: 0.35,
              shape: 'drop',
            });
          }
          break;
        }
      }

      if (blastExtinguished) {
        this.waterBlasts.splice(i, 1);
        continue;
      }

      // 3. Check Collision with Weeds (Wash away weeds!)
      for (const weed of this.weeds) {
        if (!weed.isSquashed && this.checkRectOverlap(wb, weed)) {
          weed.isSquashed = true;
          weed.squashTimer = 0.6;
          blastExtinguished = true;

          this.state.score += 150;
          sound.playWaterGunSplash();

          // Floating "+150 WASHED!"
          this.addParticle({
            x: weed.x + weed.width / 2,
            y: weed.y - 12,
            vx: 0,
            vy: -70,
            size: 16,
            color: '#00e5ff',
            alpha: 1.0,
            life: 0.85,
            maxLife: 0.85,
            shape: 'text',
            text: '+150 WASHED!',
          });

          // Weed splash burst
          for (let j = 0; j < 14; j++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = Math.random() * 140 + 40;
            this.addParticle({
              x: weed.x + weed.width / 2,
              y: weed.y + weed.height / 2,
              vx: Math.cos(angle) * spd,
              vy: Math.sin(angle) * spd - 30,
              size: Math.random() * 4 + 2,
              color: j % 2 === 0 ? '#00e5ff' : '#558b2f',
              alpha: 1.0,
              life: 0.5,
              maxLife: 0.5,
              shape: j % 2 === 0 ? 'drop' : 'leaf',
            });
          }
          break;
        }
      }

      if (blastExtinguished) {
        this.waterBlasts.splice(i, 1);
        continue;
      }

      // 4. Check Collision with Solid Obstacles & Ground
      let hitSolid = false;
      for (const obs of this.level.obstacles) {
        if (obs.solid && this.checkRectOverlap(wb, obs)) {
          hitSolid = true;
          break;
        }
      }

      if (!hitSolid && wb.y + wb.height >= this.level.groundY) {
        for (const seg of this.level.groundSegments) {
          if (wb.x + wb.width > seg.x && wb.x < seg.x + seg.width) {
            hitSolid = true;
            break;
          }
        }
      }

      if (hitSolid) {
        // Hydrating splash on solid ground
        sound.playWaterGunSplash();
        for (let j = 0; j < 6; j++) {
          this.addParticle({
            x: wb.x + wb.width / 2,
            y: wb.y + wb.height / 2,
            vx: (Math.random() - 0.5) * 80,
            vy: -Math.random() * 60 - 20,
            size: Math.random() * 3 + 2,
            color: '#80d8ff',
            alpha: 0.8,
            life: 0.3,
            maxLife: 0.3,
            shape: 'drop',
          });
        }
        this.waterBlasts.splice(i, 1);
      }
    }
  }

  private updatePlayer(dt: number, input: InputState) {
    const p = this.player;

    // Handle shoot cooldown
    if (p.shootCooldown > 0) {
      p.shootCooldown = Math.max(0, p.shootCooldown - dt);
    }

    // Handle invulnerability timer
    if (p.invulnerableTimer > 0) {
      p.invulnerableTimer = Math.max(0, p.invulnerableTimer - dt);
    }

    // Handle respawn timer
    if (p.isRespawning) {
      p.respawnTimer -= dt;
      if (p.respawnTimer <= 0) {
        p.isRespawning = false;
        p.x = p.lastSafeX;
        p.y = p.lastSafeY;
        p.vx = 0;
        p.vy = 0;
      }
      return;
    }

    // Horizontal Movement
    if (input.left && !input.right) {
      p.vx = Math.max(-this.MAX_SPEED, p.vx - this.MOVE_ACCEL * dt);
      p.facing = 'left';
    } else if (input.right && !input.left) {
      p.vx = Math.min(this.MAX_SPEED, p.vx + this.MOVE_ACCEL * dt);
      p.facing = 'right';
    } else {
      // Deceleration / Friction
      if (p.vx > 0) {
        p.vx = Math.max(0, p.vx - this.MOVE_DECEL * dt);
      } else if (p.vx < 0) {
        p.vx = Math.min(0, p.vx + this.MOVE_DECEL * dt);
      }
    }

    // Animation timer
    if (Math.abs(p.vx) > 10 && p.isGrounded) {
      p.animTimer += dt;
      // Spawn running dust puff
      if (Math.random() < 0.25) {
        this.addParticle({
          x: p.x + p.width / 2 + (p.facing === 'left' ? 12 : -12),
          y: p.y + p.height - 2,
          vx: (Math.random() - 0.5) * 20 - (p.facing === 'left' ? -30 : 30),
          vy: -Math.random() * 25 - 10,
          size: Math.random() * 3 + 2,
          color: '#d2b48c',
          alpha: 0.6,
          life: 0.25,
          maxLife: 0.25,
        });
      }
    } else {
      p.animTimer = 0;
    }

    // Jump Buffering & Coyote Time
    if (p.isGrounded) {
      p.coyoteTimer = 0.12; // 120ms coyote time
    } else {
      p.coyoteTimer = Math.max(0, p.coyoteTimer - dt);
    }

    if (input.jumpJustPressed) {
      p.jumpBufferTimer = 0.12; // 120ms buffer
    } else {
      p.jumpBufferTimer = Math.max(0, p.jumpBufferTimer - dt);
    }

    // Initiate Jump (Cartoon Vertical Stretch & Dust Burst)
    if (p.jumpBufferTimer > 0 && p.coyoteTimer > 0) {
      p.vy = this.JUMP_FORCE;
      p.isGrounded = false;
      p.coyoteTimer = 0;
      p.jumpBufferTimer = 0;
      p.squashStretchX = 0.78;
      p.squashStretchY = 1.32;
      p.expression = 'determined';
      p.expressionTimer = 0.4;
      sound.playJump();

      // Jump dust cloud
      for (let i = 0; i < 6; i++) {
        this.addParticle({
          x: p.x + p.width / 2 + (Math.random() - 0.5) * 20,
          y: p.y + p.height,
          vx: (Math.random() - 0.5) * 60,
          vy: -Math.random() * 30 - 10,
          size: Math.random() * 4 + 2,
          color: '#e0cda7',
          alpha: 0.75,
          life: 0.3,
          maxLife: 0.3,
        });
      }
    }

    // Variable jump height: cut jump if button released early
    if (!input.jump && p.vy < this.MIN_JUMP_FORCE) {
      p.vy = this.MIN_JUMP_FORCE;
    }

    // Apply Gravity
    p.vy = Math.min(this.MAX_FALL_SPEED, p.vy + this.GRAVITY * dt);

    // Dynamic Cartoon Expression & Blinking
    if (p.expressionTimer && p.expressionTimer > 0) {
      p.expressionTimer -= dt;
      if (p.expressionTimer <= 0) {
        p.expression = 'normal';
      }
    }
    if (p.blinkTimer !== undefined) {
      p.blinkTimer -= dt;
      if (p.blinkTimer <= 0) {
        p.blinkTimer = 2.5 + Math.random() * 2.0;
      }
    }

    // Smooth elastic decay of squash & stretch back to 1.0
    if (p.squashStretchX !== undefined && p.squashStretchY !== undefined) {
      p.squashStretchX += (1.0 - p.squashStretchX) * 14 * dt;
      p.squashStretchY += (1.0 - p.squashStretchY) * 14 * dt;
    }

    // Predict new position
    const oldX = p.x;
    const oldY = p.y;
    const newX = p.x + p.vx * dt;
    const newY = p.y + p.vy * dt;

    // --- HORIZONTAL COLLISION RESOLUTION ---
    p.x = Math.max(0, Math.min(this.level.width - p.width, newX));

    // Check solid obstacles (Walls, Rocks)
    for (const obs of this.level.obstacles) {
      if (obs.solid && this.checkRectOverlap({ ...p, y: oldY }, obs)) {
        if (p.vx > 0) {
          p.x = obs.x - p.width;
        } else if (p.vx < 0) {
          p.x = obs.x + obs.width;
        }
        p.vx = 0;
      }
    }

    // --- VERTICAL COLLISION RESOLUTION ---
    p.y = newY;
    let groundedThisFrame = false;

    // 1. Check Solid Platforms
    for (const plat of this.level.platforms) {
      // Check landing on platform from above
      if (
        oldY + p.height <= plat.y + 6 && // was above or at top edge before
        p.y + p.height >= plat.y && // is now touching or below top edge
        p.x + p.width - 4 > plat.x && // horizontal overlap
        p.x + 4 < plat.x + plat.width &&
        p.vy >= 0 // moving downwards
      ) {
        p.y = plat.y - p.height;
        p.vy = 0;
        groundedThisFrame = true;

        // If standing on moving platform, carry horizontal delta
        if (plat.type === 'moving' && plat.moveRange) {
          p.x += plat.moveRange.direction * plat.moveRange.speed * dt;
        }

        // Safe landing checkpoint
        p.lastSafeX = p.x;
        p.lastSafeY = p.y;
        break;
      }
    }

    // 2. Check Question Blocks (Landing on top & Head-bumping from below)
    for (const qb of this.questionBlocks) {
      const blockTop = qb.y + qb.bumpOffset;
      const blockBottom = qb.y + qb.bumpOffset + qb.height;
      const hasHorizontalOverlap = p.x + p.width - 4 > qb.x && p.x + 4 < qb.x + qb.width;

      if (!hasHorizontalOverlap) continue;

      // A. Landing on top of Question Block
      if (
        oldY + p.height <= blockTop + 6 &&
        p.y + p.height >= blockTop &&
        p.vy >= 0
      ) {
        p.y = blockTop - p.height;
        p.vy = 0;
        groundedThisFrame = true;
        p.lastSafeX = p.x;
        p.lastSafeY = p.y;
        break;
      }

      // B. Mario Head Bump from underneath!
      if (
        p.vy < 0 &&
        oldY >= blockBottom - 8 &&
        p.y <= blockBottom
      ) {
        p.y = blockBottom + 1;
        p.vy = 80; // rebound player downward
        qb.bumpVy = -220; // spring block up
        sound.playBlockBump();

        if (!qb.hit) {
          qb.hit = true;
          // Spawn Super Water Gun Power-Up!
          if (qb.hasItem && qb.itemType === 'water_gun') {
            this.powerUps.push({
              id: 'pu-' + qb.id + '-' + Date.now(),
              type: 'water_gun',
              x: qb.x + (qb.width - 28) / 2,
              y: qb.y,
              width: 28,
              height: 24,
              vx: 0,
              vy: 0,
              spawnY: qb.y - 32,
              emergeProgress: 0,
              isEmerging: true,
              collected: false,
              floatTimer: 0,
            });

            sound.playPowerUpSpawn();

            // Golden question mark sparkle burst
            for (let i = 0; i < 10; i++) {
              this.addParticle({
                x: qb.x + qb.width / 2,
                y: qb.y,
                vx: (Math.random() - 0.5) * 80,
                vy: -Math.random() * 60 - 20,
                size: Math.random() * 4 + 2,
                color: '#ffea00',
                alpha: 1.0,
                life: 0.45,
                maxLife: 0.45,
                shape: 'sparkle',
              });
            }
          }
        }
        break;
      }
    }

    // 3. Check Ground Segments & Pits
    if (!groundedThisFrame) {
      const groundY = this.level.groundY;
      let onGroundSegment = false;

      for (const seg of this.level.groundSegments) {
        if (p.x + p.width > seg.x && p.x < seg.x + seg.width) {
          onGroundSegment = true;
          if (p.y + p.height >= groundY) {
            p.y = groundY - p.height;
            p.vy = 0;
            groundedThisFrame = true;
            p.lastSafeX = Math.max(seg.x + 20, Math.min(seg.x + seg.width - 40, p.x));
            p.lastSafeY = groundY - p.height;
          }
          break;
        }
      }

      // If NOT on any ground segment and below ground level => Falling into pit!
      if (!onGroundSegment && p.y > groundY + 40) {
        this.triggerPitFall();
        return;
      }
    }

    // Landing feedback (Cartoon Landing Squash & Dust Poofs)
    if (!p.isGrounded && groundedThisFrame) {
      p.squashStretchX = 1.32;
      p.squashStretchY = 0.68;
      // Landing dust poofs on left & right
      for (let i = 0; i < 6; i++) {
        this.addParticle({
          x: p.x + p.width / 2 + (Math.random() - 0.5) * 20,
          y: p.y + p.height,
          vx: (Math.random() - 0.5) * 50,
          vy: -Math.random() * 18 - 6,
          size: Math.random() * 3.5 + 2,
          color: '#d2b48c',
          alpha: 0.7,
          life: 0.25,
          maxLife: 0.25,
        });
      }
    }

    p.isGrounded = groundedThisFrame;

    // Check Hazard Obstacles (e.g. Cactus)
    if (p.invulnerableTimer <= 0) {
      for (const obs of this.level.obstacles) {
        if (obs.damageOnTouch && this.checkRectOverlap(p, obs)) {
          this.takeDamage();
          break;
        }
      }
    }
  }

  private triggerPitFall() {
    this.takeDamage(true);
    this.player.isRespawning = true;
    this.player.respawnTimer = 0.5;
    this.player.x = this.player.lastSafeX;
    this.player.y = this.player.lastSafeY;
    this.player.vx = 0;
    this.player.vy = 0;
    sound.playFallPit();
  }

  private takeDamage(isPit: boolean = false) {
    if (this.player.invulnerableTimer > 0 && !isPit) return;

    this.state.lives -= 1;
    this.player.invulnerableTimer = 1.4; // 1.4s invulnerability
    if (!isPit) {
      sound.playHurt();
      // Bounce player back
      this.player.vy = -320;
      this.player.vx = this.player.facing === 'left' ? 180 : -180;
    }

    if (this.state.lives <= 0) {
      this.state.lives = 0;
      this.state.screen = 'GAME_OVER';
      this.state.lossReason = 'lives';
      sound.playGameOver();
    }
  }

  private updateWeeds(dt: number) {
    const p = this.player;

    for (const weed of this.weeds) {
      if (weed.isSquashed) {
        if (weed.squashTimer > 0) {
          weed.squashTimer -= dt;
        }
        continue;
      }

      // Move along patrol vector
      weed.x += weed.vx * dt;
      weed.animTimer += dt;

      // Patrol bounds reversal
      if (weed.x <= weed.patrolMinX) {
        weed.x = weed.patrolMinX;
        weed.vx = Math.abs(weed.speed);
        weed.facing = 'right';
      } else if (weed.x + weed.width >= weed.patrolMaxX) {
        weed.x = weed.patrolMaxX - weed.width;
        weed.vx = -Math.abs(weed.speed);
        weed.facing = 'left';
      }

      // Solid obstacle collision reversal (bounce off walls and rocks)
      for (const obs of this.level.obstacles) {
        if (obs.solid && this.checkRectOverlap(weed, obs)) {
          if (weed.vx > 0) {
            weed.x = obs.x - weed.width;
            weed.vx = -Math.abs(weed.speed);
            weed.facing = 'left';
          } else if (weed.vx < 0) {
            weed.x = obs.x + obs.width;
            weed.vx = Math.abs(weed.speed);
            weed.facing = 'right';
          }
        }
      }

      // Interaction with Player
      if (p.isRespawning) continue;

      if (this.checkRectOverlap(p, weed)) {
        // Mario-Style Stomp Detection:
        // Player moving downward and feet landing on top of weed
        const playerBottom = p.y + p.height;
        const isStomping = p.vy > 0 && playerBottom <= weed.y + 16;

        if (isStomping) {
          // Squash the weed!
          weed.isSquashed = true;
          weed.squashTimer = 0.6; // Show squashed flat weed for 600ms

          // Mario Stomp Bounce!
          p.vy = -460;
          p.isGrounded = false;
          sound.playStomp();

          // Bonus score
          this.state.score += 100;

          // Floating "+100" score text particle
          this.addParticle({
            x: weed.x + weed.width / 2,
            y: weed.y - 12,
            vx: 0,
            vy: -70,
            size: 16,
            color: '#ffeb3b',
            alpha: 1.0,
            life: 0.85,
            maxLife: 0.85,
            shape: 'text',
            text: '+100',
          });

          // Burst of angry weed foliage and thistle thorns
          for (let i = 0; i < 14; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = Math.random() * 140 + 40;
            this.addParticle({
              x: weed.x + weed.width / 2,
              y: weed.y + weed.height / 2,
              vx: Math.cos(angle) * spd,
              vy: Math.sin(angle) * spd - 40,
              size: Math.random() * 4 + 3,
              color: i % 3 === 0 ? '#ff5252' : i % 2 === 0 ? '#7cb342' : '#33691e',
              alpha: 1.0,
              life: 0.55,
              maxLife: 0.55,
              shape: 'leaf',
            });
          }
        } else if (p.invulnerableTimer <= 0) {
          // Side or bottom bump -> Mario turtle damage
          this.takeDamage();
          // Knockback away from weed
          p.vx = p.x < weed.x ? -220 : 220;
          p.vy = -260;
        }
      }
    }
  }

  private updateSunflowers(dt: number) {
    const p = this.player;

    for (const sf of this.sunflowers) {
      if (sf.isSquashed) {
        if (sf.squashTimer > 0) {
          sf.squashTimer -= dt;
        }
        continue;
      }

      sf.animTimer += dt;

      // Track player vector
      const sfCenterX = sf.x + sf.width / 2;
      const sfHeadY = sf.y + 12;
      const dx = p.x + p.width / 2 - sfCenterX;
      const dy = p.y + p.height / 2 - sfHeadY;
      const dist = Math.hypot(dx, dy);

      sf.facing = dx < 0 ? 'left' : 'right';
      sf.aimAngle = Math.atan2(dy, dx);

      // Player in range -> manage firing cycle
      if (dist <= sf.range && !p.isRespawning && this.state.screen === 'PLAYING') {
        sf.fireCooldown -= dt;

        // Windup state (puffs/shakes head right before firing)
        if (sf.fireCooldown <= 0.45) {
          sf.windupTimer = 0.45 - Math.max(0, sf.fireCooldown);
        } else {
          sf.windupTimer = 0;
        }

        // Fire seed projectile!
        if (sf.fireCooldown <= 0) {
          sf.fireCooldown = sf.fireInterval + (Math.random() * 0.4 - 0.2);
          sf.windupTimer = 0;

          // Spawn high-velocity spinning sunflower seed
          const seedSpeed = 290;
          const spawnX = sfCenterX + (sf.facing === 'left' ? -16 : 16);
          const spawnY = sfHeadY - 2;

          this.seedProjectiles.push({
            id: 'seed-' + Math.random().toString(36).substr(2, 9),
            x: spawnX - 7,
            y: spawnY - 7,
            width: 14,
            height: 14,
            vx: Math.cos(sf.aimAngle) * seedSpeed,
            vy: Math.sin(sf.aimAngle) * seedSpeed - 20, // Slight upward arc
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() > 0.5 ? 1 : -1) * (10 + Math.random() * 6),
            life: 3.5,
            maxLife: 3.5,
          });

          sound.playSeedSpit();

          // Spitting muzzle pollen & petal sparks
          for (let i = 0; i < 7; i++) {
            const spreadAngle = sf.aimAngle + (Math.random() - 0.5) * 0.7;
            const puffSpd = Math.random() * 90 + 40;
            this.addParticle({
              x: spawnX,
              y: spawnY,
              vx: Math.cos(spreadAngle) * puffSpd,
              vy: Math.sin(spreadAngle) * puffSpd - 15,
              size: Math.random() * 3.5 + 2,
              color: i % 2 === 0 ? '#ffca28' : '#f57c00',
              alpha: 0.9,
              life: 0.35,
              maxLife: 0.35,
              shape: 'sparkle',
            });
          }
        }
      } else {
        // Out of range, keep minimum cooldown ready
        sf.fireCooldown = Math.max(0.6, sf.fireCooldown);
        sf.windupTimer = 0;
      }

      // Check collision with Player
      if (p.isRespawning) continue;

      if (this.checkRectOverlap(p, sf)) {
        const playerBottom = p.y + p.height;
        const isStomping = p.vy > 0 && playerBottom <= sf.y + 18;

        if (isStomping) {
          // Squash the sunflower!
          sf.isSquashed = true;
          sf.squashTimer = 0.65;

          // Bounce player upwards
          p.vy = -480;
          p.isGrounded = false;
          sound.playSunflowerStomp();

          // Bonus points
          this.state.score += 150;

          // Floating "+150" bonus score particle
          this.addParticle({
            x: sfCenterX,
            y: sf.y - 12,
            vx: 0,
            vy: -75,
            size: 16,
            color: '#ffd54f',
            alpha: 1.0,
            life: 0.9,
            maxLife: 0.9,
            shape: 'text',
            text: '+150',
          });

          // Burst of sunflower petals (yellow/orange), black seeds, and leaves
          for (let i = 0; i < 18; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = Math.random() * 160 + 50;
            const colors = ['#ffc107', '#ffa000', '#2e7d32', '#3e2723', '#ffd54f'];
            this.addParticle({
              x: sfCenterX,
              y: sfHeadY,
              vx: Math.cos(angle) * spd,
              vy: Math.sin(angle) * spd - 50,
              size: Math.random() * 5 + 3,
              color: colors[i % colors.length],
              alpha: 1.0,
              life: 0.65,
              maxLife: 0.65,
              shape: i % 3 === 0 ? 'leaf' : 'circle',
            });
          }
        } else if (p.invulnerableTimer <= 0) {
          // Player touched sunflower side or stem
          this.takeDamage();
          p.vx = p.x < sf.x ? -220 : 220;
          p.vy = -260;
        }
      }
    }
  }

  private updateSeedProjectiles(dt: number) {
    const p = this.player;

    for (let i = this.seedProjectiles.length - 1; i >= 0; i--) {
      const seed = this.seedProjectiles[i];

      // Physics & Rotation
      seed.x += seed.vx * dt;
      seed.y += seed.vy * dt;
      seed.vy += 85 * dt; // slight gravity arc
      seed.rotation += seed.rotSpeed * dt;
      seed.life -= dt;

      if (seed.life <= 0) {
        this.seedProjectiles.splice(i, 1);
        continue;
      }

      // Sparkle / dust speed trail
      if (Math.random() < 0.35) {
        this.addParticle({
          x: seed.x + seed.width / 2 + (Math.random() - 0.5) * 4,
          y: seed.y + seed.height / 2 + (Math.random() - 0.5) * 4,
          vx: -seed.vx * 0.15 + (Math.random() - 0.5) * 20,
          vy: -seed.vy * 0.15 + (Math.random() - 0.5) * 20,
          size: Math.random() * 2.5 + 1.5,
          color: '#ffb300',
          alpha: 0.7,
          life: 0.25,
          maxLife: 0.25,
          shape: 'sparkle',
        });
      }

      // 1. Collision with solid obstacles (Walls, Rocks)
      let collidedWithSolid = false;
      for (const obs of this.level.obstacles) {
        if (obs.solid && this.checkRectOverlap(seed, obs)) {
          collidedWithSolid = true;
          break;
        }
      }

      // 2. Collision with ground segments
      if (!collidedWithSolid && seed.y + seed.height >= this.level.groundY) {
        for (const seg of this.level.groundSegments) {
          if (seed.x + seed.width > seg.x && seed.x < seg.x + seg.width) {
            collidedWithSolid = true;
            break;
          }
        }
      }

      if (collidedWithSolid) {
        sound.playSeedHit();
        // Seed husk shatter particles
        for (let j = 0; j < 5; j++) {
          this.addParticle({
            x: seed.x + seed.width / 2,
            y: seed.y + seed.height / 2,
            vx: (Math.random() - 0.5) * 90,
            vy: -Math.random() * 70 - 20,
            size: Math.random() * 2.5 + 1.5,
            color: j % 2 === 0 ? '#3e2723' : '#d7ccc8',
            alpha: 0.9,
            life: 0.3,
            maxLife: 0.3,
          });
        }
        this.seedProjectiles.splice(i, 1);
        continue;
      }

      // 3. Collision with Player
      if (this.checkRectOverlap(p, seed)) {
        if (p.invulnerableTimer <= 0 && !p.isRespawning) {
          this.takeDamage();
          p.vx = seed.vx > 0 ? 180 : -180;
          p.vy = -220;
        }

        sound.playSeedHit();

        // Shatter particles
        for (let j = 0; j < 6; j++) {
          this.addParticle({
            x: seed.x + seed.width / 2,
            y: seed.y + seed.height / 2,
            vx: (Math.random() - 0.5) * 110,
            vy: -Math.random() * 90 - 20,
            size: Math.random() * 3 + 2,
            color: j % 2 === 0 ? '#212121' : '#ffb300',
            alpha: 0.9,
            life: 0.35,
            maxLife: 0.35,
          });
        }

        this.seedProjectiles.splice(i, 1);
      }
    }
  }

  private updateDrops(dt: number) {
    const p = this.player;

    this.drops.forEach(drop => {
      if (drop.collected) return;

      // Sparkle timer
      drop.sparkleTimer += dt;
      if (drop.sparkleTimer > (drop.isGolden ? 0.3 : 0.8)) {
        drop.sparkleTimer = 0;
        this.addParticle({
          x: drop.x + Math.random() * drop.width,
          y: drop.y + Math.random() * drop.height,
          vx: (Math.random() - 0.5) * 15,
          vy: -Math.random() * 20 - 5,
          size: drop.isGolden ? 4 : 2.5,
          color: drop.isGolden ? '#fff176' : '#80d8ff',
          alpha: 0.8,
          life: 0.4,
          maxLife: 0.4,
          shape: 'sparkle',
        });
      }

      // Check collision with player
      if (this.checkRectOverlap(p, drop)) {
        this.collectDrop(drop);
      }
    });
  }

  private collectDrop(drop: WaterDrop) {
    drop.collected = true;
    this.state.dropsCollected += 1;
    this.comboCount += 1;
    this.comboTimer = 2.0; // 2 seconds to chain combo

    const points = drop.isGolden ? 250 : 100 + this.comboCount * 10;
    this.state.score += points;

    // Trigger happy farmer cartoon expression
    this.player.expression = 'happy';
    this.player.expressionTimer = 0.5;

    // Calculate progress percentage
    this.state.progressPercent = Math.min(
      100,
      Math.round((this.state.dropsCollected / this.state.totalDropsInLevel) * 100)
    );

    if (drop.isGolden) {
      sound.playGoldenDrop();
      // Floating "+250 GOLDEN!" text
      this.addParticle({
        x: drop.x + drop.width / 2,
        y: drop.y - 12,
        vx: 0,
        vy: -70,
        size: 16,
        color: '#ffd700',
        alpha: 1.0,
        life: 0.85,
        maxLife: 0.85,
        shape: 'text',
        text: '+250 GOLDEN!',
      });
    } else {
      sound.playCollect(this.comboCount);
      if (this.comboCount >= 3) {
        // Comic combo popup
        this.addParticle({
          x: drop.x + drop.width / 2,
          y: drop.y - 10,
          vx: 0,
          vy: -60,
          size: 14,
          color: '#38bdf8',
          alpha: 1.0,
          life: 0.75,
          maxLife: 0.75,
          shape: 'text',
          text: `COMBO x${this.comboCount}!`,
        });
      }
    }

    // Spawn rich splash particles
    const splashColor = drop.isGolden ? '#ffd700' : '#29b6f6';
    for (let i = 0; i < 12; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 120 + 30;
      this.addParticle({
        x: drop.x + drop.width / 2,
        y: drop.y + drop.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 40,
        size: Math.random() * 4 + 2,
        color: splashColor,
        alpha: 0.9,
        life: 0.45,
        maxLife: 0.45,
        shape: drop.isGolden ? 'sparkle' : 'drop',
      });
    }

    // CHECK LEVEL WIN CONDITION (100% Drops Collected)
    if (this.state.progressPercent >= 100) {
      this.triggerWin();
    }
  }

  private triggerWin() {
    sound.playWateringSplash();
    sound.playLevelWin();

    // Bonus points for time left and lives left
    const timeBonus = Math.round(this.state.timeLeft) * 50;
    const lifeBonus = this.state.lives * 200;
    this.state.score += timeBonus + lifeBonus;

    // Check if this was the final level
    const isFinalLevel = this.state.currentLevelIndex >= 2; // Level 3 is index 2
    this.state.screen = isFinalLevel ? 'VICTORY' : 'LEVEL_COMPLETE';

    // Celebration confetti particles
    const cropX = this.level.cropGoalX;
    for (let i = 0; i < 60; i++) {
      const colors = ['#ffeb3b', '#4caf50', '#2196f3', '#e91e63', '#ff9800', '#9c27b0'];
      this.addParticle({
        x: cropX + (Math.random() - 0.5) * 160,
        y: this.level.groundY - Math.random() * 60,
        vx: (Math.random() - 0.5) * 200,
        vy: -Math.random() * 250 - 100,
        size: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 1.0,
        life: 1.8,
        maxLife: 1.8,
        shape: 'star',
      });
    }
  }

  private updateParticles(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 300 * dt; // slight particle gravity
      p.alpha = Math.max(0, p.life / p.maxLife);
    }
  }

  private addParticle(p: Particle) {
    if (this.particles.length < 150) {
      this.particles.push(p);
    }
  }

  private checkRectOverlap(r1: { x: number; y: number; width: number; height: number }, r2: { x: number; y: number; width: number; height: number }): boolean {
    return (
      r1.x < r2.x + r2.width &&
      r1.x + r1.width > r2.x &&
      r1.y < r2.y + r2.height &&
      r1.y + r1.height > r2.y
    );
  }
}
