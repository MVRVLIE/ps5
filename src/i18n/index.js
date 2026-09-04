/**
 * Локализация. Яндекс Игры отдают язык в ysdk.environment.i18n.lang.
 * Чтобы добавить язык — скопируйте блок и переведите значения: ключи должны совпадать.
 */

const ru = {
  'app.title': 'Девятка',
  'app.subtitle': 'Блок-пазл 9×9',
  'hud.score': 'Счёт',
  'hud.best': 'Рекорд',
  'hud.sound': 'Звук',
  'hud.pause': 'Пауза',
  'loading.text': 'Загрузка…',
  'menu.games': 'Партий',
  'menu.play': 'Играть',
  'menu.continue': 'Продолжить',
  'menu.leaders': 'Лидеры',
  'menu.howto': 'Как играть',
  'pause.title': 'Пауза',
  'pause.resume': 'Продолжить',
  'pause.restart': 'Начать заново',
  'pause.menu': 'В меню',
  'gameover.title': 'Игра окончена',
  'gameover.note': 'Некуда поставить фигуры',
  'gameover.record': 'Новый рекорд!',
  'gameover.rescue': 'Спасение за рекламу',
  'gameover.again': 'Играть снова',
  'leaders.title': 'Лидеры',
  'leaders.loading': 'Загрузка…',
  'leaders.login': 'Войти, чтобы попасть в рейтинг',
  'leaders.empty': 'Пока никто не играл. Будьте первым!',
  'leaders.error': 'Рейтинг недоступен',
  'leaders.offline': 'Рейтинг доступен только на Яндекс Играх',
  'leaders.anon': 'Игрок',
  'howto.title': 'Как играть',
  'howto.r1': 'Перетаскивайте фигуры из нижнего ряда на поле 9×9.',
  'howto.r2': 'Заполните строку, столбец или квадрат 3×3 — они исчезнут.',
  'howto.r3': 'Несколько линий за один ход и серии подряд дают комбо-множитель.',
  'howto.r4': 'Игра заканчивается, когда ни одна из трёх фигур не помещается.',
  'common.back': 'Назад',
  'adv.wait': 'Реклама…',
  'toast.combo': 'Комбо ×{n}!',
  'toast.perfect': 'Чистое поле! +150',
  'toast.lines': '{n} линии сразу!',
  'toast.rescue': 'Поле расчищено — играем дальше!',
  'toast.noRescue': 'Спасения на эту партию закончились',
  'toast.adFail': 'Реклама сейчас недоступна',
  'toast.record': 'Новый рекорд: {n}',
  'toast.saved': 'Прогресс сохранён',
};

const en = {
  'app.title': 'Nine',
  'app.subtitle': '9×9 block puzzle',
  'hud.score': 'Score',
  'hud.best': 'Best',
  'hud.sound': 'Sound',
  'hud.pause': 'Pause',
  'loading.text': 'Loading…',
  'menu.games': 'Games',
  'menu.play': 'Play',
  'menu.continue': 'Continue',
  'menu.leaders': 'Leaderboard',
  'menu.howto': 'How to play',
  'pause.title': 'Paused',
  'pause.resume': 'Resume',
  'pause.restart': 'Restart',
  'pause.menu': 'Main menu',
  'gameover.title': 'Game over',
  'gameover.note': 'No room left for the pieces',
  'gameover.record': 'New record!',
  'gameover.rescue': 'Rescue for an ad',
  'gameover.again': 'Play again',
  'leaders.title': 'Leaderboard',
  'leaders.loading': 'Loading…',
  'leaders.login': 'Sign in to join the ranking',
  'leaders.empty': 'Nobody has played yet. Be the first!',
  'leaders.error': 'Leaderboard unavailable',
  'leaders.offline': 'The leaderboard works on Yandex Games only',
  'leaders.anon': 'Player',
  'howto.title': 'How to play',
  'howto.r1': 'Drag the pieces from the bottom tray onto the 9×9 board.',
  'howto.r2': 'Fill a row, a column or a 3×3 box — it clears away.',
  'howto.r3': 'Several lines in one move and back-to-back clears build a combo multiplier.',
  'howto.r4': 'The game ends when none of the three pieces fits.',
  'common.back': 'Back',
  'adv.wait': 'Advertisement…',
  'toast.combo': 'Combo ×{n}!',
  'toast.perfect': 'Board cleared! +150',
  'toast.lines': '{n} lines at once!',
  'toast.rescue': 'Board cleared — keep playing!',
  'toast.noRescue': 'No rescues left in this run',
  'toast.adFail': 'The ad is not available right now',
  'toast.record': 'New record: {n}',
  'toast.saved': 'Progress saved',
};

const tr = {
  'app.title': 'Dokuz',
  'app.subtitle': '9×9 blok bulmaca',
  'hud.score': 'Puan',
  'hud.best': 'Rekor',
  'hud.sound': 'Ses',
  'hud.pause': 'Duraklat',
  'loading.text': 'Yükleniyor…',
  'menu.games': 'Oyun',
  'menu.play': 'Oyna',
  'menu.continue': 'Devam et',
  'menu.leaders': 'Liderler',
  'menu.howto': 'Nasıl oynanır',
  'pause.title': 'Duraklatıldı',
  'pause.resume': 'Devam et',
  'pause.restart': 'Yeniden başla',
  'pause.menu': 'Ana menü',
  'gameover.title': 'Oyun bitti',
  'gameover.note': 'Parçalar için yer kalmadı',
  'gameover.record': 'Yeni rekor!',
  'gameover.rescue': 'Reklam izleyip devam et',
  'gameover.again': 'Tekrar oyna',
  'leaders.title': 'Liderler',
  'leaders.loading': 'Yükleniyor…',
  'leaders.login': 'Sıralamaya girmek için giriş yap',
  'leaders.empty': 'Henüz kimse oynamadı. İlk sen ol!',
  'leaders.error': 'Sıralama kullanılamıyor',
  'leaders.offline': 'Sıralama yalnızca Yandex Games üzerinde çalışır',
  'leaders.anon': 'Oyuncu',
  'howto.title': 'Nasıl oynanır',
  'howto.r1': 'Alttaki parçaları 9×9 tahtaya sürükleyin.',
  'howto.r2': 'Bir satırı, sütunu veya 3×3 kareyi doldurun — temizlenir.',
  'howto.r3': 'Tek hamlede birden çok sıra ve arka arkaya temizlik kombo çarpanı verir.',
  'howto.r4': 'Üç parçadan hiçbiri sığmadığında oyun biter.',
  'common.back': 'Geri',
  'adv.wait': 'Reklam…',
  'toast.combo': 'Kombo ×{n}!',
  'toast.perfect': 'Tahta temiz! +150',
  'toast.lines': 'Aynı anda {n} sıra!',
  'toast.rescue': 'Tahta temizlendi — devam!',
  'toast.noRescue': 'Bu turda kurtarma hakkın kalmadı',
  'toast.adFail': 'Reklam şu anda kullanılamıyor',
  'toast.record': 'Yeni rekor: {n}',
  'toast.saved': 'İlerleme kaydedildi',
};

export const LANGS = {
  ru: { code: 'ru', label: 'Рус', dict: ru },
  en: { code: 'en', label: 'Eng', dict: en },
  tr: { code: 'tr', label: 'Tür', dict: tr },
};

export const DEFAULT_LANG = 'ru';

/** Языки, для которых русский понятнее английского. */
const RU_FALLBACK = new Set(['ru', 'be', 'kk', 'uz', 'ky', 'az', 'hy', 'ka', 'tg', 'tk']);

/** Приводит код языка платформы/браузера к поддерживаемому. */
export function pickLang(raw) {
  const code = String(raw || '').toLowerCase().split(/[-_]/)[0];
  if (LANGS[code]) return code;
  if (RU_FALLBACK.has(code)) return 'ru';
  return 'en';
}

export function translate(lang, key, params) {
  const dict = (LANGS[lang] || LANGS[DEFAULT_LANG]).dict;
  let str = dict[key] ?? LANGS[DEFAULT_LANG].dict[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) str = str.replaceAll(`{${k}}`, String(v));
  }
  return str;
}

/** Текущий язык приложения + применение переводов к разметке. */
export const i18n = {
  lang: DEFAULT_LANG,
  t(key, params) {
    return translate(this.lang, key, params);
  },
  set(lang) {
    this.lang = LANGS[lang] ? lang : DEFAULT_LANG;
    if (typeof document !== 'undefined') {
      document.documentElement.lang = this.lang;
      this.apply(document);
    }
    return this.lang;
  },
  apply(root) {
    root.querySelectorAll('[data-i18n]').forEach((el) => {
      el.textContent = this.t(el.dataset.i18n);
    });
    root.querySelectorAll('[data-i18n-title]').forEach((el) => {
      const text = this.t(el.dataset.i18nTitle);
      el.title = text;
      el.setAttribute('aria-label', text);
    });
  },
};
