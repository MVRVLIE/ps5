/**
 * Ввод: перетаскивание фигур мышью и пальцем.
 * Работает на Pointer Events, координаты — CSS-пиксели канваса.
 */

import { CONFIG } from '../config.js';
import { slotScale } from './layout.js';

/** На сенсорном экране поднимаем фигуру над пальцем, иначе её не видно. */
const TOUCH_LIFT = 1.35;

export class DragController {
  constructor(canvas, { getLayout, getGame, onPlace, onPick, onDrop, isBlocked }) {
    this.canvas = canvas;
    this.getLayout = getLayout;
    this.getGame = getGame;
    this.onPlace = onPlace;
    this.onPick = onPick;
    this.onDrop = onDrop;
    this.isBlocked = isBlocked || (() => false);

    this.drag = { active: false, slot: -1, piece: null, x: 0, y: 0, target: null, valid: false, preview: null };
    this.pointerId = null;

    this._down = this.onPointerDown.bind(this);
    this._move = this.onPointerMove.bind(this);
    this._up = this.onPointerUp.bind(this);
    this._cancel = this.onPointerCancel.bind(this);

    canvas.addEventListener('pointerdown', this._down);
    canvas.addEventListener('pointermove', this._move);
    canvas.addEventListener('pointerup', this._up);
    canvas.addEventListener('pointercancel', this._cancel);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  destroy() {
    this.canvas.removeEventListener('pointerdown', this._down);
    this.canvas.removeEventListener('pointermove', this._move);
    this.canvas.removeEventListener('pointerup', this._up);
    this.canvas.removeEventListener('pointercancel', this._cancel);
  }

  reset() {
    this.drag.active = false;
    this.drag.piece = null;
    this.drag.slot = -1;
    this.drag.target = null;
    this.drag.preview = null;
    this.pointerId = null;
  }

  point(e) {
    const r = this.canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  /** Ячейка лотка под точкой (с запасом по площади касания). */
  slotAt(p) {
    const { slots } = this.getLayout();
    for (let i = 0; i < slots.length; i++) {
      const s = slots[i];
      if (p.x >= s.x && p.x <= s.x + s.w && p.y >= s.y - s.h * 0.18 && p.y <= s.y + s.h * 1.18) return i;
    }
    return -1;
  }

  onPointerDown(e) {
    if (this.isBlocked() || this.drag.active) return;
    const game = this.getGame();
    const p = this.point(e);
    const slot = this.slotAt(p);
    const piece = slot >= 0 ? game.tray[slot] : null;
    if (!piece) return;

    const layout = this.getLayout();
    const cell = layout.board.cell;
    const s = cell * slotScale(piece, layout.slots[slot], cell);

    // где палец держит фигуру — сохраняем относительную точку, чтобы не «прыгало»
    const slotBox = layout.slots[slot];
    const relX = (p.x - (slotBox.cx - (piece.w * s) / 2)) / (piece.w * s);
    const relY = (p.y - (slotBox.cy - (piece.h * s) / 2)) / (piece.h * s);

    this.grab = {
      relX: Math.min(1, Math.max(0, relX)),
      relY: Math.min(1, Math.max(0, relY)),
      touch: e.pointerType !== 'mouse',
    };

    this.drag.active = true;
    this.drag.slot = slot;
    this.drag.piece = piece;
    this.pointerId = e.pointerId;
    this.canvas.setPointerCapture?.(e.pointerId);
    this.updatePosition(p);
    this.onPick?.(piece);
    e.preventDefault();
  }

  onPointerMove(e) {
    if (!this.drag.active || e.pointerId !== this.pointerId) return;
    this.updatePosition(this.point(e));
    e.preventDefault();
  }

  updatePosition(p) {
    const layout = this.getLayout();
    const game = this.getGame();
    const cell = layout.board.cell;
    const piece = this.drag.piece;
    const lift = this.grab.touch ? cell * TOUCH_LIFT : 0;

    this.drag.x = p.x - this.grab.relX * piece.w * cell;
    this.drag.y = p.y - this.grab.relY * piece.h * cell - lift;

    const gx = Math.round((this.drag.x - layout.board.x) / cell);
    const gy = Math.round((this.drag.y - layout.board.y) / cell);
    const inRange =
      gx > -piece.w && gy > -piece.h && gx < CONFIG.grid && gy < CONFIG.grid;

    this.drag.target = inRange ? { x: gx, y: gy } : null;
    this.drag.valid = inRange && game.canPlace(this.drag.slot, gx, gy);
    this.drag.preview = this.drag.valid ? game.board.previewClears(piece.cells, gx, gy) : null;
  }

  onPointerUp(e) {
    if (!this.drag.active || e.pointerId !== this.pointerId) return;
    const { slot, target, valid } = this.drag;
    const piece = this.drag.piece;
    this.canvas.releasePointerCapture?.(e.pointerId);
    this.reset();
    if (valid && target) this.onPlace?.(slot, target.x, target.y);
    else this.onDrop?.(piece);
    e.preventDefault();
  }

  onPointerCancel(e) {
    if (e.pointerId !== this.pointerId) return;
    this.reset();
  }
}
