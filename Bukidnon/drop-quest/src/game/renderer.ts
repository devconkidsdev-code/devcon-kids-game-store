import { LevelConfig, Particle, Platform, Obstacle, WaterDrop, Player, WeedEnemy, SunflowerEnemy, SeedProjectile, QuestionBlock, PowerUpItem, WaterBlast } from '../types';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public setContext(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  // Clear & draw background with parallax
  public drawBackground(
    width: number,
    height: number,
    cameraX: number,
    level: LevelConfig,
    gameTime: number
  ) {
    const ctx = this.ctx;

    // Sky Gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
    skyGrad.addColorStop(0, level.theme.skyTop);
    skyGrad.addColorStop(1, level.theme.skyBottom);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, width, height);

    // Sun with pulsing rays
    const sunX = width - 120 - (cameraX * 0.05) % (width + 300);
    const sunY = 90;
    const sunPulse = Math.sin(gameTime * 2) * 4;

    ctx.save();
    // Sun glow
    const sunGlow = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 70);
    sunGlow.addColorStop(0, 'rgba(255, 235, 100, 0.6)');
    sunGlow.addColorStop(0.5, 'rgba(255, 200, 50, 0.2)');
    sunGlow.addColorStop(1, 'rgba(255, 200, 50, 0)');
    ctx.fillStyle = sunGlow;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 70, 0, Math.PI * 2);
    ctx.fill();

    // Sun core
    ctx.fillStyle = level.theme.sunColor;
    ctx.beginPath();
    ctx.arc(sunX, sunY, 32 + sunPulse * 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Sun rays
    ctx.strokeStyle = 'rgba(255, 220, 80, 0.4)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4 + gameTime * 0.2;
      const r1 = 40;
      const r2 = 55 + sunPulse;
      ctx.beginPath();
      ctx.moveTo(sunX + Math.cos(angle) * r1, sunY + Math.sin(angle) * r1);
      ctx.lineTo(sunX + Math.cos(angle) * r2, sunY + Math.sin(angle) * r2);
      ctx.stroke();
    }
    ctx.restore();

    // Far Distant Mountains (Parallax 0.1)
    ctx.fillStyle = level.theme.mountainColor;
    ctx.beginPath();
    ctx.moveTo(0, height);
    for (let x = 0; x <= width + 100; x += 100) {
      const worldX = x + cameraX * 0.1;
      const mountainY = height - 260 - Math.sin(worldX * 0.003) * 60 - Math.cos(worldX * 0.007) * 40;
      ctx.lineTo(x, mountainY);
    }
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();

    // Mid Hills & Farm Silhouettes (Parallax 0.25)
    ctx.fillStyle = 'rgba(120, 90, 60, 0.25)';
    ctx.beginPath();
    ctx.moveTo(0, height);
    for (let x = 0; x <= width + 80; x += 80) {
      const worldX = x + cameraX * 0.25;
      const hillY = height - 190 - Math.sin(worldX * 0.005) * 35;
      ctx.lineTo(x, hillY);
    }
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();

    // Distant Windmills, Barns, School Buildings & Wood Houses (Parallax 0.25)
    this.drawDistantVillageBuildings(width, height, cameraX, gameTime);

    // Distant Pasture Fauna (Carabaos & Chickens on Mid-Hills - Parallax 0.25)
    this.drawDistantPastureFauna(width, height, cameraX, gameTime);

    // Clouds (Parallax 0.15 + drift)
    const clouds = [
      { x: 100, y: 60, scale: 1.1, speed: 12 },
      { x: 450, y: 110, scale: 0.8, speed: 8 },
      { x: 800, y: 75, scale: 1.3, speed: 15 },
      { x: 1200, y: 130, scale: 0.9, speed: 10 },
      { x: 1600, y: 85, scale: 1.2, speed: 14 },
    ];

    clouds.forEach(c => {
      const cloudX = ((c.x + gameTime * c.speed - cameraX * 0.15) % (width + 400)) - 100;
      this.drawFluffyCloud(cloudX, c.y, c.scale, level.theme.cloudColor);
    });

    // Near Background Village Structures (School Buildings with Green Roof & Wooden Houses along ground level)
    this.drawNearVillageBuildings(width, height, cameraX, level, gameTime);

    // Near Background Farm Fauna (Carabaos Grazing/Wallowing and Chickens Waddling near the fence lines - World coords)
    this.drawNearFarmFauna(width, height, cameraX, level, gameTime);
  }

  // Draw Distant Carabaos and Chickens roaming the hills
  private drawDistantPastureFauna(width: number, height: number, cameraX: number, gameTime: number) {
    const distantFaunaNodes = [
      { worldX: 180, baseY: height - 195, type: 'carabao', scale: 0.45, facing: 'right' as const, hasEgret: true },
      { worldX: 420, baseY: height - 190, type: 'chicken_flock', scale: 0.45, facing: 'left' as const },
      { worldX: 750, baseY: height - 200, type: 'carabao_wallow', scale: 0.45, facing: 'left' as const },
      { worldX: 1100, baseY: height - 185, type: 'carabao_pair', scale: 0.45, facing: 'right' as const, hasEgret: true },
      { worldX: 1450, baseY: height - 192, type: 'rooster_post', scale: 0.5, facing: 'right' as const },
      { worldX: 1800, baseY: height - 190, type: 'carabao', scale: 0.45, facing: 'left' as const, hasEgret: true },
      { worldX: 2200, baseY: height - 195, type: 'chicken_flock', scale: 0.45, facing: 'right' as const },
      { worldX: 2600, baseY: height - 190, type: 'carabao_wallow', scale: 0.45, facing: 'right' as const },
      { worldX: 3100, baseY: height - 195, type: 'carabao', scale: 0.45, facing: 'right' as const },
      { worldX: 3500, baseY: height - 190, type: 'chicken_flock', scale: 0.45, facing: 'left' as const },
    ];

    distantFaunaNodes.forEach(item => {
      const screenX = item.worldX - cameraX * 0.25;
      if (screenX < -100 || screenX > width + 100) return;

      const hillY = height - 190 - Math.sin((item.worldX) * 0.005) * 35;

      if (item.type === 'carabao') {
        this.drawCarabao(screenX, hillY, item.scale, item.facing, gameTime, { hasEgret: item.hasEgret });
      } else if (item.type === 'carabao_wallow') {
        this.drawCarabao(screenX, hillY + 4, item.scale, item.facing, gameTime, { isWallowing: true });
      } else if (item.type === 'carabao_pair') {
        this.drawCarabao(screenX, hillY, item.scale, item.facing, gameTime, { hasEgret: true, hasCalf: true });
      } else if (item.type === 'chicken_flock') {
        this.drawChicken(screenX, hillY, item.scale * 1.2, item.facing, gameTime, { hasChicks: true, isPecking: true });
        this.drawChicken(screenX + 25 * (item.facing === 'left' ? -1 : 1), hillY, item.scale, item.facing === 'left' ? 'right' : 'left', gameTime + 1.2, { isPecking: true });
      } else if (item.type === 'rooster_post') {
        this.drawChicken(screenX, hillY - 8, item.scale * 1.3, item.facing, gameTime, { isRooster: true });
      }
    });
  }

  // Draw Near-Background Farm Fauna (Plump lively Carabaos and Chickens right behind gameplay ground level)
  private drawNearFarmFauna(width: number, height: number, cameraX: number, level: LevelConfig, gameTime: number) {
    const groundY = level.groundY;

    // Fixed world positions across each level segment
    const nearFauna = [
      // Stage start pasture
      { x: 380, y: groundY - 4, type: 'carabao', scale: 0.85, facing: 'right' as const, hasEgret: true },
      { x: 550, y: groundY - 2, type: 'chicken_flock', scale: 0.85, facing: 'left' as const },
      { x: 880, y: groundY - 2, type: 'rooster_fence', scale: 0.9, facing: 'right' as const },

      // Mid-level clearing
      { x: 1250, y: groundY - 4, type: 'carabao_wallow', scale: 0.9, facing: 'left' as const },
      { x: 1520, y: groundY - 2, type: 'chicken_family', scale: 0.85, facing: 'right' as const },
      { x: 1780, y: groundY - 4, type: 'carabao_calf', scale: 0.85, facing: 'right' as const, hasEgret: true },

      // Later stretch
      { x: 2320, y: groundY - 4, type: 'carabao', scale: 0.88, facing: 'left' as const, hasEgret: true },
      { x: 2550, y: groundY - 2, type: 'chicken_flock', scale: 0.85, facing: 'right' as const },
      { x: 2950, y: groundY - 4, type: 'carabao_wallow', scale: 0.9, facing: 'right' as const },
      { x: 3300, y: groundY - 2, type: 'rooster_fence', scale: 0.9, facing: 'left' as const },
      { x: 3600, y: groundY - 4, type: 'carabao', scale: 0.85, facing: 'left' as const, hasEgret: true },
      { x: 3820, y: groundY - 2, type: 'chicken_family', scale: 0.85, facing: 'right' as const },
    ];

    nearFauna.forEach(item => {
      const screenX = item.x - cameraX;
      if (screenX < -120 || screenX > width + 120) return;

      if (item.type === 'carabao') {
        this.drawCarabao(screenX, item.y, item.scale, item.facing, gameTime, { hasEgret: item.hasEgret });
      } else if (item.type === 'carabao_wallow') {
        this.drawCarabao(screenX, item.y, item.scale, item.facing, gameTime, { isWallowing: true });
      } else if (item.type === 'carabao_calf') {
        this.drawCarabao(screenX, item.y, item.scale, item.facing, gameTime, { hasEgret: true, hasCalf: true });
      } else if (item.type === 'chicken_family') {
        this.drawChicken(screenX, item.y, item.scale, item.facing, gameTime, { hasChicks: true, isPecking: true });
      } else if (item.type === 'chicken_flock') {
        this.drawChicken(screenX, item.y, item.scale, item.facing, gameTime, { isPecking: true });
        this.drawChicken(screenX + 30 * (item.facing === 'left' ? 1 : -1), item.y, item.scale * 0.9, item.facing === 'left' ? 'right' : 'left', gameTime + 0.8, { isPecking: true });
      } else if (item.type === 'rooster_fence') {
        // Draw wooden fence post
        const ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = '#6d4c41';
        ctx.fillRect(screenX - 5, item.y - 32, 10, 32);
        ctx.fillStyle = '#4e342e';
        ctx.fillRect(screenX - 18, item.y - 24, 36, 6);
        ctx.fillRect(screenX - 18, item.y - 12, 36, 6);
        ctx.restore();

        this.drawChicken(screenX, item.y - 32, item.scale, item.facing, gameTime, { isRooster: true });
      }
    });
  }

  // ==========================================
  // CARABAO (WATER BUFFALO) DRAWING ENGINE
  // Features: Sweeping curved horns, chewing jaw with grass stalk,
  // swishing tail, ear twitch, optional mud wallow, baby calf, & cattle egret!
  // ==========================================
  private drawCarabao(
    x: number,
    y: number,
    scale: number,
    facing: 'left' | 'right',
    gameTime: number,
    options: { hasEgret?: boolean; isWallowing?: boolean; hasCalf?: boolean } = {}
  ) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(facing === 'left' ? -scale : scale, scale);

    const chewCycle = Math.sin(gameTime * 3.5);
    const chewX = Math.cos(gameTime * 3.5) * 1.5;
    const chewY = Math.abs(Math.sin(gameTime * 3.5)) * 1.8;
    const earTwitch = Math.sin(gameTime * 4) > 0.85 ? Math.sin(gameTime * 25) * 0.2 : 0;
    const tailSwing = Math.sin(gameTime * 3.2) * 0.35;
    const breathe = Math.sin(gameTime * 1.8) * 1.2;

    if (options.isWallowing) {
      // --- MUD WALLOW / PUDDLE ---
      ctx.fillStyle = '#4e342e';
      ctx.beginPath();
      ctx.ellipse(0, 4, 38, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Mud surface highlight / ripples
      ctx.strokeStyle = '#6d4c41';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(0, 4, 34, 9, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Splashes / Mud coating
      ctx.fillStyle = '#3e2723';
      ctx.beginPath();
      ctx.arc(-18, 0, 4, 0, Math.PI * 2);
      ctx.arc(16, 2, 5, 0, Math.PI * 2);
      ctx.fill();

      // Submerged Back Body
      const wallowBodyGrad = ctx.createLinearGradient(0, -22, 0, 4);
      wallowBodyGrad.addColorStop(0, '#37474f');
      wallowBodyGrad.addColorStop(1, '#263238');
      ctx.fillStyle = wallowBodyGrad;

      ctx.beginPath();
      ctx.moveTo(-24, 2);
      ctx.bezierCurveTo(-26, -18 + breathe, -6, -24 + breathe, 14, -18 + breathe);
      ctx.lineTo(22, 2);
      ctx.closePath();
      ctx.fill();

      // Head poking out of mud
      this.renderCarabaoHead(ctx, 16, -16 + breathe, earTwitch, chewX, chewY, gameTime, true);
    } else {
      // --- FULL STANDING CARABAO ---

      // 1. Swishing Tail (Back)
      ctx.save();
      ctx.translate(-26, -26);
      ctx.rotate(tailSwing);
      ctx.strokeStyle = '#263238';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-8, 14, -3, 26);
      ctx.stroke();

      // Bushy tail brush tip
      ctx.fillStyle = '#1a2327';
      ctx.beginPath();
      ctx.ellipse(-3, 27, 4, 6, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 2. Far Legs (Darker shade)
      ctx.fillStyle = '#1c252a';
      // Far Back Leg
      ctx.fillRect(-22, -14, 7, 24);
      ctx.fillRect(-23, 8, 8, 4); // Hoof
      // Far Front Leg
      ctx.fillRect(10, -14, 7, 24);
      ctx.fillRect(9, 8, 8, 4); // Hoof

      // 3. Sturdy Muscular Body
      const bodyGrad = ctx.createLinearGradient(0, -42, 0, 8);
      bodyGrad.addColorStop(0, '#455a64');
      bodyGrad.addColorStop(0.35, '#37474f');
      bodyGrad.addColorStop(1, '#263238');
      ctx.fillStyle = bodyGrad;

      ctx.beginPath();
      ctx.moveTo(-26, -18);
      ctx.bezierCurveTo(-28, -32 + breathe, -18, -38 + breathe, -4, -36 + breathe); // Rump & loin
      ctx.bezierCurveTo(6, -42 + breathe, 16, -40 + breathe, 22, -30 + breathe); // Strong shoulder hump
      ctx.bezierCurveTo(28, -20, 24, -8, 18, -6); // Chest
      ctx.bezierCurveTo(8, -2, -14, -2, -22, -6); // Belly
      ctx.closePath();
      ctx.fill();

      // Subtle muscular shoulder highlight
      ctx.strokeStyle = 'rgba(144, 164, 174, 0.25)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(12, -28 + breathe, 10, -0.8, 1.2);
      ctx.stroke();

      // 4. Near Legs (Lit shade)
      ctx.fillStyle = '#2d3b41';
      // Near Back Leg
      ctx.fillRect(-17, -12, 8, 24);
      ctx.fillStyle = '#1a2327';
      ctx.fillRect(-18, 8, 9, 4); // Hoof
      // Near Front Leg
      ctx.fillStyle = '#2d3b41';
      ctx.fillRect(16, -12, 8, 24);
      ctx.fillStyle = '#1a2327';
      ctx.fillRect(15, 8, 9, 4); // Hoof

      // 5. Neck and Head
      this.renderCarabaoHead(ctx, 22, -26 + breathe, earTwitch, chewX, chewY, gameTime, false);

      // 6. Cattle Egret (White bird perched on back)
      if (options.hasEgret) {
        this.renderCattleEgret(ctx, -6, -37 + breathe, gameTime);
      }

      // 7. Baby Calf Carabao
      if (options.hasCalf) {
        ctx.save();
        ctx.translate(-42, 0);
        ctx.scale(0.55, 0.55);
        this.drawCarabao(0, 0, 1.0, 'right', gameTime + 1.5, { hasEgret: false });
        ctx.restore();
      }
    }

    ctx.restore();
  }

  // Render Carabao Head with sweeping curved horns & chewing jaw
  private renderCarabaoHead(
    ctx: CanvasRenderingContext2D,
    neckX: number,
    neckY: number,
    earTwitch: number,
    chewX: number,
    chewY: number,
    gameTime: number,
    isWallowing: boolean
  ) {
    ctx.save();
    ctx.translate(neckX, neckY);

    // Thick Neck
    ctx.fillStyle = '#37474f';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(12, -4);
    ctx.lineTo(14, 12);
    ctx.lineTo(-2, 14);
    ctx.closePath();
    ctx.fill();

    // 1. Sweeping Horns (Base & Curve - Iconic Carabao Crescent)
    // Far Horn (Darker)
    ctx.strokeStyle = '#1e282d';
    ctx.lineWidth = 5.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(10, -8);
    ctx.bezierCurveTo(4, -20, -12, -22, -18, -14); // sweeps back and out
    ctx.stroke();
    // Far Horn tip
    ctx.strokeStyle = '#cfd8dc';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-14, -17);
    ctx.lineTo(-19, -13);
    ctx.stroke();

    // 2. Ears
    // Far Ear
    ctx.fillStyle = '#263238';
    ctx.save();
    ctx.translate(7, -3);
    ctx.rotate(-0.3 + earTwitch);
    ctx.beginPath();
    ctx.ellipse(0, 0, 7, 3.5, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. Head Skull
    ctx.fillStyle = '#37474f';
    ctx.beginPath();
    ctx.moveTo(8, -8);
    ctx.lineTo(20, -4);
    ctx.lineTo(24, 6);
    ctx.lineTo(12, 10);
    ctx.lineTo(6, 2);
    ctx.closePath();
    ctx.fill();

    // 4. Near Horn (Front Crescent)
    ctx.strokeStyle = '#263238';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(12, -6);
    ctx.bezierCurveTo(16, -22, 0, -28, -12, -18);
    ctx.stroke();

    // Horn ridges
    ctx.strokeStyle = '#546e7a';
    ctx.lineWidth = 1.5;
    for (let r = 0; r < 4; r++) {
      const rx = 10 - r * 5;
      const ry = -12 - r * 3;
      ctx.beginPath();
      ctx.moveTo(rx - 2, ry - 3);
      ctx.lineTo(rx + 2, ry + 3);
      ctx.stroke();
    }
    // Horn light tip
    ctx.strokeStyle = '#eceff1';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(-8, -21);
    ctx.lineTo(-13, -17);
    ctx.stroke();

    // 5. Near Ear (Twitching)
    ctx.fillStyle = '#37474f';
    ctx.save();
    ctx.translate(10, 0);
    ctx.rotate(0.25 + earTwitch * 1.5);
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 4, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#78909c';
    ctx.beginPath();
    ctx.ellipse(0, 0, 5, 2, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 6. Snout & Muzzle (Chewing Motion)
    ctx.fillStyle = '#455a64';
    ctx.beginPath();
    ctx.ellipse(22 + chewX, 5 + chewY, 6, 5, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Nostrils
    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.arc(24 + chewX, 4 + chewY, 1.3, 0, Math.PI * 2);
    ctx.arc(26 + chewX, 5 + chewY, 1.3, 0, Math.PI * 2);
    ctx.fill();

    // Dangling Grass Stalk being chewed
    const grassSway = Math.sin(gameTime * 6) * 4;
    ctx.strokeStyle = '#7cb342';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(23 + chewX, 7 + chewY);
    ctx.quadraticCurveTo(27 + chewX + grassSway, 13 + chewY, 30 + chewX + grassSway, 17 + chewY);
    ctx.stroke();
    ctx.fillStyle = '#8bc34a';
    ctx.beginPath();
    ctx.ellipse(30 + chewX + grassSway, 17 + chewY, 3, 1.5, 0.5, 0, Math.PI * 2);
    ctx.fill();

    // 7. Gentle Eye
    ctx.fillStyle = '#1c252a';
    ctx.beginPath();
    ctx.ellipse(15, -1, 2.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    // Eye highlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(15.5, -1.5, 0.8, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Render Cattle Egret (Tagak) perched on Carabao's back
  private renderCattleEgret(ctx: CanvasRenderingContext2D, birdX: number, birdY: number, gameTime: number) {
    ctx.save();
    ctx.translate(birdX, birdY);

    const birdBob = Math.sin(gameTime * 2.5) * 1.2;
    const flap = Math.sin(gameTime * 5) > 0.8 ? Math.sin(gameTime * 20) * 3 : 0;

    // Thin Black Toothpick Legs
    ctx.strokeStyle = '#212121';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-2, 0);
    ctx.lineTo(-2, -6);
    ctx.moveTo(2, 0);
    ctx.lineTo(2, -6);
    ctx.stroke();

    // White Plump Body
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(0, -9 + birdBob, 5, 3.5, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Little Wing (Flapping slightly)
    ctx.fillStyle = '#f5f5f5';
    ctx.beginPath();
    ctx.ellipse(-1, -9 + birdBob - flap, 3.5, 2, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Slender S-Curved Neck & Head
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(3, -10 + birdBob);
    ctx.quadraticCurveTo(5, -14 + birdBob, 4, -17 + birdBob);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(4, -17 + birdBob, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Yellow Beak
    ctx.fillStyle = '#ffb300';
    ctx.beginPath();
    ctx.moveTo(5.5, -17.5 + birdBob);
    ctx.lineTo(9.5, -16.5 + birdBob);
    ctx.lineTo(5.5, -15.5 + birdBob);
    ctx.closePath();
    ctx.fill();

    // Eye dot
    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.arc(4.5, -17.5 + birdBob, 0.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ==========================================
  // CHICKEN & CHICKS ENGINE
  // Features: Hens pecking for seeds, strutting waddle,
  // fluffy yellow baby chicks hopping behind, & crowing proud roosters!
  // ==========================================
  private drawChicken(
    x: number,
    y: number,
    scale: number,
    facing: 'left' | 'right',
    gameTime: number,
    options: { isPecking?: boolean; hasChicks?: boolean; isRooster?: boolean } = {}
  ) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(facing === 'left' ? -scale : scale, scale);

    const waddle = Math.sin(gameTime * 4) * 0.12;
    const peckTimer = (gameTime * 2.5) % 4;
    const isPeckingNow = options.isPecking && peckTimer > 2.2;
    const peckAngle = isPeckingNow ? 0.7 + Math.sin(gameTime * 20) * 0.15 : 0;
    const step = Math.sin(gameTime * 8);

    if (options.isRooster) {
      // --- PROUD ROOSTER ---
      // 1. Tall Sturdy Orange Legs
      ctx.strokeStyle = '#ff9800';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-3, 0);
      ctx.lineTo(-3, -10);
      ctx.moveTo(3, 0);
      ctx.lineTo(3, -10);
      ctx.stroke();
      // Feet claws
      ctx.beginPath();
      ctx.moveTo(-6, 0);
      ctx.lineTo(-1, 0);
      ctx.moveTo(0, 0);
      ctx.lineTo(5, 0);
      ctx.stroke();

      // 2. Magnificent Arched Emerald/Navy Tail Feathers
      const tailFeathers = ['#004d40', '#1a237e', '#00695c', '#283593'];
      tailFeathers.forEach((col, idx) => {
        ctx.strokeStyle = col;
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(-6, -16);
        ctx.bezierCurveTo(-14 - idx * 2, -26 - idx * 3, -22 - idx * 3, -18 - idx * 2, -18 - idx * 4, -4);
        ctx.stroke();
      });

      // 3. Deep Crimson / Copper Puffed Chest Body
      const roosterGrad = ctx.createLinearGradient(-6, -22, 8, -8);
      roosterGrad.addColorStop(0, '#d84315');
      roosterGrad.addColorStop(0.6, '#b71c1c');
      roosterGrad.addColorStop(1, '#4e342e');
      ctx.fillStyle = roosterGrad;

      ctx.beginPath();
      ctx.ellipse(0, -15, 8, 6.5, -0.2, 0, Math.PI * 2);
      ctx.fill();

      // Golden Neck Hackles
      ctx.fillStyle = '#ffb300';
      ctx.beginPath();
      ctx.moveTo(3, -18);
      ctx.lineTo(7, -26);
      ctx.lineTo(10, -22);
      ctx.lineTo(6, -14);
      ctx.closePath();
      ctx.fill();

      // Head
      ctx.fillStyle = '#e65100';
      ctx.beginPath();
      ctx.arc(8, -25, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Tall Bright Red Crown / Comb
      ctx.fillStyle = '#d50000';
      ctx.beginPath();
      ctx.arc(6, -30, 2.5, 0, Math.PI * 2);
      ctx.arc(9, -31, 3, 0, Math.PI * 2);
      ctx.arc(12, -29, 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Red Wattle below beak
      ctx.fillStyle = '#d50000';
      ctx.beginPath();
      ctx.ellipse(9, -20, 2, 3.5, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Sharp Yellow Beak (Open crowing slightly)
      ctx.fillStyle = '#ffb300';
      ctx.beginPath();
      ctx.moveTo(11, -26);
      ctx.lineTo(17, -24);
      ctx.lineTo(11, -22);
      ctx.closePath();
      ctx.fill();

      // Eye
      ctx.fillStyle = '#212121';
      ctx.beginPath();
      ctx.arc(9, -26, 1, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // --- MOTHER HEN / HEN ---

      // 1. Little Orange Legs (Stepping walk)
      ctx.strokeStyle = '#ff9800';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.moveTo(-3, 0);
      ctx.lineTo(-3 + step * 1.5, -7);
      ctx.moveTo(3, 0);
      ctx.lineTo(3 - step * 1.5, -7);
      ctx.stroke();

      // 2. Fan Tail Feathers
      ctx.fillStyle = '#fff8e1';
      ctx.beginPath();
      ctx.moveTo(-6, -10);
      ctx.lineTo(-13, -16);
      ctx.lineTo(-8, -13);
      ctx.lineTo(-12, -11);
      ctx.lineTo(-6, -8);
      ctx.closePath();
      ctx.fill();

      // 3. Plump Round Body
      ctx.save();
      ctx.rotate(waddle);
      const henGrad = ctx.createLinearGradient(0, -18, 0, -4);
      henGrad.addColorStop(0, '#ffffff');
      henGrad.addColorStop(0.7, '#fff9c4');
      henGrad.addColorStop(1, '#ffe082');
      ctx.fillStyle = henGrad;

      ctx.beginPath();
      ctx.ellipse(0, -10, 7.5, 6, -0.15, 0, Math.PI * 2);
      ctx.fill();

      // Wing Feathers
      ctx.fillStyle = '#ffe082';
      ctx.beginPath();
      ctx.ellipse(-1, -9, 4.5, 3.2, -0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 4. Head with Neck (Pecking Animation)
      ctx.save();
      ctx.translate(4, -11);
      ctx.rotate(peckAngle);

      // Head ball
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(3, -5, 3.8, 0, Math.PI * 2);
      ctx.fill();

      // Small Red Comb
      ctx.fillStyle = '#e53935';
      ctx.beginPath();
      ctx.arc(2, -9, 1.6, 0, Math.PI * 2);
      ctx.arc(4, -9.5, 1.8, 0, Math.PI * 2);
      ctx.arc(6, -8.5, 1.4, 0, Math.PI * 2);
      ctx.fill();

      // Red Wattle
      ctx.fillStyle = '#e53935';
      ctx.beginPath();
      ctx.ellipse(4, -1, 1.2, 2, 0.2, 0, Math.PI * 2);
      ctx.fill();

      // Yellow Beak
      ctx.fillStyle = '#ff9800';
      ctx.beginPath();
      ctx.moveTo(5.5, -6);
      ctx.lineTo(10, -4.5);
      ctx.lineTo(5.5, -3);
      ctx.closePath();
      ctx.fill();

      // Cute Beady Eye
      ctx.fillStyle = '#212121';
      ctx.beginPath();
      ctx.arc(4, -6, 0.9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(4.3, -6.3, 0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // 5. Baby Chicks following behind Mother Hen
      if (options.hasChicks) {
        for (let c = 0; c < 3; c++) {
          const chickOffset = -14 - c * 10;
          const chickHop = Math.abs(Math.sin(gameTime * 10 + c * 1.4)) * 3;

          ctx.save();
          ctx.translate(chickOffset, -chickHop);

          // Chick Leg
          ctx.strokeStyle = '#ff9800';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, -3);
          ctx.stroke();

          // Fluffy Yellow Body
          ctx.fillStyle = '#ffee58';
          ctx.beginPath();
          ctx.arc(0, -5, 3.2, 0, Math.PI * 2);
          ctx.fill();

          // Chick Beak
          ctx.fillStyle = '#ff9800';
          ctx.beginPath();
          ctx.moveTo(2.5, -5.5);
          ctx.lineTo(5, -4.5);
          ctx.lineTo(2.5, -3.5);
          ctx.closePath();
          ctx.fill();

          // Chick Eye
          ctx.fillStyle = '#212121';
          ctx.beginPath();
          ctx.arc(1.5, -5.8, 0.6, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();
        }
      }
    }

    ctx.restore();
  }

  // Distant Village Structures (Parallax 0.25)
  private drawDistantVillageBuildings(width: number, height: number, cameraX: number, gameTime: number) {
    const distantNodes = [
      { worldX: 280, type: 'wood_house', variant: 'stilt' as const, scale: 0.42 },
      { worldX: 620, type: 'school', scale: 0.45 },
      { worldX: 980, type: 'barn', scale: 0.45 },
      { worldX: 1350, type: 'wood_house', variant: 'cottage' as const, scale: 0.42 },
      { worldX: 1720, type: 'wood_house', variant: 'stilt' as const, scale: 0.42 },
      { worldX: 2050, type: 'school', scale: 0.45 },
      { worldX: 2450, type: 'barn', scale: 0.45 },
      { worldX: 2850, type: 'wood_house', variant: 'cottage' as const, scale: 0.42 },
      { worldX: 3250, type: 'school', scale: 0.45 },
      { worldX: 3680, type: 'wood_house', variant: 'stilt' as const, scale: 0.42 },
    ];

    distantNodes.forEach(node => {
      const screenX = node.worldX - cameraX * 0.25;
      if (screenX < -150 || screenX > width + 150) return;

      const hillY = height - 190 - Math.sin(node.worldX * 0.005) * 35;

      if (node.type === 'school') {
        this.drawSchoolBuilding(screenX, hillY, node.scale, gameTime, true);
      } else if (node.type === 'wood_house') {
        this.drawWoodHouse(screenX, hillY, node.scale, gameTime, node.variant, true);
      } else if (node.type === 'barn') {
        this.drawDistantBarn(screenX, hillY, gameTime);
      }
    });
  }

  // Near Background Village Structures (High Detail along ground level)
  private drawNearVillageBuildings(width: number, height: number, cameraX: number, level: LevelConfig, gameTime: number) {
    const groundY = level.groundY;

    const nearBuildings = [
      // Stage 1 Village
      { x: 220, type: 'wood_house', variant: 'stilt' as const, scale: 0.85 },
      { x: 680, type: 'school', scale: 0.9 },
      { x: 1020, type: 'wood_house', variant: 'cottage' as const, scale: 0.82 },
      { x: 1650, type: 'wood_house', variant: 'veranda' as const, scale: 0.88 },
      { x: 2100, type: 'school', scale: 0.92 },
      { x: 2480, type: 'wood_house', variant: 'stilt' as const, scale: 0.85 },

      // Stage 2 / 3 Extended areas
      { x: 2850, type: 'wood_house', variant: 'cottage' as const, scale: 0.85 },
      { x: 3200, type: 'school', scale: 0.9 },
      { x: 3550, type: 'wood_house', variant: 'veranda' as const, scale: 0.88 },
      { x: 3950, type: 'wood_house', variant: 'stilt' as const, scale: 0.85 },
    ];

    nearBuildings.forEach(item => {
      const screenX = item.x - cameraX;
      if (screenX < -220 || screenX > width + 220) return;

      if (item.type === 'school') {
        this.drawSchoolBuilding(screenX, groundY, item.scale, gameTime, false);
      } else if (item.type === 'wood_house') {
        this.drawWoodHouse(screenX, groundY, item.scale, gameTime, item.variant, false);
      }
    });
  }

  // ==========================================
  // SCHOOL BUILDING ENGINE (GREEN ROOF)
  // Features: Gabled corrugated green roof, school bell cupola,
  // flagpole with waving flag, multipane capiz windows, double entrance doors
  // ==========================================
  private drawSchoolBuilding(
    x: number,
    y: number,
    scale: number,
    gameTime: number,
    isDistant: boolean = false
  ) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    if (isDistant) {
      ctx.globalAlpha = 0.65;
    }

    const bWidth = 140;
    const bHeight = 65;
    const halfW = bWidth / 2;

    // 1. Schoolyard Flagpole with Waving Flag (Left side)
    const poleX = -halfW - 20;
    ctx.strokeStyle = isDistant ? '#9e9e9e' : '#b0bec5';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(poleX, 0);
    ctx.lineTo(poleX, -100);
    ctx.stroke();

    // Gold finial sphere on top
    ctx.fillStyle = '#ffc107';
    ctx.beginPath();
    ctx.arc(poleX, -100, 3, 0, Math.PI * 2);
    ctx.fill();

    // Waving Flag (Dynamic sine wave animation)
    const wave = Math.sin(gameTime * 5.5);
    const flagW = 26;
    const flagH = 16;
    const flagTopY = -98;

    // Flag background & stripes
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(poleX, flagTopY);
    ctx.quadraticCurveTo(poleX + flagW * 0.5, flagTopY + wave * 3, poleX + flagW, flagTopY + wave * 2);
    ctx.lineTo(poleX + flagW, flagTopY + flagH + wave * 2);
    ctx.quadraticCurveTo(poleX + flagW * 0.5, flagTopY + flagH + wave * 3, poleX, flagTopY + flagH);
    ctx.closePath();
    ctx.clip();

    // Top Blue Stripe
    ctx.fillStyle = '#0288d1';
    ctx.fillRect(poleX, flagTopY - 4, flagW + 5, flagH * 0.5 + 4);
    // Bottom Red Stripe
    ctx.fillStyle = '#d32f2f';
    ctx.fillRect(poleX, flagTopY + flagH * 0.5, flagW + 5, flagH * 0.5 + 4);
    // Hoist White Triangle
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(poleX, flagTopY);
    ctx.lineTo(poleX + flagW * 0.45, flagTopY + flagH * 0.5);
    ctx.lineTo(poleX, flagTopY + flagH);
    ctx.closePath();
    ctx.fill();
    // Yellow Golden Sun in Triangle
    ctx.fillStyle = '#ffb300';
    ctx.beginPath();
    ctx.arc(poleX + flagW * 0.18, flagTopY + flagH * 0.5, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 2. Concrete / Stone Foundation & Welcome Steps
    ctx.fillStyle = '#78909c';
    ctx.fillRect(-halfW - 4, -8, bWidth + 8, 8);
    // Entrance Steps (Center)
    ctx.fillStyle = '#b0bec5';
    ctx.fillRect(-18, -6, 36, 6);
    ctx.fillStyle = '#cfd8dc';
    ctx.fillRect(-15, -3, 30, 3);

    // 3. School Main Walls (Warm Cream / Pale Yellow Classic Schoolhouse)
    const wallGrad = ctx.createLinearGradient(0, -bHeight, 0, 0);
    wallGrad.addColorStop(0, '#fffde7');
    wallGrad.addColorStop(0.7, '#fff9c4');
    wallGrad.addColorStop(1, '#fff59d');
    ctx.fillStyle = wallGrad;
    ctx.fillRect(-halfW, -bHeight, bWidth, bHeight);

    // Wall wood trim lines & base wainscoting
    ctx.fillStyle = '#5d4037';
    ctx.fillRect(-halfW, -14, bWidth, 6); // Base wainscot
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 1;
    for (let l = -bHeight + 10; l < -14; l += 8) {
      ctx.beginPath();
      ctx.moveTo(-halfW, l);
      ctx.lineTo(halfW, l);
      ctx.stroke();
    }

    // 4. Large Multi-Pane Windows (2 on Left, 2 on Right)
    const winY = -48;
    const winW = 18;
    const winH = 24;
    const winPositions = [-halfW + 12, -halfW + 36, halfW - 54, halfW - 30];

    winPositions.forEach(wx => {
      // White Wood Outer Frame
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(wx - 2, winY - 2, winW + 4, winH + 4);
      // Window glass (Sky blue with glass gradient)
      const glassGrad = ctx.createLinearGradient(wx, winY, wx + winW, winY + winH);
      glassGrad.addColorStop(0, '#81d4fa');
      glassGrad.addColorStop(0.6, '#4fc3f7');
      glassGrad.addColorStop(1, '#0288d1');
      ctx.fillStyle = glassGrad;
      ctx.fillRect(wx, winY, winW, winH);

      // White Window Grid / Mullions (Capiz grid style)
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      // Vertical divider
      ctx.beginPath();
      ctx.moveTo(wx + winW / 2, winY);
      ctx.lineTo(wx + winW / 2, winY + winH);
      ctx.stroke();
      // Horizontal dividers
      ctx.beginPath();
      ctx.moveTo(wx, winY + winH * 0.33);
      ctx.lineTo(wx + winW, winY + winH * 0.33);
      ctx.moveTo(wx, winY + winH * 0.66);
      ctx.lineTo(wx + winW, winY + winH * 0.66);
      ctx.stroke();

      // Sun reflection sheen
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.moveTo(wx, winY);
      ctx.lineTo(wx + winW * 0.6, winY);
      ctx.lineTo(wx, winY + winH * 0.6);
      ctx.closePath();
      ctx.fill();
    });

    // 5. Entrance Double Doors & Pillars (Center)
    ctx.fillStyle = '#4e342e';
    ctx.fillRect(-12, -42, 24, 34);
    // Door panels
    ctx.fillStyle = '#6d4c41';
    ctx.fillRect(-10, -40, 9, 30);
    ctx.fillRect(1, -40, 9, 30);
    // Brass door knobs
    ctx.fillStyle = '#ffc107';
    ctx.beginPath();
    ctx.arc(-2, -25, 1.2, 0, Math.PI * 2);
    ctx.arc(3, -25, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // White Entrance Portico Pillars
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-16, -48, 3.5, 40);
    ctx.fillRect(12.5, -48, 3.5, 40);
    // Portico awning
    ctx.fillStyle = '#2e7d32';
    ctx.fillRect(-18, -50, 36, 4);

    // 6. Signboard: "ELEMENTARY SCHOOL"
    ctx.fillStyle = '#3e2723';
    ctx.fillRect(-28, -60, 56, 9);
    ctx.fillStyle = '#ffeb3b';
    ctx.font = 'bold 5.5px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ELEMENTARY SCHOOL', 0, -53.5);

    // 7. ICONIC VIBRANT GREEN GABLED ROOF (Corrugated Ridges & Wide Eaves)
    const roofOverhang = 12;
    const roofPeakY = -bHeight - 26;
    const roofEavesY = -bHeight + 2;

    // Roof Body Gradient (Deep forest green into vibrant emerald green)
    const roofGrad = ctx.createLinearGradient(0, roofPeakY, 0, roofEavesY);
    roofGrad.addColorStop(0, '#66bb6a'); // Bright sunlit ridge
    roofGrad.addColorStop(0.25, '#43a047');
    roofGrad.addColorStop(0.65, '#2e7d32'); // Rich Philippine school green
    roofGrad.addColorStop(1, '#1b5e20'); // Deep shadow eaves

    ctx.fillStyle = roofGrad;
    ctx.beginPath();
    ctx.moveTo(0, roofPeakY);
    ctx.lineTo(halfW + roofOverhang, roofEavesY);
    ctx.lineTo(-halfW - roofOverhang, roofEavesY);
    ctx.closePath();
    ctx.fill();

    // Corrugated Roof Ridge Highlights & Texture
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 1.2;
    const roofLeft = -halfW - roofOverhang;
    const roofRight = halfW + roofOverhang;
    for (let rx = roofLeft + 8; rx < roofRight - 8; rx += 7) {
      ctx.beginPath();
      // Ray from ridge to eaves
      const t = (rx - roofLeft) / (roofRight - roofLeft);
      const startX = (t - 0.5) * 16;
      ctx.moveTo(startX, roofPeakY + 4);
      ctx.lineTo(rx, roofEavesY);
      ctx.stroke();
    }

    // Fascia Board / White Eaves Trim
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-halfW - roofOverhang, roofEavesY);
    ctx.lineTo(0, roofPeakY);
    ctx.lineTo(halfW + roofOverhang, roofEavesY);
    ctx.stroke();

    // 8. School Bell Tower / Belfry Cupola (Top of Roof)
    const belfryW = 18;
    const belfryH = 20;
    const belfryY = roofPeakY - 8;

    // Belfry Base Box
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-belfryW / 2, belfryY - belfryH + 6, belfryW, belfryH - 6);

    // Belfry Arch Opening
    ctx.fillStyle = '#212121';
    ctx.beginPath();
    ctx.arc(0, belfryY - 6, 4.5, Math.PI, 0);
    ctx.lineTo(4.5, belfryY);
    ctx.lineTo(-4.5, belfryY);
    ctx.closePath();
    ctx.fill();

    // Brass School Bell inside
    ctx.fillStyle = '#ffb300';
    ctx.beginPath();
    ctx.arc(0, belfryY - 7, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd54f';
    ctx.fillRect(-3, -belfryY + belfryY - 6, 6, 2);

    // Little Green Roof Cap on Belfry
    ctx.fillStyle = '#2e7d32';
    ctx.beginPath();
    ctx.moveTo(0, belfryY - belfryH);
    ctx.lineTo(belfryW / 2 + 3, belfryY - belfryH + 6);
    ctx.lineTo(-belfryW / 2 - 3, belfryY - belfryH + 6);
    ctx.closePath();
    ctx.fill();

    // Little Golden Weathervane / Cross on top
    ctx.strokeStyle = '#ffc107';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, belfryY - belfryH);
    ctx.lineTo(0, belfryY - belfryH - 6);
    ctx.moveTo(-3, belfryY - belfryH - 4);
    ctx.lineTo(3, belfryY - belfryH - 4);
    ctx.stroke();

    // 9. Schoolyard Garden Flowerbeds & Shrubs
    if (!isDistant) {
      // Left flowerbed
      ctx.fillStyle = '#388e3c';
      ctx.beginPath();
      ctx.ellipse(-halfW + 15, -2, 16, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      // Colorful red gumamela/hibiscus flowers
      const flowerColors = ['#e91e63', '#f44336', '#ffeb3b', '#ff9800'];
      flowerColors.forEach((fc, fi) => {
        ctx.fillStyle = fc;
        ctx.beginPath();
        ctx.arc(-halfW + 6 + fi * 6, -4 - (fi % 2) * 2, 2.2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Right flowerbed
      ctx.fillStyle = '#388e3c';
      ctx.beginPath();
      ctx.ellipse(halfW - 15, -2, 16, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      flowerColors.reverse().forEach((fc, fi) => {
        ctx.fillStyle = fc;
        ctx.beginPath();
        ctx.arc(halfW - 24 + fi * 6, -4 - ((fi + 1) % 2) * 2, 2.2, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    ctx.restore();
  }

  // ==========================================
  // WOOD HOUSE ENGINE (BAHAY NA KAHOY / STILT HOMES)
  // Features: Solid timber plank walls, wooden stilts with stairs/ladder,
  // sliding capiz windows, bamboo verandas, thatched/tin roofs, earthen water jars
  // ==========================================
  private drawWoodHouse(
    x: number,
    y: number,
    scale: number,
    gameTime: number,
    variant: 'stilt' | 'cottage' | 'veranda' = 'stilt',
    isDistant: boolean = false
  ) {
    const ctx = this.ctx;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    if (isDistant) {
      ctx.globalAlpha = 0.65;
    }

    const hWidth = 85;
    const hHeight = 50;
    const halfW = hWidth / 2;

    if (variant === 'stilt') {
      // --- TRADITIONAL STILT WOOD HOUSE (BAHAY KUBO / BAHAY NA KAHOY) ---
      const stiltH = 22;
      const floorY = -stiltH;
      const wallTopY = floorY - hHeight;

      // 1. Heavy Timber Stilt Posts with Stone Foundation Footings
      ctx.fillStyle = '#3e2723';
      const stiltPositions = [-halfW + 6, -halfW + 28, halfW - 28, halfW - 6];
      stiltPositions.forEach(sx => {
        // Wooden Post
        ctx.fillRect(sx - 2.5, floorY, 5, stiltH);
        // Stone footing block
        ctx.fillStyle = '#78909c';
        ctx.fillRect(sx - 4, -4, 8, 4);
        ctx.fillStyle = '#3e2723';
      });

      // Diagonal cross-bracing between stilts
      ctx.strokeStyle = '#4e342e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-halfW + 6, floorY + 4);
      ctx.lineTo(-halfW + 28, -4);
      ctx.moveTo(-halfW + 28, floorY + 4);
      ctx.lineTo(-halfW + 6, -4);
      ctx.stroke();

      // Undercroft Items: Stacked Firewood & Clay Pots
      ctx.fillStyle = '#5d4037';
      for (let f = 0; f < 3; f++) {
        ctx.fillRect(2, -4 - f * 4, 18, 3.5);
      }
      // Earthen Jar (Banga)
      ctx.fillStyle = '#a1887f';
      ctx.beginPath();
      ctx.ellipse(-12, -6, 5, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Raised Wooden Stairs / Ladder (Right side)
      const stairX = halfW - 12;
      ctx.strokeStyle = '#5d4037';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(stairX, floorY);
      ctx.lineTo(stairX + 16, 0);
      ctx.moveTo(stairX + 8, floorY);
      ctx.lineTo(stairX + 24, 0);
      ctx.stroke();
      // Steps / Rungs
      ctx.lineWidth = 2;
      for (let s = 1; s <= 4; s++) {
        const t = s / 5;
        ctx.beginPath();
        ctx.moveTo(stairX + t * 16, floorY + t * stiltH);
        ctx.lineTo(stairX + 8 + t * 16, floorY + t * stiltH);
        ctx.stroke();
      }

      // 3. Bamboo Floor Beam & Balcony
      ctx.fillStyle = '#6d4c41';
      ctx.fillRect(-halfW - 4, floorY - 3, hWidth + 8, 5);

      // 4. Wooden Plank Siding Walls
      const woodGrad = ctx.createLinearGradient(0, wallTopY, 0, floorY);
      woodGrad.addColorStop(0, '#8d6e63');
      woodGrad.addColorStop(0.5, '#6d4c41');
      woodGrad.addColorStop(1, '#4e342e');
      ctx.fillStyle = woodGrad;
      ctx.fillRect(-halfW, wallTopY, hWidth, hHeight);

      // Horizontal wood planks & grain lines
      ctx.strokeStyle = '#3e2723';
      ctx.lineWidth = 1;
      for (let py = wallTopY + 6; py < floorY; py += 6) {
        ctx.beginPath();
        ctx.moveTo(-halfW, py);
        ctx.lineTo(halfW, py);
        ctx.stroke();
      }

      // 5. Sliding Capiz Windows propped open with Bamboo Sticks
      const winW = 20;
      const winH = 20;
      const winY = wallTopY + 12;
      const winPositions = [-halfW + 10, -halfW + 38];

      winPositions.forEach(wx => {
        // Window opening (Dark room interior)
        ctx.fillStyle = '#212121';
        ctx.fillRect(wx, winY, winW, winH);

        // Propped Awning Shutter (Pushed out upwards with bamboo rod)
        ctx.save();
        ctx.translate(wx, winY);
        ctx.rotate(-0.35); // Propped open angle
        ctx.fillStyle = '#a1887f';
        ctx.fillRect(0, -2, winW, winH);
        // Capiz lattice grid
        ctx.strokeStyle = '#efebe9';
        ctx.lineWidth = 1;
        for (let g = 4; g < winW; g += 5) {
          ctx.beginPath();
          ctx.moveTo(g, 0);
          ctx.lineTo(g, winH);
          ctx.stroke();
        }
        for (let g = 4; g < winH; g += 5) {
          ctx.beginPath();
          ctx.moveTo(0, g);
          ctx.lineTo(winW, g);
          ctx.stroke();
        }
        ctx.restore();

        // Bamboo prop stick
        ctx.strokeStyle = '#8bc34a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(wx + winW / 2, winY + winH);
        ctx.lineTo(wx + winW / 2 + 5, winY + winH * 0.3);
        ctx.stroke();
      });

      // Front Door (Wood Slats)
      ctx.fillStyle = '#3e2723';
      ctx.fillRect(halfW - 22, wallTopY + 10, 16, hHeight - 10);
      ctx.fillStyle = '#ffb300';
      ctx.beginPath();
      ctx.arc(halfW - 8, wallTopY + 28, 1, 0, Math.PI * 2);
      ctx.fill();

      // 6. Thatched / Timber Gabled Roof with Wide Overhang
      const roofPeakY = wallTopY - 24;
      const roofOverhang = 10;

      const roofGrad = ctx.createLinearGradient(0, roofPeakY, 0, wallTopY);
      roofGrad.addColorStop(0, '#d7ccc8');
      roofGrad.addColorStop(0.4, '#a1887f');
      roofGrad.addColorStop(1, '#5d4037');
      ctx.fillStyle = roofGrad;

      ctx.beginPath();
      ctx.moveTo(0, roofPeakY);
      ctx.lineTo(halfW + roofOverhang, wallTopY + 3);
      ctx.lineTo(-halfW - roofOverhang, wallTopY + 3);
      ctx.closePath();
      ctx.fill();

      // Thatch texture lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 1.2;
      for (let tx = -halfW - roofOverhang + 5; tx < halfW + roofOverhang - 5; tx += 6) {
        ctx.beginPath();
        ctx.moveTo(tx * 0.3, roofPeakY + 2);
        ctx.lineTo(tx, wallTopY + 3);
        ctx.stroke();
      }

      // Hanging Orchid / Fern on balcony
      ctx.fillStyle = '#4caf50';
      ctx.beginPath();
      ctx.arc(-halfW - 2, floorY + 4, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#e91e63';
      ctx.beginPath();
      ctx.arc(-halfW - 2, floorY + 6, 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // --- RURAL WOOD COTTAGE / VERANDA VILLA ---
      const wallTopY = -hHeight;

      // Foundation
      ctx.fillStyle = '#78909c';
      ctx.fillRect(-halfW - 2, -6, hWidth + 4, 6);

      // Wood plank walls
      const woodGrad = ctx.createLinearGradient(0, wallTopY, 0, 0);
      woodGrad.addColorStop(0, '#a1887f');
      woodGrad.addColorStop(0.5, '#8d6e63');
      woodGrad.addColorStop(1, '#5d4037');
      ctx.fillStyle = woodGrad;
      ctx.fillRect(-halfW, wallTopY, hWidth, hHeight);

      // Planks
      ctx.strokeStyle = '#4e342e';
      ctx.lineWidth = 1;
      for (let py = wallTopY + 6; py < 0; py += 6) {
        ctx.beginPath();
        ctx.moveTo(-halfW, py);
        ctx.lineTo(halfW, py);
        ctx.stroke();
      }

      // Windows with White Trim & Flower Boxes
      const winW = 16;
      const winH = 18;
      [-halfW + 10, halfW - 26].forEach(wx => {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(wx - 1.5, wallTopY + 12 - 1.5, winW + 3, winH + 3);
        ctx.fillStyle = '#81d4fa';
        ctx.fillRect(wx, wallTopY + 12, winW, winH);
        // Grid
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(wx + winW / 2, wallTopY + 12);
        ctx.lineTo(wx + winW / 2, wallTopY + 12 + winH);
        ctx.moveTo(wx, wallTopY + 12 + winH / 2);
        ctx.lineTo(wx + winW, wallTopY + 12 + winH / 2);
        ctx.stroke();
        // Flower Box
        ctx.fillStyle = '#5d4037';
        ctx.fillRect(wx - 2, wallTopY + 12 + winH, winW + 4, 4);
        ctx.fillStyle = '#e91e63';
        ctx.beginPath();
        ctx.arc(wx + 2, wallTopY + 12 + winH, 2, 0, Math.PI * 2);
        ctx.arc(wx + 7, wallTopY + 12 + winH, 2, 0, Math.PI * 2);
        ctx.arc(wx + 12, wallTopY + 12 + winH, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Center Door
      ctx.fillStyle = '#3e2723';
      ctx.fillRect(-10, wallTopY + 14, 20, hHeight - 14);
      ctx.fillStyle = '#ffc107';
      ctx.beginPath();
      ctx.arc(6, wallTopY + 32, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Gabled Roof
      const roofPeakY = wallTopY - 22;
      const roofOverhang = 8;
      ctx.fillStyle = '#8d6e63';
      ctx.beginPath();
      ctx.moveTo(0, roofPeakY);
      ctx.lineTo(halfW + roofOverhang, wallTopY + 2);
      ctx.lineTo(-halfW - roofOverhang, wallTopY + 2);
      ctx.closePath();
      ctx.fill();

      // Chimney
      ctx.fillStyle = '#b0bec5';
      ctx.fillRect(halfW - 18, roofPeakY - 6, 8, 16);
      ctx.fillStyle = '#78909c';
      ctx.fillRect(halfW - 20, roofPeakY - 8, 12, 3);
    }

    ctx.restore();
  }

  private drawDistantBarn(x: number, y: number, gameTime: number) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = 'rgba(140, 70, 50, 0.45)';
    // Barn body
    ctx.fillRect(x, y - 40, 50, 40);
    // Roof
    ctx.beginPath();
    ctx.moveTo(x - 5, y - 40);
    ctx.lineTo(x + 25, y - 60);
    ctx.lineTo(x + 55, y - 40);
    ctx.closePath();
    ctx.fill();

    // Silo next to barn
    ctx.fillStyle = 'rgba(160, 160, 170, 0.45)';
    ctx.fillRect(x + 55, y - 55, 18, 55);
    ctx.beginPath();
    ctx.arc(x + 64, y - 55, 9, Math.PI, 0);
    ctx.fill();

    // Distant Windmill spinning
    const wmX = x + 110;
    const wmY = y - 50;
    ctx.strokeStyle = 'rgba(110, 80, 60, 0.45)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(wmX - 8, y);
    ctx.lineTo(wmX, wmY);
    ctx.lineTo(wmX + 8, y);
    ctx.stroke();

    // Blades
    const rot = gameTime * 1.5;
    ctx.lineWidth = 2;
    for (let b = 0; b < 4; b++) {
      const bAngle = rot + (b * Math.PI) / 2;
      ctx.beginPath();
      ctx.moveTo(wmX, wmY);
      ctx.lineTo(wmX + Math.cos(bAngle) * 22, wmY + Math.sin(bAngle) * 22);
      ctx.stroke();
    }

    ctx.restore();
  }

  private drawFluffyCloud(x: number, y: number, scale: number, color: string) {
    const ctx = this.ctx;
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, 22 * scale, 0, Math.PI * 2);
    ctx.arc(x + 25 * scale, y - 10 * scale, 28 * scale, 0, Math.PI * 2);
    ctx.arc(x + 55 * scale, y - 5 * scale, 24 * scale, 0, Math.PI * 2);
    ctx.arc(x + 75 * scale, y + 5 * scale, 18 * scale, 0, Math.PI * 2);
    ctx.arc(x + 35 * scale, y + 12 * scale, 22 * scale, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Draw the ground terrain and pits
  public drawGround(level: LevelConfig, cameraX: number, viewportWidth: number, viewportHeight: number) {
    const ctx = this.ctx;
    const groundY = level.groundY;

    level.groundSegments.forEach((seg, idx) => {
      const screenX = seg.x - cameraX;
      // Skip if offscreen
      if (screenX + seg.width < -50 || screenX > viewportWidth + 50) return;

      ctx.save();

      // Deep soil fill
      const groundGrad = ctx.createLinearGradient(0, groundY, 0, viewportHeight);
      groundGrad.addColorStop(0, level.theme.groundColor);
      groundGrad.addColorStop(1, '#5c3818');
      ctx.fillStyle = groundGrad;
      ctx.fillRect(screenX, groundY, seg.width, viewportHeight - groundY);

      // Grass / Dry turf layer on top
      ctx.fillStyle = level.theme.groundGrassColor;
      ctx.fillRect(screenX, groundY, seg.width, 16);

      // Little tufts and cracks in ground
      ctx.fillStyle = '#4d6e24';
      for (let tx = 0; tx < seg.width; tx += 28) {
        ctx.beginPath();
        ctx.moveTo(screenX + tx, groundY);
        ctx.lineTo(screenX + tx + 6, groundY - 6);
        ctx.lineTo(screenX + tx + 12, groundY);
        ctx.fill();
      }

      // Soil texture / pebbles
      ctx.fillStyle = 'rgba(60, 35, 15, 0.3)';
      for (let px = 20; px < seg.width - 20; px += 45) {
        ctx.fillRect(screenX + px, groundY + 30 + (px % 35), 8, 5);
        ctx.fillRect(screenX + px + 15, groundY + 65 + (px % 25), 10, 6);
      }

      // Edge of pit cliff shading
      if (idx > 0 && seg.hasPitBefore) {
        // Left cliff wall
        ctx.fillStyle = '#3a200e';
        ctx.fillRect(screenX, groundY, 12, viewportHeight - groundY);
        // Warning post
        this.drawHazardSign(screenX + 15, groundY - 35);
      }
      // Right edge cliff
      if (idx < level.groundSegments.length - 1) {
        ctx.fillStyle = '#3a200e';
        ctx.fillRect(screenX + seg.width - 12, groundY, 12, viewportHeight - groundY);
        this.drawHazardSign(screenX + seg.width - 30, groundY - 35);
      }

      ctx.restore();
    });
  }

  private drawHazardSign(x: number, y: number) {
    const ctx = this.ctx;
    ctx.save();
    // Post
    ctx.fillStyle = '#78471c';
    ctx.fillRect(x + 5, y + 15, 6, 20);
    // Yellow warning triangle
    ctx.fillStyle = '#f5b027';
    ctx.beginPath();
    ctx.moveTo(x + 8, y);
    ctx.lineTo(x + 22, y + 20);
    ctx.lineTo(x - 6, y + 20);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#222';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Exclamation mark
    ctx.fillStyle = '#111';
    ctx.fillRect(x + 7, y + 6, 2, 8);
    ctx.fillRect(x + 7, y + 16, 2, 2);
    ctx.restore();
  }

  // Draw Platforms
  public drawPlatforms(platforms: Platform[], cameraX: number, gameTime: number) {
    const ctx = this.ctx;

    platforms.forEach(p => {
      const screenX = p.x - cameraX;
      ctx.save();

      if (p.type === 'wood' || p.type === 'moving') {
        // Wood Plank
        ctx.fillStyle = p.type === 'moving' ? '#a36329' : '#8c4e1f';
        ctx.fillRect(screenX, p.y, p.width, p.height);

        // Top highlight
        ctx.fillStyle = '#c78248';
        ctx.fillRect(screenX, p.y, p.width, 4);

        // Wood grain & nails
        ctx.fillStyle = '#4a2509';
        ctx.fillRect(screenX + 8, p.y + 7, 4, 4);
        ctx.fillRect(screenX + p.width - 12, p.y + 7, 4, 4);
        ctx.fillRect(screenX + p.width / 2, p.y + 7, 4, 4);

        // Moving platform indicator arrows
        if (p.type === 'moving') {
          ctx.fillStyle = '#ffde59';
          const pulse = Math.sin(gameTime * 5) * 3;
          ctx.beginPath();
          ctx.moveTo(screenX + p.width / 2 - 12 + pulse, p.y + 10);
          ctx.lineTo(screenX + p.width / 2 - 6 + pulse, p.y + 6);
          ctx.lineTo(screenX + p.width / 2 - 6 + pulse, p.y + 14);
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(screenX + p.width / 2 + 12 - pulse, p.y + 10);
          ctx.lineTo(screenX + p.width / 2 + 6 - pulse, p.y + 6);
          ctx.lineTo(screenX + p.width / 2 + 6 - pulse, p.y + 14);
          ctx.fill();
        }
      } else if (p.type === 'hay') {
        // Hay bale
        ctx.fillStyle = '#deb837';
        ctx.fillRect(screenX, p.y, p.width, p.height);
        // Straw texture
        ctx.fillStyle = '#c29a21';
        ctx.fillRect(screenX, p.y, p.width, 4);
        ctx.fillStyle = '#8a6507';
        // Strings binding the hay bale
        ctx.fillRect(screenX + p.width * 0.25, p.y, 4, p.height);
        ctx.fillRect(screenX + p.width * 0.75, p.y, 4, p.height);
      } else if (p.type === 'stone') {
        // Stone slab
        ctx.fillStyle = '#7a7e85';
        ctx.fillRect(screenX, p.y, p.width, p.height);
        ctx.fillStyle = '#a6acb5';
        ctx.fillRect(screenX, p.y, p.width, 4);
        ctx.fillStyle = '#4f5257';
        ctx.fillRect(screenX + 20, p.y + 8, 25, 4);
        ctx.fillRect(screenX + p.width - 35, p.y + 12, 18, 3);
      } else if (p.type === 'cloud') {
        // Floating cloud platform
        ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        const r = p.height / 2;
        ctx.beginPath();
        ctx.roundRect(screenX, p.y, p.width, p.height, r);
        ctx.fill();
        ctx.strokeStyle = '#cbe4fc';
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      ctx.restore();
    });
  }

  // Draw Obstacles (Trees, Walls, Rocks, Cacti)
  public drawObstacles(obstacles: Obstacle[], cameraX: number) {
    const ctx = this.ctx;

    obstacles.forEach(obs => {
      const screenX = obs.x - cameraX;
      ctx.save();

      if (obs.type === 'tree') {
        // Apple / Farm Tree
        const trunkW = 20;
        const trunkX = screenX + obs.width / 2 - trunkW / 2;
        ctx.fillStyle = '#6e3f1b';
        ctx.fillRect(trunkX, obs.y + 35, trunkW, obs.height - 35);

        // Canopy foliage
        ctx.fillStyle = '#3e8e2b';
        ctx.beginPath();
        ctx.arc(screenX + obs.width / 2, obs.y + 30, 38, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#52b03a';
        ctx.beginPath();
        ctx.arc(screenX + obs.width / 2 - 12, obs.y + 22, 24, 0, Math.PI * 2);
        ctx.arc(screenX + obs.width / 2 + 14, obs.y + 24, 22, 0, Math.PI * 2);
        ctx.fill();

        // Red Apples
        ctx.fillStyle = '#e82525';
        ctx.beginPath();
        ctx.arc(screenX + obs.width / 2 - 10, obs.y + 25, 4, 0, Math.PI * 2);
        ctx.arc(screenX + obs.width / 2 + 12, obs.y + 18, 4, 0, Math.PI * 2);
        ctx.arc(screenX + obs.width / 2 + 4, obs.y + 38, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (obs.type === 'wall') {
        // Brick / Stone Wall
        ctx.fillStyle = '#8f4633';
        ctx.fillRect(screenX, obs.y, obs.width, obs.height);

        // Brick lines
        ctx.strokeStyle = '#57271c';
        ctx.lineWidth = 2;
        for (let row = 0; row < obs.height; row += 16) {
          ctx.beginPath();
          ctx.moveTo(screenX, obs.y + row);
          ctx.lineTo(screenX + obs.width, obs.y + row);
          ctx.stroke();

          const offset = (row / 16) % 2 === 0 ? 0 : 15;
          for (let col = offset; col < obs.width; col += 30) {
            ctx.beginPath();
            ctx.moveTo(screenX + col, obs.y + row);
            ctx.lineTo(screenX + col, obs.y + row + 16);
            ctx.stroke();
          }
        }
        // Top coping stone
        ctx.fillStyle = '#ba654e';
        ctx.fillRect(screenX - 2, obs.y, obs.width + 4, 6);
      } else if (obs.type === 'rock') {
        // Boulder
        ctx.fillStyle = '#6b7280';
        ctx.beginPath();
        ctx.ellipse(screenX + obs.width / 2, obs.y + obs.height / 2 + 4, obs.width / 2, obs.height / 2 - 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = '#9ca3af';
        ctx.beginPath();
        ctx.ellipse(screenX + obs.width / 2 - 6, obs.y + obs.height / 2 - 4, obs.width / 3.5, obs.height / 4, -0.3, 0, Math.PI * 2);
        ctx.fill();
      } else if (obs.type === 'cactus') {
        // Prickly Cactus Hazard
        ctx.fillStyle = '#2f7d32';
        // Main stem
        ctx.fillRect(screenX + obs.width / 2 - 8, obs.y + 6, 16, obs.height - 6);
        ctx.beginPath();
        ctx.arc(screenX + obs.width / 2, obs.y + 6, 8, Math.PI, 0);
        ctx.fill();

        // Left arm
        ctx.fillRect(screenX + 2, obs.y + 24, 10, 8);
        ctx.fillRect(screenX + 2, obs.y + 14, 8, 14);
        ctx.beginPath();
        ctx.arc(screenX + 6, obs.y + 14, 4, Math.PI, 0);
        ctx.fill();

        // Right arm
        ctx.fillRect(screenX + obs.width - 12, obs.y + 32, 10, 8);
        ctx.fillRect(screenX + obs.width - 8, obs.y + 20, 8, 16);
        ctx.beginPath();
        ctx.arc(screenX + obs.width - 4, obs.y + 20, 4, Math.PI, 0);
        ctx.fill();

        // Prickly needles
        ctx.fillStyle = '#ffeb3b';
        for (let ny = obs.y + 12; ny < obs.y + obs.height - 8; ny += 10) {
          ctx.fillRect(screenX + obs.width / 2 - 11, ny, 3, 2);
          ctx.fillRect(screenX + obs.width / 2 + 8, ny, 3, 2);
        }
      }

      ctx.restore();
    });
  }

  // Draw Collectible Water Drops (Glossy, Bubbly, Adorable Cartoon Dewdrops)
  public drawDrops(drops: WaterDrop[], cameraX: number, gameTime: number) {
    const ctx = this.ctx;

    drops.forEach(drop => {
      if (drop.collected) return;

      const screenX = drop.x - cameraX;
      // Skip offscreen drops
      if (screenX < -50 || screenX > ctx.canvas.width + 50) return;

      const bobY = drop.y + Math.sin(gameTime * 4.5 + drop.floatOffset) * 5;
      const wobble = Math.sin(gameTime * 6 + drop.floatOffset) * 0.08;
      const centerX = screenX + drop.width / 2;
      const centerY = bobY + drop.height / 2;

      ctx.save();

      // Soft Cartoon Drop Shadow on Ground
      ctx.fillStyle = 'rgba(15, 23, 42, 0.18)';
      ctx.beginPath();
      ctx.ellipse(centerX, drop.y + drop.height + 6, drop.width * 0.45, 3, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.translate(centerX, centerY);
      ctx.rotate(wobble);

      if (drop.isGolden) {
        // --- GOLDEN DEWDROP (Sparkling Amber-Gold Gem) ---
        const pulse = Math.sin(gameTime * 6 + drop.floatOffset) * 3;

        // Golden Radial Halo
        const glow = ctx.createRadialGradient(0, 0, 3, 0, 0, 22 + pulse);
        glow.addColorStop(0, 'rgba(255, 235, 59, 0.85)');
        glow.addColorStop(0.5, 'rgba(255, 179, 0, 0.35)');
        glow.addColorStop(1, 'rgba(255, 179, 0, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, 22 + pulse, 0, Math.PI * 2);
        ctx.fill();

        // Golden Teardrop Body with Cel-Shaded Gradient
        const goldGrad = ctx.createLinearGradient(0, -drop.height / 2, 0, drop.height / 2);
        goldGrad.addColorStop(0, '#fff59d');
        goldGrad.addColorStop(0.3, '#fbc02d');
        goldGrad.addColorStop(0.75, '#f57f17');
        goldGrad.addColorStop(1, '#e65100');
        ctx.fillStyle = goldGrad;

        ctx.beginPath();
        ctx.moveTo(0, -drop.height / 2);
        ctx.bezierCurveTo(drop.width * 0.65, -drop.height * 0.1, drop.width * 0.65, drop.height / 2, 0, drop.height / 2);
        ctx.bezierCurveTo(-drop.width * 0.65, drop.height / 2, -drop.width * 0.65, -drop.height * 0.1, 0, -drop.height / 2);
        ctx.fill();

        // Crisp Cartoon Outline
        ctx.strokeStyle = '#b78103';
        ctx.lineWidth = 1.8;
        ctx.stroke();

        // Cute Smiling Face on Golden Drop
        ctx.fillStyle = '#3e2723';
        ctx.beginPath();
        ctx.arc(-3, 1, 1.6, 0, Math.PI * 2);
        ctx.arc(3, 1, 1.6, 0, Math.PI * 2);
        ctx.fill();

        // Eye glimmers
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-3.5, 0.5, 0.6, 0, Math.PI * 2);
        ctx.arc(2.5, 0.5, 0.6, 0, Math.PI * 2);
        ctx.fill();

        // Cute rosy cheeks
        ctx.fillStyle = 'rgba(255, 87, 34, 0.6)';
        ctx.beginPath();
        ctx.arc(-5.5, 3, 1.4, 0, Math.PI * 2);
        ctx.arc(5.5, 3, 1.4, 0, Math.PI * 2);
        ctx.fill();

        // Happy little mouth
        ctx.strokeStyle = '#3e2723';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(0, 3, 2, 0.1, Math.PI - 0.1);
        ctx.stroke();

        // Glossy Top-Left Specular Shine
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.ellipse(-3.5, -4, 3, 1.8, -0.4, 0, Math.PI * 2);
        ctx.fill();

        // Spinning Mini Star Shimmer
        const starRot = gameTime * 4;
        ctx.save();
        ctx.translate(4, -5);
        ctx.rotate(starRot);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(0, -3.5);
        ctx.lineTo(1, -1);
        ctx.lineTo(3.5, 0);
        ctx.lineTo(1, 1);
        ctx.lineTo(0, 3.5);
        ctx.lineTo(-1, 1);
        ctx.lineTo(-3.5, 0);
        ctx.lineTo(-1, -1);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

      } else {
        // --- STANDARD PURE CARTOON WATER DROP (Glossy Blue Bubbly Jewel) ---
        const pulse = Math.sin(gameTime * 5 + drop.floatOffset) * 2;

        // Cyan Radial Aura
        const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 18 + pulse);
        glow.addColorStop(0, 'rgba(56, 189, 248, 0.7)');
        glow.addColorStop(0.6, 'rgba(14, 165, 233, 0.25)');
        glow.addColorStop(1, 'rgba(2, 132, 199, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(0, 0, 18 + pulse, 0, Math.PI * 2);
        ctx.fill();

        // Teardrop Body with Vibrant Aqua Gradient
        const dropGrad = ctx.createLinearGradient(0, -drop.height / 2, 0, drop.height / 2);
        dropGrad.addColorStop(0, '#e0f7fa');
        dropGrad.addColorStop(0.25, '#38bdf8');
        dropGrad.addColorStop(0.7, '#0284c7');
        dropGrad.addColorStop(1, '#0369a1');
        ctx.fillStyle = dropGrad;

        ctx.beginPath();
        ctx.moveTo(0, -drop.height / 2);
        ctx.bezierCurveTo(drop.width * 0.62, -drop.height * 0.1, drop.width * 0.62, drop.height / 2, 0, drop.height / 2);
        ctx.bezierCurveTo(-drop.width * 0.62, drop.height / 2, -drop.width * 0.62, -drop.height * 0.1, 0, -drop.height / 2);
        ctx.fill();

        // Crisp Cartoon Outline
        ctx.strokeStyle = '#024e7a';
        ctx.lineWidth = 1.6;
        ctx.stroke();

        // Cute Cartoon Eyes
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(-2.8, 1, 1.5, 0, Math.PI * 2);
        ctx.arc(2.8, 1, 1.5, 0, Math.PI * 2);
        ctx.fill();

        // Eye highlights
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(-3.2, 0.5, 0.6, 0, Math.PI * 2);
        ctx.arc(2.4, 0.5, 0.6, 0, Math.PI * 2);
        ctx.fill();

        // Cute rosy cheeks
        ctx.fillStyle = 'rgba(244, 114, 182, 0.6)';
        ctx.beginPath();
        ctx.arc(-4.8, 2.8, 1.2, 0, Math.PI * 2);
        ctx.arc(4.8, 2.8, 1.2, 0, Math.PI * 2);
        ctx.fill();

        // Sweet smiling mouth
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.arc(0, 2.5, 1.8, 0.1, Math.PI - 0.1);
        ctx.stroke();

        // Glossy Specular Highlight Bubble
        ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
        ctx.beginPath();
        ctx.ellipse(-3.2, -4, 2.8, 1.6, -0.35, 0, Math.PI * 2);
        ctx.fill();

        // Tiny bottom refraction glint
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(3, 4, 1, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }

  // Draw Goal Crop Field (Wilted vs Sprouting vs Blooming Sunflower)
  public drawCropGoal(level: LevelConfig, cameraX: number, progressPercent: number, gameTime: number) {
    const ctx = this.ctx;
    const cropX = level.cropGoalX - cameraX;
    const cropY = level.groundY;

    ctx.save();

    // Wooden farm plot fence
    ctx.fillStyle = '#6d4c41';
    ctx.fillRect(cropX - 40, cropY - 14, 120, 14);

    // Crop signpost
    ctx.fillStyle = '#8d6e63';
    ctx.fillRect(cropX - 30, cropY - 45, 8, 35);
    ctx.fillStyle = '#d7ccc8';
    ctx.fillRect(cropX - 55, cropY - 70, 60, 28);
    ctx.strokeStyle = '#4e342e';
    ctx.lineWidth = 2;
    ctx.strokeRect(cropX - 55, cropY - 70, 60, 28);

    ctx.fillStyle = '#3e2723';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CROP FIELD', cropX - 25, cropY - 55);
    ctx.font = '9px sans-serif';
    ctx.fillText(`${Math.round(progressPercent)}% Hydrated`, cropX - 25, cropY - 45);

    // Crops state based on progressPercent
    if (progressPercent < 40) {
      // Wilted dry stalks
      ctx.strokeStyle = '#8d6e63';
      ctx.lineWidth = 3;
      // Stalk 1
      ctx.beginPath();
      ctx.moveTo(cropX, cropY - 5);
      ctx.quadraticCurveTo(cropX - 10, cropY - 25, cropX - 18, cropY - 18);
      ctx.stroke();
      // Stalk 2
      ctx.beginPath();
      ctx.moveTo(cropX + 25, cropY - 5);
      ctx.quadraticCurveTo(cropX + 35, cropY - 22, cropX + 42, cropY - 14);
      ctx.stroke();
    } else if (progressPercent < 100) {
      // Growing green sprouts
      const growth = (progressPercent - 40) / 60; // 0 to 1
      const stemH = 20 + growth * 35;
      const sway = Math.sin(gameTime * 3) * 3;

      ctx.strokeStyle = '#43a047';
      ctx.lineWidth = 4;
      // Stem 1
      ctx.beginPath();
      ctx.moveTo(cropX - 5, cropY - 5);
      ctx.quadraticCurveTo(cropX - 5 + sway, cropY - stemH / 2, cropX - 5 + sway, cropY - stemH);
      ctx.stroke();

      // Stem 2
      ctx.beginPath();
      ctx.moveTo(cropX + 25, cropY - 5);
      ctx.quadraticCurveTo(cropX + 25 - sway, cropY - stemH / 2, cropX + 25 - sway, cropY - stemH * 0.9);
      ctx.stroke();

      // Green Leaves
      ctx.fillStyle = '#66bb6a';
      ctx.beginPath();
      ctx.ellipse(cropX - 15 + sway, cropY - stemH * 0.6, 10 * growth, 5 * growth, -0.4, 0, Math.PI * 2);
      ctx.ellipse(cropX + 5 + sway, cropY - stemH * 0.7, 10 * growth, 5 * growth, 0.4, 0, Math.PI * 2);
      ctx.fill();

      // Small flower buds
      ctx.fillStyle = '#ffca28';
      ctx.beginPath();
      ctx.arc(cropX - 5 + sway, cropY - stemH, 7 * growth, 0, Math.PI * 2);
      ctx.arc(cropX + 25 - sway, cropY - stemH * 0.9, 6 * growth, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // FULLY BLOOMED FLOURISHING SUNFLOWERS & WATER RAINBOW
      const sway = Math.sin(gameTime * 3) * 4;
      const stemH = 65;

      // Glow behind flowers
      const flowerGlow = ctx.createRadialGradient(cropX + 10, cropY - 60, 10, cropX + 10, cropY - 60, 70);
      flowerGlow.addColorStop(0, 'rgba(255, 235, 59, 0.6)');
      flowerGlow.addColorStop(1, 'rgba(255, 235, 59, 0)');
      ctx.fillStyle = flowerGlow;
      ctx.beginPath();
      ctx.arc(cropX + 10, cropY - 60, 70, 0, Math.PI * 2);
      ctx.fill();

      // Giant stems
      ctx.strokeStyle = '#2e7d32';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(cropX - 5, cropY - 5);
      ctx.quadraticCurveTo(cropX - 5 + sway, cropY - 35, cropX - 5 + sway, cropY - stemH);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cropX + 30, cropY - 5);
      ctx.quadraticCurveTo(cropX + 30 - sway, cropY - 30, cropX + 30 - sway, cropY - (stemH - 10));
      ctx.stroke();

      // Giant Golden Sunflower 1
      this.drawSunflower(cropX - 5 + sway, cropY - stemH, 20, gameTime);
      // Sunflower 2
      this.drawSunflower(cropX + 30 - sway, cropY - (stemH - 10), 16, -gameTime);

      // Cheerful butterflies fluttering
      const bfX = cropX + Math.sin(gameTime * 2) * 35;
      const bfY = cropY - 90 + Math.cos(gameTime * 3) * 15;
      this.drawButterfly(bfX, bfY, gameTime);
    }

    ctx.restore();
  }

  private drawSunflower(x: number, y: number, radius: number, time: number) {
    const ctx = this.ctx;
    ctx.save();
    // Yellow Petals
    ctx.fillStyle = '#ffb300';
    for (let i = 0; i < 12; i++) {
      const angle = (i * Math.PI) / 6 + time * 0.5;
      const px = x + Math.cos(angle) * radius;
      const py = y + Math.sin(angle) * radius;
      ctx.beginPath();
      ctx.arc(px, py, radius * 0.45, 0, Math.PI * 2);
      ctx.fill();
    }
    // Brown Seed Center
    ctx.fillStyle = '#4e342e';
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.75, 0, Math.PI * 2);
    ctx.fill();
    // Cute smile on flower face
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(x - 4, y - 3, 2.5, 0, Math.PI * 2);
    ctx.arc(x + 4, y - 3, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(x - 4, y - 3, 1.2, 0, Math.PI * 2);
    ctx.arc(x + 4, y - 3, 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(x, y + 1, 4, 0.1, Math.PI - 0.1);
    ctx.stroke();

    ctx.restore();
  }

  private drawButterfly(x: number, y: number, time: number) {
    const ctx = this.ctx;
    ctx.save();
    const flap = Math.sin(time * 15) * 6;
    ctx.fillStyle = '#e91e63';
    // Left wing
    ctx.beginPath();
    ctx.ellipse(x - 6, y, 6, 8 + flap * 0.5, -0.3, 0, Math.PI * 2);
    ctx.fill();
    // Right wing
    ctx.beginPath();
    ctx.ellipse(x + 6, y, 6, 8 + flap * 0.5, 0.3, 0, Math.PI * 2);
    ctx.fill();
    // Body
    ctx.fillStyle = '#333';
    ctx.fillRect(x - 1.5, y - 6, 3, 12);
    ctx.restore();
  }

  // Draw the Farmer Character (Hand-Crafted High-Quality Cartoon Hero with Squash/Stretch & Dynamic Face)
  public drawPlayer(player: Player, cameraX: number, progressPercent: number, gameTime: number) {
    const ctx = this.ctx;
    const screenX = player.x - cameraX;
    const screenY = player.y;

    // --- CARTOON DROP SHADOW ---
    if (!player.isRespawning) {
      ctx.save();
      const shadowW = Math.max(8, 16 * (player.isGrounded ? 1.0 : 0.8));
      const shadowAlpha = player.isGrounded ? 0.28 : 0.15;
      ctx.fillStyle = `rgba(15, 23, 42, ${shadowAlpha})`;
      ctx.beginPath();
      ctx.ellipse(screenX + player.width / 2, screenY + player.height + 2, shadowW, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.save();

    // Damage invulnerability blinking
    if (player.invulnerableTimer > 0) {
      const blink = Math.floor(player.invulnerableTimer * 15) % 2 === 0;
      if (blink) {
        ctx.globalAlpha = 0.35;
      }
    }

    // Respawn falling animation
    if (player.isRespawning) {
      ctx.globalAlpha = Math.sin(gameTime * 20) > 0 ? 0.8 : 0.2;
    }

    const isLeft = player.facing === 'left';
    ctx.translate(screenX + player.width / 2, screenY + player.height / 2);

    // Apply Squash and Stretch + Facing Flip
    const sx = (player.squashStretchX || 1.0) * (isLeft ? -1 : 1);
    const sy = player.squashStretchY || 1.0;
    ctx.scale(sx, sy);

    const isMoving = Math.abs(player.vx) > 10;
    const isJumping = !player.isGrounded;
    const legOffset = isJumping ? 6 : isMoving ? Math.sin(player.animTimer * 14) * 8 : 0;
    const bodyBob = isMoving && !isJumping ? Math.abs(Math.sin(player.animTimer * 14)) * 3 : 0;

    // 1. --- LEGS & WORK BOOTS ---
    // Chunky Brown Work Boots with Tan Soles & White Socks
    const drawBoot = (bx: number, by: number) => {
      // White Tube Sock
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(bx - 0.5, by - 6, 8, 4);

      // Boot Upper Leather (Warm Chestnut Brown)
      ctx.fillStyle = '#4e342e';
      ctx.beginPath();
      ctx.roundRect(bx - 1, by - 3, 9, 10, 2);
      ctx.fill();

      // Boot Toe Cap / Curve
      ctx.beginPath();
      ctx.roundRect(bx + 2, by + 1, 6, 6, 2);
      ctx.fill();

      // Tan Rugged Rubber Sole
      ctx.fillStyle = '#d7ccc8';
      ctx.fillRect(bx - 2, by + 6, 12, 3);
      ctx.fillStyle = '#8d6e63';
      ctx.fillRect(bx - 2, by + 7.5, 12, 1.5);

      // Yellow Boot Laces
      ctx.fillStyle = '#ffd54f';
      ctx.fillRect(bx + 1, by, 3, 1.2);
      ctx.fillRect(bx + 1, by + 2.5, 3, 1.2);
    };

    // Back leg
    drawBoot(-11, 14 - legOffset);
    // Front leg
    drawBoot(2, 14 + legOffset);

    // Denim Pants Legs (Vibrant Deep Blue with rolled cuffs)
    ctx.fillStyle = '#1565c0';
    ctx.beginPath();
    ctx.roundRect(-12, 3 - legOffset, 10, 10, 2);
    ctx.roundRect(1, 3 + legOffset, 10, 10, 2);
    ctx.fill();

    // Rolled Hem Cuffs
    ctx.fillStyle = '#90caf9';
    ctx.fillRect(-12, 11 - legOffset, 10, 3);
    ctx.fillRect(1, 11 + legOffset, 10, 3);

    // 2. --- TORSO & OVERALLS ---
    // Red Flannel Plaid Shirt (Warm Red with subtle pattern)
    ctx.fillStyle = '#c62828';
    ctx.beginPath();
    ctx.roundRect(-13, -11 + bodyBob, 26, 16, 3);
    ctx.fill();

    // Plaid Grid Accents
    ctx.fillStyle = '#8e0000';
    ctx.fillRect(-13, -6 + bodyBob, 26, 2);
    ctx.fillRect(-5, -11 + bodyBob, 2, 16);
    ctx.fillRect(5, -11 + bodyBob, 2, 16);

    // Denim Overalls Bib (Rich Classic Denim)
    ctx.fillStyle = '#1976d2';
    ctx.beginPath();
    ctx.roundRect(-10, -7 + bodyBob, 20, 16, 2);
    ctx.fill();

    // Overalls Golden Yellow Stitching
    ctx.strokeStyle = '#fbc02d';
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 1.5]);
    ctx.strokeRect(-9, -6 + bodyBob, 18, 14);
    ctx.setLineDash([]); // Reset

    // Overalls Bib Front Pocket
    ctx.fillStyle = '#1565c0';
    ctx.beginPath();
    ctx.roundRect(-5, -3 + bodyBob, 10, 8, 2);
    ctx.fill();
    ctx.strokeStyle = '#fbc02d';
    ctx.lineWidth = 0.8;
    ctx.strokeRect(-5, -3 + bodyBob, 10, 8);

    // Cute Green Sprout peaking from bib pocket!
    ctx.fillStyle = '#4caf50';
    ctx.beginPath();
    ctx.ellipse(-1, -5 + bodyBob, 3, 2, -0.4, 0, Math.PI * 2);
    ctx.ellipse(2, -6 + bodyBob, 3.5, 2, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Brass Buttons / Overalls Clasps
    ctx.fillStyle = '#ffd54f';
    ctx.beginPath();
    ctx.arc(-7, -4 + bodyBob, 2, 0, Math.PI * 2);
    ctx.arc(7, -4 + bodyBob, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-7.5, -4.5 + bodyBob, 0.7, 0, Math.PI * 2);
    ctx.arc(6.5, -4.5 + bodyBob, 0.7, 0, Math.PI * 2);
    ctx.fill();

    // 3. --- HEAD & EXPRESSIVE CARTOON FACE ---
    const headY = -19 + bodyBob;

    // Warm Skin Tone
    ctx.fillStyle = '#ffcc80';
    ctx.beginPath();
    ctx.arc(0, headY, 11, 0, Math.PI * 2);
    ctx.fill();

    // Cute Rosy Cartoon Cheeks
    ctx.fillStyle = 'rgba(239, 83, 80, 0.55)';
    ctx.beginPath();
    ctx.ellipse(-5, headY + 3, 3, 2, 0, 0, Math.PI * 2);
    ctx.ellipse(5, headY + 3, 3.5, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Button Nose
    ctx.fillStyle = '#fb8c00';
    ctx.beginPath();
    ctx.arc(5, headY - 0.5, 2.2, 0, Math.PI * 2);
    ctx.fill();

    // Dynamic Blinking & Expressions
    const isBlinking = player.blinkTimer !== undefined && player.blinkTimer < 0.12;
    const expr = player.expression || 'normal';

    if (isBlinking) {
      // Cute Closed Happy Blinking Eyes "^ ^"
      ctx.strokeStyle = '#212121';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(3.5, headY - 3, 3, Math.PI + 0.3, -0.3);
      ctx.stroke();
    } else if (expr === 'hurt') {
      // Hurt / Dizzy Eyes "> <"
      ctx.strokeStyle = '#c62828';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(1, headY - 5);
      ctx.lineTo(6, headY - 3);
      ctx.lineTo(1, headY - 1);
      ctx.stroke();
    } else {
      // Large Cartoon Expressive Eyes with Glossy Catchlights
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(4, headY - 3, 4, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#212121';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Dark Chocolate Pupil with Catchlights
      ctx.fillStyle = '#212121';
      ctx.beginPath();
      ctx.arc(4.5, headY - 3, 2.4, 0, Math.PI * 2);
      ctx.fill();

      // Specular Star/Bubble Highlights
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(3.8, headY - 4.2, 1.2, 0, Math.PI * 2);
      ctx.arc(5.2, headY - 2.2, 0.6, 0, Math.PI * 2);
      ctx.fill();

      // Eyebrow
      ctx.strokeStyle = '#4e342e';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      if (expr === 'determined') {
        ctx.moveTo(1, headY - 7);
        ctx.lineTo(7, headY - 8);
      } else {
        ctx.arc(4, headY - 7, 3.5, Math.PI + 0.4, -0.4);
      }
      ctx.stroke();
    }

    // Dynamic Cartoon Mouth
    if (expr === 'happy' || progressPercent >= 100) {
      // Big Joyous Open Smile
      ctx.fillStyle = '#b71c1c';
      ctx.beginPath();
      ctx.arc(3, headY + 3.5, 3.8, 0.1, Math.PI - 0.1);
      ctx.fill();
      // White top teeth
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(1, headY + 3.5, 4, 1.5);
      // Tongue
      ctx.fillStyle = '#ff8a80';
      ctx.beginPath();
      ctx.arc(3, headY + 6, 2.2, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = '#3e2723';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(3, headY + 3.5, 3.8, 0.1, Math.PI - 0.1);
      ctx.stroke();
    } else if (expr === 'surprised' || (isJumping && player.vy > 100)) {
      // "O" Shaped Surprised Mouth
      ctx.fillStyle = '#3e2723';
      ctx.beginPath();
      ctx.ellipse(4, headY + 4, 2, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Confident Friendly Grin
      ctx.strokeStyle = '#3e2723';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(3, headY + 3.5, 3.2, 0.2, Math.PI - 0.2);
      ctx.stroke();
    }

    // 4. --- BOUNCY CARTOON STRAW HAT ---
    const hatY = headY - 8;
    const hatTilt = isJumping ? -player.vy * 0.0006 : (player.vx * 0.0004);

    ctx.save();
    ctx.translate(0, hatY);
    ctx.rotate(hatTilt);

    // Hat Brim (Golden Yellow Curved Oval with Outline)
    ctx.fillStyle = '#fbc02d';
    ctx.beginPath();
    ctx.ellipse(0, 0, 19, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b78103';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Crown Dome
    const crownGrad = ctx.createLinearGradient(0, -14, 0, 0);
    crownGrad.addColorStop(0, '#fff59d');
    crownGrad.addColorStop(0.4, '#fbc02d');
    crownGrad.addColorStop(1, '#f57f17');
    ctx.fillStyle = crownGrad;
    ctx.beginPath();
    ctx.roundRect(-10, -13, 20, 13, [8, 8, 2, 2]);
    ctx.fill();
    ctx.strokeStyle = '#b78103';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Woven Straw Crosshatch Pattern Accents
    ctx.strokeStyle = 'rgba(183, 129, 3, 0.4)';
    ctx.lineWidth = 0.8;
    for (let i = -7; i <= 7; i += 4) {
      ctx.beginPath();
      ctx.moveTo(i, -12);
      ctx.lineTo(i + 2, -2);
      ctx.stroke();
    }

    // Vibrant Red Silk Ribbon around Crown
    ctx.fillStyle = '#d32f2f';
    ctx.fillRect(-10, -3.5, 20, 3.5);
    ctx.fillStyle = '#ff5252';
    ctx.fillRect(-10, -3.5, 20, 1);

    // Fluttering Ribbon Tails at back of hat
    const ribbonWave = Math.sin(gameTime * 12) * 4;
    ctx.fillStyle = '#b71c1c';
    ctx.beginPath();
    ctx.moveTo(-9, -2);
    ctx.quadraticCurveTo(-15, -4 + ribbonWave, -18, -1 + ribbonWave);
    ctx.lineTo(-17, 3 + ribbonWave);
    ctx.quadraticCurveTo(-14, 0 + ribbonWave, -9, 0);
    ctx.closePath();
    ctx.fill();

    ctx.restore();

    // 5. --- ARMS & WEAPONS / WATER BUCKET ---
    if (player.hasWaterGun) {
      // --- SUPER WATER GUN EQUIPPED (Super Mario Style Hydro Blaster!) ---
      const gunBob = bodyBob;
      const gunX = 7;
      const gunY = -4 + gunBob;

      // Back arm holding grip
      ctx.fillStyle = '#c62828';
      ctx.beginPath();
      ctx.roundRect(0, -3 + gunBob, 9, 5, 2);
      ctx.fill();

      // Super Water Gun Sprite
      ctx.save();
      ctx.translate(gunX, gunY);

      // Gun Body Main Frame (Metallic Cyan with Dark Border)
      const gunGrad = ctx.createLinearGradient(0, -6, 22, 10);
      gunGrad.addColorStop(0, '#00e5ff');
      gunGrad.addColorStop(0.5, '#00b0ff');
      gunGrad.addColorStop(1, '#01579b');
      ctx.fillStyle = gunGrad;
      ctx.beginPath();
      ctx.roundRect(4, -4, 18, 9, 3);
      ctx.fill();
      ctx.strokeStyle = '#004d40';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Top Pressurized Translucent Water Tank
      ctx.fillStyle = 'rgba(224, 247, 250, 0.75)';
      ctx.beginPath();
      ctx.roundRect(6, -11, 13, 6, 3);
      ctx.fill();
      ctx.strokeStyle = '#00acc1';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Sloshing water inside tank
      const ammoPercent = Math.max(0.1, player.waterAmmo / (player.maxWaterAmmo || 20));
      const waterH = 4.5 * ammoPercent;
      ctx.fillStyle = '#29b6f6';
      ctx.fillRect(7, -6 - waterH, 11, waterH);

      // Specular shine on glass tank
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(8, -10, 5, 1.2);

      // High-pressure Gold Nozzle
      ctx.fillStyle = '#ff9800';
      ctx.beginPath();
      ctx.roundRect(22, -2.5, 5, 5, 1.5);
      ctx.fill();
      ctx.fillStyle = '#ffe082';
      ctx.fillRect(26, -1.5, 2, 3);

      // Trigger & Handle
      ctx.fillStyle = '#37474f';
      ctx.fillRect(6, 5, 4, 6);
      ctx.fillRect(10, 5, 2, 3);

      // Neon Power Core Indicator
      ctx.fillStyle = '#76ff03';
      ctx.beginPath();
      ctx.arc(13, 0.5, 2, 0, Math.PI * 2);
      ctx.fill();

      // Glowing muzzle ready tip
      if (player.shootCooldown <= 0) {
        ctx.fillStyle = 'rgba(0, 229, 255, 0.85)';
        ctx.beginPath();
        ctx.arc(28, 0, 2.5 + Math.sin(gameTime * 15) * 1, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      // Front holding hand
      ctx.fillStyle = '#ffcc80';
      ctx.beginPath();
      ctx.roundRect(13, -2 + gunBob, 5, 5, 2);
      ctx.fill();

    } else {
      // --- STANDARD METAL WATER BUCKET ---
      // Arm holding bucket forward
      ctx.fillStyle = '#c62828';
      ctx.beginPath();
      ctx.roundRect(2, -4 + bodyBob, 11, 5, 2);
      ctx.fill();
      ctx.fillStyle = '#ffcc80';
      ctx.beginPath();
      ctx.roundRect(11, -4 + bodyBob, 4, 5, 2);
      ctx.fill();

      // Metal Water Bucket Body
      const bucketX = 13;
      const bucketY = -2 + bodyBob;

      // Bucket Handle Arc
      ctx.strokeStyle = '#78909c';
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(bucketX + 6, bucketY - 2, 6, Math.PI, 0);
      ctx.stroke();

      // Galvanized Metal Pail Body with 3D Gradient
      const pailGrad = ctx.createLinearGradient(bucketX, bucketY, bucketX + 13, bucketY);
      pailGrad.addColorStop(0, '#cfd8dc');
      pailGrad.addColorStop(0.5, '#eceff1');
      pailGrad.addColorStop(1, '#90a4ae');
      ctx.fillStyle = pailGrad;

      ctx.beginPath();
      ctx.moveTo(bucketX, bucketY);
      ctx.lineTo(bucketX + 13, bucketY);
      ctx.lineTo(bucketX + 11, bucketY + 14);
      ctx.lineTo(bucketX + 2, bucketY + 14);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#546e7a';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Water inside bucket based on progressPercent!
      if (progressPercent > 0) {
        const waterHeight = Math.min(12, (progressPercent / 100) * 11);
        const waterGrad = ctx.createLinearGradient(0, bucketY + 13 - waterHeight, 0, bucketY + 13);
        waterGrad.addColorStop(0, '#81d4fa');
        waterGrad.addColorStop(1, '#0288d1');
        ctx.fillStyle = waterGrad;
        ctx.fillRect(bucketX + 2.5, bucketY + 13 - waterHeight, 8, waterHeight);

        // Water surface shine & ripple
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fillRect(bucketX + 3, bucketY + 13 - waterHeight, 5, 1.5);

        // Sloshing droplets if running
        if (isMoving && Math.sin(gameTime * 15) > 0.4) {
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(bucketX + 5 + Math.sin(gameTime * 20) * 3, bucketY - 3, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    ctx.restore();
  }

  // Draw Angry Weed Enemies (Patrolling Farm Pests)
  public drawWeeds(weeds: WeedEnemy[], cameraX: number, gameTime: number) {
    const ctx = this.ctx;

    weeds.forEach(weed => {
      const screenX = weed.x - cameraX;
      // Skip off-screen weeds
      if (screenX < -100 || screenX > ctx.canvas.width + 100) return;

      const centerX = screenX + weed.width / 2;
      const bottomY = weed.y + weed.height;

      ctx.save();

      if (weed.isSquashed) {
        // --- SQUASHED / STOMPED STATE ---
        const alpha = Math.max(0, Math.min(1, (weed.squashTimer || 0) / 0.6));
        ctx.globalAlpha = alpha;

        // Flattened weed pancake body
        ctx.fillStyle = '#2e7d32';
        ctx.beginPath();
        ctx.ellipse(centerX, bottomY - 6, 18, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wilted side leaves
        ctx.fillStyle = '#1b5e20';
        ctx.beginPath();
        ctx.ellipse(centerX - 14, bottomY - 4, 8, 4, -0.2, 0, Math.PI * 2);
        ctx.ellipse(centerX + 14, bottomY - 4, 8, 4, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Stomped "X" eyes
        ctx.strokeStyle = '#212121';
        ctx.lineWidth = 1.8;
        const drawX = (x: number, y: number) => {
          ctx.beginPath();
          ctx.moveTo(x - 3, y - 3);
          ctx.lineTo(x + 3, y + 3);
          ctx.moveTo(x + 3, y - 3);
          ctx.lineTo(x - 3, y + 3);
          ctx.stroke();
        };
        drawX(centerX - 6, bottomY - 6);
        drawX(centerX + 6, bottomY - 6);

        // Dizzy little stars floating above squashed weed
        const dizzyAngle = gameTime * 8;
        ctx.fillStyle = '#ffeb3b';
        for (let i = 0; i < 2; i++) {
          const sx = centerX + Math.cos(dizzyAngle + i * Math.PI) * 12;
          const sy = bottomY - 16 + Math.sin(dizzyAngle + i * Math.PI) * 4;
          ctx.beginPath();
          ctx.arc(sx, sy, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // --- ACTIVE PATROLLING ANGRY WEED SPRITE ---
        const anim = weed.animTimer || 0;
        const step = Math.sin(anim * 14);
        const bob = Math.abs(Math.sin(anim * 14)) * 3;
        const sway = Math.sin(anim * 14) * 0.08;

        ctx.translate(centerX, bottomY);
        ctx.scale(weed.facing === 'left' ? -1 : 1, 1);
        ctx.rotate(sway);

        // 1. Root Feet (Waddling walk cycle)
        ctx.fillStyle = '#4e342e';
        // Left foot
        ctx.beginPath();
        ctx.ellipse(-7 + step * 4, -4 - Math.max(0, -step) * 3, 5, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
        // Right foot
        ctx.beginPath();
        ctx.ellipse(7 - step * 4, -4 - Math.max(0, step) * 3, 5, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Thorns on Back
        ctx.fillStyle = '#d32f2f';
        // Back thorn 1
        ctx.beginPath();
        ctx.moveTo(-11, -24 + bob);
        ctx.lineTo(-18, -27 + bob);
        ctx.lineTo(-10, -29 + bob);
        ctx.closePath();
        ctx.fill();
        // Back thorn 2
        ctx.beginPath();
        ctx.moveTo(-12, -15 + bob);
        ctx.lineTo(-19, -17 + bob);
        ctx.lineTo(-11, -20 + bob);
        ctx.closePath();
        ctx.fill();

        // 3. Thorny Bramble Bulb Body (Dark aggressive green)
        const bodyGrad = ctx.createLinearGradient(0, -36 + bob, 0, -4 + bob);
        bodyGrad.addColorStop(0, '#43a047');
        bodyGrad.addColorStop(0.5, '#2e7d32');
        bodyGrad.addColorStop(1, '#1b5e20');
        ctx.fillStyle = bodyGrad;

        ctx.beginPath();
        ctx.moveTo(0, -36 + bob); // top peak
        ctx.bezierCurveTo(15, -34 + bob, 16, -14 + bob, 12, -6 + bob); // front belly
        ctx.bezierCurveTo(6, -2 + bob, -6, -2 + bob, -12, -6 + bob); // bottom
        ctx.bezierCurveTo(-16, -14 + bob, -15, -34 + bob, 0, -36 + bob); // back
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#1b5e20';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 4. Spiky Crown Leaves (Aggressive Mohawk/Crown)
        ctx.fillStyle = '#388e3c';
        // Center spike
        ctx.beginPath();
        ctx.moveTo(-4, -34 + bob);
        ctx.lineTo(0, -44 + bob);
        ctx.lineTo(4, -34 + bob);
        ctx.closePath();
        ctx.fill();
        // Front spike
        ctx.beginPath();
        ctx.moveTo(2, -33 + bob);
        ctx.lineTo(8, -40 + bob);
        ctx.lineTo(7, -31 + bob);
        ctx.closePath();
        ctx.fill();
        // Back spike
        ctx.beginPath();
        ctx.moveTo(-3, -33 + bob);
        ctx.lineTo(-8, -39 + bob);
        ctx.lineTo(-7, -31 + bob);
        ctx.closePath();
        ctx.fill();

        // Red thorn tip on center spike
        ctx.fillStyle = '#e53935';
        ctx.beginPath();
        ctx.moveTo(-2, -39 + bob);
        ctx.lineTo(0, -44 + bob);
        ctx.lineTo(2, -39 + bob);
        ctx.closePath();
        ctx.fill();

        // 5. Angry Glowing Eyes (Piercing yellow sclera with red slitted pupil)
        // Eye White / Yellow Sclera
        ctx.fillStyle = '#fff59d';
        ctx.beginPath();
        ctx.ellipse(5, -23 + bob, 5, 4.5, -0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(-2, -23 + bob, 4.5, 4, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Menacing Slit Pupils (Looking forward)
        ctx.fillStyle = '#b71c1c';
        ctx.beginPath();
        ctx.ellipse(6.5, -23 + bob, 2, 3.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(-0.5, -23 + bob, 1.8, 3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye highlight shine
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(7.5, -24.5 + bob, 1, 0, Math.PI * 2);
        ctx.arc(0.5, -24.5 + bob, 0.8, 0, Math.PI * 2);
        ctx.fill();

        // Heavy Furrowed V-shaped Angry Brows
        ctx.strokeStyle = '#0d2d0f';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(-5, -28 + bob);
        ctx.lineTo(2, -24 + bob);
        ctx.lineTo(11, -27 + bob);
        ctx.stroke();

        // 6. Snapping Jagged Mouth with Sharp Thistle Teeth
        ctx.fillStyle = '#212121';
        ctx.beginPath();
        ctx.moveTo(0, -14 + bob);
        ctx.lineTo(11, -15 + bob);
        ctx.lineTo(8, -9 + bob);
        ctx.lineTo(1, -9 + bob);
        ctx.closePath();
        ctx.fill();

        // Sharp white triangular teeth
        ctx.fillStyle = '#ffffff';
        // Upper tooth 1
        ctx.beginPath();
        ctx.moveTo(3, -15 + bob);
        ctx.lineTo(5, -12 + bob);
        ctx.lineTo(7, -15 + bob);
        ctx.closePath();
        ctx.fill();
        // Upper tooth 2
        ctx.beginPath();
        ctx.moveTo(7, -15 + bob);
        ctx.lineTo(9, -12 + bob);
        ctx.lineTo(10.5, -15 + bob);
        ctx.closePath();
        ctx.fill();
        // Lower tooth
        ctx.beginPath();
        ctx.moveTo(4, -9 + bob);
        ctx.lineTo(6, -11 + bob);
        ctx.lineTo(7.5, -9 + bob);
        ctx.closePath();
        ctx.fill();

        // 7. Thorny Leaf Hand / Arm (Swinging with walk cycle)
        ctx.fillStyle = '#388e3c';
        ctx.beginPath();
        ctx.ellipse(-1, -12 + bob + step * 2, 5, 3, -0.4, 0, Math.PI * 2);
        ctx.fill();
        // Hand thorn
        ctx.fillStyle = '#d32f2f';
        ctx.beginPath();
        ctx.moveTo(3, -12 + bob + step * 2);
        ctx.lineTo(6, -11 + bob + step * 2);
        ctx.lineTo(2, -10 + bob + step * 2);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    });
  }

  // Draw Angry Sunflowers (Shooting Obstacles)
  public drawSunflowers(sunflowers: SunflowerEnemy[], cameraX: number, gameTime: number) {
    const ctx = this.ctx;

    sunflowers.forEach(sf => {
      const screenX = sf.x - cameraX;
      // Skip offscreen
      if (screenX < -120 || screenX > ctx.canvas.width + 120) return;

      const centerX = screenX + sf.width / 2;
      const bottomY = sf.y + sf.height;

      ctx.save();

      if (sf.isSquashed) {
        // --- SQUASHED / STOMPED SUNFLOWER ---
        const alpha = Math.max(0, Math.min(1, (sf.squashTimer || 0) / 0.65));
        ctx.globalAlpha = alpha;

        // Flattened flower head & petals
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.ellipse(centerX, bottomY - 6, 22, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Crushed brown seed disk
        ctx.fillStyle = '#3e2723';
        ctx.beginPath();
        ctx.ellipse(centerX, bottomY - 6, 12, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Wilted side leaves
        ctx.fillStyle = '#2e7d32';
        ctx.beginPath();
        ctx.ellipse(centerX - 18, bottomY - 4, 8, 3, -0.3, 0, Math.PI * 2);
        ctx.ellipse(centerX + 18, bottomY - 4, 8, 3, 0.3, 0, Math.PI * 2);
        ctx.fill();

        // Stomped "X" eyes
        ctx.strokeStyle = '#ffd54f';
        ctx.lineWidth = 1.6;
        const drawX = (x: number, y: number) => {
          ctx.beginPath();
          ctx.moveTo(x - 3, y - 2);
          ctx.lineTo(x + 3, y + 2);
          ctx.moveTo(x + 3, y - 2);
          ctx.lineTo(x - 3, y + 2);
          ctx.stroke();
        };
        drawX(centerX - 5, bottomY - 6);
        drawX(centerX + 5, bottomY - 6);

        // Dizzy stars floating above
        const dizzyAngle = gameTime * 8;
        ctx.fillStyle = '#ffca28';
        for (let i = 0; i < 3; i++) {
          const sx = centerX + Math.cos(dizzyAngle + i * (Math.PI * 2 / 3)) * 14;
          const sy = bottomY - 18 + Math.sin(dizzyAngle + i * (Math.PI * 2 / 3)) * 5;
          ctx.beginPath();
          ctx.arc(sx, sy, 2.2, 0, Math.PI * 2);
          ctx.fill();
        }
      } else {
        // --- ACTIVE ANGRY SUNFLOWER ---
        const isWindingUp = sf.windupTimer > 0;
        const shakeX = isWindingUp ? (Math.random() - 0.5) * 4 : 0;
        const shakeY = isWindingUp ? (Math.random() - 0.5) * 3 : 0;
        const sway = Math.sin((sf.animTimer || 0) * 3.5) * 0.05;

        ctx.translate(centerX + shakeX, bottomY + shakeY);
        ctx.rotate(sway);

        // 1. Root & Soil Mound
        ctx.fillStyle = '#3e2723';
        ctx.beginPath();
        ctx.ellipse(0, -2, 14, 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Thorny Stem
        ctx.strokeStyle = '#2e7d32';
        ctx.lineWidth = 6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(0, -2);
        const stemCurve = sf.facing === 'left' ? -4 : 4;
        ctx.quadraticCurveTo(stemCurve, -18, 0, -32);
        ctx.stroke();

        // Red Stem Thorns
        ctx.fillStyle = '#d32f2f';
        ctx.beginPath();
        ctx.moveTo(-3, -12);
        ctx.lineTo(-9, -15);
        ctx.lineTo(-3, -17);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(3, -22);
        ctx.lineTo(9, -25);
        ctx.lineTo(3, -27);
        ctx.closePath();
        ctx.fill();

        // Thorny Stem Leaves
        ctx.fillStyle = '#388e3c';
        // Left leaf
        ctx.beginPath();
        ctx.ellipse(-12, -14, 9, 4, -0.4, 0, Math.PI * 2);
        ctx.fill();
        // Right leaf
        ctx.beginPath();
        ctx.ellipse(12, -20, 9, 4, 0.4, 0, Math.PI * 2);
        ctx.fill();

        // 3. Flower Head Center Position
        const headY = -34;
        const headRadius = 15;
        const petalRadius = isWindingUp ? 22 : 19;
        const petalCount = 12;

        // 4. Radiating Fiery Yellow/Orange Petals
        for (let i = 0; i < petalCount; i++) {
          const angle = (i / petalCount) * Math.PI * 2 + (isWindingUp ? Math.sin(gameTime * 25) * 0.1 : 0);
          const px = Math.cos(angle) * petalRadius;
          const py = headY + Math.sin(angle) * petalRadius;

          // Outer orange petal tips
          ctx.fillStyle = i % 2 === 0 ? '#ff8f00' : '#f57c00';
          ctx.beginPath();
          ctx.ellipse(px, py, isWindingUp ? 7 : 5.5, 4, angle, 0, Math.PI * 2);
          ctx.fill();

          // Inner bright yellow petal layer
          ctx.fillStyle = '#ffeb3b';
          const innerPx = Math.cos(angle) * (petalRadius - 3);
          const innerPy = headY + Math.sin(angle) * (petalRadius - 3);
          ctx.beginPath();
          ctx.ellipse(innerPx, innerPy, 4.5, 3, angle, 0, Math.PI * 2);
          ctx.fill();
        }

        // 5. Angry Brown Seed Core Disc
        const coreGrad = ctx.createRadialGradient(0, headY, 2, 0, headY, headRadius);
        coreGrad.addColorStop(0, '#5d4037');
        coreGrad.addColorStop(0.7, '#3e2723');
        coreGrad.addColorStop(1, '#271202');
        ctx.fillStyle = coreGrad;
        ctx.beginPath();
        ctx.arc(0, headY, headRadius, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#ffb300';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Seed Texture Stippling
        ctx.fillStyle = '#211003';
        for (let r = 4; r <= 10; r += 3) {
          const dotCount = r * 2;
          for (let d = 0; d < dotCount; d++) {
            const dotAngle = (d / dotCount) * Math.PI * 2;
            ctx.fillRect(Math.cos(dotAngle) * r - 0.7, headY + Math.sin(dotAngle) * r - 0.7, 1.4, 1.4);
          }
        }

        // Direction scale for face details
        const isLeft = sf.facing === 'left';
        ctx.save();
        ctx.translate(0, headY);
        if (isLeft) {
          ctx.scale(-1, 1);
        }

        // 6. Angry Piercing Eyes
        // Yellow glowing eye sockets
        ctx.fillStyle = '#fff59d';
        ctx.beginPath();
        ctx.ellipse(4, -4, 4, 3.5, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(-3, -4, 3.5, 3, -0.2, 0, Math.PI * 2);
        ctx.fill();

        // Fiery red/black pupils focused along aim
        ctx.fillStyle = '#b71c1c';
        const eyeOffset = isWindingUp ? 1.8 : 1.2;
        ctx.beginPath();
        ctx.arc(4 + eyeOffset, -4, 2, 0, Math.PI * 2);
        ctx.arc(-3 + eyeOffset, -4, 1.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#212121';
        ctx.beginPath();
        ctx.arc(4 + eyeOffset, -4, 1.1, 0, Math.PI * 2);
        ctx.arc(-3 + eyeOffset, -4, 1, 0, Math.PI * 2);
        ctx.fill();

        // Eye highlights
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(4.8 + eyeOffset, -5, 0.8, 0, Math.PI * 2);
        ctx.arc(-2.2 + eyeOffset, -5, 0.7, 0, Math.PI * 2);
        ctx.fill();

        // Heavy Sharp V-Eyebrows
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(-6, -7);
        ctx.lineTo(1, -5);
        ctx.lineTo(8, -8);
        ctx.stroke();

        // 7. Spitting Snout / Mouth
        if (isWindingUp) {
          // Open "O" cannon barrel ready to spit seed
          ctx.fillStyle = '#1a0c02';
          ctx.beginPath();
          ctx.ellipse(6, 4, 5.5, 4.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ff9800';
          ctx.lineWidth = 2;
          ctx.stroke();

          // Glowing chamber seed inside mouth
          ctx.fillStyle = '#ffeb3b';
          ctx.beginPath();
          ctx.arc(6, 4, 2.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Menacing Jagged Grin / Thistle Teeth
          ctx.fillStyle = '#1a0c02';
          ctx.beginPath();
          ctx.moveTo(0, 3);
          ctx.lineTo(8, 3);
          ctx.lineTo(6, 7);
          ctx.lineTo(2, 7);
          ctx.closePath();
          ctx.fill();

          // Sharp White Teeth
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(1, 3);
          ctx.lineTo(3, 5.5);
          ctx.lineTo(4.5, 3);
          ctx.closePath();
          ctx.fill();

          ctx.beginPath();
          ctx.moveTo(4.5, 3);
          ctx.lineTo(6.5, 5.5);
          ctx.lineTo(8, 3);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      }

      ctx.restore();
    });
  }

  // Draw Sunflower Seed Projectiles
  public drawSeedProjectiles(seeds: SeedProjectile[], cameraX: number) {
    const ctx = this.ctx;

    seeds.forEach(seed => {
      const screenX = seed.x - cameraX + seed.width / 2;
      const screenY = seed.y + seed.height / 2;

      ctx.save();
      ctx.translate(screenX, screenY);
      ctx.rotate(seed.rotation);

      // Kinetic Motion Glow / Speed Aura
      const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 11);
      glow.addColorStop(0, 'rgba(255, 179, 0, 0.7)');
      glow.addColorStop(1, 'rgba(255, 179, 0, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, 11, 0, Math.PI * 2);
      ctx.fill();

      // Sunflower Seed Body (Black shell with pointed tip)
      ctx.fillStyle = '#212121';
      ctx.beginPath();
      ctx.ellipse(0, 0, 7, 4.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Sharp pointed seed tip
      ctx.beginPath();
      ctx.moveTo(5, -2);
      ctx.lineTo(8.5, 0);
      ctx.lineTo(5, 2);
      ctx.closePath();
      ctx.fill();

      // Cream / White Characteristic Sunflower Seed Stripes
      ctx.strokeStyle = '#f5f5f5';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-5, -1.2);
      ctx.lineTo(6, -1.2);
      ctx.moveTo(-5, 1.2);
      ctx.lineTo(6, 1.2);
      ctx.stroke();

      // Central gold sheen
      ctx.fillStyle = '#ffca28';
      ctx.beginPath();
      ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  // Draw Super Mario style Question Mark Blocks
  public drawQuestionBlocks(blocks: QuestionBlock[], cameraX: number, gameTime: number) {
    const ctx = this.ctx;

    blocks.forEach(block => {
      const screenX = block.x - cameraX;
      // Skip offscreen
      if (screenX < -60 || screenX > ctx.canvas.width + 60) return;

      const screenY = block.y + block.bumpOffset;
      const w = block.width;
      const h = block.height;

      ctx.save();
      ctx.translate(screenX, screenY);

      if (!block.hit) {
        // --- UNHIT ACTIVE QUESTION BLOCK (Glowing Golden Animated Box) ---
        const pulse = Math.sin(gameTime * 4) * 0.08;

        // Block Drop Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.roundRect(2, 4, w, h, 6);
        ctx.fill();

        // 3D Beveled Outer Border
        ctx.fillStyle = '#b78103';
        ctx.beginPath();
        ctx.roundRect(0, 0, w, h, 6);
        ctx.fill();

        // Main Golden Yellow Face Gradient
        const blockGrad = ctx.createLinearGradient(0, 0, 0, h);
        blockGrad.addColorStop(0, '#fff176');
        blockGrad.addColorStop(0.3, '#fbc02d');
        blockGrad.addColorStop(1, '#f57f17');
        ctx.fillStyle = blockGrad;
        ctx.beginPath();
        ctx.roundRect(3, 3, w - 6, h - 6, 4);
        ctx.fill();

        // Inner Inset Bevel Line
        ctx.strokeStyle = '#fff9c4';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(5, 5, w - 10, h - 10);

        // 4 Corner Screw Rivets
        const rivetPositions = [
          { rx: 6, ry: 6 },
          { rx: w - 8, ry: 6 },
          { rx: 6, ry: h - 8 },
          { rx: w - 8, ry: h - 8 },
        ];
        ctx.fillStyle = '#5d4037';
        rivetPositions.forEach(pos => {
          ctx.beginPath();
          ctx.arc(pos.rx + 1, pos.ry + 1, 1.5, 0, Math.PI * 2);
          ctx.fill();
        });

        // Glowing Animated '?' Mark
        const qBob = Math.sin(gameTime * 5) * 1.5;
        ctx.save();
        ctx.translate(w / 2, h / 2 + qBob);
        ctx.scale(1 + pulse, 1 + pulse);

        // Question Mark Drop Shadow
        ctx.font = 'bold 24px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#795548';
        ctx.fillText('?', 1.5, 1.5);

        // Question Mark Core (White with orange highlight)
        ctx.fillStyle = '#ffffff';
        ctx.fillText('?', 0, 0);

        ctx.restore();

        // Top edge light highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.fillRect(4, 3, w - 8, 2);

      } else {
        // --- HIT EXHAUSTED BLOCK (Brown/Bronze Empty Used Box) ---
        // 3D Beveled Outer Border
        ctx.fillStyle = '#3e2723';
        ctx.beginPath();
        ctx.roundRect(0, 0, w, h, 6);
        ctx.fill();

        // Inner Matte Brown Texture
        const emptyGrad = ctx.createLinearGradient(0, 0, 0, h);
        emptyGrad.addColorStop(0, '#8d6e63');
        emptyGrad.addColorStop(1, '#5d4037');
        ctx.fillStyle = emptyGrad;
        ctx.beginPath();
        ctx.roundRect(3, 3, w - 6, h - 6, 4);
        ctx.fill();

        // Inset Rivets
        const rivetPositions = [
          { rx: 6, ry: 6 },
          { rx: w - 8, ry: 6 },
          { rx: 6, ry: h - 8 },
          { rx: w - 8, ry: h - 8 },
        ];
        ctx.fillStyle = '#271c19';
        rivetPositions.forEach(pos => {
          ctx.beginPath();
          ctx.arc(pos.rx + 1, pos.ry + 1, 1.5, 0, Math.PI * 2);
          ctx.fill();
        });

        // Inset cross/dimple
        ctx.strokeStyle = '#4e342e';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(w / 2, h / 2, 4, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    });
  }

  // Draw Floating Super Water Gun Power-Up Items
  public drawPowerUps(powerUps: PowerUpItem[], cameraX: number, gameTime: number) {
    const ctx = this.ctx;

    powerUps.forEach(pu => {
      if (pu.collected) return;

      const screenX = pu.x - cameraX;
      // Skip offscreen
      if (screenX < -50 || screenX > ctx.canvas.width + 50) return;

      const screenY = pu.y;
      const centerX = screenX + pu.width / 2;
      const centerY = screenY + pu.height / 2;

      ctx.save();
      ctx.translate(centerX, centerY);

      // Floating / Emerge Aura Ring
      const auraPulse = Math.sin(gameTime * 6) * 4;
      const aura = ctx.createRadialGradient(0, 0, 4, 0, 0, 22 + auraPulse);
      aura.addColorStop(0, 'rgba(0, 229, 255, 0.7)');
      aura.addColorStop(0.6, 'rgba(41, 182, 246, 0.25)');
      aura.addColorStop(1, 'rgba(0, 229, 255, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, 0, 22 + auraPulse, 0, Math.PI * 2);
      ctx.fill();

      // Gentle weapon float tilt
      const tilt = Math.sin(gameTime * 3) * 0.12;
      ctx.rotate(tilt);

      // --- SUPER WATER GUN SPRITE ---
      // Main Blaster Body (Cyan Futuristic Hydro Cannon)
      const gunGrad = ctx.createLinearGradient(-12, -8, 14, 8);
      gunGrad.addColorStop(0, '#00e5ff');
      gunGrad.addColorStop(0.5, '#00b0ff');
      gunGrad.addColorStop(1, '#0277bd');
      ctx.fillStyle = gunGrad;
      ctx.beginPath();
      ctx.roundRect(-8, -4, 18, 10, 3);
      ctx.fill();

      // Top Pressurized Translucent Blue Canister
      ctx.fillStyle = 'rgba(224, 247, 250, 0.75)';
      ctx.beginPath();
      ctx.roundRect(-6, -11, 14, 6, 3);
      ctx.fill();

      // Sloshing water inside canister
      ctx.fillStyle = '#00b0ff';
      ctx.fillRect(-5, -8, 12, 3.5);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-4, -8, 4, 1);

      // Nozzle / Barrel
      ctx.fillStyle = '#ff9800';
      ctx.fillRect(10, -2, 5, 5);
      ctx.fillStyle = '#ffe082';
      ctx.fillRect(15, -1, 2, 3);

      // Handle & Trigger
      ctx.fillStyle = '#37474f';
      ctx.fillRect(-6, 6, 5, 6);
      ctx.fillRect(-1, 6, 2, 3);

      // Glowing Neon Power Core
      ctx.fillStyle = '#76ff03';
      ctx.beginPath();
      ctx.arc(1, 1, 2, 0, Math.PI * 2);
      ctx.fill();

      // Pulsing Sparkle Ring
      ctx.strokeStyle = '#00e5ff';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(0, 0, 16 + Math.sin(gameTime * 8) * 2, 0, Math.PI * 2);
      ctx.stroke();

      ctx.restore();
    });
  }

  // Draw Pressurized Hydro Water Blasts
  public drawWaterBlasts(blasts: WaterBlast[], cameraX: number, gameTime: number) {
    const ctx = this.ctx;

    blasts.forEach(wb => {
      const screenX = wb.x - cameraX;
      // Skip offscreen
      if (screenX < -50 || screenX > ctx.canvas.width + 50) return;

      const screenY = wb.y;
      const isMovingLeft = wb.vx < 0;
      const speed = Math.hypot(wb.vx, wb.vy);
      const angle = Math.atan2(wb.vy, wb.vx);

      ctx.save();
      ctx.translate(screenX + wb.width / 2, screenY + wb.height / 2);
      ctx.rotate(angle);

      // Hydro Energy Glow
      const glow = ctx.createRadialGradient(0, 0, 2, 0, 0, 16);
      glow.addColorStop(0, 'rgba(0, 229, 255, 0.9)');
      glow.addColorStop(0.5, 'rgba(41, 182, 246, 0.4)');
      glow.addColorStop(1, 'rgba(0, 229, 255, 0)');
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(0, 0, 16, 0, Math.PI * 2);
      ctx.fill();

      // Pressurized Water Droplet Bullet (Teardrop / Capsule)
      const grad = ctx.createLinearGradient(-10, 0, 10, 0);
      grad.addColorStop(0, '#e0f7fa');
      grad.addColorStop(0.3, '#00e5ff');
      grad.addColorStop(0.8, '#0288d1');
      grad.addColorStop(1, '#01579b');
      ctx.fillStyle = grad;

      ctx.beginPath();
      ctx.ellipse(2, 0, 10, 5.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Glowing White Core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.ellipse(3, -1, 5, 2.2, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bubbly Wake / Splash Tail
      ctx.fillStyle = 'rgba(128, 216, 255, 0.7)';
      ctx.beginPath();
      ctx.arc(-8, -2, 2.5, 0, Math.PI * 2);
      ctx.arc(-12, 1, 2, 0, Math.PI * 2);
      ctx.arc(-15, -1, 1.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  // Draw Rich Cartoon Particles (Dust, Water Splashes, Comic Text, Stars, Rings, Bubbles, Confetti)
  public drawParticles(particles: Particle[], cameraX: number) {
    const ctx = this.ctx;

    particles.forEach(p => {
      const screenX = p.x - cameraX;
      // Skip offscreen particles
      if (screenX < -60 || screenX > ctx.canvas.width + 60) return;

      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
      ctx.fillStyle = p.color;

      if (p.shape === 'text' && p.text) {
        // Floating comic text (e.g. "+100", "COMBO x3!", "SUPER WATER GUN!")
        const fontSize = Math.round(p.size || 14);
        ctx.font = `900 ${fontSize}px 'Fredoka', 'Nunito', 'Segoe UI', sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Deep drop shadow
        ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
        ctx.fillText(p.text, screenX + 1.5, p.y + 2);

        // Heavy dark outline
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3.5;
        ctx.lineJoin = 'round';
        ctx.strokeText(p.text, screenX, p.y);

        // Bright vibrant core
        ctx.fillStyle = p.color;
        ctx.fillText(p.text, screenX, p.y);

      } else if (p.shape === 'ring') {
        // Expanding cartoon shockwave ring
        ctx.strokeStyle = p.color;
        ctx.lineWidth = Math.max(1.5, (p.size || 6) * 0.2);
        ctx.beginPath();
        ctx.arc(screenX, p.y, p.size, 0, Math.PI * 2);
        ctx.stroke();

      } else if (p.shape === 'bubble') {
        // Shimmering cartoon water/soap bubble
        const radius = p.size || 4;
        ctx.fillStyle = 'rgba(224, 247, 250, 0.4)';
        ctx.beginPath();
        ctx.arc(screenX, p.y, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 1;
        ctx.stroke();
        // Bubble highlight glint
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(screenX - radius * 0.35, p.y - radius * 0.35, radius * 0.3, 0, Math.PI * 2);
        ctx.fill();

      } else if (p.shape === 'heart') {
        // Cartoon heart
        const size = p.size || 6;
        ctx.save();
        ctx.translate(screenX, p.y);
        ctx.fillStyle = p.color || '#ff4081';
        ctx.beginPath();
        ctx.moveTo(0, size * 0.3);
        ctx.bezierCurveTo(-size, -size * 0.5, -size * 0.5, -size, 0, -size * 0.4);
        ctx.bezierCurveTo(size * 0.5, -size, size, -size * 0.5, 0, size * 0.3);
        ctx.fill();
        ctx.restore();

      } else if (p.shape === 'leaf') {
        // Weed leaf / thistle foliage bursting
        const size = p.size || 4;
        ctx.beginPath();
        ctx.ellipse(screenX, p.y, size, size * 0.5, (p.rotation || 0) + p.life * 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#1b5e20';
        ctx.lineWidth = 0.8;
        ctx.stroke();

      } else if (p.shape === 'sparkle' || p.shape === 'star') {
        // 4-pointed golden cartoon star
        const size = p.size;
        ctx.save();
        ctx.translate(screenX, p.y);
        if (p.rotation) ctx.rotate(p.rotation);
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size * 0.28, -size * 0.28);
        ctx.lineTo(size, 0);
        ctx.lineTo(size * 0.28, size * 0.28);
        ctx.lineTo(0, size);
        ctx.lineTo(-size * 0.28, size * 0.28);
        ctx.lineTo(-size, 0);
        ctx.lineTo(-size * 0.28, -size * 0.28);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

      } else if (p.shape === 'drop') {
        // Splashing teardrop
        ctx.beginPath();
        ctx.arc(screenX, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(screenX - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.35, 0, Math.PI * 2);
        ctx.fill();

      } else {
        // Standard cartoon soft circular poof
        ctx.beginPath();
        ctx.arc(screenX, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }
}
