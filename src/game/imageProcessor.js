/** Strip sheet backdrops while preserving character pixels. */

function isCheckerboardPixel(r, g, b) {
  const min = Math.min(r, g, b);
  const max = Math.max(r, g, b);
  if (max - min > 18) return false;
  const avg = (r + g + b) / 3;
  return avg >= 155 && avg <= 225;
}

function isWhiteBackdrop(r, g, b, a) {
  if (a < 8) return true;
  return r >= 248 && g >= 248 && b >= 248;
}

function isMagentaKey(r, g, b) {
  return r >= 200 && b >= 200 && g <= 130;
}

function isTealBackdrop(r, g, b) {
  return b > r + 25 && g > r + 10 && b > 120 && r < 210;
}

function isBlackBackdrop(r, g, b, a) {
  if (a < 8) return true;
  // Keep dark outlines, hair, shoes, and shadows. Only strip near-pure
  // generated black canvas pixels from the sprite sheet background.
  return r <= 2 && g <= 2 && b <= 2;
}

function isBackdropPixel(r, g, b, a) {
  return (
    isCheckerboardPixel(r, g, b) ||
    isWhiteBackdrop(r, g, b, a) ||
    isMagentaKey(r, g, b) ||
    isTealBackdrop(r, g, b) ||
    isBlackBackdrop(r, g, b, a)
  );
}

export function processImageTransparency(image) {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(image, 0, 0);

  const { width, height } = canvas;
  const data = ctx.getImageData(0, 0, width, height);
  const px = data.data;
  const visited = new Uint8Array(width * height);
  const queue = [];

  const enqueue = (x, y) => {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const idx = y * width + x;
    if (visited[idx]) return;
    const o = idx * 4;
    if (!isBackdropPixel(px[o], px[o + 1], px[o + 2], px[o + 3])) return;
    visited[idx] = 1;
    queue.push(idx);
  };

  for (let x = 0; x < width; x++) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }

  while (queue.length > 0) {
    const idx = queue.pop();
    const x = idx % width;
    const y = (idx - x) / width;
    px[idx * 4 + 3] = 0;
    enqueue(x - 1, y);
    enqueue(x + 1, y);
    enqueue(x, y - 1);
    enqueue(x, y + 1);
  }

  // Also clear any isolated pure backdrop pixels inside frame gutters.
  for (let i = 0; i < px.length; i += 4) {
    const r = px[i];
    const g = px[i + 1];
    const b = px[i + 2];
    if (isCheckerboardPixel(r, g, b) || isWhiteBackdrop(r, g, b, px[i + 3]) || isMagentaKey(r, g, b)) {
      px[i + 3] = 0;
    }
  }

  ctx.putImageData(data, 0, 0);
  return canvas;
}

export function loadProcessedImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(processImageTransparency(img));
    img.onerror = () => resolve(null);
    img.src = src;
  });
}
