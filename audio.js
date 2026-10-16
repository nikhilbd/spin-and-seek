// Web Audio API Sound Synthesizer
// Provides procedural audio for wheel ticks, lands, celebration chimes, and miss effects.
(function(exports) {
  'use strict';

  class SoundSystem {
    constructor() {
      this.ctx = null;
      this.enabled = true;
    }

    init() {
      // Lazy or early audio context initializer
      try {
        this._initContext();
      } catch (e) {
        // Handled silently until first user interaction
      }
      return this;
    }

    _initContext() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggleMute() {
      this.enabled = !this.enabled;
      return this.enabled;
    }

    setMute(mute) {
      this.enabled = !mute;
      return this.enabled;
    }

    // Wood flapper tick when passing wheel pegs
    playTick(speedFactor = 1.0) {
      if (!this.enabled) return;
      try {
        this._initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        // Wooden click: sharp pitch decay
        const baseFreq = 600 + Math.min(speedFactor * 100, 300);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(baseFreq, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.035);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.04);
      } catch (e) {
        // Fallback or audio not allowed yet
      }
    }

    // Resonant locking thud when wheel stops on a letter
    playLand() {
      if (!this.enabled) return;
      try {
        this._initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(55, now + 0.25);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.26);
      } catch (e) {}
    }

    // Celebratory victory fanfare (C5, E5, G5, C6 arpeggio with sparkle)
    playSuccess() {
      if (!this.enabled) return;
      try {
        this._initContext();
        if (!this.ctx) return;

        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        const now = this.ctx.currentTime;

        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.09);

          const start = now + idx * 0.09;
          gain.gain.setValueAtTime(0.2, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(start);
          osc.stop(start + 0.46);
        });
      } catch (e) {}
    }

    // Gentle soft bonk / buzzer when clicked object does not match target
    playFail() {
      if (!this.enabled) return;
      try {
        this._initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.18);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.19);
      } catch (e) {}
    }

    // Shimmering chime for hint activation
    playHint() {
      if (!this.enabled) return;
      try {
        this._initContext();
        if (!this.ctx) return;

        const now = this.ctx.currentTime;
        const freqs = [880, 1174.66, 1318.51];
        freqs.forEach((freq, i) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.06);

          const start = now + i * 0.06;
          gain.gain.setValueAtTime(0.18, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(start);
          osc.stop(start + 0.41);
        });
      } catch (e) {}
    }
  }

  exports.SoundSystem = SoundSystem;
})(typeof exports !== 'undefined' ? exports : (window.SOUND_MODULE = {}));
