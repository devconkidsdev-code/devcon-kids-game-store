/**
 * Synthetic CBFMMP Emergency Siren Generator using Web Audio API
 */

class SirenSynthesizer {
  private audioCtx: AudioContext | null = null;
  private osc: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private intervalId: number | null = null;
  private isPlaying = false;

  private initContext() {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public playAlertSiren(pattern: 'alert' | 'evacuate' = 'alert', volume = 0.15) {
    this.stop();
    try {
      this.initContext();
      if (!this.audioCtx) return;

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sawtooth';
      gain.gain.setValueAtTime(volume, this.audioCtx.currentTime);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      const startTime = this.audioCtx.currentTime;

      if (pattern === 'alert') {
        // Continuous wavering tone (440Hz to 880Hz every 2.5s)
        const period = 2.5;
        for (let i = 0; i < 20; i++) {
          const t = startTime + i * period;
          osc.frequency.setValueAtTime(440, t);
          osc.frequency.linearRampToValueAtTime(880, t + period / 2);
          osc.frequency.linearRampToValueAtTime(440, t + period);
        }
      } else {
        // High-urgency pulsing siren (600Hz to 1200Hz rapid sweep every 1.0s)
        const period = 1.0;
        for (let i = 0; i < 40; i++) {
          const t = startTime + i * period;
          osc.frequency.setValueAtTime(600, t);
          osc.frequency.exponentialRampToValueAtTime(1200, t + period * 0.4);
          osc.frequency.exponentialRampToValueAtTime(600, t + period * 0.8);
          gain.gain.setValueAtTime(volume, t);
          gain.gain.setValueAtTime(0.01, t + period * 0.95);
        }
      }

      osc.start(startTime);
      this.osc = osc;
      this.gainNode = gain;
      this.isPlaying = true;
    } catch {
      // Audio context might be restricted before user gesture
    }
  }

  public stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.osc) {
      try {
        this.osc.stop();
        this.osc.disconnect();
      } catch {
        // Already stopped
      }
      this.osc = null;
    }
    if (this.gainNode) {
      try {
        this.gainNode.disconnect();
      } catch {
        // Already disconnected
      }
      this.gainNode = null;
    }
    this.isPlaying = false;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const sirenAudio = new SirenSynthesizer();
