// Web Audio API Procedural Sound Synthesizer for Boat Race

class SoundSystem {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isMusicMuted: boolean = false;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private musicInterval: number | null = null;

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
    if (muted && this.engineGain) {
      this.engineGain.gain.setValueAtTime(0, this.ctx?.currentTime || 0);
    }
  }

  public setMusicMuted(muted: boolean) {
    this.isMusicMuted = muted;
    if (muted && this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  // Countdown Beep (Short high beep for 3,2,1 and long higher beep for GO)
  public playCountdown(isGo: boolean = false) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = isGo ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(isGo ? 880 : 440, now);
    if (isGo) {
      osc.frequency.exponentialRampToValueAtTime(1320, now + 0.35);
    }

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (isGo ? 0.45 : 0.2));

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + (isGo ? 0.45 : 0.2));
  }

  // Engine hum with dynamic pitch based on speed (0 to 1)
  public updateEngine(speedPercent: number, isMoving: boolean) {
    if (this.isMuted || !isMoving) {
      if (this.engineGain && this.ctx) {
        this.engineGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
      }
      return;
    }
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    if (!this.engineOsc) {
      this.engineOsc = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();
      this.engineOsc.type = 'sawtooth';
      
      // Low pass filter to make engine smooth like a boat motor
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, now);

      this.engineOsc.connect(filter);
      filter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);
      this.engineGain.gain.setValueAtTime(0, now);
      this.engineOsc.start();
    }

    if (this.engineGain && this.engineOsc) {
      const targetFreq = 55 + speedPercent * 90;
      const targetVol = 0.04 + speedPercent * 0.06;
      this.engineOsc.frequency.setTargetAtTime(targetFreq, now, 0.05);
      this.engineGain.gain.setTargetAtTime(targetVol, now, 0.05);
    }
  }

  public stopEngine() {
    if (this.engineGain && this.ctx) {
      this.engineGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.05);
    }
  }

  // Splash sound for switching lanes or passing waves
  public playSplash() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const bufferSize = this.ctx.sampleRate * 0.18;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.5, this.ctx.currentTime);

    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
    noise.stop(now + 0.18);
  }

  // Crash / Obstacle Collision (Thump + Splash + Alert)
  public playCollision() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Low boom oscillator
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.25);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);

    // High alarm alert chirp
    const alertOsc = this.ctx.createOscillator();
    const alertGain = this.ctx.createGain();
    alertOsc.type = 'sawtooth';
    alertOsc.frequency.setValueAtTime(440, now + 0.05);
    alertOsc.frequency.setValueAtTime(330, now + 0.15);

    alertGain.gain.setValueAtTime(0.18, now + 0.05);
    alertGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    alertOsc.connect(alertGain);
    alertGain.connect(this.ctx.destination);
    alertOsc.start(now + 0.05);
    alertOsc.stop(now + 0.3);
  }

  // Life Lost Alarm sound
  public playLifeLost() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(250, now);
    osc.frequency.setValueAtTime(180, now + 0.1);
    osc.frequency.setValueAtTime(120, now + 0.2);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  // Turbo speed boost chime
  public playTurbo() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [440, 554, 659, 880];
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.18, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.05 + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 0.15);
    });
  }

  // Star / Token pickup
  public playStarPickup() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, now); // D5
    osc.frequency.setValueAtTime(880, now + 0.08); // A5

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  // Boat Horn (Fun interactive boat horn)
  public playHorn() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(220, now);
    osc2.frequency.setValueAtTime(277.18, now); // Major third

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.45);
    osc2.stop(now + 0.45);
  }

  // Finish line celebration fanfare
  public playFinishFanfare() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const chords = [
      { t: 0, f: [523.25, 659.25, 783.99] }, // C5
      { t: 0.15, f: [587.33, 739.99, 880.0] }, // D5
      { t: 0.3, f: [659.25, 830.61, 987.77] }, // E5
      { t: 0.48, f: [783.99, 987.77, 1174.66, 1567.98] } // G5 Big chord
    ];

    chords.forEach(({ t, f }) => {
      f.forEach(freq => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + t);

        gain.gain.setValueAtTime(0.12, now + t);
        gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.4);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start(now + t);
        osc.stop(now + t + 0.4);
      });
    });
  }

  // Ambient Tropical Water Theme BGM
  public startMusic() {
    if (this.isMusicMuted || this.musicInterval) return;
    this.initContext();
    if (!this.ctx) return;

    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25]; // Pentatonic C
    let step = 0;

    this.musicInterval = window.setInterval(() => {
      if (this.isMusicMuted || !this.ctx) return;
      
      const now = this.ctx.currentTime;
      const freq = scale[step % scale.length];
      step = (step + Math.floor(Math.random() * 3) + 1) % scale.length;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.3);
    }, 280);
  }

  public stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const soundManager = new SoundSystem();
