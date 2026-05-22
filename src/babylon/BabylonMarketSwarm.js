import {
  ArcRotateCamera,
  Color3,
  Color4,
  DirectionalLight,
  Engine,
  HemisphericLight,
  Layer,
  MeshBuilder,
  Scene,
  ShadowGenerator,
  Sprite,
  SpriteManager,
  StandardMaterial,
  TransformNode,
  Vector3,
} from "@babylonjs/core";
import { CHARACTER_PRESETS } from "../game/characters.js";
import { assetUrl } from "../game/assets.js";

const GameState = {
  START: "START",
  PLAYING: "PLAYING",
  GAME_OVER: "GAME_OVER",
};

const WORLD = {
  minX: -5.6,
  maxX: 5.6,
  minZ: -2.9,
  maxZ: 2.9,
};

const SPRITE_COLS = 4;
const ATTACK_ANIM_SECONDS = 0.45;
const DIR = { SE: 0, SW: 1, NW: 2, NE: 3 };

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function dirFromMove(dx, dz, fallback = DIR.SE) {
  if (Math.abs(dx) + Math.abs(dz) < 0.001) return fallback;
  if (dx >= 0 && dz >= 0) return DIR.SE;
  if (dx < 0 && dz >= 0) return DIR.SW;
  if (dx < 0 && dz < 0) return DIR.NW;
  return DIR.NE;
}

function makeMat(scene, name, color, rough = 0.85) {
  const mat = new StandardMaterial(name, scene);
  mat.diffuseColor = color;
  mat.specularColor = Color3.Black();
  mat.roughness = rough;
  return mat;
}

export class BabylonMarketSwarm {
  constructor(canvas, onStateChange, onArenaChange) {
    this.canvas = canvas;
    this.onStateChange = onStateChange;
    this.onArenaChange = onArenaChange;
    this.engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      antialias: true,
      alpha: true,
      premultipliedAlpha: false,
    });
    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(0, 0, 0, 0);

    this.state = GameState.START;
    this.selectedPreset = null;
    this.player = null;
    this.enemies = [];
    this.killCount = 0;
    this.timeRemaining = 60;
    this.gameOverResult = null;
    this.audioContext = null;
    this.keys = new Set();
    this.virtualMove = { dx: 0, dz: 0 };
    this.spawnTimer = 0.4;
    this.spriteManagers = {};
    this.backgroundLayer = null;
    this.worldRoot = new TransformNode("worldRoot", this.scene);

    this._initCameraAndLights();
    this._initInput();
    this._buildStartScene();
    this._emit();

    this.engine.runRenderLoop(() => {
      const dt = Math.min(this.engine.getDeltaTime() / 1000, 0.05);
      this.update(dt);
      this.scene.render();
    });

    window.addEventListener("resize", this._resize);
  }

  _resize = () => this.engine.resize();

  destroy() {
    window.removeEventListener("resize", this._resize);
    window.removeEventListener("keydown", this._onKeyDown);
    window.removeEventListener("keyup", this._onKeyUp);
    this.engine.dispose();
  }

  setVirtualMovement(dx, dz) {
    this.virtualMove = { dx, dz };
  }

  pressVirtualAttack() {
    if (this.state === GameState.PLAYING) {
      this.tryAttack();
    } else if (this.state === GameState.GAME_OVER) {
      this.returnToStart();
    }
  }

  _initCameraAndLights() {
    const camera = new ArcRotateCamera(
      "camera",
      -Math.PI / 4,
      Math.PI / 3.15,
      13,
      new Vector3(0, 0, 0),
      this.scene
    );
    camera.mode = ArcRotateCamera.ORTHOGRAPHIC_CAMERA;
    camera.orthoLeft = -8.2;
    camera.orthoRight = 8.2;
    camera.orthoTop = 4.6;
    camera.orthoBottom = -4.6;
    camera.lowerRadiusLimit = 13;
    camera.upperRadiusLimit = 13;
    camera.inputs.clear();
    this.scene.activeCamera = camera;
    this.camera = camera;

    const hemi = new HemisphericLight("hemi", new Vector3(0, 1, 0), this.scene);
    hemi.intensity = 0.9;
    hemi.groundColor = new Color3(0.45, 0.32, 0.22);

    const sun = new DirectionalLight("sun", new Vector3(-0.45, -1, -0.35), this.scene);
    sun.position = new Vector3(5, 9, 5);
    sun.intensity = 1.15;
    this.shadowGenerator = new ShadowGenerator(2048, sun);
    this.shadowGenerator.useBlurExponentialShadowMap = true;
    this.shadowGenerator.blurKernel = 18;
  }

  _initInput() {
    this._onKeyDown = (event) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(event.code)) {
        event.preventDefault();
      }
      this.keys.add(event.code);
      if (event.code === "Space" && this.state === GameState.PLAYING) {
        this.tryAttack();
      } else if (this.state === GameState.GAME_OVER) {
        this.returnToStart();
      }
    };

    this._onKeyUp = (event) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"].includes(event.code)) {
        event.preventDefault();
      }
      this.keys.delete(event.code);
    };

    window.addEventListener("keydown", this._onKeyDown);
    window.addEventListener("keyup", this._onKeyUp);
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

  _clearWorld() {
    this.player?.sprite?.dispose();
    this.player?.attackSprite?.dispose();
    this.enemies.forEach((enemy) => enemy.root.dispose());
    this.worldRoot.getChildren().forEach((child) => child.dispose());
    this.enemies = [];
    this.player = null;
  }

  _buildStartScene() {
    this._clearWorld();
    this._buildArena("pm");
  }

  _buildArena(characterId) {
    const isMarket = characterId === "pm";
    const texturePath = isMarket
      ? assetUrl("/assets/bg-market-isometric.png")
      : assetUrl("/assets/bg-barren-isometric.png");
    this.onArenaChange?.(texturePath);
    this.backgroundLayer?.dispose();
    this.backgroundLayer = new Layer("arenaBackdrop", texturePath, this.scene, true);
  }

  _addArenaDepthAccents(isMarket) {
    const edgeColor = isMarket ? new Color3(0.54, 0.34, 0.2) : new Color3(0.31, 0.25, 0.2);
    const edgeMat = makeMat(this.scene, "edgeDepthMat", edgeColor);
    const accents = [
      [0, 3.18, 11.6, 0.16, 0.12],
      [0, -3.18, 11.6, 0.16, 0.08],
      [-5.98, 0, 0.16, 6.1, 0.08],
      [5.98, 0, 0.16, 6.1, 0.08],
    ];

    accents.forEach(([x, z, width, depth, height], index) => {
      const edge = MeshBuilder.CreateBox(`arenaEdge${index}`, { width, depth, height }, this.scene);
      edge.position.set(x, height / 2, z);
      edge.material = edgeMat;
      edge.parent = this.worldRoot;
      edge.receiveShadows = true;
      this.shadowGenerator.addShadowCaster(edge);
    });
  }

  selectCharacter(presetId) {
    const preset = CHARACTER_PRESETS[presetId];
    if (!preset) return;

    this._clearWorld();
    this._buildArena(presetId);

    this.selectedPreset = preset;
    this.state = GameState.PLAYING;
    this.killCount = 0;
    this.timeRemaining = 60;
    this.gameOverResult = null;
    this.spawnTimer = 0.3;
    this.player = this._createPlayer(preset);
    this._emit();
  }

  _getSpriteManager(id) {
    if (this.spriteManagers[id]) return this.spriteManagers[id];
    const url = id === "pm"
      ? assetUrl("/assets/pm-directional-normalized.png")
      : assetUrl("/assets/pappu-directional-normalized.png");
    const manager = new SpriteManager(`${id}Sprites`, url, 64, {
      width: 256,
      height: 256,
    }, this.scene);
    this.spriteManagers[id] = manager;
    return manager;
  }

  _getAttackSpriteManager(id) {
    const key = `${id}-attack`;
    if (this.spriteManagers[key]) return this.spriteManagers[key];
    const url = id === "pm"
      ? assetUrl("/assets/pm-attack-directional.png")
      : assetUrl("/assets/pappu-directional-normalized.png");
    const manager = new SpriteManager(`${id}AttackSprites`, url, 64, {
      width: 256,
      height: 256,
    }, this.scene);
    this.spriteManagers[key] = manager;
    return manager;
  }

  _createPlayer(preset) {
    const sprite = new Sprite("playerSprite", this._getSpriteManager(preset.id));
    sprite.width = 1.65;
    sprite.height = 1.65;
    sprite.position = new Vector3(0, 0.84, 0);
    sprite.cellIndex = 0;

    const attackSprite = preset.id === "pm"
      ? new Sprite("playerAttackSprite", this._getAttackSpriteManager(preset.id))
      : null;
    if (attackSprite) {
      attackSprite.width = 2.05;
      attackSprite.height = 2.05;
      attackSprite.position = new Vector3(0, 1.02, 0);
      attackSprite.cellIndex = 0;
      attackSprite.isVisible = false;
    }

    return {
      id: preset.id,
      preset,
      sprite,
      attackSprite,
      position: new Vector3(0, 0, 0),
      health: 100,
      maxHealth: 100,
      stamina: preset.maxStamina,
      maxStamina: preset.maxStamina,
      attackCooldown: 0,
      attackTimer: 0,
      animPhase: 0,
      dirRow: DIR.SE,
      isMoving: false,
    };
  }

  _createRoach(position) {
    const root = new TransformNode("roachRoot", this.scene);
    root.position = position.clone();
    root.parent = this.worldRoot;

    const bodyMat = makeMat(this.scene, "roachBody", new Color3(0.18, 0.08, 0.035));
    const shellMat = makeMat(this.scene, "roachShell", new Color3(0.42, 0.2, 0.08));
    const headMat = makeMat(this.scene, "roachHead", new Color3(0.12, 0.055, 0.025));
    const legMat = makeMat(this.scene, "roachLegs", new Color3(0.08, 0.035, 0.015));

    const abdomen = MeshBuilder.CreateSphere("roachAbdomen", {
      diameterX: 0.38,
      diameterY: 0.12,
      diameterZ: 0.62,
      segments: 12,
    }, this.scene);
    abdomen.position.y = 0.13;
    abdomen.material = bodyMat;
    abdomen.parent = root;

    const shell = MeshBuilder.CreateSphere("roachShell", {
      diameterX: 0.32,
      diameterY: 0.09,
      diameterZ: 0.46,
      segments: 12,
    }, this.scene);
    shell.position.set(0, 0.19, -0.04);
    shell.material = shellMat;
    shell.parent = root;

    const head = MeshBuilder.CreateSphere("roachHead", {
      diameterX: 0.26,
      diameterY: 0.1,
      diameterZ: 0.18,
      segments: 10,
    }, this.scene);
    head.position.set(0, 0.13, 0.36);
    head.material = headMat;
    head.parent = root;

    const stripe = MeshBuilder.CreateBox("roachBackStripe", {
      width: 0.035,
      height: 0.012,
      depth: 0.42,
    }, this.scene);
    stripe.position.set(0, 0.245, -0.05);
    stripe.material = legMat;
    stripe.parent = root;

    const legs = [];
    const legRows = [
      { z: 0.2, angle: 0.45 },
      { z: 0.02, angle: 0.08 },
      { z: -0.18, angle: -0.38 },
    ];

    legRows.forEach((row, rowIndex) => {
      [-1, 1].forEach((side) => {
        const leg = MeshBuilder.CreateBox(`roachLeg${rowIndex}${side}`, {
          width: 0.52,
          height: 0.026,
          depth: 0.046,
        }, this.scene);
        leg.position.set(side * 0.31, 0.07, row.z);
        leg.rotation.y = side * row.angle;
        leg.material = legMat;
        leg.parent = root;
        legs.push({
          mesh: leg,
          baseRotation: leg.rotation.y,
          side,
          phase: rowIndex * 1.35 + (side > 0 ? Math.PI : 0),
        });
      });
    });

    [-1, 1].forEach((side) => {
      const antenna = MeshBuilder.CreateBox(`roachAntenna${side}`, {
        width: 0.34,
        height: 0.015,
        depth: 0.02,
      }, this.scene);
      antenna.position.set(side * 0.18, 0.16, 0.47);
      antenna.rotation.y = side * 0.7;
      antenna.material = legMat;
      antenna.parent = root;
    });

    this.shadowGenerator.addShadowCaster(abdomen);
    this.shadowGenerator.addShadowCaster(shell);
    this.shadowGenerator.addShadowCaster(head);

    const leader = Math.random() < 0.08;
    const scale = leader ? 1.35 : 1;
    root.scaling.setAll(scale);

    const enemy = {
      root,
      position: root.position,
      speed: leader ? 1.25 : 1.8 + Math.random() * 0.35,
      radius: leader ? 0.55 : 0.42,
      damage: leader ? 18 : 12,
      leader,
      legs,
      walkPhase: Math.random() * Math.PI * 2,
    };
    this.enemies.push(enemy);
    return enemy;
  }

  update(dt) {
    if (this.state !== GameState.PLAYING) return;

    this.timeRemaining -= dt;
    if (this.timeRemaining <= 0) {
      this.timeRemaining = 0;
      this.endGame(true);
      return;
    }

    this._updatePlayer(dt);
    this._updateEnemies(dt);
    this._updateSpawner(dt);
    this._emit();
  }

  _movementVector() {
    let dx = 0;
    let dz = 0;
    if (this.keys.has("KeyA") || this.keys.has("ArrowLeft")) dx -= 1;
    if (this.keys.has("KeyD") || this.keys.has("ArrowRight")) dx += 1;
    if (this.keys.has("KeyW") || this.keys.has("ArrowUp")) dz += 1;
    if (this.keys.has("KeyS") || this.keys.has("ArrowDown")) dz -= 1;
    dx += this.virtualMove.dx;
    dz += this.virtualMove.dz;
    const len = Math.hypot(dx, dz);
    if (len > 1) {
      dx /= len;
      dz /= len;
    }
    return { dx, dz };
  }

  _updatePlayer(dt) {
    const player = this.player;
    if (!player) return;

    const { dx, dz } = this._movementVector();
    player.isMoving = Math.abs(dx) + Math.abs(dz) > 0.01;
    if (player.isMoving) {
      player.dirRow = dirFromMove(dx, dz, player.dirRow);
      player.position.x = clamp(player.position.x + dx * 4.2 * dt, WORLD.minX, WORLD.maxX);
      player.position.z = clamp(player.position.z + dz * 4.2 * dt, WORLD.minZ, WORLD.maxZ);
      player.animPhase += dt * 7.5;
    }

    player.attackCooldown = Math.max(0, player.attackCooldown - dt);
    player.attackTimer = Math.max(0, player.attackTimer - dt);
    player.stamina = Math.min(player.maxStamina, player.stamina + 42 * dt);
    player.sprite.position.x = player.position.x;
    player.sprite.position.z = player.position.z;
    if (player.attackSprite) {
      player.attackSprite.position.x = player.position.x;
      player.attackSprite.position.z = player.position.z;
    }

    const frame = player.isMoving ? Math.floor(player.animPhase) % SPRITE_COLS : 0;
    const isAttacking = player.attackTimer > 0 && player.attackSprite;
    if (isAttacking) {
      const attackProgress = 1 - player.attackTimer / ATTACK_ANIM_SECONDS;
      const attackFrame = clamp(Math.floor(attackProgress * SPRITE_COLS), 0, SPRITE_COLS - 1);
      player.attackSprite.cellIndex = player.dirRow * SPRITE_COLS + attackFrame;
      player.attackSprite.isVisible = true;
      player.sprite.isVisible = false;
    } else {
      player.sprite.cellIndex = player.dirRow * SPRITE_COLS + frame;
      player.sprite.isVisible = true;
      if (player.attackSprite) player.attackSprite.isVisible = false;
    }
  }

  _updateEnemies(dt) {
    const player = this.player;
    if (!player) return;

    for (const enemy of this.enemies) {
      const dx = player.position.x - enemy.position.x;
      const dz = player.position.z - enemy.position.z;
      const dist = Math.hypot(dx, dz) || 0.001;
      enemy.position.x += (dx / dist) * enemy.speed * dt;
      enemy.position.z += (dz / dist) * enemy.speed * dt;
      enemy.root.rotation.y = Math.atan2(dx, dz);
      enemy.walkPhase += dt * enemy.speed * 9;
      enemy.legs.forEach((leg) => {
        const swing = Math.sin(enemy.walkPhase + leg.phase) * 0.32;
        const lift = Math.max(0, Math.sin(enemy.walkPhase + leg.phase)) * 0.025;
        leg.mesh.rotation.y = leg.baseRotation + swing * leg.side;
        leg.mesh.position.y = 0.065 + lift;
      });

      if (dist < enemy.radius + 0.45) {
        player.health = Math.max(0, player.health - enemy.damage * dt);
        if (player.health <= 0) {
          this.endGame(false);
          return;
        }
      }
    }
  }

  _updateSpawner(dt) {
    this.spawnTimer -= dt;
    if (this.spawnTimer > 0) return;

    const t = this.timeRemaining / 60;
    this.spawnTimer = 0.22 + (1.25 - 0.22) * t;
    const side = Math.floor(Math.random() * 4);
    let x = 0;
    let z = 0;
    if (side === 0) {
      x = WORLD.minX + Math.random() * (WORLD.maxX - WORLD.minX);
      z = WORLD.maxZ + 0.9;
    } else if (side === 1) {
      x = WORLD.maxX + 0.9;
      z = WORLD.minZ + Math.random() * (WORLD.maxZ - WORLD.minZ);
    } else if (side === 2) {
      x = WORLD.minX + Math.random() * (WORLD.maxX - WORLD.minX);
      z = WORLD.minZ - 0.9;
    } else {
      x = WORLD.minX - 0.9;
      z = WORLD.minZ + Math.random() * (WORLD.maxZ - WORLD.minZ);
    }
    this._createRoach(new Vector3(x, 0, z));
  }

  tryAttack() {
    const player = this.player;
    if (!player || player.attackCooldown > 0 || player.stamina < 25) return;
    player.attackCooldown = player.preset.attackCooldown;
    player.attackTimer = ATTACK_ANIM_SECONDS;
    player.stamina = Math.max(0, player.stamina - 25);
    this._playSmashSound();

    const radius = player.preset.id === "pm" ? 1.65 : 1.45;
    const color = player.preset.id === "pm" ? new Color3(1, 0.2, 0.65) : new Color3(1, 0.65, 0.35);
    this._attackVfx(player.position, radius, color);

    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      const dist = Math.hypot(enemy.position.x - player.position.x, enemy.position.z - player.position.z);
      if (dist <= radius + enemy.radius) {
        enemy.root.dispose();
        this.enemies.splice(i, 1);
        this.killCount += 1;
      }
    }
  }

  _playSmashSound() {
    const AudioCtor = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtor) return;
    if (!this.audioContext) this.audioContext = new AudioCtor();
    const ctx = this.audioContext;
    if (ctx.state === "suspended") ctx.resume();

    const now = ctx.currentTime;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.7, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    gain.connect(ctx.destination);

    const thump = ctx.createOscillator();
    thump.type = "triangle";
    thump.frequency.setValueAtTime(110, now);
    thump.frequency.exponentialRampToValueAtTime(45, now + 0.18);
    thump.connect(gain);
    thump.start(now);
    thump.stop(now + 0.2);

    const sampleRate = ctx.sampleRate;
    const buffer = ctx.createBuffer(1, sampleRate * 0.16, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const envelope = 1 - i / data.length;
      data[i] = (Math.random() * 2 - 1) * envelope * envelope;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(950, now);
    filter.frequency.exponentialRampToValueAtTime(180, now + 0.14);
    noise.connect(filter).connect(gain);
    noise.start(now);
    noise.stop(now + 0.16);
  }

  _attackVfx(position, radius, color) {
    const ring = MeshBuilder.CreateTorus("attackRing", {
      majorRadius: radius,
      minorRadius: 0.035,
      tessellation: 72,
    }, this.scene);
    ring.position.set(position.x, 0.08, position.z);
    ring.rotation.x = Math.PI / 2;
    const mat = makeMat(this.scene, "attackRingMat", color);
    mat.emissiveColor = color;
    ring.material = mat;

    let life = 0.18;
    const observer = this.scene.onBeforeRenderObservable.add(() => {
      const dt = this.engine.getDeltaTime() / 1000;
      life -= dt;
      ring.scaling.addInPlace(new Vector3(dt * 1.5, dt * 1.5, dt * 1.5));
      mat.alpha = Math.max(0, life / 0.18);
      if (life <= 0) {
        this.scene.onBeforeRenderObservable.remove(observer);
        ring.dispose();
      }
    });
  }

  endGame(won) {
    this.state = GameState.GAME_OVER;
    this.gameOverResult = won ? "win" : "loss";
    this._emit();
  }

  returnToStart() {
    this.state = GameState.START;
    this.selectedPreset = null;
    this.killCount = 0;
    this.timeRemaining = 60;
    this.gameOverResult = null;
    this._buildStartScene();
    this._emit();
  }
}
