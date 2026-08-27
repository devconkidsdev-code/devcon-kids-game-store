import { Particle } from '../types';

export class ParticleSystem {
  private particles: Particle[] = [];
  private maxParticles: number = 350;

  public update(dt: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life -= dt;

      if (p.life <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      // Physics update
      p.x += p.vx * dt * 60;
      p.y += p.vy * dt * 60;

      if (p.rotation !== undefined && p.vRot !== undefined) {
        p.rotation += p.vRot * dt * 60;
      }

      // Drag / deceleration
      if (p.type === 'WATER') {
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.size *= 0.985;
      } else if (p.type === 'BLOOM') {
        p.vy -= 0.15; // Float upwards gently
        p.vx *= 0.96;
      } else if (p.type === 'DEBRIS') {
        p.vx *= 0.92;
        p.vy *= 0.92;
      } else if (p.type === 'SWEAT') {
        p.vy += 0.35; // Gravity
      } else if (p.type === 'STEAM') {
        p.vy -= 0.6;
        p.size += 0.4;
        p.vx += (Math.random() - 0.5) * 0.4;
      }
    }
  }

  public emitWaterSplash(x: number, y: number, count: number = 12, speed: number = 3.5) {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const spd = (0.5 + Math.random()) * speed;
      const life = 0.35 + Math.random() * 0.4;
      const colors = ['#38bdf8', '#0284c7', '#7dd3fc', '#bae6fd', '#06b6d4'];

      this.particles.push({
        x: x + (Math.random() - 0.5) * 8,
        y: y + (Math.random() - 0.5) * 8,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        size: 3 + Math.random() * 4.5,
        maxLife: life,
        life: life,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: 'WATER'
      });
    }
  }

  public emitCropBloom(x: number, y: number, count: number = 24) {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const spd = 1.2 + Math.random() * 3.5;
      const life = 0.6 + Math.random() * 0.6;
      const colors = ['#4ade80', '#22c55e', '#a3e635', '#facc15', '#f472b6', '#38bdf8'];

      this.particles.push({
        x: x + (Math.random() - 0.5) * 16,
        y: y + (Math.random() - 0.5) * 16,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd - 1.5,
        size: 3.5 + Math.random() * 4,
        maxLife: life,
        life: life,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: 'BLOOM',
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.2
      });
    }
  }

  public emitDebris(x: number, y: number, count: number = 8) {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const spd = 1.5 + Math.random() * 4.0;
      const life = 0.3 + Math.random() * 0.3;
      const colors = ['#d97706', '#b45309', '#78350f', '#fef3c7'];

      this.particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        size: 3 + Math.random() * 3.5,
        maxLife: life,
        life: life,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: 'DEBRIS',
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.3
      });
    }
  }

  public emitSweat(x: number, y: number, facingAngle: number) {
    if (this.particles.length >= this.maxParticles) return;
    const offsetAngle = facingAngle + Math.PI + (Math.random() - 0.5) * 1.2;
    const spd = 1.8 + Math.random() * 2.0;
    const life = 0.4 + Math.random() * 0.2;

    this.particles.push({
      x: x + Math.cos(offsetAngle) * 12,
      y: y + Math.sin(offsetAngle) * 12,
      vx: Math.cos(offsetAngle) * spd,
      vy: Math.sin(offsetAngle) * spd - 1.0,
      size: 2.5 + Math.random() * 2,
      maxLife: life,
      life: life,
      color: '#60a5fa',
      type: 'SWEAT'
    });
  }

  public emitSparkles(x: number, y: number, count: number = 3) {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const spd = 0.5 + Math.random() * 1.2;
      const life = 0.4 + Math.random() * 0.3;

      this.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        size: 2.5 + Math.random() * 3,
        maxLife: life,
        life: life,
        color: '#fde047',
        type: 'SPARKLE'
      });
    }
  }

  public emitSteam(x: number, y: number) {
    for (let i = 0; i < 4; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const life = 0.5 + Math.random() * 0.3;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 14,
        y: y + (Math.random() - 0.5) * 14,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -2 - Math.random() * 2,
        size: 4 + Math.random() * 4,
        maxLife: life,
        life: life,
        color: 'rgba(240, 240, 245, 0.6)',
        type: 'STEAM'
      });
    }
  }

  public emitDust(x: number, y: number, count: number = 3) {
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const spd = 0.5 + Math.random() * 1.5;
      const life = 0.25 + Math.random() * 0.2;
      this.particles.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: Math.cos(angle) * spd,
        vy: Math.sin(angle) * spd,
        size: 2.5 + Math.random() * 2.5,
        maxLife: life,
        life: life,
        color: 'rgba(226, 232, 240, 0.7)',
        type: 'STEAM'
      });
    }
  }

  public render(ctx: CanvasRenderingContext2D) {
    for (const p of this.particles) {
      const alpha = Math.max(0, Math.min(1, p.life / p.maxLife));
      ctx.save();
      ctx.globalAlpha = alpha;

      if (p.type === 'WATER' || p.type === 'SWEAT') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // Water specular highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.beginPath();
        ctx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.35, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'BLOOM') {
        ctx.translate(p.x, p.y);
        if (p.rotation !== undefined) ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        // Little flower petal shape
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'DEBRIS') {
        ctx.translate(p.x, p.y);
        if (p.rotation !== undefined) ctx.rotate(p.rotation);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.8);
      } else if (p.type === 'SPARKLE') {
        ctx.translate(p.x, p.y);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        // 4-point star
        const s = p.size;
        ctx.moveTo(0, -s);
        ctx.lineTo(s * 0.3, -s * 0.3);
        ctx.lineTo(s, 0);
        ctx.lineTo(s * 0.3, s * 0.3);
        ctx.lineTo(0, s);
        ctx.lineTo(-s * 0.3, s * 0.3);
        ctx.lineTo(-s, 0);
        ctx.lineTo(-s * 0.3, -s * 0.3);
        ctx.closePath();
        ctx.fill();
      } else if (p.type === 'STEAM') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }

  public clear() {
    this.particles = [];
  }
}
