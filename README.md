# Market Swarm

Professional **2:1 isometric** survival arena in an Indian bazaar. Survive 60 seconds against swarming cockroaches.

## Run

```bash
cd ~/Projects/market-swarm
npm install
npm run dev
```

Open **http://localhost:5173/** (hard-refresh after asset updates: `Cmd+Shift+R`).

## Characters

| Hero | Arena | Attack |
|------|-------|--------|
| **Mitrooo** | Isometric market | Lotus AoE |
| **PAPPU** | Isometric barren wasteland | Big hand slap |

Hero select shows **face portrait + name only** (not sprite sheets).

## Assets (`public/assets/`)

| File | Purpose |
|------|---------|
| `bg-market.png` | Isometric market background |
| `bg-barren.png` | Isometric barren background |
| `pm-spritesheet.png` | Mitrooo isometric animation (6 frames) |
| `pappu-spritesheet.png` | PAPPU isometric animation (6 frames) |
| `cockroach-spritesheet.png` | Small roach crawl (8 frames) |
| `pm-portrait.png` | Mitrooo select-screen face |
| `pappu-portrait.png` | PAPPU select-screen face |

## Tech

- React UI + Canvas game loop
- ES6 classes: `Game`, `Player`, `Enemy`, `IsoMath`, `SpriteSheet`
- Depth sorting by isometric `wx + wy`
- Chroma-key removes white/teal from sprites at runtime
