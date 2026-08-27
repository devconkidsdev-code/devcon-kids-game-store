import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  RIVER_MIN_X,
  RIVER_MAX_X,
} from './constants';
import { PlayerState, Obstacle, WaveState, RoundConfig, BiomeType } from '../types';
import { ParticleSystem } from './particles';

export class GameRenderer {
  private waterTime = 0;
  private rainTime = 0;
  private lightningTimer = 0;
  private lightningFlash = 0;

  public render(
    ctx: CanvasRenderingContext2D,
    player: PlayerState,
    wave: WaveState,
    obstacles: Obstacle[],
    particles: ParticleSystem,
    cameraY: number,
    isStage2: boolean,
    isTransitioning: boolean,
    transitionProgress: number,
    roundConfig: RoundConfig,
    stage1Length: number,
    totalLength: number
  ) {
    this.waterTime += 0.035;
    this.rainTime += 0.05;

    // Lightning flashes in storm round
    if (roundConfig.biome === 'storm') {
      this.lightningTimer += 0.016;
      if (this.lightningTimer > 4 + Math.random() * 5) {
        this.lightningTimer = 0;
        this.lightningFlash = 0.8;
      }
      if (this.lightningFlash > 0) {
        this.lightningFlash -= 0.05;
      }
    } else {
      this.lightningFlash = 0;
    }

    // Clear canvas
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 1. Draw Background (Land or River) based on round biome
    if (!isStage2 && !isTransitioning) {
      this.drawStage1Background(ctx, cameraY, roundConfig.biome);
    } else if (isTransitioning) {
      this.drawTransitionBackground(ctx, cameraY, transitionProgress, roundConfig.biome);
    } else {
      this.drawStage2Background(ctx, cameraY, roundConfig.biome);
    }

    // 2. Draw Obstacles behind player or in water
    this.drawObstacles(ctx, obstacles, cameraY);

    // 3. Draw Boat on Dock if in Stage 1
    if (!isStage2 && !isTransitioning) {
      this.drawDockedBoat(ctx, cameraY, stage1Length);
    }

    // 4. Draw Finish Line if near end of Stage 2
    if (isStage2 || isTransitioning) {
      this.drawFinishLine(ctx, cameraY, totalLength, roundConfig.round);
    }

    // 5. Draw Particles
    particles.draw(ctx, cameraY);

    // 6. Draw Rain if Storm Biome
    if (roundConfig.biome === 'storm') {
      this.drawRain(ctx);
    }

    // 7. Draw Player (Old Man Walking or in Boat)
    if (isStage2) {
      this.drawBoatPlayer(ctx, player, cameraY);
    } else if (isTransitioning) {
      this.drawTransitionPlayer(ctx, player, cameraY, transitionProgress);
    } else {
      this.drawWalkingPlayer(ctx, player, cameraY);
    }

    // 8. Draw Chasing Wave (Overlays foreground water)
    this.drawChasingWave(ctx, wave, cameraY, isStage2, roundConfig.biome);

    // 9. Visual Vignette & Round Atmosphere
    this.drawAtmosphere(ctx, roundConfig.biome);

    // Lightning Flash Overlay
    if (this.lightningFlash > 0) {
      ctx.fillStyle = `rgba(255, 255, 255, ${this.lightningFlash * 0.35})`;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    }
  }

  // --- Backgrounds by Biome ---

  private drawStage1Background(
    ctx: CanvasRenderingContext2D,
    cameraY: number,
    biome: BiomeType
  ) {
    const pathLeft = 200;
    const pathRight = 550;
    const bgOffset = Math.floor(cameraY) % 80;

    if (biome === 'canyon') {
      // Canyon Sandstone & Red Cliffs
      ctx.fillStyle = '#9a3412';
      ctx.fillRect(0, 0, pathLeft, CANVAS_HEIGHT);

      ctx.fillStyle = '#7c2d12';
      for (let y = -bgOffset; y < CANVAS_HEIGHT + 80; y += 70) {
        ctx.beginPath();
        ctx.arc(60, y + 20, 35, 0, Math.PI * 2);
        ctx.arc(130, y + 55, 45, 0, Math.PI * 2);
        ctx.fill();
      }

      // Canyon Spires / Cacti
      for (let y = -bgOffset; y < CANVAS_HEIGHT + 100; y += 110) {
        this.drawCanyonRockSpire(ctx, 45, y);
        this.drawCanyonRockSpire(ctx, 110, y + 50);
      }

      // Sandstone Canyon Path
      const pathGrad = ctx.createLinearGradient(pathLeft, 0, pathRight, 0);
      pathGrad.addColorStop(0, '#c2410c');
      pathGrad.addColorStop(0.2, '#fdba74');
      pathGrad.addColorStop(0.8, '#fed7aa');
      pathGrad.addColorStop(1, '#ea580c');
      ctx.fillStyle = pathGrad;
      ctx.fillRect(pathLeft, 0, pathRight - pathLeft, CANVAS_HEIGHT);

      // Pebbles
      ctx.fillStyle = '#7c2d12';
      for (let y = -bgOffset; y < CANVAS_HEIGHT + 80; y += 45) {
        ctx.beginPath();
        ctx.ellipse(pathLeft + 50 + ((y * 7) % 200), y, 4, 2.5, 0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Amber Sunset River Shore
      const riverStart = pathRight;
      const shoreGrad = ctx.createLinearGradient(riverStart, 0, CANVAS_WIDTH, 0);
      shoreGrad.addColorStop(0, '#ea580c');
      shoreGrad.addColorStop(0.2, '#f97316');
      shoreGrad.addColorStop(0.6, '#ea580c');
      shoreGrad.addColorStop(1, '#9a3412');
      ctx.fillStyle = shoreGrad;
      ctx.fillRect(riverStart, 0, CANVAS_WIDTH - riverStart, CANVAS_HEIGHT);
    } else if (biome === 'storm') {
      // Storm Mountain Crags
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, 0, pathLeft, CANVAS_HEIGHT);

      ctx.fillStyle = '#0f172a';
      for (let y = -bgOffset; y < CANVAS_HEIGHT + 80; y += 70) {
        ctx.beginPath();
        ctx.arc(60, y + 20, 35, 0, Math.PI * 2);
        ctx.arc(130, y + 55, 45, 0, Math.PI * 2);
        ctx.fill();
      }

      // Storm Pine Trees
      for (let y = -bgOffset; y < CANVAS_HEIGHT + 100; y += 110) {
        this.drawStormPine(ctx, 45, y);
        this.drawStormPine(ctx, 110, y + 50);
      }

      // Dark Wet Granite Pass
      const pathGrad = ctx.createLinearGradient(pathLeft, 0, pathRight, 0);
      pathGrad.addColorStop(0, '#334155');
      pathGrad.addColorStop(0.2, '#64748b');
      pathGrad.addColorStop(0.8, '#94a3b8');
      pathGrad.addColorStop(1, '#475569');
      ctx.fillStyle = pathGrad;
      ctx.fillRect(pathLeft, 0, pathRight - pathLeft, CANVAS_HEIGHT);

      // Wet Slate details
      ctx.fillStyle = '#0f172a';
      for (let y = -bgOffset; y < CANVAS_HEIGHT + 80; y += 45) {
        ctx.beginPath();
        ctx.ellipse(pathLeft + 50 + ((y * 7) % 200), y, 4, 2.5, 0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Dark Torrent River Shore
      const riverStart = pathRight;
      const shoreGrad = ctx.createLinearGradient(riverStart, 0, CANVAS_WIDTH, 0);
      shoreGrad.addColorStop(0, '#475569');
      shoreGrad.addColorStop(0.2, '#1e293b');
      shoreGrad.addColorStop(0.6, '#0f172a');
      shoreGrad.addColorStop(1, '#020617');
      ctx.fillStyle = shoreGrad;
      ctx.fillRect(riverStart, 0, CANVAS_WIDTH - riverStart, CANVAS_HEIGHT);
    } else {
      // Emerald Forest
      ctx.fillStyle = '#4ade80';
      ctx.fillRect(0, 0, pathLeft, CANVAS_HEIGHT);

      ctx.fillStyle = '#22c55e';
      for (let y = -bgOffset; y < CANVAS_HEIGHT + 80; y += 70) {
        ctx.beginPath();
        ctx.arc(60, y + 20, 35, 0, Math.PI * 2);
        ctx.arc(130, y + 55, 45, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let y = -bgOffset; y < CANVAS_HEIGHT + 100; y += 110) {
        this.drawTree(ctx, 45, y);
        this.drawTree(ctx, 110, y + 50);
      }

      const pathGrad = ctx.createLinearGradient(pathLeft, 0, pathRight, 0);
      pathGrad.addColorStop(0, '#d97706');
      pathGrad.addColorStop(0.2, '#fef08a');
      pathGrad.addColorStop(0.8, '#fde047');
      pathGrad.addColorStop(1, '#ca8a04');
      ctx.fillStyle = pathGrad;
      ctx.fillRect(pathLeft, 0, pathRight - pathLeft, CANVAS_HEIGHT);

      ctx.fillStyle = '#b45309';
      for (let y = -bgOffset; y < CANVAS_HEIGHT + 80; y += 45) {
        ctx.beginPath();
        ctx.ellipse(pathLeft + 50 + ((y * 7) % 200), y, 4, 2.5, 0.4, 0, Math.PI * 2);
        ctx.fill();
      }

      const riverStart = pathRight;
      const shoreGrad = ctx.createLinearGradient(riverStart, 0, CANVAS_WIDTH, 0);
      shoreGrad.addColorStop(0, '#eab308');
      shoreGrad.addColorStop(0.15, '#38bdf8');
      shoreGrad.addColorStop(0.5, '#0284c7');
      shoreGrad.addColorStop(1, '#0369a1');
      ctx.fillStyle = shoreGrad;
      ctx.fillRect(riverStart, 0, CANVAS_WIDTH - riverStart, CANVAS_HEIGHT);
    }

    // Border grass or stone tufts
    this.drawGrassTufts(ctx, pathLeft - 10, cameraY, biome);
    this.drawGrassTufts(ctx, pathRight - 5, cameraY, biome);
  }

  private drawStage2Background(
    ctx: CanvasRenderingContext2D,
    cameraY: number,
    biome: BiomeType
  ) {
    const bankLeft = RIVER_MIN_X;
    const bankRight = RIVER_MAX_X;
    const bgOffset = (cameraY * 1.2 + this.waterTime * 120) % 90;

    if (biome === 'canyon') {
      // Canyon Banks
      ctx.fillStyle = '#9a3412';
      ctx.fillRect(0, 0, bankLeft, CANVAS_HEIGHT);
      ctx.fillRect(bankRight, 0, CANVAS_WIDTH - bankRight, CANVAS_HEIGHT);

      // Red Sand Shore
      ctx.fillStyle = '#f97316';
      ctx.fillRect(bankLeft - 18, 0, 18, CANVAS_HEIGHT);
      ctx.fillRect(bankRight, 0, 18, CANVAS_HEIGHT);

      // Amber Glowing Canyon Rapids
      const waterGrad = ctx.createLinearGradient(bankLeft, 0, bankRight, 0);
      waterGrad.addColorStop(0, '#c2410c');
      waterGrad.addColorStop(0.25, '#ea580c');
      waterGrad.addColorStop(0.5, '#fb923c');
      waterGrad.addColorStop(0.75, '#ea580c');
      waterGrad.addColorStop(1, '#c2410c');
      ctx.fillStyle = waterGrad;
      ctx.fillRect(bankLeft, 0, bankRight - bankLeft, CANVAS_HEIGHT);

      // Warm Flow lines
      ctx.strokeStyle = 'rgba(255, 237, 213, 0.45)';
      ctx.lineWidth = 2.5;
      for (let y = -bgOffset; y < CANVAS_HEIGHT + 100; y += 40) {
        for (let x = bankLeft + 30; x < bankRight - 40; x += 110) {
          const flowShift = Math.sin(this.waterTime * 2 + (x + y) * 0.02) * 16;
          ctx.beginPath();
          ctx.moveTo(x + flowShift, y);
          ctx.bezierCurveTo(x + flowShift + 25, y + 8, x + flowShift + 45, y - 8, x + flowShift + 70, y + 4);
          ctx.stroke();
        }
      }

      // Bank Spires
      const treeOffset = Math.floor(cameraY) % 130;
      for (let y = -treeOffset; y < CANVAS_HEIGHT + 130; y += 120) {
        this.drawCanyonRockSpire(ctx, 40, y);
        this.drawCanyonRockSpire(ctx, 95, y + 45);
        this.drawCanyonRockSpire(ctx, CANVAS_WIDTH - 50, y + 20);
        this.drawCanyonRockSpire(ctx, CANVAS_WIDTH - 105, y + 70);
      }
    } else if (biome === 'storm') {
      // Storm Rocky Banks
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, bankLeft, CANVAS_HEIGHT);
      ctx.fillRect(bankRight, 0, CANVAS_WIDTH - bankRight, CANVAS_HEIGHT);

      // Dark Sand Shore
      ctx.fillStyle = '#475569';
      ctx.fillRect(bankLeft - 18, 0, 18, CANVAS_HEIGHT);
      ctx.fillRect(bankRight, 0, 18, CANVAS_HEIGHT);

      // Dark Midnight Torrent Waters
      const waterGrad = ctx.createLinearGradient(bankLeft, 0, bankRight, 0);
      waterGrad.addColorStop(0, '#0f172a');
      waterGrad.addColorStop(0.25, '#1e293b');
      waterGrad.addColorStop(0.5, '#3b82f6');
      waterGrad.addColorStop(0.75, '#1e293b');
      waterGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = waterGrad;
      ctx.fillRect(bankLeft, 0, bankRight - bankLeft, CANVAS_HEIGHT);

      // Turbulent White-Water Foam
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.lineWidth = 3;
      for (let y = -bgOffset; y < CANVAS_HEIGHT + 100; y += 35) {
        for (let x = bankLeft + 25; x < bankRight - 35; x += 90) {
          const flowShift = Math.sin(this.waterTime * 3 + (x + y) * 0.03) * 20;
          ctx.beginPath();
          ctx.moveTo(x + flowShift, y);
          ctx.bezierCurveTo(x + flowShift + 25, y + 10, x + flowShift + 45, y - 10, x + flowShift + 65, y + 6);
          ctx.stroke();
        }
      }

      // Bank Storm Pines
      const treeOffset = Math.floor(cameraY) % 130;
      for (let y = -treeOffset; y < CANVAS_HEIGHT + 130; y += 120) {
        this.drawStormPine(ctx, 40, y);
        this.drawStormPine(ctx, 95, y + 45);
        this.drawStormPine(ctx, CANVAS_WIDTH - 50, y + 20);
        this.drawStormPine(ctx, CANVAS_WIDTH - 105, y + 70);
      }
    } else {
      // Emerald Forest River
      ctx.fillStyle = '#15803d';
      ctx.fillRect(0, 0, bankLeft, CANVAS_HEIGHT);
      ctx.fillRect(bankRight, 0, CANVAS_WIDTH - bankRight, CANVAS_HEIGHT);

      ctx.fillStyle = '#eab308';
      ctx.fillRect(bankLeft - 18, 0, 18, CANVAS_HEIGHT);
      ctx.fillRect(bankRight, 0, 18, CANVAS_HEIGHT);

      const waterGrad = ctx.createLinearGradient(bankLeft, 0, bankRight, 0);
      waterGrad.addColorStop(0, '#0284c7');
      waterGrad.addColorStop(0.25, '#06b6d4');
      waterGrad.addColorStop(0.5, '#38bdf8');
      waterGrad.addColorStop(0.75, '#06b6d4');
      waterGrad.addColorStop(1, '#0284c7');
      ctx.fillStyle = waterGrad;
      ctx.fillRect(bankLeft, 0, bankRight - bankLeft, CANVAS_HEIGHT);

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 2.5;
      for (let y = -bgOffset; y < CANVAS_HEIGHT + 100; y += 40) {
        for (let x = bankLeft + 30; x < bankRight - 40; x += 110) {
          const flowShift = Math.sin(this.waterTime * 2 + (x + y) * 0.02) * 16;
          ctx.beginPath();
          ctx.moveTo(x + flowShift, y);
          ctx.bezierCurveTo(x + flowShift + 25, y + 8, x + flowShift + 45, y - 8, x + flowShift + 70, y + 4);
          ctx.stroke();
        }
      }

      const treeOffset = Math.floor(cameraY) % 130;
      for (let y = -treeOffset; y < CANVAS_HEIGHT + 130; y += 120) {
        this.drawTree(ctx, 40, y);
        this.drawTree(ctx, 95, y + 45);
        this.drawTree(ctx, CANVAS_WIDTH - 50, y + 20);
        this.drawTree(ctx, CANVAS_WIDTH - 105, y + 70);
      }
    }

    // Edge foam on shores
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    for (let y = -bgOffset; y < CANVAS_HEIGHT + 50; y += 22) {
      const foamSizeL = 4 + Math.sin(this.waterTime * 3 + y * 0.1) * 3;
      const foamSizeR = 4 + Math.cos(this.waterTime * 3 + y * 0.1) * 3;
      ctx.beginPath();
      ctx.arc(bankLeft + foamSizeL, y, foamSizeL, 0, Math.PI * 2);
      ctx.arc(bankRight - foamSizeR, y, foamSizeR, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawTransitionBackground(
    ctx: CanvasRenderingContext2D,
    cameraY: number,
    progress: number,
    biome: BiomeType
  ) {
    this.drawStage2Background(ctx, cameraY, biome);
  }

  private drawTree(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x - 5, y + 10, 10, 20);

    ctx.fillStyle = '#166534';
    ctx.beginPath();
    ctx.arc(x, y + 5, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(x - 6, y - 2, 18, 0, Math.PI * 2);
    ctx.arc(x + 6, y - 2, 18, 0, Math.PI * 2);
    ctx.arc(x, y - 10, 16, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#86efac';
    ctx.beginPath();
    ctx.arc(x - 4, y - 8, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawCanyonRockSpire(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    ctx.fillStyle = '#7c2d12';
    ctx.beginPath();
    ctx.moveTo(x - 14, y + 25);
    ctx.lineTo(x - 8, y - 20);
    ctx.lineTo(x + 4, y - 30);
    ctx.lineTo(x + 16, y + 25);
    ctx.closePath();
    ctx.fill();

    // Sandstone strata bands
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x - 10, y + 5);
    ctx.lineTo(x + 12, y + 5);
    ctx.moveTo(x - 7, y - 10);
    ctx.lineTo(x + 8, y - 10);
    ctx.stroke();

    // Highlight
    ctx.fillStyle = '#fdba74';
    ctx.beginPath();
    ctx.arc(x + 2, y - 25, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private drawStormPine(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    // Dark trunk
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x - 4, y + 10, 8, 18);

    // Pine triangular layers
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(x, y - 25);
    ctx.lineTo(x - 16, y);
    ctx.lineTo(x + 16, y);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#1e3a5f';
    ctx.beginPath();
    ctx.moveTo(x, y - 12);
    ctx.lineTo(x - 20, y + 12);
    ctx.lineTo(x + 20, y + 12);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  private drawGrassTufts(
    ctx: CanvasRenderingContext2D,
    x: number,
    cameraY: number,
    biome: BiomeType
  ) {
    ctx.save();
    ctx.strokeStyle =
      biome === 'canyon' ? '#c2410c' : biome === 'storm' ? '#475569' : '#15803d';
    ctx.lineWidth = 2;
    const offset = Math.floor(cameraY) % 50;
    for (let y = -offset; y < CANVAS_HEIGHT + 50; y += 35) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - 6, y - 12);
      ctx.moveTo(x, y);
      ctx.lineTo(x, y - 16);
      ctx.moveTo(x, y);
      ctx.lineTo(x + 6, y - 12);
      ctx.stroke();
    }
    ctx.restore();
  }

  // --- Rain Effect for Storm Biome ---

  private drawRain(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.strokeStyle = 'rgba(191, 219, 254, 0.45)';
    ctx.lineWidth = 1.5;

    const rainSeed = Math.floor(this.rainTime * 20);
    for (let i = 0; i < 45; i++) {
      const rx = ((i * 37 + rainSeed * 17) % CANVAS_WIDTH);
      const ry = ((i * 47 + rainSeed * 29) % CANVAS_HEIGHT);
      ctx.beginPath();
      ctx.moveTo(rx, ry);
      ctx.lineTo(rx - 4, ry + 18);
      ctx.stroke();
    }
    ctx.restore();
  }

  // --- Docked Boat & Finish Line ---

  private drawDockedBoat(ctx: CanvasRenderingContext2D, cameraY: number, stage1Length: number) {
    const dockWorldY = stage1Length - 40;
    const dockScreenY = dockWorldY - cameraY;

    if (dockScreenY < -150 || dockScreenY > CANVAS_HEIGHT + 150) return;

    ctx.save();
    const dockX = 320;
    const dockWidth = 160;
    const dockHeight = 70;

    // Pier Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(dockX - 5, dockScreenY + 10, dockWidth + 10, dockHeight);

    // Pier Planks
    ctx.fillStyle = '#92400e';
    ctx.fillRect(dockX, dockScreenY, dockWidth, dockHeight);

    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 2;
    for (let i = 0; i <= dockHeight; i += 12) {
      ctx.beginPath();
      ctx.moveTo(dockX, dockScreenY + i);
      ctx.lineTo(dockX + dockWidth, dockScreenY + i);
      ctx.stroke();
    }

    // Wooden Posts
    ctx.fillStyle = '#78350f';
    ctx.fillRect(dockX + 5, dockScreenY - 12, 14, 24);
    ctx.fillRect(dockX + dockWidth - 19, dockScreenY - 12, 14, 24);

    // Golden "BOARD BOAT" arrow sign
    const bounce = Math.sin(this.waterTime * 5) * 6;
    ctx.fillStyle = '#fbbf24';
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(dockX + 25, dockScreenY - 45 + bounce, 110, 26, 6);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#78350f';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ GET IN BOAT! ⛵', dockX + 80, dockScreenY - 28 + bounce);

    // The Small Wooden Boat docked
    const boatX = dockX + 80;
    const boatY = dockScreenY + dockHeight + 40;

    // Mooring Rope
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(dockX + 20, dockScreenY + dockHeight);
    ctx.quadraticCurveTo(boatX - 15, boatY - 10, boatX - 8, boatY);
    ctx.stroke();

    // Boat Visual
    this.drawBoatSprite(ctx, boatX, boatY, 0, false, false);
    ctx.restore();
  }

  private drawFinishLine(
    ctx: CanvasRenderingContext2D,
    cameraY: number,
    totalLength: number,
    roundNumber: number
  ) {
    const finishWorldY = totalLength;
    const finishScreenY = finishWorldY - cameraY;

    if (finishScreenY < -150 || finishScreenY > CANVAS_HEIGHT + 200) return;

    ctx.save();
    const bridgeLeft = RIVER_MIN_X - 10;
    const bridgeRight = RIVER_MAX_X + 10;
    const bridgeWidth = bridgeRight - bridgeLeft;

    // Water finish line glow
    const lineGrad = ctx.createLinearGradient(0, finishScreenY - 20, 0, finishScreenY + 20);
    lineGrad.addColorStop(0, 'rgba(250, 204, 21, 0)');
    lineGrad.addColorStop(0.5, 'rgba(250, 204, 21, 0.8)');
    lineGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
    ctx.fillStyle = lineGrad;
    ctx.fillRect(bridgeLeft, finishScreenY - 15, bridgeWidth, 30);

    // Floating Checkered Buoy Ribbon across water
    const squareSize = 16;
    let isBlack = false;
    for (let x = bridgeLeft; x < bridgeRight; x += squareSize) {
      ctx.fillStyle = isBlack ? '#1e293b' : '#ffffff';
      ctx.fillRect(x, finishScreenY - 6, squareSize, 12);
      isBlack = !isBlack;
    }

    // Grand Finish Wooden Arch overhead
    ctx.fillStyle = '#78350f';
    ctx.fillRect(bridgeLeft - 20, finishScreenY - 80, 24, 90);
    ctx.fillRect(bridgeRight - 4, finishScreenY - 80, 24, 90);

    ctx.fillStyle = '#92400e';
    ctx.fillRect(bridgeLeft - 30, finishScreenY - 80, bridgeWidth + 60, 26);
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 3;
    ctx.strokeRect(bridgeLeft - 30, finishScreenY - 80, bridgeWidth + 60, 26);

    // Colorful Pennant Flags
    const flagColors = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
    let colorIdx = 0;
    for (let x = bridgeLeft; x < bridgeRight; x += 30) {
      ctx.fillStyle = flagColors[colorIdx % flagColors.length];
      colorIdx++;
      ctx.beginPath();
      ctx.moveTo(x, finishScreenY - 54);
      ctx.lineTo(x + 24, finishScreenY - 54);
      ctx.lineTo(x + 12, finishScreenY - 32 + Math.sin(this.waterTime * 4 + x) * 4);
      ctx.closePath();
      ctx.fill();
    }

    // Grand Bold Signboard with Round completion text
    const signX = (bridgeLeft + bridgeRight) / 2;
    const signY = finishScreenY - 110;

    ctx.fillStyle = '#fef08a';
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.roundRect(signX - 120, signY, 240, 42, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#78350f';
    ctx.font = '900 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`🏁 ROUND ${roundNumber} FINISH 🏁`, signX, signY + 22);

    this.drawCheckeredFlag(ctx, bridgeLeft - 10, finishScreenY - 80);
    this.drawCheckeredFlag(ctx, bridgeRight + 10, finishScreenY - 80);

    ctx.restore();
  }

  private drawCheckeredFlag(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.save();
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - 45);
    ctx.stroke();

    const waveSin = Math.sin(this.waterTime * 6) * 4;
    const fx = x;
    const fy = y - 45;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(fx, fy + waveSin, 32, 22);
    ctx.fillStyle = '#000000';
    ctx.fillRect(fx, fy + waveSin, 16, 11);
    ctx.fillRect(fx + 16, fy + 11 + waveSin, 16, 11);
    ctx.restore();
  }

  // --- Obstacle Rendering ---

  private drawObstacles(ctx: CanvasRenderingContext2D, obstacles: Obstacle[], cameraY: number) {
    for (const ob of obstacles) {
      if (!ob.active) continue;
      const screenY = ob.y - cameraY;
      if (screenY < -100 || screenY > CANVAS_HEIGHT + 100) continue;

      ctx.save();
      ctx.translate(ob.x, screenY);
      if (ob.rotation) {
        ctx.rotate(ob.rotation);
      }

      switch (ob.type) {
        case 'rock':
          this.drawLandRock(ctx, ob.width, ob.height);
          break;
        case 'tree_root':
          this.drawTreeRoot(ctx, ob.width, ob.height);
          break;
        case 'spike_bush':
          this.drawSpikeBush(ctx, ob.width, ob.height);
          break;
        case 'mud_puddle':
          this.drawMudPuddle(ctx, ob.width, ob.height);
          break;
        case 'river_rock':
          this.drawRiverRock(ctx, ob.width, ob.height);
          break;
        case 'floating_log':
          this.drawFloatingLog(ctx, ob.width, ob.height);
          break;
        case 'whirlpool':
          this.drawWhirlpool(ctx, ob.whirlpoolRadius || 45);
          break;
        case 'rapids_current':
          this.drawRapids(ctx, ob.width, ob.height);
          break;
        case 'water_lily_boost':
          this.drawWaterLily(ctx, ob.width);
          break;
        case 'river_buoy':
          this.drawRiverBuoy(ctx, ob.width, ob.height);
          break;
      }
      ctx.restore();
    }
  }

  private drawLandRock(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.beginPath();
    ctx.ellipse(2, h * 0.3, w * 0.55, h * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.moveTo(-w * 0.45, h * 0.2);
    ctx.lineTo(-w * 0.3, -h * 0.45);
    ctx.lineTo(w * 0.1, -h * 0.5);
    ctx.lineTo(w * 0.45, -h * 0.1);
    ctx.lineTo(w * 0.4, h * 0.35);
    ctx.lineTo(-w * 0.2, h * 0.45);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#84cc16';
    ctx.beginPath();
    ctx.arc(-w * 0.1, -h * 0.3, w * 0.25, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.arc(w * 0.15, -h * 0.25, w * 0.15, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawTreeRoot(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.fillStyle = '#78350f';
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 2.5;

    ctx.beginPath();
    ctx.moveTo(-w * 0.5, h * 0.2);
    ctx.bezierCurveTo(-w * 0.2, -h * 0.6, w * 0.2, -h * 0.4, w * 0.5, h * 0.3);
    ctx.bezierCurveTo(w * 0.2, -h * 0.1, -w * 0.1, -h * 0.15, -w * 0.5, h * 0.2);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-w * 0.3, -h * 0.2);
    ctx.lineTo(-w * 0.1, -h * 0.3);
    ctx.moveTo(0, -h * 0.2);
    ctx.lineTo(w * 0.2, -h * 0.15);
    ctx.stroke();
  }

  private drawSpikeBush(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.fillStyle = '#15803d';
    ctx.strokeStyle = '#b91c1c';
    ctx.lineWidth = 2;

    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const r = i % 2 === 0 ? w * 0.5 : w * 0.25;
      const px = Math.cos(angle) * r;
      const py = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(-w * 0.15, -h * 0.15, 3.5, 0, Math.PI * 2);
    ctx.arc(w * 0.2, -h * 0.1, 3.5, 0, Math.PI * 2);
    ctx.arc(0, h * 0.2, 3.5, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawMudPuddle(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.fillStyle = 'rgba(120, 53, 15, 0.75)';
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.5, h * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(90, 38, 9, 0.9)';
    ctx.beginPath();
    ctx.ellipse(w * 0.1, -h * 0.1, w * 0.3, h * 0.25, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawRiverRock(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, h * 0.2, w * 0.7, h * 0.5, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(-w * 0.45, h * 0.1);
    ctx.lineTo(-w * 0.25, -h * 0.45);
    ctx.lineTo(w * 0.2, -h * 0.4);
    ctx.lineTo(w * 0.45, 0);
    ctx.lineTo(w * 0.3, h * 0.35);
    ctx.lineTo(-w * 0.3, h * 0.35);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-w * 0.25, h * 0.25, 5, 0, Math.PI * 2);
    ctx.arc(0, h * 0.3, 6, 0, Math.PI * 2);
    ctx.arc(w * 0.25, h * 0.25, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawFloatingLog(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(0, 0, w * 0.6, h * 0.7, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.roundRect(-w * 0.5, -h * 0.5, w, h, 8);
    ctx.fill();

    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-w * 0.25, -h * 0.4);
    ctx.lineTo(-w * 0.25, h * 0.4);
    ctx.moveTo(w * 0.15, -h * 0.4);
    ctx.lineTo(w * 0.15, h * 0.4);
    ctx.stroke();

    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.ellipse(-w * 0.46, 0, 4, h * 0.4, 0, 0, Math.PI * 2);
    ctx.ellipse(w * 0.46, 0, 4, h * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawWhirlpool(ctx: CanvasRenderingContext2D, radius: number) {
    const time = this.waterTime * 4;

    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(0, 0, radius * 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.lineWidth = 3;
    for (let i = 0; i < 4; i++) {
      const startAngle = time + (i * Math.PI) / 2;
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(255, 255, 255, 0.9)' : 'rgba(56, 189, 248, 0.8)';

      ctx.beginPath();
      for (let r = radius * 0.3; r < radius; r += 4) {
        const theta = startAngle + (r / radius) * Math.PI * 2;
        const x = Math.cos(theta) * r;
        const y = Math.sin(theta) * r;
        if (r === radius * 0.3) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }

  private drawRapids(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.fillRect(-w * 0.5, -h * 0.5, w, h);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    const shift = (this.waterTime * 80) % 24;

    for (let y = -h * 0.4 + shift; y < h * 0.4; y += 24) {
      ctx.beginPath();
      ctx.moveTo(-w * 0.3, y - 8);
      ctx.lineTo(0, y + 6);
      ctx.lineTo(w * 0.3, y - 8);
      ctx.stroke();
    }
  }

  private drawWaterLily(ctx: CanvasRenderingContext2D, size: number) {
    const pulse = 1 + Math.sin(this.waterTime * 6) * 0.08;
    const s = size * pulse;

    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.5, 0.4, Math.PI * 2 - 0.4);
    ctx.lineTo(0, 0);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#f472b6';
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2 + this.waterTime;
      ctx.beginPath();
      ctx.ellipse(
        Math.cos(angle) * s * 0.2,
        Math.sin(angle) * s * 0.2,
        s * 0.16,
        s * 0.09,
        angle,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }

    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.1, 0, Math.PI * 2);
    ctx.fill();
  }

  private drawRiverBuoy(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const bob = Math.sin(this.waterTime * 4) * 3;
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(0, bob, w * 0.45, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-w * 0.4, bob - 3, w * 0.8, 6);

    ctx.fillStyle = '#fecaca';
    ctx.beginPath();
    ctx.arc(-w * 0.15, bob - w * 0.15, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- Character & Boat Sprites ---

  private drawWalkingPlayer(
    ctx: CanvasRenderingContext2D,
    player: PlayerState,
    cameraY: number
  ) {
    const screenY = player.y - cameraY - player.jumpZ;
    const shadowScale = Math.max(0.4, 1 - player.jumpZ / 120);

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(
      player.x,
      player.y - cameraY + 18,
      14 * shadowScale,
      6 * shadowScale,
      0,
      0,
      Math.PI * 2
    );
    ctx.fill();

    if (player.invulnerableTime > 0 && Math.floor(player.invulnerableTime * 15) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    ctx.translate(player.x, screenY);

    const legSwing = Math.sin(player.walkFrame * 8) * 8;

    // Legs
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-8, 8 + (player.isJumping ? -4 : legSwing), 6, 12);
    ctx.fillRect(2, 8 + (player.isJumping ? -4 : -legSwing), 6, 12);

    // Shoes
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-10, 18 + (player.isJumping ? -4 : legSwing), 8, 4);
    ctx.fillRect(2, 18 + (player.isJumping ? -4 : -legSwing), 8, 4);

    // Torso / Vest
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-11, -8, 22, 18);

    ctx.fillStyle = '#ea580c';
    ctx.fillRect(-11, -8, 6, 18);
    ctx.fillRect(5, -8, 6, 18);

    // Arms
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(-14, -6 - legSwing * 0.5, 4, 12);
    ctx.fillRect(10, -6 + legSwing * 0.5, 4, 12);

    // Walking Stick
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(12, -4);
    ctx.lineTo(14, 20);
    ctx.stroke();

    // Head
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(0, -14, 9, 0, Math.PI * 2);
    ctx.fill();

    // Eyes
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-3, -15, 1.8, 0, Math.PI * 2);
    ctx.arc(3, -15, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Beard
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -11, 7, 0, Math.PI);
    ctx.arc(-2, -9, 4, 0, Math.PI * 2);
    ctx.arc(2, -9, 4, 0, Math.PI * 2);
    ctx.fill();

    // Straw Hat
    ctx.fillStyle = '#ca8a04';
    ctx.beginPath();
    ctx.ellipse(0, -20, 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#eab308';
    ctx.beginPath();
    ctx.arc(0, -22, 10, Math.PI, 0);
    ctx.fill();

    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-9, -23, 18, 3);

    ctx.restore();
  }

  private drawBoatSprite(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    rotation: number,
    isBoosting: boolean,
    hasPlayer: boolean,
    rowFrame = 0
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    const boatW = 46;
    const boatH = 78;

    // Boat Hull Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(2, 6, boatW * 0.55, boatH * 0.52, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wooden Boat Hull
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.moveTo(0, -boatH * 0.55);
    ctx.bezierCurveTo(boatW * 0.65, -boatH * 0.25, boatW * 0.55, boatH * 0.35, boatW * 0.35, boatH * 0.5);
    ctx.lineTo(-boatW * 0.35, boatH * 0.5);
    ctx.bezierCurveTo(-boatW * 0.55, boatH * 0.35, -boatW * 0.65, -boatH * 0.25, 0, -boatH * 0.55);
    ctx.closePath();
    ctx.fill();

    // Inner Hull
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.moveTo(0, -boatH * 0.45);
    ctx.bezierCurveTo(boatW * 0.45, -boatH * 0.2, boatW * 0.4, boatH * 0.25, boatW * 0.25, boatH * 0.4);
    ctx.lineTo(-boatW * 0.25, boatH * 0.4);
    ctx.bezierCurveTo(-boatW * 0.4, boatH * 0.25, -boatW * 0.45, -boatH * 0.2, 0, -boatH * 0.45);
    ctx.closePath();
    ctx.fill();

    // Wooden Cross-Beams
    ctx.fillStyle = '#d97706';
    ctx.fillRect(-boatW * 0.32, -boatH * 0.15, boatW * 0.64, 8);
    ctx.fillRect(-boatW * 0.25, boatH * 0.15, boatW * 0.5, 8);

    // Glowing Lantern on Bow
    ctx.fillStyle = '#fbbf24';
    ctx.beginPath();
    ctx.arc(0, -boatH * 0.46, 5, 0, Math.PI * 2);
    ctx.fill();

    const lanternGrad = ctx.createRadialGradient(0, -boatH * 0.46, 2, 0, -boatH * 0.46, 25);
    lanternGrad.addColorStop(0, 'rgba(251, 191, 36, 0.8)');
    lanternGrad.addColorStop(1, 'rgba(251, 191, 36, 0)');
    ctx.fillStyle = lanternGrad;
    ctx.beginPath();
    ctx.arc(0, -boatH * 0.46, 25, 0, Math.PI * 2);
    ctx.fill();

    if (hasPlayer) {
      const oarAngle = Math.sin(rowFrame * 10) * 0.35;

      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-10, -5);
      ctx.lineTo(-boatW * 0.75 - Math.sin(oarAngle) * 12, -Math.cos(oarAngle) * 20);
      ctx.stroke();

      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.ellipse(-boatW * 0.75 - Math.sin(oarAngle) * 12, -Math.cos(oarAngle) * 20, 5, 10, -oarAngle, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(10, -5);
      ctx.lineTo(boatW * 0.75 + Math.sin(oarAngle) * 12, -Math.cos(oarAngle) * 20);
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(boatW * 0.75 + Math.sin(oarAngle) * 12, -Math.cos(oarAngle) * 20, 5, 10, oarAngle, 0, Math.PI * 2);
      ctx.fill();

      // Old Man Seated
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(-10, -10, 20, 16);
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(-10, -10, 5, 16);
      ctx.fillRect(5, -10, 5, 16);

      ctx.fillStyle = '#fed7aa';
      ctx.fillRect(-14, -8, 6, 6);
      ctx.fillRect(8, -8, 6, 6);

      ctx.beginPath();
      ctx.arc(0, -12, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, -9, 6, 0, Math.PI);
      ctx.fill();

      ctx.fillStyle = '#ca8a04';
      ctx.beginPath();
      ctx.ellipse(0, -16, 18, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#eab308';
      ctx.beginPath();
      ctx.arc(0, -18, 9, Math.PI, 0);
      ctx.fill();

      ctx.fillStyle = '#dc2626';
      ctx.fillRect(-8, -19, 16, 2.5);
    }

    if (isBoosting) {
      ctx.fillStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.beginPath();
      ctx.moveTo(-boatW * 0.3, boatH * 0.45);
      ctx.lineTo(0, boatH * 0.85);
      ctx.lineTo(boatW * 0.3, boatH * 0.45);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }

  private drawBoatPlayer(
    ctx: CanvasRenderingContext2D,
    player: PlayerState,
    cameraY: number
  ) {
    const screenY = player.y - cameraY - player.jumpZ;

    ctx.save();
    if (player.invulnerableTime > 0 && Math.floor(player.invulnerableTime * 15) % 2 === 0) {
      ctx.globalAlpha = 0.5;
    }

    const tilt = (player.vx / 300) * 0.22;
    this.drawBoatSprite(
      ctx,
      player.x,
      screenY,
      tilt,
      player.isBoosting,
      true,
      player.rowFrame
    );
    ctx.restore();
  }

  private drawTransitionPlayer(
    ctx: CanvasRenderingContext2D,
    player: PlayerState,
    cameraY: number,
    progress: number
  ) {
    if (progress < 0.5) {
      const jumpArc = Math.sin(progress * Math.PI * 2) * 35;
      const modifiedPlayer = { ...player, jumpZ: jumpArc };
      this.drawWalkingPlayer(ctx, modifiedPlayer, cameraY);
    } else {
      this.drawBoatPlayer(ctx, player, cameraY);
    }
  }

  // --- Chasing Wave Rendering ---

  private drawChasingWave(
    ctx: CanvasRenderingContext2D,
    wave: WaveState,
    cameraY: number,
    isStage2: boolean,
    biome: BiomeType
  ) {
    const waveScreenY = wave.y - cameraY;

    ctx.save();
    const waveHeight = wave.height + 40;
    const waveGrad = ctx.createLinearGradient(0, waveScreenY - waveHeight, 0, waveScreenY + 20);

    if (biome === 'canyon') {
      waveGrad.addColorStop(0, 'rgba(154, 52, 18, 0.95)');
      waveGrad.addColorStop(0.3, 'rgba(234, 88, 12, 0.95)');
      waveGrad.addColorStop(0.7, 'rgba(251, 146, 60, 0.95)');
      waveGrad.addColorStop(0.95, '#ffedd5');
      waveGrad.addColorStop(1, '#ffffff');
    } else if (biome === 'storm') {
      waveGrad.addColorStop(0, 'rgba(15, 23, 42, 0.98)');
      waveGrad.addColorStop(0.3, 'rgba(30, 58, 95, 0.95)');
      waveGrad.addColorStop(0.7, 'rgba(59, 130, 246, 0.95)');
      waveGrad.addColorStop(0.95, '#e0e7ff');
      waveGrad.addColorStop(1, '#ffffff');
    } else {
      waveGrad.addColorStop(0, 'rgba(3, 105, 161, 0.95)');
      waveGrad.addColorStop(0.3, 'rgba(14, 165, 233, 0.95)');
      waveGrad.addColorStop(0.7, 'rgba(56, 189, 248, 0.95)');
      waveGrad.addColorStop(0.95, '#e0f2fe');
      waveGrad.addColorStop(1, '#ffffff');
    }

    ctx.fillStyle = waveGrad;
    ctx.beginPath();
    ctx.moveTo(0, waveScreenY + 20);

    const segmentWidth = 20;
    for (let x = 0; x <= CANVAS_WIDTH; x += segmentWidth) {
      const waveSine =
        Math.sin(this.waterTime * 5 + x * 0.04) * 14 +
        Math.cos(this.waterTime * 8 + x * 0.08) * 8;
      const y = waveScreenY - waveHeight + waveSine;
      ctx.lineTo(x, y);
    }

    ctx.lineTo(CANVAS_WIDTH, -200);
    ctx.lineTo(0, -200);
    ctx.closePath();
    ctx.fill();

    // White Foam Crests
    ctx.fillStyle = '#ffffff';
    for (let x = 0; x <= CANVAS_WIDTH; x += 18) {
      const crestY =
        waveScreenY -
        waveHeight +
        Math.sin(this.waterTime * 5 + x * 0.04) * 14 +
        Math.cos(this.waterTime * 8 + x * 0.08) * 8;

      ctx.beginPath();
      ctx.arc(x, crestY + 6, 10 + Math.sin(x + this.waterTime * 3) * 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Bubbles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    for (let x = 15; x < CANVAS_WIDTH; x += 45) {
      const sprayY = waveScreenY - waveHeight - 12 + Math.sin(this.waterTime * 6 + x) * 16;
      ctx.beginPath();
      ctx.arc(x, sprayY, 5 + Math.sin(x) * 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Danger Warning Glow
    const dangerGlow = ctx.createLinearGradient(0, waveScreenY, 0, waveScreenY + 40);
    dangerGlow.addColorStop(0, 'rgba(239, 68, 68, 0.35)');
    dangerGlow.addColorStop(1, 'rgba(239, 68, 68, 0)');
    ctx.fillStyle = dangerGlow;
    ctx.fillRect(0, waveScreenY - 10, CANVAS_WIDTH, 50);

    ctx.restore();
  }

  // --- Atmospheric Lighting ---

  private drawAtmosphere(ctx: CanvasRenderingContext2D, biome: BiomeType) {
    ctx.save();
    const vignette = ctx.createRadialGradient(
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      CANVAS_WIDTH * 0.35,
      CANVAS_WIDTH / 2,
      CANVAS_HEIGHT / 2,
      CANVAS_WIDTH * 0.65
    );

    if (biome === 'canyon') {
      vignette.addColorStop(0, 'rgba(251, 146, 60, 0.05)');
      vignette.addColorStop(1, 'rgba(124, 45, 18, 0.32)');
    } else if (biome === 'storm') {
      vignette.addColorStop(0, 'rgba(15, 23, 42, 0.15)');
      vignette.addColorStop(1, 'rgba(2, 6, 23, 0.45)');
    } else {
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignette.addColorStop(1, 'rgba(15, 23, 42, 0.25)');
    }

    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.restore();
  }
}
