/** Isometric 4-way facing from world movement (mx, my) */
export const ISO_DIR = {
  SE: 0,
  SW: 1,
  NW: 2,
  NE: 3,
};

export function getIsoDirection(mx, my, lastDir = ISO_DIR.SE) {
  if (mx === 0 && my === 0) return lastDir;
  if (mx >= 0 && my >= 0) return ISO_DIR.SE;
  if (mx < 0 && my >= 0) return ISO_DIR.SW;
  if (mx < 0 && my < 0) return ISO_DIR.NW;
  return ISO_DIR.NE;
}
