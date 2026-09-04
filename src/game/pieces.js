/**
 * Фигуры: базовые формы + автоматически построенные повороты.
 * Форма — массив клеток [x, y], нормализованный к левому верхнему углу.
 */

const key = (cells) => cells.map(([x, y]) => `${x},${y}`).sort().join(' ');

function normalize(cells) {
  const minX = Math.min(...cells.map((c) => c[0]));
  const minY = Math.min(...cells.map((c) => c[1]));
  return cells
    .map(([x, y]) => [x - minX, y - minY])
    .sort((a, b) => a[1] - b[1] || a[0] - b[0]);
}

/** Поворот на 90° по часовой стрелке. */
const rotate = (cells) => normalize(cells.map(([x, y]) => [-y, x]));

/** Все уникальные повороты формы (1, 2 или 4 штуки). */
function rotations(cells) {
  const out = [];
  const seen = new Set();
  let cur = normalize(cells);
  for (let i = 0; i < 4; i++) {
    const k = key(cur);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(cur);
    }
    cur = rotate(cur);
  }
  return out;
}

const line = (n, vertical = false) =>
  Array.from({ length: n }, (_, i) => (vertical ? [0, i] : [i, 0]));

const rect = (w, h) => {
  const cells = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) cells.push([x, y]);
  return cells;
};

/** Базовые формы. weight — относительная частота выпадения семейства. */
const BASE = [
  { id: 'dot', cells: [[0, 0]], weight: 5 },
  { id: 'i2', cells: line(2), weight: 9 },
  { id: 'i3', cells: line(3), weight: 9 },
  { id: 'i4', cells: line(4), weight: 6 },
  { id: 'i5', cells: line(5), weight: 3 },
  { id: 'o2', cells: rect(2, 2), weight: 8 },
  { id: 'o3', cells: rect(3, 3), weight: 2 },
  { id: 'r23', cells: rect(2, 3), weight: 4 },
  { id: 'v3', cells: [[0, 0], [0, 1], [1, 1]], weight: 9 },
  { id: 'v5', cells: [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]], weight: 5 },
  { id: 'l4', cells: [[0, 0], [0, 1], [0, 2], [1, 2]], weight: 5 },
  { id: 'j4', cells: [[1, 0], [1, 1], [1, 2], [0, 2]], weight: 5 },
  { id: 't4', cells: [[0, 0], [1, 0], [2, 0], [1, 1]], weight: 4 },
  { id: 's4', cells: [[1, 0], [2, 0], [0, 1], [1, 1]], weight: 3 },
  { id: 'z4', cells: [[0, 0], [1, 0], [1, 1], [2, 1]], weight: 3 },
  { id: 'd2', cells: [[0, 0], [1, 1]], weight: 2 },
];

/** Семейства фигур с готовыми поворотами и закреплённым цветом. */
export const FAMILIES = BASE.map((f, i) => ({
  id: f.id,
  weight: f.weight,
  color: (i % 8) + 1,
  variants: rotations(f.cells),
  size: f.cells.length,
}));

const TOTAL_WEIGHT = FAMILIES.reduce((s, f) => s + f.weight, 0);

export function bounds(cells) {
  let w = 0;
  let h = 0;
  for (const [x, y] of cells) {
    if (x + 1 > w) w = x + 1;
    if (y + 1 > h) h = y + 1;
  }
  return { w, h };
}

/** Случайная фигура с учётом весов семейств. */
export function randomPiece(rng) {
  let r = rng() * TOTAL_WEIGHT;
  let family = FAMILIES[FAMILIES.length - 1];
  for (const f of FAMILIES) {
    r -= f.weight;
    if (r <= 0) {
      family = f;
      break;
    }
  }
  const cells = family.variants[rng.int(family.variants.length)];
  const { w, h } = bounds(cells);
  return { id: family.id, cells, color: family.color, size: cells.length, w, h };
}

/**
 * Новый набор фигур для лотка.
 * Пока поле относительно свободно, не выдаём заведомо мёртвый набор:
 * хотя бы одна фигура должна помещаться. На плотном поле раздача честная —
 * иначе игра никогда бы не заканчивалась.
 */
export function dealTray(board, rng, count = 3, fairLimit = 40) {
  const fair = board.filled <= fairLimit;
  for (let attempt = 0; attempt < (fair ? 30 : 1); attempt++) {
    const tray = Array.from({ length: count }, () => randomPiece(rng));
    if (!fair || tray.some((p) => board.canPlaceAnywhere(p.cells))) return tray;
  }
  return Array.from({ length: count }, () => randomPiece(rng));
}
