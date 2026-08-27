import { GameState, ActiveFlare } from './engine';
import { AnimalDef, FinishPlantPlot, WaterSource, TerrainObstacle } from '../types';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private width: number = 800;
  private height: number = 600;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public resize(width: number, height: number) {
    this.width = width;
    this.height = height;
  }

  public render(gameState: GameState) {
    const { player, level, screenShake } = gameState;
    const ctx = this.ctx;

    // Clear canvas
    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();

    // Screen shake
    if (screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * screenShake;
      const shakeY = (Math.random() - 0.5) * screenShake;
      ctx.translate(shakeX, shakeY);
    }

    // Camera follow player (center screen on player, clamp to map boundaries)
    const cameraX = Math.max(0, Math.min(level.mapWidth - this.width, player.x - this.width / 2));
    const cameraY = Math.max(0, Math.min(level.mapHeight - this.height, player.y - this.height / 2));

    ctx.translate(-cameraX, -cameraY);

    // 1. Draw Biome Background Terrain
    this.drawTerrain(gameState, cameraX, cameraY);

    // 2. Draw Ground-level Obstacles (Mud, Bridges, Bushes)
    this.drawGroundObstacles(gameState);

    // 3. Draw Water Sources
    this.drawWaterSources(gameState);

    // 4. Draw Finish Plant Plots (Crops / Sanctuary)
    this.drawFinishPlots(gameState);

    // 5. Draw Active Flares & Ground Particles
    this.drawFlares(gameState);
    this.drawParticles(gameState, 'ground');

    // 6. Draw Dangerous Wildlife (Animals) & Vision Cones
    this.drawAnimals(gameState);

    // 7. Draw The Farmer (Player)
    this.drawFarmer(gameState);

    // 8. Draw High-elevation Obstacles (Tree Canopies, Rocks)
    this.drawElevationObstacles(gameState);

    // 9. Draw Atmospheric Particles (Rain, Fireflies, Petals)
    this.drawParticles(gameState, 'air');

    // 10. Draw Dynamic Lighting & Weather Overlay (Night, Golden Hour, Rain)
    this.drawAtmosphereOverlay(gameState, cameraX, cameraY);

    ctx.restore();
  }

  // --- TERRAIN ---
  private drawTerrain(state: GameState, camX: number, camY: number) {
    const { level } = state;
    const ctx = this.ctx;

    // Base biome color
    let baseColor = '#5c7a45'; // meadow
    let gridLineColor = 'rgba(70, 95, 50, 0.25)';

    if (level.biome === 'pine_forest') {
      baseColor = '#3b5836';
      gridLineColor = 'rgba(40, 65, 35, 0.3)';
    } else if (level.biome === 'murky_swamp') {
      baseColor = '#3a4a35';
      gridLineColor = 'rgba(30, 40, 25, 0.4)';
    } else if (level.biome === 'rocky_canyon') {
      baseColor = '#8c593b';
      gridLineColor = 'rgba(100, 65, 45, 0.3)';
    } else if (level.biome === 'savannah_plains') {
      baseColor = '#9a8342';
      gridLineColor = 'rgba(120, 100, 50, 0.25)';
    } else if (level.biome === 'arid_oasis') {
      baseColor = '#b89f65';
      gridLineColor = 'rgba(140, 120, 75, 0.25)';
    } else if (level.biome === 'alpine_stream') {
      baseColor = '#4e6d52';
      gridLineColor = 'rgba(50, 75, 60, 0.3)';
    } else if (level.biome === 'ancient_sanctuary') {
      baseColor = '#2b4736';
      gridLineColor = 'rgba(30, 60, 45, 0.35)';
    }

    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, level.mapWidth, level.mapHeight);

    // Subtle natural topographic grid
    ctx.strokeStyle = gridLineColor;
    ctx.lineWidth = 1;

    const tileSize = 80;
    const startX = Math.floor(camX / tileSize) * tileSize;
    const endX = Math.min(level.mapWidth, camX + this.width + tileSize);
    const startY = Math.floor(camY / tileSize) * tileSize;
    const endY = Math.min(level.mapHeight, camY + this.height + tileSize);

    ctx.beginPath();
    for (let x = startX; x <= endX; x += tileSize) {
      ctx.moveTo(x, startY);
      ctx.lineTo(x, endY);
    }
    for (let y = startY; y <= endY; y += tileSize) {
      ctx.moveTo(startX, y);
      ctx.lineTo(endX, y);
    }
    ctx.stroke();

    // Map borders (Wooden fence or rock boundary line)
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, level.mapWidth - 6, level.mapHeight - 6);
  }

  // --- GROUND OBSTACLES (MUD, REALISTIC STEALTH BUSHES) ---
  private drawGroundObstacles(state: GameState) {
    const ctx = this.ctx;
    const time = state.gameTime;

    for (const obs of state.obstacles) {
      const rad = obs.radius || 30;

      if (obs.type === 'mud_patch') {
        // Organic mud puddle with dark viscous gradient and wet mud sheen
        const grad = ctx.createRadialGradient(obs.x, obs.y, 4, obs.x, obs.y, rad * 1.1);
        grad.addColorStop(0, '#2d180c');
        grad.addColorStop(0.5, '#3b2212');
        grad.addColorStop(0.85, '#4a2f18');
        grad.addColorStop(1, 'rgba(74, 47, 24, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(obs.x, obs.y, rad * 1.25, rad * 0.85, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Glistening wet surface specular reflection
        ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.beginPath();
        ctx.ellipse(obs.x - rad * 0.2, obs.y - rad * 0.1, rad * 0.4, rad * 0.15, -0.3, 0, Math.PI * 2);
        ctx.fill();
      } else if (obs.type === 'dense_bush') {
        // Realistic Lush Stealth Bush with Multi-Lobed Botanical Leaves & Wild Berries
        const isPlayerInside = Math.hypot(state.player.x - obs.x, state.player.y - obs.y) < rad;
        ctx.save();
        ctx.globalAlpha = isPlayerInside ? 0.45 : 0.96;

        // Ground shadow with soft ambient occlusion
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(obs.x + 2, obs.y + rad * 0.35, rad * 1.1, rad * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();

        // Layered Leaf Clusters
        const leafClusters = [
          { x: -rad * 0.4, y: rad * 0.15, r: rad * 0.65, colTier: 0 },
          { x: rad * 0.4, y: rad * 0.1, r: rad * 0.68, colTier: 0 },
          { x: 0, y: -rad * 0.25, r: rad * 0.72, colTier: 1 },
          { x: -rad * 0.15, y: 0, r: rad * 0.8, colTier: 2 },
          { x: rad * 0.2, y: -rad * 0.1, r: rad * 0.7, colTier: 2 },
        ];

        for (const lc of leafClusters) {
          const cx = obs.x + lc.x;
          const cy = obs.y + lc.y;
          const bGrad = ctx.createRadialGradient(cx - lc.r * 0.3, cy - lc.r * 0.3, 2, cx, cy, lc.r);

          if (lc.colTier === 0) {
            bGrad.addColorStop(0, '#15803d');
            bGrad.addColorStop(0.7, '#166534');
            bGrad.addColorStop(1, '#052e16');
          } else if (lc.colTier === 1) {
            bGrad.addColorStop(0, '#22c55e');
            bGrad.addColorStop(0.6, '#15803d');
            bGrad.addColorStop(1, '#14532d');
          } else {
            bGrad.addColorStop(0, '#4ade80');
            bGrad.addColorStop(0.6, '#16a34a');
            bGrad.addColorStop(1, '#0f3a22');
          }

          ctx.fillStyle = bGrad;
          ctx.beginPath();
          ctx.arc(cx, cy, lc.r, 0, Math.PI * 2);
          ctx.fill();
        }

        // Wild Berry Clusters (Vibrant Crimson with Specular Dot)
        const berryLocations = [
          { bx: -rad * 0.35, by: -rad * 0.2 },
          { bx: rad * 0.3, by: -rad * 0.25 },
          { bx: rad * 0.15, by: rad * 0.25 },
          { bx: -rad * 0.1, by: rad * 0.3 },
        ];

        for (const b of berryLocations) {
          const berryX = obs.x + b.bx;
          const berryY = obs.y + b.by;

          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.arc(berryX, berryY, 3.2, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#fca5a5';
          ctx.beginPath();
          ctx.arc(berryX - 1, berryY - 1, 1, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    }
  }

  // --- REALISTIC WATER SOURCES & FLUID DYNAMICS ---
  private drawWaterSources(state: GameState) {
    const ctx = this.ctx;
    const time = state.gameTime;
    const player = state.player;

    for (const ws of state.waterSources) {
      ctx.save();

      // 1. Natural Organic Shoreline / Bank (Pebbles, Wet Sand, Moss Rocks)
      this.drawRealisticShoreline(ctx, ws, time);

      // 2. Realistic Subsurface Water Bed & Depth Gradient
      this.drawRealisticWaterDepth(ctx, ws, time);

      // 3. Underwater Caustics Network (Refracted Sunlight)
      this.drawRealisticCaustics(ctx, ws, time);

      // 4. Source-Specific Architectural & Natural Features (Well, Waterfall, Oasis, etc.)
      this.drawWaterSourceSpecifics(ctx, ws, time);

      // 5. Surface Wave Rings, Currents & Specular Sun Glints
      this.drawRealisticSurfaceWaves(ctx, ws, time);

      // 6. Floating Aquatic Flora (Lily Pads & Blooming Water Lilies)
      this.drawRealisticAquaticFlora(ctx, ws, time);

      // 7. Interactive Collection Ripples (when player is filling bucket)
      const distToPlayer = Math.hypot(player.x - ws.x, player.y - ws.y);
      if (player.isCollecting && distToPlayer < ws.radius + 35) {
        this.drawWaterCollectionRipples(ctx, ws, player, time);
      }

      // 8. Tactical HUD Indicator when nearby
      if (distToPlayer < ws.radius + 55) {
        this.drawWaterSourceHUD(ctx, ws);
      }

      ctx.restore();
    }
  }

  // --- REALISTIC ORGANIC SHORELINE ---
  private drawRealisticShoreline(ctx: CanvasRenderingContext2D, ws: WaterSource, time: number) {
    // If it's a stone well or rain barrel, handle in specifics
    if (ws.type === 'well' || ws.type === 'rain_barrel') return;

    const rad = ws.radius;
    const pointCount = 20;

    // Contact wet soil / mud outer zone
    ctx.fillStyle = ws.type === 'oasis' ? '#947a4f' : '#453120';
    ctx.beginPath();
    for (let i = 0; i <= pointCount; i++) {
      const angle = (i / pointCount) * Math.PI * 2;
      const noise = Math.sin(angle * 4 + ws.x) * 3 + Math.cos(angle * 6 + ws.y) * 2;
      const r = rad + 10 + noise;
      const px = ws.x + Math.cos(angle) * r;
      const py = ws.y + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    // Damp moisture shoreline perimeter with wet pebbles
    ctx.fillStyle = ws.type === 'oasis' ? '#c2a670' : '#2b1f14';
    ctx.beginPath();
    for (let i = 0; i <= pointCount; i++) {
      const angle = (i / pointCount) * Math.PI * 2;
      const noise = Math.sin(angle * 5 + ws.x * 0.1) * 2.5;
      const r = rad + 4 + noise;
      const px = ws.x + Math.cos(angle) * r;
      const py = ws.y + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    // Embedded shoreline river pebbles
    for (let i = 0; i < 8; i++) {
      const pAngle = (i * 0.78 + ws.x * 0.05) % (Math.PI * 2);
      const pDist = rad + 5 + (Math.sin(i * 3) * 3);
      const px = ws.x + Math.cos(pAngle) * pDist;
      const py = ws.y + Math.sin(pAngle) * pDist;

      ctx.fillStyle = '#1e140d';
      ctx.beginPath();
      ctx.ellipse(px + 1, py + 1.5, 4, 2.5, pAngle, 0, Math.PI * 2);
      ctx.fill();

      const pebGrad = ctx.createLinearGradient(px - 3, py - 3, px + 3, py + 3);
      pebGrad.addColorStop(0, '#8c8275');
      pebGrad.addColorStop(0.6, '#5a5247');
      pebGrad.addColorStop(1, '#38322a');
      ctx.fillStyle = pebGrad;
      ctx.beginPath();
      ctx.ellipse(px, py, 3.5, 2.2, pAngle, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- REALISTIC WATER DEPTH & OPTICAL GRADIENT ---
  private drawRealisticWaterDepth(ctx: CanvasRenderingContext2D, ws: WaterSource, time: number) {
    if (ws.type === 'well' || ws.type === 'rain_barrel') return;

    const rad = ws.radius;
    const centerOffset = Math.sin(time * 0.8) * 3;

    // Multi-stage optical depth gradient
    const waterGrad = ctx.createRadialGradient(
      ws.x + centerOffset,
      ws.y + centerOffset,
      rad * 0.1,
      ws.x,
      ws.y,
      rad
    );

    if (ws.type === 'oasis') {
      // Crystal clear desert turquoise
      waterGrad.addColorStop(0, '#0369a1'); // Deep cerulean abyss
      waterGrad.addColorStop(0.4, '#0284c7');
      waterGrad.addColorStop(0.75, '#38bdf8');
      waterGrad.addColorStop(0.95, '#7dd3fc');
      waterGrad.addColorStop(1, 'rgba(186, 230, 253, 0.85)');
    } else if (ws.type === 'spring' || ws.type === 'waterfall_pool') {
      // Pristine alpine emerald-azure
      waterGrad.addColorStop(0, '#082f49'); // Abyssal deep
      waterGrad.addColorStop(0.35, '#0284c7');
      waterGrad.addColorStop(0.7, '#0ea5e9');
      waterGrad.addColorStop(0.92, '#38bdf8');
      waterGrad.addColorStop(1, 'rgba(224, 242, 254, 0.9)');
    } else {
      // Natural river / pond
      waterGrad.addColorStop(0, '#0c4a6e');
      waterGrad.addColorStop(0.4, '#0369a1');
      waterGrad.addColorStop(0.75, '#0284c7');
      waterGrad.addColorStop(0.92, '#38bdf8');
      waterGrad.addColorStop(1, 'rgba(125, 211, 252, 0.85)');
    }

    ctx.fillStyle = waterGrad;
    ctx.beginPath();
    const pointCount = 24;
    for (let i = 0; i <= pointCount; i++) {
      const angle = (i / pointCount) * Math.PI * 2;
      const wave = Math.sin(angle * 5 + time * 2) * 1.5 + Math.cos(angle * 3 - time * 1.5) * 1.2;
      const r = rad + wave;
      const px = ws.x + Math.cos(angle) * r;
      const py = ws.y + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();

    // Translucent sandy riverbed ripple shadows underneath
    ctx.strokeStyle = 'rgba(2, 44, 34, 0.15)';
    ctx.lineWidth = 2.5;
    for (let j = -2; j <= 2; j++) {
      const ly = ws.y + j * (rad * 0.28);
      ctx.beginPath();
      ctx.moveTo(ws.x - rad * 0.7, ly);
      ctx.quadraticCurveTo(ws.x, ly + Math.sin(time + j) * 4, ws.x + rad * 0.7, ly);
      ctx.stroke();
    }
  }

  // --- REALISTIC UNDERWATER CAUSTICS NETWORK ---
  private drawRealisticCaustics(ctx: CanvasRenderingContext2D, ws: WaterSource, time: number) {
    if (ws.type === 'well' || ws.type === 'rain_barrel') return;

    ctx.save();
    ctx.beginPath();
    ctx.arc(ws.x, ws.y, ws.radius - 2, 0, Math.PI * 2);
    ctx.clip();

    // Refractive light network weaving across water floor
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.lineWidth = 1.6;

    const gridSize = 14;
    const extent = ws.radius * 0.85;

    for (let gx = -extent; gx <= extent; gx += gridSize) {
      for (let gy = -extent; gy <= extent; gy += gridSize) {
        if (Math.hypot(gx, gy) > extent) continue;

        const nx = ws.x + gx + Math.sin(time * 2.2 + gy * 0.1) * 4;
        const ny = ws.y + gy + Math.cos(time * 1.8 + gx * 0.1) * 4;
        const nextX = nx + gridSize + Math.cos(time * 2 + gx * 0.1) * 3;
        const nextY = ny + Math.sin(time * 2.5 + gy * 0.1) * 3;

        ctx.beginPath();
        ctx.moveTo(nx, ny);
        ctx.bezierCurveTo(
          nx + gridSize * 0.5,
          ny - 3 + Math.sin(time * 3 + gx) * 3,
          nx + gridSize * 0.7,
          ny + 3 + Math.cos(time * 2.8 + gy) * 3,
          nextX,
          nextY
        );
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  // --- SOURCE-SPECIFIC ARCHITECTURAL & NATURAL DETAILS ---
  private drawWaterSourceSpecifics(ctx: CanvasRenderingContext2D, ws: WaterSource, time: number) {
    // 1. ANCIENT STONE MASONRY WELL
    if (ws.type === 'well') {
      const rad = ws.radius;
      // Well Outer Contact Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      ctx.beginPath();
      ctx.ellipse(ws.x + 4, ws.y + 6, rad + 8, (rad + 8) * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Outer Chiseled Stone Wall Ring
      const stoneGrad = ctx.createRadialGradient(ws.x - 5, ws.y - 5, rad * 0.5, ws.x, ws.y, rad + 6);
      stoneGrad.addColorStop(0, '#94a3b8');
      stoneGrad.addColorStop(0.5, '#64748b');
      stoneGrad.addColorStop(0.85, '#475569');
      stoneGrad.addColorStop(1, '#334155');

      ctx.fillStyle = stoneGrad;
      ctx.beginPath();
      ctx.arc(ws.x, ws.y, rad + 6, 0, Math.PI * 2);
      ctx.fill();

      // Stone blocks mortar seams
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.2;
      for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(ws.x + Math.cos(ang) * (rad - 1), ws.y + Math.sin(ang) * (rad - 1));
        ctx.lineTo(ws.x + Math.cos(ang) * (rad + 6), ws.y + Math.sin(ang) * (rad + 6));
        ctx.stroke();
      }

      // Moss Patina Accents on rim
      ctx.fillStyle = '#3f6212';
      ctx.beginPath();
      ctx.arc(ws.x - rad * 0.6, ws.y - rad * 0.5, 5, 0, Math.PI * 2);
      ctx.arc(ws.x + rad * 0.5, ws.y + rad * 0.4, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Deep Subterranean Well Shaft Interior
      const wellShaftGrad = ctx.createRadialGradient(ws.x, ws.y, 2, ws.x, ws.y, rad);
      wellShaftGrad.addColorStop(0, '#0284c7'); // Reflective water at bottom
      wellShaftGrad.addColorStop(0.4, '#082f49');
      wellShaftGrad.addColorStop(0.8, '#020617');
      wellShaftGrad.addColorStop(1, '#000000');

      ctx.fillStyle = wellShaftGrad;
      ctx.beginPath();
      ctx.arc(ws.x, ws.y, rad - 1, 0, Math.PI * 2);
      ctx.fill();

      // Circular well water specular glint
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.beginPath();
      ctx.ellipse(ws.x - 3, ws.y - 3, 4, 2, -0.4, 0, Math.PI * 2);
      ctx.fill();

      // Heavy Timber Well Crossbeam & Pulley
      ctx.fillStyle = '#451a03'; // Dark aged walnut
      ctx.fillRect(ws.x - rad - 8, ws.y - 3, (rad + 8) * 2, 6);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(ws.x - rad - 8, ws.y - 2, (rad + 8) * 2, 2);

      // Iron Pulley Wheel & Braided Rope
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(ws.x, ws.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#d4af37';
      ctx.beginPath();
      ctx.arc(ws.x, ws.y, 2, 0, Math.PI * 2);
      ctx.fill();

      // Hanging Hemp Rope to Center
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(ws.x, ws.y);
      ctx.lineTo(ws.x + 3, ws.y + 4);
      ctx.stroke();
    }

    // 2. RAIN BARREL WITH WOODEN STAVES & BRASS SPIGOT
    else if (ws.type === 'rain_barrel') {
      const rad = ws.radius;
      // Barrel Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath();
      ctx.ellipse(ws.x + 3, ws.y + 5, rad + 4, rad * 0.7, 0, 0, Math.PI * 2);
      ctx.fill();

      // Outer Oak Staves Rim
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(ws.x, ws.y, rad + 3, 0, Math.PI * 2);
      ctx.fill();

      // Galvanized Metal Barrel Ring
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(ws.x, ws.y, rad + 2, 0, Math.PI * 2);
      ctx.stroke();

      // Water Surface Inside Barrel
      const barrelWaterGrad = ctx.createRadialGradient(ws.x - 2, ws.y - 2, 2, ws.x, ws.y, rad);
      barrelWaterGrad.addColorStop(0, '#38bdf8');
      barrelWaterGrad.addColorStop(0.6, '#0284c7');
      barrelWaterGrad.addColorStop(1, '#075985');
      ctx.fillStyle = barrelWaterGrad;
      ctx.beginPath();
      ctx.arc(ws.x, ws.y, rad - 1, 0, Math.PI * 2);
      ctx.fill();

      // Meniscus specular highlight
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(ws.x, ws.y, rad - 2.5, -Math.PI * 0.8, -Math.PI * 0.1);
      ctx.stroke();

      // Brass Tap Spigot on side
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(ws.x + rad + 1, ws.y - 2, 5, 4);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(ws.x + rad + 5, ws.y - 3, 2, 6);
    }

    // 3. WATERFALL POOL (CHURNING AERATED FOAM & SPRAY)
    else if (ws.type === 'waterfall_pool') {
      // Cascading Impact Foam Core
      const foamTime = time * 8;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      for (let i = 0; i < 8; i++) {
        const fAngle = (i * 0.8 + time * 2) % (Math.PI * 2);
        const fDist = 4 + (Math.sin(foamTime + i) * 6);
        const fx = ws.x + Math.cos(fAngle) * fDist;
        const fy = ws.y - ws.radius * 0.3 + Math.sin(fAngle) * fDist;

        ctx.beginPath();
        ctx.arc(fx, fy, 3 + Math.sin(time * 10 + i) * 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Aerated white froth ring
      ctx.strokeStyle = 'rgba(224, 242, 254, 0.7)';
      ctx.lineWidth = 2.5;
      const frothRing = (time * 18) % (ws.radius * 0.6);
      ctx.beginPath();
      ctx.ellipse(ws.x, ws.y - ws.radius * 0.3, frothRing, frothRing * 0.5, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 4. NATURAL BUBBLING SPRING
    else if (ws.type === 'spring') {
      // Rising carbonated mineral bubbles
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      for (let i = 0; i < 5; i++) {
        const bPhase = (time * 2.5 + i * 0.7) % 1;
        const bx = ws.x + Math.sin(time * 3 + i * 2) * (ws.radius * 0.35);
        const by = ws.y + ws.radius * 0.35 - bPhase * (ws.radius * 0.7);
        const bSize = 1.2 + bPhase * 2.2;

        ctx.beginPath();
        ctx.arc(bx, by, bSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // --- REALISTIC SURFACE WAVES, EDDIES & SPECULAR GLINTS ---
  private drawRealisticSurfaceWaves(ctx: CanvasRenderingContext2D, ws: WaterSource, time: number) {
    if (ws.type === 'well' || ws.type === 'rain_barrel') return;

    // Harmonic Concentric Ripples
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1.4;

    for (let r = 0; r < 3; r++) {
      const ripPhase = ((time * 12 + r * (ws.radius / 3)) % ws.radius);
      const ripAlpha = Math.max(0, 1 - ripPhase / ws.radius) * 0.45;
      ctx.strokeStyle = `rgba(224, 242, 254, ${ripAlpha})`;

      ctx.beginPath();
      ctx.ellipse(
        ws.x,
        ws.y,
        Math.max(4, ripPhase),
        Math.max(3, ripPhase * 0.75),
        0.1,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }

    // Specular Sun Glints (Twinkling light stars across surface)
    for (let i = 0; i < 5; i++) {
      const sparkPhase = (time * 3 + i * 1.6) % (Math.PI * 2);
      const sparkBright = Math.max(0, Math.sin(sparkPhase));
      if (sparkBright <= 0.2) continue;

      const sparkAng = i * 1.35 + ws.x * 0.05;
      const sparkDist = (ws.radius * 0.3) + Math.sin(i * 2.5) * (ws.radius * 0.35);
      const sx = ws.x + Math.cos(sparkAng) * sparkDist;
      const sy = ws.y + Math.sin(sparkAng) * sparkDist;

      // 4-point Diamond Specular Flare
      ctx.fillStyle = `rgba(255, 255, 255, ${sparkBright * 0.9})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 1.8 * sparkBright, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = `rgba(255, 255, 255, ${sparkBright * 0.7})`;
      ctx.lineWidth = 0.8;
      const flareLen = 4.5 * sparkBright;
      ctx.beginPath();
      ctx.moveTo(sx - flareLen, sy);
      ctx.lineTo(sx + flareLen, sy);
      ctx.moveTo(sx, sy - flareLen);
      ctx.lineTo(sx, sy + flareLen);
      ctx.stroke();
    }
  }

  // --- REALISTIC FLOATING AQUATIC FLORA (LILY PADS & BLOSSOMS) ---
  private drawRealisticAquaticFlora(ctx: CanvasRenderingContext2D, ws: WaterSource, time: number) {
    if (ws.type === 'well' || ws.type === 'rain_barrel') return;

    // 2-3 Natural Lily Pads drifting gently in current
    const padCount = ws.radius > 45 ? 3 : 2;
    for (let p = 0; p < padCount; p++) {
      const baseAng = p * 2.1 + ws.x * 0.03;
      const padDist = ws.radius * 0.55;
      // Gentle floating bobbing
      const bobX = Math.sin(time * 1.2 + p * 1.5) * 2.5;
      const bobY = Math.cos(time * 1.4 + p * 1.8) * 2;
      const px = ws.x + Math.cos(baseAng) * padDist + bobX;
      const py = ws.y + Math.sin(baseAng) * padDist + bobY;
      const padRadius = 7 + (p % 2) * 3;

      ctx.save();
      ctx.translate(px, py);

      // Lily pad contact shadow underneath water
      ctx.fillStyle = 'rgba(2, 44, 34, 0.4)';
      ctx.beginPath();
      ctx.ellipse(1, 2, padRadius, padRadius * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Translucent Emerald Lily Pad with Notched Slit
      const padGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, padRadius);
      padGrad.addColorStop(0, '#4ade80');
      padGrad.addColorStop(0.6, '#16a34a');
      padGrad.addColorStop(1, '#14532d');

      ctx.fillStyle = padGrad;
      ctx.beginPath();
      // Notched arc
      const slitAng = 0.4 + p;
      ctx.arc(0, 0, padRadius, slitAng + 0.3, slitAng + Math.PI * 2 - 0.3);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();

      // Radial leaf venation
      ctx.strokeStyle = 'rgba(187, 247, 208, 0.45)';
      ctx.lineWidth = 0.6;
      for (let v = 0; v < 5; v++) {
        const vAng = slitAng + 0.6 + v * 0.9;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(vAng) * (padRadius - 1), Math.sin(vAng) * (padRadius - 1));
        ctx.stroke();
      }

      // Rolling Dewdrop on pad
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.arc(padRadius * 0.3, -padRadius * 0.2, 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Blooming Water Lily Flower on the first pad
      if (p === 0 && ws.radius > 35) {
        ctx.save();
        ctx.translate(padRadius * 0.2, padRadius * 0.2);

        // Layered Lotus Petals (Pink and White)
        for (let pet = 0; pet < 6; pet++) {
          const petAng = (pet / 6) * Math.PI * 2;
          const petGrad = ctx.createLinearGradient(0, 0, Math.cos(petAng) * 5, Math.sin(petAng) * 5);
          petGrad.addColorStop(0, '#fbcfe8'); // Soft rose
          petGrad.addColorStop(1, '#f43f5e'); // Rich magenta tip
          ctx.fillStyle = petGrad;

          ctx.beginPath();
          ctx.ellipse(Math.cos(petAng) * 3, Math.sin(petAng) * 3, 3, 1.6, petAng, 0, Math.PI * 2);
          ctx.fill();
        }

        // Golden Pistil Core
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(0, 0, 1.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      ctx.restore();
    }
  }

  // --- INTERACTIVE WATER COLLECTION RIPPLES ---
  private drawWaterCollectionRipples(ctx: CanvasRenderingContext2D, ws: WaterSource, player: any, time: number) {
    const streamAngle = Math.atan2(player.y - ws.y, player.x - ws.x);

    // Dynamic suction vortex into player's container
    ctx.strokeStyle = 'rgba(186, 230, 253, 0.75)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      const vProgress = ((time * 3 + i * 0.33) % 1);
      const vx = ws.x + Math.cos(streamAngle + (1 - vProgress) * 2) * (ws.radius * (1 - vProgress));
      const vy = ws.y + Math.sin(streamAngle + (1 - vProgress) * 2) * (ws.radius * (1 - vProgress));

      ctx.beginPath();
      ctx.arc(vx, vy, 2 + vProgress * 2, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  // --- TACTICAL HUD INDICATOR ---
  private drawWaterSourceHUD(ctx: CanvasRenderingContext2D, ws: WaterSource) {
    ctx.save();
    ctx.fillStyle = '#ebf8ff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`💧 ${ws.name}`, ws.x, ws.y - ws.radius - 16);

    ctx.fillStyle = '#63b3ed';
    ctx.font = '11px sans-serif';
    ctx.fillText(`Hold [SPACE] or Click to Fill`, ws.x, ws.y - ws.radius - 4);
    ctx.restore();
  }

  // --- REALISTIC FINISH PLANT PLOTS & BOTANICAL LIFE ---
  private drawFinishPlots(state: GameState) {
    const ctx = this.ctx;
    const time = state.gameTime;

    for (const plot of state.finishPlots) {
      ctx.save();

      // 1. Dynamic Soil Hydration & Parched Drought Fissures
      this.drawRealisticSoilBed(ctx, plot, time);

      // 2. Ancient Sanctuary Stone Boundary & Life Runes
      this.drawRealisticPlotSanctuaryBoundary(ctx, plot, time);

      // 3. Species-Specific Botanical Flora (Wheat, Lotus, Ancient Oak, Desert Bloom)
      this.drawRealisticPlantSpecies(ctx, plot, time);

      // 4. Revitalized Lifeforce Aura & Pollen Particles (when fully hydrated)
      if (plot.isFullyHydrated || plot.bloomProgress > 0.8) {
        this.drawRealisticBloomAura(ctx, plot, time);
      }

      // 5. Tactical Hydration Progress Meter & Interaction Hints
      this.drawPlantPlotHUD(ctx, plot, state.player);

      ctx.restore();
    }
  }

  // --- DYNAMIC SOIL BED & DROUGHT CRACKS ---
  private drawRealisticSoilBed(ctx: CanvasRenderingContext2D, plot: FinishPlantPlot, _time: number) {
    const progress = plot.bloomProgress;
    const rad = plot.radius;

    // Contact ambient occlusion shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(plot.x, plot.y + rad * 0.35, rad * 1.15, rad * 0.65, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dynamic Soil Gradient (Arid dusty terracotta -> Rich moist black loam)
    const soilGrad = ctx.createRadialGradient(plot.x - 4, plot.y - 4, 4, plot.x, plot.y, rad);

    if (progress < 0.3) {
      // Severely parched dry earth
      soilGrad.addColorStop(0, '#8c6239');
      soilGrad.addColorStop(0.6, '#6b4823');
      soilGrad.addColorStop(1, '#4a2f14');
    } else if (progress < 0.7) {
      // Moistening rich loam
      soilGrad.addColorStop(0, '#4a2e16');
      soilGrad.addColorStop(0.6, '#38200d');
      soilGrad.addColorStop(1, '#241407');
    } else {
      // Fully hydrated, nutrient-dense humus soil with wet sheen
      soilGrad.addColorStop(0, '#1c1007');
      soilGrad.addColorStop(0.6, '#120a04');
      soilGrad.addColorStop(1, '#080402');
    }

    ctx.fillStyle = soilGrad;
    ctx.beginPath();
    ctx.ellipse(plot.x, plot.y, rad, rad * 0.88, 0, 0, Math.PI * 2);
    ctx.fill();

    // Arid Drought Fissures / Cracks (Fade away as hydration increases)
    if (progress < 0.85) {
      const crackAlpha = (1 - progress * 1.15);
      ctx.strokeStyle = `rgba(35, 20, 10, ${crackAlpha * 0.85})`;
      ctx.lineWidth = 1.5;

      // Realistic branching crack vectors
      const crackSeeds = [
        { x: -rad * 0.5, y: -rad * 0.2, len: rad * 0.4, ang: 0.5 },
        { x: rad * 0.2, y: -rad * 0.4, len: rad * 0.45, ang: 1.8 },
        { x: 0, y: rad * 0.3, len: rad * 0.5, ang: -0.7 },
        { x: rad * 0.4, y: rad * 0.2, len: rad * 0.35, ang: 2.5 },
      ];

      for (const crack of crackSeeds) {
        ctx.beginPath();
        const startX = plot.x + crack.x;
        const startY = plot.y + crack.y;
        ctx.moveTo(startX, startY);
        const midX = startX + Math.cos(crack.ang) * (crack.len * 0.5) + (Math.sin(crack.len) * 3);
        const midY = startY + Math.sin(crack.ang) * (crack.len * 0.5);
        const endX = startX + Math.cos(crack.ang + 0.3) * crack.len;
        const endY = startY + Math.sin(crack.ang + 0.3) * crack.len;
        ctx.lineTo(midX, midY);
        ctx.lineTo(endX, endY);
        // Branch
        ctx.moveTo(midX, midY);
        ctx.lineTo(midX + Math.cos(crack.ang - 0.7) * (crack.len * 0.4), midY + Math.sin(crack.ang - 0.7) * (crack.len * 0.4));
        ctx.stroke();
      }
    }

    // Wet Humus Soil Clumps & Specular Sheen (when hydrated)
    if (progress > 0.4) {
      ctx.fillStyle = `rgba(56, 189, 248, ${progress * 0.25})`;
      ctx.beginPath();
      ctx.ellipse(plot.x - rad * 0.2, plot.y - rad * 0.15, rad * 0.3, rad * 0.15, -0.2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- ANCIENT SANCTUARY BOUNDARY & LIFE RUNES ---
  private drawRealisticPlotSanctuaryBoundary(ctx: CanvasRenderingContext2D, plot: FinishPlantPlot, time: number) {
    const rad = plot.radius;
    const isFinished = plot.isFullyHydrated;
    const stoneCount = 14;

    // Hand-laid river boundary stones
    for (let i = 0; i < stoneCount; i++) {
      const ang = (i / stoneCount) * Math.PI * 2;
      const dist = rad + 8 + (Math.sin(i * 3 + plot.x) * 2);
      const sx = plot.x + Math.cos(ang) * dist;
      const sy = plot.y + Math.sin(ang) * dist;

      // Stone Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.beginPath();
      ctx.ellipse(sx + 1, sy + 2, 4.5, 3, ang, 0, Math.PI * 2);
      ctx.fill();

      // Stone Gradient
      const stoneGrad = ctx.createLinearGradient(sx - 3, sy - 3, sx + 3, sy + 3);
      if (isFinished) {
        stoneGrad.addColorStop(0, '#a7f3d0'); // Ancient glowing moss patina
        stoneGrad.addColorStop(0.6, '#34d399');
        stoneGrad.addColorStop(1, '#065f46');
      } else {
        stoneGrad.addColorStop(0, '#94a3b8');
        stoneGrad.addColorStop(0.6, '#64748b');
        stoneGrad.addColorStop(1, '#334155');
      }

      ctx.fillStyle = stoneGrad;
      ctx.beginPath();
      ctx.ellipse(sx, sy, 4, 3, ang, 0, Math.PI * 2);
      ctx.fill();

      // Glowing Ancient Life Rune on Key Boundary Stones
      if (isFinished && i % 2 === 0) {
        const runePulse = Math.sin(time * 3 + i) * 0.5 + 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${0.6 + runePulse * 0.4})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // --- SPECIES-SPECIFIC REALISTIC BOTANICAL FLORA ---
  private drawRealisticPlantSpecies(ctx: CanvasRenderingContext2D, plot: FinishPlantPlot, time: number) {
    const progress = plot.bloomProgress;
    const species = plot.species;

    // A. ANCIENT OAK / REVIVAL TREE (Massive living arboreal centerpiece)
    if (species === 'ancient_oak' || species === 'revival_tree') {
      this.drawRealisticRevivalTree(ctx, plot, progress, time);
    }
    // B. SACRED LOTUS / ORCHID / WATER FLOWER
    else if (species === 'sacred_lotus' || species === 'desert_bloom') {
      this.drawRealisticSacredLotus(ctx, plot, progress, time);
    }
    // C. GOLDEN WHEAT & HEIRLOOM CROPS
    else {
      this.drawRealisticGoldenWheat(ctx, plot, progress, time);
    }
  }

  // --- REALISTIC REVIVAL TREE BOTANY ---
  private drawRealisticRevivalTree(ctx: CanvasRenderingContext2D, plot: FinishPlantPlot, progress: number, time: number) {
    // 1. Flared Root Buttresses Digging into Earth
    const rootGrad = ctx.createLinearGradient(plot.x - 15, plot.y, plot.x + 15, plot.y);
    rootGrad.addColorStop(0, '#381e0d');
    rootGrad.addColorStop(0.5, '#543019');
    rootGrad.addColorStop(1, '#291407');
    ctx.fillStyle = rootGrad;

    // Left root flare
    ctx.beginPath();
    ctx.moveTo(plot.x - 14, plot.y - 10);
    ctx.quadraticCurveTo(plot.x - 22, plot.y + 4, plot.x - 26, plot.y + 8);
    ctx.lineTo(plot.x - 18, plot.y + 8);
    ctx.quadraticCurveTo(plot.x - 10, plot.y + 2, plot.x - 8, plot.y - 10);
    ctx.fill();

    // Right root flare
    ctx.beginPath();
    ctx.moveTo(plot.x + 14, plot.y - 10);
    ctx.quadraticCurveTo(plot.x + 22, plot.y + 4, plot.x + 26, plot.y + 8);
    ctx.lineTo(plot.x + 18, plot.y + 8);
    ctx.quadraticCurveTo(plot.x + 10, plot.y + 2, plot.x + 8, plot.y - 10);
    ctx.fill();

    // 2. Gnarled Ancient Trunk with Bark Fissures
    const trunkGrad = ctx.createLinearGradient(plot.x - 12, plot.y - 45, plot.x + 12, plot.y);
    trunkGrad.addColorStop(0, '#543019');
    trunkGrad.addColorStop(0.4, '#734323');
    trunkGrad.addColorStop(1, '#3b200e');

    ctx.fillStyle = trunkGrad;
    ctx.beginPath();
    ctx.roundRect(plot.x - 12, plot.y - 40, 24, 45, [4, 4, 8, 8]);
    ctx.fill();

    // Bark Texture Creases
    ctx.strokeStyle = '#291407';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(plot.x - 6, plot.y - 35);
    ctx.lineTo(plot.x - 4, plot.y - 5);
    ctx.moveTo(plot.x + 4, plot.y - 32);
    ctx.lineTo(plot.x + 2, plot.y - 2);
    ctx.stroke();

    // 3. Multi-Tiered Wind-Swaying Canopy
    const windSway = Math.sin(time * 1.8 + plot.x * 0.05) * (4 * progress);
    const canopyY = plot.y - 52;
    const canopyRad = 30 + progress * 24;

    // Canopy contact shadow on trunk
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.beginPath();
    ctx.ellipse(plot.x + windSway * 0.3, canopyY + 16, canopyRad * 0.7, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Layered Foliage Clusters (Back, Mid, Highlight)
    const foliageTiers = [
      { xOff: -18, yOff: 6, size: canopyRad * 0.65, colTier: 0 },
      { xOff: 18, yOff: 4, size: canopyRad * 0.68, colTier: 0 },
      { xOff: 0, yOff: -12, size: canopyRad * 0.8, colTier: 1 },
      { xOff: -10, yOff: -6, size: canopyRad * 0.72, colTier: 2 },
      { xOff: 10, yOff: -8, size: canopyRad * 0.75, colTier: 2 },
    ];

    for (const tier of foliageTiers) {
      const cx = plot.x + tier.xOff + windSway;
      const cy = canopyY + tier.yOff;

      const folGrad = ctx.createRadialGradient(cx - tier.size * 0.3, cy - tier.size * 0.3, 2, cx, cy, tier.size);

      if (progress < 0.35) {
        // Withered dormant autumn canopy
        folGrad.addColorStop(0, '#a16207');
        folGrad.addColorStop(0.6, '#713f12');
        folGrad.addColorStop(1, '#451a03');
      } else if (progress < 0.8) {
        // Vibrant springtime rebirth
        folGrad.addColorStop(0, '#4ade80');
        folGrad.addColorStop(0.5, '#16a34a');
        folGrad.addColorStop(1, '#14532d');
      } else {
        // Radiant sacred chlorophyll with glowing golden edges
        folGrad.addColorStop(0, '#86efac');
        folGrad.addColorStop(0.4, '#22c55e');
        folGrad.addColorStop(0.8, '#15803d');
        folGrad.addColorStop(1, '#052e16');
      }

      ctx.fillStyle = folGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, tier.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Individual detailed oak leaves on canopy periphery
    if (progress > 0.5) {
      ctx.fillStyle = progress > 0.85 ? '#bbf7d0' : '#86efac';
      for (let l = 0; l < 8; l++) {
        const leafAng = (l / 8) * Math.PI * 2;
        const lx = plot.x + windSway + Math.cos(leafAng) * (canopyRad * 0.85);
        const ly = canopyY + Math.sin(leafAng) * (canopyRad * 0.75);

        ctx.beginPath();
        ctx.ellipse(lx, ly, 4.5, 2.8, leafAng + windSway * 0.1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // --- REALISTIC SACRED LOTUS BOTANY ---
  private drawRealisticSacredLotus(ctx: CanvasRenderingContext2D, plot: FinishPlantPlot, progress: number, time: number) {
    const petalScale = 0.4 + progress * 0.6;
    const lotusCount = 3;

    for (let i = 0; i < lotusCount; i++) {
      const baseAng = (i / lotusCount) * Math.PI * 2 + 0.3;
      const lotusDist = plot.radius * 0.38;
      const lx = plot.x + Math.cos(baseAng) * lotusDist;
      const ly = plot.y + Math.sin(baseAng) * (lotusDist * 0.75);

      ctx.save();
      ctx.translate(lx, ly);

      // Large peltate cupped lotus leaf underneath
      const leafGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, 15 * petalScale);
      leafGrad.addColorStop(0, '#4ade80');
      leafGrad.addColorStop(0.7, '#15803d');
      leafGrad.addColorStop(1, '#052e16');
      ctx.fillStyle = leafGrad;
      ctx.beginPath();
      ctx.ellipse(0, 4, 15 * petalScale, 11 * petalScale, 0, 0, Math.PI * 2);
      ctx.fill();

      // Curved Emerald Flower Stem
      ctx.strokeStyle = '#16a34a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(0, 4);
      ctx.quadraticCurveTo(Math.sin(time + i) * 3, -6, 0, -14 * petalScale);
      ctx.stroke();

      // Layered Translucent Botanical Lotus Petals
      const bloomCenterY = -14 * petalScale;
      const petalLayers = [
        { count: 8, r: 12 * petalScale, y: bloomCenterY, w: 5 * petalScale, h: 11 * petalScale },
        { count: 6, r: 8 * petalScale, y: bloomCenterY - 2, w: 4 * petalScale, h: 9 * petalScale },
      ];

      for (const layer of petalLayers) {
        for (let p = 0; p < layer.count; p++) {
          const pAng = (p / layer.count) * Math.PI * 2 + (time * 0.2 * (progress > 0.9 ? 1 : 0));
          const petGrad = ctx.createLinearGradient(
            0,
            layer.y,
            Math.cos(pAng) * layer.r,
            layer.y + Math.sin(pAng) * layer.r
          );

          if (plot.species === 'desert_bloom') {
            petGrad.addColorStop(0, '#fef08a'); // Radiant golden sun orchid
            petGrad.addColorStop(0.5, '#f97316');
            petGrad.addColorStop(1, '#dc2626');
          } else {
            petGrad.addColorStop(0, '#ffffff'); // Sacred pure white to magenta
            petGrad.addColorStop(0.4, '#fbcfe8');
            petGrad.addColorStop(0.85, '#ec4899');
            petGrad.addColorStop(1, '#be185d');
          }

          ctx.fillStyle = petGrad;
          ctx.beginPath();
          ctx.ellipse(
            Math.cos(pAng) * (layer.r * 0.6),
            layer.y + Math.sin(pAng) * (layer.r * 0.5),
            layer.w,
            layer.h,
            pAng + Math.PI / 2,
            0,
            Math.PI * 2
          );
          ctx.fill();
        }
      }

      // Center Golden Pistil / Receptacle & Stamens
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(0, bloomCenterY, 4 * petalScale, 0, Math.PI * 2);
      ctx.fill();

      // Stamens ring
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 1;
      for (let s = 0; s < 8; s++) {
        const sAng = (s / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, bloomCenterY);
        ctx.lineTo(Math.cos(sAng) * (5.5 * petalScale), bloomCenterY + Math.sin(sAng) * (5.5 * petalScale));
        ctx.stroke();
      }

      ctx.restore();
    }
  }

  // --- REALISTIC GOLDEN WHEAT & CEREAL BOTANY ---
  private drawRealisticGoldenWheat(ctx: CanvasRenderingContext2D, plot: FinishPlantPlot, progress: number, time: number) {
    const stalkCount = 11;
    const windGust = Math.sin(time * 2.4 + plot.x * 0.1) * (5 + progress * 6);

    for (let i = 0; i < stalkCount; i++) {
      const colX = plot.x + ((i - 5) / 5) * (plot.radius * 0.7);
      const colY = plot.y + Math.sin(i * 1.8) * (plot.radius * 0.45);
      const stalkHeight = 12 + progress * 32;

      ctx.save();
      ctx.translate(colX, colY);

      // 1. Articulated Fibrous Stalk & Nodes
      const bendFactor = (windGust + (i % 3 - 1) * 2) * (progress * 0.8);
      const topX = bendFactor;
      const topY = -stalkHeight;

      ctx.strokeStyle = progress > 0.5 ? '#eab308' : '#854d0e';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(bendFactor * 0.4, -stalkHeight * 0.5, topX, topY);
      ctx.stroke();

      // Branching Stalk Leaves
      if (progress > 0.3) {
        ctx.fillStyle = progress > 0.7 ? '#ca8a04' : '#65a30d';
        // Left sheath leaf
        ctx.beginPath();
        ctx.ellipse(-4 + bendFactor * 0.2, -stalkHeight * 0.4, 6, 2, -0.6, 0, Math.PI * 2);
        ctx.fill();
        // Right sheath leaf
        ctx.beginPath();
        ctx.ellipse(4 + bendFactor * 0.3, -stalkHeight * 0.6, 7, 2, 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Heavy Golden Wheat Head / Spikelet Rows (When Blooming)
      if (progress > 0.4) {
        const headLen = 14 + (progress - 0.4) * 16;
        const headAng = Math.atan2(topY, topX) - Math.PI / 2 + (bendFactor * 0.05);

        ctx.save();
        ctx.translate(topX, topY);
        ctx.rotate(headAng);

        // Alternating Plump Golden Kernels
        const kernelCount = 6;
        for (let k = 0; k < kernelCount; k++) {
          const ky = -k * 2.8;

          // Left kernel
          const kernGradL = ctx.createLinearGradient(-4, ky, 0, ky);
          kernGradL.addColorStop(0, '#fef08a');
          kernGradL.addColorStop(0.5, '#eab308');
          kernGradL.addColorStop(1, '#a16207');
          ctx.fillStyle = kernGradL;
          ctx.beginPath();
          ctx.ellipse(-2.5, ky, 3.2, 1.8, -0.3, 0, Math.PI * 2);
          ctx.fill();

          // Right kernel
          const kernGradR = ctx.createLinearGradient(0, ky, 4, ky);
          kernGradR.addColorStop(0, '#fef08a');
          kernGradR.addColorStop(0.5, '#eab308');
          kernGradR.addColorStop(1, '#a16207');
          ctx.fillStyle = kernGradR;
          ctx.beginPath();
          ctx.ellipse(2.5, ky + 1.2, 3.2, 1.8, 0.3, 0, Math.PI * 2);
          ctx.fill();

          // Delicate Bristly Awns (Beards) extending upwards
          ctx.strokeStyle = 'rgba(254, 240, 138, 0.85)';
          ctx.lineWidth = 0.7;
          ctx.beginPath();
          ctx.moveTo(-3, ky);
          ctx.lineTo(-7 - (k * 0.5), ky - 6);
          ctx.moveTo(3, ky + 1.2);
          ctx.lineTo(7 + (k * 0.5), ky - 5);
          ctx.stroke();
        }

        // Terminal Awn Tip at top
        ctx.beginPath();
        ctx.moveTo(0, -headLen);
        ctx.lineTo(0, -headLen - 8);
        ctx.stroke();

        ctx.restore();
      }

      ctx.restore();
    }
  }

  // --- REALISTIC BLOOM AURA & POLLEN SPORES ---
  private drawRealisticBloomAura(ctx: CanvasRenderingContext2D, plot: FinishPlantPlot, time: number) {
    // Pulsing Radiant Lifeforce Halo
    const pulse = Math.sin(time * 2.5) * 0.2 + 0.8;
    const auraGrad = ctx.createRadialGradient(plot.x, plot.y - 15, plot.radius * 0.3, plot.x, plot.y - 15, plot.radius * 1.5 * pulse);
    auraGrad.addColorStop(0, 'rgba(74, 222, 128, 0.28)');
    auraGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.15)');
    auraGrad.addColorStop(1, 'rgba(74, 222, 128, 0)');

    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(plot.x, plot.y - 15, plot.radius * 1.5 * pulse, 0, Math.PI * 2);
    ctx.fill();

    // Floating Golden Pollen Motes
    ctx.fillStyle = '#fef08a';
    for (let i = 0; i < 7; i++) {
      const sporePhase = (time * 1.5 + i * 1.1) % (Math.PI * 2);
      const sporeRad = plot.radius * 0.8 + Math.sin(time * 3 + i) * 12;
      const sx = plot.x + Math.cos(sporePhase) * sporeRad;
      const sy = plot.y - 20 + Math.sin(sporePhase) * (sporeRad * 0.6) - (time * 8 + i * 5) % 30;

      ctx.beginPath();
      ctx.arc(sx, sy, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- TACTICAL HYDRATION PROGRESS METER ---
  private drawPlantPlotHUD(ctx: CanvasRenderingContext2D, plot: FinishPlantPlot, player: any) {
    const barWidth = 76;
    const barHeight = 8;
    const barX = plot.x - barWidth / 2;
    const barY = plot.y - plot.radius - 24;

    // Background Frame
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = plot.isFullyHydrated ? '#34d399' : '#38bdf8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(barX - 2, barY - 2, barWidth + 4, barHeight + 4, 3);
    ctx.fill();
    ctx.stroke();

    // Water level fill
    const fillWidth = barWidth * plot.bloomProgress;
    const fillGrad = ctx.createLinearGradient(barX, barY, barX + fillWidth, barY);
    if (plot.isFullyHydrated) {
      fillGrad.addColorStop(0, '#10b981');
      fillGrad.addColorStop(1, '#6ee7b7');
    } else {
      fillGrad.addColorStop(0, '#0284c7');
      fillGrad.addColorStop(1, '#38bdf8');
    }

    ctx.fillStyle = fillGrad;
    ctx.beginPath();
    ctx.roundRect(barX, barY, fillWidth, barHeight, 2);
    ctx.fill();

    // Typography Label
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px sans-serif';
    ctx.textAlign = 'center';
    const labelText = plot.isFullyHydrated
      ? `✨ ${plot.name} (REVITALIZED)`
      : `🌱 ${plot.name}: ${Math.floor(plot.waterReceived)} / ${plot.waterNeeded}L`;
    ctx.fillText(labelText, plot.x, barY - 6);

    // Prompt hint when nearby and thirsty
    const distToPlayer = Math.hypot(player.x - plot.x, player.y - plot.y);
    if (distToPlayer < plot.radius + 45 && !plot.isFullyHydrated) {
      ctx.fillStyle = '#a7f3d0';
      ctx.font = '11px sans-serif';
      ctx.fillText(`Hold [E] or Click to Water`, plot.x, barY + 24);
    }
  }

  // --- DANGEROUS WILDLIFE (REALISTIC FAUNA SIMULATION) ---
  private drawAnimals(gameState: GameState) {
    const ctx = this.ctx;
    const time = gameState.gameTime;

    for (const animal of gameState.animals) {
      ctx.save();
      ctx.translate(animal.x, animal.y);

      // 1. Directional Dynamic Soft Ground Shadow with Breathing Distortion
      this.drawRealisticAnimalShadow(ctx, animal, time);

      // 2. Realistic Dynamic Scent & Vision Awareness Cone (when hunting / patrol)
      this.drawRealisticVisionCone(ctx, animal, time);

      // Rotate to animal anatomical heading
      ctx.rotate(animal.facingAngle);

      // 3. Anatomical Multi-Layered Species Render (Fur, Muscle, Spine, Paws, Head, Snout, Eyes)
      this.drawRealisticSpeciesBody(animal, time);

      ctx.restore();

      // 4. Overhead Alert / Aggro Tactical Threat Display
      this.drawAnimalTacticalStatus(ctx, animal);
    }
  }

  // --- REALISTIC ANIMAL DIRECTIONAL SHADOW ---
  private drawRealisticAnimalShadow(ctx: CanvasRenderingContext2D, animal: AnimalDef, time: number) {
    ctx.save();
    const sz = animal.size;
    const isMoving = animal.state === 'chase' || animal.state === 'patrol' || animal.state === 'flee';
    const breathScale = isMoving ? 1 : 1 + Math.sin(time * 3 + animal.animTimer) * 0.04;

    // Contact ambient occlusion shadow directly beneath paws / belly
    const aoGrad = ctx.createRadialGradient(0, 4, 3, 0, 4, sz * 0.85);
    aoGrad.addColorStop(0, 'rgba(0, 0, 0, 0.52)');
    aoGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.22)');
    aoGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = aoGrad;
    ctx.beginPath();
    ctx.ellipse(0, 4, sz * 0.85 * breathScale, sz * 0.48 * breathScale, animal.facingAngle, 0, Math.PI * 2);
    ctx.fill();

    // Directional Sun Cast Shadow offset southeast
    ctx.save();
    ctx.translate(5, 7);
    ctx.scale(1.05, 0.62);
    ctx.rotate(animal.facingAngle + 0.2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 0, sz * 0.9, sz * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  // --- REALISTIC VISION & AWARENESS CONE ---
  private drawRealisticVisionCone(ctx: CanvasRenderingContext2D, animal: AnimalDef, time: number) {
    if (animal.state === 'flee') return;

    const coneRadius = animal.visionRange;
    const halfAngle = animal.visionAngle / 2;

    const coneGrad = ctx.createRadialGradient(0, 0, 8, 0, 0, coneRadius);
    if (animal.state === 'chase') {
      const pulse = Math.sin(time * 8) * 0.1;
      coneGrad.addColorStop(0, `rgba(239, 68, 68, ${0.45 + pulse})`);
      coneGrad.addColorStop(0.6, `rgba(220, 38, 38, ${0.15 + pulse})`);
      coneGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');
    } else if (animal.state === 'alert') {
      coneGrad.addColorStop(0, 'rgba(245, 158, 11, 0.38)');
      coneGrad.addColorStop(0.6, 'rgba(217, 119, 6, 0.12)');
      coneGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');
    } else {
      coneGrad.addColorStop(0, 'rgba(255, 255, 255, 0.12)');
      coneGrad.addColorStop(0.7, 'rgba(255, 255, 255, 0.03)');
      coneGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    }

    ctx.fillStyle = coneGrad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, coneRadius, animal.facingAngle - halfAngle, animal.facingAngle + halfAngle);
    ctx.closePath();
    ctx.fill();

    // Subtle edge sweep laser line in alert / chase mode
    if (animal.state === 'alert' || animal.state === 'chase') {
      ctx.strokeStyle = animal.state === 'chase' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(245, 158, 11, 0.3)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(animal.facingAngle - halfAngle) * coneRadius, Math.sin(animal.facingAngle - halfAngle) * coneRadius);
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(animal.facingAngle + halfAngle) * coneRadius, Math.sin(animal.facingAngle + halfAngle) * coneRadius);
      ctx.stroke();
    }
  }

  // --- OVERHEAD THREAT STATUS ---
  private drawAnimalTacticalStatus(ctx: CanvasRenderingContext2D, animal: AnimalDef) {
    if (animal.state === 'idle' || animal.state === 'patrol') return;

    ctx.save();
    ctx.translate(animal.x, animal.y - animal.size - 20);

    if (animal.state === 'chase') {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-36, -11, 72, 22, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('⚡ HOSTILE', 0, 4);
    } else if (animal.state === 'alert') {
      // Progress meter
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(-24, -6, 48, 12, 3);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(-22, -4, 44 * Math.min(1, animal.alertMeter), 8);

      ctx.font = 'bold 10px sans-serif';
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText('👁 ALERT', 0, -9);
    } else if (animal.state === 'flee') {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = '#f97316';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(-36, -11, 72, 22, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fb923c';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('🔥 FLEEING', 0, 4);
    }

    ctx.restore();
  }

  // --- REALISTIC SPECIES ANATOMY & LOCOMOTION ---
  private drawRealisticSpeciesBody(animal: AnimalDef, time: number) {
    const ctx = this.ctx;
    const sz = animal.size;
    const frame = animal.currentFrame;
    const isMoving = animal.state === 'chase' || animal.state === 'patrol' || animal.state === 'flee';
    const strideSpeed = animal.state === 'chase' ? 1.6 : 1.0;
    const walkCycle = Math.sin(frame * Math.PI * 0.5 * strideSpeed);
    const bodyBob = isMoving ? Math.abs(Math.sin(frame * Math.PI)) * 2.5 : Math.sin(time * 3 + animal.animTimer) * 0.8;

    switch (animal.species) {
      // ==========================================
      // 1. TIMBER WOLF (CANIS LUPUS)
      // ==========================================
      case 'timber_wolf': {
        this.drawRealisticTimberWolf(ctx, sz, walkCycle, bodyBob, animal.state);
        break;
      }

      // ==========================================
      // 2. GRIZZLY BEAR (URSUS ARCTOS)
      // ==========================================
      case 'grizzly_bear': {
        this.drawRealisticGrizzlyBear(ctx, sz, walkCycle, bodyBob, animal.state);
        break;
      }

      // ==========================================
      // 3. MARSH CROCODILE (CROCODYLUS PALUSTRIS)
      // ==========================================
      case 'marsh_crocodile': {
        this.drawRealisticMarshCrocodile(ctx, sz, walkCycle, time);
        break;
      }

      // ==========================================
      // 4. MOUNTAIN COUGAR / PUMA (PUMA CONCOLOR)
      // ==========================================
      case 'mountain_cougar': {
        this.drawRealisticMountainCougar(ctx, sz, walkCycle, bodyBob, animal.state);
        break;
      }

      // ==========================================
      // 5. WILD BOAR / TUSKER (SUS SCROFA)
      // ==========================================
      case 'wild_boar': {
        this.drawRealisticWildBoar(ctx, sz, walkCycle, bodyBob, animal.state);
        break;
      }

      // ==========================================
      // 6. WILD RHINO (CERATOTHERIUM SIMUM)
      // ==========================================
      case 'wild_rhino': {
        this.drawRealisticWildRhino(ctx, sz, walkCycle, bodyBob, animal.state);
        break;
      }

      // ==========================================
      // 7. RATTLESNAKE (CROTALUS ATROX)
      // ==========================================
      case 'rattlesnake': {
        this.drawRealisticRattlesnake(ctx, sz, time, animal.state);
        break;
      }

      default: {
        this.drawRealisticWildBoar(ctx, sz, walkCycle, bodyBob, animal.state);
        break;
      }
    }
  }

  // --- 1. TIMBER WOLF ANATOMY ---
  private drawRealisticTimberWolf(
    ctx: CanvasRenderingContext2D,
    sz: number,
    walkCycle: number,
    bodyBob: number,
    state: string
  ) {
    const legSwing = walkCycle * (sz * 0.35);

    // 1. Muscular Legs & Paws (Fore & Hind with claws)
    const legGrad = ctx.createLinearGradient(0, -sz * 0.4, 0, sz * 0.4);
    legGrad.addColorStop(0, '#334155');
    legGrad.addColorStop(0.5, '#475569');
    legGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = legGrad;

    // Hind Left Leg
    ctx.beginPath();
    ctx.roundRect(-sz * 0.45 - legSwing, -sz * 0.38, sz * 0.18, sz * 0.32, 3);
    ctx.fill();
    // Hind Right Leg
    ctx.beginPath();
    ctx.roundRect(-sz * 0.45 + legSwing, sz * 0.15, sz * 0.18, sz * 0.32, 3);
    ctx.fill();

    // Fore Left Leg
    ctx.beginPath();
    ctx.roundRect(sz * 0.25 + legSwing, -sz * 0.36, sz * 0.18, sz * 0.3, 3);
    ctx.fill();
    // Fore Right Leg
    ctx.beginPath();
    ctx.roundRect(sz * 0.25 - legSwing, sz * 0.15, sz * 0.18, sz * 0.3, 3);
    ctx.fill();

    // 2. Bushy Guarded Wolf Tail
    const tailGrad = ctx.createLinearGradient(-sz * 0.6, 0, -sz * 1.15, 0);
    tailGrad.addColorStop(0, '#334155');
    tailGrad.addColorStop(0.6, '#64748b');
    tailGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = tailGrad;

    ctx.save();
    ctx.translate(-sz * 0.5, 0);
    ctx.rotate(walkCycle * 0.25);
    ctx.beginPath();
    ctx.ellipse(-sz * 0.35, 0, sz * 0.4, sz * 0.15, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. Lean Muscular Torso & Flank with Fur Gradient
    const bodyGrad = ctx.createRadialGradient(sz * 0.1, bodyBob, 2, 0, bodyBob, sz * 0.7);
    bodyGrad.addColorStop(0, '#94a3b8'); // Silver spine highlight
    bodyGrad.addColorStop(0.45, '#64748b');
    bodyGrad.addColorStop(0.8, '#334155');
    bodyGrad.addColorStop(1, '#1e293b');

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, bodyBob, sz * 0.62, sz * 0.34, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dorsal fur mantle / ruff
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(sz * 0.1, bodyBob - sz * 0.05, sz * 0.35, sz * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4. Heavy Neck Mane & Wedge-Shaped Lupine Head
    const headX = sz * 0.55;
    const headY = bodyBob;

    const headGrad = ctx.createRadialGradient(headX, headY, 2, headX, headY, sz * 0.35);
    headGrad.addColorStop(0, '#94a3b8');
    headGrad.addColorStop(0.5, '#475569');
    headGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = headGrad;

    ctx.beginPath();
    ctx.ellipse(headX, headY, sz * 0.32, sz * 0.26, 0, 0, Math.PI * 2);
    ctx.fill();

    // 5. Pointed Erect Lupine Ears (Inner Pink / Outer Dark)
    // Left Ear
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(headX - sz * 0.1, headY - sz * 0.18);
    ctx.lineTo(headX + sz * 0.05, headY - sz * 0.42);
    ctx.lineTo(headX + sz * 0.2, headY - sz * 0.15);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fda4af';
    ctx.beginPath();
    ctx.moveTo(headX - sz * 0.05, headY - sz * 0.18);
    ctx.lineTo(headX + sz * 0.05, headY - sz * 0.36);
    ctx.lineTo(headX + sz * 0.15, headY - sz * 0.16);
    ctx.closePath();
    ctx.fill();

    // Right Ear
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(headX - sz * 0.1, headY + sz * 0.18);
    ctx.lineTo(headX + sz * 0.05, headY + sz * 0.42);
    ctx.lineTo(headX + sz * 0.2, headY + sz * 0.15);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fda4af';
    ctx.beginPath();
    ctx.moveTo(headX - sz * 0.05, headY + sz * 0.18);
    ctx.lineTo(headX + sz * 0.05, headY + sz * 0.36);
    ctx.lineTo(headX + sz * 0.15, headY + sz * 0.16);
    ctx.closePath();
    ctx.fill();

    // 6. Elongated Muzzle, Black Leather Rhinarium & Whiskers
    const muzzleGrad = ctx.createLinearGradient(headX, headY, headX + sz * 0.4, headY);
    muzzleGrad.addColorStop(0, '#64748b');
    muzzleGrad.addColorStop(0.7, '#334155');
    muzzleGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = muzzleGrad;

    ctx.beginPath();
    ctx.roundRect(headX + sz * 0.12, headY - sz * 0.12, sz * 0.32, sz * 0.24, [2, 6, 6, 2]);
    ctx.fill();

    // Wet Black Nose
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(headX + sz * 0.42, headY, sz * 0.06, 0, Math.PI * 2);
    ctx.fill();

    // Exposed White Canines if Hostile/Aggro
    if (state === 'chase') {
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(headX + sz * 0.32, headY - sz * 0.1);
      ctx.lineTo(headX + sz * 0.38, headY - sz * 0.16);
      ctx.lineTo(headX + sz * 0.35, headY - sz * 0.08);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(headX + sz * 0.32, headY + sz * 0.1);
      ctx.lineTo(headX + sz * 0.38, headY + sz * 0.16);
      ctx.lineTo(headX + sz * 0.35, headY + sz * 0.08);
      ctx.fill();
    }

    // 7. Piercing Amber / Crimson Predatory Eyes
    const eyeColor = state === 'chase' ? '#ef4444' : '#f59e0b';
    ctx.fillStyle = eyeColor;
    ctx.beginPath();
    ctx.arc(headX + sz * 0.15, headY - sz * 0.14, 2.5, 0, Math.PI * 2);
    ctx.arc(headX + sz * 0.15, headY + sz * 0.14, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Black Slit Pupils
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(headX + sz * 0.16, headY - sz * 0.14, 1.2, 0, Math.PI * 2);
    ctx.arc(headX + sz * 0.16, headY + sz * 0.14, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- 2. GRIZZLY BEAR ANATOMY ---
  private drawRealisticGrizzlyBear(
    ctx: CanvasRenderingContext2D,
    sz: number,
    walkCycle: number,
    bodyBob: number,
    state: string
  ) {
    const legSwing = walkCycle * (sz * 0.3);

    // 1. Heavy Tree-Trunk Bear Paws with Claws
    const pawGrad = ctx.createLinearGradient(0, -sz * 0.5, 0, sz * 0.5);
    pawGrad.addColorStop(0, '#291407');
    pawGrad.addColorStop(0.5, '#451a03');
    pawGrad.addColorStop(1, '#1c0a02');
    ctx.fillStyle = pawGrad;

    // Hind Paws
    ctx.beginPath();
    ctx.roundRect(-sz * 0.45 - legSwing, -sz * 0.5, sz * 0.28, sz * 0.38, 4);
    ctx.roundRect(-sz * 0.45 + legSwing, sz * 0.18, sz * 0.28, sz * 0.38, 4);
    ctx.fill();

    // Fore Paws
    ctx.beginPath();
    ctx.roundRect(sz * 0.2 + legSwing, -sz * 0.48, sz * 0.3, sz * 0.38, 4);
    ctx.roundRect(sz * 0.2 - legSwing, sz * 0.16, sz * 0.3, sz * 0.38, 4);
    ctx.fill();

    // Sharp Grizzly Excavating Claws (Ivory)
    ctx.fillStyle = '#e2e8f0';
    for (let c = -2; c <= 2; c++) {
      ctx.beginPath();
      ctx.arc(sz * 0.48 + legSwing, -sz * 0.48 + c * 3 + 12, 1.2, 0, Math.PI * 2);
      ctx.arc(sz * 0.48 - legSwing, sz * 0.16 + c * 3 + 12, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // 2. Colossal Muscular Grizzly Torso & Signature Shoulder Hump
    const bodyGrad = ctx.createRadialGradient(sz * 0.1, bodyBob, 3, 0, bodyBob, sz * 0.85);
    bodyGrad.addColorStop(0, '#78350f'); // Golden-tipped grizzly guard hairs
    bodyGrad.addColorStop(0.45, '#54260d');
    bodyGrad.addColorStop(0.8, '#381606');
    bodyGrad.addColorStop(1, '#1c0a02');

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(-sz * 0.05, bodyBob, sz * 0.72, sz * 0.52, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pronounced Shoulder Muscle Hump
    const humpGrad = ctx.createRadialGradient(sz * 0.18, bodyBob - sz * 0.08, 2, sz * 0.18, bodyBob, sz * 0.45);
    humpGrad.addColorStop(0, '#92400e');
    humpGrad.addColorStop(0.6, '#54260d');
    humpGrad.addColorStop(1, '#291407');
    ctx.fillStyle = humpGrad;
    ctx.beginPath();
    ctx.ellipse(sz * 0.18, bodyBob, sz * 0.42, sz * 0.46, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Massive Broad Skull & Thick Neck
    const headX = sz * 0.54;
    const headY = bodyBob;

    const headGrad = ctx.createRadialGradient(headX, headY, 2, headX, headY, sz * 0.4);
    headGrad.addColorStop(0, '#78350f');
    headGrad.addColorStop(0.6, '#451a03');
    headGrad.addColorStop(1, '#1c0a02');
    ctx.fillStyle = headGrad;

    ctx.beginPath();
    ctx.ellipse(headX, headY, sz * 0.38, sz * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4. Rounded Grizzly Ears (Tufted)
    ctx.fillStyle = '#291407';
    ctx.beginPath();
    ctx.arc(headX - sz * 0.12, headY - sz * 0.32, sz * 0.12, 0, Math.PI * 2);
    ctx.arc(headX - sz * 0.12, headY + sz * 0.32, sz * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#54260d';
    ctx.beginPath();
    ctx.arc(headX - sz * 0.1, headY - sz * 0.32, sz * 0.07, 0, Math.PI * 2);
    ctx.arc(headX - sz * 0.1, headY + sz * 0.32, sz * 0.07, 0, Math.PI * 2);
    ctx.fill();

    // 5. Broad Heavy Snout & Leathery Black Nose
    const muzzleGrad = ctx.createLinearGradient(headX, headY, headX + sz * 0.4, headY);
    muzzleGrad.addColorStop(0, '#92400e'); // Lighter tan muzzle
    muzzleGrad.addColorStop(0.7, '#78350f');
    muzzleGrad.addColorStop(1, '#291407');
    ctx.fillStyle = muzzleGrad;

    ctx.beginPath();
    ctx.roundRect(headX + sz * 0.14, headY - sz * 0.18, sz * 0.34, sz * 0.36, [4, 8, 8, 4]);
    ctx.fill();

    // Leathery Black Nose Pad
    ctx.fillStyle = '#020617';
    ctx.beginPath();
    ctx.arc(headX + sz * 0.45, headY, sz * 0.08, 0, Math.PI * 2);
    ctx.fill();

    // 6. Deep Dark Predatory Eyes
    ctx.fillStyle = state === 'chase' ? '#dc2626' : '#1c0a02';
    ctx.beginPath();
    ctx.arc(headX + sz * 0.16, headY - sz * 0.16, 2.5, 0, Math.PI * 2);
    ctx.arc(headX + sz * 0.16, headY + sz * 0.16, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Specular eye shine
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(headX + sz * 0.17, headY - sz * 0.17, 0.9, 0, Math.PI * 2);
    ctx.arc(headX + sz * 0.17, headY + sz * 0.15, 0.9, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- 3. MARSH CROCODILE ANATOMY ---
  private drawRealisticMarshCrocodile(
    ctx: CanvasRenderingContext2D,
    sz: number,
    walkCycle: number,
    time: number
  ) {
    const sCycle = Math.sin(time * 6);
    const undulation = walkCycle * 0.25;

    // 1. Sprawled Webbed Reptilian Claws
    ctx.fillStyle = '#143818';
    // Fore Claws
    ctx.beginPath();
    ctx.roundRect(sz * 0.2, -sz * 0.42 + sCycle * 3, sz * 0.22, sz * 0.24, 2);
    ctx.roundRect(sz * 0.2, sz * 0.2 - sCycle * 3, sz * 0.22, sz * 0.24, 2);
    // Hind Claws
    ctx.roundRect(-sz * 0.35, -sz * 0.44 - sCycle * 3, sz * 0.24, sz * 0.24, 2);
    ctx.roundRect(-sz * 0.35, sz * 0.22 + sCycle * 3, sz * 0.24, sz * 0.24, 2);
    ctx.fill();

    // 2. Powerful Muscular Lateral Undulating Tail
    ctx.save();
    ctx.translate(-sz * 0.45, 0);
    ctx.rotate(undulation);

    const tailGrad = ctx.createLinearGradient(0, 0, -sz * 0.85, 0);
    tailGrad.addColorStop(0, '#1c4d22');
    tailGrad.addColorStop(0.5, '#143818');
    tailGrad.addColorStop(1, '#0b200e');
    ctx.fillStyle = tailGrad;

    ctx.beginPath();
    ctx.moveTo(0, -sz * 0.22);
    ctx.quadraticCurveTo(-sz * 0.45, -sz * 0.14 + undulation * 8, -sz * 0.85, 0);
    ctx.quadraticCurveTo(-sz * 0.45, sz * 0.14 + undulation * 8, 0, sz * 0.22);
    ctx.closePath();
    ctx.fill();

    // Caudal Double Tail Scutes / Crest
    ctx.fillStyle = '#0a1a0b';
    for (let t = 1; t <= 5; t++) {
      const tx = -t * (sz * 0.14);
      ctx.beginPath();
      ctx.moveTo(tx, -3);
      ctx.lineTo(tx - 3, -sz * 0.12 - (6 - t));
      ctx.lineTo(tx + 2, -3);
      ctx.fill();
    }
    ctx.restore();

    // 3. Armored Scute-Covered Dorsal Torso & Osteoderms
    const bodyGrad = ctx.createLinearGradient(0, -sz * 0.3, 0, sz * 0.3);
    bodyGrad.addColorStop(0, '#0f2913');
    bodyGrad.addColorStop(0.3, '#245a2c');
    bodyGrad.addColorStop(0.7, '#1b4522');
    bodyGrad.addColorStop(1, '#0b1d0e');

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, sz * 0.65, sz * 0.28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Raised Osteoderm Scale Ridges along Back
    ctx.fillStyle = '#397d43';
    for (let row = -2; row <= 2; row++) {
      for (let col = -3; col <= 3; col++) {
        const scuteX = col * (sz * 0.16);
        const scuteY = row * (sz * 0.08);
        ctx.beginPath();
        ctx.ellipse(scuteX, scuteY, 3, 2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 4. Heavily Armored Reptilian Head & Broad Crocodilian Snout
    const headX = sz * 0.48;
    const snoutGrad = ctx.createLinearGradient(headX, 0, headX + sz * 0.5, 0);
    snoutGrad.addColorStop(0, '#1c4d22');
    snoutGrad.addColorStop(0.6, '#153d1b');
    snoutGrad.addColorStop(1, '#0e2912');
    ctx.fillStyle = snoutGrad;

    // Tapering V-shaped crocodilian snout
    ctx.beginPath();
    ctx.moveTo(headX, -sz * 0.24);
    ctx.lineTo(headX + sz * 0.52, -sz * 0.11);
    ctx.lineTo(headX + sz * 0.56, 0);
    ctx.lineTo(headX + sz * 0.52, sz * 0.11);
    ctx.lineTo(headX, sz * 0.24);
    ctx.closePath();
    ctx.fill();

    // Interlocking White Needle Teeth Protrusions
    ctx.fillStyle = '#ffffff';
    for (let tooth = 0; tooth < 4; tooth++) {
      const toothX = headX + sz * 0.18 + tooth * (sz * 0.08);
      ctx.fillRect(toothX, -sz * 0.18, 1.5, 2.5);
      ctx.fillRect(toothX, sz * 0.15, 1.5, 2.5);
    }

    // Raised Periscopic Reptile Eyes
    ctx.fillStyle = '#143818';
    ctx.beginPath();
    ctx.arc(headX + sz * 0.1, -sz * 0.18, 4.5, 0, Math.PI * 2);
    ctx.arc(headX + sz * 0.1, sz * 0.18, 4.5, 0, Math.PI * 2);
    ctx.fill();

    // Slit Reptile Eyes (Sulfur Yellow)
    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(headX + sz * 0.1, -sz * 0.18, 2.8, 0, Math.PI * 2);
    ctx.arc(headX + sz * 0.1, sz * 0.18, 2.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.fillRect(headX + sz * 0.09, -sz * 0.21, 1.2, 4);
    ctx.fillRect(headX + sz * 0.09, sz * 0.15, 1.2, 4);
  }

  // --- 4. MOUNTAIN COUGAR ANATOMY ---
  private drawRealisticMountainCougar(
    ctx: CanvasRenderingContext2D,
    sz: number,
    walkCycle: number,
    bodyBob: number,
    state: string
  ) {
    const legSwing = walkCycle * (sz * 0.35);

    // 1. Silent Padded Feline Paws
    const pawGrad = ctx.createLinearGradient(0, -sz * 0.4, 0, sz * 0.4);
    pawGrad.addColorStop(0, '#b45309');
    pawGrad.addColorStop(0.6, '#d97706');
    pawGrad.addColorStop(1, '#78350f');
    ctx.fillStyle = pawGrad;

    // Hind Legs
    ctx.beginPath();
    ctx.roundRect(-sz * 0.42 - legSwing, -sz * 0.36, sz * 0.16, sz * 0.3, 3);
    ctx.roundRect(-sz * 0.42 + legSwing, sz * 0.14, sz * 0.16, sz * 0.3, 3);
    ctx.fill();
    // Fore Legs
    ctx.beginPath();
    ctx.roundRect(sz * 0.22 + legSwing, -sz * 0.34, sz * 0.16, sz * 0.28, 3);
    ctx.roundRect(sz * 0.22 - legSwing, sz * 0.14, sz * 0.16, sz * 0.28, 3);
    ctx.fill();

    // 2. Long Graceful Counter-Balancing Tail (Dark Tip)
    ctx.save();
    ctx.translate(-sz * 0.48, 0);
    ctx.rotate(walkCycle * 0.3);

    const tailGrad = ctx.createLinearGradient(0, 0, -sz * 0.65, 0);
    tailGrad.addColorStop(0, '#d97706');
    tailGrad.addColorStop(0.7, '#92400e');
    tailGrad.addColorStop(1, '#1e293b'); // Iconic black tail tip
    ctx.fillStyle = tailGrad;

    ctx.beginPath();
    ctx.ellipse(-sz * 0.35, 0, sz * 0.38, sz * 0.08, -0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // 3. Sleek Tawny Muscular Feline Torso
    const bodyGrad = ctx.createRadialGradient(sz * 0.1, bodyBob, 2, 0, bodyBob, sz * 0.65);
    bodyGrad.addColorStop(0, '#fde68a'); // Soft golden cream dorsal highlights
    bodyGrad.addColorStop(0.4, '#d97706');
    bodyGrad.addColorStop(0.8, '#b45309');
    bodyGrad.addColorStop(1, '#78350f');

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, bodyBob, sz * 0.58, sz * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4. Compact Agile Cougar Head & Rounded Ears
    const headX = sz * 0.5;
    const headY = bodyBob;

    const headGrad = ctx.createRadialGradient(headX, headY, 2, headX, headY, sz * 0.32);
    headGrad.addColorStop(0, '#fde68a');
    headGrad.addColorStop(0.5, '#d97706');
    headGrad.addColorStop(1, '#92400e');
    ctx.fillStyle = headGrad;

    ctx.beginPath();
    ctx.ellipse(headX, headY, sz * 0.28, sz * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Rounded Feline Ears with Black Backing
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(headX - sz * 0.05, headY - sz * 0.22, sz * 0.09, 0, Math.PI * 2);
    ctx.arc(headX - sz * 0.05, headY + sz * 0.22, sz * 0.09, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(headX - sz * 0.04, headY - sz * 0.22, sz * 0.05, 0, Math.PI * 2);
    ctx.arc(headX - sz * 0.04, headY + sz * 0.22, sz * 0.05, 0, Math.PI * 2);
    ctx.fill();

    // 5. Short Feline Muzzle, Whisker Pads & Pink/Black Nose
    ctx.fillStyle = '#fef3c7'; // White chin & whisker pad
    ctx.beginPath();
    ctx.ellipse(headX + sz * 0.2, headY, sz * 0.15, sz * 0.16, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.ellipse(headX + sz * 0.32, headY, sz * 0.04, sz * 0.06, 0, 0, Math.PI * 2);
    ctx.fill();

    // 6. Emerald / Golden Predatory Eyes
    ctx.fillStyle = state === 'chase' ? '#ef4444' : '#10b981';
    ctx.beginPath();
    ctx.arc(headX + sz * 0.12, headY - sz * 0.11, 2.4, 0, Math.PI * 2);
    ctx.arc(headX + sz * 0.12, headY + sz * 0.11, 2.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(headX + sz * 0.13, headY - sz * 0.11, 1.2, 0, Math.PI * 2);
    ctx.arc(headX + sz * 0.13, headY + sz * 0.11, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- 5. WILD BOAR ANATOMY ---
  private drawRealisticWildBoar(
    ctx: CanvasRenderingContext2D,
    sz: number,
    walkCycle: number,
    bodyBob: number,
    state: string
  ) {
    const legSwing = walkCycle * (sz * 0.28);

    // 1. Stocky Hooves
    ctx.fillStyle = '#1c1917';
    // Hind
    ctx.fillRect(-sz * 0.42 - legSwing, -sz * 0.4, sz * 0.18, sz * 0.32);
    ctx.fillRect(-sz * 0.42 + legSwing, sz * 0.16, sz * 0.18, sz * 0.32);
    // Fore
    ctx.fillRect(sz * 0.2 + legSwing, -sz * 0.38, sz * 0.18, sz * 0.3);
    ctx.fillRect(sz * 0.2 - legSwing, sz * 0.16, sz * 0.18, sz * 0.3);

    // 2. Thick Bristled Boar Torso with Razorback Ridge
    const bodyGrad = ctx.createRadialGradient(sz * 0.05, bodyBob, 2, 0, bodyBob, sz * 0.7);
    bodyGrad.addColorStop(0, '#57534e');
    bodyGrad.addColorStop(0.5, '#292524');
    bodyGrad.addColorStop(1, '#0c0a09');

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, bodyBob, sz * 0.62, sz * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bristled dorsal ridge along spine
    ctx.fillStyle = '#0c0a09';
    for (let b = -4; b <= 4; b++) {
      const bx = b * (sz * 0.12);
      ctx.beginPath();
      ctx.moveTo(bx - 2, bodyBob);
      ctx.lineTo(bx, bodyBob - sz * 0.18);
      ctx.lineTo(bx + 2, bodyBob);
      ctx.fill();
    }

    // 3. Heavy Wedge Head & Long Cartilaginous Snout Disc
    const headX = sz * 0.5;
    const headY = bodyBob;

    const headGrad = ctx.createRadialGradient(headX, headY, 2, headX, headY, sz * 0.35);
    headGrad.addColorStop(0, '#44403c');
    headGrad.addColorStop(0.7, '#1c1917');
    ctx.fillStyle = headGrad;

    ctx.beginPath();
    ctx.ellipse(headX, headY, sz * 0.34, sz * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    // Large Rubberized Snout Disk with Nostrils
    ctx.fillStyle = '#292524';
    ctx.beginPath();
    ctx.ellipse(headX + sz * 0.38, headY, sz * 0.12, sz * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(headX + sz * 0.4, headY - 3, 2, 0, Math.PI * 2);
    ctx.arc(headX + sz * 0.4, headY + 3, 2, 0, Math.PI * 2);
    ctx.fill();

    // 4. Curved Ivory Razor Tusks (Lower Jaw Protrusions)
    ctx.fillStyle = '#f5f5f4';
    ctx.beginPath();
    ctx.moveTo(headX + sz * 0.28, headY - sz * 0.14);
    ctx.quadraticCurveTo(headX + sz * 0.42, headY - sz * 0.28, headX + sz * 0.32, headY - sz * 0.32);
    ctx.lineTo(headX + sz * 0.26, headY - sz * 0.14);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(headX + sz * 0.28, headY + sz * 0.14);
    ctx.quadraticCurveTo(headX + sz * 0.42, headY + sz * 0.28, headX + sz * 0.32, headY + sz * 0.32);
    ctx.lineTo(headX + sz * 0.26, headY + sz * 0.14);
    ctx.fill();

    // 5. Small Fierce Beady Eyes
    ctx.fillStyle = state === 'chase' ? '#dc2626' : '#ea580c';
    ctx.beginPath();
    ctx.arc(headX + sz * 0.12, headY - sz * 0.15, 2.2, 0, Math.PI * 2);
    ctx.arc(headX + sz * 0.12, headY + sz * 0.15, 2.2, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- 6. WILD RHINO ANATOMY ---
  private drawRealisticWildRhino(
    ctx: CanvasRenderingContext2D,
    sz: number,
    walkCycle: number,
    bodyBob: number,
    state: string
  ) {
    const legSwing = walkCycle * (sz * 0.25);

    // 1. Massive Columnar Armored Legs
    ctx.fillStyle = '#334155';
    // Hind
    ctx.fillRect(-sz * 0.45 - legSwing, -sz * 0.52, sz * 0.28, sz * 0.4);
    ctx.fillRect(-sz * 0.45 + legSwing, sz * 0.2, sz * 0.28, sz * 0.4);
    // Fore
    ctx.fillRect(sz * 0.2 + legSwing, -sz * 0.5, sz * 0.3, sz * 0.38);
    ctx.fillRect(sz * 0.2 - legSwing, sz * 0.18, sz * 0.3, sz * 0.38);

    // 2. Heavy Armored Plate Torso with Keratin Skin Folds
    const bodyGrad = ctx.createRadialGradient(sz * 0.1, bodyBob, 2, 0, bodyBob, sz * 0.85);
    bodyGrad.addColorStop(0, '#94a3b8');
    bodyGrad.addColorStop(0.5, '#64748b');
    bodyGrad.addColorStop(0.85, '#475569');
    bodyGrad.addColorStop(1, '#1e293b');

    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(0, bodyBob, sz * 0.74, sz * 0.52, 0, 0, Math.PI * 2);
    ctx.fill();

    // Heavy Skin Crease / Armor Folds
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(-sz * 0.1, bodyBob, sz * 0.45, -Math.PI * 0.6, Math.PI * 0.6);
    ctx.stroke();

    // 3. Colossal Armored Head
    const headX = sz * 0.52;
    const headY = bodyBob;

    const headGrad = ctx.createRadialGradient(headX, headY, 2, headX, headY, sz * 0.42);
    headGrad.addColorStop(0, '#64748b');
    headGrad.addColorStop(0.7, '#334155');
    ctx.fillStyle = headGrad;

    ctx.beginPath();
    ctx.ellipse(headX, headY, sz * 0.42, sz * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();

    // 4. Formidable Keratin Rhino Horns (Primary Front & Secondary Rear)
    // Primary Spear Horn
    const hornGrad = ctx.createLinearGradient(headX + sz * 0.3, 0, headX + sz * 0.95, 0);
    hornGrad.addColorStop(0, '#475569');
    hornGrad.addColorStop(0.6, '#cbd5e1');
    hornGrad.addColorStop(1, '#f8fafc');
    ctx.fillStyle = hornGrad;

    ctx.beginPath();
    ctx.moveTo(headX + sz * 0.35, headY - sz * 0.12);
    ctx.lineTo(headX + sz * 0.95, headY);
    ctx.lineTo(headX + sz * 0.35, headY + sz * 0.12);
    ctx.closePath();
    ctx.fill();

    // Secondary Smaller Horn
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(headX + sz * 0.15, headY - sz * 0.08);
    ctx.lineTo(headX + sz * 0.38, headY);
    ctx.lineTo(headX + sz * 0.15, headY + sz * 0.08);
    ctx.closePath();
    ctx.fill();

    // 5. Beady Armored Eyes
    ctx.fillStyle = state === 'chase' ? '#ef4444' : '#0f172a';
    ctx.beginPath();
    ctx.arc(headX + sz * 0.12, headY - sz * 0.22, 2.5, 0, Math.PI * 2);
    ctx.arc(headX + sz * 0.12, headY + sz * 0.22, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- 7. RATTLESNAKE ANATOMY ---
  private drawRealisticRattlesnake(
    ctx: CanvasRenderingContext2D,
    sz: number,
    time: number,
    state: string
  ) {
    const slitherPhase = time * 7;
    const bodyPoints = 14;

    // 1. Sinuous Sine-Wave Segmented Body
    ctx.lineWidth = sz * 0.24;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Snake Body Gradient
    const snakeGrad = ctx.createLinearGradient(-sz * 0.7, 0, sz * 0.6, 0);
    snakeGrad.addColorStop(0, '#ca8a04');
    snakeGrad.addColorStop(0.5, '#854d0e');
    snakeGrad.addColorStop(1, '#713f12');
    ctx.strokeStyle = snakeGrad;

    ctx.beginPath();
    for (let i = 0; i <= bodyPoints; i++) {
      const t = i / bodyPoints;
      const bx = (t - 0.5) * (sz * 1.3);
      const by = Math.sin(slitherPhase + t * Math.PI * 2.5) * (sz * 0.28 * (1 - t * 0.2));
      if (i === 0) ctx.moveTo(bx, by);
      else ctx.lineTo(bx, by);
    }
    ctx.stroke();

    // 2. Diamondback Scaled Patterns along Spine
    ctx.fillStyle = '#3e2008';
    for (let d = 2; d < bodyPoints - 2; d += 2) {
      const t = d / bodyPoints;
      const dx = (t - 0.5) * (sz * 1.3);
      const dy = Math.sin(slitherPhase + t * Math.PI * 2.5) * (sz * 0.28 * (1 - t * 0.2));

      ctx.beginPath();
      ctx.ellipse(dx, dy, 3.5, 2.2, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Vibrating Keratin Tail Rattle at Rear
    const rattleX = -sz * 0.68;
    const rattleY = Math.sin(slitherPhase) * (sz * 0.28);
    const rattleBuzz = Math.sin(time * 35) * 2;

    ctx.fillStyle = '#fef08a';
    for (let r = 0; r < 3; r++) {
      ctx.beginPath();
      ctx.arc(rattleX - r * 3, rattleY + rattleBuzz, 2.5 - r * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Triangular Viper Head & Heat-Sensing Pits
    const headX = sz * 0.55;
    const headY = Math.sin(slitherPhase + Math.PI * 2.5) * (sz * 0.15);

    ctx.fillStyle = '#854d0e';
    ctx.beginPath();
    ctx.moveTo(headX, headY - sz * 0.14);
    ctx.lineTo(headX + sz * 0.28, headY);
    ctx.lineTo(headX, headY + sz * 0.14);
    ctx.closePath();
    ctx.fill();

    // Forked Sensory Tongue
    if (Math.sin(time * 6) > 0.3) {
      ctx.strokeStyle = '#dc2626';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(headX + sz * 0.28, headY);
      ctx.lineTo(headX + sz * 0.42, headY);
      ctx.lineTo(headX + sz * 0.48, headY - 2.5);
      ctx.moveTo(headX + sz * 0.42, headY);
      ctx.lineTo(headX + sz * 0.48, headY + 2.5);
      ctx.stroke();
    }

    // Slit Cat-like Viper Eyes
    ctx.fillStyle = state === 'chase' ? '#dc2626' : '#eab308';
    ctx.beginPath();
    ctx.arc(headX + sz * 0.08, headY - sz * 0.08, 1.8, 0, Math.PI * 2);
    ctx.arc(headX + sz * 0.08, headY + sz * 0.08, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- THE REALISTIC HUMAN FARMER / OPERATIVE ---
  private drawFarmer(gameState: GameState) {
    const { player } = gameState;
    const ctx = this.ctx;
    const time = gameState.gameTime;

    ctx.save();
    ctx.translate(player.x, player.y);

    // Invulnerability / damage recovery flicker
    if (player.invulnerableTimer > 0 && Math.floor(player.invulnerableTimer * 14) % 2 === 0) {
      ctx.globalAlpha = 0.45;
    }

    // 1. DIRECTIONAL REALISTIC HUMAN SHADOW
    this.drawRealisticHumanShadow(ctx, player, time);

    // Rotate to human facing direction
    ctx.rotate(player.facingAngle);

    // 2. ARTICULATED LEGS & LEATHER EXPEDITION BOOTS
    this.drawRealisticHumanLegs(ctx, player, time);

    // 3. ANATOMICAL TORSO, UTILITY SHIRT & BELT
    this.drawRealisticHumanTorso(ctx, player, time);

    // 4. TACTICAL HYDRATION BACKPACK & FLUID TANK
    this.drawRealisticHydrationPack(ctx, player, time);

    // 5. ARTICULATED ARMS, HANDS & WRIST INSTRUMENTS
    this.drawRealisticHumanArms(ctx, player, time);

    // 6. ANATOMICAL HEAD, FACE, HAIR & EXPEDITION HEADWEAR
    this.drawRealisticHumanHead(ctx, player, time);

    // 7. ACTIVE HELD EQUIPMENT (FLARE / STONE / SPRAY NOZZLE)
    this.drawRealisticHeldEquipment(ctx, player, time);

    ctx.restore();

    // 8. PRESSURIZED WATERING FLUID JET (WHEN WATERING)
    if (player.isWatering && player.waterCarried > 0) {
      this.drawRealisticWateringStream(ctx, player, time);
    }
  }

  // --- REALISTIC DIRECTIONAL SOFT SHADOW ---
  private drawRealisticHumanShadow(ctx: CanvasRenderingContext2D, player: any, _time: number) {
    ctx.save();
    // Ambient Occlusion Contact Shadow directly under feet
    const aoGrad = ctx.createRadialGradient(0, 4, 3, 0, 4, 18);
    aoGrad.addColorStop(0, 'rgba(0, 0, 0, 0.55)');
    aoGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.25)');
    aoGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = aoGrad;
    ctx.beginPath();
    ctx.ellipse(0, 4, 16, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Directional Sun Cast Shadow (offset slightly southeast)
    ctx.save();
    ctx.translate(6, 10);
    ctx.scale(1.1, 0.65);
    ctx.rotate(0.3);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
    ctx.beginPath();
    // Silhouette of human body
    ctx.ellipse(0, 0, 18, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore();
  }

  // --- REALISTIC ARTICULATED LEGS & TRAIL BOOTS ---
  private drawRealisticHumanLegs(ctx: CanvasRenderingContext2D, player: any, _time: number) {
    const isMoving = Math.abs(player.vx) > 0.1 || Math.abs(player.vy) > 0.1;
    const stride = isMoving ? Math.sin(player.animTime * Math.PI * 0.5) : 0;
    const strideOffset = stride * (player.isSprinting ? 9 : player.isCrouching ? 4 : 6);
    const kneeBend = Math.abs(stride) * 2.5;

    // Legs are drawn relative to human facing (X is forward, Y is lateral)
    // Left Leg (Y < 0) & Right Leg (Y > 0)
    const legConfigs = [
      { yOffset: -7.5, strideMul: 1, isLeft: true },
      { yOffset: 7.5, strideMul: -1, isLeft: false },
    ];

    for (const leg of legConfigs) {
      const legStride = strideOffset * leg.strideMul;
      const legX = -4 + legStride;
      const legY = leg.yOffset;

      ctx.save();
      ctx.translate(legX, legY);

      // Thigh & Trousers (Rugged Indigo Denim with Natural Creases)
      const thighGrad = ctx.createLinearGradient(-8, -4, 4, 4);
      thighGrad.addColorStop(0, '#1a324b');
      thighGrad.addColorStop(0.5, '#2b4d75');
      thighGrad.addColorStop(1, '#1d3958');

      ctx.fillStyle = thighGrad;
      ctx.beginPath();
      // Anatomical tapered thigh and knee
      ctx.roundRect(-7, -4.5, 11, 9, [3, 4, 4, 3]);
      ctx.fill();

      // Double-stitched gold seam on outer edge
      ctx.strokeStyle = '#9c7a3c';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(-6, leg.isLeft ? -4.5 : 4.5);
      ctx.lineTo(3, leg.isLeft ? -4.5 : 4.5);
      ctx.stroke();

      // Knee crease folds
      ctx.strokeStyle = '#122336';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-1, -2.5);
      ctx.lineTo(0, 2.5);
      ctx.stroke();

      // Heavy Leather Field Trail Boot
      const bootX = -9 - kneeBend * 0.4;
      const bootY = leg.isLeft ? -0.5 : 0.5;

      // Boot Outsole (Dark rubber lug tread)
      ctx.fillStyle = '#18120c';
      ctx.beginPath();
      ctx.roundRect(bootX - 2, bootY - 3.5, 7, 7, 2);
      ctx.fill();

      // Boot Upper Leather (Waxed saddle brown)
      const bootGrad = ctx.createLinearGradient(bootX - 2, -3, bootX + 4, 3);
      bootGrad.addColorStop(0, '#3d2516');
      bootGrad.addColorStop(0.5, '#5a371f');
      bootGrad.addColorStop(1, '#412716');
      ctx.fillStyle = bootGrad;
      ctx.beginPath();
      ctx.roundRect(bootX - 1.5, bootY - 3, 6, 6, 2);
      ctx.fill();

      // Boot Toe Cap highlight
      ctx.fillStyle = '#784d2d';
      ctx.beginPath();
      ctx.arc(bootX + 3.5, bootY, 2, -Math.PI / 2, Math.PI / 2);
      ctx.fill();

      // Brass Eyelet & Lace detailing
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(bootX, bootY - 2, 1.2, 1.2);
      ctx.fillRect(bootX, bootY + 0.8, 1.2, 1.2);

      ctx.restore();
    }
  }

  // --- REALISTIC HUMAN TORSO, UTILITY SHIRT & GEAR BELT ---
  private drawRealisticHumanTorso(ctx: CanvasRenderingContext2D, player: any, time: number) {
    // Breathing subtle expansion
    const breath = Math.sin(time * 2.6) * 0.6;
    // Torso lean forward during sprint/crouch
    const leanX = player.isSprinting ? 3 : player.isCrouching ? 1.5 : 0;

    ctx.save();
    ctx.translate(leanX, 0);

    // Torso base shape: Broad muscular shoulders tapering down to hips
    ctx.save();
    // Torso shadow under backpack
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(-1, 0, 11 + breath, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Heavy Cotton Field Jacket / Buffalo Flannel Shirt
    const shirtGrad = ctx.createRadialGradient(2, 0, 2, 0, 0, 13);
    shirtGrad.addColorStop(0, '#a82c2c'); // Rich crimson
    shirtGrad.addColorStop(0.6, '#861e1e');
    shirtGrad.addColorStop(1, '#501010'); // Deep seam shadow

    ctx.fillStyle = shirtGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 9.5 + breath, 11.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Woven Check Texture Lines
    ctx.strokeStyle = 'rgba(20, 20, 20, 0.45)';
    ctx.lineWidth = 1.2;
    // Longitudinal stripes
    ctx.beginPath();
    ctx.moveTo(-7, -7);
    ctx.lineTo(7, -7);
    ctx.moveTo(-7, 0);
    ctx.lineTo(7, 0);
    ctx.moveTo(-7, 7);
    ctx.lineTo(7, 7);
    ctx.stroke();

    // Latitudinal stripes
    ctx.beginPath();
    ctx.moveTo(-4, -9);
    ctx.lineTo(-4, 9);
    ctx.moveTo(3, -9);
    ctx.lineTo(3, 9);
    ctx.stroke();

    // Folded Shirt Collar (exposing muscular neck)
    ctx.fillStyle = '#b93232';
    ctx.strokeStyle = '#501010';
    ctx.lineWidth = 0.8;
    // Left collar flap
    ctx.beginPath();
    ctx.moveTo(3, -4);
    ctx.lineTo(6, -6);
    ctx.lineTo(5, -2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    // Right collar flap
    ctx.beginPath();
    ctx.moveTo(3, 4);
    ctx.lineTo(6, 6);
    ctx.lineTo(5, 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Button Placket down front chest
    ctx.fillStyle = '#7a1919';
    ctx.fillRect(1, -1.2, 5, 2.4);
    // Miniature Brass Buttons
    ctx.fillStyle = '#f6e05e';
    ctx.beginPath();
    ctx.arc(2.5, 0, 0.9, 0, Math.PI * 2);
    ctx.arc(4.5, 0, 0.9, 0, Math.PI * 2);
    ctx.fill();

    // Heavy Leather Utility Work Belt
    ctx.fillStyle = '#3a2012';
    ctx.fillRect(-6, -8.5, 3.2, 17);
    // Metallic Brass Belt Buckle
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(-6.5, -2.5, 3.8, 5);
    ctx.fillStyle = '#1a0e08';
    ctx.fillRect(-5.5, -1.5, 2, 3);

    // Left Hip: Stone Utility Pouch
    ctx.fillStyle = '#543d2b';
    ctx.beginPath();
    ctx.roundRect(-6, -11, 4, 3, 1);
    ctx.fill();

    // Right Hip: Leather Hunting Knife Sheath with Brass Hilt
    ctx.fillStyle = '#2b1a10';
    ctx.beginPath();
    ctx.roundRect(-6, 8, 5, 2.8, 1);
    ctx.fill();
    // Knife Hilt
    ctx.fillStyle = '#cbd5e0';
    ctx.fillRect(-2, 8.5, 3, 1.8);
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(-2, 7.8, 1, 3.2);

    ctx.restore();
    ctx.restore();
  }

  // --- REALISTIC TACTICAL HYDRATION BACKPACK & FLUID TANK ---
  private drawRealisticHydrationPack(ctx: CanvasRenderingContext2D, player: any, time: number) {
    ctx.save();
    ctx.translate(-7, 0);

    // 1. Padded Backpack Harness Base
    ctx.fillStyle = '#223326'; // Rugged olive drab cordura
    ctx.beginPath();
    ctx.roundRect(-6, -7.5, 10, 15, 3);
    ctx.fill();

    // Webbing harness shoulder straps over chest
    ctx.fillStyle = '#162219';
    ctx.fillRect(0, -7.5, 7, 2.5);
    ctx.fillRect(0, 5, 7, 2.5);
    // Sternum strap quick-release buckle
    ctx.fillStyle = '#718096';
    ctx.fillRect(3, -1.2, 2, 2.4);

    // 2. High-Tech Cylindrical Water Reservoir (Copper & Brass Alloy)
    const tankGrad = ctx.createLinearGradient(-4, -6, 2, 6);
    tankGrad.addColorStop(0, '#b87333'); // Polished copper
    tankGrad.addColorStop(0.3, '#d49b6a'); // Metallic highlight
    tankGrad.addColorStop(0.7, '#8c4e20');
    tankGrad.addColorStop(1, '#572d0f');

    ctx.fillStyle = tankGrad;
    ctx.beginPath();
    ctx.roundRect(-4.5, -6, 7.5, 12, 3);
    ctx.fill();

    // Riveted Brass Reinforcement Bands
    ctx.fillStyle = '#d4af37';
    ctx.fillRect(-4.5, -4.5, 7.5, 1.2);
    ctx.fillRect(-4.5, 3.3, 7.5, 1.2);

    // 3. Transparent Fluid Sight Glass (Shows real volumetric water level)
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-2, -3.5, 4, 7);

    const fillRatio = player.waterCapacity > 0 ? player.waterCarried / player.waterCapacity : 0;
    if (fillRatio > 0.02) {
      // Sloshing water gradient
      const waterGrad = ctx.createLinearGradient(-2, 3.5, -2, 3.5 - 7 * fillRatio);
      waterGrad.addColorStop(0, '#0284c7');
      waterGrad.addColorStop(0.7, '#38bdf8');
      waterGrad.addColorStop(1, '#e0f2fe');

      ctx.fillStyle = waterGrad;
      const slosh = Math.sin(time * 6 + player.x * 0.1) * 0.4;
      ctx.fillRect(-1.8, 3.5 - 7 * fillRatio + slosh, 3.6, 7 * fillRatio - slosh);

      // Micro bubble inside sight glass
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(0, 2 - (time * 4) % 4, 0.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // Glass reflection sheen
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fillRect(-1.5, -3, 0.8, 6);

    // Pressure Gauge Dial on top
    ctx.fillStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.arc(0, -6.5, 2, 0, Math.PI * 2);
    ctx.fill();
    // Needle
    ctx.strokeStyle = fillRatio > 0.5 ? '#10b981' : '#f59e0b';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, -6.5);
    ctx.lineTo(Math.cos(fillRatio * Math.PI) * 1.5, -6.5 + Math.sin(fillRatio * Math.PI) * 1.5);
    ctx.stroke();

    // Reinforced Ribbed Hose routing to right arm
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(0, 6);
    ctx.bezierCurveTo(4, 8, 7, 7, 7, 4);
    ctx.stroke();

    ctx.restore();
  }

  // --- REALISTIC ARTICULATED ARMS, HANDS & WRIST INSTRUMENTS ---
  private drawRealisticHumanArms(ctx: CanvasRenderingContext2D, player: any, _time: number) {
    const isMoving = Math.abs(player.vx) > 0.1 || Math.abs(player.vy) > 0.1;
    const armSwing = isMoving ? Math.sin(player.animTime * Math.PI * 0.5) : 0;
    const swingAngle = armSwing * (player.isSprinting ? 0.45 : 0.25);

    // Skin Tone Palette (Realistic Subsurface Scattering)
    const skinHigh = '#ffd8b3';
    const skinMid = '#e59f6b';
    const skinShadow = '#b0693c';

    // Left Arm (Y < 0) - Swings opposite to Left Leg
    ctx.save();
    ctx.translate(2, -9.5);
    ctx.rotate(-swingAngle);

    // Deltoid Shoulder & Rolled Shirt Sleeve
    ctx.fillStyle = '#861e1e';
    ctx.beginPath();
    ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
    ctx.fill();
    // Sleeve rolled cuff
    ctx.fillStyle = '#501010';
    ctx.fillRect(0, -3.5, 2.5, 7);

    // Muscular Forearm
    const leftArmGrad = ctx.createLinearGradient(0, -3, 8, 0);
    leftArmGrad.addColorStop(0, skinMid);
    leftArmGrad.addColorStop(0.5, skinHigh);
    leftArmGrad.addColorStop(1, skinShadow);

    ctx.fillStyle = leftArmGrad;
    ctx.beginPath();
    ctx.roundRect(1.5, -2.8, 8, 5.6, 2.5);
    ctx.fill();

    // Left Wrist: High-Tech Biometric Expedition Watch
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(6, -3, 3, 6);
    // Glowing Teal Status Screen
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(6.8, -2, 1.4, 4);

    // Left Hand (5 Articulated Fingers & Knuckles)
    ctx.fillStyle = skinMid;
    ctx.beginPath();
    ctx.roundRect(9, -2.5, 4, 5, 2);
    ctx.fill();
    // Thumb
    ctx.beginPath();
    ctx.arc(10.5, -2.5, 1.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Right Arm (Y > 0) - Swings forward when left swings back
    ctx.save();
    ctx.translate(2, 9.5);
    ctx.rotate(swingAngle);

    // Deltoid Shoulder & Rolled Sleeve
    ctx.fillStyle = '#861e1e';
    ctx.beginPath();
    ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#501010';
    ctx.fillRect(0, -3.5, 2.5, 7);

    // Right Forearm
    const rightArmGrad = ctx.createLinearGradient(0, 0, 8, 3);
    rightArmGrad.addColorStop(0, skinMid);
    rightArmGrad.addColorStop(0.5, skinHigh);
    rightArmGrad.addColorStop(1, skinShadow);

    ctx.fillStyle = rightArmGrad;
    ctx.beginPath();
    ctx.roundRect(1.5, -2.8, 8, 5.6, 2.5);
    ctx.fill();

    // Right Wrist: Leather Utility Wrap
    ctx.fillStyle = '#452715';
    ctx.fillRect(6, -3, 2.5, 6);

    // Right Hand (Gripping posture)
    ctx.fillStyle = skinMid;
    ctx.beginPath();
    ctx.roundRect(9, -2.5, 4, 5, 2);
    ctx.fill();
    // Thumb
    ctx.beginPath();
    ctx.arc(10.5, 2.5, 1.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // --- REALISTIC ANATOMICAL HEAD, FACE, HAIR & EXPEDITION HEADWEAR ---
  private drawRealisticHumanHead(ctx: CanvasRenderingContext2D, player: any, _time: number) {
    ctx.save();
    ctx.translate(3.5, 0);

    // 1. Muscular Neck & Trapezius Connection
    const neckGrad = ctx.createLinearGradient(-4, 0, 2, 0);
    neckGrad.addColorStop(0, '#9c542b');
    neckGrad.addColorStop(0.6, '#cc8250');
    neckGrad.addColorStop(1, '#e59f6b');

    ctx.fillStyle = neckGrad;
    ctx.beginPath();
    ctx.roundRect(-4, -4.5, 6, 9, 2);
    ctx.fill();

    // 2. Anatomical Skull Base
    const headGrad = ctx.createRadialGradient(2, 0, 2, 0, 0, 9);
    headGrad.addColorStop(0, '#ffe0c2');
    headGrad.addColorStop(0.5, '#e8a16c');
    headGrad.addColorStop(1, '#a65b2d');

    ctx.fillStyle = headGrad;
    ctx.beginPath();
    ctx.ellipse(0.5, 0, 7.5, 6.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // 3. Sculpted Anatomical Ears (Helix, Antihelix & Lobe)
    const earConfigs = [{ y: -6.5, isTop: true }, { y: 6.5, isTop: false }];
    for (const ear of earConfigs) {
      ctx.fillStyle = '#d48a56';
      ctx.beginPath();
      ctx.ellipse(-0.5, ear.y, 2.2, 1.5, ear.isTop ? -0.2 : 0.2, 0, Math.PI * 2);
      ctx.fill();
      // Concha cavity shadow
      ctx.fillStyle = '#6b3618';
      ctx.beginPath();
      ctx.ellipse(-0.5, ear.y + (ear.isTop ? 0.3 : -0.3), 1, 0.7, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Facial Features (Viewed from top-down 2.5D angle)
    // Brow Ridge & Nose Bridge
    ctx.fillStyle = '#ffeedb';
    ctx.fillRect(4.5, -1, 3.5, 2); // Nose bridge highlight
    ctx.fillStyle = '#7a3e1a';
    ctx.fillRect(7.8, -0.8, 0.8, 1.6); // Nose tip shadow & nostrils

    // Eyes with White Sclera & Focused Amber/Brown Iris
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(4, -3.2, 2.2, 1.4); // Left eye sclera
    ctx.fillRect(4, 1.8, 2.2, 1.4); // Right eye sclera

    ctx.fillStyle = '#3e2211'; // Brown Iris looking forward
    ctx.fillRect(4.8, -3, 1.2, 1.2);
    ctx.fillRect(4.8, 2, 1.2, 1.2);

    // Eyebrows
    ctx.fillStyle = '#26170d';
    ctx.fillRect(3.5, -3.6, 3, 0.8);
    ctx.fillRect(3.5, 2.8, 3, 0.8);

    // Natural 5 o'clock Beard Stubble / Jawline contour
    ctx.fillStyle = 'rgba(45, 25, 15, 0.35)';
    ctx.beginPath();
    ctx.arc(3.5, 0, 5.5, -Math.PI / 2.2, Math.PI / 2.2);
    ctx.fill();

    // 5. Rugged Expedition Field Boonie Hat (or Layered Hair)
    // Boonie Hat Brim (Waxed Canvas with Realistic Stitched Brim)
    ctx.save();
    // Hat Shadow on face
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.arc(0, 0, 9.5, 0, Math.PI * 2);
    ctx.fill();

    // Wide Stitched Canvas Brim
    const hatGrad = ctx.createRadialGradient(-1, -1, 3, 0, 0, 10);
    hatGrad.addColorStop(0, '#c29b61'); // Khaki canvas
    hatGrad.addColorStop(0.7, '#9e7b45');
    hatGrad.addColorStop(1, '#664d26'); // Edge shadow

    ctx.fillStyle = hatGrad;
    ctx.beginPath();
    ctx.ellipse(-0.5, 0, 9.5, 8.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Concentric Stitching Rings on Brim
    ctx.strokeStyle = '#523c1c';
    ctx.lineWidth = 0.6;
    ctx.beginPath();
    ctx.ellipse(-0.5, 0, 8.2, 7.2, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Hat Crown (Tapered top cylinder)
    const crownGrad = ctx.createRadialGradient(-1.5, -1.5, 2, -1, 0, 5.5);
    crownGrad.addColorStop(0, '#deb87a');
    crownGrad.addColorStop(0.8, '#a37f48');
    crownGrad.addColorStop(1, '#705327');

    ctx.fillStyle = crownGrad;
    ctx.beginPath();
    ctx.ellipse(-1, 0, 5.5, 4.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Webbing Band & Brass Ventilation Grommets
    ctx.strokeStyle = '#3d2a13';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(-1, 0, 5.6, 4.9, 0, 0, Math.PI * 2);
    ctx.stroke();

    // Brass Grommets on Crown
    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.arc(-1, -3.8, 0.7, 0, Math.PI * 2);
    ctx.arc(-1, 3.8, 0.7, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    ctx.restore();
  }

  // --- ACTIVE HELD EQUIPMENT (FLARE / STONE / SPRAY NOZZLE) ---
  private drawRealisticHeldEquipment(ctx: CanvasRenderingContext2D, player: any, time: number) {
    // A. Spray Gun / Nozzle (Always held in right hand when has water)
    if (player.waterCarried > 0 || player.isWatering) {
      ctx.save();
      ctx.translate(13, 8);

      // Brass Nozzle Body
      ctx.fillStyle = '#d4af37';
      ctx.fillRect(0, -1.5, 7, 3);
      // Nozzle Tip
      ctx.fillStyle = '#f6e05e';
      ctx.fillRect(7, -1, 2, 2);
      // Trigger Grip
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(2, 1, 2, 3);

      ctx.restore();
    }

    // B. Burning Flare (When player has flare active or equipped)
    if (player.activeItem === 'flare' && player.inventory.flares > 0) {
      ctx.save();
      ctx.translate(12, -9);

      // Flare Stick Tube
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(0, -1.5, 8, 3);
      ctx.fillStyle = '#f87171';
      ctx.fillRect(8, -1.2, 1.5, 2.4);

      // Animated Flame Core & Glow
      const flicker = Math.sin(time * 25) * 2;
      const flameGrad = ctx.createRadialGradient(9, 0, 1, 9, 0, 9 + flicker);
      flameGrad.addColorStop(0, '#ffffff');
      flameGrad.addColorStop(0.3, '#fef08a');
      flameGrad.addColorStop(0.7, '#f97316');
      flameGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.arc(9, 0, 9 + flicker, 0, Math.PI * 2);
      ctx.fill();

      // Incandescent Sparks
      ctx.fillStyle = '#fffbeb';
      for (let i = 0; i < 3; i++) {
        const sparkAng = (time * 15 + i * 2) % (Math.PI * 2);
        const sparkDist = 6 + (time * 20 + i * 5) % 8;
        ctx.fillRect(9 + Math.cos(sparkAng) * sparkDist, Math.sin(sparkAng) * sparkDist, 1.5, 1.5);
      }

      ctx.restore();
    }

    // C. Stone Grip (When stone is active)
    if (player.activeItem === 'stone' && player.inventory.stones > 0) {
      ctx.save();
      ctx.translate(12, -9);
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.ellipse(2, 0, 3.5, 2.5, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  // --- PRESSURIZED WATERING FLUID JET STREAM ---
  private drawRealisticWateringStream(ctx: CanvasRenderingContext2D, player: any, time: number) {
    ctx.save();
    const streamLength = 48;
    const sprayAngle = player.facingAngle;
    const originX = player.x + Math.cos(sprayAngle + 0.3) * 14;
    const originY = player.y + Math.sin(sprayAngle + 0.3) * 14;
    const targetX = player.x + Math.cos(sprayAngle) * streamLength;
    const targetY = player.y + Math.sin(sprayAngle) * streamLength;

    // 1. High Velocity Pressurized Water Arc
    const streamGrad = ctx.createLinearGradient(originX, originY, targetX, targetY);
    streamGrad.addColorStop(0, 'rgba(224, 242, 254, 0.95)'); // Pure white-cyan
    streamGrad.addColorStop(0.4, 'rgba(56, 189, 248, 0.85)');
    streamGrad.addColorStop(0.8, 'rgba(2, 132, 199, 0.7)');
    streamGrad.addColorStop(1, 'rgba(14, 165, 233, 0.2)');

    ctx.strokeStyle = streamGrad;
    ctx.lineWidth = 4.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    const midX = (originX + targetX) / 2;
    const midY = (originY + targetY) / 2 - 8;
    ctx.quadraticCurveTo(midX, midY, targetX, targetY);
    ctx.stroke();

    // 2. High-Pressure White Core Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(originX, originY);
    ctx.quadraticCurveTo(midX, midY, targetX * 0.9 + originX * 0.1, targetY * 0.9 + originY * 0.1);
    ctx.stroke();

    // 3. Dynamic Water Droplet Mist & Splash Impact Rings
    ctx.fillStyle = 'rgba(186, 230, 253, 0.85)';
    for (let i = 0; i < 6; i++) {
      const prog = ((time * 4 + i * 0.18) % 1);
      const dropX = originX + (targetX - originX) * prog + (Math.sin(i * 3 + time * 10) * 4);
      const dropY = originY + (targetY - originY) * prog - Math.sin(prog * Math.PI) * 10 + (Math.cos(i * 2) * 3);
      ctx.beginPath();
      ctx.arc(dropX, dropY, 1.5 + prog * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Impact splash ring on ground
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
    ctx.lineWidth = 1.5;
    const ripple = (time * 8) % 12;
    ctx.beginPath();
    ctx.ellipse(targetX, targetY, ripple, ripple * 0.5, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }

  // --- ELEVATION OBSTACLES (REALISTIC TREES, ROCKS) ---
  private drawElevationObstacles(state: GameState) {
    const ctx = this.ctx;
    const time = state.gameTime;

    for (const obs of state.obstacles) {
      const rad = obs.radius || 30;

      if (obs.type === 'tree') {
        // 1. Cast Ground Shadow
        ctx.fillStyle = 'rgba(0,0,0,0.38)';
        ctx.beginPath();
        ctx.ellipse(obs.x + 12, obs.y + 16, rad * 1.15, rad * 0.55, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // 2. Heavy Textured Tree Trunk & Bark Fissures
        const trunkGrad = ctx.createLinearGradient(obs.x - 8, obs.y - 15, obs.x + 8, obs.y + 10);
        trunkGrad.addColorStop(0, '#451a03');
        trunkGrad.addColorStop(0.5, '#78350f');
        trunkGrad.addColorStop(1, '#291407');
        ctx.fillStyle = trunkGrad;

        ctx.beginPath();
        ctx.roundRect(obs.x - 7, obs.y - 16, 14, 22, [2, 2, 6, 6]);
        ctx.fill();

        // Bark texture creases
        ctx.strokeStyle = '#1e0c03';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(obs.x - 3, obs.y - 12);
        ctx.lineTo(obs.x - 2, obs.y + 4);
        ctx.moveTo(obs.x + 3, obs.y - 10);
        ctx.lineTo(obs.x + 2, obs.y + 3);
        ctx.stroke();

        // 3. Multi-Tiered Wind-Swaying Canopy Foliage
        const sway = Math.sin(time * 1.6 + obs.x * 0.08) * 3.5;
        const canopyY = obs.y - 28;

        const canopyDiscs = [
          { dx: -rad * 0.35, dy: rad * 0.15, size: rad * 0.75, tier: 0 },
          { dx: rad * 0.35, dy: rad * 0.12, size: rad * 0.78, tier: 0 },
          { dx: 0, dy: -rad * 0.25, size: rad * 0.85, tier: 1 },
          { dx: -rad * 0.12, dy: -rad * 0.05, size: rad * 0.82, tier: 2 },
          { dx: rad * 0.15, dy: -rad * 0.08, size: rad * 0.84, tier: 2 },
        ];

        for (const cd of canopyDiscs) {
          const discX = obs.x + cd.dx + sway;
          const discY = canopyY + cd.dy;
          const cGrad = ctx.createRadialGradient(discX - cd.size * 0.3, discY - cd.size * 0.3, 2, discX, discY, cd.size);

          if (cd.tier === 0) {
            cGrad.addColorStop(0, '#15803d');
            cGrad.addColorStop(0.7, '#166534');
            cGrad.addColorStop(1, '#052e16');
          } else if (cd.tier === 1) {
            cGrad.addColorStop(0, '#22c55e');
            cGrad.addColorStop(0.6, '#15803d');
            cGrad.addColorStop(1, '#14532d');
          } else {
            cGrad.addColorStop(0, '#4ade80');
            cGrad.addColorStop(0.6, '#16a34a');
            cGrad.addColorStop(1, '#0f3a22');
          }

          ctx.fillStyle = cGrad;
          ctx.beginPath();
          ctx.arc(discX, discY, cd.size, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (obs.type === 'rock_cluster') {
        // Solid rock boulder with geological facet strata
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.beginPath();
        ctx.ellipse(obs.x + 6, obs.y + 8, rad * 1.05, rad * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();

        // Main boulder gradient
        const rockGrad = ctx.createLinearGradient(obs.x - rad, obs.y - rad, obs.x + rad, obs.y + rad);
        rockGrad.addColorStop(0, '#94a3b8');
        rockGrad.addColorStop(0.45, '#64748b');
        rockGrad.addColorStop(0.85, '#334155');
        rockGrad.addColorStop(1, '#1e293b');

        ctx.fillStyle = rockGrad;
        ctx.beginPath();
        ctx.ellipse(obs.x, obs.y, rad, rad * 0.78, -0.15, 0, Math.PI * 2);
        ctx.fill();

        // Geological strata facet lines
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.65)';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(obs.x - rad * 0.6, obs.y - rad * 0.2);
        ctx.lineTo(obs.x + rad * 0.2, obs.y);
        ctx.lineTo(obs.x + rad * 0.7, obs.y + rad * 0.3);
        ctx.stroke();

        // Moss patch on boulder
        ctx.fillStyle = '#4d7c0f';
        ctx.beginPath();
        ctx.arc(obs.x - rad * 0.3, obs.y - rad * 0.2, 5, 0, Math.PI * 2);
        ctx.arc(obs.x - rad * 0.15, obs.y - rad * 0.3, 4, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // --- FLARES ---
  private drawFlares(state: GameState) {
    const ctx = this.ctx;
    const time = state.gameTime;

    for (const fl of state.flares) {
      // Glow light circle
      const flareGrad = ctx.createRadialGradient(fl.x, fl.y, 5, fl.x, fl.y, fl.radius);
      flareGrad.addColorStop(0, 'rgba(255, 100, 0, 0.45)');
      flareGrad.addColorStop(0.4, 'rgba(255, 160, 50, 0.2)');
      flareGrad.addColorStop(1, 'rgba(255, 60, 0, 0)');

      ctx.fillStyle = flareGrad;
      ctx.beginPath();
      ctx.arc(fl.x, fl.y, fl.radius, 0, Math.PI * 2);
      ctx.fill();

      // Flare Torch Head
      ctx.fillStyle = '#ff4500';
      ctx.beginPath();
      ctx.arc(fl.x, fl.y, 6 + Math.sin(time * 15) * 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(fl.x, fl.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- PARTICLES ---
  private drawParticles(state: GameState, layer: 'ground' | 'air') {
    const ctx = this.ctx;

    for (const pt of state.particles) {
      const isAir = pt.type === 'firefly' || pt.type === 'petal' || pt.type === 'water_drop' || pt.type === 'smoke';
      if (layer === 'ground' && isAir) continue;
      if (layer === 'air' && !isAir) continue;

      ctx.save();
      ctx.globalAlpha = pt.alpha;
      ctx.fillStyle = pt.color;

      if (pt.type === 'puddle_ripple') {
        ctx.strokeStyle = pt.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size * (1 + (1 - pt.alpha)), 0, Math.PI * 2);
        ctx.stroke();
      } else if (pt.type === 'firefly') {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // --- ATMOSPHERIC LIGHTING OVERLAYS ---
  private drawAtmosphereOverlay(state: GameState, camX: number, camY: number) {
    const { level, player, flares } = state;
    const ctx = this.ctx;
    const weather = level.weather;

    if (weather === 'night') {
      // Dark vignette night mask
      ctx.save();
      ctx.fillStyle = 'rgba(10, 15, 30, 0.88)';
      ctx.fillRect(camX, camY, this.width, this.height);

      // Carve out light circle around player (torch / lantern)
      ctx.globalCompositeOperation = 'destination-out';

      const lightGrad = ctx.createRadialGradient(player.x, player.y, 20, player.x, player.y, 220);
      lightGrad.addColorStop(0, 'rgba(0,0,0,1)');
      lightGrad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = lightGrad;
      ctx.beginPath();
      ctx.arc(player.x, player.y, 220, 0, Math.PI * 2);
      ctx.fill();

      // Carve out lights around active flares
      for (const fl of flares) {
        const flareLight = ctx.createRadialGradient(fl.x, fl.y, 10, fl.x, fl.y, fl.radius);
        flareLight.addColorStop(0, 'rgba(0,0,0,1)');
        flareLight.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = flareLight;
        ctx.beginPath();
        ctx.arc(fl.x, fl.y, fl.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    } else if (weather === 'golden_hour' || weather === 'sunset') {
      // Warm amber glow
      ctx.fillStyle = 'rgba(255, 140, 40, 0.12)';
      ctx.fillRect(camX, camY, this.width, this.height);
    } else if (weather === 'rain_storm') {
      // Moody cool blue-slate
      ctx.fillStyle = 'rgba(25, 45, 75, 0.18)';
      ctx.fillRect(camX, camY, this.width, this.height);
    } else if (weather === 'misty_dawn') {
      // Soft morning mist
      ctx.fillStyle = 'rgba(220, 235, 245, 0.15)';
      ctx.fillRect(camX, camY, this.width, this.height);
    }
  }
}
