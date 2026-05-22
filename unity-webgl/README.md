# Market Swarm Unity WebGL Port

This folder contains the Unity C# source for a polished Unity WebGL version of Market Swarm.

Unity is not installed in this environment, so this folder is a Unity-ready source package rather than a built WebGL export.

## Recommended Unity Version

Use:

- Unity 2022.3 LTS or newer
- WebGL Build Support module
- TextMeshPro package

## Project Setup

1. Open Unity Hub.
2. Create a new **2D URP** or **2D Core** project named `MarketSwarmUnity`.
3. Copy this folder's `Assets/Scripts` into the Unity project's `Assets/Scripts`.
4. Copy game sprites/backgrounds from the web project:

```text
../public/assets/bg-market.png
../public/assets/bg-barren.png
../public/assets/pm-directional-normalized.png
../public/assets/pappu-directional-normalized.png
../public/assets/cockroach-directional.png
../public/assets/pm-portrait.png
../public/assets/pappu-portrait.png
```

Recommended Unity import settings for sprites:

- Texture Type: `Sprite (2D and UI)`
- Sprite Mode:
  - directional sheets: `Multiple`
  - portraits/backgrounds: `Single`
- Filter Mode: `Bilinear`
- Compression: `None` or `High Quality`
- Pixels Per Unit: choose consistently, usually `100`

## Scene Objects

Create a scene named `MarketSwarm`.

Required objects:

### GameManager

Add an empty object named `GameManager` and attach:

- `GameManager`

Assign:

- `Player Prefab`
- `Player Spawn`
- `Enemy Spawner`
- `HUD`
- `Character Select UI`
- `Game Over Panel`
- `PM Character`
- `Pappu Character`

### Arena

Create:

- `ArenaBounds` with `BoxCollider2D`
- background sprite object using either market or barren background

### Player Prefab

Create a prefab with:

- `Rigidbody2D`
- `CapsuleCollider2D`
- `SpriteRenderer`
- `Animator`
- `PlayerController`
- `IsometricDepthSorter`

Set `Rigidbody2D`:

- Gravity Scale: `0`
- Freeze Rotation: `true`

### Enemy Prefab

Create a prefab with:

- `Rigidbody2D`
- `CircleCollider2D`
- `SpriteRenderer`
- `Animator`
- `EnemyController`
- `IsometricDepthSorter`

Put it on an `Enemy` layer so the player's attack layer mask can hit it.

### EnemySpawner

Create an empty object with:

- `EnemySpawner`

Assign:

- `Enemy Prefab`
- `Arena Bounds`

### Attack VFX

Create a child object on the player prefab:

- `AttackVfx`
- child `SpriteRenderer` with a soft circular ring/sprite

Assign it to `PlayerController.attackVfx`.

## Character Definitions

Create two ScriptableObjects:

```text
Assets/Create/Market Swarm/Character Definition
```

PM:

- ID: `PM`
- Display Name: `PM`
- Weapon Name: `Lotus`
- Attack Radius: around `1.6`
- Attack Cooldown: `0.5`
- Attack Color: pink

PAPPU:

- ID: `Pappu`
- Display Name: `PAPPU`
- Weapon Name: `Big Hand`
- Attack Radius: around `1.45`
- Attack Cooldown: `0.32`
- Attack Color: warm orange

## Animations

For each directional sheet, slice sprites into rows:

- Row 0: southeast
- Row 1: southwest
- Row 2: northwest
- Row 3: northeast

Create animator parameters:

```text
MoveX float
MoveY float
Speed float
```

Create blend trees or state transitions based on `MoveX`, `MoveY`, and `Speed`.

## WebGL Build

In Unity:

1. File -> Build Settings
2. Select `WebGL`
3. Switch Platform
4. Player Settings:
   - Compression Format: `Brotli` or `Gzip`
   - Decompression Fallback: enabled if hosting cannot set headers
   - Resolution: `1280x720`
5. Build to:

```text
Builds/WebGL
```

## Local Test

Unity WebGL builds must be served through a web server.

From the build output folder:

```bash
python3 -m http.server 8080
```

Open:

```text
http://localhost:8080
```

## Publish Options

Use one of these:

- itch.io: easiest for Unity WebGL games
- Netlify Drop: drag-and-drop the WebGL build folder
- Vercel: good for static hosting
- GitHub Pages: good if the repo is public

This environment currently does not have Unity, `gh`, `vercel`, `netlify`, or `firebase` CLI installed, so it cannot publish a Unity WebGL build directly.

