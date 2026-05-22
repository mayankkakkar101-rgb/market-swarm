import { worldToScreen } from "./IsoMath.js";
import { drawPlayerSprite } from "./characterAnimators.js";
import { updatePlayerDirection } from "./CharacterSpriteAnimator.js";
import { ISO_DIR } from "./IsoDirection.js";

export class Player {
  constructor(wx, wy, preset, bounds) {
    this.wx = wx;
    this.wy = wy;
    this.preset = preset;
    this.bounds = bounds;
    this.originX = bounds.originX;
    this.originY = bounds.originY;
    this.speed = 2.8;
    this.width = 48;
    this.height = 72;
    this.weapon = preset.weapon;
    this.attackRadius = preset.attackRadius;
    this.attackCooldownMax = preset.attackCooldown;
    this.attackCooldown = 0;
    this.isAttacking = false;
    this.attackAnimTimer = 0;
    this.facing = 1;
    this.maxHealth = 100;
    this.health = 100;
    this.maxStamina = preset.maxStamina;
    this.stamina = preset.maxStamina;
    this.invincibleTimer = 0;
    this.walkPhase = 0;
    this.isMoving = false;
    this.isoDir = ISO_DIR.SE;
    this.moveMx = 0;
    this.moveMy = 1;
  }

  getDepth() {
    return this.wx + this.wy + 0.02;
  }

  getScreenPos() {
    return worldToScreen(this.wx, this.wy, this.originX, this.originY);
  }

  getCenter() {
    const s = this.getScreenPos();
    const h = this.spriteH ?? this.height;
    return { x: s.x, y: s.y - h * 0.38 };
  }

  getAttackCenter() {
    const s = this.getScreenPos();
    return { x: s.x, y: s.y - (this.spriteH ?? this.height) * 0.2 };
  }

  update(dt, input) {
    const { dx, dy } = input.getMovementVector();
    let mx = 0;
    let my = 0;
    if (dy < 0) {
      my -= 1;
    }
    if (dy > 0) {
      my += 1;
    }
    if (dx < 0) {
      mx -= 1;
    }
    if (dx > 0) {
      mx += 1;
    }

    this.isMoving = mx !== 0 || my !== 0;
    if (this.isMoving) {
      if (mx !== 0 && my !== 0) {
        const len = Math.hypot(mx, my);
        mx /= len;
        my /= len;
      }
      if (mx !== 0) this.facing = mx > 0 ? 1 : -1;
      updatePlayerDirection(this, mx, my);
      this.wx += mx * this.speed * dt;
      this.wy += my * this.speed * dt;
      this.wx = Math.max(this.bounds.minX, Math.min(this.bounds.maxX, this.wx));
      this.wy = Math.max(this.bounds.minY, Math.min(this.bounds.maxY, this.wy));
      this.walkPhase += dt * 8;
    }

    if (this.attackCooldown > 0) this.attackCooldown -= dt;
    if (this.attackAnimTimer > 0) {
      this.attackAnimTimer -= dt;
      if (this.attackAnimTimer <= 0) this.isAttacking = false;
    }
    if (this.invincibleTimer > 0) this.invincibleTimer -= dt;

    this.stamina = Math.min(
      this.maxStamina,
      this.stamina + dt * (this.attackCooldown > 0 ? 35 : 55)
    );

    if (input.consumeAttackPress() && this.attackCooldown <= 0 && this.stamina >= 25) {
      this.triggerAttack();
      return true;
    }
    return false;
  }

  triggerAttack() {
    this.isAttacking = true;
    this.attackAnimTimer = 0.2;
    this.attackCooldown = this.attackCooldownMax;
    this.stamina = Math.max(0, this.stamina - 25);
  }

  takeDamage(amount) {
    if (this.invincibleTimer > 0) return;
    this.health -= amount;
    this.invincibleTimer = 0.75;
    if (this.health < 0) this.health = 0;
  }

  draw(ctx) {
    const flicker = this.invincibleTimer > 0 && Math.floor(this.invincibleTimer * 12) % 2 === 0;
    if (flicker) ctx.globalAlpha = 0.55;

    if (!drawPlayerSprite(ctx, this)) {
      const s = this.getScreenPos();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.ellipse(s.x, s.y, 18, 10, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    if (this.isAttacking) {
      const c = this.getCenter();
      const pulse = this.attackAnimTimer / 0.2;
      const rx = this.attackRadius;
      const ry = this.attackRadius * 0.5;
      ctx.save();
      const g = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, rx);
      const color = this.preset.id === "pm" ? "255, 105, 180" : "255, 200, 150";
      g.addColorStop(0, `rgba(${color}, ${0.22 * pulse})`);
      g.addColorStop(0.7, `rgba(${color}, ${0.08 * pulse})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, rx, ry * 1.2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    ctx.globalAlpha = 1;
  }
}
