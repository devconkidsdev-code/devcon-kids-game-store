import React, { useEffect, useRef } from 'react';
import { audio } from '../audio';
import { MAP_COLS, MAP_DATA, MAP_ROWS, TILE_SIZE } from '../gameData';

interface GameCanvasProps {
  onWin: (score: number) => void;
  onLose: (reason: string, score: number) => void;
  keysRef: React.MutableRefObject<{ up: boolean; down: boolean; left: boolean; right: boolean; repair: boolean }>;
}

const PLAYER_SPEED = 180;
const PLAYER_RADIUS = 12;

interface Pipe {
  cx: number;
  cy: number;
  fixed: boolean;
}

export function GameCanvas({ onWin, onLose, keysRef }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize Game State
    let animationFrameId: number;
    let lastTime = performance.now();

    const pipes: Pipe[] = [];
    MAP_DATA.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell === 2) {
          pipes.push({ cx: c * TILE_SIZE + TILE_SIZE / 2, cy: r * TILE_SIZE + TILE_SIZE / 2, fixed: false });
        }
      });
    });

    const state = {
      player: {
        x: TILE_SIZE * 1.5,
        y: TILE_SIZE * 13.5,
        isRepairing: false,
        repairTimer: 0,
        targetPipe: null as Pipe | null,
      },
      water: 100,
      lives: 3,
      score: 0,
      pipes,
      wrongRepairTimer: 0,
    };

    const collides = (x: number, y: number, radius: number) => {
      const left = Math.floor((x - radius) / TILE_SIZE);
      const right = Math.floor((x + radius) / TILE_SIZE);
      const top = Math.floor((y - radius) / TILE_SIZE);
      const bottom = Math.floor((y + radius) / TILE_SIZE);

      for (let r = top; r <= bottom; r++) {
        for (let c = left; c <= right; c++) {
          if (MAP_DATA[r] && (MAP_DATA[r][c] === 1 || MAP_DATA[r][c] === 3)) return true;
        }
      }
      return false;
    };

    // State for repair button debouncing to prevent instant wrong repairs
    let repairJustPressed = false;

    const update = (dt: number) => {
      const keys = keysRef.current;

      // Handle wrong repair visual timer
      if (state.wrongRepairTimer > 0) {
        state.wrongRepairTimer -= dt;
      }

      // Check nearest broken pipe
      let nearestBroken: Pipe | null = null;
      let minDist = Infinity;
      state.pipes.forEach(pipe => {
        if (!pipe.fixed) {
          const dist = Math.hypot(state.player.x - pipe.cx, state.player.y - pipe.cy);
          if (dist < minDist) {
            minDist = dist;
            nearestBroken = pipe;
          }
        }
      });
      const canRepair = minDist < 60;

      // Handle Repair Input
      if (keys.repair && !repairJustPressed) {
        repairJustPressed = true;
        if (!state.player.isRepairing) {
          if (canRepair && nearestBroken) {
            // Start repair
            state.player.isRepairing = true;
            state.player.repairTimer = 3.0;
            state.player.targetPipe = nearestBroken;
            audio.startRepairingSound();
          } else {
            // Wrong repair
            state.lives -= 1;
            state.wrongRepairTimer = 1.5;
            audio.playWrong();
            if (state.lives <= 0) {
              onLose("NO LIVES LEFT!", state.score);
              return;
            }
          }
        }
      } else if (!keys.repair) {
        repairJustPressed = false;
      }

      // Handle Repair Progress
      if (state.player.isRepairing && state.player.targetPipe) {
        state.player.repairTimer -= dt;
        if (state.player.repairTimer <= 0) {
          // Finish repair
          state.player.targetPipe.fixed = true;
          state.score += 2;
          state.player.isRepairing = false;
          state.player.targetPipe = null;
          audio.stopRepairingSound();
          audio.playRepair();

          // Check Win Condition
          if (state.pipes.every(p => p.fixed)) {
            state.score += 5;
            onWin(state.score);
            return;
          }
        }
      } else {
        // Normal Movement
        let vx = 0;
        let vy = 0;
        if (keys.left) vx -= PLAYER_SPEED;
        if (keys.right) vx += PLAYER_SPEED;
        if (keys.up) vy -= PLAYER_SPEED;
        if (keys.down) vy += PLAYER_SPEED;

        // Apply movement with AABB sliding
        if (vx !== 0) {
          state.player.x += vx * dt;
          if (collides(state.player.x, state.player.y, PLAYER_RADIUS)) {
            state.player.x -= vx * dt;
          }
        }
        if (vy !== 0) {
          state.player.y += vy * dt;
          if (collides(state.player.x, state.player.y, PLAYER_RADIUS)) {
            state.player.y -= vy * dt;
          }
        }
      }

      // Handle Water Drain
      const activePipes = state.pipes.filter(p => !p.fixed).length;
      if (activePipes > 0) {
        const drainRate = 0.5 + activePipes * 0.4; // Base + per pipe
        state.water -= drainRate * dt;
        if (state.water <= 0) {
          state.water = 0;
          onLose("THE WATER RAN OUT!", state.score);
          return;
        }
      }
    };

    const draw = (dt: number, time: number) => {
      // Clear Canvas
      ctx.fillStyle = '#a8d5ba'; // Grass
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw grid overlay (like the radial gradient in design)
      ctx.fillStyle = 'rgba(90, 90, 64, 0.15)';
      for (let x = 0; x < canvas.width; x += 40) {
        for (let y = 0; y < canvas.height; y += 40) {
          ctx.beginPath();
          ctx.arc(x + 20, y + 20, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw Map
      MAP_DATA.forEach((row, r) => {
        row.forEach((cell, c) => {
          const x = c * TILE_SIZE;
          const y = r * TILE_SIZE;
          if (cell === 1) {
            // House / Fence
            ctx.fillStyle = '#f8b195';
            ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
            ctx.fillStyle = '#e69b81';
            ctx.fillRect(x, y + TILE_SIZE - 4, TILE_SIZE, 4); // border-b-8 effect
          } else if (cell === 3) {
            // Water Tank visual
            ctx.fillStyle = '#7ca5b8';
            ctx.fillRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
            ctx.strokeStyle = '#5d8aa0';
            ctx.lineWidth = 4;
            ctx.strokeRect(x + 2, y + 2, TILE_SIZE - 4, TILE_SIZE - 4);
          }
        });
      });

      // Draw Pipes
      state.pipes.forEach(pipe => {
        const px = pipe.cx - 15;
        const py = pipe.cy - 15;
        // Base pipe
        ctx.fillStyle = pipe.fixed ? '#8ba888' : '#9ca3af'; // gray-400 for unfixed
        ctx.fillRect(px + 10, py - 5, 10, 40); // Vertical pipe look

        if (!pipe.fixed) {
          // Water leaking animation
          ctx.fillStyle = '#6eb5ff';
          const t = time / 1000;
          for (let i = 0; i < 3; i++) {
            const dropX = pipe.cx + Math.sin(t * 15 + i * 1.5) * 8;
            const dropY = pipe.cy - Math.abs(Math.cos(t * 10 + i * 1.2) * 12);
            ctx.beginPath();
            ctx.arc(dropX, dropY, 3.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      // Draw Player
      const { player } = state;
      ctx.save();
      ctx.translate(player.x, player.y);
      // Wobble animation if moving
      if (!player.isRepairing && (keysRef.current.up || keysRef.current.down || keysRef.current.left || keysRef.current.right)) {
        ctx.rotate(Math.sin(time / 100) * 0.15);
      }
      
      // Body
      ctx.fillStyle = '#5a5a40';
      ctx.beginPath();
      ctx.roundRect(-PLAYER_RADIUS, -PLAYER_RADIUS, PLAYER_RADIUS * 2, PLAYER_RADIUS * 2, 4);
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.strokeRect(-PLAYER_RADIUS, -PLAYER_RADIUS, PLAYER_RADIUS * 2, PLAYER_RADIUS * 2);

      // Head
      ctx.fillStyle = '#f5d08b';
      ctx.beginPath();
      ctx.arc(0, -PLAYER_RADIUS + 2, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#5a5a40';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      // Check nearest pipe for UI Prompts
      let minDist = Infinity;
      state.pipes.forEach(pipe => {
        if (!pipe.fixed) {
          const dist = Math.hypot(player.x - pipe.cx, player.y - pipe.cy);
          if (dist < minDist) minDist = dist;
        }
      });

      // Draw Repair Progress
      if (player.isRepairing) {
        ctx.fillStyle = 'rgba(255,255,255,0.95)';
        ctx.beginPath();
        ctx.roundRect(player.x - 25, player.y - 45, 50, 16, 8);
        ctx.fill();
        ctx.strokeStyle = '#5a5a40';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = '#5a5a40';
        ctx.fillRect(player.x - 22, player.y - 42, 44, 10);
        ctx.fillStyle = '#6eb5ff';
        ctx.fillRect(player.x - 21, player.y - 41, 42 * (1 - player.repairTimer / 3.0), 8);
      } else if (state.wrongRepairTimer > 0) {
        // Draw Wrong Repair
        const txt = "WRONG REPAIR!";
        ctx.font = "900 11px sans-serif";
        const w = ctx.measureText(txt).width;
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx.beginPath();
        ctx.roundRect(player.x - w / 2 - 12, player.y - 50, w + 24, 24, 12);
        ctx.fill();
        ctx.strokeStyle = '#e69b81';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "#e69b81";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(txt, player.x, player.y - 38);
      } else if (minDist < 60) {
        // Draw Repair Prompt
        const txt = "BROKEN PIPE DETECTED!";
        ctx.font = "900 11px sans-serif";
        const w = ctx.measureText(txt).width;
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx.beginPath();
        ctx.roundRect(player.x - w / 2 - 12, player.y - 50, w + 24, 24, 12);
        ctx.fill();
        ctx.strokeStyle = '#5a5a40';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.fillStyle = "#5a5a40";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(txt, player.x, player.y - 38);
      }

      // Draw HUD
      // Top Bar Background
      ctx.fillStyle = '#fefcf8';
      ctx.fillRect(0, 0, canvas.width, 44);
      ctx.fillStyle = '#8ba888';
      ctx.fillRect(0, 44, canvas.width, 4);

      // Lives
      ctx.fillStyle = '#f0f4ee';
      ctx.beginPath();
      ctx.roundRect(15, 8, 70, 28, 8);
      ctx.fill();
      ctx.strokeStyle = 'rgba(139, 168, 136, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = '#f44336';
      ctx.font = "16px sans-serif";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText("❤️", 25, 23);
      
      ctx.fillStyle = '#5a5a40';
      ctx.font = "900 20px sans-serif";
      ctx.fillText(state.lives.toString(), 52, 23);

      // Score
      ctx.fillStyle = '#5a5a40';
      ctx.font = "900 24px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(state.score.toString().padStart(3, '0'), canvas.width - 15, 27);
      
      ctx.fillStyle = '#8ba888';
      ctx.font = "bold 10px sans-serif";
      ctx.fillText("SCORE", canvas.width - 58, 27);

      // Water Meter
      const meterW = 300;
      const meterX = (canvas.width - meterW) / 2;
      
      ctx.fillStyle = '#5a5a40';
      ctx.font = "bold 10px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("COMMUNITY WATER SUPPLY", meterX + meterW / 2, 14);

      ctx.fillStyle = '#d1dcd0';
      ctx.beginPath();
      ctx.roundRect(meterX, 22, meterW, 14, 7);
      ctx.fill();
      ctx.strokeStyle = '#8ba888';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      const waterRatio = Math.max(0, state.water) / 100;
      // Gradient not easily done nicely over a roundRect for width, but we can do a solid color
      ctx.fillStyle = state.water > 30 ? '#4facfe' : '#e69b81';
      ctx.beginPath();
      ctx.roundRect(meterX + 2, 24, Math.max(1, (meterW - 4) * waterRatio), 10, 5);
      ctx.fill();
    };

    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;
      
      update(dt);
      draw(dt, time);

      animationFrameId = requestAnimationFrame(loop);
    };
    
    animationFrameId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      audio.stopRepairingSound();
    };
  }, [onWin, onLose, keysRef]);

  return (
    <canvas
      ref={canvasRef}
      width={MAP_COLS * TILE_SIZE}
      height={MAP_ROWS * TILE_SIZE}
      className="bg-[#a8d5ba] shadow-2xl rounded-xl w-full h-full object-contain max-h-[80vh] touch-none"
    />
  );
}
