/**
 * Сборка билда для Яндекс Игр: node tools/build.mjs
 *   dist/                        — готовые файлы (index.html в корне)
 *   build/nine-block-puzzle.zip  — архив для загрузки в консоль разработчика
 *
 * ZIP пишется средствами Node (zlib), внешних зависимостей нет.
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dist = path.join(root, 'dist');
const outDir = path.join(root, 'build');

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const zipName = `${pkg.name}-v${pkg.version}.zip`;

/** Что попадает в билд. Всё остальное (tools, tests, README) — нет. */
const INCLUDE = [
  { from: 'index.html', to: 'index.html' },
  { from: 'src', to: 'src' },
  { from: 'assets/favicon.png', to: 'assets/favicon.png' },
  { from: 'assets/icon-512.png', to: 'assets/icon-512.png' },
];

// ------------------------------ копирование ------------------------------

function walk(dir, base = dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, base));
    else out.push(path.relative(base, full));
  }
  return out;
}

function copyInto(distDir) {
  fs.rmSync(distDir, { recursive: true, force: true });
  fs.mkdirSync(distDir, { recursive: true });
  const files = [];

  for (const item of INCLUDE) {
    const src = path.join(root, item.from);
    if (!fs.existsSync(src)) {
      throw new Error(`Нет файла ${item.from}. Для картинок сначала запустите: npm run assets`);
    }
    if (fs.statSync(src).isDirectory()) {
      for (const rel of walk(src)) {
        const to = path.join(item.to, rel);
        fs.mkdirSync(path.join(distDir, path.dirname(to)), { recursive: true });
        fs.copyFileSync(path.join(src, rel), path.join(distDir, to));
        files.push(to.split(path.sep).join('/'));
      }
    } else {
      fs.mkdirSync(path.join(distDir, path.dirname(item.to)), { recursive: true });
      fs.copyFileSync(src, path.join(distDir, item.to));
      files.push(item.to.split(path.sep).join('/'));
    }
  }
  return files.sort();
}

// -------------------------------- проверки --------------------------------

/** Требования модерации: index.html в корне, никаких внешних загрузок. */
function verify(distDir, files) {
  const problems = [];
  const warnings = [];

  if (!files.includes('index.html')) problems.push('index.html должен лежать в корне архива');

  const html = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
  if (!/<script[^>]+src=["']\/sdk\.js["']/.test(html)) {
    problems.push('в index.html нет подключения <script src="/sdk.js">');
  }

  const external = /(?:src|href)\s*=\s*["'](https?:)?\/\/[^"']+/gi;
  for (const rel of files) {
    if (!/\.(html|css|js|mjs)$/.test(rel)) continue;
    const text = fs.readFileSync(path.join(distDir, rel), 'utf8');
    for (const m of text.matchAll(external)) {
      warnings.push(`${rel}: внешний ресурс ${m[0].slice(0, 70)}`);
    }
  }
  return { problems, warnings };
}

// --------------------------------- ZIP ------------------------------------

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function dosTime(date) {
  const time = ((date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() / 2)) & 0xffff;
  const day = (((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate()) & 0xffff;
  return { time, day };
}

function createZip(baseDir, files) {
  const chunks = [];
  const central = [];
  let offset = 0;
  const now = new Date();
  const { time, day } = dosTime(now);

  for (const rel of files) {
    const data = fs.readFileSync(path.join(baseDir, rel));
    const deflated = zlib.deflateRawSync(data, { level: 9 });
    const useDeflate = deflated.length < data.length;
    const body = useDeflate ? deflated : data;
    const method = useDeflate ? 8 : 0;
    const name = Buffer.from(rel, 'utf8');
    const crc = crc32(data);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);       // версия
    local.writeUInt16LE(0x0800, 6);   // флаг: имена в UTF-8
    local.writeUInt16LE(method, 8);
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(day, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(data.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);
    chunks.push(local, name, body);

    const cd = Buffer.alloc(46);
    cd.writeUInt32LE(0x02014b50, 0);
    cd.writeUInt16LE(20, 4);
    cd.writeUInt16LE(20, 6);
    cd.writeUInt16LE(0x0800, 8);
    cd.writeUInt16LE(method, 10);
    cd.writeUInt16LE(time, 12);
    cd.writeUInt16LE(day, 14);
    cd.writeUInt32LE(crc, 16);
    cd.writeUInt32LE(body.length, 20);
    cd.writeUInt32LE(data.length, 24);
    cd.writeUInt16LE(name.length, 28);
    cd.writeUInt32LE(0, 36);          // внешние атрибуты
    cd.writeUInt32LE(offset, 42);
    central.push(cd, name);

    offset += local.length + name.length + body.length;
  }

  const centralBuf = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(centralBuf.length, 12);
  end.writeUInt32LE(offset, 16);

  return Buffer.concat([...chunks, centralBuf, end]);
}

// --------------------------------- запуск ---------------------------------

const files = copyInto(dist);
const { problems, warnings } = verify(dist, files);

fs.mkdirSync(outDir, { recursive: true });
const zip = createZip(dist, files);
const zipPath = path.join(outDir, zipName);
fs.writeFileSync(zipPath, zip);

const totalRaw = files.reduce((s, f) => s + fs.statSync(path.join(dist, f)).size, 0);

console.log(`Файлов: ${files.length}`);
for (const f of files) {
  const size = fs.statSync(path.join(dist, f)).size;
  console.log(`  ${f.padEnd(34)} ${(size / 1024).toFixed(1).padStart(7)} КБ`);
}
console.log(`\nИсходный размер : ${(totalRaw / 1024).toFixed(1)} КБ`);
console.log(`Архив           : ${path.relative(root, zipPath)} — ${(zip.length / 1024).toFixed(1)} КБ`);

for (const w of warnings) console.log(`ВНИМАНИЕ  ${w}`);
if (problems.length) {
  for (const p of problems) console.error(`ОШИБКА    ${p}`);
  process.exit(1);
}

console.log(`
Готово. Дальше:
  1. Консоль разработчика: https://games.yandex.ru/console
  2. Черновик игры → загрузите ${path.relative(root, zipPath)}
  3. Лидерборд с техническим именем «score» (см. src/config.js)
  4. Иконка assets/icon-512.png и обложка assets/cover-800x470.png
  5. Отправьте на модерацию`);
