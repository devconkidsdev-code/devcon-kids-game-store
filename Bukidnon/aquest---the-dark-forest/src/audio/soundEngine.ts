/**
 * Web Audio API procedural sound synthesizer for immersive cinematic horror atmosphere,
 * dynamic creature footsteps & chase sounds, and analog proximity terror.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private horrorMusicGain: GainNode | null = null;
  private terrorDroneGain: GainNode | null = null;
  private terrorScreechGain: GainNode | null = null;
  private creatureBreathingGain: GainNode | null = null;
  
  private ambientOsc1: OscillatorNode | null = null;
  private ambientOsc2: OscillatorNode | null = null;
  private terrorOsc1: OscillatorNode | null = null;
  private terrorOsc2: OscillatorNode | null = null;
  private terrorOsc3: OscillatorNode | null = null;
  private noiseNode: AudioBufferSourceNode | null = null;
  
  private heartbeatInterval: number | null = null;
  private musicInterval: number | null = null;
  private creatureFootstepTimer: number | null = null;
  private currentBpm: number = 60;
  private proximityRatio: number = 0;
  private isHunting: boolean = false;
  private isResting: boolean = false;
  
  public isMuted: boolean = false;
  private initialized: boolean = false;
  private customJumpscareBuffer: AudioBuffer | null = null;
  private customJumpscareName: string = 'Default Horror Screech';

  public init() {
    if (this.initialized && this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return;
    }

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.initialized = true;

      // Master output
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.startAmbience();
      this.startHorrorMusicLoop();
      this.startTerrorProximitySynthesizer();
      this.startHeartbeatLoop();
      this.startCreatureRunningAudioLoop();
      this.loadDefaultOrCachedJumpscareAudio();
    } catch (e) {
      console.warn('AudioContext failed to initialize', e);
    }
  }

  /**
   * Load custom jumpscare audio from localStorage or URL
   */
  public async loadDefaultOrCachedJumpscareAudio() {
    try {
      const cached = localStorage.getItem('custom_jumpscare_audio');
      const cachedName = localStorage.getItem('custom_jumpscare_name') || 'Custom Uploaded Sound';
      if (cached) {
        await this.decodeAndStoreCustomAudio(cached, cachedName, false);
        return;
      }

      // Check if standard jumpscare sound files exist in root/public
      const candidates = ['/jumpscare.mp3', '/jumpscare.wav', '/jumpscare.ogg', '/assets/jumpscare.mp3'];
      for (const url of candidates) {
        try {
          const res = await fetch(url);
          if (res.ok && res.headers.get('content-type')?.includes('audio')) {
            const buf = await res.arrayBuffer();
            if (this.ctx) {
              const decoded = await this.ctx.decodeAudioData(buf);
              this.customJumpscareBuffer = decoded;
              this.customJumpscareName = 'Captured Screamer Sound';
              return;
            }
          }
        } catch {
          // continue
        }
      }
    } catch (e) {
      console.warn('Could not load cached jumpscare audio', e);
    }
  }

  /**
   * Set and decode a custom audio file (File, Blob, or Data URI / URL) for jumpscare
   */
  public async setCustomJumpscareAudio(fileOrData: File | Blob | string, name?: string): Promise<boolean> {
    if (!this.ctx) {
      this.init();
    }
    if (!this.ctx) return false;

    try {
      let arrayBuffer: ArrayBuffer;
      const soundName = name || (typeof fileOrData === 'string' ? 'Custom Audio' : (fileOrData as File).name || 'Custom Audio');

      if (typeof fileOrData === 'string') {
        if (fileOrData.startsWith('data:')) {
          const res = await fetch(fileOrData);
          arrayBuffer = await res.arrayBuffer();
        } else {
          const res = await fetch(fileOrData);
          arrayBuffer = await res.arrayBuffer();
        }
      } else {
        arrayBuffer = await fileOrData.arrayBuffer();

        // Also convert to data URL to save in localStorage if < 5MB
        if (fileOrData.size < 5 * 1024 * 1024) {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              if (typeof reader.result === 'string') {
                localStorage.setItem('custom_jumpscare_audio', reader.result);
                localStorage.setItem('custom_jumpscare_name', soundName);
              }
            } catch {
              // localStorage full
            }
          };
          reader.readAsDataURL(fileOrData);
        }
      }

      const decoded = await this.ctx.decodeAudioData(arrayBuffer);
      this.customJumpscareBuffer = decoded;
      this.customJumpscareName = soundName;
      return true;
    } catch (e) {
      console.error('Failed to decode custom jumpscare audio:', e);
      return false;
    }
  }

  private async decodeAndStoreCustomAudio(dataUri: string, name: string, saveToLocal: boolean) {
    if (!this.ctx) return;
    try {
      const res = await fetch(dataUri);
      const buf = await res.arrayBuffer();
      const decoded = await this.ctx.decodeAudioData(buf);
      this.customJumpscareBuffer = decoded;
      this.customJumpscareName = name;
      if (saveToLocal) {
        localStorage.setItem('custom_jumpscare_audio', dataUri);
        localStorage.setItem('custom_jumpscare_name', name);
      }
    } catch (e) {
      console.warn('Failed decoding stored audio', e);
    }
  }

  public resetJumpscareAudio() {
    this.customJumpscareBuffer = null;
    this.customJumpscareName = 'Default Horror Screech';
    localStorage.removeItem('custom_jumpscare_audio');
    localStorage.removeItem('custom_jumpscare_name');
  }

  public getCustomJumpscareInfo(): { hasCustom: boolean; name: string } {
    return {
      hasCustom: !!this.customJumpscareBuffer,
      name: this.customJumpscareName,
    };
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 1.0, this.ctx.currentTime);
    }
  }

  /**
   * Deep unsettling sub-drone and eerie rustling wind noise (No pixel/8-bit artifacts)
   */
  private startAmbience() {
    if (!this.ctx || !this.masterGain) return;

    try {
      const ambGain = this.ctx.createGain();
      ambGain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      ambGain.connect(this.masterGain);
      this.ambientGain = ambGain;

      // Low frequency sub-rumble (42Hz - deep dark foundation)
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(42, this.ctx.currentTime);
      
      const filter1 = this.ctx.createBiquadFilter();
      filter1.type = 'lowpass';
      filter1.frequency.setValueAtTime(90, this.ctx.currentTime);
      filter1.Q.setValueAtTime(3, this.ctx.currentTime);

      const oscGain1 = this.ctx.createGain();
      oscGain1.gain.setValueAtTime(0.3, this.ctx.currentTime);

      osc1.connect(filter1);
      filter1.connect(oscGain1);
      oscGain1.connect(ambGain);
      osc1.start();
      this.ambientOsc1 = osc1;

      // Detuned slow undulating drone
      const osc2 = this.ctx.createOscillator();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(43.5, this.ctx.currentTime);
      const oscGain2 = this.ctx.createGain();
      oscGain2.gain.setValueAtTime(0.32, this.ctx.currentTime);
      osc2.connect(oscGain2);
      oscGain2.connect(ambGain);
      osc2.start();
      this.ambientOsc2 = osc2;

      // Wind whisper noise buffer (Brownian/Pink organic forest rustle)
      const bufferSize = this.ctx.sampleRate * 3;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99 * b0 + white * 0.05;
        b1 = 0.95 * b1 + white * 0.1;
        b2 = 0.85 * b2 + white * 0.2;
        output[i] = (b0 + b1 + b2) * 0.2;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(240, this.ctx.currentTime);
      noiseFilter.Q.setValueAtTime(2.5, this.ctx.currentTime);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

      whiteNoise.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(ambGain);
      whiteNoise.start();
      this.noiseNode = whiteNoise;
    } catch (e) {
      console.warn('Ambient audio start failed', e);
    }
  }

  /**
   * Procedural horror background music - cinematic dark strings & ominous low brass
   */
  private startHorrorMusicLoop() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
    }

    const horrorChords = [
      [55.0, 82.41, 98.0, 123.47],  // A1, E2, G2, B2
      [51.91, 77.78, 103.83, 130.81], // G#1, D#2, G#2, C3 (unsettling chromatic)
      [49.0, 73.42, 92.5, 116.54],  // G1, D2, F#2, Bb2
      [46.25, 69.3, 87.31, 110.0],  // F#1, C#2, F2, A2
    ];
    let chordIndex = 0;

    const playHorrorMeasure = () => {
      if (!this.ctx || this.isMuted || this.ctx.state !== 'running' || !this.masterGain) return;

      try {
        const t = this.ctx.currentTime;
        const freqs = horrorChords[chordIndex % horrorChords.length];
        chordIndex++;

        // Swelling dark string chord
        freqs.forEach((f, idx) => {
          const osc = this.ctx!.createOscillator();
          const gain = this.ctx!.createGain();
          const filter = this.ctx!.createBiquadFilter();

          osc.type = idx === 0 ? 'sawtooth' : 'triangle';
          osc.frequency.setValueAtTime(f + (Math.random() - 0.5) * 1.0, t);

          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(140 + idx * 50, t);
          filter.frequency.linearRampToValueAtTime(260 + idx * 80, t + 2.8);
          filter.frequency.linearRampToValueAtTime(120, t + 6.0);

          gain.gain.setValueAtTime(0.001, t);
          gain.gain.linearRampToValueAtTime(0.07 / (idx + 1), t + 2.2);
          gain.gain.linearRampToValueAtTime(0.001, t + 6.2);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(this.masterGain!);

          osc.start(t);
          osc.stop(t + 6.5);
        });

        // Ominous resonant low bell / woodblock
        if (Math.random() > 0.45) {
          const bellOsc = this.ctx.createOscillator();
          const bellGain = this.ctx.createGain();
          bellOsc.type = 'sine';
          bellOsc.frequency.setValueAtTime(329.63, t + 1.5); // E4

          bellGain.gain.setValueAtTime(0.05, t + 1.5);
          bellGain.gain.exponentialRampToValueAtTime(0.0001, t + 4.5);

          bellOsc.connect(bellGain);
          bellGain.connect(this.masterGain);

          bellOsc.start(t + 1.5);
          bellOsc.stop(t + 4.6);
        }
      } catch (e) {
        // ignore
      }
    };

    playHorrorMeasure();
    this.musicInterval = window.setInterval(playHorrorMeasure, 6200);
  }

  /**
   * Intense proximity horror synthesizer:
   * Analog distorted drone and bowed metal tension that swells dynamically
   */
  private startTerrorProximitySynthesizer() {
    if (!this.ctx || !this.masterGain) return;

    try {
      const terrorGain = this.ctx.createGain();
      terrorGain.gain.setValueAtTime(0, this.ctx.currentTime);
      terrorGain.connect(this.masterGain);
      this.terrorDroneGain = terrorGain;

      // Dark cluster oscillators
      const osc1 = this.ctx.createOscillator();
      osc1.type = 'sawtooth';
      osc1.frequency.setValueAtTime(110, this.ctx.currentTime); // A2 low rasp

      const osc2 = this.ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(116.54, this.ctx.currentTime); // Bb2 dissonance

      const osc3 = this.ctx.createOscillator();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(311.13, this.ctx.currentTime); // Eb4 tritone

      const screechFilter = this.ctx.createBiquadFilter();
      screechFilter.type = 'bandpass';
      screechFilter.frequency.setValueAtTime(280, this.ctx.currentTime);
      screechFilter.Q.setValueAtTime(4.5, this.ctx.currentTime);

      const screechGain = this.ctx.createGain();
      screechGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.terrorScreechGain = screechGain;

      osc1.connect(screechFilter);
      osc2.connect(screechFilter);
      osc3.connect(screechFilter);
      screechFilter.connect(screechGain);
      screechGain.connect(terrorGain);

      osc1.start();
      osc2.start();
      osc3.start();

      this.terrorOsc1 = osc1;
      this.terrorOsc2 = osc2;
      this.terrorOsc3 = osc3;
    } catch (e) {
      console.warn('Terror synthesizer failed to start', e);
    }
  }

  /**
   * Running Horror Audio Loop:
   * When the creature is chasing or nearby, generates rapid heavy monster footsteps
   * and guttural panting/wheezing.
   */
  private startCreatureRunningAudioLoop() {
    if (this.creatureFootstepTimer) {
      clearInterval(this.creatureFootstepTimer);
    }

    const stepLoop = () => {
      if (!this.ctx || this.isMuted || this.ctx.state !== 'running' || !this.masterGain) {
        this.creatureFootstepTimer = window.setTimeout(stepLoop, 350);
        return;
      }

      // If creature is nearby (proximity > 0.2) or hunting
      if (this.proximityRatio > 0.25 || this.isHunting) {
        this.playMonsterFootstep(this.proximityRatio, this.isHunting);
      }

      // Interval accelerates when hunting/close: from 400ms down to 180ms
      const rate = this.isHunting 
        ? 190 + (1 - this.proximityRatio) * 120 
        : 380 - this.proximityRatio * 150;

      this.creatureFootstepTimer = window.setTimeout(stepLoop, Math.max(160, rate));
    };

    stepLoop();
  }

  /**
   * Heavy visceral running creature stomp (deep visceral thump with crunch)
   */
  private playMonsterFootstep(proximity: number, hunting: boolean) {
    if (!this.ctx || this.isMuted || !this.masterGain) return;

    try {
      const t = this.ctx.currentTime;
      const vol = Math.min(1.0, (0.2 + proximity * 0.8) * (hunting ? 1.2 : 0.85));

      // 1. Sub-bass ground impact
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(65 + Math.random() * 15, t);
      subOsc.frequency.exponentialRampToValueAtTime(25, t + 0.12);

      subGain.gain.setValueAtTime(0.5 * vol, t);
      subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

      subOsc.connect(subGain);
      subGain.connect(this.masterGain);
      subOsc.start(t);
      subOsc.stop(t + 0.15);

      // 2. Heavy muddy gravel crunch
      const crunchOsc = this.ctx.createOscillator();
      const crunchGain = this.ctx.createGain();
      const crunchFilter = this.ctx.createBiquadFilter();

      crunchOsc.type = 'sawtooth';
      crunchOsc.frequency.setValueAtTime(140 + Math.random() * 40, t);
      crunchOsc.frequency.exponentialRampToValueAtTime(35, t + 0.1);

      crunchFilter.type = 'lowpass';
      crunchFilter.frequency.setValueAtTime(220, t);

      crunchGain.gain.setValueAtTime(0.25 * vol, t);
      crunchGain.gain.exponentialRampToValueAtTime(0.001, t + 0.11);

      crunchOsc.connect(crunchFilter);
      crunchFilter.connect(crunchGain);
      crunchGain.connect(this.masterGain);

      crunchOsc.start(t);
      crunchOsc.stop(t + 0.12);
    } catch (e) {
      // ignore
    }
  }

  /**
   * Sound when the creature is resting/exhausted to regenerate stamina (wheezing breath)
   */
  public playCreatureExhaustedBreath() {
    if (!this.ctx || this.isMuted || !this.masterGain) return;

    try {
      const t = this.ctx.currentTime;
      // Raspy wheeze/gasp
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(95, t);
      osc.frequency.linearRampToValueAtTime(130, t + 0.35);
      osc.frequency.linearRampToValueAtTime(70, t + 0.8);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(320, t);
      filter.Q.setValueAtTime(3.0, t);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.35, t + 0.3);
      gain.gain.linearRampToValueAtTime(0.001, t + 0.85);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.9);
    } catch (e) {
      // ignore
    }
  }

  private startHeartbeatLoop() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    const triggerHeartbeat = () => {
      if (!this.ctx || this.isMuted || this.ctx.state !== 'running') return;
      if (this.currentBpm > 65) {
        this.playHeartbeatThud();
      }
      
      const intervalMs = (60 / this.currentBpm) * 1000;
      this.heartbeatInterval = window.setTimeout(triggerHeartbeat, intervalMs);
    };

    triggerHeartbeat();
  }

  /**
   * Update creature proximity audio & state:
   * - scales heartbeat tempo
   * - swells intense monster running tension
   */
  public updateCreatureProximity(distance: number, maxDistance: number = 650, isHunting: boolean = false, isResting: boolean = false) {
    if (!this.ctx || this.isMuted) return;
    if (distance <= 0) distance = 1;
    
    const proximity = Math.max(0, Math.min(1, 1 - distance / maxDistance));
    this.proximityRatio = proximity;
    this.isHunting = isHunting;
    this.isResting = isResting;

    // Heartbeat BPM scales from 60 to 180
    this.currentBpm = 60 + proximity * 120;

    // Modulate terror drone
    if (this.terrorDroneGain && this.ctx) {
      const now = this.ctx.currentTime;
      const terrorVolume = Math.pow(proximity, 1.6) * 0.35;
      this.terrorDroneGain.gain.setTargetAtTime(terrorVolume, now, 0.08);

      if (this.terrorOsc1 && this.terrorOsc2 && this.terrorOsc3) {
        const tremolo = Math.sin(now * (8 + proximity * 16)) * (proximity * 25);
        this.terrorOsc1.frequency.setValueAtTime(110 + tremolo, now);
        this.terrorOsc2.frequency.setValueAtTime(116.54 + tremolo * 1.1, now);
        this.terrorOsc3.frequency.setValueAtTime(311.13 + tremolo * 1.3, now);
      }
    }
  }

  private playHeartbeatThud() {
    if (!this.ctx || this.isMuted || !this.masterGain) return;

    try {
      const t = this.ctx.currentTime;
      const intensity = Math.min(1.0, 0.35 + this.proximityRatio * 0.65);
      
      // First thump (lub)
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(80, t);
      osc1.frequency.exponentialRampToValueAtTime(30, t + 0.12);
      
      gain1.gain.setValueAtTime(0.45 * intensity, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      
      osc1.connect(gain1);
      gain1.connect(this.masterGain);
      osc1.start(t);
      osc1.stop(t + 0.16);

      // Second thump (dub)
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(68, t + 0.13);
      osc2.frequency.exponentialRampToValueAtTime(26, t + 0.28);
      
      gain2.gain.setValueAtTime(0.35 * intensity, t + 0.13);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
      
      osc2.connect(gain2);
      gain2.connect(this.masterGain);
      osc2.start(t + 0.13);
      osc2.stop(t + 0.33);
    } catch (e) {
      // ignore
    }
  }

  public playFootstep() {
    if (!this.ctx || this.isMuted || !this.masterGain) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(105 + Math.random() * 25, t);
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.08);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(260, t);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.09);
    } catch (e) {
      // ignore
    }
  }

  public playFlashlightClick(isOn: boolean) {
    if (!this.ctx || this.isMuted || !this.masterGain) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(isOn ? 1400 : 900, t);
      osc.frequency.setValueAtTime(isOn ? 1800 : 600, t + 0.02);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.06);
    } catch (e) {
      // ignore
    }
  }

  /**
   * Sound when player picks up a water bucket from the ground
   */
  public playBucketPickup() {
    if (!this.ctx || this.isMuted || !this.masterGain) return;

    try {
      const t = this.ctx.currentTime;
      
      // Water swirl
      const osc1 = this.ctx.createOscillator();
      const gain1 = this.ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(320, t);
      osc1.frequency.exponentialRampToValueAtTime(580, t + 0.18);
      osc1.frequency.exponentialRampToValueAtTime(400, t + 0.35);

      gain1.gain.setValueAtTime(0.3, t);
      gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

      osc1.connect(gain1);
      gain1.connect(this.masterGain);
      osc1.start(t);
      osc1.stop(t + 0.4);

      // Light metallic resonance
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(880, t);
      gain2.gain.setValueAtTime(0.18, t);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
      osc2.connect(gain2);
      gain2.connect(this.masterGain);
      osc2.start(t);
      osc2.stop(t + 0.32);
    } catch (e) {
      // ignore
    }
  }

  /**
   * Sound when bucket is safely delivered to the house!
   */
  public playHouseDelivery() {
    if (!this.ctx || this.isMuted || !this.masterGain) return;

    try {
      const t = this.ctx.currentTime;
      
      // Sanctuary bell chords: C5 -> E5 -> G5 -> C6
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.08);

        gain.gain.setValueAtTime(0.28, t + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 0.65);

        osc.connect(gain);
        gain.connect(this.masterGain!);

        osc.start(t + idx * 0.08);
        osc.stop(t + idx * 0.08 + 0.7);
      });

      // Warm sanctuary bass boom
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();
      bassOsc.type = 'sine';
      bassOsc.frequency.setValueAtTime(130.81, t);
      bassOsc.frequency.exponentialRampToValueAtTime(65.41, t + 0.5);

      bassGain.gain.setValueAtTime(0.35, t);
      bassGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

      bassOsc.connect(bassGain);
      bassGain.connect(this.masterGain);
      bassOsc.start(t);
      bassOsc.stop(t + 0.65);
    } catch (e) {
      // ignore
    }
  }

  public playJumpscare() {
    if (!this.ctx || this.isMuted || !this.masterGain) return;

    try {
      const t = this.ctx.currentTime;

      // If custom audio buffer is loaded, play it with maximum punch & visceral bass shockwave
      if (this.customJumpscareBuffer) {
        const source = this.ctx.createBufferSource();
        source.buffer = this.customJumpscareBuffer;

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(1.15, t);

        // Sub-bass impact underneath for deep chest-thump
        const slamOsc = this.ctx.createOscillator();
        const slamGain = this.ctx.createGain();
        slamOsc.type = 'sine';
        slamOsc.frequency.setValueAtTime(160, t);
        slamOsc.frequency.exponentialRampToValueAtTime(26, t + 0.4);

        slamGain.gain.setValueAtTime(0.85, t);
        slamGain.gain.exponentialRampToValueAtTime(0.001, t + 0.65);

        slamOsc.connect(slamGain);
        slamGain.connect(this.masterGain);
        slamOsc.start(t);
        slamOsc.stop(t + 0.7);

        source.connect(gain);
        gain.connect(this.masterGain);
        source.start(t);
        return;
      }

      // Procedural Horror Jumpscare Synthesizer (Fallback):
      // 1. Violent High-Frequency Banshee Screech / Distortion Burst
      const screechOsc1 = this.ctx.createOscillator();
      const screechGain1 = this.ctx.createGain();
      screechOsc1.type = 'sawtooth';
      screechOsc1.frequency.setValueAtTime(880, t);
      screechOsc1.frequency.linearRampToValueAtTime(2400, t + 0.1);
      screechOsc1.frequency.exponentialRampToValueAtTime(320, t + 0.7);

      // Tremolo LFO for terrifying vibrating scream
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();
      lfo.frequency.setValueAtTime(35, t);
      lfoGain.gain.setValueAtTime(400, t);
      lfo.connect(screechOsc1.frequency);
      lfo.start(t);
      lfo.stop(t + 0.8);

      screechGain1.gain.setValueAtTime(0.85, t);
      screechGain1.gain.exponentialRampToValueAtTime(0.001, t + 0.75);

      screechOsc1.connect(screechGain1);
      screechGain1.connect(this.masterGain);
      screechOsc1.start(t);
      screechOsc1.stop(t + 0.8);

      // 2. High-pitch piercing secondary dissonant screamer
      const screechOsc2 = this.ctx.createOscillator();
      const screechGain2 = this.ctx.createGain();
      screechOsc2.type = 'square';
      screechOsc2.frequency.setValueAtTime(1480, t);
      screechOsc2.frequency.linearRampToValueAtTime(3100, t + 0.08);
      screechOsc2.frequency.exponentialRampToValueAtTime(180, t + 0.65);

      screechGain2.gain.setValueAtTime(0.65, t);
      screechGain2.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

      screechOsc2.connect(screechGain2);
      screechGain2.connect(this.masterGain);
      screechOsc2.start(t);
      screechOsc2.stop(t + 0.72);

      // 3. Bone-Crushing Sub-Bass Stomp & Impact (Slam)
      const slamOsc = this.ctx.createOscillator();
      const slamGain = this.ctx.createGain();
      slamOsc.type = 'sine';
      slamOsc.frequency.setValueAtTime(160, t);
      slamOsc.frequency.exponentialRampToValueAtTime(28, t + 0.35);

      slamGain.gain.setValueAtTime(0.95, t);
      slamGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

      slamOsc.connect(slamGain);
      slamGain.connect(this.masterGain);
      slamOsc.start(t);
      slamOsc.stop(t + 0.65);

      // 4. Harsh Metallic Noise Shockwave (Jumpscare Static)
      const bufferSize = this.ctx.sampleRate * 0.5;
      const noiseBuf = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const out = noiseBuf.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        out[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.12));
      }
      const noiseSource = this.ctx.createBufferSource();
      noiseSource.buffer = noiseBuf;

      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(1200, t);
      noiseFilter.Q.setValueAtTime(2.5, t);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.7, t);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.masterGain);
      noiseSource.start(t);
      noiseSource.stop(t + 0.5);

      // 5. Post-Shock Ringing Tinnitus Ear Tone (Eerie 4kHz sine fade)
      const ringOsc = this.ctx.createOscillator();
      const ringGain = this.ctx.createGain();
      ringOsc.type = 'sine';
      ringOsc.frequency.setValueAtTime(3800, t + 0.15);
      ringGain.gain.setValueAtTime(0.001, t);
      ringGain.gain.setValueAtTime(0.25, t + 0.2);
      ringGain.gain.exponentialRampToValueAtTime(0.001, t + 1.6);

      ringOsc.connect(ringGain);
      ringGain.connect(this.masterGain);
      ringOsc.start(t + 0.15);
      ringOsc.stop(t + 1.7);
    } catch (e) {
      // ignore
    }
  }

  public playCreatureScreech() {
    if (!this.ctx || this.isMuted || !this.masterGain) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Deep guttural roar starting low and screeching up
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(130, t);
      osc.frequency.linearRampToValueAtTime(520, t + 0.15);
      osc.frequency.linearRampToValueAtTime(140, t + 0.5);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, t);

      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.52);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.55);
    } catch (e) {
      // ignore
    }
  }

  public playPlayerHurt() {
    if (!this.ctx || this.isMuted || !this.masterGain) return;

    try {
      const t = this.ctx.currentTime;
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(25, t + 0.38);

      gain.gain.setValueAtTime(0.65, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.42);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.45);
    } catch (e) {
      // ignore
    }
  }

  public playLevelClear() {
    if (!this.ctx || this.isMuted || !this.masterGain) return;

    try {
      const t = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880, 1108.73];
      notes.forEach((freq, i) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + i * 0.12);

        gain.gain.setValueAtTime(0.28, t + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.12 + 0.7);

        osc.connect(gain);
        gain.connect(this.masterGain!);
        osc.start(t + i * 0.12);
        osc.stop(t + i * 0.12 + 0.75);
      });
    } catch (e) {
      // ignore
    }
  }

  public playGameOver() {
    if (!this.ctx || this.isMuted || !this.masterGain) return;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.linearRampToValueAtTime(30, t + 1.4);

      gain.gain.setValueAtTime(0.55, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.6);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 1.7);
    } catch (e) {
      // ignore
    }
  }
}

export const soundEngine = new SoundEngine();
