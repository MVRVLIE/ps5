/** Отрисовка поля, лотка, перетаскиваемой фигуры и эффектов на canvas 2D. */

import { CONFIG } from '../config.js';
import { shade, rgba } from '../core/color.js';
import { computeLayout, slotScale } from './layout.js';
import { Effects } from './particles.js';

const FONT = '800 {size}px "Segoe UI", Roboto, system-ui, sans-serif';

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: true });
    this.dpr = 1;
    this.layout = computeLayout(320, 480, CONFIG.grid, CONFIG.trayCount);
    this.effects = new Effects();
    this.placed = null; // анимация «шлепка» только что поставленной фигуры
    this.time = 0;
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width));
    const h = Math.max(1, Math.round(rect.height));
    this.dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    this.canvas.width = Math.round(w * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);
    this.layout = computeLayout(w, h, CONFIG.grid, CONFIG.trayCount);
    return this.layout;
  }

  markPlaced(cells) {
    this.placed = { cells, age: 0 };
  }

  /** Разлёт частиц и затухание блоков при очистке линий. */
  spawnClear(clearCells) {
    const { cell, x: bx, y: by } = this.layout.board;
    for (const [cx, cy, color] of clearCells) {
      const px = bx + cx * cell;
      const py = by + cy * cell;
      const hex = CONFIG.colors[color] || '#ffffff';
      const delay = (cx + cy) * 0.012;
      this.effects.fade(px, py, cell, hex, delay);
      this.effects.burst(px + cell / 2, py + cell / 2, hex, 5, 0.9);
    }
  }

  update(dt) {
    this.time += dt;
    this.effects.update(dt);
    if (this.placed) {
      this.placed.age += dt;
      if (this.placed.age > 0.26) this.placed = null;
    }
  }

  render(view) {
    const ctx = this.ctx;
    const { w, h, board } = this.layout;

    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const shake = this.effects.shake;
    if (shake > 0.1) {
      ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);
    }

    this.drawBoardBack(board);
    this.drawHighlights(view);
    this.drawCells(view.game.board, board);
    this.drawFades(board.cell);
    this.drawGhost(view);
    this.drawTray(view);
    this.drawParticles();
    this.drawFloats();
    this.drawDrag(view);
  }

  // ------------------------------ поле ------------------------------

  drawBoardBack({ x, y, size, cell }) {
    const ctx = this.ctx;
    const r = cell * 0.34;

    ctx.fillStyle = 'rgba(255,255,255,0.035)';
    this.roundRect(x - cell * 0.16, y - cell * 0.16, size + cell * 0.32, size + cell * 0.32, r);
    ctx.fill();

    // шахматная подложка + контур: так границы квадратов 3×3 читаются сразу
    const box = CONFIG.box;
    const boxes = CONFIG.grid / box;
    for (let by = 0; by < boxes; by++) {
      for (let bx = 0; bx < boxes; bx++) {
        const bxPos = x + bx * box * cell;
        const byPos = y + by * box * cell;
        if ((bx + by) % 2 === 1) {
          ctx.fillStyle = 'rgba(255,255,255,0.055)';
          this.roundRect(bxPos, byPos, box * cell, box * cell, cell * 0.18);
          ctx.fill();
        }
        ctx.strokeStyle = 'rgba(255,255,255,0.10)';
        ctx.lineWidth = Math.max(1, cell * 0.035);
        this.roundRect(bxPos, byPos, box * cell, box * cell, cell * 0.18);
        ctx.stroke();
      }
    }

    const inset = cell * 0.09;
    const s = cell - inset * 2;
    ctx.fillStyle = 'rgba(255,255,255,0.05)';
    for (let gy = 0; gy < CONFIG.grid; gy++) {
      for (let gx = 0; gx < CONFIG.grid; gx++) {
        this.roundRect(x + gx * cell + inset, y + gy * cell + inset, s, s, s * 0.22);
        ctx.fill();
      }
    }
  }

  drawCells(model, { x, y, cell }) {
    const pop = this.placed;
    const popSet = pop ? new Set(pop.cells.map(([cx, cy]) => cy * CONFIG.grid + cx)) : null;
    const k = pop ? Math.min(1, pop.age / 0.22) : 1;
    const popScale = pop ? 1 + 0.22 * Math.sin(k * Math.PI) : 1;

    for (let gy = 0; gy < CONFIG.grid; gy++) {
      for (let gx = 0; gx < CONFIG.grid; gx++) {
        const v = model.get(gx, gy);
        if (!v) continue;
        const scale = popSet && popSet.has(gy * CONFIG.grid + gx) ? popScale : 1;
        this.block(x + gx * cell, y + gy * cell, cell, CONFIG.colors[v], 1, scale);
      }
    }
  }

  /** Подсветка строк/столбцов/квадратов, которые соберутся текущим ходом. */
  drawHighlights(view) {
    const drag = view.drag;
    if (!drag || !drag.valid || !drag.preview || drag.preview.lines === 0) return;
    const ctx = this.ctx;
    const { x, y, cell } = this.layout.board;
    const pulse = 0.22 + 0.1 * Math.sin(this.time * 9);
    ctx.fillStyle = `rgba(255,255,255,${pulse})`;
    for (const gy of drag.preview.rows) {
      this.roundRect(x, y + gy * cell, cell * CONFIG.grid, cell, cell * 0.2);
      ctx.fill();
    }
    for (const gx of drag.preview.cols) {
      this.roundRect(x + gx * cell, y, cell, cell * CONFIG.grid, cell * 0.2);
      ctx.fill();
    }
    for (const [bx, by] of drag.preview.boxes) {
      this.roundRect(x + bx * CONFIG.box * cell, y + by * CONFIG.box * cell, CONFIG.box * cell, CONFIG.box * cell, cell * 0.2);
      ctx.fill();
    }
  }

  /** Полупрозрачный «след» фигуры на месте будущей установки. */
  drawGhost(view) {
    const drag = view.drag;
    if (!drag || !drag.active || !drag.target) return;
    const { x, y, cell } = this.layout.board;
    const color = CONFIG.colors[drag.piece.color];
    for (const [dx, dy] of drag.piece.cells) {
      const gx = drag.target.x + dx;
      const gy = drag.target.y + dy;
      if (gx < 0 || gy < 0 || gx >= CONFIG.grid || gy >= CONFIG.grid) continue;
      const px = x + gx * cell;
      const py = y + gy * cell;
      if (drag.valid) {
        this.block(px, py, cell, color, 0.42, 1);
        const ctx = this.ctx;
        ctx.strokeStyle = 'rgba(255,255,255,0.55)';
        ctx.lineWidth = Math.max(1, cell * 0.05);
        this.roundRect(px + cell * 0.1, py + cell * 0.1, cell * 0.8, cell * 0.8, cell * 0.18);
        ctx.stroke();
      } else {
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(255,90,90,0.22)';
        this.roundRect(px + cell * 0.1, py + cell * 0.1, cell * 0.8, cell * 0.8, cell * 0.18);
        ctx.fill();
      }
    }
  }

  // ------------------------------ лоток ------------------------------

  drawTray(view) {
    const ctx = this.ctx;
    const { slots, board } = this.layout;
    const tray = view.game.tray;
    const dragSlot = view.drag && view.drag.active ? view.drag.slot : -1;

    slots.forEach((slot, i) => {
      const piece = tray[i];
      if (!piece || i === dragSlot) {
        ctx.strokeStyle = 'rgba(255,255,255,0.07)';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 7]);
        const pw = slot.w * 0.62;
        const ph = slot.h * 0.62;
        this.roundRect(slot.cx - pw / 2, slot.cy - ph / 2, pw, ph, 12);
        ctx.stroke();
        ctx.setLineDash([]);
        return;
      }

      const scale = slotScale(piece, slot, board.cell);
      const s = board.cell * scale;
      const ox = slot.cx - (piece.w * s) / 2;
      const oy = slot.cy - (piece.h * s) / 2;
      const alpha = view.playable === false ? 0.4 : 1;
      for (const [dx, dy] of piece.cells) {
        this.block(ox + dx * s, oy + dy * s, s, CONFIG.colors[piece.color], alpha, 1);
      }
    });
  }

  /** Фигура в руке — рисуется в масштабе поля. */
  drawDrag(view) {
    const drag = view.drag;
    if (!drag || !drag.active) return;
    const cell = this.layout.board.cell;
    const color = CONFIG.colors[drag.piece.color];
    const ctx = this.ctx;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = cell * 0.4;
    ctx.shadowOffsetY = cell * 0.14;
    for (const [dx, dy] of drag.piece.cells) {
      this.block(drag.x + dx * cell, drag.y + dy * cell, cell, color, 0.96, 1);
    }
    ctx.restore();
  }

  // ---------------------------- эффекты ------------------------------

  drawFades(cell) {
    const ctx = this.ctx;
    for (const f of this.effects.fades) {
      if (f.age < 0) continue;
      const k = f.age / f.life;
      const scale = 1 - k * 0.75;
      ctx.save();
      ctx.globalAlpha = 1 - k;
      this.block(f.x, f.y, f.size, f.color, 1, scale);
      ctx.globalAlpha = (1 - k) * 0.7;
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      const s = f.size * scale * 0.55;
      this.roundRect(f.x + (f.size - s) / 2, f.y + (f.size - s) / 2, s, s, s * 0.3);
      ctx.fill();
      ctx.restore();
    }
  }

  drawParticles() {
    const ctx = this.ctx;
    for (const p of this.effects.parts) {
      const k = 1 - p.age / p.life;
      ctx.globalAlpha = Math.max(0, k);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * k, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  drawFloats() {
    const ctx = this.ctx;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (const f of this.effects.floats) {
      const k = f.age / f.life;
      const size = Math.max(12, this.layout.board.cell * 0.6 * f.scale);
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - k * k);
      ctx.font = FONT.replace('{size}', String(Math.round(size)));
      ctx.lineWidth = Math.max(2, size * 0.14);
      ctx.strokeStyle = 'rgba(8,10,24,0.85)';
      ctx.fillStyle = f.color;
      const y = f.y - k * this.layout.board.cell * 1.6;
      ctx.strokeText(f.text, f.x, y);
      ctx.fillText(f.text, f.x, y);
      ctx.restore();
    }
  }

  // ------------------------- примитивы -------------------------------

  block(x, y, size, hex, alpha = 1, scale = 1) {
    if (!hex) return;
    const ctx = this.ctx;
    const inset = size * 0.055;
    let s = size - inset * 2;
    let px = x + inset;
    let py = y + inset;
    if (scale !== 1) {
      const ns = s * scale;
      px += (s - ns) / 2;
      py += (s - ns) / 2;
      s = ns;
    }
    if (s <= 0) return;

    const r = s * 0.24;
    const grad = ctx.createLinearGradient(px, py, px, py + s);
    grad.addColorStop(0, shade(hex, 0.26));
    grad.addColorStop(0.55, hex);
    grad.addColorStop(1, shade(hex, -0.24));

    ctx.globalAlpha = alpha;
    ctx.fillStyle = grad;
    this.roundRect(px, py, s, s, r);
    ctx.fill();

    ctx.fillStyle = rgba('#ffffff', 0.22);
    this.roundRect(px + s * 0.14, py + s * 0.12, s * 0.72, s * 0.22, s * 0.11);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  roundRect(x, y, w, h, r) {
    const ctx = this.ctx;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, r);
    else {
      const rr = Math.min(r, w / 2, h / 2);
      ctx.moveTo(x + rr, y);
      ctx.arcTo(x + w, y, x + w, y + h, rr);
      ctx.arcTo(x + w, y + h, x, y + h, rr);
      ctx.arcTo(x, y + h, x, y, rr);
      ctx.arcTo(x, y, x + w, y, rr);
      ctx.closePath();
    }
  }
}
