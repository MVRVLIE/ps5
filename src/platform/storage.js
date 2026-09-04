/** Локальное хранилище с защитой от отключённого localStorage (iframe, приватный режим). */

import { CONFIG } from '../config.js';

const memory = new Map();

function backend() {
  try {
    const probe = '__nine_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return null;
  }
}

const ls = typeof window !== 'undefined' ? backend() : null;

export const storage = {
  get(key = CONFIG.storageKey) {
    try {
      const raw = ls ? ls.getItem(key) : memory.get(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  set(key, value) {
    const raw = JSON.stringify(value);
    try {
      if (ls) ls.setItem(key, raw);
      else memory.set(key, raw);
      return true;
    } catch {
      memory.set(key, raw);
      return false;
    }
  },
};
