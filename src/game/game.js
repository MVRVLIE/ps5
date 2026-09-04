/** Игровая логика: лоток фигур, счёт, комбо, конец игры, спасение. */

import { CONFIG } from '../config.js';
import { Board } from './board.js';
import { dealTray, bounds } from './pieces.js';
import { createRng } from '../core/rng.js';

export const STATE = { IDLE: 'idle', PLAYING: 'playing', OVER: 'over' };

export class Game {
  constructor({ rng = createRng(), onEvent = () => {} } = {}) {
    this.rng = rng;
    this.onEvent = onEvent;
    this.board = new Board(CONFIG.grid, CONFIG.box);
    this.tray = [];
    this.state = STATE.IDLE;
    this.score = 0;
    this.best = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.moves = 0;
    this.linesCleared = 0;
    this.rescuesUsed = 0;
    this._countedGames = 0;
    this._countedLines = 0;
  }

  emit(type, payload) {
    this.onEvent(type, payload);
  }

  newGame() {
    this.board.reset();
    this.score = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.moves = 0;
    this.linesCleared = 0;
    this.rescuesUsed = 0;
    this._countedGames = 0;
    this._countedLines = 0;
    this.state = STATE.PLAYING;
    this.refillTray(true);
    this.emit('newgame', null);
    this.emit('score', { score: 0, gained: 0 });
    return this;
  }

  refillTray(force = false) {
    if (!force && this.tray.some((p) => p !== null)) return;
    this.tray = dealTray(this.board, this.rng, CONFIG.trayCount);
    this.emit('tray', { tray: this.tray });
  }

  /** Осталась ли хоть одна фигура, которую можно куда-то поставить. */
  hasMove() {
    return this.tray.some((p) => p && this.board.canPlaceAnywhere(p.cells));
  }

  canPlace(slot, ox, oy) {
    const piece = this.tray[slot];
    return !!piece && this.state === STATE.PLAYING && this.board.canPlace(piece.cells, ox, oy);
  }

  /**
   * Ставит фигуру из лотка. Возвращает null, если ход невозможен,
   * иначе описание хода — его использует рендер для анимаций.
   */
  place(slot, ox, oy) {
    if (!this.canPlace(slot, ox, oy)) return null;

    const piece = this.tray[slot];
    const placed = this.board.place(piece.cells, ox, oy, piece.color);
    this.tray[slot] = null;
    this.moves++;

    const clear = this.board.findClears();
    let gained = piece.size * CONFIG.score.perCell;
    let multiplier = 1;

    if (clear.lines > 0) {
      this.board.applyClears(clear);
      this.combo++;
      this.bestCombo = Math.max(this.bestCombo, this.combo);
      this.linesCleared += clear.lines;
      const L = clear.lines;
      const base = CONFIG.score.lineBase * ((L * (L + 1)) / 2);
      multiplier = Math.min(1 + CONFIG.score.comboStep * (this.combo - 1), CONFIG.score.comboMax);
      gained += Math.round(base * multiplier);
    } else {
      this.combo = 0;
    }

    const perfect = this.board.filled === 0;
    if (perfect) gained += 150;

    this.score += gained;
    this.emit('place', { piece, placed, slot });
    if (clear.lines > 0) this.emit('clear', { clear, gained, combo: this.combo, multiplier, perfect });
    this.emit('score', { score: this.score, gained });

    this.refillTray();

    if (!this.hasMove()) this.gameOver();

    return { placed, clear, gained, combo: this.combo, multiplier, perfect };
  }

  gameOver() {
    if (this.state === STATE.OVER) return;
    this.state = STATE.OVER;
    const record = this.score > this.best;
    if (record) this.best = this.score;
    this.emit('gameover', { score: this.score, best: this.best, record });
  }

  /** Спасение: чистим два самых плотных квадрата и раздаём новые фигуры. */
  rescue() {
    if (this.rescuesUsed >= CONFIG.maxRescues) return null;
    this.rescuesUsed++;
    const removed = this.board.clearFullestBoxes(2);
    this.state = STATE.PLAYING;
    this.combo = 0;
    this.refillTray(true);
    if (!this.hasMove()) {
      // Крайне редкий случай: даже после чистки ходов нет.
      this.board.clearFullestBoxes(3);
      this.refillTray(true);
    }
    this.emit('rescue', { removed });
    return removed;
  }

  canRescue() {
    return this.rescuesUsed < CONFIG.maxRescues;
  }

  /**
   * Прирост статистики с прошлого вызова. Нужен, потому что после спасения
   * партия продолжается и конец игры может наступить несколько раз.
   */
  takeStats() {
    const games = this._countedGames === 0 ? 1 : 0;
    const lines = this.linesCleared - this._countedLines;
    this._countedGames = 1;
    this._countedLines = this.linesCleared;
    return { games, lines, bestCombo: this.bestCombo };
  }

  toJSON() {
    return {
      board: this.board.toJSON(),
      tray: this.tray.map((p) =>
        p ? { id: p.id, cells: p.cells, color: p.color } : null),
      score: this.score,
      combo: this.combo,
      bestCombo: this.bestCombo,
      moves: this.moves,
      linesCleared: this.linesCleared,
      rescuesUsed: this.rescuesUsed,
    };
  }

  /** Восстановление незаконченной партии. Возвращает false, если данные битые. */
  restore(data) {
    if (!data || !Array.isArray(data.board) || !Array.isArray(data.tray)) return false;
    if (!this.board.load(data.board)) return false;
    try {
      this.tray = data.tray.map((p) => {
        if (!p || !Array.isArray(p.cells) || p.cells.length === 0) return null;
        if (p.cells.length > CONFIG.grid) throw new Error('фигура больше поля');
        const cells = p.cells.map((c) => {
          if (!Array.isArray(c) || c.length !== 2) throw new Error('битая клетка');
          const x = c[0] | 0;
          const y = c[1] | 0;
          if (x < 0 || y < 0 || x >= CONFIG.grid || y >= CONFIG.grid) throw new Error('клетка вне поля');
          return [x, y];
        });
        const { w, h } = bounds(cells);
        const color = Math.max(1, Math.min(CONFIG.colors.length - 1, p.color | 0));
        return { id: String(p.id || 'x'), cells, color, size: cells.length, w, h };
      });
    } catch {
      return false;
    }
    if (this.tray.length !== CONFIG.trayCount) return false;
    this.score = Number(data.score) || 0;
    this.combo = Number(data.combo) || 0;
    this.bestCombo = Number(data.bestCombo) || 0;
    this.moves = Number(data.moves) || 0;
    this.linesCleared = Number(data.linesCleared) || 0;
    this.rescuesUsed = Number(data.rescuesUsed) || 0;
    this._countedGames = 0;
    this._countedLines = this.linesCleared;
    this.state = STATE.PLAYING;
    if (this.tray.every((p) => p === null)) this.refillTray(true);
    if (!this.hasMove()) return false;
    this.emit('tray', { tray: this.tray });
    this.emit('score', { score: this.score, gained: 0 });
    return true;
  }
}
