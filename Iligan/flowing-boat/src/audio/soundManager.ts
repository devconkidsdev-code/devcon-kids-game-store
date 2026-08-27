// Web Audio API Procedural Sound Synthesizer

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private waveRoarNode: {
    source: AudioBufferSourceNode;
    gain: GainNode;
    filter: BiquadFilterNode;
  } | null = null;
  private riverAmbienceNode: {
    source: AudioBufferSourceNode;
    gain: GainNode;
  } | null = null;

  constructor() {
    // Lazy initialize on first user interaction
  }

  private initContext() {
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
      this.stopWaveRoar();
      this.stopRiverAmbience();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  // Helper to create white noise buffer
  private createNoiseBuffer(duration = 1): AudioBuffer | null {
    if (!this.ctx) return null;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  // Jump / Leap sound
  public playJump() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(420, now + 0.18);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Footstep sound for walking stage
  public playFootstep() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.06);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.07);
  }

  // Splash sound
  public playSplash() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const noise = this.createNoiseBuffer(0.35);
    if (!noise) return;

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noise;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1800, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.35);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noiseSource.start(now);
    noiseSource.stop(now + 0.35);
  }

  // Paddle rowing sound
  public playPaddle() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Splash component
    const noise = this.createNoiseBuffer(0.2);
    if (!noise) return;

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noise;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.linearRampToValueAtTime(400, now + 0.2);
    filter.Q.setValueAtTime(2, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    noiseSource.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noiseSource.start(now);
    noiseSource.stop(now + 0.2);
  }

  // Boost / Oar surge sound
  public playBoost() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(660, now + 0.25);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.3);
    this.playSplash();
  }

  // Collision / Hit sound
  public playHit() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.18);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Pickup item (Water Lily / speed boost)
  public playPickup() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now); // C5
    osc1.frequency.setValueAtTime(659.25, now + 0.08); // E5
    osc1.frequency.setValueAtTime(783.99, now + 0.16); // G5
    osc1.frequency.setValueAtTime(1046.5, now + 0.24); // C6

    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(523.25 * 2, now);
    osc2.frequency.setValueAtTime(1046.5 * 1.5, now + 0.24);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.4);
    osc2.stop(now + 0.4);
  }

  // Boarding the boat transition jingle
  public playBoardBoat() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [392.0, 440.0, 523.25, 587.33, 659.25]; // G4, A4, C5, D5, E5
    notes.forEach((freq, index) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteStart = now + index * 0.09;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteStart);

      gain.gain.setValueAtTime(0.22, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteStart);
      osc.stop(noteStart + 0.22);
    });
  }

  // Victory celebration fanfare
  public playVictory() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const melody = [
      { f: 523.25, d: 0.15 }, // C5
      { f: 523.25, d: 0.15 }, // C5
      { f: 523.25, d: 0.15 }, // C5
      { f: 659.25, d: 0.35 }, // E5
      { f: 587.33, d: 0.18 }, // D5
      { f: 659.25, d: 0.18 }, // E5
      { f: 783.99, d: 0.6 },  // G5 (held)
      { f: 1046.5, d: 0.8 },  // C6
    ];

    let t = now;
    melody.forEach((note) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, t);

      osc2.type = 'sawtooth';
      osc2.frequency.setValueAtTime(note.f / 2, t);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.setValueAtTime(0.18, t + note.d * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc2.start(t);
      osc.stop(t + note.d + 0.05);
      osc2.stop(t + note.d + 0.05);

      t += note.d * 0.95;
    });
  }

  // Game over sound
  public playGameOver() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [440, 392, 349.23, 293.66, 220]; // A4, G4, F4, D4, A3

    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = now + idx * 0.18;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, noteTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.85, noteTime + 0.28);

      gain.gain.setValueAtTime(0.25, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.3);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, noteTime);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(noteTime);
      osc.stop(noteTime + 0.32);
    });

    this.playSplash();
  }

  // Round clear upbeat fanfare
  public playRoundClear() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const chords = [
      { f: 523.25, d: 0.14 }, // C5
      { f: 659.25, d: 0.14 }, // E5
      { f: 783.99, d: 0.14 }, // G5
      { f: 1046.5, d: 0.45 }, // C6
    ];

    let t = now;
    chords.forEach((note) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, t);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + note.d);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + note.d + 0.05);
      t += note.d * 0.9;
    });
  }

  // Continuous Wave Roar sound based on proximity
  public updateWaveRoar(distanceFromWave: number) {
    if (this.isMuted) {
      this.stopWaveRoar();
      return;
    }
    this.initContext();
    if (!this.ctx) return;

    if (!this.waveRoarNode) {
      const buffer = this.createNoiseBuffer(3);
      if (!buffer) return;

      const source = this.ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.001, this.ctx.currentTime);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      source.start();
      this.waveRoarNode = { source, gain, filter };
    }

    // Adjust volume & filter cutoff based on how close the wave is
    // Distance typically 0 to 500
    const clampedDist = Math.max(0, Math.min(500, distanceFromWave));
    const proximity = 1 - clampedDist / 500; // 1 = right on top of player, 0 = far away
    const targetGain = Math.max(0.02, proximity * 0.32);
    const targetFreq = 180 + proximity * 520;

    const now = this.ctx.currentTime;
    this.waveRoarNode.gain.gain.setTargetAtTime(targetGain, now, 0.1);
    this.waveRoarNode.filter.frequency.setTargetAtTime(targetFreq, now, 0.1);
  }

  public stopWaveRoar() {
    if (this.waveRoarNode) {
      try {
        this.waveRoarNode.source.stop();
        this.waveRoarNode.source.disconnect();
      } catch {
        // ignore already stopped
      }
      this.waveRoarNode = null;
    }
  }

  public stopRiverAmbience() {
    if (this.riverAmbienceNode) {
      try {
        this.riverAmbienceNode.source.stop();
        this.riverAmbienceNode.source.disconnect();
      } catch {
        // ignore
      }
      this.riverAmbienceNode = null;
    }
  }

  public stopAll() {
    this.stopWaveRoar();
    this.stopRiverAmbience();
  }
}

export const soundManager = new SoundManager();
