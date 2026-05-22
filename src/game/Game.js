import { InputHandler } from "./InputHandler.js";
import { Player } from "./Player.js";
import { Enemy } from "./Enemy.js";
import { VFX } from "./VFX.js";
import { BackgroundRenderer } from "./BackgroundRenderer.js";
import { CHARACTER_PRESETS } from "./characters.js";
import { getWorldBounds } from "./IsoMath.js";

export const GameState = {
  START: "START",
  PLAYING: "PLAYING",
  GAME_OVER: "GAME_OVER",
};

export class Game {
  constructor(canvas, onStateChange) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.width = canvas.width;
    this.height = canvas.height;
    this.onStateChange = onStateChange;
    this.input = new InputHandler();
    this.background = new BackgroundRenderer();
    this.vfx = new VFX();
    this.state = GameState.START;
    this.selectedPreset = null;
    this.player = null;
    this.enemies = [];
    this.killCount = 0;
    this.timeRemaining = 60;
    this.totalDuration = 60;
    this.spawnTimer = 0;
    this.baseSpawnInterval = 1.35;
    this.minSpawnInterval = 0.22;
    this.gameOverResult = null;
    this.lastTimestamp = 0;
    this.animationId = null;
    this.playBounds = getWorldBounds(this.width, this.height);
    this._lastEmitSecond = -1;
    this._lastEmitKills = 0;

    this.input.attach();
    this._loop = this._loop.bind(this);
    this.animationId = requestAnimationFrame(this._loop);
    this._emit();
  }

  resize(width, height) {
    this.width = width;
    this.height = height;
    this.canvas.width = width;
    this.canvas.height = height;
    this.playBounds = getWorldBounds(width, height);
    if (this.player) {
      this.player.bounds = this.playBounds;
      this.player.originX = this.playBounds.originX;
      this.player.originY = this.playBounds.originY;
    }
  }

  destroy() {
    cancelAnimationFrame(this.animationId);
    this.input.detach();
  }

  _emit() {
    this.onStateChange({
      state: this.state,
      timeRemaining: this.timeRemaining,
      killCount: this.killCount,
      selectedPreset: this.selectedPreset,
      player: this.player,
      gameOverResult: this.gameOverResult,
    });
  }

  _loop(timestamp) {
    if (!this.lastTimestamp) this.lastTimestamp = timestamp;
    const dt = Math.min((timestamp - this.lastTimestamp) / 1000, 0.05);
    this.lastTimestamp = timestamp;
    this.update(dt);
    this.draw();
    this.animationId = requestAnimationFrame(this._loop);
  }

  selectCharacter(presetId) {
    const preset = CHARACTER_PRESETS[presetId];
    if (!preset) return;
    this.startGame(preset);
  }

  startGame(preset) {
    this.selectedPreset = preset;
    this.background.setCharacter(preset.id);
    this.playBounds = getWorldBounds(this.width, this.height);
    this.state = GameState.PLAYING;

    const midX = (this.playBounds.minX + this.playBounds.maxX) / 2;
    const midY = (this.playBounds.minY + this.playBounds.maxY) / 2;
    this.player = new Player(midX, midY, preset, this.playBounds);

    this.enemies = [];
    this.killCount = 0;
    this.timeRemaining = this.totalDuration;
    this.spawnTimer = 0.5;
    this.gameOverResult = null;
    this.vfx.effects = [];
    this._emit();
  }

  returnToStart() {
    this.state = GameState.START;
    this.player = null;
    this.enemies = [];
    this.killCount = 0;
    this.timeRemaining = this.totalDuration;
    this.gameOverResult = null;
    this._emit();
  }

  _getSpawnInterval() {
    const t = this.timeRemaining / this.totalDuration;
    return this.minSpawnInterval + (this.baseSpawnInterval - this.minSpawnInterval) * t;
  }

  update(dt) {
    if (this.state === GameState.PLAYING) {
      this._updatePlaying(dt);
    } else if (this.state === GameState.GAME_OVER) {
      if (this.input.consumeAttackPress() || this._anyMovement()) {
        this.returnToStart();
      }
    }
    this.vfx.update(dt);
  }

  _anyMovement() {
    const { dx, dy } = this.input.getMovementVector();
    return dx !== 0 || dy !== 0;
  }

  _updatePlaying(dt) {
    this.timeRemaining -= dt;
    if (this.timeRemaining <= 0) {
      this.timeRemaining = 0;
      this._endGame(true);
      return;
    }

    const attacked = this.player.update(dt, this.input);

    if (attacked) {
      const c = this.player.getAttackCenter
        ? this.player.getAttackCenter()
        : this.player.getCenter();
      if (this.player.preset.id === "pm") {
        this.vfx.spawnLotusArc(c.x, c.y, this.player.attackRadius, this.player.facing);
      } else {
        this.vfx.spawnHandSlap(c.x, c.y, this.player.attackRadius, this.player.facing);
      }

      for (let i = this.enemies.length - 1; i >= 0; i--) {
        if (this.enemies[i].isInAttackRadius(this.player)) {
          this.enemies.splice(i, 1);
          this.killCount++;
        }
      }
    }

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.enemies.push(new Enemy(this.player, this.playBounds));
      this.spawnTimer = this._getSpawnInterval();
    }

    for (const enemy of this.enemies) {
      enemy.update(dt);
      if (enemy.intersectsPlayer(this.player)) {
        this.player.takeDamage(enemy.damage * dt * 2.5);
      }
    }

    if (this.player.health <= 0) {
      this._endGame(false);
      return;
    }

    const sec = Math.ceil(this.timeRemaining);
    if (sec !== this._lastEmitSecond || this.killCount !== this._lastEmitKills) {
      this._lastEmitSecond = sec;
      this._lastEmitKills = this.killCount;
      this._emit();
    }
  }

  _endGame(won) {
    this.state = GameState.GAME_OVER;
    this.gameOverResult = won ? "win" : "loss";
    this._emit();
  }

  _collectDrawables() {
    const list = [];
    for (const e of this.enemies) {
      list.push({ depth: e.getDepth(), draw: (ctx) => e.draw(ctx) });
    }
    if (this.player) {
      list.push({
        depth: this.player.getDepth(),
        draw: (ctx) => this.player.draw(ctx),
      });
    }
    list.sort((a, b) => a.depth - b.depth);
    return list;
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);
    this.background.draw(ctx, this.width, this.height, this.selectedPreset?.id);

    if (this.state === GameState.PLAYING || this.state === GameState.GAME_OVER) {
      for (const item of this._collectDrawables()) {
        item.draw(ctx);
      }
      this.vfx.draw(ctx);
    }
  }
}
