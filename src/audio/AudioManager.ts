import type { SceneState } from '../types/experience';
import type { TrackId } from '../config/audioConfig';
import {
  SCENE_MUSIC_MAP,
  SOUNDTRACK_REGISTRY,
  audioConfig
} from '../config/audioConfig';

export interface AudioDebugInfo {
  scene: SceneState | null;
  trackId: TrackId | null;
  trackTitle: string;
  state: 'STOPPED' | 'FADING_IN' | 'PLAYING' | 'FADING_OUT';
  isMuted: boolean;
  isUnlocked: boolean;
  volume: number;
}

type AudioStateListener = (info: AudioDebugInfo) => void;

class AuthoritativeAudioManager {
  private ctx: AudioContext | null = null;
  private isUnlocked: boolean = false;
  private isMuted: boolean = false;

  private masterGain: GainNode | null = null;
  private bgmBus: GainNode | null = null;
  private sfxBus: GainNode | null = null;

  // Track state
  private currentScene: SceneState | null = null;
  private currentTrackId: TrackId | null = null;
  private queuedTrackId: TrackId | null = null;
  private transitionState: 'STOPPED' | 'FADING_IN' | 'PLAYING' | 'FADING_OUT' = 'STOPPED';

  // Active track audio nodes & intervals
  private trackGain: GainNode | null = null;
  private activeOscillators: OscillatorNode[] = [];
  private activeIntervals: number[] = [];

  // Listeners for debug panel
  private listeners: AudioStateListener[] = [];

  constructor() {
    this.log('initialized AuthoritativeAudioManager');
  }

  private log(message: string, ...args: any[]): void {
    if (audioConfig.enableDebugLogs) {
      console.log(`%c[AUDIO] ${message}`, 'color: #A78BFA; font-weight: bold;', ...args);
    }
  }

  private notifyListeners(): void {
    const info = this.getDebugInfo();
    this.listeners.forEach(fn => {
      try {
        fn(info);
      } catch {}
    });
  }

  public subscribe(listener: AudioStateListener): () => void {
    this.listeners.push(listener);
    listener(this.getDebugInfo());
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  public getDebugInfo(): AudioDebugInfo {
    const track = this.currentTrackId ? SOUNDTRACK_REGISTRY[this.currentTrackId] : null;
    return {
      scene: this.currentScene,
      trackId: this.currentTrackId,
      trackTitle: track ? track.title : 'None',
      state: this.transitionState,
      isMuted: this.isMuted,
      isUnlocked: this.isUnlocked,
      volume: audioConfig.masterVolume
    };
  }

  private buildAudioGraph(): void {
    if (!this.ctx) return;

    // Master Gain Bus
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(
      this.isMuted ? 0 : audioConfig.masterVolume,
      this.ctx.currentTime
    );
    this.masterGain.connect(this.ctx.destination);

    // BGM Bus
    this.bgmBus = this.ctx.createGain();
    this.bgmBus.gain.setValueAtTime(audioConfig.defaultBgmVolume, this.ctx.currentTime);
    this.bgmBus.connect(this.masterGain);

    // SFX Bus
    this.sfxBus = this.ctx.createGain();
    this.sfxBus.gain.setValueAtTime(audioConfig.defaultSfxVolume, this.ctx.currentTime);
    this.sfxBus.connect(this.masterGain);

    this.log('AudioGraph built successfully');
  }

  public async unlock(): Promise<boolean> {
    if (this.isUnlocked && this.ctx && this.ctx.state === 'running') return true;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!this.ctx) {
        this.ctx = new AudioCtx();
        this.buildAudioGraph();
      }

      if (this.ctx.state === 'suspended') {
        await this.ctx.resume();
      }

      this.isUnlocked = this.ctx.state === 'running';
      this.log(`audio unlocked -> state: ${this.ctx.state}`);
      this.notifyListeners();

      if (this.queuedTrackId && this.isUnlocked) {
        const queued = this.queuedTrackId;
        this.queuedTrackId = null;
        this.requestTrack(queued);
      }
      return this.isUnlocked;
    } catch (e) {
      console.warn('[AUDIO] unlock deferred:', e);
      return false;
    }
  }

  public toggleMute(): boolean {
    this.unlock();
    this.isMuted = !this.isMuted;
    this.log(`Mute toggled: ${this.isMuted ? 'MUTED' : 'UNMUTED'}`);

    if (this.masterGain && this.ctx) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : audioConfig.masterVolume, now);
    }

    this.notifyListeners();
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  public onSceneChanged(scene: SceneState): void {
    this.currentScene = scene;
    this.log(`scene changed -> ${scene}`);
    const trackId = SCENE_MUSIC_MAP[scene];
    this.requestTrack(trackId);
  }

  public fadeOut(duration = 1.0): void {
    if (!this.trackGain || !this.ctx) return;
    this.transitionState = 'FADING_OUT';
    this.log(`fading out current track (${duration}s)`);
    const now = this.ctx.currentTime;
    try {
      this.trackGain.gain.cancelScheduledValues(now);
      this.trackGain.gain.setValueAtTime(this.trackGain.gain.value, now);
      this.trackGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    } catch {}

    setTimeout(() => {
      this.stopTrackImmediate();
    }, duration * 1000);
    this.notifyListeners();
  }

  public playNoPrankMusic(): void {
    this.log('special cue -> noPrank');
    this.requestTrack('noPrank');
  }

  public playSubmissionHold(): void {
    this.log('special cue -> memoryNostalgia');
    this.requestTrack('memoryNostalgia');
  }

  public cutToSilence(): void {
    this.log('special cue -> resultSilence');
    this.requestTrack('resultSilence');
  }

  public playReflectiveScore(): void {
    this.log('special cue -> reflectionWarm');
    this.requestTrack('reflectionWarm');
  }

  public playCreditsTheme(): void {
    this.log('special cue -> finalCredits');
    this.requestTrack('finalCredits');
  }

  public requestTrack(trackId: TrackId): void {
    this.log(`requested track -> ${trackId}`);

    // If the exact track is already active or fading in, DO NOT RESTART
    if (this.currentTrackId === trackId && (this.transitionState === 'PLAYING' || this.transitionState === 'FADING_IN')) {
      this.log(`track ${trackId} is already playing; no restart`);
      return;
    }

    if (!this.isUnlocked || !this.ctx || this.ctx.state !== 'running') {
      this.queuedTrackId = trackId;
      this.currentTrackId = trackId;
      this.log(`track ${trackId} queued until user interaction unlocks audio`);
      this.notifyListeners();
      return;
    }

    if (trackId === 'resultSilence') {
      this.stopTrackImmediate();
      this.currentTrackId = 'resultSilence';
      this.transitionState = 'STOPPED';
      this.notifyListeners();
      return;
    }

    const nextTrack = SOUNDTRACK_REGISTRY[trackId];
    if (!nextTrack) {
      console.error(`[AUDIO] Unknown track ID: ${trackId}`);
      return;
    }

    // Smooth crossfade to next track
    this.transitionToTrack(nextTrack);
  }

  private stopTrackImmediate(): void {
    this.log('stopped track (immediate)');
    this.activeIntervals.forEach(id => window.clearInterval(id));
    this.activeIntervals = [];

    this.activeOscillators.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {}
    });
    this.activeOscillators = [];

    if (this.trackGain) {
      try {
        this.trackGain.disconnect();
      } catch {}
      this.trackGain = null;
    }

    this.transitionState = 'STOPPED';
    this.notifyListeners();
  }

  private transitionToTrack(track: typeof SOUNDTRACK_REGISTRY[TrackId]): void {
    if (!this.ctx || !this.bgmBus) {
      this.currentTrackId = track.id;
      return;
    }

    const prevGain = this.trackGain;
    const prevOscs = [...this.activeOscillators];
    const prevIntervals = [...this.activeIntervals];

    // Clear active arrays for the new track
    this.activeOscillators = [];
    this.activeIntervals = [];

    // Fade out previous track
    if (prevGain && prevOscs.length) {
      this.transitionState = 'FADING_OUT';
      this.log(`fading out previous track (${track.fadeOutDuration}s)`);
      prevIntervals.forEach(id => window.clearInterval(id));

      const now = this.ctx.currentTime;
      try {
        prevGain.gain.cancelScheduledValues(now);
        prevGain.gain.setValueAtTime(prevGain.gain.value, now);
        prevGain.gain.exponentialRampToValueAtTime(0.0001, now + track.fadeOutDuration);
      } catch {}

      setTimeout(() => {
        prevOscs.forEach(o => {
          try {
            o.stop();
            o.disconnect();
          } catch {}
        });
        try {
          prevGain.disconnect();
        } catch {}
      }, track.fadeOutDuration * 1000);
    }

    // Create Gain for the new track
    const newTrackGain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    newTrackGain.gain.setValueAtTime(0.0001, now);
    newTrackGain.gain.exponentialRampToValueAtTime(track.volume, now + track.fadeInDuration);
    newTrackGain.connect(this.bgmBus);

    this.trackGain = newTrackGain;
    this.currentTrackId = track.id;
    this.transitionState = 'FADING_IN';
    this.notifyListeners();

    setTimeout(() => {
      if (this.currentTrackId === track.id) {
        this.transitionState = 'PLAYING';
        this.notifyListeners();
      }
    }, track.fadeInDuration * 1000);

    // Synthesize procedural loop using the restored earlier music compositions
    this.startTrackSound(track.id, newTrackGain);
  }

  private startTrackSound(trackId: TrackId, outputGain: GainNode): void {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    switch (trackId) {
      // TRACK 01: OPENING MYSTERY
      // Restored earlier F# atmospheric curiosity drone
      case 'openingMystery': {
        const sub = this.ctx.createOscillator();
        const pad = this.ctx.createOscillator();
        const high = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();

        sub.type = 'sine';
        sub.frequency.setValueAtTime(46.25, now); // F#1
        pad.type = 'triangle';
        pad.frequency.setValueAtTime(92.50, now);  // F#2
        high.type = 'sine';
        high.frequency.setValueAtTime(277.18, now); // C#4

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, now);
        filter.frequency.exponentialRampToValueAtTime(320, now + 10.0);

        const localG = this.ctx.createGain();
        localG.gain.setValueAtTime(0.20, now);

        sub.connect(filter);
        pad.connect(filter);
        high.connect(filter);
        filter.connect(localG);
        localG.connect(outputGain);

        sub.start();
        pad.start();
        high.start();

        this.activeOscillators.push(sub, pad, high);
        break;
      }

      // TRACK 02: SG PLAYFUL (The Teammate Question)
      // Restored earlier walking pizzicato bass (D3) & quirky marimba ping riff
      case 'sgPlayful': {
        const bassOsc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(340, now);

        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(146.83, now); // D3
        bassOsc.connect(filter);
        filter.connect(outputGain);
        bassOsc.start();
        this.activeOscillators.push(bassOsc);

        // Quirky walking riff: D, F, G, A, C, A
        const riffNotes = [146.83, 174.61, 196.00, 220.00, 261.63, 220.00];
        let noteStep = 0;

        const riffInterval = window.setInterval(() => {
          if (!this.ctx || this.isMuted) return;
          const pingOsc = this.ctx.createOscillator();
          const pingGain = this.ctx.createGain();
          const freq = riffNotes[noteStep % riffNotes.length];
          noteStep++;

          pingOsc.type = 'sine';
          pingOsc.frequency.setValueAtTime(freq * 2, this.ctx.currentTime);

          pingGain.gain.setValueAtTime(0.045, this.ctx.currentTime);
          pingGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.38);

          pingOsc.connect(pingGain);
          pingGain.connect(outputGain);
          pingOsc.start();
          pingOsc.stop(this.ctx.currentTime + 0.38);
        }, 520);

        this.activeIntervals.push(riffInterval);
        break;
      }

      // TRACK 03: NO PRANK (NO Button Chase)
      // Restored earlier energetic, bouncy comedy groove (plucky bass + syncopated accents)
      case 'noPrank': {
        const bassOsc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(360, now);

        bassOsc.type = 'triangle';
        bassOsc.frequency.setValueAtTime(146.83, now); // D3
        bassOsc.connect(filter);
        filter.connect(outputGain);
        bassOsc.start();
        this.activeOscillators.push(bassOsc);

        const notes = [146.83, 174.61, 196.00, 220.00];
        let step = 0;

        const intId = window.setInterval(() => {
          if (!this.ctx || this.isMuted) return;
          const ping = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          const freq = notes[step % notes.length];
          step++;

          ping.type = 'sine';
          ping.frequency.setValueAtTime(freq * 1.5, this.ctx.currentTime);
          g.gain.setValueAtTime(0.042, this.ctx.currentTime);
          g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.30);

          ping.connect(g);
          g.connect(outputGain);
          ping.start();
          ping.stop(this.ctx.currentTime + 0.30);
        }, 440);

        this.activeIntervals.push(intId);
        break;
      }

      // TRACK 04: YES WARM (Look At You Being Nice)
      // Restored earlier warm sweet acoustic Rhodes chords: Fmaj9 -> Cmaj7 -> Gsus4
      case 'yesWarm': {
        const yesChords = [
          [174.61, 220.00, 261.63, 329.63], // Fmaj7
          [130.81, 164.81, 196.00, 246.94], // Cmaj7
          [196.00, 261.63, 293.66, 392.00]  // Gsus4
        ];
        let cIdx = 0;

        const playYesChord = () => {
          if (!this.ctx || this.isMuted) return;
          const chord = yesChords[cIdx % yesChords.length];
          cIdx++;

          chord.forEach(freq => {
            const osc = this.ctx!.createOscillator();
            const g = this.ctx!.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);

            g.gain.setValueAtTime(0.0001, this.ctx!.currentTime);
            g.gain.exponentialRampToValueAtTime(0.040, this.ctx!.currentTime + 0.6);
            g.gain.exponentialRampToValueAtTime(0.0001, this.ctx!.currentTime + 3.0);

            osc.connect(g);
            g.connect(outputGain);
            osc.start();
            osc.stop(this.ctx!.currentTime + 3.1);
          });
        };

        playYesChord();
        const intId = window.setInterval(playYesChord, 3200);
        this.activeIntervals.push(intId);
        break;
      }

      // TRACK 05: TEAM WARM (Through Every Conflict)
      // Restored earlier conversational Rhodes chords: Fmaj7 -> Cmaj7 -> Dm7
      case 'teamWarm': {
        const chords = [
          [174.61, 220.00, 261.63, 329.63], // Fmaj7
          [130.81, 164.81, 196.00, 246.94], // Cmaj7
          [146.83, 174.61, 220.00, 261.63]  // Dm7
        ];
        let chordIdx = 0;

        const playTeamChord = () => {
          if (!this.ctx || this.isMuted) return;
          const currentChord = chords[chordIdx % chords.length];
          chordIdx++;

          currentChord.forEach(f => {
            const osc = this.ctx!.createOscillator();
            const g = this.ctx!.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(f, this.ctx!.currentTime);

            g.gain.setValueAtTime(0.001, this.ctx!.currentTime);
            g.gain.exponentialRampToValueAtTime(0.036, this.ctx!.currentTime + 0.6);
            g.gain.exponentialRampToValueAtTime(0.0001, this.ctx!.currentTime + 3.2);

            osc.connect(g);
            g.connect(outputGain);
            osc.start();
            osc.stop(this.ctx!.currentTime + 3.2);
          });
        };

        playTeamChord();
        const timerId = window.setInterval(playTeamChord, 3400);
        this.activeIntervals.push(timerId);
        break;
      }

      // TRACK 06: MEMORY NOSTALGIA (Memory Montage & Submission)
      // Restored earlier cinematic sawtooth drone building momentum in A2
      case 'memoryNostalgia': {
        const rootOsc = this.ctx.createOscillator();
        const subOsc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();

        rootOsc.type = 'sawtooth';
        rootOsc.frequency.setValueAtTime(110.00, now); // A2

        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(55.00, now);  // A1

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(240, now);
        filter.frequency.exponentialRampToValueAtTime(680, now + 12.0);

        const localGain = this.ctx.createGain();
        localGain.gain.setValueAtTime(0.14, now);

        rootOsc.connect(filter);
        subOsc.connect(filter);
        filter.connect(localGain);
        localGain.connect(outputGain);

        rootOsc.start();
        subOsc.start();
        this.activeOscillators.push(rootOsc, subOsc);
        break;
      }

      // TRACK 07 & 08: EMOTIONAL MINIMAL / REFLECTION WARM
      // Restored earlier sincere acoustic breath pads: Db -> Ab -> Bbm -> Gb
      case 'emotionalMinimal':
      case 'reflectionWarm': {
        const emotionalChords = [
          [138.59, 174.61, 207.65], // Db
          [103.83, 130.81, 155.56], // Ab
          [116.54, 138.59, 174.61], // Bbm
          [92.50, 116.54, 138.59],  // Gb
        ];
        let chordIndex = 0;

        const playSincerePad = () => {
          if (!this.ctx || this.isMuted) return;
          const chord = emotionalChords[chordIndex % emotionalChords.length];
          chordIndex++;

          chord.forEach(freq => {
            const pad = this.ctx!.createOscillator();
            const padGain = this.ctx!.createGain();
            pad.type = 'sine';
            pad.frequency.setValueAtTime(freq * 1.5, this.ctx!.currentTime);

            // Gentle acoustic breath swell
            padGain.gain.setValueAtTime(0.0001, this.ctx!.currentTime);
            padGain.gain.exponentialRampToValueAtTime(0.038, this.ctx!.currentTime + 1.2);
            padGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx!.currentTime + 4.2);

            pad.connect(padGain);
            padGain.connect(outputGain);
            pad.start();
            pad.stop(this.ctx!.currentTime + 4.3);
          });
        };

        playSincerePad();
        const intervalId = window.setInterval(playSincerePad, 4200);
        this.activeIntervals.push(intervalId);
        break;
      }

      // TRACK 09: FINAL CREDITS (Warm uplifting D Major sparkle)
      case 'finalCredits': {
        const creditsChords = [
          [146.83, 220.00, 293.66], // D
          [196.00, 246.94, 293.66], // G
          [123.47, 185.00, 220.00], // Bm
          [110.00, 164.81, 220.00]  // A
        ];
        let cIdx = 0;

        const playCredits = () => {
          if (!this.ctx || this.isMuted) return;
          const chord = creditsChords[cIdx % creditsChords.length];
          cIdx++;

          chord.forEach(f => {
            const o = this.ctx!.createOscillator();
            const g = this.ctx!.createGain();
            o.type = 'triangle';
            o.frequency.setValueAtTime(f, this.ctx!.currentTime);

            g.gain.setValueAtTime(0.001, this.ctx!.currentTime);
            g.gain.exponentialRampToValueAtTime(0.042, this.ctx!.currentTime + 0.8);
            g.gain.exponentialRampToValueAtTime(0.0001, this.ctx!.currentTime + 3.6);

            o.connect(g);
            g.connect(outputGain);
            o.start();
            o.stop(this.ctx!.currentTime + 3.6);
          });
        };

        playCredits();
        const intervalId = window.setInterval(playCredits, 3600);
        this.activeIntervals.push(intervalId);
        break;
      }
    }
  }

  // --- SOUND EFFECTS BUS (SFX) ---

  public playClick(): void {
    if (this.isMuted || !this.ctx || !this.sfxBus) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.sfxBus);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch {}
  }

  public playPop(): void {
    this.playShrinkPop(1);
  }

  public playShrinkPop(count = 1): void {
    if (this.isMuted || !this.ctx || !this.sfxBus) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      const startFreq = 280 + count * 70;
      const endFreq = startFreq + 190;

      osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxBus);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch {}
  }

  public playWhoosh(): void {
    if (this.isMuted || !this.ctx || !this.sfxBus) return;
    try {
      const bufferSize = this.ctx.sampleRate * 0.18;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(320, this.ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1400, this.ctx.currentTime + 0.09);
      filter.frequency.exponentialRampToValueAtTime(220, this.ctx.currentTime + 0.18);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.10, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxBus);
      noise.start();
    } catch {}
  }

  public playRecordScratch(): void {
    if (this.isMuted || !this.ctx || !this.sfxBus) return;
    try {
      this.log('SFX -> RECORD SCRATCH');
      this.stopTrackImmediate();
      this.currentTrackId = 'resultSilence';
      this.transitionState = 'STOPPED';
      this.notifyListeners();

      const now = this.ctx.currentTime;
      const bufferSize = this.ctx.sampleRate * 0.45;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin(i * 0.05);
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2400, now);
      filter.frequency.exponentialRampToValueAtTime(180, now + 0.35);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxBus);

      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.38);

      oscGain.gain.setValueAtTime(0.22, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(oscGain);
      oscGain.connect(this.sfxBus);

      noise.start();
      osc.start();
      osc.stop(now + 0.42);
    } catch {}
  }

  public playGoldenChime(): void {
    if (this.isMuted || !this.ctx || !this.sfxBus) return;
    try {
      // Golden pentatonic chime (F#4, A4, B4, C#5, E5)
      const notes = [369.99, 440.00, 493.88, 554.37, 659.25];
      notes.forEach((freq, idx) => {
        const time = this.ctx!.currentTime + idx * 0.09;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.14, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.55);
        osc.connect(gain);
        gain.connect(this.sfxBus!);
        osc.start(time);
        osc.stop(time + 0.55);
      });
    } catch {}
  }

  public playMontageTick(): void {
    if (this.isMuted || !this.ctx || !this.sfxBus) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.07, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.035);
      osc.connect(gain);
      gain.connect(this.sfxBus);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.035);
    } catch {}
  }

  public playSubtleChuckle(): void {
    if (this.isMuted || !this.ctx || !this.sfxBus) return;
    try {
      const notes = [369.99, 440.00];
      notes.forEach((freq, idx) => {
        const time = this.ctx!.currentTime + idx * 0.08;
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.08, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.16);
        osc.connect(gain);
        gain.connect(this.sfxBus!);
        osc.start(time);
        osc.stop(time + 0.16);
      });
    } catch {}
  }

  public playGlitch(): void {
    if (this.isMuted || !this.ctx || !this.sfxBus) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.setValueAtTime(940, this.ctx.currentTime + 0.03);
      osc.frequency.setValueAtTime(120, this.ctx.currentTime + 0.06);
      gain.gain.setValueAtTime(0.14, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(this.sfxBus);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch {}
  }
}

export const audioManager = new AuthoritativeAudioManager();

if (typeof window !== 'undefined') {
  (window as any).__audioManager = audioManager;
}
