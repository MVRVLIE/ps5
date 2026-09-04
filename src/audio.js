/** Звук синтезируется на лету — ни одного аудиофайла в сборке. */

import { S, save } from './state.js';

let ctx = null;
let master = null;

function ac() {
  if (ctx) return ctx;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  master = ctx.createGain();
  master.gain.value = 0.22;
  master.connect(ctx.destination);
  return ctx;
}

/** iOS/Android разрешают звук только после жеста — дёргаем из первого тапа. */
export function unlockAudio() {
  const c = ac();
  if (c && c.state === 'suspended') c.resume();
}

export function setMuted(v) {
  S.muted = v;
  save();
  if (master) master.gain.value = v ? 0 : 0.22;
}

function tone(freq, { dur = 0.18, type = 'sine', at = 0, gain = 1, slide = 0 } = {}) {
  const c = ac();
  if (!c || S.muted) return;
  const t0 = c.currentTime + at;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(0.9 * gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(master);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

/** Пентатоника: любые сочетания звучат приятно, что бы игрок ни нажал. */
const PENTA = [523.25, 587.33, 698.46, 783.99, 880.0, 1046.5, 1174.66, 1396.91];

export const sfx = {
  /** Пришло сообщение — мягкий «блуп». */
  msg: () => tone(430, { dur: 0.1, type: 'sine', gain: 0.55, slide: 120 }),
  /** Игрок отправил реплику. */
  send: () => tone(660, { dur: 0.08, type: 'triangle', gain: 0.5, slide: 180 }),
  /** Верный ответ: с ростом серии нота уходит выше — «ещё один» само просится. */
  right(streak = 0) {
    const i = Math.min(PENTA.length - 1, streak);
    tone(PENTA[i], { dur: 0.16, type: 'triangle' });
    tone(PENTA[i] * 1.5, { dur: 0.22, type: 'sine', at: 0.07, gain: 0.6 });
  },
  wrong: () => {
    tone(196, { dur: 0.16, type: 'sawtooth', gain: 0.35 });
    tone(146, { dur: 0.24, type: 'sine', at: 0.08, gain: 0.4 });
  },
  photo: () => {
    tone(880, { dur: 0.1, type: 'sine', gain: 0.5 });
    tone(1318, { dur: 0.16, type: 'sine', at: 0.06, gain: 0.4 });
    tone(1760, { dur: 0.3, type: 'sine', at: 0.12, gain: 0.3 });
  },
  level: () => [0, 0.1, 0.2, 0.34].forEach((at, i) =>
    tone([523.25, 659.25, 783.99, 1046.5][i], { dur: 0.42, type: 'triangle', at, gain: 0.7 })),
  tap: () => tone(320, { dur: 0.05, type: 'sine', gain: 0.3 }),
};
