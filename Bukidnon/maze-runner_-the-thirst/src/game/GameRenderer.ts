import { GameEngine } from './GameEngine';
import { Tile, Trap, PowerUp, SpookyEyes, Chaser, Obstacle } from '../types';

export class GameRenderer {
  public render(ctx: CanvasRenderingContext2D, width: number, height: number, engine: GameEngine) {
    const { player, camera, maze } = engine;
    if (!player || !maze) return;

    ctx.save();
    // Clear canvas with pleasant deep indigo
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(0, 0, width, height);

    // Apply Camera Translation and Screen Shake
    ctx.translate(width / 2 - camera.x + camera.shakeX, height / 2 - camera.y + camera.shakeY);

    const tileSize = maze.tileSize;

    // 1. Draw Floor and Cardboard Tiles
    this.renderMazeTiles(ctx, maze.tiles, tileSize, camera.x, camera.y, width, height);

    // 2. Draw Traps
    this.renderTraps(ctx, maze.traps, engine.gameTime);

    // 3. Draw Water Wells
    this.renderWells(ctx, maze.wells, engine.gameTime);

    // 4. Draw Crops (Thirsty / Blooming)
    this.renderCrops(ctx, maze.crops, engine.gameTime);

    // 5. Draw Obstacles (Rolling Barrels, Spinning Saws, Electric Laser Gates)
    if (maze.obstacles) {
      this.renderObstacles(ctx, maze.obstacles, engine.gameTime);
    }

    // 6. Draw Power-Up Mystery Boxes
    this.renderPowerUps(ctx, maze.powerups, engine.gameTime);

    // 7. Draw Exit Portal
    this.renderExit(ctx, maze.exitX, maze.exitY, engine.cropsWateredCount >= engine.totalCropsNeeded, engine.gameTime);

    // 8. Draw Chasers & Catchers (Greedy Guzzlers, Speedy Sprinters, Golden Bandits)
    this.renderChasers(ctx, maze.chasers, engine.gameTime);

    // 9. Draw Spooky Eyes
    this.renderSpookyEyes(ctx, maze.spookyEyes, engine.gameTime);

    // 10. Draw Player Character & Sloshing Bucket
    this.renderPlayer(ctx, player, engine.gameTime);

    // 9. Draw Particle Systems (Water splashes, dust, bloom sparks)
    engine.particles.render(ctx);

    // 10. Dynamic Raycast Lighting & Flashlight Shadows
    engine.lighting.renderLighting(
      ctx,
      width,
      height,
      camera.x,
      camera.y,
      player.x,
      player.y,
      player.aimAngle,
      player.powerups.nightVisionTimer > 0,
      engine.currentLevelConfig.ambientLight,
      maze.tiles,
      tileSize,
      maze.overheadLights,
      maze.spookyEyes,
      engine.gameTime
    );

    // 11. Draw Floating Text Popups
    this.renderFloatingTexts(ctx, engine.floatingTexts);

    ctx.restore();

    // 12. Fullscreen Screen Space Overlays (Damage vignette, victory glow)
    this.renderScreenOverlays(ctx, width, height, engine);
  }

  private renderMazeTiles(
    ctx: CanvasRenderingContext2D,
    tiles: Tile[][],
    tileSize: number,
    camX: number,
    camY: number,
    viewW: number,
    viewH: number
  ) {
    const minC = Math.max(0, Math.floor((camX - viewW / 2 - tileSize) / tileSize));
    const maxC = Math.min(tiles[0].length - 1, Math.ceil((camX + viewW / 2 + tileSize) / tileSize));
    const minR = Math.max(0, Math.floor((camY - viewH / 2 - tileSize) / tileSize));
    const maxR = Math.min(tiles.length - 1, Math.ceil((camY + viewH / 2 + tileSize) / tileSize));

    for (let r = minR; r <= maxR; r++) {
      for (let c = minC; c <= maxC; c++) {
        const tile = tiles[r][c];
        const x = c * tileSize;
        const y = r * tileSize;

        if (tile.type === 'WALL') {
          // Cardboard Wall with 3D Depth & Corrugated Carton Fluting
          ctx.fillStyle = '#92400e'; // Wall drop shadow / depth
          ctx.fillRect(x, y + 6, tileSize, tileSize - 6);

          // Cardboard surface
          const wallColors = ['#d97706', '#ea580c', '#b45309', '#ca8a04'];
          ctx.fillStyle = wallColors[tile.wallVariant % wallColors.length];
          ctx.fillRect(x + 1, y + 1, tileSize - 2, tileSize - 8);

          // Corrugated cardboard stripes
          ctx.strokeStyle = 'rgba(120, 53, 15, 0.35)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          for (let ly = y + 8; ly < y + tileSize - 8; ly += 7) {
            ctx.moveTo(x + 4, ly);
            ctx.lineTo(x + tileSize - 4, ly);
          }
          ctx.stroke();

          // Cardboard tape or stamp details
          if ((r + c) % 5 === 0) {
            // Bright packaging tape
            ctx.fillStyle = 'rgba(250, 204, 21, 0.65)';
            ctx.fillRect(x + tileSize * 0.2, y + 4, tileSize * 0.6, 6);
          } else if ((r * 3 + c) % 7 === 0) {
            // Fragile / Arrow stamp
            ctx.fillStyle = 'rgba(220, 38, 38, 0.7)';
            ctx.font = 'bold 9px monospace';
            ctx.fillText('⬆ FRAGILE', x + 6, y + 20);
          }

          // Wall bevel highlight
          ctx.strokeStyle = 'rgba(254, 240, 138, 0.6)';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x + 1, y + 1, tileSize - 2, tileSize - 8);
        } else {
          // Floor tile (Lighter textured ground with clear grid)
          ctx.fillStyle = (r + c) % 2 === 0 ? '#312e81' : '#28246c';
          ctx.fillRect(x, y, tileSize, tileSize);

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, tileSize, tileSize);

          // Floor details (water droplet stains)
          if ((r * 7 + c * 11) % 9 === 0) {
            ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
            ctx.beginPath();
            ctx.arc(x + tileSize * 0.4, y + tileSize * 0.6, 4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }
  }

  private renderTraps(ctx: CanvasRenderingContext2D, traps: Trap[], time: number) {
    traps.forEach(trap => {
      ctx.save();
      ctx.translate(trap.x, trap.y);

      if (trap.type === 'SPIKES') {
        // Metallic spike trap
        ctx.fillStyle = '#334155';
        ctx.fillRect(-18, -18, 36, 36);

        if (trap.active) {
          // Sharp extended spikes
          ctx.fillStyle = '#e2e8f0';
          for (let i = -12; i <= 12; i += 12) {
            for (let j = -12; j <= 12; j += 12) {
              ctx.beginPath();
              ctx.moveTo(i - 4, j + 5);
              ctx.lineTo(i, j - 10);
              ctx.lineTo(i + 4, j + 5);
              ctx.closePath();
              ctx.fill();
              // Spike tip glint
              ctx.fillStyle = '#ef4444';
              ctx.fillRect(i - 1, j - 9, 2, 3);
              ctx.fillStyle = '#e2e8f0';
            }
          }
        } else {
          // Retracted holes
          ctx.fillStyle = '#0f172a';
          for (let i = -12; i <= 12; i += 12) {
            for (let j = -12; j <= 12; j += 12) {
              ctx.beginPath();
              ctx.arc(i, j, 4, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      } else if (trap.type === 'STEAM_VENT') {
        // Round steel grate
        ctx.fillStyle = '#1e293b';
        ctx.beginPath();
        ctx.arc(0, 0, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = trap.active ? '#f97316' : '#64748b';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Grate slits
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 2;
        for (let o = -10; o <= 10; o += 5) {
          ctx.beginPath();
          ctx.moveTo(o, -12);
          ctx.lineTo(o, 12);
          ctx.stroke();
        }
      } else if (trap.type === 'SLIME_PUDDLE') {
        // Slime puddle
        const wobble = Math.sin(time * 3 + trap.x) * 2;
        ctx.fillStyle = 'rgba(34, 197, 94, 0.45)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 20 + wobble, 14 - wobble * 0.5, time * 0.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'rgba(163, 230, 53, 0.7)';
        ctx.beginPath();
        ctx.arc(-5, -4, 4, 0, Math.PI * 2);
        ctx.arc(6, 3, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }

  private renderWells(ctx: CanvasRenderingContext2D, wells: { x: number; y: number; id: string; depleted: boolean }[], time: number) {
    wells.forEach(well => {
      ctx.save();
      ctx.translate(well.x, well.y);

      // Stone well rim
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(0, 0, 22, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Rippling water pool inside
      const wave = Math.sin(time * 4) * 2;
      const grad = ctx.createRadialGradient(0, 0, 2, 0, 0, 16);
      grad.addColorStop(0, '#7dd3fc');
      grad.addColorStop(0.7, '#0284c7');
      grad.addColorStop(1, '#0369a1');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, 16 + wave * 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Water icon badge
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('💧', 0, 5);

      ctx.restore();
    });
  }

  private renderCrops(
    ctx: CanvasRenderingContext2D,
    crops: { x: number; y: number; id: string; watered: boolean; waterLevel: number }[],
    time: number
  ) {
    crops.forEach(crop => {
      ctx.save();
      ctx.translate(crop.x, crop.y);

      // Garden soil plot
      ctx.fillStyle = crop.watered ? '#3f2e18' : '#543d22';
      ctx.beginPath();
      ctx.roundRect(-22, -22, 44, 44, 8);
      ctx.fill();
      ctx.strokeStyle = crop.watered ? '#4ade80' : '#854d0e';
      ctx.lineWidth = crop.watered ? 2.5 : 1.5;
      ctx.stroke();

      if (crop.watered) {
        // Blooming Flourishing Plant with flowers
        const sway = Math.sin(time * 3 + crop.x) * 3;

        // Big green leaves
        ctx.fillStyle = '#22c55e';
        ctx.beginPath();
        ctx.ellipse(-10 + sway, -4, 12, 6, -0.4, 0, Math.PI * 2);
        ctx.ellipse(10 + sway, -4, 12, 6, 0.4, 0, Math.PI * 2);
        ctx.ellipse(0, 6, 12, 6, 1.57, 0, Math.PI * 2);
        ctx.fill();

        // Lush flower blossom
        ctx.fillStyle = '#f43f5e';
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 3) {
          ctx.beginPath();
          ctx.arc(Math.cos(a) * 6, Math.sin(a) * 6 - 2, 4.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Golden center
        ctx.fillStyle = '#facc15';
        ctx.beginPath();
        ctx.arc(0, -2, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // Verdant aura sparkle
        ctx.fillStyle = 'rgba(74, 222, 128, 0.25)';
        ctx.beginPath();
        ctx.arc(0, 0, 26 + Math.sin(time * 5) * 3, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Thirsty Wilting Sprout with thirst indicator
        ctx.fillStyle = '#a16207';
        // Drooping stem
        ctx.beginPath();
        ctx.arc(0, 4, 8, 0, Math.PI);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#a16207';
        ctx.stroke();

        // Dry brown wilting leaf
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(6, 6, 4, 0, Math.PI * 2);
        ctx.fill();

        // Thirsty animation icon bubble
        const bob = Math.sin(time * 4) * 3;
        ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
        ctx.beginPath();
        ctx.arc(0, -18 + bob, 10, 0, Math.PI * 2);
        ctx.fill();

        // Water drop icon in bubble
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('💧', 0, -15 + bob);

        // Water progress bar if player started watering
        if (crop.waterLevel > 0) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
          ctx.fillRect(-16, 16, 32, 5);
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(-16, 16, 32 * (crop.waterLevel / 100), 5);
        }
      }

      ctx.restore();
    });
  }

  private renderObstacles(ctx: CanvasRenderingContext2D, obstacles: Obstacle[], time: number) {
    obstacles.forEach(obs => {
      ctx.save();
      ctx.translate(obs.x, obs.y);

      if (obs.type === 'BEACH_BALL' || obs.type === 'ROLLING_BARREL') {
        // === BOUNCY RAINBOW BEACH BALL ===
        // 1. Soft friendly drop shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.beginPath();
        ctx.ellipse(0, obs.radius * 0.8, obs.radius * 1.05, obs.radius * 0.45, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Rotating Colorful Ball Body
        ctx.save();
        ctx.rotate(obs.rotation);

        // Striped colored segments
        const colors = ['#ef4444', '#facc15', '#38bdf8', '#ffffff', '#ec4899', '#22c55e'];
        const segCount = colors.length;
        for (let i = 0; i < segCount; i++) {
          const startAngle = (i / segCount) * Math.PI * 2;
          const endAngle = ((i + 1) / segCount) * Math.PI * 2;

          ctx.fillStyle = colors[i];
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.arc(0, 0, obs.radius, startAngle, endAngle);
          ctx.closePath();
          ctx.fill();
        }

        // White ball outline
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, obs.radius, 0, Math.PI * 2);
        ctx.stroke();

        // Cute smiling face on the ball
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(-5, -3, 2.2, 0, Math.PI * 2);
        ctx.arc(5, -3, 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Rosy cheeks
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(-8, 1, 2, 0, Math.PI * 2);
        ctx.arc(8, 1, 2, 0, Math.PI * 2);
        ctx.fill();

        // Happy smile curve
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.arc(0, 0, 4.5, 0.2, Math.PI - 0.2);
        ctx.stroke();

        // Glossy bubble highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.beginPath();
        ctx.ellipse(-obs.radius * 0.35, -obs.radius * 0.35, obs.radius * 0.32, obs.radius * 0.18, -Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Cute mini label
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚽', 0, -obs.radius - 4);

      } else if (obs.type === 'PINWHEEL' || obs.type === 'SPINNING_SAW') {
        // === RAINBOW TOY PINWHEEL ===
        // Cute Wooden Toy Stick
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.roundRect(-2.5, 0, 5, obs.radius * 1.5, 2);
        ctx.fill();

        // Soft breezy aura
        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
        ctx.beginPath();
        ctx.arc(0, 0, obs.radius * 1.25, 0, Math.PI * 2);
        ctx.fill();

        ctx.save();
        ctx.rotate(obs.rotation);

        // 4 Rainbow Curved Candy Petals
        const petalColors = ['#f43f5e', '#fbbf24', '#38bdf8', '#4ade80'];
        const petals = 4;
        for (let i = 0; i < petals; i++) {
          const pAngle = (i / petals) * Math.PI * 2;
          ctx.save();
          ctx.rotate(pAngle);

          ctx.fillStyle = petalColors[i % petalColors.length];
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(obs.radius * 0.7, -obs.radius * 0.4, obs.radius, 0);
          ctx.quadraticCurveTo(obs.radius * 0.4, obs.radius * 0.5, 0, 0);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.restore();
        }

        // Golden Center Button
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(0, 0, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d97706';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();

        // Cute breeze sparkles
        const spkAngle = time * 4;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(Math.cos(spkAngle) * (obs.radius + 6), Math.sin(spkAngle) * (obs.radius + 6), 2, 0, Math.PI * 2);
        ctx.fill();

      } else if (obs.type === 'BUBBLE_VENT' || obs.type === 'ELECTRIC_GATE') {
        // === SOAP BUBBLE MAKER ===
        // Cute blue bubble machine container
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.roundRect(-obs.radius * 0.75, -obs.radius * 0.75, obs.radius * 1.5, obs.radius * 1.5, 8);
        ctx.fill();
        ctx.strokeStyle = '#0284c7';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Smiling cute eyes on machine
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(-5, -2, 2, 0, Math.PI * 2);
        ctx.arc(5, -2, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(-7, 3, 1.8, 0, Math.PI * 2);
        ctx.arc(7, 3, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Bubble Nozzle
        ctx.fillStyle = '#bae6fd';
        ctx.beginPath();
        ctx.arc(0, -obs.radius * 0.75, 6, Math.PI, 0);
        ctx.fill();

        // Floating rainbow soap bubbles
        const bubbleSeeds = [0, 1.2, 2.4, 3.6];
        bubbleSeeds.forEach((seed, idx) => {
          const bTime = (time * 1.8 + seed) % 2.5;
          const bY = -obs.radius * 0.8 - bTime * 14;
          const bX = Math.sin(time * 3 + idx) * 8;
          const bAlpha = Math.max(0, 1 - (bTime / 2.5));
          const bSize = 4 + (idx % 3) * 2;

          ctx.fillStyle = `rgba(186, 230, 253, ${bAlpha * 0.65})`;
          ctx.beginPath();
          ctx.arc(bX, bY, bSize, 0, Math.PI * 2);
          ctx.fill();

          ctx.strokeStyle = `rgba(255, 255, 255, ${bAlpha * 0.9})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();

          // Bubble glint
          ctx.fillStyle = `rgba(255, 255, 255, ${bAlpha * 0.9})`;
          ctx.beginPath();
          ctx.arc(bX - bSize * 0.35, bY - bSize * 0.35, bSize * 0.3, 0, Math.PI * 2);
          ctx.fill();
        });

      } else if (obs.type === 'JELLY_BOUNCER' || obs.type === 'SPIKED_CRUSH') {
        // === WOBBLY JELL-O PUDDING ===
        // Jiggle scaling
        const jiggle = Math.sin(time * 7) * 0.12;
        const scaleX = 1 - jiggle;
        const scaleY = 1 + jiggle;

        ctx.save();
        ctx.scale(scaleX, scaleY);

        // Soft Jelly Drop Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(0, obs.radius * 0.75, obs.radius * 0.95, obs.radius * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Strawberry Jell-O Mound
        const jellyGrad = ctx.createRadialGradient(0, -4, 2, 0, 0, obs.radius);
        jellyGrad.addColorStop(0, '#fda4af');
        jellyGrad.addColorStop(0.7, '#f43f5e');
        jellyGrad.addColorStop(1, '#e11d48');
        ctx.fillStyle = jellyGrad;

        ctx.beginPath();
        ctx.moveTo(-obs.radius * 0.85, obs.radius * 0.7);
        ctx.bezierCurveTo(-obs.radius * 0.85, -obs.radius * 0.3, -obs.radius * 0.55, -obs.radius * 0.9, 0, -obs.radius * 0.9);
        ctx.bezierCurveTo(obs.radius * 0.55, -obs.radius * 0.9, obs.radius * 0.85, -obs.radius * 0.3, obs.radius * 0.85, obs.radius * 0.7);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = '#ffe4e6';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Cute Big Cartoon Eyes
        const isBlink = (time % 3.5) < 0.15;
        if (!isBlink) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.ellipse(-6, -4, 4.5, 6, 0, 0, Math.PI * 2);
          ctx.ellipse(6, -4, 4.5, 6, 0, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = '#0f172a';
          ctx.beginPath();
          ctx.arc(-5, -4, 2.5, 0, Math.PI * 2);
          ctx.arc(5, -4, 2.5, 0, Math.PI * 2);
          ctx.fill();

          // Eye shine glints
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(-6, -6, 1.2, 0, Math.PI * 2);
          ctx.arc(4, -6, 1.2, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Closed happy eye arcs
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(-6, -4, 4, Math.PI, 0);
          ctx.arc(6, -4, 4, Math.PI, 0);
          ctx.stroke();
        }

        // Rosy jelly cheeks
        ctx.fillStyle = '#fb7185';
        ctx.beginPath();
        ctx.arc(-11, 2, 2.5, 0, Math.PI * 2);
        ctx.arc(11, 2, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Cute Cherry on top
        ctx.fillStyle = '#be123c';
        ctx.beginPath();
        ctx.arc(0, -obs.radius * 0.95, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      ctx.restore();
    });
  }

  private renderPowerUps(ctx: CanvasRenderingContext2D, powerups: PowerUp[], time: number) {
    powerups.forEach(pw => {
      if (pw.collected) return;
      ctx.save();
      const bob = Math.sin(pw.bobOffset + time * 3) * 5;
      ctx.translate(pw.x, pw.y + bob);

      // Glowing aura
      ctx.fillStyle = pw.type === 'HEART' ? 'rgba(244, 63, 94, 0.35)' : 'rgba(250, 204, 21, 0.25)';
      ctx.beginPath();
      ctx.arc(0, 0, 20 + Math.sin(time * 6) * 3, 0, Math.PI * 2);
      ctx.fill();

      // Mystery Power-Up Box / Heart Box
      ctx.fillStyle = pw.type === 'HEART' ? '#e11d48' : '#ca8a04';
      ctx.beginPath();
      ctx.roundRect(-14, -14, 28, 28, 6);
      ctx.fill();
      ctx.strokeStyle = pw.type === 'HEART' ? '#fecdd3' : '#fef08a';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Icon on box
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      let icon = '🎁';
      if (pw.type === 'SPONGE') icon = '🧽';
      else if (pw.type === 'CLOCK') icon = '⏰';
      else if (pw.type === 'NIGHT_VISION') icon = '🔦';
      else if (pw.type === 'TURBO_SODA') icon = '⚡';
      else if (pw.type === 'BUCKET_LID') icon = '🛡️';
      else if (pw.type === 'HEART') icon = '💖';

      ctx.fillText(icon, 0, 0);

      ctx.restore();
    });
  }

  private renderExit(ctx: CanvasRenderingContext2D, x: number, y: number, isUnlocked: boolean, time: number) {
    ctx.save();
    ctx.translate(x, y);

    if (isUnlocked) {
      // Radiant Glowing Portal
      const rad = 28 + Math.sin(time * 5) * 4;
      const grad = ctx.createRadialGradient(0, 0, 5, 0, 0, rad);
      grad.addColorStop(0, '#4ade80');
      grad.addColorStop(0.6, '#22c55e');
      grad.addColorStop(1, 'rgba(34, 197, 94, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(0, 0, rad, 0, Math.PI * 2);
      ctx.fill();

      // Spinning rays
      ctx.rotate(time * 1.5);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(-16, 0);
        ctx.lineTo(16, 0);
        ctx.stroke();
        ctx.rotate(Math.PI / 4);
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🚪', 0, 0);
    } else {
      // Locked Cardboard Gate
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.roundRect(-18, -18, 36, 36, 6);
      ctx.fill();

      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔒', 0, 0);
    }

    ctx.restore();
  }

  private renderChasers(ctx: CanvasRenderingContext2D, chasers: Chaser[], time: number) {
    chasers.forEach(chaser => {
      // If captured, skip
      if (chaser.stunTimer > 900) return;

      ctx.save();
      ctx.translate(chaser.x, chaser.y);

      // 1. Drop shadow beneath chaser
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(0, chaser.radius * 0.7, chaser.radius * 0.9, chaser.radius * 0.45, 0, 0, Math.PI * 2);
      ctx.fill();

      // Rotate for character facing direction
      ctx.save();
      ctx.rotate(chaser.facingAngle);

      const isMoving = Math.hypot(chaser.vx, chaser.vy) > 0.3;
      const walkCycle = isMoving ? Math.sin(chaser.animTimer * 2.5) : 0;
      const stride = walkCycle * 7;

      if (chaser.type === 'GREEDY_GUZZLER') {
        // === GREEDY GUZZLER (Green goblin carton beast with fangs) ===
        // Legs / Claws
        ctx.fillStyle = '#064e3b';
        ctx.fillRect(-chaser.radius * 0.6 - 2, -10 + stride, 6, 7);
        ctx.fillRect(-chaser.radius * 0.6 - 2, 3 - stride, 6, 7);

        // Body
        ctx.fillStyle = '#059669';
        ctx.beginPath();
        ctx.ellipse(0, 0, chaser.radius * 1.1, chaser.radius * 0.95, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#022c22';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Cardboard Horns
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.moveTo(-chaser.radius * 0.6, -chaser.radius * 0.9);
        ctx.lineTo(-chaser.radius * 0.2, -chaser.radius * 1.4);
        ctx.lineTo(0, -chaser.radius * 0.8);
        ctx.fill();
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(-chaser.radius * 0.6, chaser.radius * 0.9);
        ctx.lineTo(-chaser.radius * 0.2, chaser.radius * 1.4);
        ctx.lineTo(0, chaser.radius * 0.8);
        ctx.fill();
        ctx.stroke();

        // Hungry Mouth & White Fangs
        ctx.fillStyle = '#1e1b4b';
        ctx.beginPath();
        ctx.arc(chaser.radius * 0.3, 0, chaser.radius * 0.55, -Math.PI * 0.4, Math.PI * 0.4);
        ctx.closePath();
        ctx.fill();

        // Fangs
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(chaser.radius * 0.4, -6);
        ctx.lineTo(chaser.radius * 0.7, -4);
        ctx.lineTo(chaser.radius * 0.4, -2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(chaser.radius * 0.4, 2);
        ctx.lineTo(chaser.radius * 0.7, 4);
        ctx.lineTo(chaser.radius * 0.4, 6);
        ctx.fill();

        // Drooling tongue when chasing
        if (chaser.state === 'CHASE') {
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.ellipse(chaser.radius * 0.65, Math.sin(time * 10) * 2, 4, 3, 0, 0, Math.PI * 2);
          ctx.fill();
        }

        // Angry Eyes
        const eyeY = 6;
        ctx.fillStyle = chaser.state === 'CHASE' ? '#f59e0b' : '#ffffff';
        ctx.beginPath();
        ctx.arc(chaser.radius * 0.15, -eyeY, 4.5, 0, Math.PI * 2);
        ctx.arc(chaser.radius * 0.15, eyeY, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(chaser.radius * 0.25, -eyeY, 2.5, 0, Math.PI * 2);
        ctx.arc(chaser.radius * 0.25, eyeY, 2.5, 0, Math.PI * 2);
        ctx.fill();

      } else if (chaser.type === 'SPEEDY_SPRINTER') {
        // === SPEEDY SPRINTER (Cyan & Neon Orange Fast Runner) ===
        // Fast Running Shoes
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.roundRect(-chaser.radius * 0.7, -13 + stride, 10, 6, 2);
        ctx.roundRect(-chaser.radius * 0.7, 7 - stride, 10, 6, 2);
        ctx.fill();

        // Sleek Body
        ctx.fillStyle = '#0284c7';
        ctx.beginPath();
        ctx.ellipse(0, 0, chaser.radius * 1.1, chaser.radius * 0.85, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#082f49';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Runner Racing Stripe
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(-chaser.radius * 0.9, -3, chaser.radius * 1.8, 6);

        // Sporty Visor / Goggles
        ctx.fillStyle = '#22d3ee';
        ctx.beginPath();
        ctx.roundRect(chaser.radius * 0.1, -8, 8, 16, 4);
        ctx.fill();
        ctx.strokeStyle = '#0369a1';
        ctx.lineWidth = 1.5;
        ctx.stroke();

      } else if (chaser.type === 'GOLDEN_BANDIT') {
        // === GOLDEN BANDIT (Glowing Gold with Treasure Sack) ===
        // Golden sparkling aura
        const glowRad = chaser.radius * 1.3 + Math.sin(time * 6) * 3;
        const goldGrad = ctx.createRadialGradient(0, 0, 4, 0, 0, glowRad);
        goldGrad.addColorStop(0, 'rgba(250, 204, 21, 0.7)');
        goldGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
        ctx.fillStyle = goldGrad;
        ctx.beginPath();
        ctx.arc(0, 0, glowRad, 0, Math.PI * 2);
        ctx.fill();

        // Shoes
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-chaser.radius * 0.6, -11 + stride, 7, 5);
        ctx.fillRect(-chaser.radius * 0.6, 6 - stride, 7, 5);

        // Golden Body
        ctx.fillStyle = '#eab308';
        ctx.beginPath();
        ctx.ellipse(0, 0, chaser.radius * 1.05, chaser.radius * 0.9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#854d0e';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Treasure Bag on Back
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.arc(-chaser.radius * 0.6, 0, chaser.radius * 0.65, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Water Crystal Gems overflowing from bag
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(-chaser.radius * 0.7, -4, 4, 0, Math.PI * 2);
        ctx.arc(-chaser.radius * 0.7, 4, 4, 0, Math.PI * 2);
        ctx.fill();

        // Mask & Shiny eyes
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(chaser.radius * 0.1, -7, 6, 14);
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(chaser.radius * 0.35, -3.5, 2.5, 0, Math.PI * 2);
        ctx.arc(chaser.radius * 0.35, 3.5, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore(); // restore rotation

      // 2. Status Indicators & Badges (Drawn upright above head)
      if (chaser.state === 'ALERT') {
        const bounce = Math.abs(Math.sin(time * 12)) * 6;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, -chaser.radius - 16 - bounce, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!', 0, -chaser.radius - 16 - bounce);
      } else if (chaser.state === 'STUNNED') {
        // Spinning Cartoon Stars
        const starDist = 14;
        const starTime = time * 6;
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        for (let i = 0; i < 3; i++) {
          const sAngle = starTime + (i * Math.PI * 2) / 3;
          const sx = Math.cos(sAngle) * starDist;
          const sy = -chaser.radius - 14 + Math.sin(sAngle) * 5;
          ctx.fillText('💫', sx, sy);
        }
      } else if (chaser.type === 'GOLDEN_BANDIT' && chaser.isCarryingBonus) {
        // Floating Catch Me badge
        const badgeY = -chaser.radius - 14 + Math.sin(time * 4) * 3;
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.beginPath();
        ctx.roundRect(-42, badgeY - 8, 84, 16, 8);
        ctx.fill();
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⭐ CATCH ME! +💧', 0, badgeY);
      }

      ctx.restore();
    });
  }

  private renderSpookyEyes(ctx: CanvasRenderingContext2D, spookyEyes: SpookyEyes[], time: number) {
    spookyEyes.forEach(eyes => {
      if (eyes.alpha <= 0.01) return;
      ctx.save();
      ctx.translate(eyes.x, eyes.y);
      ctx.globalAlpha = eyes.alpha;

      const eyeWidth = eyes.isBlinking ? 1 : 4;
      const eyeHeight = eyes.isBlinking ? 1 : 6;
      const lookX = Math.sin(time * 2) * 1.2;

      ctx.fillStyle = eyes.color;
      // Left eye
      ctx.beginPath();
      ctx.ellipse(-6 + lookX, 0, eyeWidth, eyeHeight, 0, 0, Math.PI * 2);
      ctx.fill();

      // Right eye
      ctx.beginPath();
      ctx.ellipse(6 + lookX, 0, eyeWidth, eyeHeight, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }

  private renderPlayer(ctx: CanvasRenderingContext2D, p: import('../types').Player, time: number) {
    ctx.save();
    ctx.translate(p.x, p.y);

    // Invulnerability Blinking Effect
    if (p.invincibleTimer > 0) {
      ctx.globalAlpha = Math.floor(time * 24) % 2 === 0 ? 0.35 : 0.95;
    }

    // Apply Squash and Stretch scale
    ctx.scale(p.squashX, p.squashY);

    // Rotate player towards facing angle
    ctx.rotate(p.angle);

    const isMoving = Math.hypot(p.vx, p.vy) > 0.5;
    const runCycle = isMoving ? Math.sin(time * 16) : 0;

    // 0. Running Legs & Sneakers (rendered beneath body)
    const legOffset = p.radius * 0.55;
    const stride = runCycle * 8;

    // Left leg / shoe
    ctx.fillStyle = '#1e293b'; // Shorts / leg
    ctx.fillRect(-legOffset - 3, -12 + stride, 6, 8);
    ctx.fillStyle = '#f43f5e'; // Bright red running sneaker
    ctx.beginPath();
    ctx.roundRect(-legOffset - 4, -14 + stride, 8, 5, 2);
    ctx.fill();

    // Right leg / shoe
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-legOffset - 3, 4 - stride, 6, 8);
    ctx.fillStyle = '#f43f5e';
    ctx.beginPath();
    ctx.roundRect(-legOffset - 4, 9 - stride, 8, 5, 2);
    ctx.fill();

    // 1. Human Body & Athletic Runner Jersey
    ctx.fillStyle = '#3b82f6'; // Athletic blue jersey
    ctx.beginPath();
    ctx.ellipse(0, 0, p.radius * 1.05, p.radius * 0.9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Jersey trim outline
    ctx.strokeStyle = '#1d4ed8';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Runner Number Bib on Back / Torso
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-p.radius * 0.6, -5, p.radius * 0.7, 10);
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1;
    ctx.strokeRect(-p.radius * 0.6, -5, p.radius * 0.7, 10);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('01', -p.radius * 0.25, 0);

    // 2. Human Head & Face
    const headX = p.radius * 0.35;
    ctx.fillStyle = '#fed7aa'; // Human skin tone
    ctx.beginPath();
    ctx.arc(headX, 0, p.radius * 0.7, 0, Math.PI * 2);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#451a03'; // Brown hair
    ctx.beginPath();
    ctx.arc(headX - 2, 0, p.radius * 0.68, Math.PI * 0.5, Math.PI * 1.5);
    ctx.fill();

    // Red Athlete Headband
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(headX - 4, -p.radius * 0.72, 8, p.radius * 1.44);

    // Headband knot tails waving behind runner
    ctx.beginPath();
    ctx.moveTo(headX - 4, -p.radius * 0.6);
    ctx.lineTo(headX - 16, -p.radius * 0.8 + Math.sin(time * 12) * 4);
    ctx.lineTo(headX - 12, -p.radius * 0.3);
    ctx.closePath();
    ctx.fill();

    // 3. Expressive Human Eyes & Brows
    const eyeX = headX + 4;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(eyeX, -4.5, 4, 0, Math.PI * 2);
    ctx.arc(eyeX, 4.5, 4, 0, Math.PI * 2);
    ctx.fill();

    // Pupils
    ctx.fillStyle = '#0f172a';
    if (p.water <= 20) {
      // Panicked wide pupils
      ctx.beginPath();
      ctx.arc(eyeX + 1, -4.5, 1.8, 0, Math.PI * 2);
      ctx.arc(eyeX + 1, 4.5, 1.8, 0, Math.PI * 2);
      ctx.fill();

      // Sweat drops
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(headX, -p.radius * 0.9, 2.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Determined runner pupils looking forward
      ctx.beginPath();
      ctx.arc(eyeX + 1.8, -4.5, 2.2, 0, Math.PI * 2);
      ctx.arc(eyeX + 1.8, 4.5, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Human Arms (Holding Bucket with both hands)
    ctx.fillStyle = '#fed7aa';
    // Left Arm reaching to bucket
    ctx.beginPath();
    ctx.roundRect(headX - 2, -13, 14, 5, 2);
    ctx.fill();

    // Right Arm reaching to bucket
    ctx.beginPath();
    ctx.roundRect(headX - 2, 8, 14, 5, 2);
    ctx.fill();

    // 5. Sloshing Bucket in Hands
    ctx.save();
    ctx.translate(p.radius + 9, 0);
    ctx.rotate(p.sloshTilt);

    // Bucket metal shell
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.roundRect(-7, -10, 14, 20, 3);
    ctx.fill();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Bucket handle
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 12, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();

    // Water level inside bucket
    if (p.water > 0) {
      const waterHeight = (p.water / p.maxWater) * 16;
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(-5, 8 - waterHeight, 10, waterHeight);

      // Water meniscus / surface
      ctx.fillStyle = '#7dd3fc';
      ctx.beginPath();
      ctx.ellipse(0, 8 - waterHeight, 5, 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Bucket Lid Power-Up Visual
    if (p.powerups.lidTimer > 0) {
      ctx.fillStyle = '#8b5cf6';
      ctx.fillRect(-8, -12, 16, 4);
      ctx.strokeStyle = '#c4b5fd';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-8, -12, 16, 4);
    }

    ctx.restore();

    ctx.restore();
  }

  private renderFloatingTexts(ctx: CanvasRenderingContext2D, texts: import('../types').FloatingText[]) {
    texts.forEach(ft => {
      ctx.save();
      const alpha = Math.max(0, Math.min(1, ft.life / ft.maxLife));
      ctx.globalAlpha = alpha;
      ctx.translate(ft.x, ft.y);
      ctx.scale(ft.scale, ft.scale);

      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Text stroke outline
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.85)';
      ctx.lineWidth = 3.5;
      ctx.strokeText(ft.text, 0, 0);

      // Fill
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, 0, 0);

      ctx.restore();
    });
  }

  private renderScreenOverlays(ctx: CanvasRenderingContext2D, width: number, height: number, engine: GameEngine) {
    // Red Damage Flash Vignette
    if (engine.damageFlash > 0.01) {
      const grad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) * 0.3,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.7
      );
      grad.addColorStop(0, 'rgba(239, 68, 68, 0)');
      grad.addColorStop(1, `rgba(239, 68, 68, ${engine.damageFlash * 0.55})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    // Golden Victory Glow Aura
    if (engine.victoryGlow > 0.01) {
      const grad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) * 0.2,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.65
      );
      grad.addColorStop(0, 'rgba(250, 204, 21, 0)');
      grad.addColorStop(1, `rgba(74, 222, 128, ${engine.victoryGlow * 0.45})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    // Critical low water warning vignette
    if (engine.player && engine.player.water <= 20 && engine.status === 'PLAYING') {
      const pulse = (Math.sin(engine.gameTime * 6) + 1) * 0.5;
      const grad = ctx.createRadialGradient(
        width / 2,
        height / 2,
        Math.min(width, height) * 0.35,
        width / 2,
        height / 2,
        Math.max(width, height) * 0.75
      );
      grad.addColorStop(0, 'rgba(239, 68, 68, 0)');
      grad.addColorStop(1, `rgba(220, 38, 38, ${pulse * 0.35})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }
  }
}

export const gameRenderer = new GameRenderer();
