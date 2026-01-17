import { GAME_CONFIG } from "../constants.js";

export function drawCell(ctx, x, y, color, alpha = 1) {
  const size = GAME_CONFIG.BLOCK_SIZE;
  const px = x * size;
  const py = y * size;

  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.fillRect(px, py, size, size);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
  ctx.lineWidth = 3;
  ctx.strokeRect(px + 1, py + 1, size - 2, size - 2);
  ctx.strokeStyle = "rgba(255, 255, 255, 0.28)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(px + 2, py + 2);
  ctx.lineTo(px + size - 2, py + 2);
  ctx.moveTo(px + 2, py + 2);
  ctx.lineTo(px + 2, py + size - 2);
  ctx.stroke();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
  ctx.beginPath();
  ctx.moveTo(px + 3, py + size - 4);
  ctx.lineTo(px + size - 4, py + 3);
  ctx.stroke();
  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  ctx.fillRect(px + 3, py + 3, size - 6, size - 6);
  ctx.restore();
}

function drawGridBand(ctx, offsetY, startRow, endRow) {
  const { COLS, BLOCK_SIZE } = GAME_CONFIG;
  const width = COLS * BLOCK_SIZE;
  const height = (endRow - startRow) * BLOCK_SIZE;
  const baseY = startRow * BLOCK_SIZE;

  for (let x = -1; x <= COLS + 1; x += 1) {
    const px = x * BLOCK_SIZE + 0.5;
    if (px < 0 || px > width) continue;
    ctx.beginPath();
    ctx.moveTo(px, baseY);
    ctx.lineTo(px, baseY + height);
    ctx.stroke();
  }

  for (let y = 0; y <= endRow - startRow; y += 1) {
    const py = baseY + y * BLOCK_SIZE + offsetY + 0.5;
    if (py < baseY || py > baseY + height) continue;
    ctx.beginPath();
    ctx.moveTo(0, py);
    ctx.lineTo(width, py);
    ctx.stroke();
  }
}

export function drawGrid(ctx, topOffset = 0, bottomOffset = 0) {
  const { COLS, ROWS, BLOCK_SIZE } = GAME_CONFIG;
  ctx.save();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
  ctx.lineWidth = 1;

  const halfRows = ROWS / 2;
  drawGridBand(ctx, topOffset, 0, halfRows);
  drawGridBand(ctx, bottomOffset, halfRows, ROWS);

  ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
  ctx.font = "10px \"IBM Plex Mono\", Menlo, Consolas, monospace";
  ctx.textAlign = "right";
  ctx.textBaseline = "middle";
  const spawnStart = ROWS / 2 - GAME_CONFIG.SPAWN_BUFFER / 2;
  const spawnEnd = spawnStart + GAME_CONFIG.SPAWN_BUFFER - 1;
  for (let y = 0; y < ROWS; y += 1) {
    const py = y * BLOCK_SIZE + BLOCK_SIZE / 2;
    let label = 0;
    if (y < spawnStart) {
      label = spawnStart - y;
    } else if (y > spawnEnd) {
      label = -(y - spawnEnd);
    }
    ctx.fillText(String(label), -8, py);
    ctx.textAlign = "left";
    ctx.fillText(String(label), COLS * BLOCK_SIZE + 8, py);
    ctx.textAlign = "right";
  }

  ctx.restore();
}
