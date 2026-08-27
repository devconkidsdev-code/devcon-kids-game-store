class AudioSystem {
  ctx: AudioContext | null = null;
  private isPlayingBGM = false;
  private bgmTimer: number | null = null;
  private nextNoteTime = 0;
  private currentNote = 0;
  
  private delayNode: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Setup global delay for happy bounce
      this.delayNode = this.ctx.createDelay();
      this.delayNode.delayTime.value = 0.428; // Dotted 8th at 105BPM
      this.delayFeedback = this.ctx.createGain();
      this.delayFeedback.gain.value = 0.25; // Less feedback, cleaner mix
      
      this.delayNode.connect(this.delayFeedback);
      this.delayFeedback.connect(this.delayNode);
      this.delayNode.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  startBGM() {
    if (!this.ctx) this.init();
    if (this.isPlayingBGM) return;
    this.isPlayingBGM = true;
    this.nextNoteTime = this.ctx!.currentTime + 0.1;
    this.currentNote = 0;
    this.bgmScheduler();
  }

  stopBGM() {
    this.isPlayingBGM = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  private bgmScheduler = () => {
    if (!this.isPlayingBGM || !this.ctx) return;
    
    // Lookahead scheduling
    while (this.nextNoteTime < this.ctx.currentTime + 0.1) {
      this.playBGMNote(this.nextNoteTime);
      this.nextNote();
    }
    this.bgmTimer = window.setTimeout(this.bgmScheduler, 25);
  };

  private playBGMNote(time: number) {
    if (!this.ctx) return;
    
    // Helper to get frequencies for the current chord
    // 4 bars, 16 16th notes per bar = 64 notes loop
    const getChord = (noteIndex: number) => {
        if (noteIndex < 16) return { root: 130.81, fifth: 196.00, arp: [261.63, 329.63, 392.00, 523.25] }; // C Major
        if (noteIndex < 32) return { root: 87.31, fifth: 130.81, arp: [174.61, 261.63, 349.23, 440.00] }; // F Major (lower)
        if (noteIndex < 48) return { root: 98.00, fifth: 146.83, arp: [196.00, 293.66, 392.00, 493.88] }; // G Major
        return { root: 130.81, fifth: 196.00, arp: [261.63, 329.63, 392.00, 523.25] }; // C Major
    };

    const chord = getChord(this.currentNote);

    // 1. Bouncy Bass (Quarter notes / 8th note rhythm)
    // Play on 0, 3, 8, 11 for a bouncy syncopation
    if (this.currentNote % 4 === 0 || this.currentNote % 8 === 3) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = (this.currentNote % 8 === 0) ? chord.root : chord.fifth;

        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.15, time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc.start(time);
        osc.stop(time + 0.3);
    }

    // 2. Cheerful Arpeggio / Melody
    // Play every 8th note (0, 2, 4, 6...)
    if (this.currentNote % 2 === 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        
        // Pick a note from the arpeggio
        const noteIdx = (this.currentNote / 2) % 4;
        osc.frequency.value = chord.arp[noteIdx];

        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.08, time + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        if (this.delayNode) gain.connect(this.delayNode); // Add spatial echo

        osc.start(time);
        osc.stop(time + 0.2);
    }

    // 3. Simple "Tick" Percussion on off-beats (to give it rhythm)
    if (this.currentNote % 4 === 2) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();
        
        osc.type = 'square';
        osc.frequency.value = 800; // High pitch tick

        filter.type = 'highpass';
        filter.frequency.value = 2000;

        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.02, time + 0.01); // Very quiet
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(time);
        osc.stop(time + 0.05);
    }
  }

  private nextNote() {
    const secondsPerBeat = 60.0 / 105; // 105 BPM relaxed tempo
    this.nextNoteTime += 0.25 * secondsPerBeat; // 16th notes
    this.currentNote++;
    if (this.currentNote >= 64) this.currentNote = 0; // Loop every 4 bars
  }

  playHit() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
    
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(t);
    osc.stop(t + 0.1);
  }

  playFix() {
    if (!this.ctx) return;
    this.playTone(523.25, 0.1, 0, 'sine'); // C5
    this.playTone(659.25, 0.2, 0.1, 'sine'); // E5
  }

  playLevelUp() {
    if (!this.ctx) return;
    this.playTone(440, 0.1, 0, 'square');
    this.playTone(554.37, 0.1, 0.15, 'square');
    this.playTone(659.25, 0.4, 0.3, 'square');
  }

  playGameOver() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 1.5);
    
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 1.5);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(t);
    osc.stop(t + 1.5);
  }

  playTone(freq: number, duration: number, delay: number, type: OscillatorType) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.15, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, t + duration);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(t);
    osc.stop(t + duration);
  }
}

export const audio = new AudioSystem();
