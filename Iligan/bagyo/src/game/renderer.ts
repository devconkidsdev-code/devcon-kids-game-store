import { DexterPlayer, LevelConfig, Particle, SupplyItem } from '../types';

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  life: number;
  maxLife: number;
}

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private canvas: HTMLCanvasElement;
  public cameraY: number = 0;
  public cameraX: number = 0;
  private screenShake: number = 0;
  private lightningAlpha: number = 0;
  public floatingTexts: FloatingText[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Cannot get 2d context');
    this.ctx = context;
  }

  public triggerShake(amount: number = 10) {
    this.screenShake = Math.max(this.screenShake, amount);
  }

  public triggerLightning() {
    this.lightningAlpha = 0.85;
    this.triggerShake(12);
  }

  public addFloatingText(text: string, x: number, y: number, color: string = '#facc15') {
    this.floatingTexts.push({
      id: Math.random().toString(),
      text,
      x,
      y,
      color,
      life: 0,
      maxLife: 1.2,
    });
  }

  public updateAndRender(
    level: LevelConfig,
    player: DexterPlayer,
    waterLevel: number,
    particles: Particle[],
    gameTime: number,
    delta: number
  ) {
    const ctx = this.ctx;
    const viewWidth = this.canvas.width;
    const viewHeight = this.canvas.height;

    // Decay shake and lightning
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - delta * 25);
    }
    if (this.lightningAlpha > 0) {
      this.lightningAlpha = Math.max(0, this.lightningAlpha - delta * 2.5);
    }

    // Update Floating Texts
    this.floatingTexts = this.floatingTexts.filter(ft => {
      ft.life += delta;
      ft.y -= 25 * delta;
      return ft.life < ft.maxLife;
    });

    // Camera follow (Smooth interpolation targeting player with slight lead in facing direction)
    const targetCamY = player.y - viewHeight * 0.58;
    const targetCamX = player.x - viewWidth * 0.5;

    // Clamp camera
    this.cameraY += (targetCamY - this.cameraY) * 0.12;
    this.cameraX += (targetCamX - this.cameraX) * 0.12;

    this.cameraY = Math.max(0, Math.min(level.worldHeight - viewHeight, this.cameraY));
    this.cameraX = Math.max(0, Math.min(level.worldWidth - viewWidth, this.cameraX));

    // Apply Screen Shake
    const shakeOffsetX = (Math.random() - 0.5) * this.screenShake;
    const shakeOffsetY = (Math.random() - 0.5) * this.screenShake;

    ctx.save();
    ctx.translate(-this.cameraX + shakeOffsetX, -this.cameraY + shakeOffsetY);

    // 1. Draw Storm Sky & Atmospheric Background
    this.renderBackground(level, viewWidth, viewHeight, gameTime);

    // 2. Draw Distant Scenery (Submerged town, silhouettes of poles, trees)
    this.renderParallaxScenery(level, viewWidth, viewHeight, gameTime);

    // 3. Draw Ladders
    this.renderLadders(level);

    // 4. Draw Platforms & Rooftops
    this.renderPlatforms(level, gameTime);

    // 5. Draw Supplies (Collectibles)
    this.renderSupplies(level.supplies, gameTime);

    // 6. Draw Hazards
    this.renderHazards(level, gameTime);

    // 7. Draw Rescue Boat
    this.renderRescueBoat(level, gameTime);

    // 8. Draw Player (Dexter)
    this.renderDexter(player, gameTime);

    // 9. Draw Rising Flood Water & Surface Waves
    this.renderWater(level, waterLevel, gameTime);

    // 10. Draw Particles (Rain, Splashes, Sparks, Bubbles)
    this.renderParticles(particles);

    // 11. Draw Floating Text Indicators
    this.renderFloatingTexts();

    // 12. Draw Flashlight beam if acquired
    if (player.hasFlashlight) {
      this.renderFlashlightBeam(player);
    }

    // 13. Draw Lightning Flash Overlay
    if (this.lightningAlpha > 0) {
      ctx.fillStyle = `rgba(240, 248, 255, ${this.lightningAlpha})`;
      ctx.fillRect(this.cameraX, this.cameraY, viewWidth, viewHeight);
    }

    ctx.restore();
  }

  private renderBackground(level: LevelConfig, viewWidth: number, viewHeight: number, gameTime: number) {
    const ctx = this.ctx;
    const grad = ctx.createLinearGradient(0, this.cameraY, 0, this.cameraY + viewHeight);
    grad.addColorStop(0, level.weatherTheme.skyTop);
    grad.addColorStop(1, level.weatherTheme.skyBottom);
    ctx.fillStyle = grad;
    ctx.fillRect(this.cameraX, this.cameraY, viewWidth, viewHeight);

    // Dark turbulent storm cloud blobs in distance
    ctx.fillStyle = 'rgba(15, 23, 42, 0.4)';
    for (let i = 0; i < 6; i++) {
      const cx = ((i * 300 + gameTime * 20 * level.weatherTheme.windForce) % (level.worldWidth + 400)) - 200;
      const cy = this.cameraY + (i % 3) * 120 + 30;
      ctx.beginPath();
      ctx.arc(cx, cy, 140, 0, Math.PI * 2);
      ctx.arc(cx + 80, cy - 20, 110, 0, Math.PI * 2);
      ctx.arc(cx + 150, cy + 10, 130, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private renderParallaxScenery(level: LevelConfig, _viewWidth: number, _viewHeight: number, gameTime: number) {
    const ctx = this.ctx;

    // Distant mountain / high hill silhouettes at top
    ctx.fillStyle = 'rgba(30, 41, 59, 0.5)';
    ctx.beginPath();
    ctx.moveTo(0, 500);
    ctx.lineTo(300, 320);
    ctx.lineTo(700, 450);
    ctx.lineTo(1000, 260);
    ctx.lineTo(1400, 400);
    ctx.lineTo(1400, level.worldHeight);
    ctx.lineTo(0, level.worldHeight);
    ctx.closePath();
    ctx.fill();

    // Silhouettes of residential houses, electric poles, leaning palm trees
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.6)';
    ctx.lineWidth = 4;

    // Electric cables swaying in storm
    for (let y = 500; y < level.worldHeight; y += 450) {
      ctx.beginPath();
      const sag = Math.sin(gameTime * 3 + y) * 8 + 18;
      ctx.moveTo(100, y);
      ctx.quadraticCurveTo(level.worldWidth * 0.5, y + sag, level.worldWidth - 100, y);
      ctx.stroke();

      // Telephone poles
      ctx.fillStyle = 'rgba(51, 65, 85, 0.7)';
      ctx.fillRect(100, y - 20, 12, 180);
      ctx.fillRect(80, y - 10, 50, 8);
      ctx.fillRect(level.worldWidth - 110, y - 20, 12, 180);
      ctx.fillRect(level.worldWidth - 130, y - 10, 50, 8);
    }
  }

  private renderLadders(level: LevelConfig) {
    const ctx = this.ctx;
    ctx.fillStyle = '#cbd5e1';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;

    for (const lad of level.ladders) {
      // Rails
      ctx.strokeRect(lad.x, lad.y, 4, lad.height);
      ctx.strokeRect(lad.x + lad.width - 4, lad.y, 4, lad.height);

      // Rungs
      const rungs = Math.floor(lad.height / 20);
      for (let i = 0; i <= rungs; i++) {
        const ry = lad.y + i * 20;
        ctx.beginPath();
        ctx.moveTo(lad.x, ry);
        ctx.lineTo(lad.x + lad.width, ry);
        ctx.stroke();
      }

      // Small yellow climb indicator tape
      ctx.fillStyle = '#eab308';
      ctx.fillRect(lad.x + 2, lad.y + 4, lad.width - 4, 6);
    }
  }

  private renderPlatforms(level: LevelConfig, _gameTime: number) {
    const ctx = this.ctx;

    for (const p of level.platforms) {
      ctx.save();

      if (p.type === 'CRUMBLING') {
        const dur = p.durability ?? 100;
        const max = p.maxDurability ?? 100;
        const ratio = dur / max;

        if (ratio <= 0) {
          ctx.restore();
          continue; // Invisible / collapsed
        }

        ctx.fillStyle = `rgba(120, 113, 108, ${Math.max(0.2, ratio)})`;
        ctx.fillRect(p.x, p.y, p.width, p.height);

        // Crack lines if decaying
        if (ratio < 0.8) {
          ctx.strokeStyle = '#f87171';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(p.x + 10, p.y);
          ctx.lineTo(p.x + p.width * 0.4, p.y + p.height);
          ctx.lineTo(p.x + p.width * 0.8, p.y);
          ctx.stroke();
        }
      } else if (p.type === 'ONE_WAY') {
        // Wooden planks or metal walkway
        ctx.fillStyle = p.color || '#64748b';
        ctx.fillRect(p.x, p.y, p.width, p.height);

        // Top highlight
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(p.x, p.y, p.width, 3);

        // Supports
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.strokeRect(p.x, p.y, p.width, p.height);
      } else if (p.type === 'SLIPPERY') {
        // Wet tin roof
        ctx.fillStyle = '#475569';
        ctx.fillRect(p.x, p.y, p.width, p.height);

        // Corrugated stripes
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        for (let x = p.x; x < p.x + p.width; x += 14) {
          ctx.beginPath();
          ctx.moveTo(x, p.y);
          ctx.lineTo(x, p.y + p.height);
          ctx.stroke();
        }

        // Wet shine
        ctx.fillStyle = 'rgba(186, 230, 253, 0.4)';
        ctx.fillRect(p.x, p.y, p.width, 4);
      } else if (p.type === 'FLOATING') {
        // Wooden buoyant crate / pontoon
        ctx.fillStyle = p.color || '#b45309';
        ctx.fillRect(p.x, p.y, p.width, p.height);

        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 3;
        ctx.strokeRect(p.x, p.y, p.width, p.height);

        // Cross ropes
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.width, p.y + p.height);
        ctx.moveTo(p.x + p.width, p.y);
        ctx.lineTo(p.x, p.y + p.height);
        ctx.stroke();
      } else {
        // Solid Building / Ground / Concrete
        ctx.fillStyle = p.color || '#334155';
        ctx.fillRect(p.x, p.y, p.width, p.height);

        // Border / top curb
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(p.x, p.y + p.height - 4, p.width, 4);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(p.x, p.y, p.width, 4);
      }

      ctx.restore();
    }
  }

  private renderSupplies(supplies: SupplyItem[], gameTime: number) {
    const ctx = this.ctx;

    for (const item of supplies) {
      if (item.collected) continue;

      const bobOffset = Math.sin(gameTime * 4 + item.x) * 4;
      const drawY = item.y + bobOffset;

      // Glow halo
      ctx.save();
      const glowGrad = ctx.createRadialGradient(
        item.x + item.width * 0.5,
        drawY + item.height * 0.5,
        4,
        item.x + item.width * 0.5,
        drawY + item.height * 0.5,
        24
      );
      glowGrad.addColorStop(0, item.color);
      glowGrad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(item.x + item.width * 0.5, drawY + item.height * 0.5, 24, 0, Math.PI * 2);
      ctx.fill();

      // Rounded container pill for icon
      ctx.fillStyle = '#1e293b';
      ctx.strokeStyle = item.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(item.x, drawY, item.width, item.height, 8);
      ctx.fill();
      ctx.stroke();

      // Icon emoji
      ctx.font = '18px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.icon, item.x + item.width * 0.5, drawY + item.height * 0.5);

      // Mini Name Tag above
      ctx.font = 'bold 10px sans-serif';
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(item.name, item.x + item.width * 0.5, drawY - 8);

      ctx.restore();
    }
  }

  private renderHazards(level: LevelConfig, gameTime: number) {
    const ctx = this.ctx;

    for (const h of level.hazards) {
      if (h.type === 'ELECTRIC') {
        // Electric generator / wire spark
        ctx.fillStyle = '#450a0a';
        ctx.fillRect(h.x, h.y, h.width, h.height);

        // Warning Stripes
        ctx.fillStyle = '#eab308';
        ctx.fillRect(h.x + 4, h.y + 2, 8, h.height - 4);
        ctx.fillRect(h.x + 20, h.y + 2, 8, h.height - 4);
        ctx.fillRect(h.x + 36, h.y + 2, 8, h.height - 4);

        // Sparks
        if (Math.sin(gameTime * 15 + h.x) > 0.3) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(h.x + Math.random() * h.width, h.y);
          ctx.lineTo(h.x + Math.random() * h.width, h.y - 14);
          ctx.lineTo(h.x + Math.random() * h.width, h.y - 4);
          ctx.stroke();
        }
      }
    }
  }

  private renderRescueBoat(level: LevelConfig, gameTime: number) {
    const ctx = this.ctx;
    const boat = level.boat;
    const bob = Math.sin(gameTime * 2.5) * 4;
    const bx = boat.x;
    const by = boat.y + bob;

    ctx.save();

    // Boat Hull
    ctx.fillStyle = '#dc2626'; // Rescue Red
    ctx.beginPath();
    ctx.moveTo(bx, by + 30);
    ctx.lineTo(bx + 20, by + boat.height);
    ctx.lineTo(bx + boat.width - 20, by + boat.height);
    ctx.lineTo(bx + boat.width, by + 25);
    ctx.lineTo(bx + boat.width - 15, by + 18);
    ctx.lineTo(bx + 15, by + 18);
    ctx.closePath();
    ctx.fill();

    // White stripe
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(bx + 16, by + 28, boat.width - 32, 10);

    // Cabin
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(bx + 40, by + 2, boat.width - 70, 24);

    // Windows
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(bx + 46, by + 6, 16, 12);
    ctx.fillRect(bx + 68, by + 6, 16, 12);

    // Cabin Roof & Mast
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(bx + 35, by, boat.width - 60, 4);
    ctx.fillRect(bx + 55, by - 16, 4, 16);

    // Emergency Flashing Beacon Light
    const beaconFlash = (Math.sin(gameTime * 8) + 1) * 0.5;
    ctx.fillStyle = `rgba(234, 179, 8, ${0.4 + beaconFlash * 0.6})`;
    ctx.beginPath();
    ctx.arc(bx + 57, by - 18, 6 + beaconFlash * 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(bx + 57, by - 18, 4, 0, Math.PI * 2);
    ctx.fill();

    // Rescue Flag / Marker
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.moveTo(bx + 59, by - 16);
    ctx.lineTo(bx + 85, by - 10);
    ctx.lineTo(bx + 59, by - 4);
    ctx.fill();

    // "RESCUE 01" / "EVACUATION" Text
    ctx.font = 'bold 9px sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.textAlign = 'center';
    ctx.fillText('EVAC BOAT', bx + boat.width * 0.5, by + 36);

    // Pilot Waving
    ctx.fillStyle = '#f97316'; // Life vest
    ctx.fillRect(bx + 48, by + 8, 12, 10);
    ctx.fillStyle = '#ffedd5'; // Face
    ctx.beginPath();
    ctx.arc(bx + 54, by + 5, 4, 0, Math.PI * 2);
    ctx.fill();

    // Waving Hand
    const handWiggle = Math.sin(gameTime * 10) * 4;
    ctx.strokeStyle = '#ffedd5';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bx + 58, by + 8);
    ctx.lineTo(bx + 64 + handWiggle, by - 2);
    ctx.stroke();

    // Signpost "RESCUE POINT - GET ON BOARD!"
    ctx.fillStyle = '#facc15';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText('RESCUE BOAT (GOAL)', bx + boat.width * 0.5, by - 28);

    ctx.restore();
  }

  private renderDexter(player: DexterPlayer, gameTime: number) {
    const ctx = this.ctx;
    const px = player.x;
    const py = player.y;
    const facing = player.facing;

    ctx.save();

    // Invulnerability blink
    if (player.isInvulnerable && Math.floor(gameTime * 20) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }

    // Direction flip
    if (facing === 'left') {
      ctx.translate(px + player.width, py);
      ctx.scale(-1, 1);
    } else {
      ctx.translate(px, py);
    }

    const legOffset = (player.animationFrame % 2 === 1) ? 5 : -3;
    const isMoving = Math.abs(player.vx) > 0.5;

    // 1. Dexter's Legs / Boots
    ctx.fillStyle = '#0f172a'; // Black waterproof rainboots
    if (player.isClimbing) {
      ctx.fillRect(6, 36 + legOffset, 8, 12);
      ctx.fillRect(18, 36 - legOffset, 8, 12);
    } else if (player.isSwimming) {
      // Swimming kick
      const kick = Math.sin(gameTime * 12) * 6;
      ctx.fillRect(4, 38 + kick, 10, 8);
      ctx.fillRect(16, 38 - kick, 10, 8);
    } else {
      // Running / Standing
      ctx.fillRect(6, 36 + (isMoving ? legOffset : 0), 8, 12);
      ctx.fillRect(18, 36 - (isMoving ? legOffset : 0), 8, 12);
    }

    // 2. Dexter's Backpack
    ctx.fillStyle = '#1e3a8a';
    ctx.beginPath();
    ctx.roundRect(-4, 14, 10, 20, 3);
    ctx.fill();

    // 3. Dexter's Yellow Raincoat / Poncho
    ctx.fillStyle = player.hasLifeVest ? '#f97316' : '#eab308'; // Orange if life vest, otherwise yellow raincoat
    ctx.beginPath();
    ctx.roundRect(4, 14, 24, 24, 4);
    ctx.fill();

    // Life vest straps / collar if active
    if (player.hasLifeVest) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(8, 16, 4, 20);
      ctx.fillRect(20, 16, 4, 20);
      // Whistle
      ctx.fillStyle = '#facc15';
      ctx.fillRect(10, 24, 3, 5);
    } else {
      // Raincoat buttons
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(15, 18, 3, 3);
      ctx.fillRect(15, 26, 3, 3);
    }

    // 4. Dexter's Arms
    ctx.fillStyle = player.hasLifeVest ? '#f97316' : '#eab308';
    if (player.isClimbing) {
      ctx.fillRect(0, 12 - legOffset, 6, 14);
      ctx.fillRect(26, 12 + legOffset, 6, 14);
    } else if (player.isSwimming) {
      const armStroke = Math.cos(gameTime * 12) * 8;
      ctx.fillRect(20 + armStroke, 18, 12, 6);
    } else {
      ctx.fillRect(20, 18 + (isMoving ? -legOffset : 0), 8, 14);
    }

    // 5. Dexter's Head & Rain Hood
    ctx.fillStyle = player.hasLifeVest ? '#f97316' : '#eab308'; // Hood matching coat
    ctx.beginPath();
    ctx.arc(16, 10, 11, 0, Math.PI * 2);
    ctx.fill();

    // Dexter's Face
    ctx.fillStyle = '#ffedd5';
    ctx.beginPath();
    ctx.arc(19, 10, 7, 0, Math.PI * 2);
    ctx.fill();

    // Dexter's Hair bang
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.arc(17, 6, 4, 0, Math.PI * 2);
    ctx.fill();

    // Dexter's Eyes & Expression (Looking forward)
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(22, 9, 2, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrow determined
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(18, 6);
    ctx.lineTo(24, 7);
    ctx.stroke();

    // Mouth
    if (player.isSubmerged) {
      // Mouth holding breath (puffed)
      ctx.fillStyle = '#f87171';
      ctx.beginPath();
      ctx.arc(22, 13, 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Determined smile/grit
      ctx.beginPath();
      ctx.moveTo(19, 13);
      ctx.lineTo(23, 13);
      ctx.stroke();
    }

    // Electrocution crackle overlay
    if (player.isElectrocuted) {
      ctx.save();
      // Neon electric glow halo
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 15;
      ctx.strokeStyle = Math.floor(gameTime * 30) % 2 === 0 ? '#38bdf8' : '#facc15';
      ctx.lineWidth = 2.5;

      // Crackling lightning bolts across Dexter
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        const startX = 4 + Math.random() * 24;
        const startY = 4 + Math.random() * 40;
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX + (Math.random() - 0.5) * 16, startY + (Math.random() - 0.5) * 16);
        ctx.lineTo(startX + (Math.random() - 0.5) * 20, startY + (Math.random() - 0.5) * 20);
        ctx.stroke();
      }

      // Skeleton flash silhouette overlay
      if (Math.floor(gameTime * 40) % 3 === 0) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.fillRect(4, 4, 24, 44);
      }
      ctx.restore();
    }

    // Name tag & 5-lives indicator above player
    ctx.font = 'bold 10px sans-serif';
    ctx.fillStyle = '#facc15';
    ctx.textAlign = 'center';
    ctx.fillText('DEXTER', 16, -14);

    // Mini hearts overhead
    const lives = player.lives ?? 5;
    const totalLives = player.maxLives ?? 5;
    let heartIcons = '';
    for (let i = 0; i < totalLives; i++) {
      heartIcons += (i < lives) ? '❤️' : '🖤';
    }
    ctx.font = '8px sans-serif';
    ctx.fillText(heartIcons, 16, -4);

    ctx.restore();
  }

  private renderWater(level: LevelConfig, waterLevel: number, gameTime: number) {
    const ctx = this.ctx;
    const viewWidth = level.worldWidth;
    const waterDepth = level.worldHeight - waterLevel;

    if (waterDepth <= 0) return;

    ctx.save();

    // 1. Murky flood water body gradient
    const waterGrad = ctx.createLinearGradient(0, waterLevel, 0, level.worldHeight);
    waterGrad.addColorStop(0, 'rgba(14, 116, 144, 0.72)'); // Teal murky surface
    waterGrad.addColorStop(0.3, 'rgba(15, 76, 110, 0.85)');
    waterGrad.addColorStop(1, 'rgba(8, 47, 73, 0.95)'); // Deep dark flood bottom

    // Draw wavy surface polygon
    ctx.fillStyle = waterGrad;
    ctx.beginPath();
    ctx.moveTo(0, level.worldHeight);
    ctx.lineTo(0, waterLevel);

    const wavePoints = 40;
    const step = viewWidth / wavePoints;
    for (let i = 0; i <= wavePoints; i++) {
      const wx = i * step;
      const wy = waterLevel + Math.sin(wx * 0.02 + gameTime * 4) * 5 + Math.cos(wx * 0.04 - gameTime * 3) * 3;
      ctx.lineTo(wx, wy);
    }

    ctx.lineTo(viewWidth, level.worldHeight);
    ctx.closePath();
    ctx.fill();

    // 2. White foam crest along the water line
    ctx.strokeStyle = 'rgba(240, 253, 250, 0.75)';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    for (let i = 0; i <= wavePoints; i++) {
      const wx = i * step;
      const wy = waterLevel + Math.sin(wx * 0.02 + gameTime * 4) * 5 + Math.cos(wx * 0.04 - gameTime * 3) * 3;
      if (i === 0) ctx.moveTo(wx, wy);
      else ctx.lineTo(wx, wy);
    }
    ctx.stroke();

    // 3. Floating debris in water (twigs, leaves, floating trash bags)
    ctx.fillStyle = '#78350f';
    for (let i = 0; i < 8; i++) {
      const dx = ((i * 180 + gameTime * 30) % viewWidth);
      const dy = waterLevel + 12 + (i % 4) * 18 + Math.sin(gameTime * 2 + i) * 4;
      if (dy < level.worldHeight) {
        ctx.fillRect(dx, dy, 22, 5);
      }
    }

    ctx.restore();
  }

  private renderParticles(particles: Particle[]) {
    const ctx = this.ctx;
    for (const p of particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha * (1 - p.life / p.maxLife);
      ctx.fillStyle = p.color;

      if (p.type === 'RAIN') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.vx * 1.5, p.y + p.vy * 1.5);
        ctx.stroke();
      } else if (p.type === 'BUBBLE') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  private renderFloatingTexts() {
    const ctx = this.ctx;
    for (const ft of this.floatingTexts) {
      const alpha = 1 - ft.life / ft.maxLife;
      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.font = 'bold 15px sans-serif';
      ctx.fillStyle = ft.color;
      ctx.textAlign = 'center';
      ctx.shadowColor = '#000000';
      ctx.shadowBlur = 6;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }
  }

  private renderFlashlightBeam(player: DexterPlayer) {
    const ctx = this.ctx;
    const px = player.x + (player.facing === 'right' ? player.width - 4 : 4);
    const py = player.y + 18;
    const dir = player.facing === 'right' ? 1 : -1;
    const beamLength = 220;
    const beamAngle = 0.35;

    ctx.save();
    const coneGrad = ctx.createRadialGradient(px, py, 10, px + dir * beamLength, py, beamLength);
    coneGrad.addColorStop(0, 'rgba(254, 240, 138, 0.45)');
    coneGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');

    ctx.fillStyle = coneGrad;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.arc(px, py, beamLength, dir === 1 ? -beamAngle : Math.PI - beamAngle, dir === 1 ? beamAngle : Math.PI + beamAngle);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
