import test from 'node:test';
import assert from 'node:assert/strict';

import { Board } from '../src/game/board.js';
import { FAMILIES, randomPiece, dealTray, bounds } from '../src/game/pieces.js';
import { Game, STATE } from '../src/game/game.js';
import { createRng } from '../src/core/rng.js';
import { CONFIG } from '../src/config.js';
import { translate, LANGS, pickLang } from '../src/i18n/index.js';

const fillRow = (b, y, exceptX = -1) => {
  for (let x = 0; x < b.size; x++) if (x !== exceptX) b.set(x, y, 1);
};

test('повороты фигур уникальны и нормализованы', () => {
  for (const f of FAMILIES) {
    assert.ok(f.variants.length >= 1 && f.variants.length <= 4, f.id);
    for (const v of f.variants) {
      assert.equal(v.length, f.size, `${f.id}: размер сохраняется при повороте`);
      assert.ok(v.some(([x]) => x === 0), `${f.id}: прижата к левому краю`);
      assert.ok(v.some(([, y]) => y === 0), `${f.id}: прижата к верхнему краю`);
    }
  }
});

test('квадрат 2×2 имеет один вариант, уголок — четыре', () => {
  assert.equal(FAMILIES.find((f) => f.id === 'o2').variants.length, 1);
  assert.equal(FAMILIES.find((f) => f.id === 'v3').variants.length, 4);
});

test('счётчик заполненных клеток корректен', () => {
  const b = new Board();
  b.set(0, 0, 3);
  b.set(0, 0, 4);
  assert.equal(b.filled, 1);
  b.set(0, 0, 0);
  assert.equal(b.filled, 0);
});

test('строка очищается целиком', () => {
  const b = new Board();
  fillRow(b, 4, 8);
  assert.equal(b.findClears().lines, 0);
  b.set(8, 4, 2);
  const clear = b.findClears();
  assert.equal(clear.lines, 1);
  assert.deepEqual(clear.rows, [4]);
  assert.equal(clear.cells.length, 9);
  b.applyClears(clear);
  assert.equal(b.filled, 0);
});

test('квадрат 3×3 очищается', () => {
  const b = new Board();
  for (let y = 3; y < 6; y++) for (let x = 6; x < 9; x++) b.set(x, y, 5);
  const clear = b.findClears();
  assert.deepEqual(clear.boxes, [[2, 1]]);
  assert.equal(clear.cells.length, 9);
});

test('строка + столбец не дублируют общую клетку', () => {
  const b = new Board();
  for (let x = 0; x < 9; x++) b.set(x, 0, 1);
  for (let y = 0; y < 9; y++) b.set(0, y, 1);
  const clear = b.findClears();
  assert.equal(clear.lines, 2);
  assert.equal(clear.cells.length, 17); // 9 + 9 - 1 общая
});

test('canPlaceAnywhere видит единственное свободное место', () => {
  const b = new Board();
  for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) b.set(x, y, 1);
  b.set(4, 4, 0);
  assert.ok(b.canPlaceAnywhere([[0, 0]]));
  assert.ok(!b.canPlaceAnywhere([[0, 0], [1, 0]]));
});

test('очки: клетки + линия', () => {
  const g = new Game({ rng: createRng(1) });
  g.newGame();
  fillRow(g.board, 0, 8);
  g.board.set(4, 4, 1); // чтобы поле не оказалось пустым и не сработал бонус
  g.tray = [{ id: 'dot', cells: [[0, 0]], color: 1, size: 1, w: 1, h: 1 }, null, null];
  const res = g.place(0, 8, 0);
  assert.ok(res, 'ход выполнен');
  assert.equal(res.clear.lines, 1);
  assert.equal(res.perfect, false);
  assert.equal(res.gained, CONFIG.score.perCell + CONFIG.score.lineBase);
  assert.equal(g.board.filled, 1);
});

test('бонус за полностью очищенное поле', () => {
  const g = new Game({ rng: createRng(11) });
  g.newGame();
  fillRow(g.board, 0, 8);
  g.tray = [{ id: 'dot', cells: [[0, 0]], color: 1, size: 1, w: 1, h: 1 }, null, null];
  const res = g.place(0, 8, 0);
  assert.equal(res.perfect, true);
  assert.equal(g.board.filled, 0);
  assert.equal(res.gained, CONFIG.score.perCell + CONFIG.score.lineBase + 150);
});

test('комбо растёт и упирается в потолок', () => {
  const g = new Game({ rng: createRng(2) });
  g.newGame();
  const dot = () => [{ id: 'dot', cells: [[0, 0]], color: 1, size: 1, w: 1, h: 1 }, null, null];
  const multipliers = [];
  for (let i = 0; i < 12; i++) {
    fillRow(g.board, 0, 8);
    g.tray = dot();
    multipliers.push(g.place(0, 8, 0).multiplier);
  }
  assert.equal(multipliers[0], 1);
  assert.ok(multipliers[1] > multipliers[0]);
  assert.equal(multipliers.at(-1), CONFIG.score.comboMax);

  // ход без очистки обнуляет комбо
  g.tray = dot();
  g.place(0, 4, 4);
  assert.equal(g.combo, 0);
});

test('конец игры, когда фигуры некуда ставить', () => {
  const g = new Game({ rng: createRng(3) });
  g.newGame();
  const events = [];
  g.onEvent = (t) => events.push(t);
  for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) g.board.set(x, y, 1);
  g.board.set(4, 4, 0);
  g.tray = [{ id: 'i2', cells: [[0, 0], [1, 0]], color: 1, size: 2, w: 2, h: 1 }, null, null];
  assert.ok(!g.hasMove());
  g.gameOver();
  assert.equal(g.state, STATE.OVER);
  assert.ok(events.includes('gameover'));
});

test('раздача на свободном поле всегда играбельна', () => {
  const rng = createRng(7);
  for (let i = 0; i < 200; i++) {
    const b = new Board();
    for (let k = 0; k < 30; k++) b.set(rng.int(9), rng.int(9), 1);
    if (b.filled > 40) continue;
    const tray = dealTray(b, rng, 3);
    assert.equal(tray.length, 3);
    assert.ok(tray.some((p) => b.canPlaceAnywhere(p.cells)), 'есть ход');
  }
});

test('спасение освобождает место и возвращает игру', () => {
  const g = new Game({ rng: createRng(4) });
  g.newGame();
  for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) g.board.set(x, y, 1);
  g.board.set(0, 0, 0);
  g.gameOver();
  assert.equal(g.state, STATE.OVER);
  const removed = g.rescue();
  assert.ok(removed.length > 0);
  assert.equal(g.state, STATE.PLAYING);
  assert.ok(g.hasMove());
  assert.equal(g.rescuesUsed, 1);
});

test('спасений не больше лимита', () => {
  const g = new Game({ rng: createRng(5) });
  g.newGame();
  g.rescuesUsed = CONFIG.maxRescues;
  assert.equal(g.canRescue(), false);
  assert.equal(g.rescue(), null);
});

test('сохранение и восстановление партии', () => {
  const g = new Game({ rng: createRng(6) });
  g.newGame();
  for (let i = 0; i < 5; i++) {
    const slot = g.tray.findIndex((p) => p);
    const piece = g.tray[slot];
    let done = false;
    for (let y = 0; y < 9 && !done; y++) {
      for (let x = 0; x < 9 && !done; x++) {
        if (g.canPlace(slot, x, y)) { g.place(slot, x, y); done = true; }
      }
    }
  }
  const snapshot = JSON.parse(JSON.stringify(g.toJSON()));
  const g2 = new Game({ rng: createRng(6) });
  assert.ok(g2.restore(snapshot));
  assert.equal(g2.score, g.score);
  assert.deepEqual(Array.from(g2.board.cells), Array.from(g.board.cells));
  assert.equal(g2.board.filled, g.board.filled);
});

test('битое сохранение не ломает игру', () => {
  const g = new Game({ rng: createRng(8) });
  assert.equal(g.restore(null), false);
  assert.equal(g.restore({ board: [1, 2], tray: [] }), false);
  assert.equal(g.restore({ board: new Array(81).fill(0), tray: 'нет' }), false);
});

test('bounds считает габариты фигуры', () => {
  assert.deepEqual(bounds([[0, 0], [0, 1], [0, 2]]), { w: 1, h: 3 });
  assert.deepEqual(bounds([[0, 0], [2, 1]]), { w: 3, h: 2 });
});

test('случайная фигура всегда валидна', () => {
  const rng = createRng(9);
  for (let i = 0; i < 500; i++) {
    const p = randomPiece(rng);
    assert.ok(p.size >= 1 && p.size <= 9);
    assert.ok(p.w <= 5 && p.h <= 5);
    assert.ok(p.color >= 1 && p.color <= 8);
  }
});

test('переводы полные для всех языков', () => {
  const keys = Object.keys(LANGS.ru.dict);
  for (const code of Object.keys(LANGS)) {
    for (const k of keys) {
      assert.ok(LANGS[code].dict[k], `${code}: нет ключа ${k}`);
    }
  }
  assert.equal(pickLang('tr-TR'), 'tr');
  assert.equal(pickLang('be'), 'ru');
  assert.equal(pickLang('fr'), 'en');
  assert.equal(translate('en', 'menu.play'), LANGS.en.dict['menu.play']);
  assert.equal(translate('en', 'нет.такого.ключа'), 'нет.такого.ключа');
});

test('статистика не задваивается после спасения', () => {
  const g = new Game({ rng: createRng(12) });
  g.newGame();
  g.linesCleared = 4;
  const first = g.takeStats();
  assert.deepEqual({ games: first.games, lines: first.lines }, { games: 1, lines: 4 });

  // после спасения партия продолжается и заканчивается ещё раз
  g.rescue();
  g.linesCleared = 7;
  const second = g.takeStats();
  assert.deepEqual({ games: second.games, lines: second.lines }, { games: 0, lines: 3 });

  g.newGame();
  const third = g.takeStats();
  assert.equal(third.games, 1);
});

test('повреждённое сохранение не приводит к некорректному состоянию', () => {
  const g = new Game({ rng: createRng(13) });
  const dot = { id: 'dot', cells: [[0, 0]], color: 1 };

  // цвета вне палитры обрезаются
  const board = new Array(81).fill(0);
  board[0] = 999;
  board[1] = -5;
  assert.ok(g.restore({ board, tray: [dot, dot, dot], score: 10 }));
  assert.equal(g.board.get(0, 0), 8);
  assert.equal(g.board.get(1, 0), 0);
  for (const v of g.board.cells) assert.ok(v >= 0 && v <= 8);
  for (const p of g.tray) assert.ok(p.color >= 1 && p.color <= 8);

  // фигура с клетками вне поля отвергается целиком
  const g2 = new Game({ rng: createRng(14) });
  assert.equal(
    g2.restore({ board: new Array(81).fill(0), tray: [{ id: 'x', cells: [[0, 0], [50, 50]] }, dot, dot] }),
    false,
  );
  assert.equal(
    g2.restore({ board: new Array(81).fill(0), tray: [{ id: 'x', cells: ['мусор'] }, dot, dot] }),
    false,
  );
});
