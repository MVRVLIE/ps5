/**
 * Сквозной тест в настоящем браузере: node tests/e2e.mjs
 * Требует Playwright:  npm i -D playwright && npx playwright install chromium
 * Скриншоты:           SHOTS=./shots node tests/e2e.mjs
 */

import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SHOTS = process.env.SHOTS;
const PORT = 8123;
const URL = `http://localhost:${PORT}/?debug=1`;

const server = spawn('node', [path.join(ROOT, 'tools/serve.mjs'), String(PORT)], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 700));

const errors = [];
const browser = await chromium.launch();

async function makePage(size, name) {
  const ctx = await browser.newContext({ viewport: size, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') errors.push(`[${name}] console: ${m.text()}`); });
  page.on('pageerror', (e) => errors.push(`[${name}] pageerror: ${e.message}`));
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.waitForSelector('#screen-menu.screen--visible', { timeout: 10000 });
  return { ctx, page };
}

// --- координаты для перетаскивания ------------------------------------
const dragPlan = (page, slot) => page.evaluate((s) => {
  const { game, renderer } = window.__nine;
  const piece = game.tray[s];
  if (!piece) return null;
  const L = renderer.layout;
  const cell = L.board.cell;
  // координаты слоя canvas → координаты страницы
  const r = document.getElementById('board').getBoundingClientRect();
  for (let y = 0; y < 9; y++) {
    for (let x = 0; x < 9; x++) {
      if (!game.canPlace(s, x, y)) continue;
      const slotBox = L.slots[s];
      return {
        from: { x: r.left + slotBox.cx, y: r.top + slotBox.cy },
        // курсор держит фигуру в её центре → целимся в центр будущего места
        to: {
          x: r.left + L.board.x + (x + piece.w / 2) * cell,
          y: r.top + L.board.y + (y + piece.h / 2) * cell,
        },
        gx: x, gy: y,
      };
    }
  }
  return null;
}, slot);

async function dragMove(page, slot) {
  const plan = await dragPlan(page, slot);
  if (!plan) return false;
  await page.mouse.move(plan.from.x, plan.from.y);
  await page.mouse.down();
  await page.mouse.move(plan.to.x, plan.to.y, { steps: 12 });
  await page.mouse.up();
  await page.waitForTimeout(90);
  return true;
}

const state = (page) => page.evaluate(() => {
  const { game } = window.__nine;
  return {
    state: game.state,
    score: game.score,
    filled: game.board.filled,
    tray: game.tray.map((p) => (p ? p.id : null)),
    moves: game.moves,
  };
});

// =============================== мобильный =============================
console.log('— мобильный портрет 390×844 —');
const m = await makePage({ width: 390, height: 844 }, 'mobile');
if (SHOTS) await m.page.screenshot({ path: `${SHOTS}/01-menu.png` });

await m.page.click('#btn-play');
await m.page.waitForTimeout(300);
let st = await state(m.page);
console.log('  после старта:', st.state, 'фигур в лотке:', st.tray.filter(Boolean).length);
if (st.state !== 'playing') throw new Error('игра не стартовала');

let placed = 0;
for (let i = 0; i < 24; i++) {
  const cur = await state(m.page);
  if (cur.state !== 'playing') break;
  const slot = cur.tray.findIndex(Boolean);
  if (slot < 0) break;
  if (await dragMove(m.page, slot)) placed++;
  else break;
}
st = await state(m.page);
console.log(`  сделано ходов: ${st.moves}, счёт: ${st.score}, занято клеток: ${st.filled}`);
if (st.moves < 5) throw new Error('перетаскивание не работает');
if (st.score <= 0) throw new Error('очки не начисляются');
if (SHOTS) await m.page.screenshot({ path: `${SHOTS}/02-play.png` });

// подсветка при наведении фигуры на поле
const plan = await dragPlan(m.page, (await state(m.page)).tray.findIndex(Boolean));
if (plan) {
  await m.page.mouse.move(plan.from.x, plan.from.y);
  await m.page.mouse.down();
  await m.page.mouse.move(plan.to.x, plan.to.y, { steps: 8 });
  const d = await m.page.evaluate(() => {
    const { drag } = window.__nine;
    return { active: drag.drag.active, valid: drag.drag.valid, target: drag.drag.target };
  });
  console.log('  перетаскивание:', d);
  if (!d.active || !d.valid) throw new Error('предпросмотр установки не работает');
  if (SHOTS) await m.page.screenshot({ path: `${SHOTS}/03-drag.png` });
  await m.page.mouse.up();
}

// пауза
await m.page.click('#btn-pause');
await m.page.waitForSelector('#screen-pause.screen--visible');
if (SHOTS) await m.page.screenshot({ path: `${SHOTS}/04-pause.png` });
await m.page.click('#btn-resume');
await m.page.waitForTimeout(150);

// собранная линия
const lineResult = await m.page.evaluate(() => {
  const { game } = window.__nine;
  game.board.reset();
  for (let x = 0; x < 8; x++) game.board.set(x, 4, 3);
  game.tray = [{ id: 'dot', cells: [[0, 0]], color: 5, size: 1, w: 1, h: 1 }, null, null];
  const before = game.score;
  const res = game.place(0, 8, 4);
  return { lines: res.clear.lines, gained: game.score - before, filled: game.board.filled };
});
console.log('  очистка линии:', lineResult);
if (lineResult.lines !== 1 || lineResult.filled !== 0) throw new Error('линия не очистилась');
if (SHOTS) { await m.page.waitForTimeout(120); await m.page.screenshot({ path: `${SHOTS}/05-clear.png` }); }

// конец игры + спасение за рекламу
await m.page.evaluate(() => {
  const { game } = window.__nine;
  for (let y = 0; y < 9; y++) for (let x = 0; x < 9; x++) game.board.set(x, y, ((x + y) % 8) + 1);
  game.board.set(0, 0, 0);
  game.tray = [{ id: 'i2', cells: [[0, 0], [1, 0]], color: 1, size: 2, w: 2, h: 1 }, null, null];
  game.gameOver();
});
await m.page.waitForSelector('#screen-gameover.screen--visible', { timeout: 3000 });
console.log('  экран конца игры показан');
if (SHOTS) await m.page.screenshot({ path: `${SHOTS}/06-gameover.png` });

await m.page.click('#btn-rescue');
await m.page.waitForTimeout(500);
const afterRescue = await state(m.page);
console.log('  после спасения:', afterRescue.state, 'занято:', afterRescue.filled);
if (afterRescue.state !== 'playing') throw new Error('спасение не вернуло игру');
if (SHOTS) await m.page.screenshot({ path: `${SHOTS}/07-rescue.png` });

// лидерборд (вне платформы — сообщение) и правила
await m.page.evaluate(() => window.__nine.ui.h.onMenu());
await m.page.waitForSelector('#screen-menu.screen--visible');
await m.page.click('#btn-leaders');
await m.page.waitForTimeout(300);
const lbText = await m.page.textContent('#leaders-list');
console.log('  лидерборд вне платформы:', JSON.stringify(lbText.trim().slice(0, 60)));
if (SHOTS) await m.page.screenshot({ path: `${SHOTS}/08-leaders.png` });
await m.page.click('#btn-leaders-back');

// смена языка
await m.page.click('#btn-howto');
await m.page.waitForSelector('#screen-howto.screen--visible');
if (SHOTS) await m.page.screenshot({ path: `${SHOTS}/09-howto.png` });
await m.page.click('#btn-howto-back');
await m.page.evaluate(() => window.__nine.ui.h.onLang('en'));
await m.page.waitForTimeout(150);
const enTitle = await m.page.textContent('#btn-play');
console.log('  переключение языка → EN:', JSON.stringify(enTitle));
if (enTitle.trim() !== 'Play') throw new Error('язык не переключился');
if (SHOTS) await m.page.screenshot({ path: `${SHOTS}/10-menu-en.png` });
await m.page.evaluate(() => window.__nine.ui.h.onLang('ru'));

// сохранение партии между сессиями
await m.page.click('#btn-play');
await m.page.waitForTimeout(200);
for (let i = 0; i < 3; i++) {
  const cur = await state(m.page);
  const slot = cur.tray.findIndex(Boolean);
  if (slot >= 0) await dragMove(m.page, slot);
}
const before = await state(m.page);
await m.page.reload({ waitUntil: 'networkidle' });
await m.page.waitForSelector('#screen-menu.screen--visible');
const hasContinue = await m.page.isVisible('#btn-continue');
console.log('  кнопка «Продолжить» после перезагрузки:', hasContinue);
if (!hasContinue) throw new Error('незаконченная партия не сохранилась');
await m.page.click('#btn-continue');
await m.page.waitForTimeout(300);
const after = await state(m.page);
console.log(`  восстановлено: счёт ${before.score} → ${after.score}, клеток ${before.filled} → ${after.filled}`);
if (after.score !== before.score || after.filled !== before.filled) throw new Error('партия восстановлена неверно');

await m.ctx.close();

// =============================== десктоп ===============================
console.log('— десктоп 1280×800 —');
const d = await makePage({ width: 1280, height: 800 }, 'desktop');
await d.page.click('#btn-play');
await d.page.waitForTimeout(300);
for (let i = 0; i < 6; i++) {
  const cur = await state(d.page);
  const slot = cur.tray.findIndex(Boolean);
  if (slot >= 0) await dragMove(d.page, slot);
}
const dst = await state(d.page);
console.log(`  ходов: ${dst.moves}, счёт: ${dst.score}`);
if (SHOTS) await d.page.screenshot({ path: `${SHOTS}/11-desktop.png` });
await d.ctx.close();

// ============================ ландшафт телефона =========================
console.log('— телефон в ландшафте 844×390 —');
const l = await makePage({ width: 844, height: 390 }, 'landscape');
if (SHOTS) await l.page.screenshot({ path: `${SHOTS}/12-landscape-menu.png` });
await l.page.click('#btn-play');
await l.page.waitForTimeout(300);
for (let i = 0; i < 4; i++) {
  const cur = await state(l.page);
  const slot = cur.tray.findIndex(Boolean);
  if (slot >= 0) await dragMove(l.page, slot);
}
if (SHOTS) await l.page.screenshot({ path: `${SHOTS}/13-landscape.png` });
await l.ctx.close();

await browser.close();
server.kill();

if (errors.length) {
  console.log('\nОШИБКИ В КОНСОЛИ:');
  for (const e of errors) console.log('  ' + e);
  process.exit(1);
}
console.log('\nВсе проверки пройдены, ошибок в консоли нет.');
