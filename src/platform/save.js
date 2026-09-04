/**
 * Прогресс игрока: локально всегда, в облако Яндекса — если игрок авторизован.
 * Облако и локальные данные сливаются по максимуму (рекорд не теряется).
 */

import { CONFIG } from '../config.js';
import { storage } from './storage.js';
import { platform } from './yandex.js';

const DEFAULTS = {
  best: 0,
  games: 0,
  lines: 0,
  bestCombo: 0,
  sound: true,
  lang: null,   // null — определить автоматически
  run: null,    // незаконченная партия
};

const CLOUD_THROTTLE_MS = 4000;

function sanitize(raw) {
  const d = { ...DEFAULTS };
  if (!raw || typeof raw !== 'object') return d;
  d.best = Math.max(0, Number(raw.best) || 0);
  d.games = Math.max(0, Number(raw.games) || 0);
  d.lines = Math.max(0, Number(raw.lines) || 0);
  d.bestCombo = Math.max(0, Number(raw.bestCombo) || 0);
  d.sound = raw.sound !== false;
  d.lang = typeof raw.lang === 'string' ? raw.lang : null;
  d.run = raw.run && typeof raw.run === 'object' ? raw.run : null;
  return d;
}

function merge(local, cloud) {
  if (!cloud) return local;
  const out = { ...local };
  out.best = Math.max(local.best, cloud.best);
  out.games = Math.max(local.games, cloud.games);
  out.lines = Math.max(local.lines, cloud.lines);
  out.bestCombo = Math.max(local.bestCombo, cloud.bestCombo);
  // Незаконченную партию берём ту, где счёт выше — она «свежее» по смыслу.
  const lScore = local.run?.score ?? -1;
  const cScore = cloud.run?.score ?? -1;
  out.run = cScore > lScore ? cloud.run : local.run;
  if (cloud.lang && !local.lang) out.lang = cloud.lang;
  return out;
}

export const save = {
  data: { ...DEFAULTS },
  _dirty: false,
  _lastCloud: 0,
  _timer: null,

  async load() {
    const local = sanitize(storage.get(CONFIG.storageKey));
    const cloud = sanitize(await platform.loadCloud());
    this.data = platform.authorized ? merge(local, cloud) : local;
    this.writeLocal();
    return this.data;
  },

  patch(partial) {
    Object.assign(this.data, partial);
    this.writeLocal();
    this.queueCloud();
  },

  writeLocal() {
    storage.set(CONFIG.storageKey, this.data);
  },

  queueCloud() {
    if (!platform.authorized) return;
    this._dirty = true;
    if (this._timer) return;
    const wait = Math.max(0, CLOUD_THROTTLE_MS - (Date.now() - this._lastCloud));
    this._timer = setTimeout(() => {
      this._timer = null;
      this.flush();
    }, wait);
  },

  /** Немедленная запись (конец партии, уход со страницы). */
  async flush(force = false) {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
    if (!this._dirty && !force) return false;
    this._dirty = false;
    this._lastCloud = Date.now();
    this.writeLocal();
    return platform.saveCloud(this.data, force);
  },
};
