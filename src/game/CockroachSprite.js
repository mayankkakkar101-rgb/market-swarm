import { DirectionalSpriteSheet } from "./DirectionalSpriteSheet.js";
import { getIsoDirection } from "./IsoDirection.js";
import { assetUrl } from "./assets.js";

export class CockroachSprite {
  constructor() {
    this.sheet = new DirectionalSpriteSheet(assetUrl("/assets/cockroach-directional.png"), {
      cols: 6,
      rows: 8,
      scale: 0.19,
      feetAnchor: 0.85,
      shadowType: "roach",
      proceduralId: "roach",
      forceProcedural: true,
    });
  }

  getScale(enemy) {
    return enemy.isLeader ? 0.255 : 0.19;
  }

  draw(ctx, enemy) {
    const col = Math.floor(enemy.legPhase) % this.sheet.cols;
    const row = enemy.isoDir ?? 0;
    const scale = this.getScale(enemy);
    const screen = enemy.getScreenPos();
    const { w, h } = this.sheet.getDrawSize(scale);
    enemy.spriteW = w;
    enemy.spriteH = h;

    const drew = this.sheet.drawAtFeet(ctx, col, row, screen.x, screen.y, scale);

    if (drew && enemy.isLeader) {
      ctx.save();
      ctx.strokeStyle = "rgba(160, 50, 10, 0.3)";
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.ellipse(screen.x, screen.y - h * 0.3, w * 0.5, h * 0.25, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    return drew;
  }
}

export function updateEnemyDirection(enemy, dx, dy) {
  const dist = Math.hypot(dx, dy) || 1;
  enemy.moveMx = dx / dist;
  enemy.moveMy = dy / dist;
  const angle = Math.atan2(enemy.moveMy, enemy.moveMx);
  enemy.isoDir = (Math.round(((angle - Math.PI / 8) / (Math.PI * 2)) * 8) + 8) % 8;
}
