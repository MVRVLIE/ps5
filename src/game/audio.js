/**
 * Звук синтезируется через Web Audio — никаких файлов,
 * это держит вес игры минимальным и снимает вопросы по лицензиям.
 */

class Audio {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.enabled = true;
    this.ready = false;
  }

  /** Контекст создаётся только по жесту пользователя (политика автоплея). */
  unlock() {
    if (this.ready) {
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try {
      this.ctx = new AC();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.enabled ? 0.5 : 0;
      this.master.connect(this.ctx.destination);
      this.ready = true;
      if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    } catch {
      this.ready = false;
    }
  }

  setEnabled(on) {
    this.enabled = !!on;
    if (this.master) {
      const t = this.ctx.currentTime;
      this.master.gain.cancelScheduledValues(t);
      this.master.gain.setTargetAtTime(this.enabled ? 0.5 : 0, t, 0.02);
    }
    return this.enabled;
  }

  /** Пауза на время рекламы или ухода вкладки в фон. */
  pause() {
    if (this.ready && this.ctx.state === 'running') this.ctx.suspend().catch(() => {});
  }

  resume() {
    if (this.ready && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
  }

  tone({ freq = 440, to = null, type = 'sine', dur = 0.12, gain = 0.3, delay = 0 }) {
    if (!this.ready || !this.enabled) return;
    const ctx = this.ctx;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const env = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (to) osc.frequency.exponentialRampToValueAtTime(Math.max(20, to), t0 + dur);
    env.gain.setValueAtTime(0.0001, t0);
    env.gain.exponentialRampToValueAtTime(gain, t0 + Math.min(0.015, dur * 0.2));
    env.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(env);
    env.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  click() {
    this.tone({ freq: 620, to: 480, type: 'triangle', dur: 0.06, gain: 0.16 });
  }

  pick() {
    this.tone({ freq: 380, to: 520, type: 'triangle', dur: 0.07, gain: 0.14 });
  }

  place() {
    this.tone({ freq: 240, to: 150, type: 'square', dur: 0.09, gain: 0.12 });
    this.tone({ freq: 520, to: 420, type: 'sine', dur: 0.07, gain: 0.1, delay: 0.01 });
  }

  invalid() {
    this.tone({ freq: 150, to: 90, type: 'sawtooth', dur: 0.14, gain: 0.1 });
  }

  /** Восходящее арпеджио: чем больше линий и комбо, тем выше и длиннее. */
  clearLines(lines = 1, combo = 1) {
    const scale = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1568.0];
    const start = Math.min(3, Math.max(0, combo - 1));
    const count = Math.min(scale.length - start, 2 + lines);
    for (let i = 0; i < count; i++) {
      this.tone({
        freq: scale[start + i],
        type: 'triangle',
        dur: 0.16,
        gain: 0.16,
        delay: i * 0.055,
      });
    }
  }

  combo(n) {
    this.tone({ freq: 880, to: 1320, type: 'sine', dur: 0.3, gain: 0.14 });
    this.tone({ freq: 1320 + n * 40, type: 'sine', dur: 0.25, gain: 0.08, delay: 0.06 });
  }

  perfect() {
    [523, 659, 784, 1047, 1319].forEach((f, i) =>
      this.tone({ freq: f, type: 'sine', dur: 0.3, gain: 0.16, delay: i * 0.07 }));
  }

  rescue() {
    this.tone({ freq: 300, to: 900, type: 'triangle', dur: 0.4, gain: 0.18 });
  }

  gameover() {
    [440, 370, 294, 220].forEach((f, i) =>
      this.tone({ freq: f, type: 'triangle', dur: 0.3, gain: 0.16, delay: i * 0.13 }));
  }
}

export const audio = new Audio();
