import { CharacterSpriteAnimator } from "./CharacterSpriteAnimator.js";
import { assetUrl } from "./assets.js";

const pm = new CharacterSpriteAnimator(
  assetUrl("/assets/pm-directional-normalized.png"),
  0.62,
  "pm"
);
const pappu = new CharacterSpriteAnimator(
  assetUrl("/assets/pappu-directional-normalized.png"),
  0.62,
  "pappu"
);

const ANIMATORS = { pm, pappu };

export function drawPlayerSprite(ctx, player) {
  const animator = ANIMATORS[player.preset.id];
  if (!animator) return false;
  return animator.draw(ctx, player);
}
