import { Creature, LevelConfig, Obstacle, Particle, PlayerStats, Vector2D, WaterBucket } from '../types';

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  canvasWidth: number;
  canvasHeight: number;
  playerPos: Vector2D;
  playerFacingAngle: number;
  playerMoving: boolean;
  playerWalkCycle: number;
  stats: PlayerStats;
  creatures: Creature[];
  buckets: WaterBucket[];
  level: LevelConfig;
  obstacles: Obstacle[];
  particles: Particle[];
  screenShake: number;
  time: number;
  jumpscareProgress?: number; // 1.0 -> 0.0 when jumpscare is active
}

export class GameRenderer {
  // Lighting offscreen canvas for crisp performance
  private lightCanvas: HTMLCanvasElement;
  private lightCtx: CanvasRenderingContext2D;

  constructor() {
    this.lightCanvas = document.createElement('canvas');
    this.lightCtx = this.lightCanvas.getContext('2d')!;
  }

  public render(rc: RenderContext) {
    const { ctx, canvasWidth, canvasHeight, playerPos, screenShake, level, creatures } = rc;

    // Resize light canvas if needed
    if (this.lightCanvas.width !== canvasWidth || this.lightCanvas.height !== canvasHeight) {
      this.lightCanvas.width = canvasWidth;
      this.lightCanvas.height = canvasHeight;
    }

    // Camera offset (center on player, clamped to level map bounds)
    let camX = playerPos.x - canvasWidth / 2;
    let camY = playerPos.y - canvasHeight / 2;

    // Clamp camera within map
    camX = Math.max(0, Math.min(level.mapWidth - canvasWidth, camX));
    camY = Math.max(0, Math.min(level.mapHeight - canvasHeight, camY));

    // Apply screen shake
    if (screenShake > 0) {
      camX += (Math.random() - 0.5) * screenShake * 22;
      camY += (Math.random() - 0.5) * screenShake * 22;
    }

    ctx.save();
    // Clear canvas
    ctx.fillStyle = '#06080a';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Apply Camera transform for world objects
    ctx.translate(-camX, -camY);

    // 1. Draw Ground Texture & Details
    this.drawGround(ctx, level, camX, camY, canvasWidth, canvasHeight, rc.time);

    // 2. Draw Safe House / Sanctuary
    this.drawHouse(ctx, level, rc.stats, rc.time);

    // 3. Draw Obstacles (Bushes, Fences, Chests, Wells, Rocks)
    this.drawObstacles(ctx, rc.obstacles, rc.time);

    // 4. Draw Water Buckets
    this.drawBuckets(ctx, rc.buckets, rc.time);

    // 5. Draw All Creatures in the level (behind trees or in dark)
    for (const c of creatures) {
      this.drawCreature(ctx, c, rc.time);
    }

    // 6. Draw Player (Boy in blue shirt, gray pants)
    this.drawPlayer(ctx, rc);

    // 7. Draw Trees with overhead branches
    this.drawTrees(ctx, rc.obstacles, rc.time);

    // 8. Draw Active Particles (footsteps, water splashes, dust motes)
    this.drawParticles(ctx, rc.particles);

    ctx.restore();

    // 9. Draw Flashlight & Fog of War Lighting Mask Overlay
    this.drawLightingOverlay(ctx, rc, camX, camY);

    // 10. Draw Screen Blood / Damage Vignette when damaged or low health
    this.drawVignetteAndEffects(ctx, rc);

    // 11. Draw Intense Terrifying Jumpscare Overlay if caught
    if (rc.jumpscareProgress && rc.jumpscareProgress > 0) {
      this.drawJumpscareOverlay(ctx, rc.canvasWidth, rc.canvasHeight, rc.jumpscareProgress, rc.time);
    }
  }

  /**
   * Draw the Safe House / Sanctuary where buckets must be delivered
   */
  private drawHouse(ctx: CanvasRenderingContext2D, level: LevelConfig, stats: PlayerStats, time: number) {
    if (!level.housePosition || !level.houseSize) return;

    const hx = level.housePosition.x;
    const hy = level.housePosition.y;
    const hw = level.houseSize.width;
    const hh = level.houseSize.height;

    ctx.save();
    ctx.translate(hx, hy);

    // Safe zone glowing boundary circle
    const isCarrying = !!stats.carryingBucketId;
    const beaconPulse = Math.sin(time * 3) * 0.15 + 0.85;
    
    ctx.fillStyle = isCarrying 
      ? 'rgba(56, 189, 248, 0.08)' 
      : 'rgba(251, 191, 36, 0.05)';
    ctx.beginPath();
    ctx.arc(0, 0, 75 * beaconPulse, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = isCarrying 
      ? 'rgba(56, 189, 248, 0.6)' 
      : 'rgba(251, 191, 36, 0.35)';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.arc(0, 0, 70 * beaconPulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // House shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(-hw / 2 + 6, -hh / 2 + 8, hw, hh);

    // House timber walls
    ctx.fillStyle = '#2d1f14';
    ctx.fillRect(-hw / 2, -hh / 2, hw, hh);

    // Wooden wall planks
    ctx.strokeStyle = '#1e140d';
    ctx.lineWidth = 2;
    for (let y = -hh / 2 + 8; y < hh / 2; y += 10) {
      ctx.beginPath();
      ctx.moveTo(-hw / 2, y);
      ctx.lineTo(hw / 2, y);
      ctx.stroke();
    }

    // Triangular Gable Roof / Shingles
    ctx.fillStyle = '#451a1a';
    ctx.beginPath();
    ctx.moveTo(-hw / 2 - 8, -hh / 2);
    ctx.lineTo(0, -hh / 2 - 24);
    ctx.lineTo(hw / 2 + 8, -hh / 2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#2b0e0e';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Chimney with cozy smoke
    ctx.fillStyle = '#4b5563';
    ctx.fillRect(hw / 4, -hh / 2 - 20, 10, 16);
    // Smoke puffs
    ctx.fillStyle = 'rgba(203, 213, 225, 0.25)';
    const smokeY = (time * 15) % 30;
    ctx.beginPath();
    ctx.arc(hw / 4 + 5 + Math.sin(time * 2) * 4, -hh / 2 - 22 - smokeY, 4 + smokeY * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Warm glowing lantern at porch / window
    const lanternGlow = Math.sin(time * 4) * 0.1 + 0.9;
    const windowGrad = ctx.createRadialGradient(0, 4, 2, 0, 4, 30);
    windowGrad.addColorStop(0, `rgba(251, 191, 36, ${0.9 * lanternGlow})`);
    windowGrad.addColorStop(0.5, `rgba(245, 158, 11, ${0.4 * lanternGlow})`);
    windowGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = windowGrad;
    ctx.beginPath();
    ctx.arc(0, 4, 30, 0, Math.PI * 2);
    ctx.fill();

    // Glowing window
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-12, -4, 24, 16);
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.strokeRect(-12, -4, 24, 16);
    ctx.beginPath();
    ctx.moveTo(0, -4);
    ctx.lineTo(0, 12);
    ctx.moveTo(-12, 4);
    ctx.lineTo(12, 4);
    ctx.stroke();

    // Porch doorstep / drop point indicator
    ctx.fillStyle = '#573319';
    ctx.fillRect(-16, hh / 2 - 2, 32, 8);

    // Prompt text floating above house: "DELIVERY POINT" or "HOUSE"
    ctx.fillStyle = isCarrying ? '#38bdf8' : '#fde047';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    const label = isCarrying ? '⚡ DELIVER BUCKET HERE ⚡' : '🏡 SAFE HOUSE';
    ctx.fillText(label, 0, -hh / 2 - 28);

    // Display delivered buckets sitting safely at house porch
    const deliveredCount = stats.bucketsDeliveredInLevel || 0;
    for (let i = 0; i < deliveredCount; i++) {
      const bx = -20 + i * 20;
      const by = hh / 2 + 12;
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(bx - 5, by - 4, 10, 8);
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.ellipse(bx, by - 4, 4.5, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  /**
   * Draw the dark forest terrain
   */
  private drawGround(
    ctx: CanvasRenderingContext2D,
    level: LevelConfig,
    camX: number,
    camY: number,
    width: number,
    height: number,
    time: number
  ) {
    // Deep dark forest soil base
    ctx.fillStyle = '#0d1317';
    ctx.fillRect(camX, camY, width, height);

    // Grid tile details with subtle moss patches
    const tileSize = 80;
    const startX = Math.floor(camX / tileSize) * tileSize;
    const startY = Math.floor(camY / tileSize) * tileSize;
    const endX = camX + width;
    const endY = camY + height;

    for (let x = startX; x <= endX; x += tileSize) {
      for (let y = startY; y <= endY; y += tileSize) {
        const hash = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
        const seed = hash - Math.floor(hash);

        if (seed > 0.6) {
          // Mossy dark patch
          ctx.fillStyle = seed > 0.85 ? '#101a1e' : '#0a1014';
          ctx.beginPath();
          ctx.ellipse(x + 40, y + 40, 28, 20, seed * Math.PI, 0, Math.PI * 2);
          ctx.fill();
        }

        // Small spooky grass tufts
        if (seed < 0.25) {
          ctx.strokeStyle = '#182b28';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(x + 20, y + 30);
          ctx.lineTo(x + 16, y + 18);
          ctx.moveTo(x + 23, y + 30);
          ctx.lineTo(x + 28, y + 16);
          ctx.stroke();
        }

        // Small fallen dark autumn leaves
        if (seed > 0.4 && seed < 0.48) {
          ctx.fillStyle = '#2d1f14';
          ctx.beginPath();
          ctx.ellipse(x + 50, y + 55, 4, 2.5, seed * 4, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    // Outer boundary fence / dark mist barrier
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 6;
    ctx.strokeRect(10, 10, level.mapWidth - 20, level.mapHeight - 20);
  }

  /**
   * Draw Obstacles like Well, Chests, Fences, Rocks, Bushes
   */
  private drawObstacles(ctx: CanvasRenderingContext2D, obstacles: Obstacle[], time: number) {
    for (const obs of obstacles) {
      if (obs.type === 'tree') continue; // drawn in top layer

      ctx.save();
      ctx.translate(obs.x, obs.y);

      if (obs.type === 'well') {
        // Ancient Stone Well (from sketch)
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.beginPath();
        ctx.ellipse(0, 10, 32, 22, 0, 0, Math.PI * 2);
        ctx.fill();

        // Stone rim
        ctx.fillStyle = '#2c3338';
        ctx.beginPath();
        ctx.arc(0, 0, 24, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#1a1f24';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Dark deep water inside
        ctx.fillStyle = '#060d14';
        ctx.beginPath();
        ctx.arc(0, 0, 17, 0, Math.PI * 2);
        ctx.fill();

        // Water reflection shimmer
        ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
        ctx.beginPath();
        ctx.arc(0 + Math.sin(time * 2) * 2, 0, 12, 0, Math.PI * 2);
        ctx.fill();

        // Wooden roof beams
        ctx.fillStyle = '#452b1b';
        ctx.fillRect(-22, -18, 44, 8);
        ctx.fillRect(-4, -28, 8, 20);
      } else if (obs.type === 'chest') {
        // Wooden Supply Crate / Chest (drawn at bottom spawn in sketch)
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(-obs.width / 2 + 3, -obs.height / 2 + 4, obs.width, obs.height);

        // Wood chest body
        ctx.fillStyle = '#4a2e1b';
        ctx.fillRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height);

        // Metal corners & lock
        ctx.strokeStyle = '#7c5836';
        ctx.lineWidth = 2;
        ctx.strokeRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height);

        // Cross braces (like sketched chest)
        ctx.strokeStyle = '#2b1b11';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-obs.width / 2, -obs.height / 2);
        ctx.lineTo(obs.width / 2, obs.height / 2);
        ctx.moveTo(obs.width / 2, -obs.height / 2);
        ctx.lineTo(-obs.width / 2, obs.height / 2);
        ctx.stroke();

        // Golden lock
        ctx.fillStyle = '#d97706';
        ctx.fillRect(-3, -2, 6, 5);
      } else if (obs.type === 'bush') {
        // Spooky bramble bush
        ctx.fillStyle = 'rgba(0,0,0,0.4)';
        ctx.beginPath();
        ctx.ellipse(0, 4, 18, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#14291f';
        ctx.beginPath();
        ctx.arc(-6, -2, 10, 0, Math.PI * 2);
        ctx.arc(6, -4, 11, 0, Math.PI * 2);
        ctx.arc(0, 5, 9, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#1f3d2f';
        ctx.beginPath();
        ctx.arc(-3, -4, 7, 0, Math.PI * 2);
        ctx.arc(4, 0, 6, 0, Math.PI * 2);
        ctx.fill();
      } else if (obs.type === 'rock') {
        // Weathered tombstone / rock
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.beginPath();
        ctx.ellipse(0, 6, 18, 10, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.ellipse(0, 0, 16, 11, 0.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Crack detail
        ctx.strokeStyle = '#0f172a';
        ctx.beginPath();
        ctx.moveTo(-5, -6);
        ctx.lineTo(2, 2);
        ctx.stroke();
      } else if (obs.type === 'fence') {
        // Wooden fence
        ctx.fillStyle = '#3c2415';
        ctx.fillRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height);
        ctx.strokeStyle = '#5a3820';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(-obs.width / 2, -obs.height / 2, obs.width, obs.height);

        // Fence posts
        const posts = Math.max(2, Math.floor(obs.width / 25));
        for (let p = 0; p <= posts; p++) {
          const px = -obs.width / 2 + (p / posts) * obs.width;
          ctx.fillStyle = '#28170d';
          ctx.fillRect(px - 3, -obs.height / 2 - 4, 6, obs.height + 8);
        }
      }

      ctx.restore();
    }
  }

  /**
   * Draw Water Buckets (The quest objectives)
   */
  private drawBuckets(ctx: CanvasRenderingContext2D, buckets: WaterBucket[], time: number) {
    for (const b of buckets) {
      if (b.collected) continue;

      ctx.save();
      ctx.translate(b.x, b.y);

      // Water glow aura
      const pulse = Math.sin(time * 3 + b.pulsePhase) * 0.2 + 0.8;
      const glowGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, 24 * pulse);
      glowGrad.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
      glowGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(0, 0, 24 * pulse, 0, Math.PI * 2);
      ctx.fill();

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.beginPath();
      ctx.ellipse(0, 8, 12, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Bucket metal body (matches the sketch illustration!)
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(-9, -6);
      ctx.lineTo(9, -6);
      ctx.lineTo(7, 8);
      ctx.lineTo(-7, 8);
      ctx.closePath();
      ctx.fill();

      // Metallic rim bands
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Metal ring line
      ctx.strokeStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(-8, 1);
      ctx.lineTo(8, 1);
      ctx.stroke();

      // Water surface inside
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.ellipse(0, -6, 8.5, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Sparkling water ripple
      ctx.fillStyle = '#e0f2fe';
      ctx.beginPath();
      ctx.arc(-2 + Math.sin(time * 4) * 2, -6, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Bucket metal handle (arch over bucket)
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, -7, 9, Math.PI, 0);
      ctx.stroke();

      // Floating water droplet sparkles
      const sparkleY = -12 + Math.sin(time * 5 + b.pulsePhase) * 4;
      ctx.fillStyle = 'rgba(125, 211, 252, 0.9)';
      ctx.beginPath();
      ctx.arc(0, sparkleY, 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  /**
   * Draw the Boy character (Blue shirt, gray pants, holding flashlight)
   */
  private drawPlayer(ctx: CanvasRenderingContext2D, rc: RenderContext) {
    const { playerPos, playerFacingAngle, playerMoving, playerWalkCycle, stats, time } = rc;

    ctx.save();
    ctx.translate(playerPos.x, playerPos.y);

    // Invulnerability flashing when hit
    if (stats.invulnerableTime > 0) {
      const flash = Math.sin(time * 24);
      if (flash > 0) {
        ctx.globalAlpha = 0.4;
      }
    }

    // Shadow underneath player
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.beginPath();
    ctx.ellipse(0, 10, 14, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rotate player to facing angle
    ctx.rotate(playerFacingAngle);

    // 1. Gray Pants / Legs (animated walking cycle)
    const legOffset = playerMoving ? Math.sin(playerWalkCycle) * 5 : 0;

    // Left leg
    ctx.fillStyle = '#64748b'; // Gray pants
    ctx.fillRect(-7, -4 + legOffset, 5, 12);
    // Left shoe
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-7, 8 + legOffset, 5, 4);

    // Right leg
    ctx.fillStyle = '#64748b'; // Gray pants
    ctx.fillRect(2, -4 - legOffset, 5, 12);
    // Right shoe
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(2, 8 - legOffset, 5, 4);

    // 2. Blue Shirt / Torso (Prompt: "Boy in a blue shirt")
    ctx.fillStyle = '#2563eb'; // Rich blue shirt
    ctx.beginPath();
    ctx.roundRect(-9, -10, 18, 15, 3);
    ctx.fill();

    // Collar / shirt crease
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -10);
    ctx.lineTo(0, -4);
    ctx.stroke();

    // 3. Arms & Hands holding flashlight
    // Left arm
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(-12, -8, 4, 8);
    // Left hand (skin tone)
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(-10, 1, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Right arm extending forward holding flashlight
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(7, -8, 5, 12);
    // Right hand
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(9, 5, 3, 0, Math.PI * 2);
    ctx.fill();

    // 4. Flashlight device in hand (drawn in prompt sketch)
    if (stats.flashlightOn) {
      // Flashlight metallic body
      ctx.fillStyle = '#334155';
      ctx.fillRect(8, 5, 4, 10);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(7, 13, 6, 3);

      // Yellow glowing lens head
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(10, 16, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Flashlight off
      ctx.fillStyle = '#334155';
      ctx.fillRect(8, 5, 4, 10);
    }

    // 5. Head & Hair (Round boy head from sketch)
    // Head base (skin)
    ctx.fillStyle = '#ffedd5';
    ctx.beginPath();
    ctx.arc(0, -9, 8, 0, Math.PI * 2);
    ctx.fill();

    // Dark brown/black messy boy hair
    ctx.fillStyle = '#292524';
    ctx.beginPath();
    ctx.arc(0, -11, 8.5, Math.PI, Math.PI * 2);
    ctx.lineTo(8, -8);
    ctx.lineTo(-8, -8);
    ctx.closePath();
    ctx.fill();

    // Small tuft of hair
    ctx.beginPath();
    ctx.moveTo(-3, -17);
    ctx.lineTo(0, -20);
    ctx.lineTo(2, -17);
    ctx.fill();

    // 6. If carrying a bucket, render water bucket in boy's hands
    if (stats.carryingBucketId) {
      ctx.save();
      ctx.translate(0, 10);
      // Small carried bucket
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(-6, -4);
      ctx.lineTo(6, -4);
      ctx.lineTo(5, 5);
      ctx.lineTo(-5, 5);
      ctx.closePath();
      ctx.fill();

      // Sloshing blue water inside
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.ellipse(0, -4, 5.5, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Sparkle
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(Math.sin(time * 6) * 2, -5, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  /**
   * Draw the Mysterious Creature (Spider-legged shadowy monster from sketch)
   */
  private drawCreature(ctx: CanvasRenderingContext2D, c: Creature, time: number) {
    ctx.save();
    ctx.translate(c.x, c.y);

    const isHunting = c.state === 'hunting';
    const isResting = c.state === 'resting';

    // Shadow under creature
    ctx.fillStyle = isHunting 
      ? 'rgba(80, 0, 0, 0.75)' 
      : isResting 
        ? 'rgba(30, 27, 75, 0.6)' 
        : 'rgba(0, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.ellipse(0, 12, isResting ? 34 : 28, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eerie dark smoke aura
    const auraPulse = Math.sin(time * (isHunting ? 10 : isResting ? 2 : 5)) * 4;
    const auraGrad = ctx.createRadialGradient(0, 0, 6, 0, 0, 36 + auraPulse);
    if (isHunting) {
      auraGrad.addColorStop(0, 'rgba(220, 38, 38, 0.45)');
      auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else if (isResting) {
      auraGrad.addColorStop(0, 'rgba(100, 116, 139, 0.35)');
      auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    } else {
      auraGrad.addColorStop(0, 'rgba(30, 41, 59, 0.4)');
      auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    }
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 36 + auraPulse, 0, Math.PI * 2);
    ctx.fill();

    // If resting, draw exhausted breath puffs
    if (isResting) {
      for (let p = 0; p < 3; p++) {
        const puffAge = ((time * 2 + p * 0.4) % 1.2);
        const puffY = -10 - puffAge * 20;
        const puffX = (p - 1) * 8 + Math.sin(time * 3 + p) * 4;
        ctx.fillStyle = `rgba(148, 163, 184, ${0.4 * (1 - puffAge / 1.2)})`;
        ctx.beginPath();
        ctx.arc(puffX, puffY, 3 + puffAge * 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Draw Long Spider-like Spindly Legs
    const legCount = 6;
    const legPhase = isResting ? 0 : c.legPhase;

    ctx.strokeStyle = isHunting ? '#450a0a' : isResting ? '#1e293b' : '#0f172a';
    ctx.lineWidth = 3.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (let i = 0; i < legCount; i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const pairIdx = Math.floor(i / 2);
      const legAngleOffset = (pairIdx - 1) * 0.4;
      const stepLift = isResting ? 0 : Math.sin(legPhase + i * (Math.PI / 3)) * 8;

      const joint1X = side * 14;
      const joint1Y = isResting ? 4 + pairIdx * 4 : -4 + pairIdx * 6;

      // Knee joint (resting creature collapses closer to ground)
      const kneeX = side * (32 + Math.abs(legAngleOffset) * (isResting ? 14 : 10));
      const kneeY = isResting ? -8 + pairIdx * 4 : -22 + stepLift + pairIdx * 8;

      // Foot tip touching the ground
      const footX = side * (44 + Math.abs(legAngleOffset) * 12);
      const footY = 16 - stepLift * 0.4 + pairIdx * (isResting ? 6 : 10);

      ctx.beginPath();
      ctx.moveTo(joint1X, joint1Y);
      ctx.lineTo(kneeX, kneeY);
      ctx.lineTo(footX, footY);
      ctx.stroke();

      // Sharp claw tip
      ctx.fillStyle = isHunting ? '#dc2626' : '#334155';
      ctx.beginPath();
      ctx.arc(footX, footY, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Creature Central Body / Torso
    ctx.fillStyle = isResting ? '#0a0f16' : '#05080c';
    ctx.beginPath();
    ctx.ellipse(0, isResting ? 4 : 0, isResting ? 18 : 16, isResting ? 10 : 12, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = isHunting ? '#7f1d1d' : isResting ? '#334155' : '#1e293b';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Glowing Crimson Eyes
    const eyeGlow = isHunting ? 1.2 : isResting ? 0.35 : 0.6;
    ctx.fillStyle = isHunting 
      ? '#ef4444' 
      : isResting 
        ? '#7f1d1d' 
        : '#b91c1c';

    const eyeY = isResting ? 0 : -4;
    // Left eye
    ctx.beginPath();
    ctx.ellipse(-5, eyeY, 3 * eyeGlow, 2 * eyeGlow, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Right eye
    ctx.beginPath();
    ctx.ellipse(5, eyeY, 3 * eyeGlow, 2 * eyeGlow, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Secondary smaller spider eyes
    ctx.fillStyle = isHunting ? '#f87171' : isResting ? '#450a0a' : '#991b1b';
    ctx.beginPath();
    ctx.arc(-8, eyeY + 3, 1.5, 0, Math.PI * 2);
    ctx.arc(8, eyeY + 3, 1.5, 0, Math.PI * 2);
    ctx.arc(-3, eyeY - 3, 1.2, 0, Math.PI * 2);
    ctx.arc(3, eyeY - 3, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Stamina Bar & Status floating above creature
    const maxStamina = c.maxStamina || 100;
    const currentStamina = Math.max(0, Math.min(maxStamina, c.stamina || 0));
    const staminaRatio = currentStamina / maxStamina;

    // Show stamina bar if hunting or resting
    if (isHunting || isResting || staminaRatio < 0.95) {
      const barWidth = 44;
      const barHeight = 5;
      const barY = -34;

      // Bar container
      ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.fillRect(-barWidth / 2 - 1, barY - 1, barWidth + 2, barHeight + 2);
      ctx.strokeStyle = isResting ? '#38bdf8' : '#ef4444';
      ctx.lineWidth = 1;
      ctx.strokeRect(-barWidth / 2 - 1, barY - 1, barWidth + 2, barHeight + 2);

      // Stamina fill
      ctx.fillStyle = isResting 
        ? '#38bdf8' // Blue recharging when resting
        : staminaRatio > 0.3 
          ? '#ef4444' // Red when hunting
          : '#f59e0b'; // Amber low stamina
      ctx.fillRect(-barWidth / 2, barY, barWidth * staminaRatio, barHeight);

      // State label
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillStyle = isResting ? '#7dd3fc' : '#fca5a5';
      ctx.fillText(isResting ? '😮‍💨 RESTING...' : '⚡ CHASE STAMINA', 0, barY - 4);
    }

    ctx.restore();
  }

  /**
   * Draw Spooky Forked Trees (matching the curly tree drawings in the sketch)
   */
  private drawTrees(ctx: CanvasRenderingContext2D, obstacles: Obstacle[], time: number) {
    for (const obs of obstacles) {
      if (obs.type !== 'tree') continue;

      ctx.save();
      ctx.translate(obs.x, obs.y);

      // Tree trunk shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.beginPath();
      ctx.ellipse(0, 12, 26, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Thick gnarled trunk
      ctx.fillStyle = '#1c140e';
      ctx.beginPath();
      ctx.moveTo(-10, 14);
      ctx.lineTo(-8, -10);
      ctx.lineTo(8, -10);
      ctx.lineTo(10, 14);
      ctx.closePath();
      ctx.fill();

      // Spooky curly forked branches (exact sketch match with curly spirals!)
      ctx.strokeStyle = '#291d15';
      ctx.lineWidth = 4.5;
      ctx.lineCap = 'round';

      // Left curly branch
      ctx.beginPath();
      ctx.moveTo(-6, -10);
      ctx.bezierCurveTo(-20, -22, -32, -18, -30, -32);
      ctx.bezierCurveTo(-28, -42, -16, -40, -18, -48);
      ctx.stroke();

      // Right curly branch
      ctx.beginPath();
      ctx.moveTo(6, -10);
      ctx.bezierCurveTo(20, -22, 32, -18, 30, -32);
      ctx.bezierCurveTo(28, -42, 16, -40, 18, -48);
      ctx.stroke();

      // Center twist
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(0, -36);
      ctx.stroke();

      // Dark tangled canopy foliage puffs
      ctx.fillStyle = '#0a1714';
      ctx.beginPath();
      ctx.arc(-22, -40, 18, 0, Math.PI * 2);
      ctx.arc(22, -40, 18, 0, Math.PI * 2);
      ctx.arc(0, -50, 22, 0, Math.PI * 2);
      ctx.arc(-8, -32, 16, 0, Math.PI * 2);
      ctx.arc(8, -32, 16, 0, Math.PI * 2);
      ctx.fill();

      // Canopy highlight texture
      ctx.fillStyle = '#112620';
      ctx.beginPath();
      ctx.arc(-16, -44, 12, 0, Math.PI * 2);
      ctx.arc(16, -44, 12, 0, Math.PI * 2);
      ctx.arc(0, -54, 14, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  /**
   * Draw particles (water splash, dust motes, footprints)
   */
  private drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
    for (const p of particles) {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  /**
   * Darkness & Dynamic Flashlight Beam Lighting Engine
   */
  private drawLightingOverlay(
    ctx: CanvasRenderingContext2D,
    rc: RenderContext,
    camX: number,
    camY: number
  ) {
    const { canvasWidth, canvasHeight, playerPos, playerFacingAngle, stats, level, time } = rc;
    const lCtx = this.lightCtx;

    // Convert player position to screen coordinates
    const screenPx = playerPos.x - camX;
    const screenPy = playerPos.y - camY;

    // 1. Fill light canvas with dark fog of war
    lCtx.globalCompositeOperation = 'source-over';
    const fogAlpha = level.fogDensity;
    lCtx.fillStyle = `rgba(3, 5, 8, ${fogAlpha})`;
    lCtx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 2. Cut out light shapes using destination-out blend mode
    lCtx.globalCompositeOperation = 'destination-out';

    // Flashlight flicker effect
    const flicker = stats.flashlightOn ? (1 + (Math.sin(time * 28) > 0.96 ? -0.15 : 0) + (Math.random() - 0.5) * 0.04) : 0;
    const beamRadius = level.flashlightRadius * flicker;
    const halfAngle = level.flashlightAngle / 2;

    if (stats.flashlightOn && beamRadius > 0) {
      // A. The Flashlight Cone Beam
      lCtx.save();
      lCtx.translate(screenPx, screenPy);
      lCtx.rotate(playerFacingAngle);

      // Create smooth angular and radial gradient for the flashlight ray
      const coneGrad = lCtx.createRadialGradient(0, 0, 10, 0, 0, beamRadius);
      coneGrad.addColorStop(0, 'rgba(0, 0, 0, 1.0)');
      coneGrad.addColorStop(0.3, 'rgba(0, 0, 0, 0.95)');
      coneGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.75)');
      coneGrad.addColorStop(0.9, 'rgba(0, 0, 0, 0.35)');
      coneGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      lCtx.fillStyle = coneGrad;
      lCtx.beginPath();
      lCtx.moveTo(0, 0);
      lCtx.arc(0, 0, beamRadius, -halfAngle, halfAngle);
      lCtx.closePath();
      lCtx.fill();

      // Additional intense core center beam
      const coreGrad = lCtx.createRadialGradient(0, 0, 5, 0, 0, beamRadius * 0.75);
      coreGrad.addColorStop(0, 'rgba(0, 0, 0, 0.9)');
      coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      lCtx.fillStyle = coreGrad;
      lCtx.beginPath();
      lCtx.moveTo(0, 0);
      lCtx.arc(0, 0, beamRadius * 0.75, -halfAngle * 0.5, halfAngle * 0.5);
      lCtx.closePath();
      lCtx.fill();

      lCtx.restore();
    }

    // B. Dim ambient circle around player's feet (so you can see immediate surroundings)
    const ambientRadius = stats.flashlightOn ? 65 : 40;
    const ambientGrad = lCtx.createRadialGradient(screenPx, screenPy, 5, screenPx, screenPy, ambientRadius);
    ambientGrad.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
    ambientGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.5)');
    ambientGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    lCtx.fillStyle = ambientGrad;
    lCtx.beginPath();
    lCtx.arc(screenPx, screenPy, ambientRadius, 0, Math.PI * 2);
    lCtx.fill();

    // 3. Draw light canvas over main canvas
    ctx.drawImage(this.lightCanvas, 0, 0);

    // 4. Add warm incandescent yellow tint to illuminated cone area
    if (stats.flashlightOn && beamRadius > 0) {
      ctx.save();
      ctx.translate(screenPx, screenPy);
      ctx.rotate(playerFacingAngle);
      ctx.globalCompositeOperation = 'screen';

      const warmTint = ctx.createRadialGradient(0, 0, 5, 0, 0, beamRadius);
      warmTint.addColorStop(0, 'rgba(254, 240, 138, 0.15)');
      warmTint.addColorStop(0.5, 'rgba(253, 224, 71, 0.08)');
      warmTint.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = warmTint;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, beamRadius, -halfAngle, halfAngle);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    }
  }

  /**
   * Draw Screen Vignette, Blood pulse when hit, and Horror Grain
   */
  private drawVignetteAndEffects(ctx: CanvasRenderingContext2D, rc: RenderContext) {
    const { canvasWidth, canvasHeight, stats, creatures, playerPos } = rc;

    // Dark screen edge vignette
    ctx.save();
    const vigGrad = ctx.createRadialGradient(
      canvasWidth / 2,
      canvasHeight / 2,
      canvasWidth * 0.3,
      canvasWidth / 2,
      canvasHeight / 2,
      canvasWidth * 0.65
    );
    vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vigGrad.addColorStop(1, 'rgba(0, 0, 0, 0.75)');

    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    ctx.restore();

    // Damage red flash & low health pulsing vignette
    if (stats.invulnerableTime > 0) {
      const hurtAlpha = Math.min(0.5, stats.invulnerableTime / 2);
      ctx.save();
      ctx.fillStyle = `rgba(220, 38, 38, ${hurtAlpha})`;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      ctx.restore();
    } else if (stats.lives === 1) {
      // 1 heart left = ominous heartbeat red pulse
      const pulse = (Math.sin(rc.time * 6) + 1) * 0.1;
      ctx.save();
      const dangerGrad = ctx.createRadialGradient(
        canvasWidth / 2,
        canvasHeight / 2,
        canvasWidth * 0.2,
        canvasWidth / 2,
        canvasHeight / 2,
        canvasWidth * 0.55
      );
      dangerGrad.addColorStop(0, 'rgba(220, 38, 38, 0)');
      dangerGrad.addColorStop(1, `rgba(220, 38, 38, ${pulse})`);
      ctx.fillStyle = dangerGrad;
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);
      ctx.restore();
    }

    // Creature hunt alert indicator if ANY creature is hunting close by
    const anyHuntingClose = creatures.some((c) => {
      if (c.state !== 'hunting') return false;
      const dist = Math.hypot(c.x - playerPos.x, c.y - playerPos.y);
      return dist < 480;
    });

    if (anyHuntingClose) {
      ctx.save();
      const flicker = (Math.sin(rc.time * 20) + 1) * 0.5;
      ctx.strokeStyle = `rgba(239, 68, 68, ${0.2 + flicker * 0.25})`;
      ctx.lineWidth = 4;
      ctx.strokeRect(4, 4, canvasWidth - 8, canvasHeight - 8);
      ctx.restore();
    }
  }

  /**
   * Terrifying Close-Up Demonic Jumpscare Animation Overlay
   * Triggered instantly when caught by any creature.
   */
  private drawJumpscareOverlay(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    progress: number, // 1.0 (start of jumpscare) -> 0.0 (fading out)
    time: number
  ) {
    ctx.save();

    // Violent chaotic jitter / glitch
    const jitterX = (Math.random() - 0.5) * progress * 35;
    const jitterY = (Math.random() - 0.5) * progress * 35;
    ctx.translate(jitterX, jitterY);

    // Strobe background: violent black, blood crimson and negative flash
    const strobe = Math.floor(time * 30) % 3;
    if (strobe === 0) {
      ctx.fillStyle = 'rgba(10, 0, 0, 0.94)';
    } else if (strobe === 1) {
      ctx.fillStyle = 'rgba(127, 29, 29, 0.9)';
    } else {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.98)';
    }
    ctx.fillRect(-50, -50, width + 100, height + 100);

    // Dynamic scale: beast zooms directly towards screen
    const cx = width / 2;
    const cy = height / 2;
    const beastScale = (1.1 + (1 - progress) * 0.4) * (Math.min(width, height) / 480);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(beastScale, beastScale);

    // 1. Spreading Dark Tendrils / Eldritch Smoke
    const tendrilCount = 12;
    for (let t = 0; t < tendrilCount; t++) {
      const angle = (t / tendrilCount) * Math.PI * 2 + time * 3;
      const tLen = 180 + Math.sin(time * 20 + t) * 40;
      ctx.strokeStyle = t % 2 === 0 ? '#450a0a' : '#1e1b4b';
      ctx.lineWidth = 6 + Math.sin(t) * 3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(
        Math.cos(angle + 0.5) * (tLen * 0.6),
        Math.sin(angle + 0.5) * (tLen * 0.6),
        Math.cos(angle) * tLen,
        Math.sin(angle) * tLen
      );
      ctx.stroke();
    }

    // 2. Reaching Claws / Serrated Spider Legs surrounding screen
    const clawCount = 8;
    for (let i = 0; i < clawCount; i++) {
      const side = i < 4 ? -1 : 1;
      const index = i % 4;
      const clawReach = 140 + Math.sin(time * 25 + i) * 20;

      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(side * 30, -40 + index * 30);
      ctx.lineTo(side * (clawReach * 0.7), -100 + index * 60 + Math.sin(time * 30 + i) * 25);
      ctx.lineTo(side * clawReach, -40 + index * 70);
      ctx.stroke();

      // Sharp dripping crimson tip
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(side * (clawReach * 0.9), -40 + index * 70);
      ctx.lineTo(side * (clawReach + 18), -35 + index * 70);
      ctx.stroke();
    }

    // 3. Monstrous Black Skull / Head
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.ellipse(0, -20, 95, 115, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#7f1d1d';
    ctx.lineWidth = 4;
    ctx.stroke();

    // 4. Gaping Demon Maw / Mouth with Needle Fangs
    // Deep dark gullet
    ctx.fillStyle = '#450a0a';
    ctx.beginPath();
    ctx.ellipse(0, 35, 65, 50, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(0, 35, 52, 38, 0, 0, Math.PI * 2);
    ctx.fill();

    // Razor sharp upper teeth
    const toothCount = 14;
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 1;

    for (let i = 0; i < toothCount; i++) {
      const tx = -50 + (i / (toothCount - 1)) * 100;
      const tLen = 14 + (Math.sin((i / toothCount) * Math.PI) * 18);
      ctx.beginPath();
      ctx.moveTo(tx - 3, 10);
      ctx.lineTo(tx + 3, 10);
      ctx.lineTo(tx, 10 + tLen);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Razor sharp lower teeth
    for (let i = 0; i < toothCount - 2; i++) {
      const tx = -42 + (i / (toothCount - 3)) * 84;
      const tLen = 12 + (Math.sin((i / (toothCount - 2)) * Math.PI) * 16);
      ctx.beginPath();
      ctx.moveTo(tx - 3, 62);
      ctx.lineTo(tx + 3, 62);
      ctx.lineTo(tx, 62 - tLen);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    // Dripping saliva / blood strings
    for (let s = 0; s < 6; s++) {
      const sx = -35 + s * 14 + Math.sin(time * 15 + s) * 3;
      ctx.strokeStyle = s % 2 === 0 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sx, 16);
      ctx.lineTo(sx + Math.sin(time * 10 + s) * 5, 55);
      ctx.stroke();
    }

    // 5. Terrifying Glowing Crimson Spider Eyes
    // Center Primary Eyes
    const pupilTwitch = (Math.random() - 0.5) * 4;

    // Left Main Eye
    const lEyeGrad = ctx.createRadialGradient(-32, -38, 3, -32, -38, 22);
    lEyeGrad.addColorStop(0, '#ffffff');
    lEyeGrad.addColorStop(0.25, '#ef4444');
    lEyeGrad.addColorStop(0.7, '#991b1b');
    lEyeGrad.addColorStop(1, '#000000');
    ctx.fillStyle = lEyeGrad;
    ctx.beginPath();
    ctx.ellipse(-32, -38, 22, 16, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // Left Black Slit Pupil
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(-32 + pupilTwitch, -38, 4, 12, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Right Main Eye
    const rEyeGrad = ctx.createRadialGradient(32, -38, 3, 32, -38, 22);
    rEyeGrad.addColorStop(0, '#ffffff');
    rEyeGrad.addColorStop(0.25, '#ef4444');
    rEyeGrad.addColorStop(0.7, '#991b1b');
    rEyeGrad.addColorStop(1, '#000000');
    ctx.fillStyle = rEyeGrad;
    ctx.beginPath();
    ctx.ellipse(32, -38, 22, 16, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Right Black Slit Pupil
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.ellipse(32 + pupilTwitch, -38, 4, 12, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // Secondary & Tertiary Eyes Cluster (Piercing red orbs)
    const secondaryEyes = [
      { x: -55, y: -25, r: 9 },
      { x: 55, y: -25, r: 9 },
      { x: -20, y: -65, r: 7 },
      { x: 20, y: -65, r: 7 },
      { x: -45, y: -55, r: 6 },
      { x: 45, y: -55, r: 6 },
      { x: 0, y: -50, r: 10 },
    ];

    for (const eye of secondaryEyes) {
      const eGrad = ctx.createRadialGradient(eye.x, eye.y, 1, eye.x, eye.y, eye.r);
      eGrad.addColorStop(0, '#ffffff');
      eGrad.addColorStop(0.4, '#f87171');
      eGrad.addColorStop(0.85, '#b91c1c');
      eGrad.addColorStop(1, '#000000');

      ctx.fillStyle = eGrad;
      ctx.beginPath();
      ctx.arc(eye.x, eye.y, eye.r, 0, Math.PI * 2);
      ctx.fill();

      // Small black center
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(eye.x + pupilTwitch * 0.4, eye.y, eye.r * 0.35, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // 6. Blood Splatter on Camera Lens Overlay
    const splatters = [
      { x: width * 0.2, y: height * 0.25, r: 40 },
      { x: width * 0.75, y: height * 0.3, r: 55 },
      { x: width * 0.15, y: height * 0.75, r: 45 },
      { x: width * 0.85, y: height * 0.8, r: 60 },
      { x: width * 0.5, y: height * 0.15, r: 35 },
    ];

    for (const splat of splatters) {
      const sGrad = ctx.createRadialGradient(splat.x, splat.y, 4, splat.x, splat.y, splat.r);
      sGrad.addColorStop(0, 'rgba(185, 28, 28, 0.85)');
      sGrad.addColorStop(0.6, 'rgba(127, 29, 29, 0.6)');
      sGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = sGrad;
      ctx.beginPath();
      ctx.arc(splat.x, splat.y, splat.r, 0, Math.PI * 2);
      ctx.fill();

      // Dripping streak
      ctx.strokeStyle = 'rgba(185, 28, 28, 0.75)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(splat.x, splat.y);
      ctx.lineTo(splat.x + (Math.random() - 0.5) * 10, splat.y + splat.r * 1.6);
      ctx.stroke();
    }

    // 7. VHS Glitch lines & noise
    for (let g = 0; g < 8; g++) {
      const gy = Math.random() * height;
      const gh = 2 + Math.random() * 6;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.fillRect(0, gy, width, gh);
    }

    ctx.restore();
  }
}
