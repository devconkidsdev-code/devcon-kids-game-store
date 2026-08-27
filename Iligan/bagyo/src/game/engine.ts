import { Difficulty, DexterPlayer, GameState, KeyControls, LevelConfig, Particle, HighScoreRecord } from '../types';
import { LEVEL_CONFIGS } from './levels';
import { updatePhysics } from './physics';
import { GameRenderer } from './renderer';
import { soundManager } from '../audio/soundManager';
import confetti from 'canvas-confetti';

export interface GameStats {
  score: number;
  timeLeft: number;
  timeElapsed: number;
  waterLevel: number;
  suppliesCollected: number;
  totalSupplies: number;
  dangerDistance: number; // distance between player and water level
  oxygen: number;
  stamina: number;
  lives: number; // Max 5 lives
  maxLives: number;
  gameOverReason: string;
  rating: 'S' | 'A' | 'B' | 'C' | 'D';
}

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private renderer: GameRenderer;
  public state: GameState = 'MENU';
  public difficulty: Difficulty = 'SIGNAL_1';
  public level: LevelConfig;
  public player: DexterPlayer;
  public waterLevel: number;
  public timeLeft: number = 60.0;
  public timeElapsed: number = 0;
  public score: number = 0;
  public gameOverReason: string = '';
  
  private particles: Particle[] = [];
  private keys: KeyControls = { up: false, down: false, left: false, right: false, sprint: false };
  private animId: number | null = null;
  private lastTime: number = 0;
  private nextThunderTimer: number = 6;
  private urgentSirenTimer: number = 0;

  // Callback to sync React HUD
  public onUpdateUI?: (stats: GameStats, state: GameState) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.renderer = new GameRenderer(canvas);
    this.level = JSON.parse(JSON.stringify(LEVEL_CONFIGS.SIGNAL_1));
    this.waterLevel = this.level.worldHeight - 40;
    this.player = this.createDefaultPlayer();
  }

  private createDefaultPlayer(): DexterPlayer {
    return {
      x: this.level.spawnX,
      y: this.level.spawnY,
      width: 32,
      height: 48,
      vx: 0,
      vy: 0,
      isGrounded: false,
      isClimbing: false,
      isSwimming: false,
      isSubmerged: false,
      isSprinting: false,
      facing: 'right',
      oxygen: 100,
      stamina: 100,
      lives: 5,
      maxLives: 5,
      isElectrocuted: false,
      electrocutedTimer: 0,
      hasLifeVest: false,
      hasFlashlight: false,
      hasRope: false,
      animationFrame: 0,
      animationTimer: 0,
      isInvulnerable: false,
      invulnerableTimer: 0,
    };
  }

  public setDifficulty(diff: Difficulty) {
    this.difficulty = diff;
    this.resetGame();
  }

  public resetGame() {
    this.level = JSON.parse(JSON.stringify(LEVEL_CONFIGS[this.difficulty]));
    this.waterLevel = this.level.worldHeight - 60;
    this.player = this.createDefaultPlayer();
    this.timeLeft = this.level.timeLimit;
    this.timeElapsed = 0;
    this.score = 0;
    this.particles = [];
    this.gameOverReason = '';
    this.renderer.floatingTexts = [];
    this.renderer.cameraY = this.player.y - this.canvas.height * 0.6;
    this.renderer.cameraX = this.player.x - this.canvas.width * 0.5;
    this.state = 'PLAYING';

    soundManager.startRainAmbience(this.level.weatherTheme.windForce);
  }

  public startGame() {
    this.resetGame();
    this.startLoop();
  }

  public pauseGame() {
    if (this.state === 'PLAYING') {
      this.state = 'PAUSED';
      soundManager.stopRainAmbience();
      this.syncUI();
    }
  }

  public resumeGame() {
    if (this.state === 'PAUSED') {
      this.state = 'PLAYING';
      this.lastTime = performance.now();
      soundManager.startRainAmbience(this.level.weatherTheme.windForce);
      this.syncUI();
    }
  }

  public handleKeyDown(code: string) {
    // WASD and Arrow Keys & Space & Shift
    if (code === 'KeyW' || code === 'ArrowUp' || code === 'Space') {
      this.keys.up = true;
    }
    if (code === 'KeyS' || code === 'ArrowDown') {
      this.keys.down = true;
    }
    if (code === 'KeyA' || code === 'ArrowLeft') {
      this.keys.left = true;
    }
    if (code === 'KeyD' || code === 'ArrowRight') {
      this.keys.right = true;
    }
    if (code === 'ShiftLeft' || code === 'ShiftRight' || code === 'KeyE') {
      this.keys.sprint = true;
    }
  }

  public handleKeyUp(code: string) {
    if (code === 'KeyW' || code === 'ArrowUp' || code === 'Space') {
      this.keys.up = false;
    }
    if (code === 'KeyS' || code === 'ArrowDown') {
      this.keys.down = false;
    }
    if (code === 'KeyA' || code === 'ArrowLeft') {
      this.keys.left = false;
    }
    if (code === 'KeyD' || code === 'ArrowRight') {
      this.keys.right = false;
    }
    if (code === 'ShiftLeft' || code === 'ShiftRight' || code === 'KeyE') {
      this.keys.sprint = false;
    }
  }

  public setVirtualKey(key: keyof KeyControls, value: boolean) {
    this.keys[key] = value;
  }

  public startLoop() {
    if (this.animId !== null) {
      cancelAnimationFrame(this.animId);
    }
    this.lastTime = performance.now();
    const loop = (now: number) => {
      const delta = Math.min((now - this.lastTime) / 1000, 0.05); // cap at 50ms delta
      this.lastTime = now;

      if (this.state === 'PLAYING') {
        this.update(delta);
      }

      this.render(delta);
      this.syncUI();

      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  public stopLoop() {
    if (this.animId !== null) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
    soundManager.stopRainAmbience();
  }

  private update(delta: number) {
    this.timeElapsed += delta;
    this.timeLeft = Math.max(0, this.timeLeft - delta);

    // 1. Water Rises smoothly over the 60 seconds
    const totalHeightToRise = this.level.worldHeight - 240;
    // Water level reaches the boat dock right around 60s
    this.waterLevel = Math.max(220, (this.level.worldHeight - 40) - (this.timeElapsed / 60.0) * totalHeightToRise);

    // 2. Urgent siren beeps in final 10 seconds
    if (this.timeLeft <= 10.0 && this.timeLeft > 0) {
      this.urgentSirenTimer -= delta;
      if (this.urgentSirenTimer <= 0) {
        soundManager.playUrgentBeep();
        this.renderer.triggerShake(5);
        this.urgentSirenTimer = 1.0; // beep every second
      }
    }

    // 3. Thunder & Lightning generation
    this.nextThunderTimer -= delta;
    if (this.nextThunderTimer <= 0) {
      soundManager.playThunder();
      this.renderer.triggerLightning();
      this.nextThunderTimer = 5 + Math.random() * 8;
    }

    // 4. Spawn Rain Particles
    const rainToSpawn = Math.floor(this.level.weatherTheme.rainDensity * delta * 25);
    const viewTop = this.renderer.cameraY;
    const viewBottom = this.renderer.cameraY + this.canvas.height;
    const viewLeft = this.renderer.cameraX - 100;
    const viewRight = this.renderer.cameraX + this.canvas.width + 100;

    for (let i = 0; i < rainToSpawn; i++) {
      this.particles.push({
        x: viewLeft + Math.random() * (viewRight - viewLeft),
        y: viewTop - 10 + Math.random() * 20,
        vx: this.level.weatherTheme.windForce * 6 + (Math.random() - 0.5) * 2,
        vy: 18 + Math.random() * 10,
        size: Math.random() * 2 + 1,
        color: '#93c5fd',
        alpha: 0.5 + Math.random() * 0.4,
        life: 0,
        maxLife: 1.2,
        type: 'RAIN',
      });
    }

    // 5. Update Particles
    this.particles = this.particles.filter(p => {
      p.life += delta;
      p.x += p.vx;
      p.y += p.vy;

      // Splash on water surface
      if (p.type === 'RAIN' && p.y >= this.waterLevel && p.y <= this.waterLevel + 15) {
        if (Math.random() < 0.2) {
          p.type = 'SPLASH';
          p.vy = -Math.random() * 3;
          p.vx = (Math.random() - 0.5) * 4;
          p.maxLife = 0.25;
          p.life = 0;
          return true;
        }
        return false;
      }

      return p.life < p.maxLife && p.y <= viewBottom + 50;
    });

    // 6. Update Physics & Player Kinematics
    const physicsResult = updatePhysics(
      this.player,
      this.keys,
      this.waterLevel,
      this.level.platforms,
      this.level.ladders,
      this.level.supplies,
      this.level.hazards,
      this.level.boat,
      this.level.weatherTheme.windForce,
      delta
    );

    // Append newly generated particles
    if (physicsResult.spawnParticles.length > 0) {
      this.particles.push(...physicsResult.spawnParticles);
    }

    // Handle Item Pickup
    if (physicsResult.collectedItem) {
      this.score += physicsResult.collectedItem.points;
      if (physicsResult.collectedItem.type === 'FIRST_AID') {
        this.renderer.addFloatingText(
          `+1 LIFE ❤️ (${this.player.lives}/5)`,
          this.player.x + 16,
          this.player.y - 14,
          '#10b981'
        );
      } else {
        this.renderer.addFloatingText(
          `+${physicsResult.collectedItem.points} ${physicsResult.collectedItem.name}!`,
          this.player.x + 16,
          this.player.y - 12,
          physicsResult.collectedItem.color
        );
      }
    }

    // Handle Hazard Hit & Electrocution
    if (physicsResult.electrocuted) {
      soundManager.playElectricShock();
      this.renderer.triggerShake(20);
      this.renderer.addFloatingText(
        `-1 LIFE ⚡ (${this.player.lives}/5)`,
        this.player.x + 16,
        this.player.y - 16,
        '#ef4444'
      );

      if (this.player.lives <= 0) {
        this.triggerGameOver('Dexter ran out of lives after suffering high-voltage electrocution!');
        return;
      }
    } else if (physicsResult.hitHazard) {
      this.renderer.triggerShake(14);
      this.renderer.addFloatingText('HAZARD HIT!', this.player.x + 16, this.player.y - 14, '#f59e0b');
    }

    // 7. Check Game Over / Victory Conditions
    if (physicsResult.reachedBoat) {
      this.triggerVictory();
      return;
    }

    if (physicsResult.drowned) {
      this.triggerGameOver('Dexter ran out of oxygen underwater!');
      return;
    }

    if (this.timeLeft <= 0) {
      // 1 minute expired
      this.triggerGameOver('Time limit expired! The flood engulfed the escape route.');
      return;
    }

    // If water rises 400px above Dexter and oxygen drops
    if (this.player.y > this.waterLevel + 350) {
      this.triggerGameOver('The raging flood surge swept Dexter away!');
      return;
    }
  }

  private triggerVictory() {
    this.state = 'VICTORY';
    soundManager.stopRainAmbience();
    soundManager.playBoatHorn();

    // Bonus score calculation
    const timeBonus = Math.floor(this.timeLeft * 50);
    const collectedCount = this.level.supplies.filter(s => s.collected).length;
    const totalCount = this.level.supplies.length;
    const supplyBonus = collectedCount * 300;
    const perfectionMultiplier = (collectedCount === totalCount) ? 1.5 : 1.0;

    this.score = Math.floor((this.score + timeBonus + supplyBonus) * perfectionMultiplier);

    // Confetti explosion
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#facc15', '#38bdf8', '#34d399', '#f87171', '#fb923c']
    });

    this.saveHighScore();
    this.syncUI();
  }

  private triggerGameOver(reason: string) {
    this.state = 'GAMEOVER';
    this.gameOverReason = reason;
    soundManager.stopRainAmbience();
    soundManager.playGameOver();
    this.syncUI();
  }

  private getSurvivalRating(): 'S' | 'A' | 'B' | 'C' | 'D' {
    const collected = this.level.supplies.filter(s => s.collected).length;
    const total = this.level.supplies.length;
    const ratio = collected / total;

    if (ratio >= 0.9 && this.timeLeft >= 15) return 'S';
    if (ratio >= 0.7 && this.timeLeft >= 8) return 'A';
    if (ratio >= 0.5) return 'B';
    if (ratio >= 0.3) return 'C';
    return 'D';
  }

  private saveHighScore() {
    try {
      const recordsKey = 'bagyo_high_scores';
      const existing: HighScoreRecord[] = JSON.parse(localStorage.getItem(recordsKey) || '[]');
      const newRecord: HighScoreRecord = {
        id: Math.random().toString(36).substring(2, 9),
        date: new Date().toLocaleDateString(),
        difficulty: this.difficulty,
        score: this.score,
        timeLeft: parseFloat(this.timeLeft.toFixed(1)),
        suppliesCollected: this.level.supplies.filter(s => s.collected).length,
        totalSupplies: this.level.supplies.length,
        rating: this.getSurvivalRating(),
      };

      existing.push(newRecord);
      existing.sort((a, b) => b.score - a.score);
      localStorage.setItem(recordsKey, JSON.stringify(existing.slice(0, 10)));
    } catch {
      // Storage error safeguard
    }
  }

  private render(delta: number) {
    this.renderer.updateAndRender(
      this.level,
      this.player,
      this.waterLevel,
      this.particles,
      this.timeElapsed,
      delta
    );
  }

  private syncUI() {
    if (this.onUpdateUI) {
      const collected = this.level.supplies.filter(s => s.collected).length;
      const total = this.level.supplies.length;
      const dangerDist = Math.max(0, this.waterLevel - (this.player.y + this.player.height));

      this.onUpdateUI({
        score: this.score,
        timeLeft: this.timeLeft,
        timeElapsed: this.timeElapsed,
        waterLevel: this.waterLevel,
        suppliesCollected: collected,
        totalSupplies: total,
        dangerDistance: dangerDist,
        oxygen: this.player.oxygen,
        stamina: this.player.stamina,
        lives: this.player.lives,
        maxLives: this.player.maxLives,
        gameOverReason: this.gameOverReason,
        rating: this.getSurvivalRating(),
      }, this.state);
    }
  }
}
