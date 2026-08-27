/**
 * Procedural Web Audio Highland Soundscape
 * Safe zero-external-dependency procedural audio engine for Bukidnon ambient sound
 */

class SoundscapeEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private noiseNode: AudioNode | null = null;
  private birdTimer: number | null = null;
  private drumTimer: number | null = null;
  private gainNode: GainNode | null = null;
  private isTribalDrumEnabled = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleSound(onStateChange?: (playing: boolean) => void) {
    if (this.isPlaying) {
      this.stop();
      if (onStateChange) onStateChange(false);
      return false;
    } else {
      this.start();
      if (onStateChange) onStateChange(true);
      return true;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  public setTribalBeat(enabled: boolean) {
    this.isTribalDrumEnabled = enabled;
    if (this.isPlaying && enabled) {
      this.startDrumLoop();
    } else if (!enabled && this.drumTimer) {
      window.clearInterval(this.drumTimer);
      this.drumTimer = null;
    }
  }

  public start() {
    try {
      this.initContext();
      if (!this.ctx) return;

      this.isPlaying = true;
      this.gainNode = this.ctx.createGain();
      this.gainNode.gain.setValueAtTime(0.01, this.ctx.currentTime);
      this.gainNode.gain.exponentialRampToValueAtTime(0.18, this.ctx.currentTime + 1.5);
      this.gainNode.connect(this.ctx.destination);

      // 1. Create Mountain Wind & Forest Breeze (Pink/Brown noise filter)
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
        b6 = white * 0.115926;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, this.ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(this.gainNode);
      whiteNoise.start();
      this.noiseNode = whiteNoise;

      // 2. Schedule procedural mountain birds
      this.scheduleBirds();

      if (this.isTribalDrumEnabled) {
        this.startDrumLoop();
      }
    } catch {
      // Audio autoplay policy fallback
    }
  }

  private scheduleBirds() {
    if (!this.isPlaying || !this.ctx) return;
    const nextInterval = 2500 + Math.random() * 4500;
    this.birdTimer = window.setTimeout(() => {
      this.playBirdChirp();
      this.scheduleBirds();
    }, nextInterval);
  }

  private playBirdChirp() {
    if (!this.ctx || !this.gainNode || !this.isPlaying) return;
    try {
      const osc = this.ctx.createOscillator();
      const birdGain = this.ctx.createGain();
      const baseFreq = 2200 + Math.random() * 800;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq + 600, this.ctx.currentTime + 0.08);
      osc.frequency.exponentialRampToValueAtTime(baseFreq - 300, this.ctx.currentTime + 0.15);

      birdGain.gain.setValueAtTime(0.001, this.ctx.currentTime);
      birdGain.gain.exponentialRampToValueAtTime(0.04, this.ctx.currentTime + 0.04);
      birdGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.18);

      osc.connect(birdGain);
      birdGain.connect(this.gainNode);

      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 0.2);
    } catch {
      // Ignore audio glitches
    }
  }

  public playInteractivePop() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.09);

      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.13);
    } catch {
      // ignore
    }
  }

  public playEagleCall() {
    try {
      this.initContext();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(1400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(2200, this.ctx.currentTime + 0.15);
      osc.frequency.exponentialRampToValueAtTime(900, this.ctx.currentTime + 0.45);

      gain.gain.setValueAtTime(0.05, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, this.ctx.currentTime + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.52);
    } catch {
      // ignore
    }
  }

  private startDrumLoop() {
    if (!this.ctx) return;
    let step = 0;
    this.drumTimer = window.setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;
      const isStrong = step % 4 === 0;
      this.playDrumHit(isStrong ? 110 : 165, isStrong ? 0.09 : 0.04);
      step++;
    }, 420);
  }

  private playDrumHit(frequency: number, volume: number) {
    if (!this.ctx || !this.gainNode) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, this.ctx.currentTime + 0.16);

      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(this.gainNode);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.22);
    } catch {
      // ignore
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.birdTimer) {
      window.clearTimeout(this.birdTimer);
      this.birdTimer = null;
    }
    if (this.drumTimer) {
      window.clearInterval(this.drumTimer);
      this.drumTimer = null;
    }
    if (this.gainNode && this.ctx) {
      try {
        this.gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);
      } catch {
        // ignore
      }
    }
  }
}

export const soundscape = new SoundscapeEngine();
