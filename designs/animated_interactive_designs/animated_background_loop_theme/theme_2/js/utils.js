// js/utils.js

export const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

export const lerp = (a, b, t) => a * (1 - t) + b * t;

export const dist2 = (x1, y1, x2, y2) => {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return dx * dx + dy * dy;
};

export const rand = (min, max) => Math.random() * (max - min) + min;

export const pick = (arr) => arr[(Math.random() * arr.length) | 0];

/**
 * Scale canvas for crisp rendering.
 * Uses window.devicePixelRatio and scales the drawing context back to CSS pixels.
 */
export function resizeCanvasToDisplaySize(canvas, ctx, maxDpr = 2) {
  const dpr = clamp(window.devicePixelRatio || 1, 1, maxDpr);
  const rect = canvas.getBoundingClientRect();

  const cssW = Math.max(1, Math.floor(rect.width));
  const cssH = Math.max(1, Math.floor(rect.height));

  const newW = Math.floor(cssW * dpr);
  const newH = Math.floor(cssH * dpr);

  if (canvas.width === newW && canvas.height === newH) {
    return { cssW, cssH, dpr, changed: false };
  }

  canvas.width = newW;
  canvas.height = newH;

  // Reset transform so repeated resizes don't stack scaling
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(dpr, dpr);

  return { cssW, cssH, dpr, changed: true };
}
