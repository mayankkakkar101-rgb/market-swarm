export class VFX {
  constructor() {
    this.effects = [];
  }

  spawnLotusArc(x, y, radius, facing) {
    for (let i = 0; i < 6; i++) {
      this.effects.push({
        type: "arc",
        x,
        y,
        radius,
        facing,
        life: 0.22,
        maxLife: 0.22,
        offset: (i / 6) * Math.PI * 2,
      });
    }
    for (let i = 0; i < 8; i++) {
      this.effects.push({
        type: "spark",
        x: x + (Math.random() - 0.5) * radius,
        y: y + (Math.random() - 0.5) * radius * 0.5,
        vx: (Math.random() - 0.5) * 120,
        vy: (Math.random() - 0.5) * 80,
        life: 0.35,
        maxLife: 0.35,
      });
    }
  }

  spawnHandSlap(x, y, radius, facing) {
    this.effects.push({
      type: "handRing",
      x,
      y,
      radius,
      facing,
      life: 0.28,
      maxLife: 0.28,
    });
    for (let i = 0; i < 6; i++) {
      this.effects.push({
        type: "spark",
        x: x + facing * (30 + i * 8),
        y: y + (Math.random() - 0.5) * radius * 0.5,
        vx: facing * (60 + Math.random() * 80),
        vy: (Math.random() - 0.5) * 60,
        life: 0.3,
        maxLife: 0.3,
      });
    }
  }

  spawnPunchImpact(x, y, facing) {
    const texts = ["BAM!", "POW!", "WHAM!"];
    this.effects.push({
      type: "comic",
      text: texts[Math.floor(Math.random() * texts.length)],
      x: x + facing * 40,
      y: y - 50,
      facing,
      life: 0.55,
      maxLife: 0.55,
      scale: 0.6,
    });
    for (let i = 0; i < 10; i++) {
      const angle = (Math.random() * 0.8 + 0.1) * Math.PI * facing;
      this.effects.push({
        type: "burst",
        x: x + facing * 28,
        y: y - 18,
        vx: Math.cos(angle) * (80 + Math.random() * 100),
        vy: Math.sin(angle) * (60 + Math.random() * 60) - 40,
        life: 0.4,
        maxLife: 0.4,
        size: 4 + Math.random() * 8,
      });
    }
  }

  update(dt) {
    for (let i = this.effects.length - 1; i >= 0; i--) {
      const e = this.effects[i];
      e.life -= dt;
      if (e.vx !== undefined) {
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        e.vy += 180 * dt;
      }
      if (e.type === "comic") {
        e.scale = Math.min(1.2, e.scale + dt * 2.5);
      }
      if (e.life <= 0) this.effects.splice(i, 1);
    }
  }

  draw(ctx) {
    for (const e of this.effects) {
      const t = 1 - e.life / e.maxLife;
      ctx.save();
      if (e.type === "arc") {
        const alpha = 1 - t;
        ctx.globalAlpha = alpha * 0.9;
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 4;
        ctx.shadowColor = "#ff69b4";
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(
          e.x,
          e.y - 10,
          e.radius * (0.7 + t * 0.35),
          e.offset + t * 0.8 * e.facing,
          e.offset + Math.PI * 0.9 * e.facing + t * 0.8 * e.facing
        );
        ctx.stroke();
      } else if (e.type === "spark") {
        ctx.globalAlpha = 1 - t;
        ctx.fillStyle = "#fffde7";
        ctx.beginPath();
        ctx.arc(e.x, e.y, 3 * (1 - t), 0, Math.PI * 2);
        ctx.fill();
      } else if (e.type === "comic") {
        ctx.globalAlpha = 1 - t * 0.85;
        ctx.translate(e.x, e.y);
        ctx.scale(e.scale, e.scale);
        ctx.font = "bold 28px Bangers, cursive";
        ctx.textAlign = "center";
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#000";
        ctx.fillStyle = "#ffeb3b";
        ctx.strokeText(e.text, 0, 0);
        ctx.fillText(e.text, 0, 0);
        ctx.fillStyle = "#ff5722";
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          const r = i % 2 === 0 ? 22 : 14;
          const px = Math.cos(a) * r;
          const py = Math.sin(a) * r + 18;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
      } else if (e.type === "handRing") {
        ctx.globalAlpha = (1 - t) * 0.55;
        ctx.strokeStyle = "#ffccbc";
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.radius * (0.5 + t * 0.5), 0, Math.PI * 2);
        ctx.stroke();
        ctx.fillStyle = "rgba(255, 200, 150, 0.2)";
        ctx.fill();
      } else if (e.type === "burst") {
        ctx.globalAlpha = 1 - t;
        ctx.fillStyle = t < 0.5 ? "#ffeb3b" : "#ff9800";
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.size * (1 - t * 0.5), 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }
}
