/**
 * PaperFoleyEngine v2.5
 * Procedural tactile cardstock snaps, page turns, and Ghibli-inspired pentatonic music box.
 */
export class PaperFoleyEngine {
  constructor() {
    this.ctx = null;
    this.enabled = false;
    this.noiseBuf = null;
    this.lastSnapTime = 0;
    this.lastNoteTime = 0;
    this.noteIdx = 0;
    this.scale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 880.00, 783.99, 659.25, 587.33];
  }

  toggle() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
      const len = this.ctx.sampleRate;
      this.noiseBuf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = this.noiseBuf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    this.enabled = !this.enabled;
    if (this.enabled) this.playPageTurn();
    return this.enabled;
  }

  playPaperSnap(dir = 'up') {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    if (now - this.lastSnapTime < 0.055) return;
    this.lastSnapTime = now;

    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(dir === 'up' ? 1450 : 950, now);
    filter.frequency.exponentialRampToValueAtTime(dir === 'up' ? 2800 : 600, now + 0.07);
    filter.Q.value = 1.6;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.085, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    src.start(now, Math.random() * 0.5, 0.1);
  }

  playPageTurn() {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    src.buffer = this.noiseBuf;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(700, now);
    filter.frequency.exponentialRampToValueAtTime(2200, now + 0.22);
    filter.Q.value = 0.9;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.11, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    src.start(now, 0, 0.3);
  }

  playChime(pitchMult = 1.0) {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const freq = this.scale[this.noteIdx % this.scale.length] * pitchMult;
    this.noteIdx++;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.055, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0008, now + 1.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 1.2);
  }

  updateAmbient(velocity) {
    if (!this.enabled || !this.ctx) return;
    const now = this.ctx.currentTime;
    const interval = velocity > 0.025 ? 0.52 : 1.85;
    if (now - this.lastNoteTime > interval) {
      this.lastNoteTime = now;
      this.playChime(velocity > 0.04 ? 1.0 : 0.5);
    }
  }
}
