import { processImageTransparency } from "./imageProcessor.js";

export class SpriteSheet {
  constructor(src, frameCount, options = {}) {
    this.src = src;
    this.frameCount = frameCount;
    this.image = new Image();
    this.processedCanvas = null;
    this.loaded = false;
    this.frameWidth = options.frameWidth ?? 0;
    this.frameHeight = options.frameHeight ?? 0;
    this.scale = options.scale ?? 1;
    this.chromaKey = options.chromaKey ?? "edge";
    this.feetAnchor = options.feetAnchor ?? 0.92;
    this.shadowType = options.shadowType ?? "hero";

    this.image.onload = () => {
      if (this.chromaKey === "edge") {
        this.processedCanvas = processImageTransparency(this.image, {
          strict: options.chromaStrict === true,
        });
      } else if (this.chromaKey === "strict-edge") {
        this.processedCanvas = processImageTransparency(this.image, { strict: true });
      }
      const source = this.processedCanvas ?? this.image;
      if (!this.frameWidth) {
        this.frameWidth = Math.floor(source.width / this.frameCount);
      }
      if (!this.frameHeight) {
        this.frameHeight = source.height;
      }
      this.loaded = true;
    };
    this.image.src = src;
  }

  getSource() {
    return this.processedCanvas ?? this.image;
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
      ctx.fillStyle = "rgba(0, 0, 0, 0.14)";
      ctx.beginPath();
      ctx.ellipse(screenX, screenY + 1, Math.max(4, w * 0.22), Math.max(2, h * 0.05), 0, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const rx = w * 0.28;
      const ry = Math.max(3, h * 0.06);
      const g = ctx.createRadialGradient(screenX, screenY, 0, screenX, screenY, rx);
      g.addColorStop(0, "rgba(0, 0, 0, 0.32)");
      g.addColorStop(0.55, "rgba(0, 0, 0, 0.12)");
      g.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(screenX, screenY + 2, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  drawAtFeet(ctx, frameIndex, screenX, screenY, facing = 1, scaleOverride = null) {
    if (!this.loaded) return false;

    const source = this.getSource();
    const idx = Math.max(0, Math.min(this.frameCount - 1, frameIndex));
    const sx = idx * this.frameWidth;
    const scale = scaleOverride ?? this.scale;
    const w = this.frameWidth * scale;
    const h = this.frameHeight * scale;

    this._drawGroundShadow(ctx, screenX, screenY, w, h);

    ctx.save();
    ctx.translate(screenX, screenY);
    if (facing < 0) ctx.scale(-1, 1);
    ctx.drawImage(
      source,
      sx,
      0,
      this.frameWidth,
      this.frameHeight,
      -w / 2,
      -h * this.feetAnchor,
      w,
      h
    );
    ctx.restore();
    return true;
  }
}
