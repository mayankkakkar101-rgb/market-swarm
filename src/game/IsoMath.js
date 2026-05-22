/** 2:1 dimetric isometric projection */
export const ISO_TILE_W = 64;
export const ISO_TILE_H = 32;

export function worldToScreen(wx, wy, originX, originY) {
  return {
    x: (wx - wy) * (ISO_TILE_W / 2) + originX,
    y: (wx + wy) * (ISO_TILE_H / 2) + originY,
  };
}

export function screenToWorld(sx, sy, originX, originY) {
  const rx = sx - originX;
  const ry = sy - originY;
  return {
    x: (rx / (ISO_TILE_W / 2) + ry / (ISO_TILE_H / 2)) / 2,
    y: (ry / (ISO_TILE_H / 2) - rx / (ISO_TILE_W / 2)) / 2,
  };
}

/** Depth key — higher draws on top */
export function depthKey(wx, wy, lift = 0) {
  return wx + wy + lift;
}

export function getIsoOrigin(canvasWidth, canvasHeight) {
  return {
    x: canvasWidth * 0.5,
    y: canvasHeight * 0.38,
  };
}

export function getWorldBounds(canvasWidth, canvasHeight) {
  const { x: ox, y: oy } = getIsoOrigin(canvasWidth, canvasHeight);
  const margin = 2;
  const corners = [
    screenToWorld(80, 120 + 70, ox, oy),
    screenToWorld(canvasWidth - 80, 120 + 70, ox, oy),
    screenToWorld(80, canvasHeight - 100, ox, oy),
    screenToWorld(canvasWidth - 80, canvasHeight - 100, ox, oy),
  ];
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  for (const c of corners) {
    minX = Math.min(minX, c.x);
    maxX = Math.max(maxX, c.x);
    minY = Math.min(minY, c.y);
    maxY = Math.max(maxY, c.y);
  }
  return {
    minX: minX - margin,
    maxX: maxX + margin,
    minY: minY - margin,
    maxY: maxY + margin,
    originX: ox,
    originY: oy,
  };
}
