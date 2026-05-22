import { assetUrl } from "./assets.js";

const BACKGROUNDS = {
  pm: assetUrl("/assets/bg-market.png"),
  pappu: assetUrl("/assets/bg-barren.png"),
};

export class BackgroundRenderer {
  constructor() {
    this.images = {};
    this.activeId = null;
    for (const [id, src] of Object.entries(BACKGROUNDS)) {
      const img = new Image();
      img.src = src;
      this.images[id] = { img, loaded: false };
      img.onload = () => {
        this.images[id].loaded = true;
      };
    }
  }

  setCharacter(characterId) {
    this.activeId = characterId;
  }

  draw(ctx, width, height, characterId) {
    const id = characterId || this.activeId || "pm";
    const entry = this.images[id];

    if (entry?.loaded) {
      const img = entry.img;
      const scale = Math.max(width / img.width, height / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      ctx.drawImage(img, (width - dw) / 2, (height - dh) / 2, dw, dh);
    } else {
      ctx.fillStyle = id === "pappu" ? "#a1887f" : "#c4a574";
      ctx.fillRect(0, 0, width, height);
    }
  }
}
