/** Игровое поле 9×9 с очисткой строк, столбцов и квадратов 3×3. */

/** Максимальный индекс цвета (см. CONFIG.colors). Битые сохранения обрезаем по нему. */
const MAX_COLOR = 8;

export class Board {
  constructor(size = 9, box = 3) {
    this.size = size;
    this.box = box;
    this.boxes = size / box;
    this.cells = new Int8Array(size * size);
    this.filled = 0;
  }

  reset() {
    this.cells.fill(0);
    this.filled = 0;
  }

  idx(x, y) {
    return y * this.size + x;
  }

  get(x, y) {
    return this.cells[y * this.size + x];
  }

  set(x, y, v) {
    const i = y * this.size + x;
    const was = this.cells[i];
    if (was === 0 && v !== 0) this.filled++;
    else if (was !== 0 && v === 0) this.filled--;
    this.cells[i] = v;
  }

  inside(x, y) {
    return x >= 0 && y >= 0 && x < this.size && y < this.size;
  }

  /** Помещается ли фигура левым верхним углом в (ox, oy). */
  canPlace(shape, ox, oy) {
    for (const [dx, dy] of shape) {
      const x = ox + dx;
      const y = oy + dy;
      if (!this.inside(x, y) || this.cells[y * this.size + x] !== 0) return false;
    }
    return true;
  }

  /** Есть ли на поле хоть одно место для фигуры. */
  canPlaceAnywhere(shape) {
    for (let y = 0; y < this.size; y++) {
      for (let x = 0; x < this.size; x++) {
        if (this.canPlace(shape, x, y)) return true;
      }
    }
    return false;
  }

  /** Ставит фигуру; возвращает занятые клетки. Проверку делает вызывающий код. */
  place(shape, ox, oy, color) {
    const placed = [];
    for (const [dx, dy] of shape) {
      const x = ox + dx;
      const y = oy + dy;
      this.set(x, y, color);
      placed.push([x, y]);
    }
    return placed;
  }

  /** Полные строки, столбцы и квадраты + список клеток к удалению (без дублей). */
  findClears() {
    const n = this.size;
    const rows = [];
    const cols = [];
    const boxes = [];

    for (let y = 0; y < n; y++) {
      let full = true;
      for (let x = 0; x < n; x++) {
        if (this.cells[y * n + x] === 0) { full = false; break; }
      }
      if (full) rows.push(y);
    }

    for (let x = 0; x < n; x++) {
      let full = true;
      for (let y = 0; y < n; y++) {
        if (this.cells[y * n + x] === 0) { full = false; break; }
      }
      if (full) cols.push(x);
    }

    for (let by = 0; by < this.boxes; by++) {
      for (let bx = 0; bx < this.boxes; bx++) {
        let full = true;
        outer:
        for (let y = 0; y < this.box; y++) {
          for (let x = 0; x < this.box; x++) {
            if (this.cells[(by * this.box + y) * n + bx * this.box + x] === 0) {
              full = false;
              break outer;
            }
          }
        }
        if (full) boxes.push([bx, by]);
      }
    }

    const seen = new Set();
    const cells = [];
    const add = (x, y) => {
      const i = y * n + x;
      if (seen.has(i)) return;
      seen.add(i);
      cells.push([x, y, this.cells[i]]);
    };

    for (const y of rows) for (let x = 0; x < n; x++) add(x, y);
    for (const x of cols) for (let y = 0; y < n; y++) add(x, y);
    for (const [bx, by] of boxes) {
      for (let y = 0; y < this.box; y++) {
        for (let x = 0; x < this.box; x++) add(bx * this.box + x, by * this.box + y);
      }
    }

    return { rows, cols, boxes, cells, lines: rows.length + cols.length + boxes.length };
  }

  /** Что очистится, если поставить фигуру в (ox, oy). Поле не меняется. */
  previewClears(shape, ox, oy) {
    if (!this.canPlace(shape, ox, oy)) return null;
    for (const [dx, dy] of shape) this.cells[(oy + dy) * this.size + ox + dx] = -1;
    const clear = this.findClears();
    for (const [dx, dy] of shape) this.cells[(oy + dy) * this.size + ox + dx] = 0;
    return clear;
  }

  /** Удаляет клетки, найденные findClears(). */
  applyClears(clear) {
    for (const [x, y] of clear.cells) this.set(x, y, 0);
  }

  /** Заполненность квадрата 3×3. */
  boxFill(bx, by) {
    let n = 0;
    for (let y = 0; y < this.box; y++) {
      for (let x = 0; x < this.box; x++) {
        if (this.get(bx * this.box + x, by * this.box + y) !== 0) n++;
      }
    }
    return n;
  }

  /** Чистит два самых заполненных квадрата 3×3 (бонус «спасение»). */
  clearFullestBoxes(count = 2) {
    const list = [];
    for (let by = 0; by < this.boxes; by++) {
      for (let bx = 0; bx < this.boxes; bx++) list.push({ bx, by, n: this.boxFill(bx, by) });
    }
    list.sort((a, b) => b.n - a.n);
    const removed = [];
    for (const { bx, by, n } of list.slice(0, count)) {
      if (n === 0) continue;
      for (let y = 0; y < this.box; y++) {
        for (let x = 0; x < this.box; x++) {
          const cx = bx * this.box + x;
          const cy = by * this.box + y;
          const v = this.get(cx, cy);
          if (v !== 0) {
            removed.push([cx, cy, v]);
            this.set(cx, cy, 0);
          }
        }
      }
    }
    return removed;
  }

  toJSON() {
    return Array.from(this.cells);
  }

  load(arr) {
    if (!Array.isArray(arr) || arr.length !== this.cells.length) return false;
    this.filled = 0;
    for (let i = 0; i < arr.length; i++) {
      const v = Math.max(0, Math.min(MAX_COLOR, Number(arr[i]) | 0));
      this.cells[i] = v;
      if (v !== 0) this.filled++;
    }
    return true;
  }
}
