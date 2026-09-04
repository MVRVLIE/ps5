/** Экраны, HUD и всплывающие подсказки. Никакой игровой логики — только DOM. */

import { i18n, LANGS } from '../i18n/index.js';

const $ = (id) => document.getElementById(id);

const SCREENS = {
  loading: 'screen-loading',
  menu: 'screen-menu',
  pause: 'screen-pause',
  gameover: 'screen-gameover',
  leaders: 'screen-leaders',
  howto: 'screen-howto',
  adv: 'screen-adv',
};

export class UI {
  constructor(handlers = {}) {
    this.h = handlers;
    this.current = 'loading';
    this.toastTimer = null;

    this.el = {
      score: $('score'),
      best: $('best'),
      menuBest: $('menu-best'),
      menuGames: $('menu-games'),
      overScore: $('over-score'),
      overBest: $('over-best'),
      overRecord: $('over-record'),
      rescue: $('btn-rescue'),
      continueBtn: $('btn-continue'),
      leadersList: $('leaders-list'),
      loginBtn: $('btn-login'),
      soundBtn: $('btn-sound'),
      hud: $('hud'),
      toast: $('toast'),
      langbar: $('langbar'),
    };

    this.bind();
  }

  bind() {
    const on = (id, fn) => $(id)?.addEventListener('click', () => fn && fn());
    on('btn-play', () => this.h.onPlay?.());
    on('btn-continue', () => this.h.onContinue?.());
    on('btn-leaders', () => this.h.onLeaders?.('menu'));
    on('btn-over-leaders', () => this.h.onLeaders?.('gameover'));
    on('btn-howto', () => this.h.onHowTo?.());
    on('btn-howto-back', () => this.h.onBack?.());
    on('btn-leaders-back', () => this.h.onBack?.());
    on('btn-login', () => this.h.onLogin?.());
    on('btn-pause', () => this.h.onPause?.());
    on('btn-resume', () => this.h.onResume?.());
    on('btn-restart', () => this.h.onRestart?.());
    on('btn-tomenu', () => this.h.onMenu?.());
    on('btn-over-menu', () => this.h.onMenu?.());
    on('btn-again', () => this.h.onPlay?.());
    on('btn-rescue', () => this.h.onRescue?.());
    on('btn-sound', () => this.h.onSound?.());
  }

  buildLangBar(current) {
    const bar = this.el.langbar;
    if (!bar) return;
    bar.innerHTML = '';
    for (const { code, label } of Object.values(LANGS)) {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = label;
      b.className = code === current ? 'is-active' : '';
      b.addEventListener('click', () => this.h.onLang?.(code));
      bar.appendChild(b);
    }
  }

  show(name) {
    for (const [key, id] of Object.entries(SCREENS)) {
      $(id)?.classList.toggle('screen--visible', key === name);
    }
    this.current = name || null;
    this.setHudVisible(!['loading', 'menu', 'howto', 'adv'].includes(this.current));
  }

  hideAll() {
    this.show(null);
  }

  setScore(value, bump = false) {
    const el = this.el.score;
    if (!el) return;
    el.textContent = String(value);
    if (bump) {
      el.classList.remove('bump');
      void el.offsetWidth; // перезапуск анимации
      el.classList.add('bump');
    }
  }

  setBest(value) {
    if (this.el.best) this.el.best.textContent = String(value);
  }

  setMenuStats({ best, games }) {
    if (this.el.menuBest) this.el.menuBest.textContent = String(best);
    if (this.el.menuGames) this.el.menuGames.textContent = String(games);
  }

  setContinueVisible(visible) {
    if (this.el.continueBtn) this.el.continueBtn.hidden = !visible;
  }

  setGameOver({ score, best, record, canRescue }) {
    if (this.el.overScore) this.el.overScore.textContent = String(score);
    if (this.el.overBest) this.el.overBest.textContent = String(best);
    if (this.el.overRecord) this.el.overRecord.hidden = !record;
    if (this.el.rescue) this.el.rescue.hidden = !canRescue;
  }

  setSound(on) {
    this.el.soundBtn?.classList.toggle('is-off', !on);
  }

  /** Счёт и кнопки прячем на экранах, где они не нужны. */
  setHudVisible(visible) {
    this.el.hud?.classList.toggle('is-hidden', !visible);
  }

  toast(text) {
    const el = this.el.toast;
    if (!el) return;
    el.textContent = text;
    el.classList.add('is-visible');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => el.classList.remove('is-visible'), 2200);
  }

  /** Рисует таблицу лидеров из ответа SDK. */
  renderLeaders(res, { myId = null, offline = false } = {}) {
    const box = this.el.leadersList;
    if (!box) return;
    box.innerHTML = '';

    if (offline) {
      box.appendChild(this.message(i18n.t('leaders.offline')));
      return;
    }
    if (!res) {
      box.appendChild(this.message(i18n.t('leaders.error')));
      return;
    }
    const entries = res.entries || [];
    if (entries.length === 0) {
      box.appendChild(this.message(i18n.t('leaders.empty')));
      return;
    }

    for (const entry of entries) {
      const row = document.createElement('div');
      const rank = entry.rank || 0;
      row.className = 'lrow' + (rank <= 3 ? ` lrow--top${rank}` : '');
      if (myId && entry.player?.uniqueID === myId) row.classList.add('lrow--me');

      const pos = document.createElement('span');
      pos.className = 'lrow__rank';
      pos.textContent = rank ? String(rank) : '—';

      const name = document.createElement('span');
      name.className = 'lrow__name';
      name.textContent = entry.player?.publicName || i18n.t('leaders.anon');

      const score = document.createElement('span');
      score.className = 'lrow__score';
      score.textContent = entry.formattedScore || String(entry.score);

      let avatar = null;
      try {
        const src = entry.player?.getAvatarSrc?.('small');
        if (src) {
          avatar = document.createElement('img');
          avatar.className = 'lrow__ava';
          avatar.loading = 'lazy';
          avatar.alt = '';
          avatar.src = src;
          avatar.addEventListener('error', () => avatar.remove());
        }
      } catch { /* аватара может не быть */ }

      row.append(pos);
      if (avatar) row.append(avatar);
      row.append(name, score);
      box.appendChild(row);
    }
  }

  setLoginVisible(visible) {
    if (this.el.loginBtn) this.el.loginBtn.hidden = !visible;
  }

  message(text) {
    const p = document.createElement('p');
    p.className = 'muted';
    p.textContent = text;
    return p;
  }
}
