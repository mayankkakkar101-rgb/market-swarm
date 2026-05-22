# Market Swarm Asset Guide

Use this guide when creating or cleaning production game assets.

## Sprite Sheet Format

All gameplay sprites should use a fixed directional grid:

| Asset | File | Cell Size | Grid | Final PNG Size |
| --- | --- | --- | --- | --- |
| Mitrooo hero source | `public/assets/pm-directional.png` | source sheet | `4 cols x 4 rows` | `1024x682` |
| PAPPU hero source | `public/assets/pappu-directional.png` | source sheet | `4 cols x 4 rows` | `1024x682` |
| Mitrooo hero runtime | `public/assets/pm-directional-normalized.png` | `256x256` | `4 cols x 4 rows` | `1024x1024` |
| PAPPU hero runtime | `public/assets/pappu-directional-normalized.png` | `256x256` | `4 cols x 4 rows` | `1024x1024` |
| Cockroach | `public/assets/cockroach-directional.png` | `256x256` | `6 cols x 4 rows` | `1536x1024` |

## Direction Rows

Rows must stay in this exact order:

1. Row 0: southeast
2. Row 1: southwest
3. Row 2: northwest
4. Row 3: northeast

Columns are walk-cycle frames:

1. Column 0: idle / step A
2. Column 1: walk step B
3. Column 2: walk step C
4. Column 3: attack / strong pose

The game also saves individual normalized hero frames:

- `public/assets/sprites/pm/se-0.png` ... `ne-3.png`
- `public/assets/sprites/pappu/se-0.png` ... `ne-3.png`

For Mitrooo, the runtime sheet is currently rebuilt from hand-cleaned individual frame PNGs in
`public/assets/sprites/pm/`, not by slicing the old source sheet directly.

## Transparency Rules

Best option: export PNGs with a real alpha channel.

Do not save a visible checkerboard into the image. Checkerboard should only be the editor preview, not actual pixels.

Acceptable fallback: use a solid magenta background (`#FF00FF`). The game strips magenta, white, teal, and checkerboard-like pixels at runtime, but real alpha gives the best quality.

## Character Design Notes

Mitrooo:

- White kurta pajama
- Blue Nehru vest
- White hair and beard
- Glasses
- Pink lotus staff / lotus AoE attack

PAPPU:

- White kurta pajama
- Dark hair and beard
- No boxing gloves
- Oversized hands
- Big-hand slap AoE attack

Cockroaches:

- Much smaller than the heroes
- Brown body
- Clear antennae and legs
- Four directional rows so movement looks natural

## Portraits

Character select uses portrait-only files:

| Hero | File | Recommended Size |
| --- | --- | --- |
| Mitrooo | `public/assets/pm-portrait.png` | `256x256` |
| PAPPU | `public/assets/pappu-portrait.png` | `256x256` |

Portraits should show the face/bust only, not the full sprite sheet.

## Manual Cleanup Workflow

Recommended tools:

- Photopea
- GIMP
- Photoshop
- Aseprite

Steps:

1. Open the generated sprite sheet.
2. Remove the background so transparent areas show as editor transparency.
3. Confirm each frame fits exactly inside its cell.
4. Keep feet aligned near the lower center of each cell.
5. Export as PNG with transparency enabled.
6. Replace the matching file in `public/assets/`.
7. Hard-refresh the browser with `Cmd+Shift+R`.

## Testing In Game

Run:

```bash
npm run dev
```

Open:

```text
http://localhost:5173/
```

Check:

- No white or checkerboard boxes around sprites
- Heroes appear grounded on the isometric terrain
- Cockroaches are small compared to heroes
- Walking direction changes correctly
- Shadows are subtle and do not create large blobs

