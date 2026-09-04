/** Точка входа: связывает логику, отрисовку, звук, интерфейс и SDK Яндекс Игр. */

import { CONFIG } from './config.js';
import { Game, STATE } from './game/game.js';
import { Renderer } from './game/renderer.js';
import { DragController } from './game/input.js';
import { audio } from './game/audio.js';
import { platform } from './platform/yandex.js';
import { save } from './platform/save.js';
import { UI } from './ui/ui.js';
import { i18n, pickLang } from './i18n/index.js';

const canvas = document.getElementById('board');
const renderer = new Renderer(canvas);

let lastInterstitial = 0;
let reviewAsked = false;
let paused = false;
let advPending = false;

const game = new Game({ onEvent: handleGameEvent });

const ui = new UI({
  onPlay: () => startGame(true),
  onContinue: () => continueRun(),
  onRestart: () => startGame(false),
  onPause: () => pauseGame(),
  onResume: () => resumeGame(),
  onMenu: () => goMenu(),
  onLeaders: (from) => openLeaders(from),
  onHowTo: () => { audio.click(); ui.show('howto'); },
  onBack: () => { audio.click(); ui.show(game.state === STATE.OVER ? 'gameover' : 'menu'); },
  onLogin: () => login(),
  onRescue: () => rescue(),
  onSound: () => toggleSound(),
  onLang: (code) => setLang(code),
});

const drag = new DragController(canvas, {
  getLayout: () => renderer.layout,
  getGame: () => game,
  isBlocked: () => paused || advPending || ui.current !== null || game.state !== STATE.PLAYING,
  onPick: () => { audio.unlock(); audio.pick(); },
  onPlace: (slot, x, y) => {
    game.place(slot, x, y);
    persistRun();
  },
  onDrop: () => audio.invalid(),
});

// --------------------------- игровые события ---------------------------

function handleGameEvent(type, payload) {
  switch (type) {
    case 'place':
      audio.place();
      renderer.markPlaced(payload.placed);
      break;

    case 'clear':
      onClear(payload);
      break;

    case 'score':
      ui.setScore(payload.score, payload.gained > 0);
      break;

    case 'rescue':
      audio.rescue();
      for (const [x, y, color] of payload.removed) {
        const { board } = renderer.layout;
        renderer.effects.fade(board.x + x * board.cell, board.y + y * board.cell, board.cell, CONFIG.colors[color] || '#fff');
        renderer.effects.burst(board.x + (x + 0.5) * board.cell, board.y + (y + 0.5) * board.cell, CONFIG.colors[color] || '#fff', 4, 0.8);
      }
      renderer.effects.kick(1.2);
      ui.toast(i18n.t('toast.rescue'));
      break;

    case 'gameover':
      onGameOver(payload);
      break;

    default:
      break;
  }
}

function onClear({ clear, gained, combo, perfect }) {
  renderer.spawnClear(clear.cells);
  renderer.effects.kick(Math.min(2, clear.lines * 0.7));
  audio.clearLines(clear.lines, combo);

  const { board } = renderer.layout;
  let sx = 0;
  let sy = 0;
  for (const [x, y] of clear.cells) {
    sx += board.x + (x + 0.5) * board.cell;
    sy += board.y + (y + 0.5) * board.cell;
  }
  const cx = sx / clear.cells.length;
  const cy = sy / clear.cells.length;
  renderer.effects.float(cx, cy, `+${gained}`, '#ffffff', 1);

  if (combo >= 2) {
    renderer.effects.float(cx, cy - board.cell * 0.9, i18n.t('toast.combo', { n: combo }), '#ffd43b', 0.8);
    audio.combo(combo);
  }
  if (clear.lines >= 3) ui.toast(i18n.t('toast.lines', { n: clear.lines }));
  if (perfect) {
    audio.perfect();
    ui.toast(i18n.t('toast.perfect'));
    renderer.effects.kick(2);
  }
}

async function onGameOver({ score, best, record }) {
  audio.gameover();
  platform.gameplayStop();

  const stats = game.takeStats();
  save.patch({
    best: Math.max(save.data.best, best),
    games: save.data.games + stats.games,
    lines: save.data.lines + stats.lines,
    bestCombo: Math.max(save.data.bestCombo, stats.bestCombo),
    run: null,
  });
  ui.setBest(save.data.best);
  ui.setMenuStats({ best: save.data.best, games: save.data.games });
  ui.setContinueVisible(false);
  save.flush(true);

  if (record && score > 0) ui.toast(i18n.t('toast.record', { n: score }));

  // Экран конца игры показываем после эффектов — так он не перебивает анимацию.
  setTimeout(() => {
    ui.setGameOver({ score, best: save.data.best, record, canRescue: game.canRescue() });
    ui.show('gameover');
  }, 650);

  platform.submitScore(score);

  if (stats.games > 0 && save.data.games === CONFIG.shortcutAfterGames) platform.offerShortcut();
  if (!reviewAsked && score >= CONFIG.reviewAfterScore && record) {
    reviewAsked = true;
    setTimeout(() => platform.requestReview(), 2500);
  }
}

// ------------------------------ сценарии -------------------------------

async function startGame(withAd) {
  audio.unlock();
  audio.click();
  ui.hideAll();
  if (withAd) await maybeInterstitial();
  renderer.effects.clear();
  game.newGame();
  ui.setBest(save.data.best);
  ui.setContinueVisible(false);
  save.patch({ run: null });
  platform.gameplayStart();
}

function continueRun() {
  audio.unlock();
  audio.click();
  const ok = game.restore(save.data.run);
  if (!ok) {
    ui.setContinueVisible(false);
    save.patch({ run: null });
    startGame(false);
    return;
  }
  renderer.effects.clear();
  ui.hideAll();
  platform.gameplayStart();
}

function goMenu() {
  audio.click();
  if (game.state === STATE.PLAYING) persistRun();
  platform.gameplayStop();
  ui.setMenuStats({ best: save.data.best, games: save.data.games });
  ui.setContinueVisible(!!save.data.run);
  ui.show('menu');
}

function pauseGame() {
  if (game.state !== STATE.PLAYING || ui.current) return;
  audio.click();
  paused = true;
  platform.gameplayStop();
  persistRun();
  ui.show('pause');
}

function resumeGame() {
  audio.click();
  paused = false;
  ui.hideAll();
  platform.gameplayStart();
}

async function rescue() {
  if (!game.canRescue()) {
    ui.toast(i18n.t('toast.noRescue'));
    return;
  }
  audio.click();
  advPending = true;
  ui.show('adv');
  const rewarded = await platform.showRewarded();
  advPending = false;
  if (!rewarded) {
    ui.show('gameover');
    ui.toast(i18n.t('toast.adFail'));
    return;
  }
  game.rescue();
  ui.hideAll();
  platform.gameplayStart();
  persistRun();
}

async function maybeInterstitial() {
  if (!platform.available) return;
  if (save.data.games < CONFIG.interstitialAfterGames) return;
  if (Date.now() - lastInterstitial < CONFIG.interstitialCooldownMs) return;
  advPending = true;
  ui.show('adv');
  lastInterstitial = Date.now();
  await platform.showInterstitial();
  advPending = false;
  ui.hideAll();
}

async function openLeaders(from) {
  audio.click();
  ui.show('leaders');
  ui.el.leadersList.innerHTML = '';
  ui.el.leadersList.appendChild(ui.message(i18n.t('leaders.loading')));
  ui.setLoginVisible(false);

  if (!platform.available) {
    ui.renderLeaders(null, { offline: true });
    return;
  }
  const res = await platform.getEntries({ top: 10, around: 3 });
  let myId = null;
  try {
    myId = platform.player?.getUniqueID?.() || null;
  } catch { /* игрок может быть не авторизован */ }
  ui.renderLeaders(res, { myId });
  ui.setLoginVisible(!platform.authorized);
  ui.leadersFrom = from;
}

async function login() {
  audio.click();
  const ok = await platform.auth();
  if (ok) {
    await save.load();
    ui.setBest(save.data.best);
    ui.setMenuStats({ best: save.data.best, games: save.data.games });
    if (save.data.best > 0) await platform.submitScore(save.data.best);
    openLeaders(ui.leadersFrom);
  }
}

function toggleSound() {
  audio.unlock();
  const on = audio.setEnabled(!audio.enabled);
  ui.setSound(on);
  save.patch({ sound: on });
  if (on) audio.click();
}

function setLang(code) {
  audio.click();
  i18n.set(code);
  save.patch({ lang: code });
  ui.buildLangBar(code);
}

/** Снимок незаконченной партии — чтобы вернуться после закрытия вкладки. */
function persistRun() {
  if (game.state !== STATE.PLAYING) return;
  save.patch({ run: game.toJSON() });
}

// ------------------------------ жизненный цикл ------------------------------

platform.onAdvOpen = () => {
  audio.pause();
  paused = true;
};
platform.onAdvClose = () => {
  audio.resume();
  paused = ui.current === 'pause';
};

// Аудиоконтекст можно создать только внутри обработчика жеста пользователя.
document.addEventListener('pointerdown', () => audio.unlock(), { passive: true });

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    audio.pause();
    if (game.state === STATE.PLAYING && !ui.current) pauseGame();
    save.flush(true);
  } else if (!platform.advOpen) {
    audio.resume();
  }
});

window.addEventListener('pagehide', () => {
  persistRun();
  save.flush(true);
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (game.state === STATE.PLAYING && !ui.current) pauseGame();
    else if (ui.current === 'pause') resumeGame();
  }
});

const resize = () => renderer.resize();
window.addEventListener('resize', resize);
window.addEventListener('orientationchange', () => setTimeout(resize, 120));
if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas);

// ------------------------------- цикл ---------------------------------

let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  renderer.update(dt);
  renderer.render({ game, drag: drag.drag, playable: game.state === STATE.PLAYING });
  requestAnimationFrame(loop);
}

// -------------------------------- старт --------------------------------

async function boot() {
  // Если SDK почему-то не отвечает, не держим игрока на экране загрузки.
  await Promise.race([
    platform.init(),
    new Promise((r) => setTimeout(r, 8000)),
  ]);

  await save.load();

  const lang = save.data.lang || pickLang(platform.lang || navigator.language || 'ru');
  i18n.set(lang);
  ui.buildLangBar(lang);

  audio.setEnabled(save.data.sound !== false);
  ui.setSound(audio.enabled);

  ui.setBest(save.data.best);
  ui.setScore(0);
  ui.setMenuStats({ best: save.data.best, games: save.data.games });
  ui.setContinueVisible(!!save.data.run);

  renderer.resize();
  requestAnimationFrame(loop);

  ui.show('menu');
  platform.gameReady();
  platform.showBanner();

  // Отладочный доступ к внутренностям — только по ?debug в адресе (нужен для e2e-тестов).
  if (new URLSearchParams(location.search).has('debug')) {
    window.__nine = { game, renderer, ui, drag, platform, save, i18n, STATE };
  }
}

boot();
