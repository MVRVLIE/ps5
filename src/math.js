/**
 * Генератор примеров. Темы идут по программе первого курса — вместе
 * с сюжетом (Ника готовится к экзамену), поэтому сложность растёт
 * естественно, а не «числа стали больше».
 */

let rand = Math.random;

/** Детерминированный ГПСЧ — для челленджа дня: у всех одинаковые примеры. */
export function seededRandom(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const useRandom = (fn) => { rand = fn || Math.random; };

const ri = (a, b) => a + Math.floor(rand() * (b - a + 1));
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const shuffle = (arr) => {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

export const TOPICS = {
  arith:      'Арифметика',
  fraction:   'Дроби',
  percent:    'Проценты',
  linear:     'Уравнение',
  power:      'Степени',
  quadratic:  'Квадратное',
  progression:'Прогрессия',
  combi:      'Комбинаторика',
  derivative: 'Производная',
  integral:   'Интеграл',
  limit:      'Предел',
};

/* ── генераторы ── */

const G = {
  arith(d) {
    const a = ri(6 + d * 4, 12 + d * 12), b = ri(4, 6 + d * 3);
    if (rand() < 0.5) {
      const c = ri(2, 5 + d);
      return { q: `${a} · ${b} − ${c * b}`, ans: a * b - c * b,
        sol: `Вынеси ${b}: ${b}·(${a} − ${c}) = ${b}·${a - c} = ${a * b - c * b}.` };
    }
    return { q: `${a} · ${b}`, ans: a * b,
      sol: `${a}·${b} = ${a}·${b - (b % 5)} + ${a}·${b % 5} = ${a * (b - (b % 5))} + ${a * (b % 5)} = ${a * b}.` };
  },

  fraction(d) {
    const b = pick([4, 6, 8, 12]), c = pick([3, 6, 9, 12]);
    const a = ri(1, b - 1), e = ri(1, c - 1);
    const num = a * c + e * b, den = b * c;
    const g = gcd(num, den);
    return {
      q: `${a}/${b} + ${e}/${c}`,
      ans: `${num / g}/${den / g}`,
      sol: `Общий знаменатель ${den}: ${a * c}/${den} + ${e * b}/${den} = ${num}/${den} = ${num / g}/${den / g}.`,
      opts: uniq([`${num / g}/${den / g}`, `${a + e}/${b + c}`, `${num / g + 1}/${den / g}`, `${a * e}/${b * c}`]),
    };
  },

  percent(d) {
    const base = pick([200, 240, 350, 480, 600, 750, 1200]);
    const p = pick([5, 10, 12, 15, 20, 25, 30, 40]);
    if (d > 2 && rand() < 0.5) {
      const after = Math.round(base * (1 + p / 100));
      return { q: `${base} + ${p}%`, ans: after,
        sol: `${p}% от ${base} = ${base * p / 100}. Итого ${base} + ${base * p / 100} = ${after}.`,
        sub: 'цена выросла на процент — сколько стало?' };
    }
    return { q: `${p}% от ${base}`, ans: (base * p) / 100,
      sol: `${base} · ${p} / 100 = ${(base * p) / 100}.` };
  },

  linear(d) {
    const x = ri(2, 4 + d * 3), a = ri(2, 4 + d), b = ri(1, 9 + d * 4);
    const c = a * x + b;
    return { q: `${a}x + ${b} = ${c}`, ans: x, sub: 'найди x',
      sol: `${a}x = ${c} − ${b} = ${c - b}, значит x = ${c - b}/${a} = ${x}.` };
  },

  power(d) {
    if (rand() < 0.45) {
      const n = pick([4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225]);
      return { q: `√${n}`, ans: Math.sqrt(n), sol: `${Math.sqrt(n)}² = ${n}, значит √${n} = ${Math.sqrt(n)}.` };
    }
    const a = ri(2, 3 + d), n = ri(2, 3), m = ri(2, 3);
    return { q: `${a}${sup(n)} · ${a}${sup(m)}`, ans: Math.pow(a, n + m),
      sol: `При умножении степени складываются: ${a}${sup(n)}·${a}${sup(m)} = ${a}${sup(n + m)} = ${Math.pow(a, n + m)}.` };
  },

  quadratic(d) {
    const r1 = ri(1, 5), r2 = ri(1, 6);
    const b = -(r1 + r2), c = r1 * r2;
    const bigger = Math.max(r1, r2);
    return {
      q: `x² ${b < 0 ? '−' : '+'} ${Math.abs(b)}x + ${c} = 0`,
      ans: bigger, sub: 'больший корень',
      sol: `По Виету: сумма корней ${-b}, произведение ${c}. Это ${r1} и ${r2}. Больший — ${bigger}.`,
    };
  },

  progression(d) {
    const a1 = ri(2, 9), step = ri(2, 4 + d), n = ri(5, 8 + d);
    if (rand() < 0.5) {
      const an = a1 + step * (n - 1);
      return { q: `a₁=${a1}, d=${step} → a${sub(n)}`, ans: an,
        sol: `aₙ = a₁ + d(n−1) = ${a1} + ${step}·${n - 1} = ${an}.` };
    }
    const sum = ((2 * a1 + step * (n - 1)) * n) / 2;
    return { q: `a₁=${a1}, d=${step} → S${sub(n)}`, ans: sum, sub: `сумма первых ${n}`,
      sol: `Sₙ = (2a₁ + d(n−1))·n/2 = (${2 * a1} + ${step * (n - 1)})·${n}/2 = ${sum}.` };
  },

  combi(d) {
    const n = ri(4, 6 + d), k = ri(2, 3);
    const c = fact(n) / (fact(k) * fact(n - k));
    return { q: `C(${n}, ${k})`, ans: c, sub: 'сколькими способами выбрать',
      sol: `C(n,k) = n!/(k!(n−k)!) = ${n}!/(${k}!·${n - k}!) = ${c}.` };
  },

  derivative(d) {
    const a = ri(2, 5 + d), n = ri(2, 4);
    const co = a * n, p = n - 1;
    const right = mono(co, p);
    return {
      q: `(${mono(a, n)})′`, ans: right, sub: 'производная',
      sol: `(axⁿ)′ = a·n·x⁽ⁿ⁻¹⁾ = ${a}·${n}·x${sup(p)} = ${right}.`,
      opts: uniq([right, mono(a, p), mono(co, n), mono(co, n + 1)]),
    };
  },

  integral(d) {
    const n = ri(1, 3), a = (n + 1) * ri(1, 3);
    const co = a / (n + 1), p = n + 1;
    const right = `${mono(co, p)} + C`;
    return {
      q: `∫ ${mono(a, n)} dx`, ans: right, sub: 'неопределённый интеграл',
      sol: `∫axⁿdx = a·x⁽ⁿ⁺¹⁾/(n+1) + C = ${a}x${sup(p)}/${p} + C = ${right}.`,
      opts: uniq([right, `${mono(a, p)} + C`, `${mono(a * n, n - 1)} + C`, `${mono(co, n)} + C`]),
    };
  },

  limit(d) {
    const a = ri(2, 7);
    if (rand() < 0.5) {
      return { q: `lim (x² − ${a * a})/(x − ${a})`, sub: `при x → ${a}`, ans: 2 * a,
        sol: `x² − ${a * a} = (x−${a})(x+${a}). Сокращаем: lim (x+${a}) = ${2 * a}.` };
    }
    const b = ri(2, 6), c = ri(2, 6);
    return { q: `lim (${b}x + ${a})/(${c}x − 1)`, sub: 'при x → ∞',
      ans: b % c === 0 ? b / c : `${b}/${c}`,
      sol: `Делим на x: (${b} + ${a}/x)/(${c} − 1/x) → ${b}/${c}.`,
      opts: uniq([b % c === 0 ? `${b / c}` : `${b}/${c}`, '0', '∞', `${c}/${b}`]) };
  },
};

/* ── утилиты ── */

const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
const SUB = { 0: '₀', 1: '₁', 2: '₂', 3: '₃', 4: '₄', 5: '₅', 6: '₆', 7: '₇', 8: '₈', 9: '₉' };
const sup = (n) => String(n).split('').map((c) => SUP[c] ?? c).join('');
const sub = (n) => String(n).split('').map((c) => SUB[c] ?? c).join('');
const uniq = (a) => [...new Set(a.map(String))];
/** Одночлен вида a·xⁿ в человеческой записи: 1x¹ → x, 5x⁰ → 5. */
const mono = (a, p) => (p === 0 ? `${a}` : `${a === 1 ? '' : a}x${p === 1 ? '' : sup(p)}`);

/** Правдоподобные неверные варианты для числового ответа. */
function numericDistractors(ans) {
  const n = Number(ans);
  const cands = [n + 1, n - 1, n + 2, n - 2, n * 2, Math.round(n / 2), n + 10, n - 10];
  const out = [];
  for (const c of shuffle(cands)) {
    if (c !== n && Number.isFinite(c) && (n < 0 || c >= 0) && !out.includes(c)) out.push(c);
    if (out.length === 3) break;
  }
  while (out.length < 3) out.push(n + out.length + 3);
  return out.map(String);
}

/** Собрать готовую задачу с четырьмя вариантами. */
export function makeProblem(topic, difficulty = 1) {
  const gen = G[topic] || G.arith;
  const raw = gen(Math.max(1, Math.min(5, difficulty)));
  const ans = String(raw.ans);

  let opts = raw.opts ? raw.opts.slice() : [ans, ...numericDistractors(ans)];
  opts = uniq(opts).slice(0, 4);
  while (opts.length < 4) opts.push(String(Number(ans) + opts.length * 3 + 1));
  if (!opts.includes(ans)) opts[0] = ans;

  return {
    topic,
    label: TOPICS[topic] || 'Задача',
    q: raw.q,
    sub: raw.sub || '',
    answer: ans,
    options: shuffle(opts),
    solution: raw.sol,
  };
}

/** Пул тем по уровню симпатии: чем дальше сюжет, тем серьёзнее матан. */
export function topicsForLevel(level) {
  if (level <= 1) return ['arith', 'percent'];
  if (level === 2) return ['arith', 'percent', 'fraction'];
  if (level === 3) return ['percent', 'fraction', 'linear', 'power'];
  if (level === 4) return ['linear', 'power', 'quadratic'];
  if (level === 5) return ['quadratic', 'progression', 'power'];
  if (level === 6) return ['progression', 'combi', 'quadratic'];
  if (level === 7) return ['derivative', 'combi', 'progression'];
  if (level === 8) return ['derivative', 'integral'];
  if (level === 9) return ['derivative', 'integral', 'limit'];
  return ['derivative', 'integral', 'limit', 'quadratic'];
}
