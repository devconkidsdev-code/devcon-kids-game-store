class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = true; // Default sound OFF as required by UX guidelines
  private lastDripTime: number = 0;
  private lastStepTime: number = 0;

  constructor() {
    // Check saved audio preference, defaulting to muted (true)
    const saved = localStorage.getItem('fetch_game_muted');
    if (saved !== null) {
      this.isMuted = saved === 'true';
    } else {
      this.isMuted = true;
    }
  }

  private init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('fetch_game_muted', String(this.isMuted));
    if (!this.isMuted) {
      this.init();
      this.playPop();
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public playPop() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.06);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch {
      // AudioContext error safeguard
    }
  }

  public playDrip() {
    if (this.isMuted) return;
    const now = performance.now();
    if (now - this.lastDripTime < 180) return; // throttle
    this.lastDripTime = now;

    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const baseFreq = 700 + Math.random() * 200;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.6, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch {
      // AudioContext error safeguard
    }
  }

  public playStep() {
    if (this.isMuted) return;
    const now = performance.now();
    if (now - this.lastStepTime < 160) return;
    this.lastStepTime = now;

    this.init();
    if (!this.ctx) return;

    try {
      // Gentle crunch / low pop
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140 + Math.random() * 40, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {
      // AudioContext error safeguard
    }
  }

  public playRefill() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const startTime = this.ctx.currentTime + idx * 0.06;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.12, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.15);
      });
    } catch {
      // AudioContext error safeguard
    }
  }

  public playWarning() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);

      gain.gain.setValueAtTime(0.06, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.08);
    } catch {
      // AudioContext error safeguard
    }
  }

  public playWin() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const fanfare = [
        { note: 440, time: 0, dur: 0.12 },     // A4
        { note: 554.37, time: 0.12, dur: 0.12 }, // C#5
        { note: 659.25, time: 0.24, dur: 0.14 }, // E5
        { note: 880, time: 0.38, dur: 0.35 },    // A5
      ];

      fanfare.forEach((f) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = this.ctx.currentTime + f.time;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f.note, start);

        gain.gain.setValueAtTime(0.18, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + f.dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + f.dur);
      });
    } catch {
      // AudioContext error safeguard
    }
  }

  public playGameOver() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const notes = [
        { note: 330, time: 0, dur: 0.2 },
        { note: 277, time: 0.18, dur: 0.22 },
        { note: 220, time: 0.38, dur: 0.4 },
      ];

      notes.forEach((f) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = this.ctx.currentTime + f.time;

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f.note, start);

        gain.gain.setValueAtTime(0.12, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + f.dur);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + f.dur);
      });
    } catch {
      // AudioContext error safeguard
    }
  }
}

export const soundManager = new SoundManager();
