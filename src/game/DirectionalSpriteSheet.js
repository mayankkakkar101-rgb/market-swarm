import { processImageTransparency } from "./imageProcessor.js";
import { getProceduralSheet } from "./proceduralSprites.js";

/**
 * Grid: columns = walk frames (0–3), rows = ISO_DIR (SE, SW, NW, NE).
 */
export class DirectionalSpriteSheet {
  constructor(src, options = {}) {
    this.src = src;
    this.cols = options.cols ?? 4;
    this.rows = options.rows ?? 4;
    this.scale = options.scale ?? 1;
    this.feetAnchor = options.feetAnchor ?? 0.9;
    this.shadowType = options.shadowType ?? "hero";
    this.proceduralId = options.proceduralId ?? null;
    this.forceProcedural = options.forceProcedural === true;
    this.validateSheet = options.validateSheet !== false;

    this.frameWidth = 0;
    this.frameHeight = 0;
    this.image = new Image();
    this.processedCanvas = null;
    this.loaded = false;
    this.useProcedural = false;

    this.image.onload = () => {
      if (this.forceProcedural) {
        this._useProcedural();
        return;
      }
      this.processedCanvas = processImageTransparency(this.image);
      this.frameWidth = this.processedCanvas.width / this.cols;
      this.frameHeight = this.processedCanvas.height / this.rows;
      if (this.validateSheet && !this._sheetLooksValid()) {
        this._useProcedural();
        return;
      }
      this.loaded = true;
    };
    this.image.onerror = () => this._useProcedural();
    this.image.src = src;

    setTimeout(() => {
      if (!this.loaded && this.proceduralId) this._useProcedural();
    }, 3000);
  }

  _useProcedural() {
    const sheet = getProceduralSheet(this.proceduralId);
    if (!sheet) return;
    this.processedCanvas = sheet;
    this.frameWidth = sheet.width / this.cols;
    this.frameHeight = sheet.height / this.rows;
    this.useProcedural = true;
    this.loaded = true;
  }

  _sheetLooksValid() {
    if (!this.processedCanvas) return false;

    const ctx = this.processedCanvas.getContext("2d", { willReadFrequently: true });
    let badCells = 0;

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        const imageData = ctx.getImageData(
          col * this.frameWidth,
          row * this.frameHeight,
          this.frameWidth,
          this.frameHeight
        );
        const data = imageData.data;
        let minX = this.frameWidth;
        let minY = this.frameHeight;
        let maxX = -1;
        let maxY = -1;

        for (let y = 0; y < this.frameHeight; y++) {
          for (let x = 0; x < this.frameWidth; x++) {
            const alpha = data[(y * this.frameWidth + x) * 4 + 3];
            if (alpha > 20) {
              minX = Math.min(minX, x);
              minY = Math.min(minY, y);
              maxX = Math.max(maxX, x);
              maxY = Math.max(maxY, y);
            }
          }
        }

        if (maxX < 0 || maxY < 0) {
          badCells++;
          continue;
        }

        const contentW = maxX - minX + 1;
        const contentH = maxY - minY + 1;
        const tooSmall = contentW < this.frameWidth * 0.2 || contentH < this.frameHeight * 0.2;
        const cutAtEdge =
          (minX === 0 && maxX < this.frameWidth * 0.65) ||
          (maxX === this.frameWidth - 1 && minX > this.frameWidth * 0.35);

        if (tooSmall || cutAtEdge) badCells++;
      }
    }

    return badCells <= 1;
  }

  getSource() {
    return this.processedCanvas;
  }

  getDrawSize(scaleOverride = null) {
    const scale = scaleOverride ?? this.scale;
    return {
      w: this.frameWidth * scale,
      h: this.frameHeight * scale,
    };
  }

  _drawGroundShadow(ctx, screenX, screenY, w, h) {
    if (this.shadowType === "none") return;
    ctx.save();
    if (this.shadowType === "roach") {
      ctx.fillStyle = "rgba(0,0,0,0.1)";
      ctx.beginPath();
      ctx.ellipse(screenX, screenY + 1, Math.max(3, w * 0.18), Math.max(2, h * 0.04), 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const g = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, w * 0.28);
      g.addColorStop(0, "rgba(0,0,0,0.26)");
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(screenX, screenY + 2, w * 0.24, Math.max(3, h * 0.05), 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  drawAtFeet(ctx, col, row, screenX, screenY, scaleOverride = null) {
    if (!this.loaded) return false;

    const source = this.getSource();
    const c = Math.max(0, Math.min(this.cols - 1, col));
    const r = Math.max(0, Math.min(this.rows - 1, row));
    const sx = c * this.frameWidth;
    const sy = r * this.frameHeight;
    const scale = scaleOverride ?? this.scale;
    const w = this.frameWidth * scale;
    const h = this.frameHeight * scale;

    this._drawGroundShadow(ctx, screenX, screenY, w, h);

    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(
      source,
      sx,
      sy,
      this.frameWidth,
      this.frameHeight,
      screenX - w / 2,
      screenY - h * this.feetAnchor,
      w,
      h
    );
    ctx.restore();
    return true;
  }
}
