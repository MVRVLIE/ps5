/** Каталог «фото» Ники: то, ради чего игрок возвращается и добивает главы. */

import * as art from './art.js';
import { S, hasPhoto, markSeen } from './state.js';
import { REAL_PHOTOS } from './generated.js';

export const PHOTOS = [
  { id: 'desk',    title: 'Рабочее место',  cap: 'вот тут я и страдаю',            hint: 'глава 1',  art: art.sceneDesk },
  { id: 'glasses', title: 'В очках',        cap: 'только не смейся',               hint: 'глава 1',  art: () => art.portrait({ expr: 'wink', accessory: 'glasses', bg: ['#4a2f75', '#8f5bb5'], outfit: '#7aa7ff' }) },
  { id: 'notes',   title: 'Конспект',       cap: 'смотри, я всё записала',         hint: 'глава 2',  art: art.sceneNotes },
  { id: 'cat',     title: 'Пифагор',        cap: 'он мешает мне учиться',          hint: 'глава 2',  art: art.sceneCat },
  { id: 'coffee',  title: 'Топливо',        cap: 'третья за вечер',                hint: 'глава 3',  art: art.sceneCoffee },
  { id: 'laugh',   title: 'Смешно',         cap: 'ты меня рассмешил, вот',         hint: 'глава 3',  art: () => art.portrait({ expr: 'laugh', accessory: 'headphones', bg: ['#7a3d63', '#ff9d6b'], outfit: '#ffca6b' }) },
  { id: 'window',  title: 'Закат',          cap: 'из моего окна, специально тебе', hint: 'глава 4',  art: art.sceneWindow },
  { id: 'think',   title: 'Думаю',          cap: 'думаю над твоим вопросом',       hint: 'глава 4',  art: () => art.portrait({ expr: 'think', accessory: 'pencil', bg: ['#2f3f6e', '#5e7fb5'], outfit: '#a1b7e8' }) },
  { id: 'city',    title: 'Ночь перед экз', cap: 'не сплю. и ты не спи',           hint: 'глава 5',  art: art.sceneCity },
  { id: 'shy',     title: 'Ну ладно',       cap: 'удаляй сразу, поняла?',          hint: 'глава 5',  art: () => art.portrait({ expr: 'shy', accessory: 'clip', bg: ['#8f4a6e', '#ff8fae'], outfit: '#ffd9e2' }) },
  { id: 'exam',    title: 'СДАЛА',          cap: 'ЧЕТЫРЕ!!! это всё ты',           hint: 'глава 6',  art: () => art.portrait({ expr: 'laugh', bg: ['#2f7a63', '#8fe0b5'], outfit: '#ffca6b', accessory: 'clip' }) },
  { id: 'love',    title: 'Для тебя',       cap: 'формула сошлась ♥',              hint: 'финал',    art: () => art.portrait({ expr: 'love', bg: ['#a03a6e', '#ff9db3'], outfit: '#ff6b9d', glow: 'rgba(255,220,235,.4)' }) },
];

export const byId = (id) => PHOTOS.find((p) => p.id === id);

const LOCK = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round">
  <rect x="4.5" y="10.5" width="15" height="10.5" rx="2.5"/><path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7"/></svg>`;

/**
 * Если tools/gen-photos.mjs нарисовал карточку — показываем картинку поверх
 * вектора. Список приходит из сборки, поэтому ни одного запроса вхолостую.
 */
const real = new Set(REAL_PHOTOS);
/** Рамка карточки: сгенерированная картинка поверх вектора либо просто вектор. */
export const frameHtml = (p) =>
  `<div class="frame">${p.art()}${real.has(p.id) ? `<img class="real" src="assets/photos/${p.id}.png" alt="">` : ''}</div>`;

/** Отрисовать сетку коллекции. */
export function renderGallery(gridEl, countEl, onOpen) {
  const opened = PHOTOS.filter((p) => hasPhoto(p.id)).length;
  countEl.textContent = `${opened} / ${PHOTOS.length}`;

  gridEl.innerHTML = '';
  PHOTOS.forEach((p, i) => {
    const el = document.createElement('div');
    el.style.animationDelay = `${Math.min(i, 8) * 26}ms`;

    if (hasPhoto(p.id)) {
      el.className = 'card' + (S.fresh.includes(p.id) ? ' fresh' : '');
      el.innerHTML = `${frameHtml(p)}<div class="cap">${p.title}</div>`;
      el.onclick = () => { markSeen(p.id); onOpen(p); };
    } else {
      el.className = 'card locked';
      el.innerHTML = `<div class="frame">${LOCK}</div><div class="cap">${p.hint}</div>`;
    }
    gridEl.appendChild(el);
  });
}
