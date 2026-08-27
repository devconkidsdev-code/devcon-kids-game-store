/**
 * Web Audio API procedural sound engine for Earthquakes Survival.
 * Synthesizes all disaster, rescue, siren, engine, and seismic audio effects.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private sirenOsc1: OscillatorNode | null = null;
  private sirenOsc2: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;
  private isSirenPlaying: boolean = false;
  private rumbleSource: AudioBufferSourceNode | null = null;
  private rumbleGain: GainNode | null = null;

  constructor() {
    // Initialized on first user interaction
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopContinuousSounds();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  // --- ENGINE SOUND ---
  public updateEngineSound(speedRatio: number, isMoving: boolean) {
    if (this.isMuted) {
      this.stopEngine();
      return;
    }
    this.initCtx();
    if (!this.ctx) return;

    try {
      if (!this.engineOsc || !this.engineGain) {
        this.engineOsc = this.ctx.createOscillator();
        this.engineOsc.type = 'sawtooth';

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 240;

        this.engineGain = this.ctx.createGain();
        this.engineGain.gain.setValueAtTime(0.04, this.ctx.currentTime);

        this.engineOsc.connect(filter);
        filter.connect(this.engineGain);
        this.engineGain.connect(this.ctx.destination);
        this.engineOsc.start();
      }

      const targetFreq = 45 + Math.abs(speedRatio) * 95;
      this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.08);

      const targetGain = isMoving ? 0.06 + Math.abs(speedRatio) * 0.06 : 0.025;
      this.engineGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
    } catch {
      // Audio fallback
    }
  }

  public stopEngine() {
    try {
      if (this.engineOsc) {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
        this.engineOsc = null;
        this.engineGain = null;
      }
    } catch {
      // cleanup safe
    }
  }

  // --- SIREN SOUND ---
  public setSiren(enabled: boolean) {
    if (this.isMuted || !enabled) {
      this.stopSiren();
      return;
    }
    if (this.isSirenPlaying) return;

    this.initCtx();
    if (!this.ctx) return;

    try {
      this.isSirenPlaying = true;
      this.sirenGain = this.ctx.createGain();
      this.sirenGain.gain.setValueAtTime(0.06, this.ctx.currentTime);

      this.sirenOsc1 = this.ctx.createOscillator();
      this.sirenOsc1.type = 'sine';

      // LFO for pitch modulation
      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(1.6, this.ctx.currentTime); // cycle rate

      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(320, this.ctx.currentTime); // pitch sweep depth

      this.sirenOsc1.frequency.setValueAtTime(750, this.ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(this.sirenOsc1.frequency);

      this.sirenOsc1.connect(this.sirenGain);
      this.sirenGain.connect(this.ctx.destination);

      this.sirenOsc1.start();
      lfo.start();
    } catch {
      // safe fallback
    }
  }

  public stopSiren() {
    try {
      if (this.sirenOsc1) {
        this.sirenOsc1.stop();
        this.sirenOsc1.disconnect();
        this.sirenOsc1 = null;
      }
      this.isSirenPlaying = false;
      this.sirenGain = null;
    } catch {
      // safe
    }
  }

  // --- RESCUE PICKUP SOUND ---
  public playPickup() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio

      notes.forEach((freq, index) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + index * 0.05);

        gain.gain.setValueAtTime(0, now + index * 0.05);
        gain.gain.linearRampToValueAtTime(0.12, now + index * 0.05 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.05 + 0.22);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now + index * 0.05);
        osc.stop(now + index * 0.05 + 0.25);
      });
    } catch {
      // safe
    }
  }

  // --- SAFE ZONE DELIVERY TRIUMPH ---
  public playDelivery(count: number) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      // Majestic chord fanfare
      const chords = [
        [523.25, 659.25, 783.99], // C Major
        [587.33, 739.99, 880.00], // D Major
        [659.25, 830.61, 987.77], // E Major
        [1046.50, 1318.51, 1567.98] // High C octave
      ];

      chords.forEach((chord, step) => {
        const stepTime = now + step * 0.09;
        chord.forEach((freq) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, stepTime);

          const duration = step === chords.length - 1 ? 0.6 : 0.15;
          gain.gain.setValueAtTime(0, stepTime);
          gain.gain.linearRampToValueAtTime(0.15 + Math.min(count * 0.02, 0.1), stepTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, stepTime + duration);

          osc.connect(gain);
          gain.connect(this.ctx!.destination);

          osc.start(stepTime);
          osc.stop(stepTime + duration + 0.05);
        });
      });
    } catch {
      // safe
    }
  }

  // --- SEISMIC / EARTHQUAKE RUMBLE ---
  public playEarthquakeRumble(intensity: number) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 2;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);

      // Generate brown/pink noise
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        output[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = output[i];
        output[i] *= 3.5;
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(100 + intensity * 60, now);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(Math.min(0.25, 0.08 + intensity * 0.15), now + 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start(now);
      noise.stop(now + 3.2);
    } catch {
      // safe
    }
  }

  // --- CRASH / OBSTACLE IMPACT ---
  public playCrash(impactSpeed: number) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.25);

      const volume = Math.min(0.22, 0.05 + Math.abs(impactSpeed) * 0.03);
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.26);
    } catch {
      // safe
    }
  }

  // --- HORN / HONK ---
  public playHorn() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const dualFreqs = [392.00, 440.00]; // G4 + A4 rescue truck horn tone

      dualFreqs.forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.03);
        gain.gain.setValueAtTime(0.12, now + 0.28);
        gain.gain.linearRampToValueAtTime(0.001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now);
        osc.stop(now + 0.36);
      });
    } catch {
      // safe
    }
  }

  // --- TIRE SCREECH ---
  public playScreech() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(900 + Math.random() * 200, now);
      osc.frequency.linearRampToValueAtTime(700, now + 0.15);

      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch {
      // safe
    }
  }

  // --- TIMER TICK ---
  public playTick(isUrgent: boolean) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(isUrgent ? 880 : 440, now);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // safe
    }
  }

  public stopContinuousSounds() {
    this.stopEngine();
    this.stopSiren();
  }
}

export const soundEngine = new SoundEngine();
