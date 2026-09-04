/** Сохранение прогресса и вся «мета» — симпатия, уровни, стрик, коллекция. */

const KEY = 'formula-simpatii.v1';

/** Порог симпатии для каждого уровня (индекс = уровень − 1). */
export const LEVELS = [0, 40, 95, 165, 250, 350, 470, 610, 780, 980];
export const MAX_LEVEL = LEVELS.length;

/** Как Ника подписывает уровень отношений — это и есть «лестница» удержания. */
export const LEVEL_NAMES = [
  'незнакомцы', 'сосед по чату', 'свой человек', 'почти друг', 'друг',
  'близкий друг', 'что-то большее', 'нравишься ей', 'её человек', 'формула сошлась',
];

const DEFAULTS = {
  aff: 0,
  chapter: 0,      // индекс текущей главы
  step: 0,         // шаг внутри главы
  solved: 0,
  wrong: 0,
  streak: 0,       // текущая серия верных ответов
  bestStreak: 0,
  photos: [],      // разблокированные id
  fresh: [],       // ещё не просмотренные (значок NEW)
  days: 0,         // дней подряд заходил
  lastDay: null,   // YYYY-MM-DD последнего захода
  dailyDay: null,  // день, когда пройден челлендж
  dailyBest: 0,
  marathonBest: 0,
  muted: false,
  seenIntro: false,
  marathonStarted: false,
  log: [],          // последние реплики, чтобы чат не был пустым при возврате
};

/** Сколько сообщений храним в «истории переписки». */
const LOG_CAP = 40;

export const S = { ...DEFAULTS };

export function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) Object.assign(S, DEFAULTS, JSON.parse(raw));
  } catch { /* приватный режим — играем без сохранения */ }
  return S;
}

let saveTimer = 0;
export function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* ignore */ }
  }, 120);
}

export function reset() {
  Object.assign(S, DEFAULTS, { photos: [], fresh: [] });
  save();
}

/** Записать реплику в историю чата. */
export function pushLog(entry) {
  S.log.push(entry);
  if (S.log.length > LOG_CAP) S.log.splice(0, S.log.length - LOG_CAP);
  save();
}

/* ── Симпатия и уровни ── */

export function levelInfo(aff = S.aff) {
  let level = 1;
  while (level < MAX_LEVEL && aff >= LEVELS[level]) level++;
  const from = LEVELS[level - 1];
  const to = level < MAX_LEVEL ? LEVELS[level] : from;
  const pct = level < MAX_LEVEL ? (aff - from) / (to - from) : 1;
  return {
    level,
    name: LEVEL_NAMES[level - 1],
    into: aff - from,
    need: level < MAX_LEVEL ? to - from : 0,
    pct: Math.max(0, Math.min(1, pct)),
    max: level >= MAX_LEVEL,
  };
}

/** Начислить симпатию. Возвращает новый уровень, если он вырос. */
export function addAffection(n) {
  const before = levelInfo().level;
  S.aff = Math.max(0, S.aff + n);
  const after = levelInfo().level;
  save();
  return after > before ? after : 0;
}

/* ── Ответы ── */

export function markCorrect() {
  S.solved++;
  S.streak++;
  if (S.streak > S.bestStreak) S.bestStreak = S.streak;
  save();
  return S.streak;
}

export function markWrong() {
  S.wrong++;
  S.streak = 0;
  save();
}

/* ── Коллекция ── */

export function unlockPhoto(id) {
  if (S.photos.includes(id)) return false;
  S.photos.push(id);
  if (!S.fresh.includes(id)) S.fresh.push(id);
  save();
  return true;
}

export const hasPhoto = (id) => S.photos.includes(id);

export function markSeen(id) {
  const i = S.fresh.indexOf(id);
  if (i >= 0) { S.fresh.splice(i, 1); save(); }
}

/* ── Стрик по дням: главный крючок возврата ── */

export const today = () => new Date().toISOString().slice(0, 10);

/** Отметить заход. Возвращает {isNewDay, streak, broken}. */
export function touchDay() {
  const t = today();
  if (S.lastDay === t) return { isNewDay: false, streak: S.days, broken: false };

  const y = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
  const broken = !!S.lastDay && S.lastDay !== y;
  S.days = S.lastDay === y ? S.days + 1 : 1;
  S.lastDay = t;
  save();
  return { isNewDay: true, streak: S.days, broken };
}

/** Сид челленджа дня — одинаковый для всех игроков в этот день. */
export function todaySeed() {
  const t = today();
  let h = 2166136261;
  for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export const dailyDone = () => S.dailyDay === today();
export function finishDaily(score) {
  S.dailyDay = today();
  if (score > S.dailyBest) S.dailyBest = score;
  save();
}
