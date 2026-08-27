import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, RotateCcw, Shield, Sparkles, Zap, Flame, Droplets, Volume2, VolumeX, Eye, HelpCircle } from 'lucide-react';
import { BlitzItem, BlitzControlStyle, Particle, TrailPoint } from '../types';
import { sound } from '../utils/sound';

interface BlitzModeProps {
  onUpdateStats: (diamonds: number, bombsDefused: number, score: number) => void;
  highScore: number;
}

export const BlitzMode: React.FC<BlitzModeProps> = ({ onUpdateStats, highScore }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [combo, setCombo] = useState<number>(1);
  const [mana, setMana] = useState<number>(0); // 0 to 100
  const [controlStyle, setControlStyle] = useState<BlitzControlStyle>('slash');
  const [shieldTime, setShieldTime] = useState<number>(0);
  const [freezeTime, setFreezeTime] = useState<number>(0);
  const [level, setLevel] = useState<number>(1);
  const [diamondsCaught, setDiamondsCaught] = useState<number>(0);
  const [bombsDefused, setBombsDefused] = useState<number>(0);

  // References for high performance 60fps loop
  const stateRef = useRef({
    isPlaying: false,
    score: 0,
    lives: 3,
    combo: 1,
    comboTimer: 0,
    mana: 0,
    shieldTime: 0,
    freezeTime: 0,
    level: 1,
    items: [] as BlitzItem[],
    particles: [] as Particle[],
    trail: [] as TrailPoint[],
    catcherX: 0,
    catcherWidth: 110,
    isPointerDown: false,
    lastPointerX: 0,
    lastPointerY: 0,
    lastSpawnTime: 0,
    diamondsCount: 0,
    bombsCount: 0,
    tsunamiActive: 0, // timer
  });

  // Sync reactive state to ref
  useEffect(() => {
    stateRef.current.isPlaying = isPlaying;
    stateRef.current.score = score;
    stateRef.current.lives = lives;
    stateRef.current.combo = combo;
    stateRef.current.mana = mana;
    stateRef.current.shieldTime = shieldTime;
    stateRef.current.freezeTime = freezeTime;
    stateRef.current.level = level;
  }, [isPlaying, score, lives, combo, mana, shieldTime, freezeTime, level]);

  const addScore = useCallback((pts: number, text?: string, x?: number, y?: number) => {
    const currentCombo = stateRef.current.combo;
    const finalPts = pts * currentCombo;
    setScore(prev => {
      const next = prev + finalPts;
      stateRef.current.score = next;
      return next;
    });

    if (text && x !== undefined && y !== undefined) {
      stateRef.current.particles.push({
        id: Math.random(),
        x,
        y: y - 10,
        vx: (Math.random() - 0.5) * 1.5,
        vy: -2,
        radius: 12,
        color: '#38bdf8',
        alpha: 1,
        life: 0,
        maxLife: 45,
        type: 'text',
        text: `+${finalPts} ${text}`,
      });
    }
  }, []);

  const spawnParticles = (x: number, y: number, type: 'water' | 'fire' | 'steam' | 'spark' | 'bubble', count = 15) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 1.5;
      let color = '#38bdf8';
      let radius = Math.random() * 4 + 2;

      if (type === 'fire') {
        color = Math.random() > 0.4 ? '#f97316' : '#ef4444';
        radius = Math.random() * 5 + 2.5;
      } else if (type === 'steam') {
        color = '#cbd5e1';
        radius = Math.random() * 6 + 4;
      } else if (type === 'spark') {
        color = '#fbbf24';
        radius = Math.random() * 2.5 + 1;
      } else if (type === 'bubble') {
        color = '#7dd3fc';
        radius = Math.random() * 5 + 3;
      }

      stateRef.current.particles.push({
        id: Math.random(),
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (type === 'fire' || type === 'steam' ? 1.5 : 0),
        radius,
        color,
        alpha: 1,
        life: 0,
        maxLife: Math.random() * 25 + 20,
        type,
      });
    }
  };

  const triggerTsunami = () => {
    if (mana < 100) return;
    sound.playTsunamiWave();
    setMana(0);
    stateRef.current.mana = 0;
    stateRef.current.tsunamiActive = 60; // 1 second animation

    // Convert all fire bombs to water diamonds and collect them!
    const canvas = canvasRef.current;
    if (!canvas) return;

    let convertedCount = 0;
    stateRef.current.items.forEach(item => {
      if (item.type === 'fire_bomb' || item.type === 'mega_fire_bomb') {
        item.type = 'water_diamond';
        spawnParticles(item.x, item.y, 'steam', 20);
        convertedCount++;
      }
    });

    addScore(1500 + convertedCount * 300, '🌊 TSUNAMI SURGE!', canvas.width / 2, canvas.height / 2);
    setCombo(prev => Math.min(10, prev + 2));
  };

  const handleDefuseFireBomb = (item: BlitzItem) => {
    sound.playSteamHiss();
    spawnParticles(item.x, item.y, 'steam', 22);
    spawnParticles(item.x, item.y, 'water', 12);
    item.isDefused = true;
    item.isSliced = true;
    item.slicedAngle = Math.random() * Math.PI;

    setBombsDefused(b => b + 1);
    stateRef.current.bombsCount += 1;
    addScore(350, 'DOUSED!', item.x, item.y);
  };

  const handleExplodeFireBomb = (item: BlitzItem) => {
    sound.playBombExplosion();
    spawnParticles(item.x, item.y, 'fire', 35);
    spawnParticles(item.x, item.y, 'spark', 20);
    item.isSliced = true;

    // Penalty
    setCombo(1);
    stateRef.current.combo = 1;

    if (stateRef.current.shieldTime > 0) {
      // Shield absorbed
      spawnParticles(item.x, item.y, 'bubble', 25);
      addScore(100, 'SHIELDED!', item.x, item.y);
      return;
    }

    setLives(prev => {
      const next = prev - 1;
      stateRef.current.lives = next;
      if (next <= 0) {
        setIsGameOver(true);
        setIsPlaying(false);
        onUpdateStats(stateRef.current.diamondsCount, stateRef.current.bombsCount, stateRef.current.score);
      }
      return Math.max(0, next);
    });
  };

  const handleCollectWaterDiamond = (item: BlitzItem) => {
    sound.playDiamondChime(Math.min(2.2, 1 + stateRef.current.combo * 0.15));
    sound.playSplash();
    spawnParticles(item.x, item.y, 'water', 20);
    spawnParticles(item.x, item.y, 'spark', 8);

    item.isSliced = true;
    item.slicedAngle = Math.random() * Math.PI;

    setDiamondsCaught(d => d + 1);
    stateRef.current.diamondsCount += 1;

    // Check special item types
    if (item.type === 'cluster_diamond') {
      // Spawn 3 mini droplets
      for (let k = 0; k < 3; k++) {
        stateRef.current.items.push({
          id: Math.random(),
          type: 'water_diamond',
          x: item.x + (k - 1) * 20,
          y: item.y,
          vx: (k - 1) * 3 + (Math.random() - 0.5),
          vy: -3.5 - Math.random() * 2,
          rotation: 0,
          vRot: 0.1,
          radius: 18,
          size: 18,
          fuseTimer: 0,
          maxFuse: 0,
          created: Date.now(),
        });
      }
      addScore(250, '💧 TRIPLE SPLASH!', item.x, item.y);
    } else if (item.type === 'ice_diamond') {
      setFreezeTime(300); // ~5 seconds
      stateRef.current.freezeTime = 300;
      sound.playWinFanfare();
      addScore(500, '❄️ CRYO FROST!', item.x, item.y);
    } else if (item.type === 'shield_bubble') {
      setShieldTime(420); // ~7 seconds
      stateRef.current.shieldTime = 420;
      addScore(300, '🛡️ HYDRO BUBBLE!', item.x, item.y);
    } else {
      addScore(100, 'AQUA GEM', item.x, item.y);
    }

    // Increase combo & mana
    stateRef.current.comboTimer = 180; // 3 seconds window
    setCombo(prev => Math.min(15, prev + 1));
    setMana(prev => Math.min(100, prev + 6));
  };

  const startGame = () => {
    setIsGameOver(false);
    setIsPlaying(true);
    setScore(0);
    setLives(3);
    setCombo(1);
    setMana(20);
    setShieldTime(0);
    setFreezeTime(0);
    setLevel(1);
    setDiamondsCaught(0);
    setBombsDefused(0);

    stateRef.current.score = 0;
    stateRef.current.lives = 3;
    stateRef.current.combo = 1;
    stateRef.current.mana = 20;
    stateRef.current.shieldTime = 0;
    stateRef.current.freezeTime = 0;
    stateRef.current.items = [];
    stateRef.current.particles = [];
    stateRef.current.trail = [];
    stateRef.current.lastSpawnTime = Date.now();
    stateRef.current.diamondsCount = 0;
    stateRef.current.bombsCount = 0;
  };

  // Main Canvas Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const resize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      stateRef.current.catcherX = rect.width / 2;
    };

    resize();
    window.addEventListener('resize', resize);

    const render = () => {
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      // Clear with dark atmospheric gradient
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2, 50, width / 2, height / 2, width);
      bgGrad.addColorStop(0, '#091322');
      bgGrad.addColorStop(0.6, '#040914');
      bgGrad.addColorStop(1, '#020408');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Draw subtle elemental background glows
      const waterGlow = ctx.createRadialGradient(width * 0.2, height * 0.8, 10, width * 0.2, height * 0.8, 250);
      waterGlow.addColorStop(0, 'rgba(14, 165, 233, 0.12)');
      waterGlow.addColorStop(1, 'rgba(14, 165, 233, 0)');
      ctx.fillStyle = waterGlow;
      ctx.fillRect(0, 0, width, height);

      const fireGlow = ctx.createRadialGradient(width * 0.8, height * 0.8, 10, width * 0.8, height * 0.8, 250);
      fireGlow.addColorStop(0, 'rgba(249, 115, 22, 0.12)');
      fireGlow.addColorStop(1, 'rgba(249, 115, 22, 0)');
      ctx.fillStyle = fireGlow;
      ctx.fillRect(0, 0, width, height);

      // Handle Tsunami Wave effect
      if (stateRef.current.tsunamiActive > 0) {
        stateRef.current.tsunamiActive--;
        const waveProgress = 1 - stateRef.current.tsunamiActive / 60;
        const waveY = height * (1 - waveProgress);

        ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.beginPath();
        ctx.moveTo(0, height);
        for (let x = 0; x <= width; x += 15) {
          const waveAmp = Math.sin(x * 0.03 + waveProgress * 10) * 25;
          ctx.lineTo(x, waveY + waveAmp);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();

        // Wave crest highlight
        ctx.strokeStyle = '#e0f2fe';
        ctx.lineWidth = 4;
        ctx.stroke();
      }

      // Handle Freeze slow-mo
      const isFrozen = stateRef.current.freezeTime > 0;
      if (isFrozen) {
        stateRef.current.freezeTime--;
        if (stateRef.current.freezeTime % 60 === 0) {
          setFreezeTime(Math.ceil(stateRef.current.freezeTime / 60));
        }
        // Frost border overlay
        ctx.strokeStyle = 'rgba(186, 230, 253, 0.4)';
        ctx.lineWidth = 6;
        ctx.strokeRect(0, 0, width, height);
      }

      // Handle Shield Active
      const isShielded = stateRef.current.shieldTime > 0;
      if (isShielded) {
        stateRef.current.shieldTime--;
        if (stateRef.current.shieldTime % 60 === 0) {
          setShieldTime(Math.ceil(stateRef.current.shieldTime / 60));
        }
      }

      // Handle Combo Decay
      if (stateRef.current.comboTimer > 0) {
        stateRef.current.comboTimer--;
        if (stateRef.current.comboTimer === 0 && stateRef.current.combo > 1) {
          setCombo(1);
          stateRef.current.combo = 1;
        }
      }

      // SPAWN ITEMS (Arcade Scatter Dynamics)
      if (stateRef.current.isPlaying) {
        const now = Date.now();
        const spawnDelay = isFrozen ? 1600 : Math.max(450, 1100 - stateRef.current.level * 60);

        if (now - stateRef.current.lastSpawnTime > spawnDelay) {
          stateRef.current.lastSpawnTime = now;

          // Decide spawn count (1 to 3 items scattered together)
          const count = Math.random() > 0.65 ? (Math.random() > 0.85 ? 3 : 2) : 1;

          for (let i = 0; i < count; i++) {
            const spawnX = Math.random() * (width - 120) + 60;
            const targetX = width / 2 + (Math.random() - 0.5) * (width * 0.7);
            const vx = (targetX - spawnX) * 0.012 + (Math.random() - 0.5) * 1.5;
            const vy = -(Math.random() * 4 + 11.5); // Shoot upwards

            // Random item type: Water Diamonds (Diamond is Water) vs Fire Bombs (Bomb is Fire)
            const rand = Math.random();
            let type: BlitzItem['type'] = 'water_diamond';
            let radius = 26;
            let maxFuse = 0;

            if (rand < 0.35) {
              type = 'fire_bomb';
              radius = 28;
              maxFuse = 320; // ~5.3 seconds
            } else if (rand < 0.42) {
              type = 'mega_fire_bomb';
              radius = 36;
              maxFuse = 380;
            } else if (rand < 0.72) {
              type = 'water_diamond';
              radius = 26;
            } else if (rand < 0.84) {
              type = 'cluster_diamond';
              radius = 30;
            } else if (rand < 0.93) {
              type = 'ice_diamond';
              radius = 26;
            } else {
              type = 'shield_bubble';
              radius = 28;
            }

            stateRef.current.items.push({
              id: Math.random(),
              type,
              x: spawnX,
              y: height + 20,
              vx: isFrozen ? vx * 0.5 : vx,
              vy: isFrozen ? vy * 0.5 : vy,
              rotation: Math.random() * Math.PI * 2,
              vRot: (Math.random() - 0.5) * 0.08,
              radius,
              size: radius,
              fuseTimer: maxFuse,
              maxFuse,
              hp: type === 'mega_fire_bomb' ? 2 : 1,
              created: now,
            });
          }
        }
      }

      // UPDATE & DRAW ITEMS
      const gravity = isFrozen ? 0.12 : 0.28;
      const itemsToKeep: BlitzItem[] = [];

      for (const item of stateRef.current.items) {
        if (item.isSliced) {
          // Animate slicing separation
          item.slicedProgress = (item.slicedProgress || 0) + 0.08;
          if (item.slicedProgress < 1) {
            itemsToKeep.push(item);
          }
          // Sliced halves drawing
          ctx.save();
          ctx.translate(item.x, item.y);
          ctx.rotate(item.slicedAngle || 0);

          const offset = item.slicedProgress * 25;

          // Half 1
          ctx.save();
          ctx.translate(-offset, -offset);
          drawItemGraphic(ctx, item, 0.5);
          ctx.restore();

          // Half 2
          ctx.save();
          ctx.translate(offset, offset);
          drawItemGraphic(ctx, item, 0.5);
          ctx.restore();

          ctx.restore();
          continue;
        }

        // Apply velocities
        item.x += item.vx;
        item.y += item.vy;
        item.vy += gravity;
        item.rotation += item.vRot;

        // Bounce on walls
        if (item.x < item.radius) {
          item.x = item.radius;
          item.vx = -item.vx * 0.7;
        } else if (item.x > width - item.radius) {
          item.x = width - item.radius;
          item.vx = -item.vx * 0.7;
        }

        // Bomb fuse countdown
        if (item.type === 'fire_bomb' || item.type === 'mega_fire_bomb') {
          item.fuseTimer--;
          // Emit fire sparks from fuse
          if (Math.random() > 0.4) {
            spawnParticles(item.x, item.y - item.radius * 0.8, 'spark', 1);
          }
          if (item.fuseTimer <= 0) {
            handleExplodeFireBomb(item);
            continue;
          }
        } else {
          // Emit floating water droplet trail from water diamonds
          if (Math.random() > 0.7) {
            spawnParticles(item.x, item.y, 'water', 1);
          }
        }

        // CATCHER VESSEL MODE CHECK
        if (controlStyle === 'catch' && stateRef.current.isPlaying) {
          const catcherX = stateRef.current.catcherX;
          const catcherY = height - 40;
          const distCatcher = Math.hypot(item.x - catcherX, item.y - catcherY);

          if (distCatcher < item.radius + 35 && item.vy > 0) {
            if (item.type.includes('water') || item.type === 'shield_bubble') {
              handleCollectWaterDiamond(item);
              continue;
            } else if (item.type.includes('fire')) {
              if (isShielded) {
                handleDefuseFireBomb(item);
              } else {
                handleExplodeFireBomb(item);
              }
              continue;
            }
          }
        }

        // Check if item fell off screen
        if (item.y > height + 80 && item.vy > 0) {
          // If a water diamond fell without being collected, break combo
          if (item.type === 'water_diamond' && stateRef.current.isPlaying) {
            if (stateRef.current.combo > 1) {
              setCombo(1);
              stateRef.current.combo = 1;
            }
          }
          continue; // Remove
        }

        // Draw item
        ctx.save();
        ctx.translate(item.x, item.y);
        ctx.rotate(item.rotation);
        drawItemGraphic(ctx, item, 1);
        ctx.restore();

        itemsToKeep.push(item);
      }
      stateRef.current.items = itemsToKeep;

      // DRAW CATCHER (If Catch Mode)
      if (controlStyle === 'catch') {
        const cX = stateRef.current.catcherX;
        const cY = height - 35;

        // Catcher Vessel Glow
        ctx.save();
        const bowlGlow = ctx.createRadialGradient(cX, cY, 10, cX, cY, 60);
        bowlGlow.addColorStop(0, isShielded ? 'rgba(56, 189, 248, 0.8)' : 'rgba(14, 165, 233, 0.6)');
        bowlGlow.addColorStop(1, 'rgba(14, 165, 233, 0)');
        ctx.fillStyle = bowlGlow;
        ctx.beginPath();
        ctx.arc(cX, cY, 55, 0, Math.PI * 2);
        ctx.fill();

        // Hydro Vessel Basin
        ctx.strokeStyle = isShielded ? '#38bdf8' : '#0284c7';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(cX, cY - 10, 45, 0.1 * Math.PI, 0.9 * Math.PI, false);
        ctx.stroke();

        // Liquid inside vessel
        ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
        ctx.beginPath();
        ctx.arc(cX, cY - 10, 42, 0.15 * Math.PI, 0.85 * Math.PI, false);
        ctx.fill();

        ctx.restore();
      }

      // DRAW PARTICLES
      const particlesToKeep: Particle[] = [];
      for (const p of stateRef.current.particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;
        p.alpha = 1 - p.life / p.maxLife;

        if (p.life < p.maxLife) {
          ctx.save();
          if (p.type === 'text') {
            ctx.font = 'bold 16px sans-serif';
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.shadowColor = '#0284c7';
            ctx.shadowBlur = 8;
            ctx.fillText(p.text || '', p.x, p.y);
          } else {
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius * (1 - p.life / p.maxLife * 0.4), 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
          particlesToKeep.push(p);
        }
      }
      stateRef.current.particles = particlesToKeep;

      // DRAW WATER BLADE SLASH TRAIL (Slash Mode)
      if (stateRef.current.trail.length > 1) {
        const now = Date.now();
        stateRef.current.trail = stateRef.current.trail.filter(pt => now - pt.time < 180);

        ctx.save();
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (let i = 1; i < stateRef.current.trail.length; i++) {
          const pt1 = stateRef.current.trail[i - 1];
          const pt2 = stateRef.current.trail[i];
          const age = (now - pt2.time) / 180;
          const thickness = (1 - age) * 14;

          ctx.strokeStyle = isShielded ? '#38bdf8' : '#7dd3fc';
          ctx.shadowColor = '#0284c7';
          ctx.shadowBlur = 12;
          ctx.lineWidth = Math.max(1, thickness);
          ctx.beginPath();
          ctx.moveTo(pt1.x, pt1.y);
          ctx.lineTo(pt2.x, pt2.y);
          ctx.stroke();

          // Inner white core
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = Math.max(1, thickness * 0.4);
          ctx.stroke();
        }
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animId);
    };
  }, [controlStyle]);

  // Helper to render high quality graphics for Water Diamonds and Fire Bombs
  const drawItemGraphic = (ctx: CanvasRenderingContext2D, item: BlitzItem, scale = 1) => {
    const r = item.radius * scale;

    if (item.type === 'water_diamond' || item.type === 'cluster_diamond' || item.type === 'ice_diamond') {
      // 💎 WATER DIAMOND GRAPHIC (Water = Diamond)
      ctx.shadowColor = item.type === 'ice_diamond' ? '#bae6fd' : '#0284c7';
      ctx.shadowBlur = 18;

      // Multifaceted Diamond Path
      const top = -r * 1.15;
      const bottom = r * 1.25;
      const left = -r;
      const right = r;
      const midY = -r * 0.2;

      // Outer diamond silhouette
      ctx.beginPath();
      ctx.moveTo(0, top);
      ctx.lineTo(right * 0.7, top + r * 0.35);
      ctx.lineTo(right, midY);
      ctx.lineTo(0, bottom);
      ctx.lineTo(left, midY);
      ctx.lineTo(left * 0.7, top + r * 0.35);
      ctx.closePath();

      // Liquid Aqua Gradient
      const grad = ctx.createLinearGradient(0, top, 0, bottom);
      if (item.type === 'ice_diamond') {
        grad.addColorStop(0, '#f0f9ff');
        grad.addColorStop(0.4, '#7dd3fc');
        grad.addColorStop(1, '#0284c7');
      } else if (item.type === 'cluster_diamond') {
        grad.addColorStop(0, '#e0f2fe');
        grad.addColorStop(0.5, '#38bdf8');
        grad.addColorStop(1, '#0369a1');
      } else {
        grad.addColorStop(0, '#bae6fd');
        grad.addColorStop(0.3, '#38bdf8');
        grad.addColorStop(0.8, '#0284c7');
        grad.addColorStop(1, '#075985');
      }
      ctx.fillStyle = grad;
      ctx.fill();

      // Facet Lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Table & Facets
      ctx.beginPath();
      ctx.moveTo(left * 0.7, top + r * 0.35);
      ctx.lineTo(right * 0.7, top + r * 0.35);
      ctx.lineTo(0, midY);
      ctx.closePath();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.fill();
      ctx.stroke();

      // Lower facet lines down to point
      ctx.beginPath();
      ctx.moveTo(0, midY);
      ctx.lineTo(0, bottom);
      ctx.moveTo(left, midY);
      ctx.lineTo(0, midY);
      ctx.moveTo(right, midY);
      ctx.lineTo(0, midY);
      ctx.stroke();

      // Sparkling Gleam
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(left * 0.4, top + r * 0.5, 3, 0, Math.PI * 2);
      ctx.fill();

      // Label icon indicator
      if (item.type === 'cluster_diamond') {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('3x', -7, 4);
      } else if (item.type === 'ice_diamond') {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.fillText('❄', -5, 4);
      }
    } else if (item.type === 'fire_bomb' || item.type === 'mega_fire_bomb') {
      // 💣 FIRE BOMB GRAPHIC (Bomb = Fire)
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 20;

      // Bomb Body
      const bombGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 2, 0, 0, r);
      bombGrad.addColorStop(0, '#f97316');
      bombGrad.addColorStop(0.3, '#dc2626');
      bombGrad.addColorStop(0.75, '#7f1d1d');
      bombGrad.addColorStop(1, '#1c1917');

      ctx.fillStyle = bombGrad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      // Fiery Magma Veins
      ctx.strokeStyle = '#fbbf24';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-r * 0.5, -r * 0.2);
      ctx.lineTo(-r * 0.1, r * 0.4);
      ctx.lineTo(r * 0.4, -r * 0.3);
      ctx.stroke();

      // Bomb Cap & Fuse
      ctx.fillStyle = '#44403c';
      ctx.fillRect(-r * 0.25, -r * 1.15, r * 0.5, r * 0.3);

      // Fuse Arc
      ctx.strokeStyle = '#ca8a04';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, -r * 1.2, r * 0.4, 0, Math.PI, true);
      ctx.stroke();

      // Blazing Fire Spark at tip of fuse
      const sparkX = r * 0.4;
      const sparkY = -r * 1.2;
      const flameGrad = ctx.createRadialGradient(sparkX, sparkY, 1, sparkX, sparkY, 12);
      flameGrad.addColorStop(0, '#ffffff');
      flameGrad.addColorStop(0.3, '#fde047');
      flameGrad.addColorStop(0.7, '#f97316');
      flameGrad.addColorStop(1, 'rgba(239, 68, 68, 0)');

      ctx.fillStyle = flameGrad;
      ctx.beginPath();
      ctx.arc(sparkX, sparkY, 12, 0, Math.PI * 2);
      ctx.fill();

      // Mega Bomb indicator
      if (item.type === 'mega_fire_bomb') {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText('🔥', -8, 4);
      }
    } else if (item.type === 'shield_bubble') {
      // 🛡️ HYDRO SHIELD BUBBLE
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 16;

      const bubbleGrad = ctx.createRadialGradient(-r * 0.3, -r * 0.3, 3, 0, 0, r);
      bubbleGrad.addColorStop(0, 'rgba(224, 242, 254, 0.9)');
      bubbleGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.6)');
      bubbleGrad.addColorStop(1, 'rgba(2, 132, 199, 0.8)');

      ctx.fillStyle = bubbleGrad;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#bae6fd';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText('🛡️', -8, 5);
    }
  };

  // INTERACTION HANDLERS: Slash, Catch & Click
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.x;
    const y = e.clientY - rect.y;

    stateRef.current.isPointerDown = true;
    stateRef.current.lastPointerX = x;
    stateRef.current.lastPointerY = y;
    stateRef.current.trail = [{ x, y, time: Date.now() }];

    if (controlStyle === 'catch') {
      stateRef.current.catcherX = x;
    }

    if (controlStyle === 'click' && stateRef.current.isPlaying) {
      // Direct click burst
      checkHitAtPoint(x, y, 35);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.x;
    const y = e.clientY - rect.y;

    if (controlStyle === 'catch') {
      stateRef.current.catcherX = x;
    }

    if (stateRef.current.isPointerDown && controlStyle === 'slash') {
      stateRef.current.trail.push({ x, y, time: Date.now() });

      // Check line intersection between last and current pointer
      checkSliceBetween(stateRef.current.lastPointerX, stateRef.current.lastPointerY, x, y);
    }

    stateRef.current.lastPointerX = x;
    stateRef.current.lastPointerY = y;
  };

  const handlePointerUp = () => {
    stateRef.current.isPointerDown = false;
  };

  // Slice collision detection
  const checkSliceBetween = (x1: number, y1: number, x2: number, y2: number) => {
    if (!stateRef.current.isPlaying) return;

    for (const item of stateRef.current.items) {
      if (item.isSliced) continue;

      // Distance from point (item.x, item.y) to segment (x1, y1)-(x2, y2)
      const l2 = (x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1);
      let dist = 9999;
      if (l2 === 0) {
        dist = Math.hypot(item.x - x1, item.y - y1);
      } else {
        const t = Math.max(0, Math.min(1, ((item.x - x1) * (x2 - x1) + (item.y - y1) * (y2 - y1)) / l2));
        const projX = x1 + t * (x2 - x1);
        const projY = y1 + t * (y2 - y1);
        dist = Math.hypot(item.x - projX, item.y - projY);
      }

      if (dist < item.radius + 14) {
        if (item.type.includes('water') || item.type === 'shield_bubble') {
          handleCollectWaterDiamond(item);
        } else if (item.type.includes('fire')) {
          if (stateRef.current.shieldTime > 0) {
            handleDefuseFireBomb(item);
          } else {
            handleExplodeFireBomb(item);
          }
        }
      }
    }
  };

  // Point click detection
  const checkHitAtPoint = (x: number, y: number, hitRadius: number) => {
    for (const item of stateRef.current.items) {
      if (item.isSliced) continue;
      const dist = Math.hypot(item.x - x, item.y - y);
      if (dist < item.radius + hitRadius) {
        if (item.type.includes('water') || item.type === 'shield_bubble') {
          handleCollectWaterDiamond(item);
        } else if (item.type.includes('fire')) {
          if (stateRef.current.shieldTime > 0) {
            handleDefuseFireBomb(item);
          } else {
            handleExplodeFireBomb(item);
          }
        }
      }
    }
  };

  return (
    <div id="blitz-mode-container" className="flex flex-col items-center w-full max-w-5xl mx-auto">
      {/* Top HUD */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
        {/* Score & High Score */}
        <div className="bg-white border-3 border-amber-300 rounded-2xl p-3 shadow-[4px_4px_0px_0px_#fde68a] flex flex-col justify-between">
          <span className="text-xs font-bold text-amber-900/70 uppercase tracking-wider">Score</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-2xl font-black text-sky-600 tracking-tight">{score.toLocaleString()}</span>
            <span className="text-xs font-bold text-slate-500">Best: {highScore.toLocaleString()}</span>
          </div>
        </div>

        {/* Multiplier & Combo */}
        <div className="bg-white border-3 border-amber-300 rounded-2xl p-3 shadow-[4px_4px_0px_0px_#fde68a] flex flex-col justify-between">
          <span className="text-xs font-bold text-amber-900/70 uppercase tracking-wider">Combo Multiplier</span>
          <div className="flex items-center justify-between mt-1">
            <span className={`text-2xl font-black ${combo > 1 ? 'text-orange-500 animate-pulse' : 'text-slate-700'}`}>
              {combo}x
            </span>
            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-300">
              💎 {diamondsCaught}
            </span>
          </div>
        </div>

        {/* Health / Lives */}
        <div className="bg-white border-3 border-amber-300 rounded-2xl p-3 shadow-[4px_4px_0px_0px_#fde68a] flex flex-col justify-between">
          <span className="text-xs font-bold text-amber-900/70 uppercase tracking-wider">Hull Integrity</span>
          <div className="flex items-center gap-1.5 mt-1">
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className={`h-7 flex-1 rounded-xl transition-all duration-300 flex items-center justify-center text-xs font-black ${
                  i <= lives
                    ? 'bg-sky-500 text-white shadow-[2px_2px_0px_0px_#0284c7] border border-sky-600'
                    : 'bg-amber-100/60 border-2 border-amber-200 text-amber-300'
                }`}
              >
                {i <= lives ? '💧' : '✕'}
              </div>
            ))}
          </div>
        </div>

        {/* Tsunami Surge Meter */}
        <div className="bg-white border-3 border-amber-300 rounded-2xl p-3 shadow-[4px_4px_0px_0px_#fde68a] flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-amber-900/70 uppercase tracking-wider">Hydro Surge</span>
            <span className="text-xs font-black text-sky-600">{mana}%</span>
          </div>
          <div className="w-full bg-amber-100 rounded-full h-3.5 mt-2 overflow-hidden border-2 border-amber-300">
            <div
              className="h-full bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 rounded-full transition-all duration-200"
              style={{ width: `${mana}%` }}
            />
          </div>
        </div>
      </div>

      {/* Control Switcher & Powerups Bar */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 mb-3 bg-amber-100/90 p-2.5 rounded-2xl border-2 border-amber-300 shadow-[3px_3px_0px_0px_#fde68a]">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-amber-900/80 mr-1 hidden sm:inline">Control:</span>
          <button
            id="btn-control-slash"
            onClick={() => {
              sound.playClick();
              setControlStyle('slash');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              controlStyle === 'slash'
                ? 'bg-orange-500 text-white shadow-[2px_2px_0px_0px_#c2410c] border border-orange-600'
                : 'bg-white text-slate-700 hover:bg-amber-50 border border-amber-200'
            }`}
          >
            ⚔️ Hydro Blade
          </button>
          <button
            id="btn-control-catch"
            onClick={() => {
              sound.playClick();
              setControlStyle('catch');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              controlStyle === 'catch'
                ? 'bg-sky-500 text-white shadow-[2px_2px_0px_0px_#0284c7] border border-sky-600'
                : 'bg-white text-slate-700 hover:bg-amber-50 border border-amber-200'
            }`}
          >
            🌊 Water Vessel
          </button>
          <button
            id="btn-control-click"
            onClick={() => {
              sound.playClick();
              setControlStyle('click');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              controlStyle === 'click'
                ? 'bg-red-500 text-white shadow-[2px_2px_0px_0px_#b91c1c] border border-red-600'
                : 'bg-white text-slate-700 hover:bg-amber-50 border border-amber-200'
            }`}
          >
            🎯 Tap Blast
          </button>
        </div>

        {/* Active Buffs & Tsunami Trigger */}
        <div className="flex items-center gap-2">
          {shieldTime > 0 && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-sky-100 border-2 border-sky-400 text-sky-800 text-xs font-black animate-pulse shadow-[2px_2px_0px_0px_#bae6fd]">
              🛡️ Shield {Math.ceil(shieldTime / 60)}s
            </span>
          )}
          {freezeTime > 0 && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-blue-100 border-2 border-blue-400 text-blue-800 text-xs font-black animate-pulse shadow-[2px_2px_0px_0px_#bfdbfe]">
              ❄️ Frost {Math.ceil(freezeTime / 60)}s
            </span>
          )}
          <button
            id="btn-trigger-tsunami"
            disabled={mana < 100}
            onClick={triggerTsunami}
            className={`px-4 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              mana >= 100
                ? 'bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 text-white shadow-[3px_3px_0px_0px_#0284c7] border border-sky-600 animate-bounce cursor-pointer'
                : 'bg-amber-200/60 text-amber-800/40 border border-amber-300 cursor-not-allowed'
            }`}
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            TSUNAMI BLAST
          </button>
        </div>
      </div>

      {/* Main Game Canvas Stage */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] max-h-[560px] rounded-3xl overflow-hidden border-4 border-amber-300 shadow-[8px_8px_0px_0px_#fde68a] bg-slate-950">
        <canvas
          ref={canvasRef}
          id="blitz-game-canvas"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className="w-full h-full block cursor-crosshair touch-none select-none"
        />

        {/* Start / Game Over Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
            {isGameOver ? (
              <div className="animate-in fade-in zoom-in duration-300 flex flex-col items-center bg-white border-4 border-red-400 p-6 sm:p-8 rounded-3xl shadow-[8px_8px_0px_0px_#fca5a5] max-w-md w-full">
                <div className="w-16 h-16 rounded-2xl bg-red-100 border-2 border-red-400 flex items-center justify-center text-3xl mb-3 shadow-[2px_2px_0px_0px_#f87171]">
                  🔥
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-1 tracking-tight font-display">
                  Overheated by Fire Bombs!
                </h3>
                <p className="text-slate-600 text-sm mb-4">
                  Fire consumed the arena. Water diamonds saved: <strong className="text-sky-600 font-bold">{diamondsCaught}</strong>.
                </p>
                <div className="flex items-center justify-center gap-6 bg-amber-50 border-2 border-amber-300 px-6 py-3 rounded-2xl mb-6 w-full shadow-[2px_2px_0px_0px_#fde68a]">
                  <div>
                    <span className="block text-xs font-bold text-amber-900/60">FINAL SCORE</span>
                    <span className="text-2xl font-black text-sky-600">{score.toLocaleString()}</span>
                  </div>
                  <div className="w-px h-8 bg-amber-200" />
                  <div>
                    <span className="block text-xs font-bold text-amber-900/60">BOMBS DOUSED</span>
                    <span className="text-xl font-black text-orange-500">{bombsDefused}</span>
                  </div>
                </div>
                <button
                  id="btn-play-again"
                  onClick={() => {
                    sound.playClick();
                    startGame();
                  }}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-400 text-white font-black text-base shadow-[4px_4px_0px_0px_#c2410c] border-2 border-orange-600 transition-transform transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  Play Again
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center max-w-md bg-white border-4 border-amber-300 p-6 sm:p-8 rounded-3xl shadow-[8px_8px_0px_0px_#fde68a] w-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-14 h-14 rounded-2xl bg-sky-100 border-2 border-sky-400 flex items-center justify-center text-3xl shadow-[3px_3px_0px_0px_#7dd3fc]">
                    💎
                  </div>
                  <span className="text-2xl font-black text-amber-500">VS</span>
                  <div className="w-14 h-14 rounded-2xl bg-orange-100 border-2 border-orange-400 flex items-center justify-center text-3xl shadow-[3px_3px_0px_0px_#fdba74]">
                    💣
                  </div>
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 tracking-tight font-display">
                  Elemental Scatter Arena
                </h3>
                <p className="text-slate-600 text-sm mb-6 leading-relaxed">
                  <strong className="text-sky-600">The Diamond is Water</strong> (collect & slice for combos).<br />
                  <strong className="text-orange-600">The Bomb is Fire</strong> (avoid or extinguish with water shields & tsunamis).
                </p>

                <button
                  id="btn-start-blitz"
                  onClick={() => {
                    sound.playClick();
                    startGame();
                  }}
                  className="w-full px-8 py-3.5 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-sky-500 hover:opacity-95 text-white font-black text-base shadow-[4px_4px_0px_0px_#c2410c] border-2 border-orange-600 transition-transform transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Launch Scatter Blitz
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Legend & Tips */}
      <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-3 text-xs text-slate-700">
        <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white border-2 border-sky-300 shadow-[2px_2px_0px_0px_#bae6fd]">
          <span className="text-xl">💎</span>
          <div>
            <span className="font-black text-sky-700 block">Water Diamond</span>
            <span className="text-[11px] font-medium text-slate-600">+100 Pts, Charges Mana</span>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white border-2 border-orange-300 shadow-[2px_2px_0px_0px_#fed7aa]">
          <span className="text-xl">💣</span>
          <div>
            <span className="font-black text-orange-600 block">Fire Bomb</span>
            <span className="text-[11px] font-medium text-slate-600">Explodes on impact!</span>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white border-2 border-cyan-300 shadow-[2px_2px_0px_0px_#a5f3fc]">
          <span className="text-xl">💧</span>
          <div>
            <span className="font-black text-cyan-700 block">Cluster Drop</span>
            <span className="text-[11px] font-medium text-slate-600">Splits into 3 Water Gems</span>
          </div>
        </div>
        <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white border-2 border-indigo-300 shadow-[2px_2px_0px_0px_#c7d2fe]">
          <span className="text-xl">🛡️</span>
          <div>
            <span className="font-black text-indigo-700 block">Hydro Shield</span>
            <span className="text-[11px] font-medium text-slate-600">Douses Fire Bombs safely</span>
          </div>
        </div>
      </div>
    </div>
  );
};
