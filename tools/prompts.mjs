/**
 * Промпты для 12 карточек коллекции. Пишутся по-английски — модели так
 * стабильнее; палитра и настроение взяты из styles.css, чтобы картинки
 * встали в игру без правок.
 */

/** Общий стиль. Дописывается к каждому промпту, держит серию единой. */
export const STYLE = `
Flat vector illustration, clean geometric shapes, soft gradients, no outlines.
Palette: deep violet ground (#0e0b16, #1c1630, #241c3d), warm neon accents
(#ff6b9d pink, #b06dff violet, #5ee0d0 mint, #ffca6b amber).
Cozy late-night student mood, gentle rim light.
Vertical 4:5 composition, framed as a collectible card for a mobile game.
No text, no lettering, no watermark, no logos, no borders.
`.trim();

/** Описание героини. Идёт в каждый портрет, чтобы лицо не «плыло». */
export const CHARACTER = `
Nika: 19-year-old university freshman. Long dark plum hair past her shoulders,
warm fair skin, round face, large expressive dark eyes, soft small smile.
Simple modest casual clothes. Warm, slightly sarcastic energy.
Fully clothed, wholesome, safe-for-work.
`.trim();

/** Лист персонажа — генерируется первым и подмешивается как референс. */
export const REFERENCE = `
Character reference sheet for ${'Nika'}: one centered head-and-shoulders portrait,
neutral friendly expression, facing the viewer, even lighting, plain violet background.
${CHARACTER}
${STYLE}
`.trim();

/** id совпадают с PHOTOS в src/gallery.js — файлы кладутся рядом по имени. */
export const PROMPTS = [
  { id: 'desk',    portrait: false, prompt: 'A student desk at night. Warm amber desk lamp glowing, an open lined notebook with handwritten calculus scribbles, a white coffee mug with rising steam, wooden desktop. Empty room, no people. Intimate late-night studying atmosphere.' },
  { id: 'glasses', portrait: true,  prompt: 'Nika wearing round thin-rimmed glasses, winking at the viewer with a small playful smile, head and shoulders, cozy bedroom background in soft violet light. She wears a light blue sweater.' },
  { id: 'notes',   portrait: false, prompt: 'Top-down view of an open lined notebook page filled with neat handwritten calculus notes and a limit formula, one bright pink highlighter stroke across a line, a small hand-drawn heart doodle in the corner, cool blue desk light.' },
  { id: 'cat',     portrait: false, prompt: 'A sleepy round grey cat curled up on top of an open notebook, eyes closed, content. Warm violet room, soft glow behind. Cozy and slightly comic — the cat is clearly refusing to move.' },
  { id: 'coffee',  portrait: false, prompt: 'Top-down view of a latte in a white cup, heart-shaped latte art in the foam, a teaspoon beside it, a small torn paper note with a scribbled equation next to the saucer. Warm brown wooden table, late-night lighting.' },
  { id: 'laugh',   portrait: true,  prompt: 'Nika laughing hard, eyes squeezed shut in happy arcs, wide open smile, wearing pink over-ear headphones, head and shoulders, warm sunset orange and pink light. She wears a mustard yellow top.' },
  { id: 'window',  portrait: false, prompt: 'A sunset seen through a window from inside a room. Layered pink, orange and violet sky, a small potted plant on the windowsill, a mug resting on the ledge. No people. Calm, warm, a little wistful.' },
  { id: 'think',   portrait: true,  prompt: 'Nika thinking, holding a yellow pencil against her cheek, eyes looking up and to the side, mouth in a small flat line, head and shoulders, cool blue evening light. She wears a soft periwinkle shirt.' },
  { id: 'city',    portrait: false, prompt: 'A night city skyline seen from a balcony railing. Dark violet silhouetted buildings with scattered warm lit windows, a crescent moon, a few stars, faint pink glow near the horizon. No people. Insomnia before an exam.' },
  { id: 'shy',     portrait: true,  prompt: 'Nika looking shy, eyes glancing down and away, small closed smile, visible blush on her cheeks, a small gold hair clip. Head and shoulders, soft pink light. She wears a pale pink top.' },
  { id: 'exam',    portrait: true,  prompt: 'Nika triumphant, holding up a graded exam paper beside her face, huge open smile, eyes bright, head and shoulders, fresh green and mint celebratory light. She wears a mustard yellow top.' },
  { id: 'love',    portrait: true,  prompt: 'Nika with a soft warm closed-mouth smile, looking straight at the viewer, calm and open, head and shoulders, warm pink light, a subtle small heart motif in the background bokeh. She wears a pink top.' },
];

/** Собрать финальный текст запроса для одной карточки. */
export const buildPrompt = (card) =>
  [card.prompt, card.portrait ? CHARACTER : null, STYLE].filter(Boolean).join('\n\n');
