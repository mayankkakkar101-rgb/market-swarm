import { DirectionalSpriteSheet } from "./DirectionalSpriteSheet.js";
import { getIsoDirection } from "./IsoDirection.js";

export class CharacterSpriteAnimator {
  constructor(src, scale, proceduralId) {
    this.sheet = new DirectionalSpriteSheet(src, {
      cols: 4,
      rows: 4,
      scale,
      feetAnchor: 0.88,
      shadowType: "hero",
      proceduralId,
      validateSheet: false,
    });
  }

  getAnimFrame(player) {
    if (player.isAttacking) return this.sheet.cols - 1;
    if (!player.isMoving) return 0;
    return Math.floor(player.walkPhase) % this.sheet.cols;
  }

  draw(ctx, player) {
    const col = this.getAnimFrame(player);
    const row = player.isoDir ?? 0;
    const screen = player.getScreenPos();
    const scale = this.sheet.scale;
    const { w, h } = this.sheet.getDrawSize(scale);

    player.spriteW = w;
    player.spriteH = h;
    player.width = w;
    player.height = h;

    return this.sheet.drawAtFeet(ctx, col, row, screen.x, screen.y, scale);
  }
}

export function updatePlayerDirection(player, mx, my) {
  if (mx !== 0 || my !== 0) {
    player.moveMx = mx;
    player.moveMy = my;
    player.isoDir = getIsoDirection(mx, my, player.isoDir);
  }
}
