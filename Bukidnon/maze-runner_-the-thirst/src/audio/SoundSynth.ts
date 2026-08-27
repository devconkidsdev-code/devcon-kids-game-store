/**
 * Web Audio API Procedural Sound Synthesizer
 * Produces crisp, juicy arcade sound effects and dynamic music without any external audio files.
 */

class SoundSynthEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isMuted: boolean = false;
  private sfxVolume: number = 0.8;
  private musicVolume: number = 0.45;
  private bgmPlaying: boolean = false;
  private bgmTimer: number | null = null;
  private heartbeatTimer: number | null = null;
  private heartbeatBpm: number = 60;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 1;
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = this.sfxVolume;
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = this.musicVolume;
      this.musicGain.connect(this.masterGain);
    } catch {
      // Audio context might fail in non-interactive environment
    }
  }

  public resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 1, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
    }
  }

  // --- Procedural SFX Generators ---

  /** Bouncy Footstep with slight water squish variation */
  public playFootstep(isWet: boolean = false) {
    if (!this.ctx || this.isMuted || !this.sfxGain) return;
    this.resume();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = isWet ? 'sine' : 'triangle';
    const baseFreq = isWet ? 180 + Math.random() * 80 : 120 + Math.random() * 40;
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, t + 0.08);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(isWet ? 1200 : 600, t);

    gain.gain.setValueAtTime(0.12, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.08);

    // If wet, add a tiny high click/squelch
    if (isWet) {
      const squish = this.ctx.createOscillator();
      const squishGain = this.ctx.createGain();
      squish.type = 'sine';
      squish.frequency.setValueAtTime(800 + Math.random() * 300, t);
      squish.frequency.exponentialRampToValueAtTime(300, t + 0.04);
      squishGain.gain.setValueAtTime(0.06, t);
      squishGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      squish.connect(squishGain);
      squishGain.connect(this.sfxGain);
      squish.start(t);
      squish.stop(t + 0.04);
    }
  }

  /** Liquid Sloshing sound when turning sharply or running fast */
  public playSlosh(intensity: number = 0.5) {
    if (!this.ctx || this.isMuted || !this.sfxGain) return;
    this.resume();
    const t = this.ctx.currentTime;
    const dur = 0.18;

    // Filtered noise buffer
    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.6));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.value = 4.0;
    const startF = 350 + Math.random() * 150;
    filter.frequency.setValueAtTime(startF, t);
    filter.frequency.exponentialRampToValueAtTime(startF * 1.6, t + dur * 0.5);
    filter.frequency.exponentialRampToValueAtTime(startF * 0.8, t + dur);

    const gain = this.ctx.createGain();
    const vol = Math.min(0.25, 0.08 + intensity * 0.15);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
    noise.stop(t + dur);
  }

  /** Big Wall Impact / Bonk with comical vibration */
  public playBonk(velocityRatio: number = 0.8) {
    if (!this.ctx || this.isMuted || !this.sfxGain) return;
    this.resume();
    const t = this.ctx.currentTime;

    // Wood/Cardboard Thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.15);

    gain.gain.setValueAtTime(Math.min(0.4, 0.15 + velocityRatio * 0.25), t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.15);

    // Spring / squeak overtone
    const spring = this.ctx.createOscillator();
    const springGain = this.ctx.createGain();
    spring.type = 'sawtooth';
    spring.frequency.setValueAtTime(540, t);
    spring.frequency.linearRampToValueAtTime(220, t + 0.12);
    springGain.gain.setValueAtTime(0.08 * velocityRatio, t);
    springGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);

    spring.connect(filter);
    filter.connect(springGain);
    springGain.connect(this.sfxGain);
    spring.start(t);
    spring.stop(t + 0.12);
  }

  /** Damage / Trap Triggered Sound */
  public playDamage() {
    if (!this.ctx || this.isMuted || !this.sfxGain) return;
    this.resume();
    const t = this.ctx.currentTime;

    // Discordant buzzer
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'square';
    osc1.frequency.setValueAtTime(220, t);
    osc1.frequency.exponentialRampToValueAtTime(90, t + 0.25);
    osc2.frequency.setValueAtTime(233, t); // Half-step clash!
    osc2.frequency.exponentialRampToValueAtTime(95, t + 0.25);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.25);
    osc2.stop(t + 0.25);
  }

  /** Chaser alert exclamation sound (cartoon squeak / trumpet rise) */
  public playChaserAlert() {
    if (!this.ctx || this.isMuted || !this.sfxGain) return;
    this.resume();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(740, t + 0.12);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.18);
  }

  /** Chaser tackle / water splash bump */
  public playChaserTackle() {
    if (!this.ctx || this.isMuted || !this.sfxGain) return;
    this.resume();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.2);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.22);
  }

  /** Chaser trapped / stunned comical dizzy sound */
  public playChaserStunned() {
    if (!this.ctx || this.isMuted || !this.sfxGain) return;
    this.resume();
    const t = this.ctx.currentTime;

    [480, 420, 360, 300].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.05);

      gain.gain.setValueAtTime(0.18, t + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.1);

      osc.connect(gain);
      if (this.sfxGain) gain.connect(this.sfxGain);
      osc.start(t + idx * 0.05);
      osc.stop(t + idx * 0.05 + 0.1);
    });
  }

  /** Catching the Golden Bandit reward fanfare */
  public playBanditCatch() {
    if (!this.ctx || this.isMuted || !this.sfxGain) return;
    this.resume();
    const t = this.ctx.currentTime;

    [523.25, 659.25, 783.99, 1046.50, 1318.51].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.05);

      gain.gain.setValueAtTime(0.25, t + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.35);

      osc.connect(gain);
      if (this.sfxGain) gain.connect(this.sfxGain);
      osc.start(t + idx * 0.05);
      osc.stop(t + idx * 0.05 + 0.35);
    });
  }

  /** Countdown clock tick sound (especially urgent under 10s) */
  public playTickTock(isUrgent: boolean = false) {
    if (!this.ctx || this.isMuted || !this.sfxGain) return;
    this.resume();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = isUrgent ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(isUrgent ? 880 : 440, t);
    osc.frequency.exponentialRampToValueAtTime(isUrgent ? 1100 : 220, t + 0.05);

    gain.gain.setValueAtTime(isUrgent ? 0.22 : 0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  /** Heart / Life lost dramatic sound */
  public playLifeLost() {
    if (!this.ctx || this.isMuted || !this.sfxGain) return;
    this.resume();
    const t = this.ctx.currentTime;

    [260, 220, 180, 130].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t + idx * 0.06);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.6, t + idx * 0.06 + 0.1);

      gain.gain.setValueAtTime(0.28, t + idx * 0.06);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.12);

      osc.connect(gain);
      if (this.sfxGain) gain.connect(this.sfxGain);
      osc.start(t + idx * 0.06);
      osc.stop(t + idx * 0.06 + 0.12);
    });
  }

  /** Heart / Life recovered chime */
  public playLifeGain() {
    if (!this.ctx || this.isMuted || !this.sfxGain) return;
    this.resume();
    const t = this.ctx.currentTime;

    [440, 554.37, 659.25, 880].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.07);

      gain.gain.setValueAtTime(0.22, t + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.07 + 0.25);

      osc.connect(gain);
      if (this.sfxGain) gain.connect(this.sfxGain);
      osc.start(t + idx * 0.07);
      osc.stop(t + idx * 0.07 + 0.25);
    });
  }

  /** Cartoon Spring Boing sound (super fun for kids!) */
  public playBoing() {
    if (!this.ctx || this.isMuted || !this.sfxGain) return;
    this.resume();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    // Classic bouncy upward slide
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(520, t + 0.18);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.28);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.3);
  }

  /** Cheerful Pinwheel breezy chime */
  public playPinwheelWhoosh() {
    if (!this.ctx || this.isMuted || !this.sfxGain) return;
    this.resume();
    const t = this.ctx.currentTime;

    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.04);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.1, t + idx * 0.04 + 0.12);

      gain.gain.setValueAtTime(0.18, t + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.04 + 0.15);

      osc.connect(gain);
      if (this.sfxGain) gain.connect(this.sfxGain);
      osc.start(t + idx * 0.04);
      osc.stop(t + idx * 0.04 + 0.15);
    });
  }

  /** Fun Bubble Pop sound */
  public playBubblePop() {
    if (!this.ctx || this.isMuted || !this.sfxGain) return;
    this.resume();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.05);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.06);
  }

  /** Wobbly Jelly Squish sound */
  public playJellySquish() {
    if (!this.ctx || this.isMuted || !this.sfxGain) return;
    this.resume();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, t);
    osc.frequency.linearRampToValueAtTime(340, t + 0.08);
    osc.frequency.linearRampToValueAtTime(180, t + 0.16);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  /** Dynamic Obstacle impact */
  public playObstacleHit() {
    this.playBoing();
  }

  /** Electric Laser Zap obstacle sound */
  public playZap() {
    this.playBubblePop();
  }

  /** Watering a plant / crop bloom joy chord */
  public playWaterCrop(isFinal: boolean = false) {
    if (!this.ctx || this.isMuted || !this.sfxGain) return;
    this.resume();
    const t = this.ctx.currentTime;

    // Arpeggio notes: E4, G#4, B4, E5 (or higher for final)
    const notes = isFinal ? [440, 554.37, 659.25, 880, 1108.73, 1318.51] : [329.63, 415.30, 493.88, 659.25];
    
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.06);

      gain.gain.setValueAtTime(0, t + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.2, t + idx * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.45);

      osc.connect(gain);
      if (this.sfxGain) gain.connect(this.sfxGain);

      osc.start(t + idx * 0.06);
      osc.stop(t + idx * 0.06 + 0.45);
    });
  }

  /** Refilling water from Well */
  public playRefill() {
    if (!this.ctx || this.isMuted || !this.sfxGain) return;
    this.resume();
    const t = this.ctx.currentTime;

    // Bubbling cascading tones
    for (let i = 0; i < 6; i++) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const delay = i * 0.04;
      const freq = 400 + i * 110 + (Math.random() * 50);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + delay);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.25, t + delay + 0.1);

      gain.gain.setValueAtTime(0.12, t + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.1);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + delay);
      osc.stop(t + delay + 0.1);
    }
  }

  /** Power-up picked up */
  public playPowerup() {
    if (!this.ctx || this.isMuted || !this.sfxGain) return;
    this.resume();
    const t = this.ctx.currentTime;

    // Upbeat sparkle chirp
    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    freqs.forEach((f, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, t + i * 0.05);

      gain.gain.setValueAtTime(0.18, t + i * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.05 + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + i * 0.05);
      osc.stop(t + i * 0.05 + 0.25);
    });
  }

  /** Creature / Spooky Eyes scurry */
  public playScurry() {
    if (!this.ctx || this.isMuted || !this.sfxGain) return;
    this.resume();
    const t = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(400, t + 0.14);

    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.14);
  }

  /** Heartbeat for low timer or low water */
  public startHeartbeat(bpm: number = 80) {
    this.heartbeatBpm = bpm;
    if (this.heartbeatTimer) return;

    const intervalMs = (60 / this.heartbeatBpm) * 1000;
    this.heartbeatTimer = window.setInterval(() => {
      this.playHeartbeatThump();
    }, intervalMs);
  }

  public updateHeartbeat(bpm: number) {
    if (Math.abs(this.heartbeatBpm - bpm) > 5) {
      this.stopHeartbeat();
      this.startHeartbeat(bpm);
    }
  }

  public stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  private playHeartbeatThump() {
    if (!this.ctx || this.isMuted || !this.sfxGain) return;
    this.resume();
    const t = this.ctx.currentTime;

    // Sub-bass lub-DUB
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(75, t);
    osc1.frequency.exponentialRampToValueAtTime(35, t + 0.08);
    gain1.gain.setValueAtTime(0.28, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc1.connect(gain1);
    gain1.connect(this.sfxGain);
    osc1.start(t);
    osc1.stop(t + 0.08);

    // Second beat
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(85, t + 0.12);
    osc2.frequency.exponentialRampToValueAtTime(40, t + 0.2);
    gain2.gain.setValueAtTime(0.32, t + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc2.connect(gain2);
    gain2.connect(this.sfxGain);
    osc2.start(t + 0.12);
    osc2.stop(t + 0.2);
  }

  /** Victory Fanfare on Level Clear */
  public playVictoryFanfare() {
    if (!this.ctx || this.isMuted || !this.sfxGain) return;
    this.resume();
    const t = this.ctx.currentTime;

    // Triumphant Brass/Lead arpeggio
    const sequence = [
      { f: 523.25, time: 0, dur: 0.15 },    // C5
      { f: 523.25, time: 0.16, dur: 0.15 }, // C5
      { f: 523.25, time: 0.32, dur: 0.15 }, // C5
      { f: 659.25, time: 0.48, dur: 0.35 }, // E5
      { f: 587.33, time: 0.85, dur: 0.15 }, // D5
      { f: 659.25, time: 1.02, dur: 0.15 }, // E5
      { f: 783.99, time: 1.20, dur: 0.65 }, // G5
      { f: 1046.50, time: 1.88, dur: 0.9 } // C6
    ];

    sequence.forEach(note => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, t + note.time);

      gain.gain.setValueAtTime(0, t + note.time);
      gain.gain.linearRampToValueAtTime(0.28, t + note.time + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.time + note.dur);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + note.time);
      osc.stop(t + note.time + note.dur);
    });
  }

  /** Game Over Jingle */
  public playGameOver() {
    if (!this.ctx || this.isMuted || !this.sfxGain) return;
    this.resume();
    const t = this.ctx.currentTime;

    const notes = [440, 415.3, 392, 349.23, 293.66]; // Sad chromatic descent
    notes.forEach((f, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, t + i * 0.18);

      gain.gain.setValueAtTime(0.18, t + i * 0.18);
      gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.18 + 0.3);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, t + i * 0.18);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t + i * 0.18);
      osc.stop(t + i * 0.18 + 0.3);
    });
  }

  /** Procedural Ambient Chiptune/Synth BGM (Loops subtly during gameplay) */
  public startBGM() {
    if (this.bgmPlaying) return;
    this.bgmPlaying = true;
    this.runBgmLoop();
  }

  public stopBGM() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  private runBgmLoop() {
    if (!this.bgmPlaying || !this.ctx || this.isMuted || !this.musicGain) {
      if (this.bgmPlaying) {
        this.bgmTimer = window.setTimeout(() => this.runBgmLoop(), 1000);
      }
      return;
    }

    const t = this.ctx.currentTime;
    const stepDuration = 0.22; // ~136 BPM sixteenths
    
    // Mystical, bouncy arcade bassline pattern in D minor (D, F, G, A, C)
    const bassline = [146.83, 0, 146.83, 174.61, 196.00, 0, 220.00, 174.61]; // D3, F3, G3, A3, F3
    const leadNotes = [587.33, 698.46, 783.99, 880.00, 1046.50, 880.00, 783.99, 698.46];

    // Schedule 8 steps (one measure)
    for (let step = 0; step < 8; step++) {
      const stepTime = t + step * stepDuration;
      const bFreq = bassline[step % bassline.length];

      if (bFreq > 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        const bassFilter = this.ctx.createBiquadFilter();

        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(bFreq, stepTime);

        bassFilter.type = 'lowpass';
        bassFilter.frequency.setValueAtTime(450, stepTime);

        bassGain.gain.setValueAtTime(0.12, stepTime);
        bassGain.gain.exponentialRampToValueAtTime(0.001, stepTime + stepDuration * 0.85);

        bassOsc.connect(bassFilter);
        bassFilter.connect(bassGain);
        bassGain.connect(this.musicGain);

        bassOsc.start(stepTime);
        bassOsc.stop(stepTime + stepDuration * 0.85);
      }

      // Soft melodic synth ping on certain steps
      if (step === 0 || step === 3 || step === 6) {
        const leadOsc = this.ctx.createOscillator();
        const leadGain = this.ctx.createGain();
        const lFreq = leadNotes[(step * 2 + Math.floor(Math.random() * 3)) % leadNotes.length];

        leadOsc.type = 'sine';
        leadOsc.frequency.setValueAtTime(lFreq, stepTime);

        leadGain.gain.setValueAtTime(0.06, stepTime);
        leadGain.gain.exponentialRampToValueAtTime(0.001, stepTime + stepDuration * 1.5);

        leadOsc.connect(leadGain);
        leadGain.connect(this.musicGain);

        leadOsc.start(stepTime);
        leadOsc.stop(stepTime + stepDuration * 1.5);
      }

      // Subtle percussive click/hi-hat
      if (step % 2 === 0) {
        const buf = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.03, this.ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / 200);
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        const hatGain = this.ctx.createGain();
        hatGain.gain.setValueAtTime(0.025, stepTime);
        hatGain.gain.exponentialRampToValueAtTime(0.0001, stepTime + 0.03);
        src.connect(hatGain);
        hatGain.connect(this.musicGain);
        src.start(stepTime);
      }
    }

    const totalDuration = 8 * stepDuration;
    this.bgmTimer = window.setTimeout(() => {
      this.runBgmLoop();
    }, totalDuration * 1000 - 40);
  }
}

export const soundSynth = new SoundSynthEngine();
