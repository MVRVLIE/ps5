/**
 * Сборка игры в один самодостаточный HTML-файл: ES-модули склеиваются
 * в крошечный рантайм-реестр, стили и разметка встраиваются внутрь.
 * Нужно для раздачи одной ссылкой и для хостингов без файловой структуры.
 *
 *   node build.mjs  →  dist/index.html   (готовая страница)
 *                      dist/artifact.html (то же без <html>/<head>/<body>)
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.dirname(new URL(import.meta.url).pathname);
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

/** Порядок важен: модуль должен быть собран раньше тех, кто его импортирует. */
const ORDER = ['state', 'math', 'art', 'story', 'audio', 'gallery', 'chat', 'main'];

const EXPORTED = /^export\s+(?:async\s+)?(?:function|const|let|var|class)\s+([A-Za-z_$][\w$]*)/gm;
const NAMESPACE_IMPORT = /^import\s+\*\s+as\s+([A-Za-z_$][\w$]*)\s+from\s+'\.\/(\w+)\.js';?\s*$/gm;
const NAMED_IMPORT = /^import\s*\{([\s\S]*?)\}\s*from\s+'\.\/(\w+)\.js';?\s*$/gm;

function bundleModule(name) {
  let src = read(`src/${name}.js`);

  const exports = [...src.matchAll(EXPORTED)].map((m) => m[1]);
  if (!exports.length && name !== 'main') throw new Error(`модуль ${name} ничего не экспортирует`);

  // импорты → деструктуризация из реестра
  src = src.replace(NAMESPACE_IMPORT, (_, alias, mod) => `const ${alias} = __m.${mod};`);
  src = src.replace(NAMED_IMPORT, (_, names, mod) => {
    const list = names.split(',').map((s) => s.trim()).filter(Boolean)
      .map((s) => s.replace(/\s+as\s+/, ': ')).join(', ');
    return `const { ${list} } = __m.${mod};`;
  });

  if (/^import\s/m.test(src)) throw new Error(`в ${name}.js остался неразобранный import`);

  // в одном файле service worker не нужен — иначе будет 404 в консоли
  src = src.replace(/\/\* ── PWA ── \*\/[\s\S]*$/, '');

  src = src.replace(/^export\s+/gm, '');

  return `__m.${name} = (() => {\n${src}\nreturn { ${exports.join(', ')} };\n})();`;
}

const modules = ORDER.map(bundleModule).join('\n\n');
const css = read('styles.css');

const html = read('index.html');
const body = html
  .slice(html.indexOf('<body>') + 6, html.indexOf('</body>'))
  .replace(/<script[\s\S]*?<\/script>/g, '')
  .trim();

const core = `<title>Формула симпатии</title>
<style>
${css}
</style>

${body}

<script type="module">
/* Формула симпатии — собрано из src/ через build.mjs. Правки вносить в src/. */
const __m = {};

${modules}
</script>`;

// иконку вшиваем data-URI, иначе одиночный файл всё равно тянет favicon с сервера
const iconUri = `data:image/svg+xml;base64,${Buffer.from(read('icon.svg')).toString('base64')}`;

const page = `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no,maximum-scale=1">
<meta name="theme-color" content="#120f1c">
<meta name="description" content="Новелла-мессенджер: решай примеры вместе с Никой, прокачивай симпатию, собирай её фото.">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<link rel="icon" href="${iconUri}">
<link rel="apple-touch-icon" href="${iconUri}">
</head>
<body>
${core}
</body>
</html>`;

fs.mkdirSync(path.join(ROOT, 'dist'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'dist/index.html'), page);
fs.writeFileSync(path.join(ROOT, 'dist/artifact.html'), core);

const kb = (s) => `${(Buffer.byteLength(s) / 1024).toFixed(1)} КБ`;
console.log(`dist/index.html    ${kb(page)}`);
console.log(`dist/artifact.html ${kb(core)}`);
console.log(`модулей склеено:   ${ORDER.length}`);
