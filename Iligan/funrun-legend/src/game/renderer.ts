import { LevelConfig, Obstacle, Particle, Player, Powerup, PlayerRock, Boss, BossRock } from '../types';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number = 800;
  private height: number = 450;
  public groundY: number = 360;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.groundY = height - 90;
  }

  public setDimensions(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.groundY = height - 90;
  }

  public render(
    player: Player,
    obstacles: Obstacle[],
    powerups: Powerup[],
    particles: Particle[],
    level: LevelConfig,
    worldOffset: number,
    isVictory: boolean = false,
    playerRocks: PlayerRock[] = [],
    bossRocks: BossRock[] = [],
    boss: Boss | null = null,
    screenShake: number = 0
  ) {
    const ctx = this.ctx;
    ctx.save();
    ctx.clearRect(0, 0, this.width, this.height);

    // Apply Screen Shake if active
    if (screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * screenShake * 1.5;
      const shakeY = (Math.random() - 0.5) * screenShake * 1.5;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Render Background Parallax Layers
    this.renderSky(level);
    this.renderMountains(level, worldOffset * 0.05);
    this.renderHillsAndFoliage(level, worldOffset * 0.2);
    this.renderRoadAndGround(level, worldOffset);

    // 2. Render Safe Zone Finish Line if in range
    const distanceRemaining = Math.max(0, level.distanceToSafeZone - player.distanceTraveled);
    if (distanceRemaining < 120 && !level.isInfinite) {
      this.renderSafeZoneArea(distanceRemaining, level);
    }

    // 3. Render Powerups
    powerups.forEach((pu) => this.renderPowerup(pu));

    // 4. Render Moving Obstacles
    obstacles.forEach((obs) => this.renderObstacle(obs));

    // 5. Render Boss & Boss Projectiles
    if (boss) {
      this.renderBoss(boss);
    }
    bossRocks.forEach((br) => this.renderBossRock(br));

    // 6. Render Player Rocks
    playerRocks.forEach((pr) => this.renderPlayerRock(pr));

    // 7. Render Alexander
    this.renderPlayer(player, isVictory);

    // 8. Render Particles
    this.renderParticles(particles);

    // 9. Speed lines when sprinting or boost active
    if (player.speed > player.baseSpeed * 1.2 || player.boostTimer > 0) {
      this.renderSpeedLines(player.speed);
    }

    // 10. Boss Intro Alert Overlay if active
    if (boss && boss.introBannerTimer > 0) {
      this.renderBossIntroBanner(boss);
    }

    ctx.restore();
  }

  private renderSky(level: LevelConfig) {
    const ctx = this.ctx;
    const grad = ctx.createLinearGradient(0, 0, 0, this.groundY);
    grad.addColorStop(0, level.backgroundColors.skyTop);
    grad.addColorStop(1, level.backgroundColors.skyBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.groundY);

    // Sun / Celestial glow
    ctx.save();
    const sunX = this.width * 0.85;
    const sunY = 70;
    const sunGrad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, 70);
    sunGrad.addColorStop(0, 'rgba(255, 245, 180, 0.9)');
    sunGrad.addColorStop(0.4, 'rgba(255, 215, 0, 0.4)');
    sunGrad.addColorStop(1, 'rgba(255, 200, 50, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 70, 0, Math.PI * 2);
    ctx.fill();

    // Floating fluffy clouds
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    this.drawCloud(sunX - 220, 50, 60);
    this.drawCloud(sunX - 520, 80, 85);
    this.drawCloud(this.width * 0.15, 60, 70);
    ctx.restore();
  }

  private drawCloud(x: number, y: number, size: number) {
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.35, 0, Math.PI * 2);
    ctx.arc(x + size * 0.3, y - size * 0.15, size * 0.4, 0, Math.PI * 2);
    ctx.arc(x + size * 0.65, y, size * 0.35, 0, Math.PI * 2);
    ctx.arc(x + size * 0.3, y + size * 0.1, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  private renderMountains(level: LevelConfig, offset: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = level.backgroundColors.mountains;

    // Distant mountain ridge
    ctx.beginPath();
    ctx.moveTo(0, this.groundY);
    const step = 90;
    for (let x = -100; x <= this.width + 100; x += step) {
      const peakX = x - (offset % step);
      const seed = Math.sin((x + offset * 0.5) * 0.015);
      const height = 90 + Math.abs(seed) * 80;
      ctx.lineTo(peakX, this.groundY - height);
    }
    ctx.lineTo(this.width, this.groundY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  private renderHillsAndFoliage(level: LevelConfig, offset: number) {
    const ctx = this.ctx;
    ctx.save();

    // Mid-ground rolling hills
    ctx.fillStyle = level.backgroundColors.hills;
    ctx.beginPath();
    ctx.moveTo(0, this.groundY);
    const hillStep = 140;
    for (let x = -200; x <= this.width + 200; x += hillStep) {
      const currentX = x - (offset % hillStep);
      const hillH = 45 + Math.sin((x + offset) * 0.01) * 35;
      ctx.quadraticCurveTo(
        currentX + hillStep * 0.5,
        this.groundY - hillH - 20,
        currentX + hillStep,
        this.groundY - 15
      );
    }
    ctx.lineTo(this.width, this.groundY);
    ctx.closePath();
    ctx.fill();

    // Province coconut trees and bamboo silhouette clumps
    ctx.fillStyle = level.backgroundColors.trees;
    const treeSpacing = 180;
    for (let x = -100; x <= this.width + 100; x += treeSpacing) {
      const treeX = x - (offset % treeSpacing);
      const treeHeight = 70 + ((x % 30) - 15);
      this.drawPalmTree(treeX, this.groundY - 10, treeHeight);
    }

    ctx.restore();
  }

  private drawPalmTree(x: number, y: number, height: number) {
    const ctx = this.ctx;
    ctx.beginPath();
    // Trunk with slight curve
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#5D4037';
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(x + 10, y - height * 0.6, x + 6, y - height);
    ctx.stroke();

    // Palm fronds
    ctx.fillStyle = '#2E7D32';
    const topX = x + 6;
    const topY = y - height;
    const fronds = [-0.6, -0.2, 0.2, 0.6, -1.0, 1.0];
    fronds.forEach((angle) => {
      ctx.beginPath();
      ctx.ellipse(
        topX + angle * 18,
        topY + Math.abs(angle) * 8,
        22,
        8,
        angle * 0.8,
        0,
        Math.PI * 2
      );
      ctx.fill();
    });
  }

  private renderRoadAndGround(level: LevelConfig, offset: number) {
    const ctx = this.ctx;
    const groundH = this.height - this.groundY;

    // Grass verge
    ctx.fillStyle = level.backgroundColors.ground;
    ctx.fillRect(0, this.groundY - 12, this.width, 18);

    // Main Dirt Track
    ctx.fillStyle = level.backgroundColors.road;
    ctx.fillRect(0, this.groundY + 6, this.width, groundH - 6);

    // Track Texture & Lane dashes
    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.fillRect(0, this.groundY + 6, this.width, 6);

    // Moving lane markers
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    const dashLength = 40;
    const gap = 30;
    const cycle = dashLength + gap;
    const startX = -(offset % cycle);

    for (let x = startX; x < this.width; x += cycle) {
      ctx.fillRect(x, this.groundY + 45, dashLength, 5);
    }

    // Roadside wooden milestone posts
    ctx.fillStyle = '#8D6E63';
    const postSpacing = 350;
    const postX = this.width - (offset % postSpacing);
    if (postX > -50 && postX < this.width + 50) {
      ctx.fillRect(postX, this.groundY - 25, 8, 30);
      ctx.fillStyle = '#FFEB3B';
      ctx.fillRect(postX - 8, this.groundY - 35, 24, 14);
      ctx.fillStyle = '#000';
      ctx.font = 'bold 8px sans-serif';
      ctx.fillText('RUN', postX - 6, this.groundY - 25);
    }
  }

  private renderSafeZoneArea(distanceRemaining: number, level: LevelConfig) {
    const ctx = this.ctx;
    // Calculate screen position of Safe Zone
    // distanceRemaining is 0..120 meters. 0 means right at Alexander (x=160).
    const safeZoneScreenX = 180 + distanceRemaining * 8;

    ctx.save();
    // Safe Zone Archway
    const archWidth = 140;
    const archHeight = 160;
    const archX = safeZoneScreenX;
    const archY = this.groundY - archHeight;

    // Green Safe Zone aura glow on ground
    const glowGrad = ctx.createRadialGradient(
      archX + archWidth / 2,
      this.groundY,
      20,
      archX + archWidth / 2,
      this.groundY,
      180
    );
    glowGrad.addColorStop(0, 'rgba(76, 175, 80, 0.6)');
    glowGrad.addColorStop(1, 'rgba(76, 175, 80, 0)');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(archX - 100, this.groundY - 10, archWidth + 200, 80);

    // Arch Pillars
    ctx.fillStyle = '#1B5E20';
    ctx.fillRect(archX, archY, 20, archHeight);
    ctx.fillRect(archX + archWidth - 20, archY, 20, archHeight);

    // Golden Arch Roof
    ctx.fillStyle = '#FFD700';
    ctx.fillRect(archX - 10, archY, archWidth + 20, 36);

    // Banner Text
    ctx.fillStyle = '#1B5E20';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SAFE ZONE', archX + archWidth / 2, archY + 24);

    // Cheering Province Crowd waving flags
    const crowdCount = 5;
    for (let i = 0; i < crowdCount; i++) {
      const cx = archX + 25 + i * 20;
      const cy = this.groundY - 15;
      // Head
      ctx.fillStyle = '#FFCC80';
      ctx.beginPath();
      ctx.arc(cx, cy - 25, 6, 0, Math.PI * 2);
      ctx.fill();
      // Body
      ctx.fillStyle = i % 2 === 0 ? '#1E88E5' : '#E53935';
      ctx.fillRect(cx - 5, cy - 19, 10, 18);
      // Waving arms / flags
      ctx.strokeStyle = '#FFE082';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 15);
      ctx.lineTo(cx + (i % 2 === 0 ? 8 : -8), cy - 32);
      ctx.stroke();
    }

    // Finish tape ribbon
    ctx.strokeStyle = '#FF1744';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(archX + 20, this.groundY - 40);
    ctx.lineTo(archX + archWidth - 20, this.groundY - 40);
    ctx.stroke();

    ctx.restore();
  }

  private renderPlayer(player: Player, isVictory: boolean) {
    const ctx = this.ctx;
    ctx.save();

    // Invincibility flashing effect
    if (player.invincibleTimer > 0 && Math.floor(Date.now() / 80) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    const px = player.x;
    const py = this.groundY - player.y - player.height;

    // Shadow under player
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    const shadowScale = Math.max(0.4, 1 - player.y / 200);
    const shadowWidth = (player.isSliding ? 56 : 38) * shadowScale;
    ctx.beginPath();
    ctx.ellipse(
      px + (player.isSliding ? 30 : 20),
      this.groundY + 6,
      shadowWidth / 2,
      7 * shadowScale,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Golden Sneakers aura if active
    if (player.goldenTimer > 0) {
      ctx.save();
      const auraGrad = ctx.createRadialGradient(
        px + 20,
        py + 25,
        10,
        px + 20,
        py + 25,
        50
      );
      auraGrad.addColorStop(0, 'rgba(255, 215, 0, 0.6)');
      auraGrad.addColorStop(0.7, 'rgba(255, 140, 0, 0.3)');
      auraGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(px + 20, py + 25, 45, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // DRAW CHARACTER (Boy or Girl with full customizations)
    if (isVictory) {
      this.drawCharacterVictory(px, py, player);
    } else if (player.isSliding) {
      this.drawCharacterSliding(px, py, player);
    } else if (!player.isGrounded) {
      this.drawCharacterJumping(px, py, player);
    } else {
      this.drawCharacterRunning(px, py, player);
    }

    ctx.restore();
  }

  private drawCharacterRunning(x: number, y: number, player: Player) {
    const ctx = this.ctx;
    const char = player.character;
    const isGirl = char.gender === 'girl';
    const cycle = player.runCycle; // 0 to 2PI
    const legAngle1 = Math.sin(cycle) * 0.65;
    const legAngle2 = Math.sin(cycle + Math.PI) * 0.65;
    const armAngle1 = Math.cos(cycle) * 0.65;
    const armAngle2 = Math.cos(cycle + Math.PI) * 0.65;
    const bob = Math.abs(Math.sin(cycle * 2)) * 4;

    const currentY = y - bob;

    // Back Arm
    this.drawLimb(
      x + 18,
      currentY + 24,
      16,
      armAngle2,
      char.skinTone,
      char.jerseyColor,
      isGirl ? 3.5 : 4.2
    );

    // Back Leg
    this.drawLeg(
      x + 16,
      currentY + 38,
      22,
      legAngle2,
      char.skinTone,
      char.shortsColor,
      player.goldenTimer > 0 ? '#FFD700' : char.shoesColor
    );

    // Torso (Athletic Jersey with custom color & number)
    ctx.fillStyle = char.jerseyColor;
    ctx.beginPath();
    if (isGirl) {
      // Athletic runner tank / crop jersey
      ctx.roundRect(x + 11, currentY + 18, 18, 22, 5);
    } else {
      ctx.roundRect(x + 10, currentY + 18, 20, 24, 4);
    }
    ctx.fill();

    // Gold Number on Chest
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 8.5px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(char.jerseyNumber || '01', x + 20, currentY + 32);

    // Head
    ctx.fillStyle = char.skinTone;
    ctx.beginPath();
    ctx.arc(x + 20, currentY + 10, isGirl ? 9.5 : 10, 0, Math.PI * 2);
    ctx.fill();

    // Hair & Headband
    this.drawHairAndAccessories(x + 20, currentY + 10, char, cycle, 'running');

    // Determined Eye & Smile
    ctx.fillStyle = '#212121';
    ctx.fillRect(x + 23, currentY + 9, 2.5, 2.5); // eye
    if (isGirl) {
      // Eyelash
      ctx.strokeStyle = '#18181B';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x + 23, currentY + 8);
      ctx.lineTo(x + 26, currentY + 7);
      ctx.stroke();
    }
    ctx.strokeStyle = '#8D4004';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(x + 23, currentY + 13, 3, 0, Math.PI * 0.7);
    ctx.stroke();

    // Front Leg
    this.drawLeg(
      x + 20,
      currentY + 38,
      22,
      legAngle1,
      char.skinTone,
      char.shortsColor,
      player.goldenTimer > 0 ? '#FFD700' : char.shoesColor
    );

    // Front Arm
    this.drawLimb(
      x + 22,
      currentY + 24,
      16,
      armAngle1,
      char.skinTone,
      char.jerseyColor,
      isGirl ? 4 : 4.5
    );
  }

  private drawCharacterJumping(x: number, y: number, player: Player) {
    const ctx = this.ctx;
    const char = player.character;
    const isGirl = char.gender === 'girl';

    // Torso
    ctx.fillStyle = char.jerseyColor;
    ctx.beginPath();
    if (isGirl) {
      ctx.roundRect(x + 11, y + 16, 18, 22, 5);
    } else {
      ctx.roundRect(x + 10, y + 16, 20, 24, 4);
    }
    ctx.fill();

    // Number
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 8.5px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(char.jerseyNumber || '01', x + 20, y + 30);

    // Head
    ctx.fillStyle = char.skinTone;
    ctx.beginPath();
    ctx.arc(x + 20, y + 8, isGirl ? 9.5 : 10, 0, Math.PI * 2);
    ctx.fill();

    // Hair & Headband (Jumping pose)
    this.drawHairAndAccessories(x + 20, y + 8, char, 0, 'jumping');

    // Face
    ctx.fillStyle = '#212121';
    ctx.fillRect(x + 23, y + 7, 2.5, 2.5);
    if (isGirl) {
      ctx.strokeStyle = '#18181B';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x + 23, y + 6);
      ctx.lineTo(x + 26, y + 5);
      ctx.stroke();
    }

    // Tucked Legs (Jumping)
    this.drawLimb(x + 16, y + 36, 14, 0.9, char.skinTone, char.shortsColor, 5);
    this.drawLimb(x + 22, y + 36, 16, -0.6, char.skinTone, char.shortsColor, 5);

    // Jump Shoes
    const shoeColor = player.goldenTimer > 0 ? '#FFD700' : char.shoesColor;
    ctx.fillStyle = shoeColor;
    ctx.fillRect(x + 28, y + 42, 10, 6);
    ctx.fillRect(x + 12, y + 46, 10, 6);

    // Arms raised for balance
    this.drawLimb(x + 14, y + 20, 16, -1.2, char.skinTone, char.jerseyColor, 4);
    this.drawLimb(x + 24, y + 20, 16, 0.8, char.skinTone, char.jerseyColor, 4.5);
  }

  private drawCharacterSliding(x: number, y: number, player: Player) {
    const ctx = this.ctx;
    const char = player.character;
    const isGirl = char.gender === 'girl';
    const slideY = this.groundY - 26;

    // Horizontal sliding posture
    ctx.fillStyle = char.jerseyColor;
    ctx.beginPath();
    ctx.roundRect(x + 16, slideY + 4, 28, 14, 4);
    ctx.fill();

    // Head tilted low
    ctx.fillStyle = char.skinTone;
    ctx.beginPath();
    ctx.arc(x + 48, slideY + 8, isGirl ? 8.5 : 9, 0, Math.PI * 2);
    ctx.fill();

    // Hair & Headband (Sliding posture)
    this.drawHairAndAccessories(x + 48, slideY + 8, char, 0, 'sliding');

    // Eye
    ctx.fillStyle = '#212121';
    ctx.fillRect(x + 51, slideY + 7, 2, 2);

    // Extended sliding legs kicking forward
    ctx.strokeStyle = char.shortsColor;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(x + 18, slideY + 12);
    ctx.lineTo(x - 6, slideY + 15);
    ctx.stroke();

    // Sneakers
    ctx.fillStyle = player.goldenTimer > 0 ? '#FFD700' : char.shoesColor;
    ctx.fillRect(x - 12, slideY + 12, 10, 6);

    // Slide dust cloud
    ctx.fillStyle = 'rgba(215, 180, 140, 0.7)';
    ctx.beginPath();
    ctx.arc(x - 14, this.groundY - 2, 6, 0, Math.PI * 2);
    ctx.arc(x - 6, this.groundY - 4, 8, 0, Math.PI * 2);
    ctx.arc(x + 4, this.groundY - 2, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawCharacterVictory(x: number, y: number, player: Player) {
    const ctx = this.ctx;
    const char = player.character;
    const isGirl = char.gender === 'girl';

    // Torso
    ctx.fillStyle = char.jerseyColor;
    ctx.beginPath();
    if (isGirl) {
      ctx.roundRect(x + 11, y + 16, 18, 22, 5);
    } else {
      ctx.roundRect(x + 10, y + 16, 20, 24, 4);
    }
    ctx.fill();

    // Number
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 8.5px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(char.jerseyNumber || '01', x + 20, y + 30);

    // Head
    ctx.fillStyle = char.skinTone;
    ctx.beginPath();
    ctx.arc(x + 20, y + 8, isGirl ? 9.5 : 10, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    this.drawHairAndAccessories(x + 20, y + 8, char, 0, 'victory');

    // Big happy smile!
    ctx.fillStyle = '#212121';
    ctx.fillRect(x + 16, y + 7, 2.5, 2.5);
    ctx.fillRect(x + 22, y + 7, 2.5, 2.5);
    ctx.strokeStyle = '#D32F2F';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x + 20, y + 11, 4, 0, Math.PI);
    ctx.stroke();

    // Standing Legs
    ctx.strokeStyle = char.shortsColor;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x + 14, y + 38);
    ctx.lineTo(x + 12, y + 56);
    ctx.moveTo(x + 24, y + 38);
    ctx.lineTo(x + 26, y + 56);
    ctx.stroke();

    // Shoes
    ctx.fillStyle = char.shoesColor;
    ctx.fillRect(x + 7, y + 54, 8, 5);
    ctx.fillRect(x + 23, y + 54, 8, 5);

    // Victory Arms Raised in 'V'
    ctx.strokeStyle = char.skinTone;
    ctx.lineWidth = isGirl ? 4 : 4.5;
    ctx.beginPath();
    ctx.moveTo(x + 12, y + 20);
    ctx.lineTo(x - 2, y - 4); // Left arm up
    ctx.moveTo(x + 26, y + 20);
    ctx.lineTo(x + 40, y - 4); // Right arm up
    ctx.stroke();
  }

  private drawHairAndAccessories(
    headCenterX: number,
    headCenterY: number,
    char: Player['character'],
    cycle: number,
    pose: 'running' | 'jumping' | 'sliding' | 'victory'
  ) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = char.hairColor;

    const style = char.hairStyle;

    if (style === 'ponytail') {
      // High sporty ponytail (Girl)
      ctx.beginPath();
      ctx.arc(headCenterX - 1, headCenterY - 2, 9.5, Math.PI * 0.8, Math.PI * 2.1);
      ctx.fill();

      // Bangs / fringe
      ctx.beginPath();
      ctx.ellipse(headCenterX + 2, headCenterY - 5, 6, 3, Math.PI * 0.1, 0, Math.PI * 2);
      ctx.fill();

      // Dynamic Ponytail bouncing
      const wave = pose === 'running' ? Math.sin(cycle * 3) * 8 : pose === 'jumping' ? 12 : 2;
      const tailX = headCenterX - 8;
      const tailY = headCenterY - 4;

      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.quadraticCurveTo(tailX - 12, tailY + wave - 4, tailX - 18, tailY + wave + 10);
      ctx.quadraticCurveTo(tailX - 8, tailY + wave + 6, tailX - 2, tailY + 4);
      ctx.closePath();
      ctx.fill();

      // Hair tie / ribbon
      ctx.fillStyle = char.headbandColor !== 'transparent' ? char.headbandColor : '#F59E0B';
      ctx.beginPath();
      ctx.arc(tailX, tailY, 3, 0, Math.PI * 2);
      ctx.fill();
    } else if (style === 'long_braid') {
      // Long flowing braid
      ctx.beginPath();
      ctx.arc(headCenterX - 1, headCenterY - 2, 9.5, Math.PI * 0.7, Math.PI * 2.2);
      ctx.fill();

      // Braid trailing behind
      const wave = pose === 'running' ? Math.sin(cycle * 2.5) * 6 : 4;
      const startX = headCenterX - 7;
      const startY = headCenterY;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        const bx = startX - i * 5;
        const by = startY + i * 4 + (i * wave * 0.3);
        ctx.arc(bx, by, 4 - i * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (style === 'curly_afro') {
      // Voluminous stylish afro/curls
      ctx.beginPath();
      ctx.arc(headCenterX - 1, headCenterY - 3, 13, 0, Math.PI * 2);
      ctx.fill();
      // Texture bumps
      for (let angle = 0; angle < Math.PI * 2; angle += 0.8) {
        const bx = headCenterX - 1 + Math.cos(angle) * 11;
        const by = headCenterY - 3 + Math.sin(angle) * 11;
        ctx.beginPath();
        ctx.arc(bx, by, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (style === 'short_fade') {
      // Modern side fade
      ctx.beginPath();
      ctx.arc(headCenterX - 1, headCenterY - 2, 9.5, Math.PI * 0.9, Math.PI * 2.0);
      ctx.fill();
      ctx.fillRect(headCenterX - 6, headCenterY - 8, 12, 4);
    } else {
      // Default Spiky Athletic Hair (Alexander)
      ctx.beginPath();
      ctx.arc(headCenterX - 1, headCenterY - 2, 10, Math.PI * 0.8, Math.PI * 2.1);
      ctx.fill();
      // Spikes on top
      ctx.beginPath();
      ctx.moveTo(headCenterX - 6, headCenterY - 8);
      ctx.lineTo(headCenterX - 2, headCenterY - 14);
      ctx.lineTo(headCenterX + 2, headCenterY - 8);
      ctx.lineTo(headCenterX + 6, headCenterY - 13);
      ctx.lineTo(headCenterX + 8, headCenterY - 7);
      ctx.closePath();
      ctx.fill();
    }

    // Headband (if not 'none')
    if (char.headbandColor && char.headbandColor !== 'transparent') {
      ctx.fillStyle = char.headbandColor;
      ctx.fillRect(headCenterX - 10, headCenterY - 4, 20, 3.5);

      // Trailing ribbon in wind
      if (pose === 'running' || pose === 'jumping') {
        const ribbonWave = pose === 'running' ? Math.sin(cycle * 3) * 6 : 8;
        ctx.strokeStyle = char.headbandColor;
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        ctx.moveTo(headCenterX - 10, headCenterY - 2);
        ctx.quadraticCurveTo(
          headCenterX - 18,
          headCenterY - 2 + ribbonWave,
          headCenterX - 24,
          headCenterY + 2 + ribbonWave
        );
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  private drawLimb(
    startX: number,
    startY: number,
    length: number,
    angle: number,
    skinColor: string,
    sleeveColor: string,
    thickness: number
  ) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(startX, startY);
    ctx.rotate(angle);

    // Sleeve
    ctx.strokeStyle = sleeveColor;
    ctx.lineWidth = thickness;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, length * 0.4);
    ctx.stroke();

    // Skin
    ctx.strokeStyle = skinColor;
    ctx.beginPath();
    ctx.moveTo(0, length * 0.4);
    ctx.lineTo(0, length);
    ctx.stroke();

    ctx.restore();
  }

  private drawLeg(
    startX: number,
    startY: number,
    length: number,
    angle: number,
    skinColor: string,
    shortsColor: string,
    shoeColor: string
  ) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(startX, startY);
    ctx.rotate(angle);

    // Shorts
    ctx.strokeStyle = shortsColor;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, length * 0.45);
    ctx.stroke();

    // Bare leg
    ctx.strokeStyle = skinColor;
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(0, length * 0.45);
    ctx.lineTo(0, length);
    ctx.stroke();

    // Shoe
    ctx.fillStyle = shoeColor;
    ctx.fillRect(-2, length - 2, 10, 5);

    ctx.restore();
  }

  private renderObstacle(obs: Obstacle) {
    const ctx = this.ctx;
    ctx.save();

    const ox = obs.x;
    const oy = this.groundY - obs.y - obs.height;

    // Obstacle Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(
      ox + obs.width / 2,
      this.groundY + 4,
      obs.width * 0.55,
      6,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    switch (obs.type) {
      case 'ROLLING_ROCK':
      case 'BOUNCING_BOULDER':
        this.drawRock(ox, oy, obs);
        break;
      case 'TREE_TRUNK':
      case 'ROLLING_LOG':
        this.drawLog(ox, oy, obs);
        break;
      case 'SWINGING_BRANCH':
        this.drawSwingingBranch(ox, oy, obs);
        break;
      case 'MUD_PIT':
        this.drawMudPit(ox, obs);
        break;
    }

    ctx.restore();
  }

  private drawRock(x: number, y: number, obs: Obstacle) {
    const ctx = this.ctx;
    ctx.save();
    const cx = x + obs.width / 2;
    const cy = y + obs.height / 2;
    const radius = obs.width / 2;

    ctx.translate(cx, cy);
    ctx.rotate(obs.rotation);

    // Rock base
    ctx.fillStyle = obs.type === 'BOUNCING_BOULDER' ? '#5D4037' : '#757575';
    ctx.beginPath();
    const points = 7;
    for (let i = 0; i < points; i++) {
      const angle = (i / points) * Math.PI * 2;
      const r = radius * (0.85 + ((i % 2) * 0.18));
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    // Rock facets & cracks
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-radius * 0.4, -radius * 0.3);
    ctx.lineTo(radius * 0.2, radius * 0.1);
    ctx.lineTo(radius * 0.5, -radius * 0.2);
    ctx.stroke();

    // Moss / Lava highlights
    ctx.fillStyle = obs.type === 'BOUNCING_BOULDER' ? '#FF5722' : '#33691E';
    ctx.beginPath();
    ctx.arc(-radius * 0.3, radius * 0.2, radius * 0.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private drawLog(x: number, y: number, obs: Obstacle) {
    const ctx = this.ctx;
    ctx.save();
    const cx = x + obs.width / 2;
    const cy = y + obs.height / 2;

    if (obs.type === 'ROLLING_LOG') {
      // Circular rolling log facing camera
      ctx.translate(cx, cy);
      ctx.rotate(obs.rotation);

      const r = obs.width / 2;
      // Bark rim
      ctx.fillStyle = '#4E342E';
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Wood interior
      ctx.fillStyle = '#D7CCC8';
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.82, 0, Math.PI * 2);
      ctx.fill();

      // Growth tree rings
      ctx.strokeStyle = '#8D6E63';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.5, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(0, 0, r * 0.25, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      // Horizontal fallen tree trunk hurdle
      ctx.fillStyle = '#5D4037';
      ctx.beginPath();
      ctx.roundRect(x, y, obs.width, obs.height, 6);
      ctx.fill();

      // Bark texture lines
      ctx.strokeStyle = '#3E2723';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 6, y + obs.height * 0.35);
      ctx.lineTo(x + obs.width - 6, y + obs.height * 0.35);
      ctx.moveTo(x + 10, y + obs.height * 0.7);
      ctx.lineTo(x + obs.width - 10, y + obs.height * 0.7);
      ctx.stroke();

      // Cut ends
      ctx.fillStyle = '#BCAAA4';
      ctx.beginPath();
      ctx.ellipse(x + 4, y + obs.height / 2, 4, obs.height * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private drawSwingingBranch(x: number, y: number, obs: Obstacle) {
    const ctx = this.ctx;
    // Suspended high log / branch requiring player to SLIDE
    ctx.save();
    // Hanging vines
    ctx.strokeStyle = '#2E7D32';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x + 10, 0);
    ctx.lineTo(x + 15, y);
    ctx.moveTo(x + obs.width - 10, 0);
    ctx.lineTo(x + obs.width - 15, y);
    ctx.stroke();

    // Heavy hanging log
    ctx.fillStyle = '#4E342E';
    ctx.beginPath();
    ctx.roundRect(x, y, obs.width, obs.height, 6);
    ctx.fill();

    // Leaves on branch
    ctx.fillStyle = '#43A047';
    ctx.beginPath();
    ctx.arc(x + 5, y - 4, 8, 0, Math.PI * 2);
    ctx.arc(x + obs.width - 6, y - 4, 8, 0, Math.PI * 2);
    ctx.fill();

    // Caution indicator: "SLIDE!"
    ctx.fillStyle = '#FFEB3B';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⬇ DUCK', x + obs.width / 2, y + obs.height * 0.7);

    ctx.restore();
  }

  private drawMudPit(x: number, obs: Obstacle) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = '#3E2723';
    ctx.beginPath();
    ctx.ellipse(
      x + obs.width / 2,
      this.groundY + 8,
      obs.width / 2,
      10,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Mud bubbles
    ctx.fillStyle = '#5D4037';
    ctx.beginPath();
    ctx.arc(x + obs.width * 0.35, this.groundY + 6, 4, 0, Math.PI * 2);
    ctx.arc(x + obs.width * 0.65, this.groundY + 7, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  private renderPowerup(pu: Powerup) {
    if (pu.collected) return;
    const ctx = this.ctx;
    ctx.save();

    const floatY = Math.sin(pu.floatOffset + Date.now() * 0.005) * 6;
    const x = pu.x;
    const y = this.groundY - pu.y - pu.height + floatY;

    // Glowing halo
    const glow = ctx.createRadialGradient(
      x + pu.width / 2,
      y + pu.height / 2,
      2,
      x + pu.width / 2,
      y + pu.height / 2,
      22
    );
    glow.addColorStop(0, 'rgba(255, 235, 59, 0.8)');
    glow.addColorStop(1, 'rgba(255, 235, 59, 0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x + pu.width / 2, y + pu.height / 2, 22, 0, Math.PI * 2);
    ctx.fill();

    if (pu.type === 'PROVINCE_MANGO') {
      // Golden Ripe Mango
      ctx.fillStyle = '#FFB300';
      ctx.beginPath();
      ctx.ellipse(x + 14, y + 14, 11, 14, Math.PI * 0.2, 0, Math.PI * 2);
      ctx.fill();
      // Green Leaf
      ctx.fillStyle = '#4CAF50';
      ctx.beginPath();
      ctx.ellipse(x + 18, y + 4, 5, 2.5, -Math.PI * 0.3, 0, Math.PI * 2);
      ctx.fill();
    } else if (pu.type === 'HERBAL_TONIC') {
      // Herbal Tonic Potion Bottle (+1 Life)
      ctx.fillStyle = '#E91E63';
      ctx.beginPath();
      ctx.roundRect(x + 6, y + 8, 16, 18, 4);
      ctx.fill();
      // Cork
      ctx.fillStyle = '#8D6E63';
      ctx.fillRect(x + 10, y + 3, 8, 5);
      // Heart Icon inside bottle
      ctx.fillStyle = '#FFF';
      ctx.font = 'bold 10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('♥', x + 14, y + 21);
    } else if (pu.type === 'GOLDEN_SNEAKERS') {
      // Golden Sneakers (Invincible Star Run)
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.roundRect(x + 4, y + 8, 20, 12, 3);
      ctx.fill();
      // Wings
      ctx.fillStyle = '#FFF9C4';
      ctx.beginPath();
      ctx.moveTo(x + 6, y + 8);
      ctx.lineTo(x, y + 2);
      ctx.lineTo(x + 10, y + 6);
      ctx.fill();
    }

    ctx.restore();
  }

  private renderPlayerRock(rock: PlayerRock) {
    const ctx = this.ctx;
    const x = rock.x;
    const y = this.groundY - rock.y - rock.size / 2;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rock.rotation);

    // Glowing energy aura around fast spinning rock
    const auraGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, rock.size);
    auraGrad.addColorStop(0, 'rgba(251, 191, 36, 0.9)');
    auraGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.4)');
    auraGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(0, 0, rock.size * 1.3, 0, Math.PI * 2);
    ctx.fill();

    // Jagged stone geometry
    ctx.fillStyle = '#78716C';
    ctx.beginPath();
    const r = rock.size / 2;
    ctx.moveTo(r, 0);
    ctx.lineTo(r * 0.7, -r * 0.8);
    ctx.lineTo(-r * 0.4, -r);
    ctx.lineTo(-r, -r * 0.3);
    ctx.lineTo(-r * 0.8, r * 0.7);
    ctx.lineTo(r * 0.3, r);
    ctx.closePath();
    ctx.fill();

    // Stone highlights and shadow
    ctx.strokeStyle = '#D6D3D1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-r * 0.4, -r);
    ctx.lineTo(r * 0.7, -r * 0.8);
    ctx.lineTo(r, 0);
    ctx.stroke();

    // Crack
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-2, -3);
    ctx.lineTo(2, 1);
    ctx.lineTo(0, 4);
    ctx.stroke();

    ctx.restore();
  }

  private renderBossRock(rock: BossRock) {
    const ctx = this.ctx;
    const x = rock.x;
    const y = this.groundY - rock.y - rock.size / 2;

    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rock.rotation);

    if (rock.type === 'MAGMA_ROCK') {
      // Fiery Magma Rock with animated glow
      const fireGrad = ctx.createRadialGradient(0, 0, rock.size * 0.2, 0, 0, rock.size * 1.2);
      fireGrad.addColorStop(0, '#FEF08A');
      fireGrad.addColorStop(0.3, '#F97316');
      fireGrad.addColorStop(0.7, '#DC2626');
      fireGrad.addColorStop(1, 'rgba(185, 28, 28, 0)');
      ctx.fillStyle = fireGrad;
      ctx.beginPath();
      ctx.arc(0, 0, rock.size * 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Magma core
      ctx.fillStyle = '#450A0A';
      ctx.beginPath();
      ctx.arc(0, 0, rock.size * 0.5, 0, Math.PI * 2);
      ctx.fill();

      // Glowing cracks
      ctx.strokeStyle = '#FDE047';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-rock.size * 0.35, -rock.size * 0.1);
      ctx.lineTo(0, 0);
      ctx.lineTo(rock.size * 0.35, rock.size * 0.2);
      ctx.moveTo(0, 0);
      ctx.lineTo(-rock.size * 0.2, rock.size * 0.35);
      ctx.stroke();
    } else {
      // Heavy Colossus Boulder with dark granite textures
      const shadowGrad = ctx.createRadialGradient(-rock.size * 0.2, -rock.size * 0.2, 2, 0, 0, rock.size * 0.7);
      shadowGrad.addColorStop(0, '#A8A29E');
      shadowGrad.addColorStop(0.5, '#57534E');
      shadowGrad.addColorStop(1, '#292524');
      ctx.fillStyle = shadowGrad;

      ctx.beginPath();
      const r = rock.size * 0.5;
      ctx.moveTo(r * 0.9, -r * 0.2);
      ctx.lineTo(r * 0.5, -r * 0.85);
      ctx.lineTo(-r * 0.4, -r * 0.9);
      ctx.lineTo(-r * 0.9, -r * 0.2);
      ctx.lineTo(-r * 0.8, r * 0.7);
      ctx.lineTo(r * 0.1, r * 0.95);
      ctx.lineTo(r * 0.85, r * 0.5);
      ctx.closePath();
      ctx.fill();

      // Outer rim
      ctx.strokeStyle = '#1C1917';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Heavy fracture line
      ctx.strokeStyle = '#0C0A09';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-r * 0.3, -r * 0.6);
      ctx.lineTo(0, -r * 0.1);
      ctx.lineTo(r * 0.4, r * 0.3);
      ctx.stroke();
    }

    ctx.restore();
  }

  private renderBoss(boss: Boss) {
    const ctx = this.ctx;
    const x = boss.x;
    const y = this.groundY - boss.y - boss.height;

    ctx.save();

    // Shadow under boss
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(x + boss.width / 2, this.groundY + 4, boss.width * 0.5, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Flashing Hurt Tint
    const isHurt = boss.state === 'hurt';
    if (isHurt) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.95)';
    }

    // Main Colossus Torso & Stone Body
    const stoneGrad = ctx.createLinearGradient(x, y, x + boss.width, y + boss.height);
    stoneGrad.addColorStop(0, isHurt ? '#F87171' : '#44403C');
    stoneGrad.addColorStop(0.5, isHurt ? '#EF4444' : '#292524');
    stoneGrad.addColorStop(1, isHurt ? '#B91C1C' : '#1C1917');
    ctx.fillStyle = stoneGrad;

    // Heavy shoulders & chest
    ctx.beginPath();
    ctx.roundRect(x + 10, y + 25, boss.width - 20, boss.height - 45, 16);
    ctx.fill();
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Massive Stone Head
    ctx.fillStyle = isHurt ? '#FCA5A5' : '#57534E';
    ctx.beginPath();
    ctx.roundRect(x + 22, y + 2, boss.width - 44, 32, 10);
    ctx.fill();
    ctx.strokeStyle = '#1C1917';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Glowing Colossus Eyes
    const eyeColor = isHurt ? '#FFFFFF' : '#34D399';
    ctx.fillStyle = eyeColor;
    ctx.shadowColor = eyeColor;
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(x + 36, y + 15, 4.5, 0, Math.PI * 2);
    ctx.arc(x + 58, y + 15, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0; // reset

    // Titan Brow / Horns
    ctx.fillStyle = '#78716C';
    ctx.beginPath();
    ctx.moveTo(x + 18, y + 6);
    ctx.lineTo(x + 12, y - 10);
    ctx.lineTo(x + 28, y + 4);
    ctx.moveTo(x + boss.width - 18, y + 6);
    ctx.lineTo(x + boss.width - 12, y - 10);
    ctx.lineTo(x + boss.width - 28, y + 4);
    ctx.fill();

    // Heavy Stone Legs / Pedestal
    ctx.fillStyle = '#292524';
    ctx.fillRect(x + 18, y + boss.height - 24, 22, 24);
    ctx.fillRect(x + boss.width - 40, y + boss.height - 24, 22, 24);

    // Dynamic Arm Windup / Throw Animation
    if (boss.state === 'throwing') {
      // Raised arm holding a huge rock ready to fling
      ctx.fillStyle = '#57534E';
      ctx.beginPath();
      ctx.roundRect(x - 18, y - 8, 26, 42, 8);
      ctx.fill();

      // Rock in hand
      const prepGrad = ctx.createRadialGradient(x - 6, y - 16, 4, x - 6, y - 16, 24);
      prepGrad.addColorStop(0, '#F59E0B');
      prepGrad.addColorStop(0.6, '#D97706');
      prepGrad.addColorStop(1, '#78350F');
      ctx.fillStyle = prepGrad;
      ctx.beginPath();
      ctx.arc(x - 6, y - 16, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#FDE68A';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    } else {
      // Idle / Guarding Arms
      ctx.fillStyle = '#57534E';
      ctx.fillRect(x - 2, y + 36, 16, 38);
      ctx.fillRect(x + boss.width - 14, y + 36, 16, 38);
    }

    // Mini Boss Health Bar above Titan
    const barWidth = 80;
    const barHeight = 7;
    const barX = x + (boss.width - barWidth) / 2;
    const barY = y - 18;
    const healthPercent = Math.max(0, boss.health / boss.maxHealth);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);
    ctx.fillStyle = '#EF4444';
    ctx.fillRect(barX, barY, barWidth * healthPercent, barHeight);
    ctx.strokeStyle = '#F87171';
    ctx.lineWidth = 1;
    ctx.strokeRect(barX, barY, barWidth, barHeight);

    ctx.restore();
  }

  private renderBossIntroBanner(boss: Boss) {
    const ctx = this.ctx;
    ctx.save();

    const bannerY = 80;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, bannerY, this.width, 56);

    ctx.fillStyle = '#EF4444';
    ctx.fillRect(0, bannerY, this.width, 3);
    ctx.fillRect(0, bannerY + 53, this.width, 3);

    ctx.textAlign = 'center';
    ctx.font = '900 13px sans-serif';
    ctx.fillStyle = '#FCA5A5';
    ctx.fillText('⚠️ WARNING: TITAN GUARDIAN EMERGES! • PRESS SPACE TO THROW ROCKS 🪨', this.width / 2, bannerY + 22);

    ctx.font = '900 20px sans-serif';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(boss.name.toUpperCase(), this.width / 2, bannerY + 45);

    ctx.restore();
  }

  private renderParticles(particles: Particle[]) {

    const ctx = this.ctx;
    particles.forEach((p) => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  private renderSpeedLines(speed: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1.5;

    const count = Math.min(12, Math.floor(speed * 0.6));
    for (let i = 0; i < count; i++) {
      const y = (i * 35 + ((Date.now() * 0.2) % 400)) % (this.height - 80);
      const x = (Date.now() * 0.8 + i * 90) % this.width;
      const len = 40 + (speed * 2);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - len, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  public static drawPreviewCharacter(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    char: Player['character'],
    timeSec: number,
    pose: 'running' | 'jumping' | 'sliding' = 'running'
  ) {
    ctx.clearRect(0, 0, width, height);

    // Mini runner dirt track
    const groundY = height - 32;
    ctx.fillStyle = '#2E7D32';
    ctx.fillRect(0, groundY - 6, width, 8);
    ctx.fillStyle = '#8D6E63';
    ctx.fillRect(0, groundY + 2, width, height - groundY);

    // Moving lane marker
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    const offset = (timeSec * 80) % 40;
    for (let lx = -offset; lx < width; lx += 40) {
      ctx.fillRect(lx, groundY + 12, 22, 3);
    }

    // Runner mock instance
    const dummyPlayer: Player = {
      x: width / 2 - 20,
      y: pose === 'jumping' ? 35 : 0,
      vy: 0,
      width: 40,
      height: 52,
      isGrounded: pose !== 'jumping',
      isJumping: pose === 'jumping',
      isSliding: pose === 'sliding',
      slideTimer: 0,
      speed: 12,
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
      runCycle: (timeSec * 10) % (Math.PI * 2),
      state: pose,
      character: char,
    };

    const tempRenderer = new GameRenderer(ctx, width, height);
    tempRenderer.groundY = groundY;
    tempRenderer.renderPlayer(dummyPlayer, false);
  }
}

