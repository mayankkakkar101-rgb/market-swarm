import { worldToScreen } from "./IsoMath.js";
import { CockroachSprite, updateEnemyDirection } from "./CockroachSprite.js";
import { ISO_DIR } from "./IsoDirection.js";

const cockroachSprite = new CockroachSprite();

export class Enemy {
  static _idCounter = 0;

  constructor(player, bounds) {
    this.id = ++Enemy._idCounter;
    this.player = player;
    this.bounds = bounds;
    this.originX = bounds.originX;
    this.originY = bounds.originY;
    this.isLeader = Math.random() < 0.08;
    this.speed = this.isLeader ? 1.05 : 1.55 + Math.random() * 0.55;
    this.isoDir = ISO_DIR.SE;
    this.damage = this.isLeader ? 18 : 12;
    this.legPhase = Math.random() * Math.PI * 2;

    const edge = Math.floor(Math.random() * 4);
    const m = 0.5;
    if (edge === 0) {
      this.wx = (bounds.minX + bounds.maxX) / 2 + (Math.random() - 0.5) * 4;
      this.wy = bounds.minY - m;
    } else if (edge === 1) {
      this.wx = bounds.maxX + m;
      this.wy = (bounds.minY + bounds.maxY) / 2 + (Math.random() - 0.5) * 4;
    } else if (edge === 2) {
      this.wx = (bounds.minX + bounds.maxX) / 2 + (Math.random() - 0.5) * 4;
      this.wy = bounds.maxY + m;
    } else {
      this.wx = bounds.minX - m;
      this.wy = (bounds.minY + bounds.maxY) / 2 + (Math.random() - 0.5) * 4;
    }
  }

  getDepth() {
    return this.wx + this.wy;
  }

  getScreenPos() {
    return worldToScreen(this.wx, this.wy, this.originX, this.originY);
  }

  update(dt) {
    const target = this.player;
    const dx = target.wx - this.wx;
    const dy = target.wy - this.wy;
    const dist = Math.hypot(dx, dy) || 0.001;
    this.wx += (dx / dist) * this.speed * dt;
    this.wy += (dy / dist) * this.speed * dt;
    updateEnemyDirection(this, dx, dy);
    this.legPhase += dt * (this.isLeader ? 5 : 7);
  }

  getHitRadius() {
    return (this.spriteW ?? 12) * 0.35;
  }

  intersectsPlayer(player) {
    const s = this.getScreenPos();
    const p = player.getScreenPos();
    const dx = s.x - p.x;
    const dy = s.y - p.y;
    const minDist = this.getHitRadius() + (player.spriteW ?? 40) * 0.25;
    return dx * dx + dy * dy < minDist * minDist;
  }

  isInAttackRadius(player) {
    const c = player.getAttackCenter ? player.getAttackCenter() : player.getCenter();
    const s = this.getScreenPos();
    const dx = s.x - c.x;
    const dy = s.y - c.y;
    const r = player.attackRadius + this.getHitRadius();
    return (dx * dx) / (r * r) + (dy * dy) / ((r * 0.65) * (r * 0.65)) <= 1;
  }

  draw(ctx) {
    if (cockroachSprite.draw(ctx, this)) return;
    const s = this.getScreenPos();
    ctx.fillStyle = "#4e342e";
    ctx.beginPath();
    ctx.ellipse(s.x, s.y, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}
