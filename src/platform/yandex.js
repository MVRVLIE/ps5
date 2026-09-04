/**
 * Обёртка над Yandex Games SDK v2.
 * Все вызовы безопасны: вне платформы (локальный запуск) работает заглушка,
 * любая ошибка SDK гасится и не роняет игру.
 *
 * Документация: https://yandex.ru/dev/games/doc/ru/sdk/sdk-about
 */

import { CONFIG } from '../config.js';

const noop = () => {};

export const platform = {
  ysdk: null,
  player: null,
  leaderboards: null,
  available: false,      // игра запущена внутри Яндекс Игр
  lang: null,
  deviceType: 'desktop',
  isMobile: false,
  authorized: false,
  advOpen: false,

  /** Колбэки, которые ставит игра, чтобы вставать на паузу во время рекламы. */
  onAdvOpen: noop,
  onAdvClose: noop,

  async init() {
    try {
      if (typeof YaGames === 'undefined') throw new Error('SDK не подключён');
      this.ysdk = await YaGames.init();
      this.available = true;
      window.ysdk = this.ysdk;

      try {
        this.lang = this.ysdk.environment?.i18n?.lang || null;
      } catch { /* необязательное поле */ }

      try {
        this.isMobile = !!this.ysdk.deviceInfo?.isMobile();
        this.deviceType = this.ysdk.deviceInfo?.type || (this.isMobile ? 'mobile' : 'desktop');
      } catch { /* необязательное поле */ }

      await this.initPlayer();
    } catch (e) {
      this.available = false;
      console.info('[yandex] локальный режим:', e?.message || e);
    }
    return this.available;
  },

  async initPlayer() {
    if (!this.available) return null;
    try {
      this.player = await this.ysdk.getPlayer({ scopes: false, signed: false });
      this.authorized = this.player.getMode?.() !== 'lite';
    } catch (e) {
      this.player = null;
      this.authorized = false;
    }
    return this.player;
  },

  /** Сообщает платформе, что игра загрузилась (обязательный вызов). */
  gameReady() {
    try {
      this.ysdk?.features?.LoadingAPI?.ready();
    } catch { /* необязательный API */ }
  },

  gameplayStart() {
    try {
      this.ysdk?.features?.GameplayAPI?.start();
    } catch { /* необязательный API */ }
  },

  gameplayStop() {
    try {
      this.ysdk?.features?.GameplayAPI?.stop();
    } catch { /* необязательный API */ }
  },

  // ------------------------------ реклама ------------------------------

  /** Межстраничная реклама. Возвращает true, если ролик действительно показали. */
  showInterstitial() {
    if (!this.available) return Promise.resolve(false);
    return new Promise((resolve) => {
      let opened = false;
      const finish = (shown) => {
        if (opened) {
          this.advOpen = false;
          this.onAdvClose();
        }
        resolve(!!shown);
      };
      try {
        this.ysdk.adv.showFullscreenAdv({
          callbacks: {
            onOpen: () => {
              opened = true;
              this.advOpen = true;
              this.onAdvOpen();
            },
            onClose: (wasShown) => finish(wasShown),
            onError: () => finish(false),
          },
        });
      } catch {
        finish(false);
      }
    });
  },

  /** Реклама за вознаграждение. Резолвится true, только если награда засчитана. */
  showRewarded() {
    if (!this.available) {
      // Локально награду выдаём сразу, чтобы механику можно было тестировать.
      return Promise.resolve(true);
    }
    return new Promise((resolve) => {
      let rewarded = false;
      let opened = false;
      const finish = () => {
        if (opened) {
          this.advOpen = false;
          this.onAdvClose();
        }
        resolve(rewarded);
      };
      try {
        this.ysdk.adv.showRewardedVideo({
          callbacks: {
            onOpen: () => {
              opened = true;
              this.advOpen = true;
              this.onAdvOpen();
            },
            onRewarded: () => { rewarded = true; },
            onClose: finish,
            onError: finish,
          },
        });
      } catch {
        finish();
      }
    });
  },

  async showBanner() {
    if (!this.available || !CONFIG.stickyBanner) return false;
    try {
      const { stickyAdvIsShowing } = await this.ysdk.adv.getBannerAdvStatus();
      if (stickyAdvIsShowing) return true;
      const res = await this.ysdk.adv.showBannerAdv();
      return !!res?.stickyAdvIsShowing;
    } catch {
      return false;
    }
  },

  async hideBanner() {
    try {
      await this.ysdk?.adv?.hideBannerAdv();
    } catch { /* баннера может не быть */ }
  },

  // ---------------------------- сохранения -----------------------------

  async loadCloud() {
    if (!this.player) return null;
    try {
      const data = await this.player.getData();
      return data && typeof data === 'object' ? data : null;
    } catch {
      return null;
    }
  },

  async saveCloud(data, flush = false) {
    if (!this.player) return false;
    try {
      await this.player.setData(data, flush);
      return true;
    } catch {
      return false;
    }
  },

  // ---------------------------- лидерборд ------------------------------

  async getLeaderboards() {
    if (!this.available) return null;
    if (this.leaderboards) return this.leaderboards;
    try {
      this.leaderboards = await this.ysdk.getLeaderboards();
    } catch {
      this.leaderboards = null;
    }
    return this.leaderboards;
  },

  async submitScore(score) {
    if (!Number.isFinite(score) || score <= 0) return false;
    const lb = await this.getLeaderboards();
    if (!lb) return false;
    try {
      await lb.setLeaderboardScore(CONFIG.leaderboardName, Math.floor(score));
      return true;
    } catch (e) {
      console.info('[yandex] счёт не отправлен:', e?.message || e);
      return false;
    }
  },

  /** Топ игроков + позиция текущего игрока. */
  async getEntries({ top = 10, around = 3 } = {}) {
    const lb = await this.getLeaderboards();
    if (!lb) return null;
    try {
      const res = await lb.getLeaderboardEntries(CONFIG.leaderboardName, {
        quantityTop: top,
        includeUser: this.authorized,
        quantityAround: around,
      });
      return res;
    } catch (e) {
      console.info('[yandex] лидерборд недоступен:', e?.message || e);
      return null;
    }
  },

  // ------------------------- прочие возможности -------------------------

  async auth() {
    if (!this.available) return false;
    try {
      await this.ysdk.auth.openAuthDialog();
      await this.initPlayer();
      return this.authorized;
    } catch {
      return false;
    }
  },

  /** Предложение добавить игру на рабочий стол. */
  async offerShortcut() {
    if (!this.available) return false;
    try {
      const { canShow } = await this.ysdk.shortcut.canShowPrompt();
      if (!canShow) return false;
      const res = await this.ysdk.shortcut.showPrompt();
      return res?.outcome === 'accepted';
    } catch {
      return false;
    }
  },

  /** Просьба оценить игру — показываем не чаще, чем разрешает платформа. */
  async requestReview() {
    if (!this.available) return false;
    try {
      const { value } = await this.ysdk.feedback.canReview();
      if (!value) return false;
      const { feedbackSent } = await this.ysdk.feedback.requestReview();
      return !!feedbackSent;
    } catch {
      return false;
    }
  },
};
