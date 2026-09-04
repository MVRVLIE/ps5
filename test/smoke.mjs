/**
 * Смоук-тест: поднимает сервер, прогоняет игру от первого сообщения до финала
 * и проверяет, что петля замкнулась. Запуск: npm test
 */

import { spawn } from 'node:child_process';
import { chromium } from 'playwright';

const PORT = 8099;
const URL = `http://localhost:${PORT}/`;
const failures = [];

const ok = (cond, msg) => {
  console.log(`${cond ? '  ✓' : '  ✗'} ${msg}`);
  if (!cond) failures.push(msg);
};

/** В контейнерах Playwright иногда не находит браузер по умолчанию. */
async function launch() {
  try { return await chromium.launch(); }
  catch {
    return chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  }
}

const server = spawn(process.execPath, ['server.js'], {
  env: { ...process.env, PORT: String(PORT) },
  stdio: 'ignore',
});
await new Promise((r) => setTimeout(r, 1200));

const browser = await launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

const errors = [];
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));

await page.goto(URL, { waitUntil: 'networkidle' });

/** Кликаем то, что предлагает нижняя панель, пока сюжет не кончится. */
let clicks = 0;
const deadline = Date.now() + 180000;
while (Date.now() < deadline && clicks < 90) {
  const opt = page.locator('.composer .opt:not([disabled])');
  const reply = page.locator('.composer .reply');
  const cta = page.locator('.composer .cta');

  if (await opt.count()) { await opt.first().click(); await page.waitForTimeout(900); clicks++; }
  else if (await reply.count()) { await reply.first().click(); clicks++; }
  else if (await cta.count()) { await cta.first().click(); clicks++; }
  else await page.waitForTimeout(200);

  const st = await page.evaluate(() => JSON.parse(localStorage.getItem('formula-simpatii.v1') || '{}'));
  if (st.chapter >= 6 && st.photos?.length === 12) break;
  await page.waitForTimeout(180);
}

console.log('\nПрохождение');
const st = await page.evaluate(() => JSON.parse(localStorage.getItem('formula-simpatii.v1')));
ok(st.chapter >= 6, `сюжет пройден до конца (глава ${st.chapter})`);
ok(st.photos.length === 12, `открыты все 12 фото (${st.photos.length})`);
ok(st.aff > 0, `симпатия начисляется (${st.aff})`);
ok(st.solved + st.wrong > 0, `примеры засчитываются (${st.solved} верных, ${st.wrong} мимо)`);
ok(st.days === 1, 'серия дней стартовала');

console.log('\nЭкраны');
await page.locator('.tab[data-view="gallery"]').click();
await page.waitForTimeout(500);
ok((await page.locator('#gallery-count').textContent()) === '12 / 12', 'галерея показывает 12 / 12');
await page.locator('.card:not(.locked)').first().click();
await page.waitForTimeout(400);
ok(!(await page.locator('#lightbox').isHidden()), 'фото открывается на весь экран');
await page.locator('#lb-close').click();
await page.waitForTimeout(300);
ok(await page.locator('#lightbox').isHidden(), 'просмотр закрывается');

await page.locator('.tab[data-view="profile"]').click();
await page.waitForTimeout(400);
ok((await page.locator('#profile .pcard').count()) === 4, 'профиль отрисован');

console.log('\nСохранение');
await page.locator('.tab[data-view="chat"]').click();
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(1600);
const after = await page.evaluate(() => JSON.parse(localStorage.getItem('formula-simpatii.v1')));
ok(after.aff === st.aff, `симпатия пережила перезагрузку (${after.aff})`);
ok(after.photos.length === 12, 'коллекция пережила перезагрузку');
ok((await page.locator('.thread .row').count()) > 0, 'переписка восстановлена из истории');

console.log('\nОшибки в консоли');
ok(errors.length === 0, errors.length ? `их ${errors.length}: ${errors.slice(0, 3).join(' | ')}` : 'нет');

await browser.close();
server.kill();

console.log(failures.length ? `\n❌ провалено проверок: ${failures.length}` : '\n✅ все проверки пройдены');
process.exit(failures.length ? 1 : 0);
