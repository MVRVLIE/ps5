/**
 * Генерация 12 карточек коллекции через Gemini Image («nano banana»).
 *
 *   GEMINI_API_KEY=... node tools/gen-photos.mjs
 *   GEMINI_API_KEY=... node tools/gen-photos.mjs --only love,shy   # перегенерить пару
 *   GEMINI_API_KEY=... node tools/gen-photos.mjs --model gemini-3-pro-image-preview
 *
 * Кладёт PNG в assets/photos/<id>.png и переписывает src/generated.js —
 * игра подхватит их вместо векторных заглушек, править ничего не нужно.
 *
 * Сначала генерируется лист персонажа (assets/photos/_reference.png) и дальше
 * подмешивается во все портреты как референс — иначе лицо Ники поедет от
 * карточки к карточке.
 *
 * Ключ берётся с https://aistudio.google.com/apikey — генерация картинок
 * платная, 12 штук стоят центы. Ключ никуда, кроме Google, не уходит.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { PROMPTS, REFERENCE, buildPrompt } from './prompts.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const OUT = path.join(ROOT, 'assets/photos');
const API = 'https://generativelanguage.googleapis.com/v1beta/models';

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const MODEL = flag('model', 'gemini-2.5-flash-image');
const ONLY = flag('only', '').split(',').map((s) => s.trim()).filter(Boolean);
const SKIP_REF = args.includes('--no-ref');

if (!KEY) {
  console.error('Нужен ключ: GEMINI_API_KEY=... node tools/gen-photos.mjs');
  console.error('Взять здесь: https://aistudio.google.com/apikey');
  process.exit(1);
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Один запрос к модели. Возвращает PNG как Buffer. */
async function generate(prompt, referencePng) {
  const parts = [{ text: prompt }];
  if (referencePng) {
    parts.push({ inline_data: { mime_type: 'image/png', data: referencePng.toString('base64') } });
    parts.push({ text: 'Keep the same character face, hair and proportions as the reference image.' });
  }

  for (let attempt = 1; attempt <= 4; attempt++) {
    const res = await fetch(`${API}/${MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': KEY },
      body: JSON.stringify({ contents: [{ parts }] }),
    });

    if (res.status === 429 || res.status >= 500) {
      const back = 2 ** attempt;
      console.log(`    ${res.status}, жду ${back}с и повторяю (${attempt}/4)`);
      await sleep(back * 1000);
      continue;
    }

    const body = await res.text();
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${body.slice(0, 400)}`);

    let json;
    try { json = JSON.parse(body); }
    catch { throw new Error(`ответ не JSON: ${body.slice(0, 200)}`); }

    // разные версии API отдают inlineData либо inline_data
    const found = (json.candidates || [])
      .flatMap((c) => c?.content?.parts || [])
      .map((p) => p.inlineData || p.inline_data)
      .find((d) => d?.data);

    if (found) return Buffer.from(found.data, 'base64');

    const reason = json.candidates?.[0]?.finishReason || json.promptFeedback?.blockReason;
    throw new Error(`картинки нет в ответе${reason ? ` (${reason})` : ''}: ${body.slice(0, 300)}`);
  }
  throw new Error('модель не ответила после 4 попыток');
}

const exists = (p) => fs.access(p).then(() => true, () => false);

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  console.log(`модель: ${MODEL}\nкуда:   assets/photos/\n`);

  // 1. Лист персонажа — опора для всех портретов
  const refPath = path.join(OUT, '_reference.png');
  let reference = null;
  if (!SKIP_REF) {
    if (await exists(refPath)) {
      reference = await fs.readFile(refPath);
      console.log('лист персонажа: беру готовый _reference.png');
    } else {
      console.log('лист персонажа: генерирую…');
      reference = await generate(REFERENCE, null);
      await fs.writeFile(refPath, reference);
      console.log(`  ✓ _reference.png  ${(reference.length / 1024).toFixed(0)} КБ\n`);
    }
  }

  // 2. Карточки
  const queue = ONLY.length ? PROMPTS.filter((p) => ONLY.includes(p.id)) : PROMPTS;
  if (!queue.length) { console.error(`нет карточек с id: ${ONLY.join(', ')}`); process.exit(1); }

  const done = [];
  for (const card of queue) {
    process.stdout.write(`${card.id.padEnd(9)} `);
    try {
      const png = await generate(buildPrompt(card), card.portrait ? reference : null);
      await fs.writeFile(path.join(OUT, `${card.id}.png`), png);
      console.log(`✓ ${(png.length / 1024).toFixed(0)} КБ`);
      done.push(card.id);
    } catch (e) {
      console.log(`✗ ${e.message}`);
    }
    await sleep(1200); // не упираемся в лимит запросов
  }

  // 3. Список для игры. Пишем модулем, а не json — тогда игре не нужен
  //    сетевой запрос, и всё работает офлайн и в одиночной сборке.
  const have = [];
  for (const p of PROMPTS) if (await exists(path.join(OUT, `${p.id}.png`))) have.push(p.id);
  await fs.writeFile(path.join(ROOT, 'src/generated.js'),
    `/**\n * Список карточек, для которых рядом лежат картинки из tools/gen-photos.mjs.\n`
    + ` * Файл переписывается генератором — руками править нет смысла.\n`
    + ` * Пустой список = игра рисует все карточки вектором, как и задумано по умолчанию.\n */\n`
    + `export const REAL_PHOTOS = ${JSON.stringify(have)};\n`);

  console.log(`\nготово: ${done.length} из ${queue.length}; всего картинок в игре ${have.length}/${PROMPTS.length}`);
  if (have.length < PROMPTS.length) {
    console.log(`недостающие рисуются вектором как раньше: ${PROMPTS.filter((p) => !have.includes(p.id)).map((p) => p.id).join(', ')}`);
  }
}

main().catch((e) => { console.error('\n' + e.message); process.exit(1); });
