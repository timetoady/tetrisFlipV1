import { GAME_CONFIG } from "../constants.js";

export function drawCell(ctx, x, y, color, alpha = 1) {
  const size = GAME_CONFIG.BLOCK_SIZE;
  const px = x * size;
  const py = y * size;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(px, py, size, size);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
  ctx.strokeRect(px + 0.5, py + 0.5, size - 1, size - 1);
  ctx.restore();
}

export function drawGrid(ctx) {
  const { COLS, ROWS, BLOCK_SIZE } = GAME_CONFIG;
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 1;

  for (let x = 0; x <= COLS; x += 1) {
    const px = x * BLOCK_SIZE + 0.5;
    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(px, ROWS * BLOCK_SIZE);
    ctx.stroke();
  }

  for (let y = 0; y <= ROWS; y += 1) {
    const py = y * BLOCK_SIZE + 0.5;
    ctx.beginPath();
    ctx.moveTo(0, py);
    ctx.lineTo(COLS * BLOCK_SIZE, py);
    ctx.stroke();
  }

  ctx.restore();
}
