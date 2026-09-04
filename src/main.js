/** Точка входа: экраны, вкладки, галерея, профиль и запуск переписки. */

import { S, load, save, reset, levelInfo, touchDay, dailyDone } from './state.js';
import { PHOTOS, renderGallery } from './gallery.js';
import { initChat, runChat } from './chat.js';
import { sfx, unlockAudio, setMuted } from './audio.js';

const $ = (id) => document.getElementById(id);

const dom = {
  thread: $('thread'), composer: $('composer'), status: $('head-status'),
  headAvatar: $('head-avatar'), affFill: $('aff-fill'), affLvl: $('aff-lvl'),
  affWrap: $('affection'), levelup: $('levelup'),
};

load();

/* ── тосты ── */
let toastTimer = 0;
function toast(text) {
  const t = $('toast');
  t.textContent = text;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ── просмотр фото ── */
function openPhoto(ph) {
  $('lb-card').innerHTML = `<div class="frame">${ph.art()}</div>`;
  $('lb-cap').textContent = `«${ph.title}» — ${ph.cap}`;
  $('lightbox').hidden = false;
  sfx.tap();
}
$('lb-close').onclick = () => { $('lightbox').hidden = true; };
$('lightbox').onclick = (e) => { if (e.target.id === 'lightbox') $('lightbox').hidden = true; };

/* ── вкладки ── */
let view = 'chat';
function show(name) {
  view = name;
  document.querySelectorAll('.view').forEach((v) => v.classList.toggle('active', v.id === `view-${name}`));
  document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.dataset.view === name));
  if (name === 'gallery') { $('dot-gallery').hidden = true; drawGallery(); }
  if (name === 'profile') drawProfile();
  sfx.tap();
}
document.querySelectorAll('.tab').forEach((t) => { t.onclick = () => show(t.dataset.view); });

const drawGallery = () => renderGallery($('grid'), $('gallery-count'), openPhoto);

/* ── профиль ── */
function drawProfile() {
  const i = levelInfo();
  const opened = PHOTOS.filter((p) => S.photos.includes(p.id)).length;
  const acc = S.solved + S.wrong ? Math.round((S.solved / (S.solved + S.wrong)) * 100) : 0;

  const achievements = [
    ['Первый пример', S.solved >= 1],
    ['10 верных', S.solved >= 10],
    ['50 верных', S.solved >= 50],
    ['Серия 5', S.bestStreak >= 5],
    ['Серия 10', S.bestStreak >= 10],
    ['Полколлекции', opened >= 6],
    ['Все фото', opened >= PHOTOS.length],
    ['Сюжет пройден', S.chapter >= 6],
    ['3 дня подряд', S.days >= 3],
    ['7 дней подряд', S.days >= 7],
    ['Челлендж 5/5', S.dailyBest >= 5],
  ];

  $('profile').innerHTML = `
    <div class="pcard">
      <h3>Отношения</h3>
      <div class="prow"><span>Уровень</span><b>${i.level} · ${i.name}</b></div>
      <div class="prow"><span>Симпатия</span><b>${S.aff}${i.max ? '' : ` / ${S.aff - i.into + i.need}`}</b></div>
      <div class="prow"><span>Глава</span><b>${S.chapter >= 6 ? 'пройдено ✓' : `${S.chapter + 1} из 6`}</b></div>
      <div class="prow"><span>Фото</span><b>${opened} / ${PHOTOS.length}</b></div>
    </div>

    <div class="pcard">
      <h3>Серия дней</h3>
      <div class="streakbig">
        <div class="fire">${S.days >= 3 ? '🔥' : '🌱'}</div>
        <div><b>${S.days}</b><span>${S.days === 1 ? 'день' : 'дней'} подряд · челлендж дня ${dailyDone() ? 'пройден' : 'ждёт'}</span></div>
      </div>
    </div>

    <div class="pcard">
      <h3>Математика</h3>
      <div class="prow"><span>Решено верно</span><b>${S.solved}</b></div>
      <div class="prow"><span>Точность</span><b>${acc}%</b></div>
      <div class="prow"><span>Лучшая серия</span><b>${S.bestStreak}</b></div>
      <div class="prow"><span>Свободный режим</span><b>${S.marathonBest}</b></div>
      <div class="prow"><span>Челлендж дня</span><b>${S.dailyBest} / 5</b></div>
    </div>

    <div class="pcard">
      <h3>Достижения</h3>
      <div class="achv">${achievements.map(([n, on]) => `<span class="badge${on ? ' on' : ''}">${on ? '★' : '☆'} ${n}</span>`).join('')}</div>
    </div>

    <button class="cta quiet" id="btn-reset">Начать историю заново</button>`;

  $('btn-reset').onclick = () => {
    if (!confirm('Сбросить весь прогресс: главы, симпатию и все фото?')) return;
    reset();
    location.reload();
  };
}

/* ── звук ── */
function paintMute() { $('btn-mute').textContent = S.muted ? '🔇' : '♪'; }
$('btn-mute').onclick = () => { setMuted(!S.muted); paintMute(); if (!S.muted) sfx.tap(); };
paintMute();
window.addEventListener('pointerdown', function once() {
  unlockAudio();
  window.removeEventListener('pointerdown', once);
}, { once: true });

/* ── запуск ── */
initChat(dom, {
  toast,
  openPhoto,
  onPhoto: () => { if (view !== 'gallery') $('dot-gallery').hidden = false; },
});

const day = touchDay();
if (day.isNewDay && day.streak > 1) toast(`🔥 ${day.streak} ${day.streak < 5 ? 'дня' : 'дней'} подряд — Ника заметила`);
else if (day.broken && day.streak === 1 && S.solved > 0) toast('серия дней сбросилась — начинаем заново');

runChat();

/* ── PWA ── */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
}
