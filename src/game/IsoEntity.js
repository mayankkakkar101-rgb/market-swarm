import { worldToScreen, depthKey } from "./IsoMath.js";

/** Base mixin for isometric world-space entities */
export class IsoEntity {
  constructor(wx, wy, bounds) {
    this.wx = wx;
    this.wy = wy;
    this.bounds = bounds;
    this.facing = 1;
    this.originX = bounds.originX;
    this.originY = bounds.originY;
  }

  getDepth() {
    return depthKey(this.wx, this.wy, 0.01);
  }

  getScreenPos() {
    return worldToScreen(this.wx, this.wy, this.originX, this.originY);
  }

  clampToBounds() {
    this.wx = Math.max(this.bounds.minX, Math.min(this.bounds.maxX, this.wx));
    this.wy = Math.max(this.bounds.minY, Math.min(this.bounds.maxY, this.wy));
  }

  applyIsoMovement(mx, my, speed, dt) {
    if (mx === 0 && my === 0) return false;
    if (mx !== 0 && my !== 0) {
      const len = Math.hypot(mx, my);
      mx /= len;
      my /= len;
    }
    this.wx += mx * speed * dt;
    this.wy += my * speed * dt;
    if (mx !== 0) this.facing = mx >= 0 ? 1 : -1;
    this.clampToBounds();
    return true;
  }
}
