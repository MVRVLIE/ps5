/**
 * Векторная графика игры. Никаких внешних ассетов: все «фото» и аватары
 * рисуются как SVG-строки, поэтому билд весит килобайты и работает офлайн.
 * Все изображения — 4:5, viewBox 200×250.
 */

const SKIN = '#f7d5bf';
const SKIN_SH = '#e9b79b';
const HAIR = '#452742';
const HAIR_HI = '#6d4066';
const LINE = '#2b1b2e';

let uid = 0;
const nextId = (p) => `${p}${++uid}`;

const wrap = (inner) =>
  `<svg viewBox="0 0 200 250" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">${inner}</svg>`;

function bgGrad(id, from, to) {
  return `<linearGradient id="${id}" x1="0" y1="0" x2="0.35" y2="1">
    <stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/>
  </linearGradient>`;
}

/* ─────────────────────────── Портрет ─────────────────────────── */

function eyes(expr) {
  const L = 82, R = 118, y = 108;
  const open = (cx) => `
    <ellipse cx="${cx}" cy="${y}" rx="7.5" ry="9" fill="#fff"/>
    <circle cx="${cx + 0.5}" cy="${y + 1}" r="5.4" fill="${LINE}"/>
    <circle cx="${cx + 2.4}" cy="${y - 2.2}" r="2" fill="#fff"/>
    <circle cx="${cx - 2}" cy="${y + 3.4}" r="1.1" fill="#fff" opacity=".65"/>`;
  const closedUp = (cx) =>
    `<path d="M${cx - 8} ${y + 2} q8 -9 16 0" fill="none" stroke="${LINE}" stroke-width="2.6" stroke-linecap="round"/>`;
  const closedDown = (cx) =>
    `<path d="M${cx - 8} ${y - 1} q8 8 16 0" fill="none" stroke="${LINE}" stroke-width="2.6" stroke-linecap="round"/>`;
  const half = (cx) => `
    <path d="M${cx - 8} ${y - 3} q8 -4 16 0" fill="none" stroke="${LINE}" stroke-width="2.2" stroke-linecap="round"/>
    <ellipse cx="${cx}" cy="${y + 2}" rx="6.5" ry="5" fill="#fff"/>
    <circle cx="${cx}" cy="${y + 2}" r="4.2" fill="${LINE}"/>`;
  const heart = (cx) =>
    `<path d="M${cx} ${y + 7} c-9 -6 -9 -14 -3.5 -14 c2.4 0 3.5 1.8 3.5 3 c0 -1.2 1.1 -3 3.5 -3 c5.5 0 5.5 8 -3.5 14z" fill="#ff5c8a"/>`;

  switch (expr) {
    case 'wink':   return open(L) + closedUp(R);
    case 'laugh':  return closedUp(L) + closedUp(R);
    case 'shy':    return closedDown(L) + closedDown(R);
    case 'think':  return half(L) + half(R);
    case 'love':   return heart(L) + heart(R);
    default:       return open(L) + open(R);
  }
}

function brows(expr) {
  const s = `fill="none" stroke="${LINE}" stroke-width="2.6" stroke-linecap="round" opacity=".85"`;
  if (expr === 'think')
    return `<path d="M74 92 q8 -6 16 -2" ${s}/><path d="M110 90 q8 -4 16 3" ${s}/>`;
  if (expr === 'shy')
    return `<path d="M74 93 q8 3 16 1" ${s}/><path d="M110 94 q8 -2 16 -1" ${s}/>`;
  return `<path d="M74 92 q8 -5 16 -1" ${s}/><path d="M110 91 q8 -4 16 1" ${s}/>`;
}

function mouth(expr) {
  const st = `stroke="${LINE}" stroke-width="2.6" stroke-linecap="round" fill="none"`;
  switch (expr) {
    case 'laugh':
      return `<path d="M89 130 q11 13 22 0 z" fill="#c04a63"/>
              <path d="M92 131 q8 4 16 0" fill="#ff9db3"/>`;
    case 'shy':   return `<path d="M94 131 q6 4 12 0" ${st}/>`;
    case 'think': return `<path d="M92 131 q7 -1 14 1" ${st}/>`;
    case 'love':  return `<path d="M90 129 q10 10 20 0" ${st}/>`;
    default:      return `<path d="M91 129 q9 8 18 -1" ${st}/>`;
  }
}

function accessoryArt(kind) {
  if (kind === 'glasses')
    return `<g fill="none" stroke="#2f2440" stroke-width="2.4" opacity=".9">
      <rect x="70" y="98" width="24" height="20" rx="7"/>
      <rect x="106" y="98" width="24" height="20" rx="7"/>
      <path d="M94 106 q6 -3 12 0"/><path d="M70 104 l-8 3"/><path d="M130 104 l8 3"/>
    </g><rect x="72" y="100" width="20" height="7" rx="4" fill="#fff" opacity=".18"/>
      <rect x="108" y="100" width="20" height="7" rx="4" fill="#fff" opacity=".18"/>`;
  if (kind === 'headphones')
    return `<path d="M56 108 q0 -50 44 -50 q44 0 44 50" fill="none" stroke="#2f2440" stroke-width="7" stroke-linecap="round"/>
      <rect x="46" y="98" width="19" height="30" rx="9" fill="#ff6b9d"/>
      <rect x="135" y="98" width="19" height="30" rx="9" fill="#ff6b9d"/>`;
  if (kind === 'clip')
    return `<g transform="rotate(-14 132 74)"><rect x="124" y="70" width="18" height="7" rx="3.5" fill="#ffca6b"/>
      <circle cx="124" cy="73.5" r="4" fill="#ffe1a8"/></g>`;
  if (kind === 'pencil')
    return `<g transform="rotate(24 148 96)"><rect x="144" y="70" width="7" height="42" fill="#ffca6b"/>
      <path d="M144 112 l3.5 8 l3.5 -8z" fill="#f7d5bf"/><rect x="144" y="70" width="7" height="7" fill="#ff6b9d"/></g>`;
  return '';
}

/**
 * Портрет Ники. Один генератор — десяток разных «кадров».
 */
export function portrait(o = {}) {
  const {
    expr = 'smile',
    bg = ['#3b2a63', '#6d4a8f'],
    outfit = '#ff6b9d',
    hair = HAIR,
    hairHi = HAIR_HI,
    accessory = null,
    blush = true,
    glow = 'rgba(255,255,255,.22)',
  } = o;

  const g = nextId('g'), s = nextId('s');

  return wrap(`
    <defs>${bgGrad(g, bg[0], bg[1])}
      <radialGradient id="${s}" cx=".5" cy=".38" r=".62">
        <stop offset="0" stop-color="${glow}"/><stop offset="1" stop-color="transparent"/>
      </radialGradient>
    </defs>
    <rect width="200" height="250" fill="url(#${g})"/>
    <circle cx="100" cy="95" r="96" fill="url(#${s})"/>
    <circle cx="42" cy="46" r="4" fill="#fff" opacity=".35"/>
    <circle cx="162" cy="70" r="2.6" fill="#fff" opacity=".28"/>
    <circle cx="150" cy="34" r="3.2" fill="#fff" opacity=".22"/>

    <!-- волосы сзади -->
    <path d="M46 118 q-6 66 22 92 h64 q28 -26 22 -92 q-6 -72 -54 -72 q-48 0 -54 72z" fill="${hair}"/>
    <path d="M60 130 q-4 44 6 74" fill="none" stroke="${hairHi}" stroke-width="6" stroke-linecap="round" opacity=".55"/>
    <path d="M142 132 q4 42 -6 72" fill="none" stroke="${hairHi}" stroke-width="6" stroke-linecap="round" opacity=".45"/>

    <!-- плечи -->
    <path d="M52 250 q6 -44 48 -52 q42 8 48 52z" fill="${outfit}"/>
    <path d="M84 198 q16 12 32 0 q-4 16 -16 18 q-12 -2 -16 -18z" fill="${SKIN}"/>
    <path d="M52 250 q6 -44 48 -52 q-8 22 -8 52z" fill="#000" opacity=".08"/>

    <!-- шея и голова -->
    <rect x="90" y="146" width="20" height="24" rx="9" fill="${SKIN_SH}"/>
    <ellipse cx="100" cy="112" rx="43" ry="47" fill="${SKIN}"/>
    <ellipse cx="100" cy="126" rx="43" ry="33" fill="${SKIN}"/>
    <ellipse cx="57" cy="116" rx="6" ry="9" fill="${SKIN_SH}"/>
    <ellipse cx="143" cy="116" rx="6" ry="9" fill="${SKIN_SH}"/>

    <!-- чёлка -->
    <path d="M57 108 q0 -50 43 -50 q43 0 43 50 q-10 -26 -30 -30 q-8 14 -30 12 q-18 -2 -26 18z" fill="${hair}"/>
    <path d="M74 68 q18 -8 34 2" fill="none" stroke="${hairHi}" stroke-width="5" stroke-linecap="round" opacity=".5"/>

    ${brows(expr)}
    ${eyes(expr)}
    <path d="M99 118 q3 3 -1 5" fill="none" stroke="${SKIN_SH}" stroke-width="2" stroke-linecap="round"/>
    ${mouth(expr)}
    ${blush ? `<ellipse cx="72" cy="124" rx="9" ry="5.5" fill="#ff8fae" opacity=".45"/>
               <ellipse cx="128" cy="124" rx="9" ry="5.5" fill="#ff8fae" opacity=".45"/>` : ''}
    ${accessory ? accessoryArt(accessory) : ''}
  `);
}

/* ─────────────────────────── Сцены ─────────────────────────── */

export function sceneDesk() {
  const g = nextId('g');
  return wrap(`
    <defs>${bgGrad(g, '#241a3e', '#3c2a52')}</defs>
    <rect width="200" height="250" fill="url(#${g})"/>
    <ellipse cx="128" cy="86" rx="72" ry="60" fill="#ffca6b" opacity=".16"/>
    <rect x="0" y="176" width="200" height="74" fill="#5a3f2e"/>
    <rect x="0" y="176" width="200" height="6" fill="#7a5740"/>
    <g transform="translate(112 44)">
      <path d="M0 0 h44 l-10 30 h-24z" fill="#ffca6b"/>
      <path d="M6 30 h32 l-2 5 h-28z" fill="#e0a94f"/>
      <rect x="20" y="34" width="4" height="128" fill="#3a2b48"/>
      <rect x="2" y="160" width="40" height="7" rx="3" fill="#3a2b48"/>
      <ellipse cx="22" cy="52" rx="34" ry="18" fill="#ffe6ae" opacity=".22"/>
    </g>
    <g transform="rotate(-6 60 170)">
      <rect x="18" y="128" width="86" height="52" rx="4" fill="#fdf6ea"/>
      <rect x="18" y="128" width="86" height="52" rx="4" fill="none" stroke="#d8c9b4"/>
      ${[0, 1, 2, 3, 4].map((i) => `<rect x="26" y="${138 + i * 9}" width="${68 - (i % 2) * 22}" height="2.4" rx="1.2" fill="#c3b6cf"/>`).join('')}
      <text x="27" y="174" font-family="monospace" font-size="12" fill="#b06dff">∫ f(x)dx</text>
    </g>
    <g transform="translate(150 148)">
      <path d="M0 0 h26 v22 a13 13 0 0 1 -26 0z" fill="#fff"/>
      <path d="M26 4 a8 8 0 0 1 0 14" fill="none" stroke="#fff" stroke-width="3"/>
      <ellipse cx="13" cy="1" rx="13" ry="4" fill="#8a5a3c"/>
      <path d="M8 -6 c5 -5 -5 -9 0 -14" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".45"/>
      <path d="M17 -6 c5 -5 -5 -9 0 -14" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".3"/>
    </g>
    <circle cx="30" cy="40" r="2.5" fill="#fff" opacity=".3"/>
  `);
}

export function sceneCat() {
  const g = nextId('g');
  return wrap(`
    <defs>${bgGrad(g, '#2b2047', '#4a3268')}</defs>
    <rect width="200" height="250" fill="url(#${g})"/>
    <ellipse cx="100" cy="120" rx="86" ry="76" fill="#ff6b9d" opacity=".10"/>
    <g transform="rotate(4 100 196)">
      <rect x="24" y="176" width="152" height="40" rx="5" fill="#fdf6ea"/>
      <rect x="24" y="176" width="152" height="40" rx="5" fill="none" stroke="#d8c9b4"/>
      ${[0, 1, 2].map((i) => `<rect x="34" y="${186 + i * 10}" width="${120 - i * 30}" height="2.4" rx="1.2" fill="#c9bcd6"/>`).join('')}
    </g>
    <g transform="translate(100 140)">
      <ellipse cx="0" cy="34" rx="56" ry="30" fill="#3a3048"/>
      <ellipse cx="0" cy="30" rx="54" ry="28" fill="#5c5170"/>
      <path d="M-52 32 q-16 4 -20 -8 q-2 -8 8 -6 q8 2 12 8z" fill="#5c5170"/>
      <circle cx="24" cy="4" r="27" fill="#5c5170"/>
      <path d="M4 -14 l-3 -20 l19 11z" fill="#5c5170"/>
      <path d="M44 -14 l7 -19 l-17 9z" fill="#5c5170"/>
      <path d="M6 -13 l-1 -12 l11 7z" fill="#ff9db3"/>
      <path d="M43 -13 l4 -11 l-10 5z" fill="#ff9db3"/>
      <path d="M12 2 q6 -5 12 0" fill="none" stroke="#241c33" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M30 2 q6 -5 12 0" fill="none" stroke="#241c33" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M23 12 l4 3 l4 -3z" fill="#ff9db3"/>
      <path d="M27 15 q-4 6 -8 2 M27 15 q4 6 8 2" fill="none" stroke="#241c33" stroke-width="1.8" stroke-linecap="round"/>
      <g stroke="#e6dff2" stroke-width="1.4" opacity=".8">
        <path d="M8 12 l-16 -3"/><path d="M8 16 l-16 4"/><path d="M46 12 l16 -3"/><path d="M46 16 l16 4"/>
      </g>
      <ellipse cx="-14" cy="42" rx="12" ry="8" fill="#6d6184"/>
    </g>
    <text x="100" y="52" text-anchor="middle" font-size="26" opacity=".55">💤</text>
  `);
}

export function sceneWindow() {
  const g = nextId('g'), s = nextId('s');
  return wrap(`
    <defs>${bgGrad(g, '#1d1533', '#2c1f45')}
      <linearGradient id="${s}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#5b3f8f"/><stop offset=".42" stop-color="#e0668c"/>
        <stop offset=".72" stop-color="#ff9d6b"/><stop offset="1" stop-color="#ffd9a0"/>
      </linearGradient>
    </defs>
    <rect width="200" height="250" fill="url(#${g})"/>
    <rect x="22" y="26" width="156" height="180" rx="10" fill="url(#${s})"/>
    <circle cx="120" cy="132" r="24" fill="#fff6d8" opacity=".92"/>
    <circle cx="120" cy="132" r="40" fill="#fff0c8" opacity=".18"/>
    <path d="M22 168 h156 v38 a10 10 0 0 1 -10 10 H32 a10 10 0 0 1 -10 -10z" fill="#7a4a6e" opacity=".55"/>
    ${[0, 1, 2].map((i) => `<rect x="${34 + i * 46}" y="${150 + i * 6}" width="34" height="5" rx="2.5" fill="#43305e" opacity=".5"/>`).join('')}
    <rect x="94" y="26" width="7" height="180" fill="#2a1f3d"/>
    <rect x="22" y="112" width="156" height="7" fill="#2a1f3d"/>
    <rect x="18" y="22" width="164" height="188" rx="12" fill="none" stroke="#2a1f3d" stroke-width="9"/>
    <rect x="8" y="206" width="184" height="12" rx="4" fill="#38284f"/>
    <g transform="translate(148 168)">
      <path d="M0 38 h26 l-4 -26 h-18z" fill="#c2705a"/>
      <path d="M13 12 q-16 -6 -14 -22 q14 2 14 22z" fill="#63c99a"/>
      <path d="M13 12 q16 -8 14 -24 q-14 4 -14 24z" fill="#4fae83"/>
      <path d="M13 12 q2 -18 0 -26" fill="none" stroke="#3d8f6a" stroke-width="2"/>
    </g>
    <g transform="translate(30 172)">
      <path d="M0 34 h22 v-4 a11 11 0 0 0 -22 0z" fill="#fff" opacity=".9"/>
      <ellipse cx="11" cy="30" rx="11" ry="3.5" fill="#c98a5e"/>
    </g>
  `);
}

export function sceneCity() {
  const g = nextId('g');
  const win = [];
  for (let i = 0; i < 68; i++) {
    const x = 12 + ((i * 37) % 176), y = 118 + ((i * 53) % 108);
    if (y > 236) continue;
    win.push(`<rect x="${x}" y="${y}" width="4" height="5" fill="#ffd98a" opacity="${0.25 + ((i * 7) % 10) / 14}"/>`);
  }
  return wrap(`
    <defs>${bgGrad(g, '#080a1e', '#241a44')}</defs>
    <rect width="200" height="250" fill="url(#${g})"/>
    <circle cx="150" cy="48" r="20" fill="#fff4d6"/>
    <circle cx="142" cy="42" r="19" fill="#0c0e24"/>
    ${Array.from({ length: 46 }, (_, i) => {
      const x = (i * 61) % 200, y = (i * 29) % 112, r = 0.6 + ((i * 3) % 5) / 4;
      return `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff" opacity="${0.3 + ((i * 5) % 7) / 12}"/>`;
    }).join('')}
    <path d="M0 150 l24 -18 l22 14 l20 -26 l26 18 l22 -12 l26 20 l22 -10 l38 22 v92 H0z" fill="#150f2e"/>
    <g>
      <rect x="10" y="132" width="34" height="118" fill="#1d1638"/>
      <rect x="52" y="152" width="28" height="98" fill="#231b42"/>
      <rect x="88" y="116" width="30" height="134" fill="#1a1434"/>
      <rect x="126" y="146" width="26" height="104" fill="#241c46"/>
      <rect x="160" y="126" width="32" height="124" fill="#1d1638"/>
    </g>
    ${win.join('')}
    <rect x="0" y="228" width="200" height="22" fill="#0e0a1e"/>
    <g stroke="#3a2f5c" stroke-width="3" fill="none">
      <path d="M0 228 h200"/>
      ${Array.from({ length: 11 }, (_, i) => `<path d="M${8 + i * 19} 228 v22"/>`).join('')}
    </g>
    <ellipse cx="100" cy="246" rx="90" ry="14" fill="#ff6b9d" opacity=".08"/>
  `);
}

export function sceneCoffee() {
  const g = nextId('g');
  return wrap(`
    <defs>${bgGrad(g, '#3a2a2a', '#5c4038')}</defs>
    <rect width="200" height="250" fill="url(#${g})"/>
    <rect x="0" y="0" width="200" height="250" fill="#6b4a3c" opacity=".25"/>
    <ellipse cx="104" cy="128" rx="86" ry="86" fill="#2b1f1c" opacity=".3"/>
    <circle cx="100" cy="122" r="80" fill="#f4ece2"/>
    <circle cx="100" cy="122" r="70" fill="#c98d5e"/>
    <circle cx="100" cy="122" r="70" fill="none" stroke="#b3794c" stroke-width="3"/>
    <path d="M100 156 c-30 -20 -30 -46 -12 -46 c8 0 12 6 12 10 c0 -4 4 -10 12 -10 c18 0 18 26 -12 46z" fill="#fdf6ea" opacity=".92"/>
    <path d="M100 78 q-16 8 -14 22" fill="none" stroke="#fdf6ea" stroke-width="3" opacity=".5" stroke-linecap="round"/>
    <ellipse cx="76" cy="96" rx="14" ry="9" fill="#fff" opacity=".16"/>
    <g transform="translate(150 190) rotate(24)">
      <rect x="0" y="0" width="9" height="46" rx="4" fill="#d8cfc2"/>
      <ellipse cx="4.5" cy="-6" rx="9" ry="12" fill="#d8cfc2"/>
    </g>
    <g transform="translate(16 190) rotate(-8)">
      <rect x="0" y="0" width="52" height="34" rx="3" fill="#fdf6ea"/>
      <rect x="6" y="7" width="34" height="2.4" rx="1.2" fill="#c9bcd6"/>
      <rect x="6" y="14" width="24" height="2.4" rx="1.2" fill="#c9bcd6"/>
      <text x="6" y="29" font-family="monospace" font-size="10" fill="#ff6b9d">x=2</text>
    </g>
  `);
}

export function sceneNotes() {
  const g = nextId('g');
  return wrap(`
    <defs>${bgGrad(g, '#1f2a44', '#31456b')}</defs>
    <rect width="200" height="250" fill="url(#${g})"/>
    <g transform="rotate(-4 100 125)">
      <rect x="18" y="24" width="164" height="202" rx="8" fill="#fdfaf3"/>
      <rect x="18" y="24" width="164" height="202" rx="8" fill="none" stroke="#ddd2c2"/>
      <rect x="40" y="24" width="2" height="202" fill="#ffb3c4"/>
      ${Array.from({ length: 12 }, (_, i) => `<rect x="50" y="${48 + i * 15}" width="118" height="1.4" fill="#dfe6f0"/>`).join('')}
      <text x="52" y="62" font-family="monospace" font-size="15" fill="#3b3357">lim (1+1/n)ⁿ</text>
      <text x="86" y="76" font-family="monospace" font-size="10" fill="#8a7fa8">n→∞</text>
      <text x="52" y="100" font-family="monospace" font-size="15" fill="#3b3357">= e ≈ 2.718</text>
      <text x="52" y="132" font-family="monospace" font-size="15" fill="#3b3357">∂/∂x (x²) = 2x</text>
      <path d="M52 142 h96" stroke="#ff6b9d" stroke-width="2.4" stroke-linecap="round"/>
      <text x="52" y="170" font-family="monospace" font-size="14" fill="#b06dff">спасибо ♥</text>
      <g transform="translate(126 176) rotate(-12)">
        <path d="M14 26 c-14 -10 -14 -22 -5.5 -22 c3.6 0 5.5 2.8 5.5 4.6 c0 -1.8 1.9 -4.6 5.5 -4.6 c8.5 0 8.5 12 -5.5 22z" fill="#ff6b9d" opacity=".85"/>
      </g>
    </g>
    <circle cx="176" cy="34" r="7" fill="#ffca6b"/>
  `);
}

/* Маленькая аватарка для шапки и ленты.
   Кэшируем по выражению: в ленте их десятки, а разметка одинаковая. */
const avatarCache = new Map();
export function avatar(expr = 'smile') {
  if (!avatarCache.has(expr)) {
    avatarCache.set(expr, portrait({ expr, bg: ['#6d4a8f', '#ff6b9d'], blush: true }));
  }
  return avatarCache.get(expr);
}
