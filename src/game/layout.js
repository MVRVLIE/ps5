/**
 * Раскладка сцены. Всё в CSS-пикселях.
 *   портрет — поле сверху, лоток строкой снизу;
 *   ландшафт — поле слева, лоток колонкой справа (так поле крупнее).
 */

const TRAY_RATIO = 0.25;      // высота лотка относительно стороны поля (портрет)
const TRAY_RATIO_MAX = 0.34;  // насколько лоток может подрасти, если есть место
const TRAY_COL_RATIO = 0.32;  // ширина колонки лотка в ландшафте
const SLOT_MAX_SCALE = 0.62;  // насколько крупно фигура выглядит в лотке
const WIDE_THRESHOLD = 1.35;  // с какого соотношения сторон включается ландшафт

export function computeLayout(w, h, grid = 9, trayCount = 3) {
  const pad = Math.max(8, Math.min(w, h) * 0.028);
  return w / h > WIDE_THRESHOLD
    ? wideLayout(w, h, pad, grid, trayCount)
    : tallLayout(w, h, pad, grid, trayCount);
}

function tallLayout(w, h, pad, grid, trayCount) {
  const size = Math.max(90, Math.min(w - pad * 2, (h - pad * 3) / (1 + TRAY_RATIO)));
  let trayH = size * TRAY_RATIO;

  // на вытянутых экранах отдаём лишнюю высоту лотку — по фигурам легче попасть
  const spare = h - (size + trayH + pad * 3);
  if (spare > 0) trayH = Math.min(size * TRAY_RATIO_MAX, trayH + spare * 0.5);

  const usedH = size + trayH + pad;
  const board = { x: (w - size) / 2, y: Math.max(pad, (h - usedH) / 2), size, cell: size / grid };
  const trayY = board.y + size + pad;
  const slotW = size / trayCount;

  const slots = [];
  for (let i = 0; i < trayCount; i++) {
    slots.push({
      x: board.x + slotW * i,
      y: trayY,
      w: slotW,
      h: trayH,
      cx: board.x + slotW * (i + 0.5),
      cy: trayY + trayH / 2,
    });
  }

  return { w, h, pad, wide: false, board, tray: { x: board.x, y: trayY, w: size, h: trayH }, slots };
}

function wideLayout(w, h, pad, grid, trayCount) {
  const size = Math.max(90, Math.min(h - pad * 2, (w - pad * 3) / (1 + TRAY_COL_RATIO)));
  const trayW = size * TRAY_COL_RATIO;
  const totalW = size + pad + trayW;
  const x = Math.max(pad, (w - totalW) / 2);
  const y = (h - size) / 2;
  const board = { x, y, size, cell: size / grid };
  const trayX = x + size + pad;
  const slotH = size / trayCount;

  const slots = [];
  for (let i = 0; i < trayCount; i++) {
    slots.push({
      x: trayX,
      y: y + slotH * i,
      w: trayW,
      h: slotH,
      cx: trayX + trayW / 2,
      cy: y + slotH * (i + 0.5),
    });
  }

  return { w, h, pad, wide: true, board, tray: { x: trayX, y, w: trayW, h: size }, slots };
}

/** Масштаб фигуры в лотке, чтобы она влезала в свою ячейку. */
export function slotScale(piece, slot, cell) {
  const boxW = slot.w * 0.82;
  const boxH = slot.h * 0.84;
  return Math.min(boxW / (piece.w * cell), boxH / (piece.h * cell), SLOT_MAX_SCALE);
}
