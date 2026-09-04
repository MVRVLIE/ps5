/** Мелкие утилиты для цвета блоков. */

const cache = new Map();

export function toRgb(hex) {
  let v = cache.get(hex);
  if (!v) {
    const h = hex.replace('#', '');
    v = [
      parseInt(h.slice(0, 2), 16),
      parseInt(h.slice(2, 4), 16),
      parseInt(h.slice(4, 6), 16),
    ];
    cache.set(hex, v);
  }
  return v;
}

const clamp = (n) => Math.max(0, Math.min(255, Math.round(n)));

/** amt > 0 — светлее, amt < 0 — темнее. */
export function shade(hex, amt) {
  const [r, g, b] = toRgb(hex);
  const f = (c) => (amt >= 0 ? c + (255 - c) * amt : c * (1 + amt));
  return `rgb(${clamp(f(r))},${clamp(f(g))},${clamp(f(b))})`;
}

export function rgba(hex, a) {
  const [r, g, b] = toRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}
