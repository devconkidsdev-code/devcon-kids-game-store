import { Particle } from '../types';

export class ParticleSystem {
  public particles: Particle[] = [];

  public update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;
      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      // Special particle physics
      if (p.shape === 'droplet') {
        p.vy += 300 * dt; // gravity
      } else if (p.shape === 'ripple') {
        p.size += 30 * dt;
      } else if (p.shape === 'foam') {
        p.size += 15 * dt;
      }

      p.alpha = Math.max(0, p.life / p.maxLife);
    }
  }

  public draw(ctx: CanvasRenderingContext2D, cameraY: number) {
    ctx.save();
    for (const p of this.particles) {
      const screenY = p.y - cameraY;
      if (screenY < -50 || screenY > 650) continue;

      ctx.globalAlpha = p.alpha;

      if (p.shape === 'circle' || p.shape === 'droplet') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, screenY, Math.max(1, p.size), 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'ripple') {
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.ellipse(p.x, screenY, p.size * 1.5, p.size * 0.7, 0, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.shape === 'foam') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, screenY, Math.max(1, p.size), 0, Math.PI * 2);
        ctx.fill();
      } else if (p.shape === 'sparkle') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, screenY, p.size, 0, Math.PI * 2);
        ctx.fill();
        // Cross shine
        ctx.strokeStyle = p.color;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(p.x - p.size * 2, screenY);
        ctx.lineTo(p.x + p.size * 2, screenY);
        ctx.moveTo(p.x, screenY - p.size * 2);
        ctx.lineTo(p.x, screenY + p.size * 2);
        ctx.stroke();
      } else if (p.shape === 'leaf') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(p.x, screenY, p.size, p.size * 0.5, p.life * 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // Emitters
  public emitDust(x: number, y: number) {
    for (let i = 0; i < 4; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.5) * 40,
        vy: -Math.random() * 25,
        size: 3 + Math.random() * 3,
        color: '#d4b483',
        alpha: 0.7,
        life: 0.35 + Math.random() * 0.2,
        maxLife: 0.5,
        shape: 'circle',
      });
    }
  }

  public emitWaterRipple(x: number, y: number, color = 'rgba(255, 255, 255, 0.7)') {
    this.particles.push({
      x,
      y,
      vx: 0,
      vy: 10,
      size: 6,
      color,
      alpha: 0.8,
      life: 0.6,
      maxLife: 0.6,
      shape: 'ripple',
    });
  }

  public emitBoatWake(x: number, y: number, isBoosting: boolean) {
    const count = isBoosting ? 5 : 2;
    for (let i = 0; i < count; i++) {
      const side = Math.random() > 0.5 ? 1 : -1;
      this.particles.push({
        x: x + side * (12 + Math.random() * 12),
        y: y + 25 + Math.random() * 10,
        vx: side * (30 + Math.random() * 40),
        vy: 15 + Math.random() * 25,
        size: isBoosting ? 6 + Math.random() * 4 : 4 + Math.random() * 3,
        color: 'rgba(240, 250, 255, 0.8)',
        alpha: 0.8,
        life: 0.45 + Math.random() * 0.25,
        maxLife: 0.7,
        shape: 'foam',
      });
    }
    if (Math.random() < 0.3) {
      this.emitWaterRipple(x, y + 20);
    }
  }

  public emitSplashes(x: number, y: number, count = 10, color = 'rgba(215, 240, 255, 0.9)') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 60 + Math.random() * 120;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 60,
        size: 2.5 + Math.random() * 3,
        color,
        alpha: 0.9,
        life: 0.4 + Math.random() * 0.3,
        maxLife: 0.7,
        shape: 'droplet',
      });
    }
  }

  public emitWaveSpray(x: number, y: number, width: number) {
    for (let i = 0; i < 6; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * width,
        y: y + (Math.random() - 0.5) * 20,
        vx: (Math.random() - 0.5) * 80,
        vy: -(60 + Math.random() * 90),
        size: 3 + Math.random() * 5,
        color: 'rgba(255, 255, 255, 0.95)',
        alpha: 0.9,
        life: 0.35 + Math.random() * 0.3,
        maxLife: 0.65,
        shape: 'droplet',
      });
    }
  }

  public emitPickupSparkles(x: number, y: number) {
    const colors = ['#fde047', '#38bdf8', '#4ade80', '#fb923c', '#ffffff'];
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2 + Math.random() * 0.2;
      const speed = 40 + Math.random() * 80;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 3 + Math.random() * 3,
        color: colors[i % colors.length],
        alpha: 1,
        life: 0.5 + Math.random() * 0.3,
        maxLife: 0.8,
        shape: 'sparkle',
      });
    }
  }

  public clear() {
    this.particles = [];
  }
}
