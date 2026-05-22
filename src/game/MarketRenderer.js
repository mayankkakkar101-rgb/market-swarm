export class MarketRenderer {
  constructor() {
    this.bgImage = null;
    this.bgLoaded = false;
    const img = new Image();
    img.src = "/market-reference.png";
    img.onload = () => {
      this.bgImage = img;
      this.bgLoaded = true;
    };
  }

  getGroundY(canvasHeight) {
    return canvasHeight * 0.78;
  }

  draw(ctx, width, height) {
    if (this.bgLoaded && this.bgImage) {
      // Future: parallax layers with drawImage slices
      const img = this.bgImage;
      const scale = Math.max(width / img.width, height / img.height);
      const dw = img.width * scale;
      const dh = img.height * scale;
      const dx = (width - dw) / 2;
      const dy = (height - dh) * 0.05;
      ctx.drawImage(img, dx, dy, dw, dh);
      ctx.fillStyle = "rgba(255, 220, 160, 0.08)";
      ctx.fillRect(0, 0, width, height);
    } else {
      this._drawProceduralMarket(ctx, width, height);
    }

    const groundY = this.getGroundY(height);
    const grad = ctx.createLinearGradient(0, groundY - 40, 0, height);
    grad.addColorStop(0, "rgba(180, 130, 70, 0.0)");
    grad.addColorStop(0.3, "rgba(160, 110, 60, 0.35)");
    grad.addColorStop(1, "rgba(120, 80, 40, 0.55)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, groundY - 20, width, height - groundY + 20);

    ctx.strokeStyle = "rgba(90, 55, 25, 0.4)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(width, groundY);
    ctx.stroke();
  }

  _drawProceduralMarket(ctx, width, height) {
    const sky = ctx.createLinearGradient(0, 0, 0, height * 0.5);
    sky.addColorStop(0, "#4fc3f7");
    sky.addColorStop(1, "#81d4fa");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height * 0.55);

    ctx.fillStyle = "#c9a66b";
    for (let i = 0; i < 5; i++) {
      const bx = i * (width / 4) - 20;
      ctx.fillRect(bx, height * 0.22, width / 4 + 40, height * 0.28);
      ctx.fillStyle = "#8d6e4c";
      ctx.fillRect(bx + 20, height * 0.32, 50, 60);
      ctx.fillStyle = "#c9a66b";
    }

    for (let s = 0; s < 4; s++) {
      const sx = 40 + s * 220;
      const sy = height * 0.38;
      ctx.fillStyle = "#6d4c2f";
      ctx.fillRect(sx, sy, 120, 70);
      ctx.fillStyle = ["#e53935", "#ff9800", "#ffeb3b", "#795548"][s % 4];
      ctx.fillRect(sx + 10, sy - 18, 100, 20);
      ctx.fillStyle = "#4e342e";
      ctx.fillRect(sx + 15, sy + 10, 35, 25);
      ctx.fillRect(sx + 55, sy + 10, 35, 25);
    }

    ctx.fillStyle = "#388e3c";
    ctx.fillRect(width * 0.35, height * 0.48, 90, 50);
    ctx.fillRect(width * 0.55, height * 0.5, 90, 45);
    ctx.fillStyle = "#ffeb3b";
    ctx.fillRect(width * 0.36, height * 0.46, 88, 18);
    ctx.fillRect(width * 0.56, height * 0.48, 88, 16);
  }
}
