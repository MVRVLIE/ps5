/**
 * Движок переписки: последовательно проигрывает сценарий, вставляет примеры,
 * выдаёт фото и начисляет симпатию. Каждый интерактивный шаг — это await
 * промиса, который резолвится тапом игрока, поэтому вся логика читается сверху вниз.
 */

import {
  S, save, pushLog, addAffection, levelInfo, markCorrect, markWrong,
  unlockPhoto, dailyDone, finishDaily, todaySeed,
} from './state.js';
import { makeProblem, topicsForLevel, useRandom, seededRandom } from './math.js';
import { CHAPTERS, MARATHON, DAILY } from './story.js';
import { byId, frameHtml } from './gallery.js';
import { avatar } from './art.js';
import { sfx } from './audio.js';

let el = {};
let hooks = {};
let running = false;

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const pick = (a) => a[Math.floor(Math.random() * a.length)];

export function initChat(dom, cbs) {
  el = dom;
  hooks = cbs;
  setAvatar('smile');
  updateAff();
  restoreLog();
}

/* ─────────────── примитивы ленты ─────────────── */

function scroll() {
  requestAnimationFrame(() => { el.thread.scrollTop = el.thread.scrollHeight; });
}

function addRow(html, who, animate = true) {
  const row = document.createElement('div');
  row.className = 'row' + (who === 'me' ? ' me' : '');
  if (!animate) row.style.animation = 'none';
  row.innerHTML = (who === 'me' ? '' : `<div class="mini">${avatar(lastExpr)}</div>`) + html;

  // как в настоящем мессенджере: аватарка только у последней реплики в серии
  if (who !== 'me') {
    const prev = el.thread.lastElementChild;
    if (prev?.classList.contains('row') && !prev.classList.contains('me')) prev.classList.add('tail');
  }

  el.thread.appendChild(row);
  scroll();
  return row;
}

function addSys(text, animate = true) {
  const b = document.createElement('div');
  b.className = 'bubble sys';
  b.textContent = text;
  if (!animate) b.style.animation = 'none';
  el.thread.appendChild(b);
  scroll();
}

const esc = (s) => String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));

let lastExpr = 'smile';
function setAvatar(expr) {
  lastExpr = expr;
  if (el.headAvatar) el.headAvatar.innerHTML = avatar(expr);
}

function status(text, typing = false) {
  if (!el.status) return;
  el.status.textContent = text;
  el.status.classList.toggle('typing', typing);
}

/** Её сообщение — с индикатором «печатает», длительность зависит от длины текста. */
async function her(text, expr) {
  if (expr) setAvatar(expr);
  const t = addRow('<div class="bubble typing-b"><i></i><i></i><i></i></div>', 'her');
  status('печатает…', true);
  await wait(Math.min(1500, 320 + text.length * 20));
  t.remove();
  status('в сети');
  addRow(`<div class="bubble">${esc(text)}</div>`, 'her');
  sfx.msg();
  pushLog({ k: 'her', x: text, e: lastExpr });
  await wait(160);
}

async function me(text) {
  addRow(`<div class="bubble">${esc(text)}</div>`, 'me');
  sfx.send();
  pushLog({ k: 'me', x: text });
  await wait(280);
}

function addTask(p, streak) {
  const html = `<div class="task">
      <div class="topic">${esc(p.label)}</div>
      <div class="q">${esc(p.q)}${p.sub ? `<small>${esc(p.sub)}</small>` : ''}</div>
      ${streak >= 2 ? `<div class="streak">🔥 серия ${streak} — верный ответ даёт бонус</div>` : ''}
    </div>`;
  const wrapEl = document.createElement('div');
  wrapEl.innerHTML = html;
  el.thread.appendChild(wrapEl.firstElementChild);
  scroll();
}

function addSolution(p) {
  const d = document.createElement('div');
  d.className = 'solve';
  d.innerHTML = `Правильно: <b>${esc(p.answer)}</b><br>${esc(p.solution)}`;
  el.thread.appendChild(d);
  scroll();
}

function addPhoto(ph) {
  const d = document.createElement('div');
  d.className = 'photo';
  d.innerHTML = `${frameHtml(ph)}<div class="cap">${esc(ph.cap)}</div>`;
  d.onclick = () => hooks.openPhoto(ph);
  el.thread.appendChild(d);
  scroll();
  pushLog({ k: 'photo', id: ph.id });
}

/** Восстановить переписку при возврате в игру. */
function restoreLog() {
  if (!S.log.length) return;
  for (const e of S.log) {
    if (e.k === 'her') { lastExpr = e.e || 'smile'; addRow(`<div class="bubble">${esc(e.x)}</div>`, 'her', false); }
    else if (e.k === 'me') addRow(`<div class="bubble">${esc(e.x)}</div>`, 'me', false);
    else if (e.k === 'sys') addSys(e.x, false);
    else if (e.k === 'photo') { const ph = byId(e.id); if (ph) addPhoto(ph); }
  }
  addSys('вы вернулись');
  el.thread.scrollTop = el.thread.scrollHeight;
}

/* ─────────────── низ экрана ─────────────── */

const clearComposer = () => { el.composer.innerHTML = ''; };

function btn(cls, html) {
  const b = document.createElement('button');
  b.className = cls;
  b.innerHTML = html;
  return b;
}

/** Показать варианты реплик, дождаться выбора. */
function showReplies(opts) {
  return new Promise((resolve) => {
    clearComposer();
    const box = document.createElement('div');
    box.className = 'replies';
    opts.forEach((o, i) => {
      const b = btn('reply', esc(o.x));
      b.style.animationDelay = `${i * 45}ms`;
      b.onclick = () => { clearComposer(); resolve(o); };
      box.appendChild(b);
    });
    el.composer.appendChild(box);
  });
}

/** Показать 4 варианта ответа. Резолвится после анимации верно/неверно. */
function showOptions(p) {
  return new Promise((resolve) => {
    clearComposer();
    const box = document.createElement('div');
    box.className = 'opts';
    const all = [];
    p.options.forEach((v, i) => {
      const b = btn('opt', esc(v));
      b.style.animationDelay = `${i * 40}ms`;
      b.onclick = async () => {
        const ok = v === p.answer;
        all.forEach((x) => { x.disabled = true; });
        b.classList.add(ok ? 'right' : 'wrong');
        if (!ok) all.find((x) => x.textContent === p.answer)?.classList.add('right');
        await wait(ok ? 460 : 900);
        clearComposer();
        resolve(ok);
      };
      all.push(b);
      box.appendChild(b);
    });
    el.composer.appendChild(box);
  });
}

/** Одна или несколько кнопок; резолвится индексом нажатой. */
function showButtons(list, hint) {
  return new Promise((resolve) => {
    clearComposer();
    list.forEach((b, i) => {
      const node = btn(b.quiet ? 'cta quiet' : 'cta', esc(b.label));
      node.style.animationDelay = `${i * 50}ms`;
      node.onclick = () => { clearComposer(); resolve(i); };
      el.composer.appendChild(node);
    });
    if (hint) {
      const h = document.createElement('div');
      h.className = 'hintline';
      h.textContent = hint;
      el.composer.appendChild(h);
    }
  });
}

/* ─────────────── симпатия ─────────────── */

function updateAff() {
  const i = levelInfo();
  el.affFill.style.width = `${i.pct * 100}%`;
  el.affLvl.textContent = i.max ? i.name : `ур. ${i.level} · ${i.name}`;
}

async function gain(n) {
  if (!n) return;
  const up = addAffection(n);
  el.affWrap.classList.add('pulse');
  setTimeout(() => el.affWrap.classList.remove('pulse'), 500);
  updateAff();
  if (up) await levelUp(up);
}

async function levelUp(level) {
  const i = levelInfo();
  sfx.level();
  el.levelup.hidden = false;
  el.levelup.innerHTML =
    `<div class="big">уровень симпатии</div><div class="n">${level}</div><div class="sub">${esc(i.name)}</div>`;
  if (navigator.vibrate) navigator.vibrate([12, 60, 22]);
  await wait(1900);
  el.levelup.hidden = true;
}

/* ─────────────── шаги сценария ─────────────── */

const advance = () => { S.step++; save(); };

async function doChoice(st) {
  const o = await showReplies(st.opts);
  await me(o.x);
  await gain(o.aff || 0);
  await her(o.reply);
  if (o.then) await her(o.then);
}

function nextProblem(st) {
  const lvl = levelInfo().level;
  const topic = st.topic || pick(topicsForLevel(lvl));
  const d = st.d || Math.max(1, Math.min(5, Math.ceil(lvl / 2)));
  return makeProblem(topic, d);
}

async function doMath(st) {
  if (st.intro) await her(st.intro);
  const p = nextProblem(st);
  addTask(p, S.streak);
  status('ждёт ответ');
  const ok = await showOptions(p);
  status('в сети');

  if (ok) {
    const streak = markCorrect();
    sfx.right(streak);
    if (navigator.vibrate) navigator.vibrate(10);
    const base = st.aff ?? 8;
    const bonus = streak >= 3 ? Math.round(base * 0.6) : 0;
    if (bonus) hooks.toast(`🔥 серия ${streak} · +${bonus} к симпатии`);
    await gain(base + bonus);
    await her(st.good || pick(MARATHON.good), 'laugh');
  } else {
    markWrong();
    sfx.wrong();
    addSolution(p);
    await her(st.bad || pick(MARATHON.bad), 'think');
    await gain(2);
    await showButtons([{ label: 'Понял, дальше' }]);
  }
  return ok;
}

async function doPhoto(st) {
  if (st.pre) await her(st.pre);
  status('отправляет фото…', true);
  await wait(620);
  status('в сети');
  const ph = byId(st.id);
  if (!ph) return;
  addPhoto(ph);
  sfx.photo();
  if (navigator.vibrate) navigator.vibrate([8, 40, 8]);
  if (unlockPhoto(st.id)) {
    hooks.onPhoto(ph);
    hooks.toast(`Новое фото: «${ph.title}»`);
  }
  await gain(5);
  await wait(320);
}

async function doEnd(st) {
  const next = CHAPTERS[S.chapter + 1];
  addSys(`Конец главы · ${st.x}`);
  pushLog({ k: 'sys', x: `Конец главы · ${st.x}` });

  const list = [{ label: next ? `Дальше: «${next.title}»` : 'Свободный режим' }];
  if (!dailyDone()) list.push({ label: '🎯 Челлендж дня', quiet: true });

  const i = await showButtons(list, next ? 'прогресс сохраняется сам' : 'сюжет пройден — Ника продолжит писать');
  if (i === 1) { await runDaily(); return; }

  S.chapter++; S.step = 0; save();
}

/* ─────────────── челлендж дня ─────────────── */

async function runDaily() {
  addSys('Челлендж дня');
  await her(DAILY.intro, 'wink');

  useRandom(seededRandom(todaySeed()));
  const lvl = levelInfo().level;
  const set = Array.from({ length: 5 }, (_, i) =>
    makeProblem(pick(topicsForLevel(lvl)), Math.max(1, Math.min(5, Math.ceil(lvl / 2) + (i > 2 ? 1 : 0)))));
  useRandom(null);

  let score = 0;
  for (let i = 0; i < set.length; i++) {
    const p = set[i];
    addSys(`${i + 1} из 5`);
    addTask(p, 0);
    if (await showOptions(p)) { score++; sfx.right(score); } else { sfx.wrong(); addSolution(p); }
  }

  finishDaily(score);
  await her(DAILY.win(score), score >= 4 ? 'laugh' : 'think');
  await gain(score * 6);
  hooks.toast(`Челлендж дня: ${score}/5`);
}

/* ─────────────── бесконечный режим ─────────────── */

async function marathonRound() {
  if (!S.marathonStarted) {
    S.marathonStarted = true; save();
    addSys('Свободный режим');
    await her('сюжет кончился, а я нет', 'wink');
    await her('буду кидать примеры. посмотрим, как долго продержишься');
  }

  const before = S.streak;
  const ok = await doMath({ intro: pick(MARATHON.intro), aff: 6 });
  if (ok && S.streak > S.marathonBest) { S.marathonBest = S.streak; save(); }
  if (!ok && before >= 5) hooks.toast(`серия оборвалась на ${before}`);

  const list = [{ label: 'Ещё пример' }];
  if (!dailyDone()) list.push({ label: '🎯 Челлендж дня', quiet: true });
  const i = await showButtons(list, `лучшая серия: ${S.marathonBest}`);
  if (i === 1) await runDaily();
}

/* ─────────────── главный цикл ─────────────── */

async function tick() {
  const ch = CHAPTERS[S.chapter];
  if (!ch) return marathonRound();

  const st = ch.steps[S.step];
  if (!st) { S.chapter++; S.step = 0; save(); return; }

  switch (st.t) {
    case 'sys':    addSys(st.x); pushLog({ k: 'sys', x: st.x }); advance(); break;
    case 'msg':    await her(st.x, st.e); advance(); break;
    case 'me':     await me(st.x); advance(); break;
    case 'choice': await doChoice(st); advance(); break;
    case 'math':   await doMath(st); advance(); break;
    case 'photo':  await doPhoto(st); advance(); break;
    case 'end':    await doEnd(st); break;
    default:       advance();
  }
}

export async function runChat() {
  if (running) return;
  running = true;
  status('в сети');
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try { await tick(); }
    catch (e) { console.error(e); await wait(600); }
  }
}
