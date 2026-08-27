class AudioEngine {
  ctx: AudioContext | null = null;
  repairInterval: NodeJS.Timeout | null = null;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playTone(freq: number, type: OscillatorType, duration: number, vol = 0.1) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    gain.gain.setValueAtTime(vol, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playRepair() {
    this.playTone(600, 'sine', 0.1, 0.1);
    setTimeout(() => this.playTone(800, 'sine', 0.2, 0.1), 100);
  }

  playWrong() {
    this.playTone(150, 'sawtooth', 0.4, 0.2);
  }

  playWin() {
    [400, 500, 600, 800].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'square', 0.2, 0.1), i * 150);
    });
  }

  playLose() {
    [300, 250, 200, 150].forEach((freq, i) => {
      setTimeout(() => this.playTone(freq, 'sawtooth', 0.3, 0.2), i * 200);
    });
  }

  startRepairingSound() {
    if (this.repairInterval) return;
    this.playTone(400, 'square', 0.05, 0.05);
    this.repairInterval = setInterval(() => {
      this.playTone(400, 'square', 0.05, 0.05);
    }, 300);
  }

  stopRepairingSound() {
    if (this.repairInterval) {
      clearInterval(this.repairInterval);
      this.repairInterval = null;
    }
  }
}

export const audio = new AudioEngine();
