/**
 * Realistic Procedural Sound Engine using Web Audio API
 * Generates natural audio for steps, liquids, wildlife, ambiance, and weather.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isMuted: boolean = false;
  private ambientSourceNodes: { [key: string]: AudioNode } = {};
  private currentAmbienceType: string = 'none';
  private heartbeatInterval: number | null = null;
  private isHeartbeatPlaying: boolean = false;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  public init() {
    if (this.ctx) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.ambientGain = this.ctx.createGain();
      this.ambientGain.gain.setValueAtTime(0.45, this.ctx.currentTime);
      this.ambientGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.9, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
    } catch {
      console.warn('Web Audio API not supported in this browser.');
    }
  }

  private ensureContext() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMasterVolume(vol: number) {
    this.ensureContext();
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : Math.max(0, Math.min(1, vol)), this.ctx.currentTime, 0.05);
    }
  }

  public setAmbientVolume(vol: number) {
    this.ensureContext();
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime, 0.05);
    }
  }

  public setSfxVolume(vol: number) {
    this.ensureContext();
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(Math.max(0, Math.min(1, vol)), this.ctx.currentTime, 0.05);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.85, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  public getMuted() {
    return this.isMuted;
  }

  // --- FOOTSTEPS ---
  public playFootstep(surface: 'grass' | 'mud' | 'water' | 'rock' | 'wood' = 'grass', isSprinting: boolean = false) {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    // Noise buffer for texture
    const bufferSize = this.ctx.sampleRate * 0.08;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    const noiseGain = this.ctx.createGain();

    const vol = isSprinting ? 0.35 : 0.22;

    switch (surface) {
      case 'mud':
        // Squishy low pitch & liquid pop
        osc.type = 'sine';
        osc.frequency.setValueAtTime(90 + Math.random() * 30, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, now);

        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(600, now);
        noiseFilter.Q.setValueAtTime(2, now);

        gain.gain.setValueAtTime(vol * 1.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        noiseGain.gain.setValueAtTime(vol * 0.8, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        break;

      case 'water':
        // Splashing bubble texture
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320 + Math.random() * 120, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.14);
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, now);

        noiseFilter.type = 'highpass';
        noiseFilter.frequency.setValueAtTime(1200, now);

        gain.gain.setValueAtTime(vol * 1.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

        noiseGain.gain.setValueAtTime(vol * 0.9, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
        break;

      case 'rock':
        // Crisp stone impact
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(160 + Math.random() * 40, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.06);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, now);

        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(2200, now);

        gain.gain.setValueAtTime(vol * 0.9, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

        noiseGain.gain.setValueAtTime(vol * 0.7, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        break;

      case 'wood':
        // Hollow thud
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.08);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(500, now);

        gain.gain.setValueAtTime(vol * 1.0, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        noiseGain.gain.setValueAtTime(0, now);
        break;

      case 'grass':
      default:
        // Soft rustle & low tap
        osc.type = 'sine';
        osc.frequency.setValueAtTime(110 + Math.random() * 20, now);
        osc.frequency.exponentialRampToValueAtTime(45, now + 0.08);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, now);

        noiseFilter.type = 'bandpass';
        noiseFilter.frequency.setValueAtTime(1400, now);
        noiseFilter.Q.setValueAtTime(1.5, now);

        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        noiseGain.gain.setValueAtTime(vol * 0.6, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
        break;
    }

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    osc.start(now);
    noiseSource.start(now);
    osc.stop(now + 0.15);
    noiseSource.stop(now + 0.15);
  }

  // --- WATER GATHERING (GURGLE & BUBBLES) ---
  public playWaterCollect() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const duration = 0.45;

    // Bubbling frequency modulated tones
    for (let i = 0; i < 4; i++) {
      const bubbleTime = now + i * 0.09 + Math.random() * 0.03;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const baseFreq = 400 + Math.random() * 350 + i * 60;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, bubbleTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq + 280, bubbleTime + 0.09);

      gain.gain.setValueAtTime(0.001, bubbleTime);
      gain.gain.linearRampToValueAtTime(0.25, bubbleTime + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, bubbleTime + 0.1);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(bubbleTime);
      osc.stop(bubbleTime + 0.12);
    }

    // Liquid rush noise
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.5;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(650, now);
    bandpass.frequency.exponentialRampToValueAtTime(1400, now + duration);
    bandpass.Q.setValueAtTime(3.5, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.01, now);
    noiseGain.gain.linearRampToValueAtTime(0.3, now + 0.15);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(bandpass);
    bandpass.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    noise.start(now);
    noise.stop(now + duration);
  }

  // --- WATERING CROPS (FLOW & SOIL ABSORPTION) ---
  public playWaterPour() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const duration = 0.5;

    // Soil sizzling / moist absorption white noise
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(2200, now);
    filter.frequency.linearRampToValueAtTime(800, now + duration);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0.35, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
    noise.stop(now + duration);
  }

  // --- PLANT REVIVED CHIME / HARMONIC BLOOM ---
  public playPlantBloom() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const chords = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // C5, E5, G5, C6, E6

    chords.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.08);

      gain.gain.setValueAtTime(0.001, now + idx * 0.08);
      gain.gain.linearRampToValueAtTime(0.22, now + idx * 0.08 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.8);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + idx * 0.08);
      osc.stop(now + idx * 0.08 + 0.9);
    });
  }

  // --- ANIMAL VOCALIZATIONS ---
  public playAnimalSound(species: string, state: 'alert' | 'attack' | 'idle' = 'alert') {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;

    switch (species) {
      case 'timber_wolf': {
        // Wolf howl / snarl
        if (state === 'alert' || state === 'idle') {
          // Haunting resonant howl
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();

          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(580, now + 0.4);
          osc.frequency.exponentialRampToValueAtTime(410, now + 1.2);

          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(650, now);
          filter.Q.setValueAtTime(4.0, now);

          gain.gain.setValueAtTime(0.01, now);
          gain.gain.linearRampToValueAtTime(0.3, now + 0.3);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 1.3);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.sfxGain);

          osc.start(now);
          osc.stop(now + 1.4);
        } else {
          // Snarl / snap
          this.generateSnarl(now, 220, 0.4);
        }
        break;
      }

      case 'grizzly_bear': {
        // Deep guttural roar
        const osc = this.ctx.createOscillator();
        const sub = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.linearRampToValueAtTime(75, now + 0.6);

        sub.type = 'square';
        sub.frequency.setValueAtTime(55, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(450, now);
        filter.Q.setValueAtTime(3, now);

        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0.45, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

        osc.connect(filter);
        sub.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        sub.start(now);
        osc.stop(now + 0.75);
        sub.stop(now + 0.75);
        break;
      }

      case 'wild_boar': {
        // Grunt & squeal
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.08);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.25);

        gain.gain.setValueAtTime(0.05, now);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.3);
        break;
      }

      case 'marsh_crocodile': {
        // Deep hiss & jaw snap
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.5);
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
        const noise = this.ctx.createBufferSource();
        noise.buffer = noiseBuffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1100, now);
        filter.Q.setValueAtTime(2.5, now);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.linearRampToValueAtTime(0.35, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.sfxGain);

        noise.start(now);
        noise.stop(now + 0.5);
        break;
      }

      case 'rattlesnake': {
        // Fast periodic rattle bursts
        for (let i = 0; i < 6; i++) {
          const t = now + i * 0.05;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(3200 + Math.random() * 800, t);
          gain.gain.setValueAtTime(0.18, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
          osc.connect(gain);
          gain.connect(this.sfxGain);
          osc.start(t);
          osc.stop(t + 0.04);
        }
        break;
      }

      case 'mountain_cougar': {
        // High pitched predatory hiss/growl
        this.generateSnarl(now, 380, 0.45);
        break;
      }

      case 'wild_rhino': {
        // Heavy foot stomp and breath
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.3);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(this.sfxGain);
        osc.start(now);
        osc.stop(now + 0.4);
        break;
      }
    }
  }

  private generateSnarl(startTime: number, freq: number, duration: number) {
    if (!this.ctx || !this.sfxGain) return;
    const osc = this.ctx.createOscillator();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    const gain = this.ctx.createGain();

    lfo.frequency.setValueAtTime(35, startTime); // Tremolo effect
    lfoGain.gain.setValueAtTime(80, startTime);

    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, startTime);

    gain.gain.setValueAtTime(0.02, startTime);
    gain.gain.linearRampToValueAtTime(0.3, startTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    lfo.start(startTime);
    osc.start(startTime);
    lfo.stop(startTime + duration);
    osc.stop(startTime + duration);
  }

  // --- DANGER / HEARTBEAT ---
  public setHeartbeatActive(active: boolean) {
    if (active && !this.isHeartbeatPlaying) {
      this.isHeartbeatPlaying = true;
      this.playHeartbeatPulse();
      this.heartbeatInterval = window.setInterval(() => {
        this.playHeartbeatPulse();
      }, 700);
    } else if (!active && this.isHeartbeatPlaying) {
      this.isHeartbeatPlaying = false;
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }
    }
  }

  private playHeartbeatPulse() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    // Lub-Dub double thump
    [0, 0.2].forEach((offset, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(idx === 0 ? 65 : 55, now + offset);
      osc.frequency.exponentialRampToValueAtTime(35, now + offset + 0.12);

      gain.gain.setValueAtTime(0.35, now + offset);
      gain.gain.exponentialRampToValueAtTime(0.001, now + offset + 0.14);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + offset);
      osc.stop(now + offset + 0.15);
    });
  }

  // --- FLARE / ITEM SOUNDS ---
  public playFlareIgnite() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    // Whoosh + crackle
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.exponentialRampToValueAtTime(180, now + 0.4);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.5);
  }

  public playStoneThrow() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.15);
  }

  // --- PLAYER HURT / DAMAGE ---
  public playPlayerHurt() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    // Pain grunt
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.2);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.3);
  }

  // --- UI & VICTORY JINGLE ---
  public playVictoryJingle() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const notes = [
      { f: 440, t: 0 },
      { f: 554.37, t: 0.15 },
      { f: 659.25, t: 0.3 },
      { f: 880, t: 0.45 },
      { f: 1108.73, t: 0.7 },
    ];

    notes.forEach((n) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, now + n.t);

      gain.gain.setValueAtTime(0.001, now + n.t);
      gain.gain.linearRampToValueAtTime(0.3, now + n.t + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + 0.6);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + n.t);
      osc.stop(now + n.t + 0.7);
    });
  }

  public playGameOverSound() {
    this.ensureContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const now = this.ctx.currentTime;
    const notes = [260, 230, 195, 140];
    notes.forEach((f, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, now + i * 0.25);

      gain.gain.setValueAtTime(0.25, now + i * 0.25);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.25 + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now + i * 0.25);
      osc.stop(now + i * 0.25 + 0.4);
    });
  }

  // --- AMBIENT SOUNDSCAPE GENERATOR ---
  public setAmbience(type: 'forest' | 'rain' | 'swamp' | 'desert' | 'night' | 'canyon' | 'none') {
    if (this.currentAmbienceType === type) return;
    this.currentAmbienceType = type;
    this.stopAmbience();

    if (type === 'none' || this.isMuted) return;
    this.ensureContext();
    if (!this.ctx || !this.ambientGain) return;

    // Build loopable dynamic ambient nodes
    try {
      const now = this.ctx.currentTime;

      // 1. Gentle continuous wind baseline
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.15;
      }
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const windFilter = this.ctx.createBiquadFilter();
      windFilter.type = 'lowpass';
      windFilter.frequency.setValueAtTime(type === 'rain' ? 800 : 350, now);

      const windGain = this.ctx.createGain();
      windGain.gain.setValueAtTime(0.25, now);

      noiseSource.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(this.ambientGain);
      noiseSource.start();

      this.ambientSourceNodes['wind'] = noiseSource;
    } catch {
      // Fallback
    }
  }

  public stopAmbience() {
    Object.keys(this.ambientSourceNodes).forEach((k) => {
      try {
        const node = this.ambientSourceNodes[k] as AudioScheduledSourceNode;
        if (node && typeof node.stop === 'function') {
          node.stop();
        }
      } catch {
        // Ignored
      }
    });
    this.ambientSourceNodes = {};
  }
}

export const soundEngine = new SoundEngine();
