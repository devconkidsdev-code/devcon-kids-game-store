/**
 * Web Audio API Synthesizer & Instrumental Music Engine for Drop Quest
 * 100% Procedural - Zero external MP3/audio files required.
 * Generates lively, cheerful instrumental farm-adventure background music
 * with real-time acoustic/synth hybrid orchestration.
 */

interface NoteEvent {
  note: number; // MIDI note number or frequency
  duration: number; // in sixteenth-note steps
  velocity?: number;
}

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  private isMuted: boolean = false;
  private isMusicPlaying: boolean = false;
  private musicVolume: number = 0.28;
  private sfxVolume: number = 0.45;

  // Music Scheduler Variables
  private schedulerTimerId: number | null = null;
  private nextNoteTime: number = 0;
  private currentStep: number = 0;
  private tempo: number = 130; // Lively upbeat 130 BPM
  private readonly totalSteps: number = 64; // 16 bars of 4/4 (4 beats * 4 sixteenths = 64 steps)

  constructor() {
    // Audio context will be lazily initialized on first user gesture
  }

  private getContext(): AudioContext | null {
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();

        // Master Gain Node
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);

        // Music Sub-Gain
        this.musicGain = this.ctx.createGain();
        this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
        this.musicGain.connect(this.masterGain);

        // SFX Sub-Gain
        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
        this.sfxGain.connect(this.masterGain);
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  // ==========================================
  // MASTER & VOLUME CONTROLS
  // ==========================================

  public setEnabled(enabled: boolean) {
    this.isMuted = !enabled;
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    const now = ctx.currentTime;
    if (this.isMuted) {
      this.masterGain.gain.setTargetAtTime(0, now, 0.05);
    } else {
      this.masterGain.gain.setTargetAtTime(1, now, 0.05);
      if (!this.isMusicPlaying) {
        this.startMusic();
      }
    }
  }

  public isEnabled(): boolean {
    return !this.isMuted;
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    const ctx = this.getContext();
    if (ctx && this.musicGain) {
      this.musicGain.gain.setTargetAtTime(this.musicVolume, ctx.currentTime, 0.05);
    }
  }

  public getMusicVolume(): number {
    return this.musicVolume;
  }

  // ==========================================
  // INSTRUMENTAL BACKGROUND MUSIC ENGINE
  // ==========================================

  /**
   * Starts the lively instrumental background music loop.
   */
  public startMusic() {
    const ctx = this.getContext();
    if (!ctx) return;

    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;

    // Reset timing clock
    this.nextNoteTime = ctx.currentTime + 0.1;
    this.currentStep = 0;

    // Unpause context if needed
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    // Start background lookahead scheduler
    if (this.schedulerTimerId !== null) {
      window.clearInterval(this.schedulerTimerId);
    }
    this.schedulerTimerId = window.setInterval(() => this.scheduleMusicTick(), 25);
  }

  /**
   * Pauses the music temporarily (e.g. during game pause menu).
   */
  public pauseMusic() {
    if (this.schedulerTimerId !== null) {
      window.clearInterval(this.schedulerTimerId);
      this.schedulerTimerId = null;
    }
    this.isMusicPlaying = false;
  }

  /**
   * Resumes the music.
   */
  public resumeMusic() {
    if (this.isMuted) return;
    this.startMusic();
  }

  /**
   * Stops the background music completely.
   */
  public stopMusic() {
    this.pauseMusic();
    this.currentStep = 0;
  }

  /**
   * Ducks music volume during victory fanfare or game over.
   */
  public duckMusic(durationSec: number = 3.0) {
    const ctx = this.getContext();
    if (!ctx || !this.musicGain) return;
    const now = ctx.currentTime;
    this.musicGain.gain.setTargetAtTime(this.musicVolume * 0.15, now, 0.1);
    this.musicGain.gain.setTargetAtTime(this.musicVolume, now + durationSec, 0.4);
  }

  /**
   * High-precision lookahead scheduler loop
   */
  private scheduleMusicTick() {
    const ctx = this.getContext();
    if (!ctx || !this.isMusicPlaying) return;

    const secondsPer16th = 60 / this.tempo / 4;
    const lookahead = 0.12; // schedule 120ms ahead

    while (this.nextNoteTime < ctx.currentTime + lookahead) {
      this.playMusicStep(this.currentStep, this.nextNoteTime, secondsPer16th);
      this.nextNoteTime += secondsPer16th;
      this.currentStep = (this.currentStep + 1) % this.totalSteps;
    }
  }

  // Conversion helper from MIDI note to Hz
  private midiToFreq(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }

  /**
   * Plays all instruments for a given sixteenth-note step.
   */
  private playMusicStep(step: number, time: number, stepDuration: number) {
    const ctx = this.ctx;
    if (!ctx || !this.musicGain) return;

    // 1. MELODY LEAD (Lively Whistle / Flute / Plucked Synth)
    const melodyNote = this.MELODY_SCORE[step];
    if (melodyNote !== null && melodyNote.midi > 0) {
      this.playLeadNote(melodyNote, time, stepDuration * (melodyNote.duration || 1.8), melodyNote.vel || 1);
    }

    // 2. COUNTER-MELODY / ARPEGGIO CHORDS (Staccato Ukulele / Acoustic Strum)
    const chordNote = this.CHORD_SCORE[step];
    if (chordNote && chordNote.length > 0) {
      chordNote.forEach((m, idx) => {
        this.playChordPluck(m, time + idx * 0.008, stepDuration * 0.9);
      });
    }

    // 3. BOUNCING WALKING BASS
    const bassMidi = this.BASS_SCORE[step];
    if (bassMidi !== null && bassMidi > 0) {
      this.playBassNote(bassMidi, time, stepDuration * 1.6);
    }

    // 4. LIVELY RHYTHMIC PERCUSSION (Kick, Snare, Hi-Hat)
    const perc = this.PERCUSSION_SCORE[step];
    if (perc) {
      if (perc.kick) this.playKick(time);
      if (perc.snare) this.playSnare(time);
      if (perc.hat) this.playHiHat(time, perc.hatOpen);
    }
  }

  // --- Lead Flute/Pluck Synthesizer ---
  private playLeadNote(noteData: { midi: number; duration?: number }, time: number, durationSec: number, vel: number = 1) {
    const ctx = this.ctx;
    if (!ctx || !this.musicGain) return;

    try {
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      const freq = this.midiToFreq(noteData.midi);

      // Warm triangle + subtle square for rich acoustic-chiptune flavor
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(freq * 2, time); // 1 octave overtone

      // Vibrato LFO for joyful character
      const vibrato = ctx.createOscillator();
      const vibratoGain = ctx.createGain();
      vibrato.frequency.setValueAtTime(6.0, time); // 6 Hz vibrato
      vibratoGain.gain.setValueAtTime(2.5, time); // subtle pitch wobble
      vibrato.connect(osc.frequency);
      vibrato.start(time + 0.08); // start vibrato slightly after attack
      vibrato.stop(time + durationSec);

      // Warm low-pass filter
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2400, time);
      filter.frequency.exponentialRampToValueAtTime(1400, time + durationSec);

      // ADSR Envelope
      const attack = 0.02;
      const decay = 0.08;
      const peakGain = 0.16 * vel;
      const sustainGain = 0.11 * vel;

      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(peakGain, time + attack);
      gain.gain.exponentialRampToValueAtTime(sustainGain, time + attack + decay);
      gain.gain.setValueAtTime(sustainGain, time + Math.max(0, durationSec - 0.04));
      gain.gain.exponentialRampToValueAtTime(0.001, time + durationSec);

      osc.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(time);
      osc2.start(time);
      osc.stop(time + durationSec + 0.05);
      osc2.stop(time + durationSec + 0.05);
    } catch {
      // Audio node failure guard
    }
  }

  // --- Staccato Harmony Pluck (Ukulele / Guitar Chords) ---
  private playChordPluck(midi: number, time: number, durationSec: number) {
    const ctx = this.ctx;
    if (!ctx || !this.musicGain) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      const freq = this.midiToFreq(midi);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1600, time);
      filter.Q.setValueAtTime(2.0, time);

      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(0.06, time + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.001, time + durationSec);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(time);
      osc.stop(time + durationSec + 0.02);
    } catch {
      // Ignore
    }
  }

  // --- Bouncing Upright Bass Synthesizer ---
  private playBassNote(midi: number, time: number, durationSec: number) {
    const ctx = this.ctx;
    if (!ctx || !this.musicGain) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      const freq = this.midiToFreq(midi);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, time);

      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(0.18, time + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, time + durationSec);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(time);
      osc.stop(time + durationSec + 0.02);
    } catch {
      // Ignore
    }
  }

  // --- Rhythm Section: Kick ---
  private playKick(time: number) {
    const ctx = this.ctx;
    if (!ctx || !this.musicGain) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, time);
      osc.frequency.exponentialRampToValueAtTime(32, time + 0.09);

      gain.gain.setValueAtTime(0.2, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(time);
      osc.stop(time + 0.11);
    } catch {
      // Ignore
    }
  }

  // --- Rhythm Section: Snare / Rimshot ---
  private playSnare(time: number) {
    const ctx = this.ctx;
    if (!ctx || !this.musicGain) return;

    try {
      // Noise burst for snare snap
      const bufferSize = Math.floor(ctx.sampleRate * 0.08);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1000, time);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      noise.start(time);
      noise.stop(time + 0.085);

      // Body tone
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, time);
      osc.frequency.exponentialRampToValueAtTime(80, time + 0.05);

      oscGain.gain.setValueAtTime(0.1, time);
      oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

      osc.connect(oscGain);
      oscGain.connect(this.musicGain);

      osc.start(time);
      osc.stop(time + 0.06);
    } catch {
      // Ignore
    }
  }

  // --- Rhythm Section: Hi-Hat ---
  private playHiHat(time: number, open: boolean = false) {
    const ctx = this.ctx;
    if (!ctx || !this.musicGain) return;

    try {
      const dur = open ? 0.08 : 0.035;
      const bufferSize = Math.floor(ctx.sampleRate * dur);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(6500, time);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(open ? 0.08 : 0.05, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      noise.start(time);
      noise.stop(time + dur + 0.01);
    } catch {
      // Ignore
    }
  }

  // ==========================================
  // MUSICAL COMPOSITION SCORE (16 BARS = 64 STEPS)
  // Key: C Major / A Minor, Upbeat Folk Platformer
  // ==========================================

  // Lead Melody: Array of 64 sixteenth-note steps
  private readonly MELODY_SCORE: Array<{ midi: number; duration?: number; vel?: number } | null> = (() => {
    const s: Array<{ midi: number; duration?: number; vel?: number } | null> = new Array(64).fill(null);

    // Section 1: Cheerful morning farm theme
    // Bar 1 (Steps 0-3): C5 -> E5 -> G5
    s[0] = { midi: 72, duration: 1.8, vel: 1.0 }; // C5
    s[2] = { midi: 76, duration: 1.8, vel: 0.9 }; // E5
    // Bar 2 (Steps 4-7): G5 -> A5 -> G5 -> E5
    s[4] = { midi: 79, duration: 2.2, vel: 1.0 }; // G5
    s[6] = { midi: 81, duration: 1.5, vel: 1.1 }; // A5
    s[7] = { midi: 79, duration: 1.5, vel: 0.9 }; // G5
    // Bar 3 (Steps 8-11): F5 -> A5 -> C6
    s[8] = { midi: 77, duration: 1.8, vel: 1.0 }; // F5
    s[10] = { midi: 81, duration: 1.8, vel: 0.9 }; // A5
    // Bar 4 (Steps 12-15): B5 -> A5 -> G5
    s[12] = { midi: 83, duration: 2.0, vel: 1.0 }; // B5
    s[14] = { midi: 79, duration: 2.0, vel: 0.9 }; // G5

    // Bar 5 (Steps 16-19): E5 -> G5 -> C6
    s[16] = { midi: 76, duration: 1.8, vel: 1.0 }; // E5
    s[18] = { midi: 79, duration: 1.8, vel: 0.9 }; // G5
    // Bar 6 (Steps 20-23): A5 -> C6 -> E6
    s[20] = { midi: 81, duration: 2.0, vel: 1.1 }; // A5
    s[22] = { midi: 84, duration: 2.2, vel: 1.2 }; // C6
    // Bar 7 (Steps 24-27): D6 -> B5 -> G5 -> A5
    s[24] = { midi: 86, duration: 1.8, vel: 1.1 }; // D6
    s[26] = { midi: 83, duration: 1.8, vel: 1.0 }; // B5
    // Bar 8 (Steps 28-31): C6 (resolving note)
    s[28] = { midi: 84, duration: 3.5, vel: 1.2 }; // C6

    // Section 2: Energetic drop quest hop (High energy)
    // Bar 9 (Steps 32-35): E6 -> D6 -> C6
    s[32] = { midi: 88, duration: 1.8, vel: 1.1 }; // E6
    s[34] = { midi: 86, duration: 1.5, vel: 1.0 }; // D6
    // Bar 10 (Steps 36-39): C6 -> B5 -> A5 -> G5
    s[36] = { midi: 84, duration: 1.8, vel: 1.0 }; // C6
    s[38] = { midi: 81, duration: 1.8, vel: 1.0 }; // A5
    s[39] = { midi: 79, duration: 1.5, vel: 0.9 }; // G5
    // Bar 11 (Steps 40-43): A5 -> C6 -> F6
    s[40] = { midi: 81, duration: 1.8, vel: 1.0 }; // A5
    s[42] = { midi: 84, duration: 1.8, vel: 1.1 }; // C6
    // Bar 12 (Steps 44-47): E6 -> D6 -> C6
    s[44] = { midi: 88, duration: 2.0, vel: 1.2 }; // E6
    s[46] = { midi: 86, duration: 2.0, vel: 1.0 }; // D6

    // Bar 13 (Steps 48-51): F5 -> A5 -> D6
    s[48] = { midi: 77, duration: 1.8, vel: 1.0 }; // F5
    s[50] = { midi: 81, duration: 1.8, vel: 1.0 }; // A5
    s[51] = { midi: 86, duration: 1.8, vel: 1.1 }; // D6
    // Bar 14 (Steps 52-55): B5 -> C6 -> D6 -> G5
    s[52] = { midi: 83, duration: 1.5, vel: 1.0 }; // B5
    s[53] = { midi: 84, duration: 1.5, vel: 1.0 }; // C6
    s[54] = { midi: 86, duration: 1.8, vel: 1.1 }; // D6
    s[55] = { midi: 79, duration: 1.5, vel: 0.9 }; // G5
    // Bar 15-16 (Steps 56-63): Joyous cascade & turnaround
    s[56] = { midi: 84, duration: 1.5, vel: 1.2 }; // C6
    s[58] = { midi: 88, duration: 1.5, vel: 1.2 }; // E6
    s[60] = { midi: 91, duration: 2.0, vel: 1.3 }; // G6
    s[62] = { midi: 86, duration: 1.8, vel: 1.0 }; // D6

    return s;
  })();

  // Offbeat Strummed Chords
  private readonly CHORD_SCORE: Array<number[] | null> = (() => {
    const s: Array<number[] | null> = new Array(64).fill(null);
    const C_MAJ = [60, 64, 67]; // C4, E4, G4
    const F_MAJ = [60, 65, 69]; // C4, F4, A4
    const G_MAJ = [59, 62, 67]; // B3, D4, G4
    const A_MIN = [60, 64, 69]; // C4, E4, A4
    const D_MIN = [62, 65, 69]; // D4, F4, A4
    const E_MIN = [64, 67, 71]; // E4, G4, B4

    // Offbeat strum on steps 1, 3 in each bar
    for (let b = 0; b < 16; b++) {
      const base = b * 4;
      let chord = C_MAJ;

      if (b === 2 || b === 3) chord = F_MAJ;
      else if (b === 3 || b === 7 || b === 13 || b === 14) chord = G_MAJ;
      else if (b === 5 || b === 8 || b === 9) chord = A_MIN;
      else if (b === 10) chord = E_MIN;
      else if (b === 6 || b === 12) chord = D_MIN;
      else if (b === 11) chord = F_MAJ;

      s[base + 1] = chord;
      s[base + 3] = chord;
    }
    return s;
  })();

  // Bouncing Walking Bass: MIDI Note
  private readonly BASS_SCORE: Array<number | null> = (() => {
    const s: Array<number | null> = new Array(64).fill(null);
    // 16 bars with walking bass on beats 0 & 2
    const bassPattern = [
      // Bar 1 (C)
      48, 55, // C3, G3
      // Bar 2 (C)
      48, 52, // C3, E3
      // Bar 3 (F)
      41, 48, // F2, C3
      // Bar 4 (G)
      43, 50, // G2, D3
      // Bar 5 (C)
      48, 55, // C3, G3
      // Bar 6 (Am)
      45, 52, // A2, E3
      // Bar 7 (Dm)
      38, 45, // D2, A2
      // Bar 8 (G -> C)
      43, 48, // G2, C3

      // Bar 9 (Am)
      45, 52, // A2, E3
      // Bar 10 (Em)
      40, 47, // E2, B2
      // Bar 11 (F)
      41, 48, // F2, C3
      // Bar 12 (C)
      48, 43, // C3, G2
      // Bar 13 (Dm)
      38, 45, // D2, A2
      // Bar 14 (G)
      43, 50, // G2, D3
      // Bar 15 (F)
      41, 48, // F2, C3
      // Bar 16 (G -> C)
      43, 48, // G2, C3
    ];

    for (let b = 0; b < 16; b++) {
      s[b * 4 + 0] = bassPattern[b * 2];
      s[b * 4 + 2] = bassPattern[b * 2 + 1];
    }
    return s;
  })();

  // Percussion Track: Kick on 0 & 2, Snare on 1 & 3 (in 4-beat terms = step 0, 4, 8, 12)
  private readonly PERCUSSION_SCORE: Array<{ kick?: boolean; snare?: boolean; hat?: boolean; hatOpen?: boolean } | null> = (() => {
    const s: Array<{ kick?: boolean; snare?: boolean; hat?: boolean; hatOpen?: boolean } | null> = new Array(64).fill(null);

    for (let i = 0; i < 64; i++) {
      const beatInBar = i % 4;
      const isDownbeat = beatInBar === 0;
      const isBackbeat = beatInBar === 2;
      const isEighth = beatInBar % 2 === 0;

      s[i] = {
        kick: isDownbeat,
        snare: isBackbeat,
        hat: true,
        hatOpen: i % 8 === 4,
      };
    }
    return s;
  })();

  // ==========================================
  // RETRO SOUND EFFECTS (SFX)
  // ==========================================

  public playJump() {
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(460, now + 0.14);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.14);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Ignore
    }
  }

  public playStomp() {
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      // Bouncy stomp squish effect
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);

      osc2.type = 'square';
      osc2.frequency.setValueAtTime(180, now);
      osc2.frequency.exponentialRampToValueAtTime(60, now + 0.08);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + 0.15);
      osc2.stop(now + 0.15);
    } catch {
      // Ignore
    }
  }

  public playCollect(combo: number = 0) {
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const baseFreqs = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];
      const freq = baseFreqs[combo % baseFreqs.length];

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.4, now + 0.12);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.18);
    } catch {
      // Ignore
    }
  }

  public playGoldenDrop() {
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    try {
      const notes = [659.25, 783.99, 1046.5, 1318.51];
      notes.forEach((note, index) => {
        const now = ctx.currentTime + index * 0.045;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(note, now);

        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.16);
      });
    } catch {
      // Ignore
    }
  }

  public playHurt() {
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.linearRampToValueAtTime(80, now + 0.22);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.22);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.23);
    } catch {
      // Ignore
    }
  }

  public playFallPit() {
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(360, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.35);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch {
      // Ignore
    }
  }

  public playLevelWin() {
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    // Duck background music for victory fanfare
    this.duckMusic(2.5);

    try {
      const chords = [
        { f: 523.25, time: 0 },
        { f: 659.25, time: 0.1 },
        { f: 783.99, time: 0.2 },
        { f: 1046.5, time: 0.3 },
        { f: 1318.51, time: 0.45 },
      ];

      chords.forEach(c => {
        const now = ctx.currentTime + c.time;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(c.f, now);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

        osc.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(now);
        osc.stop(now + 0.5);
      });
    } catch {
      // Ignore
    }
  }

  public playGameOver() {
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    this.duckMusic(3.0);

    try {
      const sadNotes = [392.0, 370.0, 349.23, 311.13, 261.63];
      sadNotes.forEach((f, idx) => {
        const now = ctx.currentTime + idx * 0.16;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);

        osc.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(now);
        osc.stop(now + 0.35);
      });
    } catch {
      // Ignore
    }
  }

  public playWateringSplash() {
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    try {
      const now = ctx.currentTime;
      const bufferSize = Math.floor(ctx.sampleRate * 0.28);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(850, now);
      filter.frequency.exponentialRampToValueAtTime(280, now + 0.28);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      noise.start(now);
      noise.stop(now + 0.29);
    } catch {
      // Ignore
    }
  }

  public playSeedSpit() {
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    try {
      const now = ctx.currentTime;
      // Quick percussive "pop / spit" sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(480, now);
      osc.frequency.exponentialRampToValueAtTime(140, now + 0.09);

      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch {
      // Ignore
    }
  }

  public playSeedHit() {
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(70, now + 0.06);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // Ignore
    }
  }

  public playSunflowerStomp() {
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    try {
      const now = ctx.currentTime;
      // Crunchy floral burst sound
      const osc = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.16);

      osc2.type = 'square';
      osc2.frequency.setValueAtTime(240, now);
      osc2.frequency.exponentialRampToValueAtTime(75, now + 0.12);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

      osc.connect(gain);
      osc2.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc2.start(now);
      osc.stop(now + 0.19);
      osc2.stop(now + 0.19);
    } catch {
      // Ignore
    }
  }

  public playBlockBump() {
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    try {
      const now = ctx.currentTime;
      // Mario-style hollow bump sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Ignore
    }
  }

  public playPowerUpSpawn() {
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    try {
      const now = ctx.currentTime;
      // Rising magical sparkle chime: C5 -> E5 -> G5 -> C6 -> E6
      const freqs = [523.25, 659.25, 783.99, 1046.5, 1318.51];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + idx * 0.05;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t);

        gain.gain.setValueAtTime(0.2, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

        osc.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(t);
        osc.stop(t + 0.14);
      });
    } catch {
      // Ignore
    }
  }

  public playPowerUpCollect() {
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    try {
      const now = ctx.currentTime;
      // Victorious fanfare chord
      const chords = [
        { f: 523.25, t: 0, d: 0.1 },
        { f: 659.25, t: 0.08, d: 0.1 },
        { f: 783.99, t: 0.16, d: 0.1 },
        { f: 1046.5, t: 0.24, d: 0.25 },
        { f: 1318.51, t: 0.24, d: 0.25 },
      ];
      chords.forEach(c => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + c.t;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(c.f, t);

        gain.gain.setValueAtTime(0.25, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + c.d);

        osc.connect(gain);
        gain.connect(this.sfxGain!);

        osc.start(t);
        osc.stop(t + c.d + 0.02);
      });
    } catch {
      // Ignore
    }
  }

  public playWaterGunShot() {
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    try {
      const now = ctx.currentTime;
      // High pressure water squirt: pitch drop + noise filter
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, now);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.1);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch {
      // Ignore
    }
  }

  public playWaterGunSplash() {
    const ctx = this.getContext();
    if (!ctx || !this.sfxGain) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Ignore
    }
  }
}

export const sound = new SoundEngine();
