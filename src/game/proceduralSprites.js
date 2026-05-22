/** Runtime fallback: crisp 6×4 directional sheets with true alpha (no checkerboard) */

const COLS = 6;
const HERO_ROWS = 4;
const ROACH_ROWS = 8;
const CELL_HERO = 256;
const CELL_ROACH = 256;

function dirVector(dir) {
  // Rows: SE, SW, NW, NE
  if (dir === 0) return { x: 1, y: 1 };
  if (dir === 1) return { x: -1, y: 1 };
  if (dir === 2) return { x: -1, y: -1 };
  return { x: 1, y: -1 };
}

function roachDirVector(dir) {
  const angle = (dir / ROACH_ROWS) * Math.PI * 2 + Math.PI / 8;
  return { x: Math.cos(angle), y: Math.sin(angle) };
}

function drawLimb(ctx, x1, y1, x2, y2, width, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function drawHead(ctx, x, y, r, hairColor, beardColor, hasGlasses) {
  ctx.fillStyle = "#f4b089";
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = hairColor;
  ctx.beginPath();
  ctx.arc(x, y - r * 0.35, r * 0.95, Math.PI, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = beardColor;
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.28, r * 0.72, r * 0.45, 0, 0, Math.PI);
  ctx.fill();

  if (hasGlasses) {
    ctx.strokeStyle = "#263238";
    ctx.lineWidth = Math.max(1.5, r * 0.08);
    ctx.beginPath();
    ctx.arc(x - r * 0.35, y - r * 0.04, r * 0.24, 0, Math.PI * 2);
    ctx.arc(x + r * 0.35, y - r * 0.04, r * 0.24, 0, Math.PI * 2);
    ctx.moveTo(x - r * 0.1, y - r * 0.04);
    ctx.lineTo(x + r * 0.1, y - r * 0.04);
    ctx.stroke();
  }
}

function drawPM(ctx, x, y, dir, frame, size) {
  const cx = x + size / 2;
  const cy = y + size * 0.72;
  const v = dirVector(dir);
  const step = Math.sin((frame / COLS) * Math.PI * 2);
  const bob = Math.abs(step) * -3;
  const attack = frame === 5;

  ctx.save();
  ctx.translate(cx, cy + bob);

  // legs
  drawLimb(ctx, -18, 12, -26 - step * 4, 42, 9, "#ffffff");
  drawLimb(ctx, 18, 12, 26 + step * 4, 42, 9, "#ffffff");
  drawLimb(ctx, -26 - step * 4, 42, -30 - step * 4, 50, 8, "#3e2723");
  drawLimb(ctx, 26 + step * 4, 42, 30 + step * 4, 50, 8, "#3e2723");

  // kurta and vest
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(0, 0, 32, 42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1565c0";
  ctx.beginPath();
  ctx.ellipse(0, -5, 25, 35, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#0d47a1";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -36);
  ctx.lineTo(0, 25);
  ctx.stroke();

  // arms and lotus
  const lotusX = attack ? v.x * 58 : v.x * 42;
  const lotusY = attack ? -48 : -18;
  drawLimb(ctx, -24, -12, -42, 12 + step * 3, 8, "#ffffff");
  drawLimb(ctx, 24, -12, lotusX * 0.65, lotusY * 0.65, 8, "#ffffff");
  drawLimb(ctx, lotusX * 0.65, lotusY * 0.65, lotusX, lotusY, 5, "#2e7d32");
  ctx.fillStyle = "#f48fb1";
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.ellipse(lotusX + Math.cos(a) * 8, lotusY + Math.sin(a) * 5, 9, 5, a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#ec407a";
  ctx.beginPath();
  ctx.arc(lotusX, lotusY, 6, 0, Math.PI * 2);
  ctx.fill();

  drawHead(ctx, 0, -49, 20, "#ffffff", "#ffffff", true);
  ctx.restore();
}

function drawPappu(ctx, x, y, dir, frame, size) {
  const cx = x + size / 2;
  const cy = y + size * 0.72;
  const v = dirVector(dir);
  const step = Math.sin((frame / COLS) * Math.PI * 2);
  const attack = frame === 5;
  const handReach = attack ? 70 : 34 + Math.abs(step) * 4;

  ctx.save();
  ctx.translate(cx, cy + Math.abs(step) * -3);

  drawLimb(ctx, -18, 12, -26 - step * 4, 42, 9, "#ffffff");
  drawLimb(ctx, 18, 12, 26 + step * 4, 42, 9, "#ffffff");
  drawLimb(ctx, -26 - step * 4, 42, -30 - step * 4, 50, 8, "#5d4037");
  drawLimb(ctx, 26 + step * 4, 42, 30 + step * 4, 50, 8, "#5d4037");

  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(0, 0, 32, 42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#cfd8dc";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -36);
  ctx.lineTo(0, 26);
  ctx.stroke();

  drawLimb(ctx, -22, -12, -36, 12 + step * 2, 9, "#ffffff");
  drawLimb(ctx, 22, -12, v.x * handReach, -10 + v.y * 8, 9, "#ffffff");
  ctx.fillStyle = "#f4b089";
  ctx.beginPath();
  ctx.ellipse(v.x * handReach, -10 + v.y * 8, attack ? 18 : 12, attack ? 14 : 10, 0, 0, Math.PI * 2);
  ctx.fill();

  drawHead(ctx, 0, -49, 20, "#2f1b16", "#5d4037", false);
  ctx.restore();
}

function drawRoach(ctx, x, y, dir, frame, size) {
  const cx = x + size / 2;
  const cy = y + size * 0.72;
  const v = roachDirVector(dir);
  const wiggle = Math.sin((frame / COLS) * Math.PI * 2) * 4;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(Math.atan2(v.y, v.x));

  ctx.fillStyle = "#4e342e";
  ctx.beginPath();
  ctx.ellipse(0, 0, 28, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#6d4c41";
  ctx.beginPath();
  ctx.ellipse(8, 0, 18, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#3e2723";
  ctx.lineWidth = 3;
  for (let i = -1; i <= 1; i++) {
    drawLimb(ctx, -8, i * 5, -28 + wiggle, i * 13, 2, "#3e2723");
    drawLimb(ctx, 8, i * 5, 28 - wiggle, i * 13, 2, "#3e2723");
  }
  drawLimb(ctx, -18, -7, -38, -18, 2, "#3e2723");
  drawLimb(ctx, -18, 7, -38, 18, 2, "#3e2723");
  ctx.fillStyle = "#fff8e1";
  ctx.beginPath();
  ctx.arc(-18, -5, 4, 0, Math.PI * 2);
  ctx.arc(-18, 5, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function buildSheet(drawFn, cellSize, rows = HERO_ROWS) {
  const canvas = document.createElement("canvas");
  canvas.width = COLS * cellSize;
  canvas.height = rows * cellSize;
  const ctx = canvas.getContext("2d");
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < COLS; col++) {
      drawFn(ctx, col * cellSize, row * cellSize, row, col, cellSize);
    }
  }
  return canvas;
}

let pmSheet = null;
let pappuSheet = null;
let roachSheet = null;

export function getProceduralSheet(id) {
  if (id === "pm") {
    if (!pmSheet) pmSheet = buildSheet(drawPM, CELL_HERO);
    return pmSheet;
  }
  if (id === "pappu") {
    if (!pappuSheet) pappuSheet = buildSheet(drawPappu, CELL_HERO);
    return pappuSheet;
  }
  if (id === "roach") {
    if (!roachSheet) roachSheet = buildSheet(drawRoach, CELL_ROACH, ROACH_ROWS);
    return roachSheet;
  }
  return null;
}
