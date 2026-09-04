/**
 * Генератор графики для карточки игры: node tools/make-assets.mjs
 *   assets/icon-512.png   — иконка игры (512×512)
 *   assets/cover-800x470.png — обложка (800×470)
 *   assets/favicon.png    — фавиконка (64×64)
 *
 * Всё рисуется кодом, без внешних зависимостей и чужих ассетов.
 * Замените на собственную графику, если нужен другой стиль.
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const outDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'assets');

const PALETTE = ['#ff6b6b', '#ffa94d', '#ffd43b', '#51cf66', '#38d9a9', '#4dabf7', '#b197fc', '#f783ac'];
const BG_TOP = [12, 15, 33];
const BG_BOTTOM = [40, 30, 86];

const hex = (h) => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];
const mix = (a, b, t) => a.map((v, i) => v + (b[i] - v) * t);
const clamp01 = (v) => Math.max(0, Math.min(1, v));

class Raster {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.data = new Uint8ClampedArray(w * h * 4);
  }

  blend(x, y, rgb, alpha) {
    if (alpha <= 0 || x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    const i = (y * this.w + x) * 4;
    const a = Math.min(1, alpha);
    const d = this.data;
    d[i] = d[i] + (rgb[0] - d[i]) * a;
    d[i + 1] = d[i + 1] + (rgb[1] - d[i + 1]) * a;
    d[i + 2] = d[i + 2] + (rgb[2] - d[i + 2]) * a;
    d[i + 3] = Math.max(d[i + 3], 255 * a);
  }

  /** Вертикальный градиент во весь холст. */
  gradient(top, bottom) {
    for (let y = 0; y < this.h; y++) {
      const c = mix(top, bottom, y / (this.h - 1));
      for (let x = 0; x < this.w; x++) this.blend(x, y, c, 1);
    }
  }

  /** Мягкое световое пятно. */
  glow(cx, cy, radius, rgb, strength = 0.5) {
    const r2 = radius * radius;
    for (let y = Math.max(0, cy - radius | 0); y < Math.min(this.h, cy + radius); y++) {
      for (let x = Math.max(0, cx - radius | 0); x < Math.min(this.w, cx + radius); x++) {
        const d2 = (x - cx) ** 2 + (y - cy) ** 2;
        if (d2 > r2) continue;
        const k = 1 - Math.sqrt(d2) / radius;
        this.blend(x, y, rgb, k * k * strength);
      }
    }
  }

  /** Скруглённый прямоугольник со сглаживанием и вертикальным градиентом. */
  roundRect(x, y, w, h, r, colorTop, colorBottom = colorTop, alpha = 1) {
    const cx = x + w / 2;
    const cy = y + h / 2;
    const hw = w / 2;
    const hh = h / 2;
    const rad = Math.min(r, hw, hh);
    const x0 = Math.max(0, Math.floor(x - 1));
    const x1 = Math.min(this.w, Math.ceil(x + w + 1));
    const y0 = Math.max(0, Math.floor(y - 1));
    const y1 = Math.min(this.h, Math.ceil(y + h + 1));

    for (let py = y0; py < y1; py++) {
      const t = clamp01((py - y) / h);
      const c = mix(colorTop, colorBottom, t);
      for (let px = x0; px < x1; px++) {
        const qx = Math.abs(px + 0.5 - cx) - (hw - rad);
        const qy = Math.abs(py + 0.5 - cy) - (hh - rad);
        const d = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - rad;
        const cov = clamp01(0.5 - d);
        if (cov > 0) this.blend(px, py, c, cov * alpha);
      }
    }
  }

  /** Блок игры: градиент + блик сверху. */
  block(x, y, size, color, alpha = 1) {
    const base = hex(color);
    const top = mix(base, [255, 255, 255], 0.26);
    const bottom = mix(base, [0, 0, 0], 0.22);
    const pad = size * 0.06;
    const s = size - pad * 2;
    this.roundRect(x + pad, y + pad, s, s, s * 0.24, top, bottom, alpha);
    this.roundRect(x + pad + s * 0.14, y + pad + s * 0.12, s * 0.72, s * 0.2, s * 0.1,
      [255, 255, 255], [255, 255, 255], 0.22 * alpha);
  }

  toPNG() {
    const { w, h, data } = this;
    const raw = Buffer.alloc((w * 4 + 1) * h);
    for (let y = 0; y < h; y++) {
      raw[y * (w * 4 + 1)] = 0; // фильтр строки: none
      for (let x = 0; x < w * 4; x++) raw[y * (w * 4 + 1) + 1 + x] = data[y * w * 4 + x];
    }
    const ihdr = Buffer.alloc(13);
    ihdr.writeUInt32BE(w, 0);
    ihdr.writeUInt32BE(h, 4);
    ihdr[8] = 8;   // бит на канал
    ihdr[9] = 6;   // RGBA
    return Buffer.concat([
      Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
      chunk('IHDR', ihdr),
      chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
      chunk('IEND', Buffer.alloc(0)),
    ]);
  }
}

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf, crc = 0xffffffff) {
  for (let i = 0; i < buf.length; i++) crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, body) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(body.length, 0);
  const typed = Buffer.concat([Buffer.from(type, 'ascii'), body]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typed), 0);
  return Buffer.concat([len, typed, crc]);
}

/** Цифра «9», выложенная блоками 3×5. */
const GLYPH_9 = [
  [1, 1, 1],
  [1, 0, 1],
  [1, 1, 1],
  [0, 0, 1],
  [1, 1, 1],
];

/** Цвет по строкам — так цифра читается лучше, чем при случайной раскраске. */
const GLYPH_COLORS = ['#4dabf7', '#7aa2ff', '#b197fc', '#7aa2ff', '#4dabf7'];

function drawGlyph(img, x, y, cell, gap = 0) {
  const step = cell + gap;
  for (let gy = 0; gy < GLYPH_9.length; gy++) {
    for (let gx = 0; gx < GLYPH_9[gy].length; gx++) {
      if (!GLYPH_9[gy][gx]) continue;
      img.block(x + gx * step, y + gy * step, cell, GLYPH_COLORS[gy]);
    }
  }
}

function makeIcon(size = 512) {
  const img = new Raster(size, size);
  img.gradient(BG_TOP, BG_BOTTOM);
  img.glow(size * 0.5, size * 0.12, size * 0.75, [108, 140, 255], 0.35);
  img.glow(size * 0.9, size * 1.0, size * 0.6, [160, 108, 255], 0.3);

  // лёгкая сетка на фоне
  const g = size / 9;
  for (let i = 1; i < 9; i++) {
    img.roundRect(0, i * g - 1, size, 2, 1, [255, 255, 255], [255, 255, 255], 0.04);
    img.roundRect(i * g - 1, 0, 2, size, 1, [255, 255, 255], [255, 255, 255], 0.04);
  }

  const cell = size * 0.15;
  const gap = size * 0.02;
  const gw = cell * 3 + gap * 2;
  const gh = cell * 5 + gap * 4;
  drawGlyph(img, (size - gw) / 2, (size - gh) / 2, cell, gap);

  // цветные блоки-акценты по углам — намёк на разноцветные фигуры
  const acc = size * 0.1;
  img.block(size * 0.045, size * 0.06, acc, PALETTE[0]);
  img.block(size * 0.045, size * 0.06 + acc, acc, PALETTE[2]);
  img.block(size * 0.855, size * 0.735, acc, PALETTE[3]);
  img.block(size * 0.855, size * 0.735 + acc, acc, PALETTE[4]);
  return img;
}

function makeCover(w = 800, h = 470) {
  const img = new Raster(w, h);
  img.gradient(BG_TOP, BG_BOTTOM);
  img.glow(w * 0.28, h * 0.1, h * 1.1, [108, 140, 255], 0.4);
  img.glow(w * 0.95, h * 1.05, h * 0.9, [160, 108, 255], 0.35);

  // цифра слева
  const cell = h * 0.15;
  const gap = h * 0.02;
  const gh = cell * 5 + gap * 4;
  drawGlyph(img, w * 0.1, (h - gh) / 2, cell, gap);

  // мини-поле справа
  const boardSize = h * 0.72;
  const bx = w * 0.52;
  const by = (h - boardSize) / 2;
  const c = boardSize / 6;
  img.roundRect(bx - c * 0.3, by - c * 0.3, boardSize + c * 0.6, boardSize + c * 0.6,
    c * 0.5, [255, 255, 255], [255, 255, 255], 0.06);

  const pattern = [
    [0, 1, 1, 0, 2, 2],
    [0, 0, 1, 0, 2, 0],
    [3, 3, 3, 3, 3, 3],
    [0, 4, 0, 0, 5, 5],
    [4, 4, 0, 0, 5, 0],
    [0, 6, 6, 7, 7, 0],
  ];
  for (let y = 0; y < 6; y++) {
    for (let x = 0; x < 6; x++) {
      const v = pattern[y][x];
      if (v === 0) {
        img.roundRect(bx + x * c + c * 0.08, by + y * c + c * 0.08, c * 0.84, c * 0.84,
          c * 0.2, [255, 255, 255], [255, 255, 255], 0.07);
      } else {
        img.block(bx + x * c, by + y * c, c, PALETTE[(v - 1) % PALETTE.length]);
      }
    }
  }
  return img;
}

function makeFavicon(size = 64) {
  const img = new Raster(size, size);
  img.roundRect(0, 0, size, size, size * 0.24, [30, 36, 82], [18, 20, 48], 1);
  const c = size * 0.4;
  const off = size * 0.1;
  img.block(off, off, c, PALETTE[5]);
  img.block(off + c, off, c, PALETTE[2]);
  img.block(off, off + c, c, PALETTE[3]);
  img.block(off + c, off + c, c, PALETTE[6]);
  return img;
}

fs.mkdirSync(outDir, { recursive: true });
const files = [
  ['icon-512.png', makeIcon(512)],
  ['cover-800x470.png', makeCover(800, 470)],
  ['favicon.png', makeFavicon(64)],
];

for (const [name, img] of files) {
  const buf = img.toPNG();
  fs.writeFileSync(path.join(outDir, name), buf);
  console.log(`${name.padEnd(22)} ${img.w}×${img.h}  ${(buf.length / 1024).toFixed(1)} КБ`);
}
console.log('\nГотово. Файлы в assets/ — загрузите иконку и обложку в консоль разработчика.');
