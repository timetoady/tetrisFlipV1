import { GAME_CONFIG, OWNERS } from "../constants.js";
import { Randomizer } from "../utils/randomizer.js";
import { drawCell, drawGrid } from "../utils/drawing.js";
import { createPiece, getBlocks, rotate } from "../entities/piece.js";
import { Board } from "../entities/board.js";

export class GameLoop {
  constructor(ctx, input) {
    this.ctx = ctx;
    this.input = input;
    this.board = new Board();
    this.randomizer = new Randomizer();
    this.dropInterval = 800;
    this.dropTimer = 0;
    this.paused = false;
    this.audioCtx = null;
    this.jamFlashTimer = 0;
    this.jamFlashDuration = 140;
    this.jamFlashCells = [];
    this.jamAnimTimer = 0;
    this.jamAnimDuration = 140;
    this.jamAnimFromY = 0;
    this.jamAnimToY = 0;
    this.jamAnimPiece = null;
    this.gridOffsetTop = 0;
    this.gridOffsetBottom = 0;
    this.gridOffsetBaseTop = 0;
    this.gridOffsetBaseBottom = 0;
    this.gridParallaxTimer = 0;
    this.gridParallaxDuration = 140;
    this.activePiece = this.spawnPiece();
  }

  ensureAudioContext() {
    if (!this.audioCtx) {
      const w = /** @type {any} */ (window);
      const AudioCtx = window.AudioContext || w.webkitAudioContext;
      if (!AudioCtx) return null;
      this.audioCtx = new AudioCtx();
    }
    if (this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  spawnPiece() {
    const type = this.randomizer.next();
    const x = Math.floor(GAME_CONFIG.COLS / 2);
    const y = 18;
    const piece = createPiece(type, x, y);
    if (this.collides(piece, 0, 0)) {
      this.board.reset();
    }
    return piece;
  }

  playSnapSound() {
    const ctx = this.ensureAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = 520;
    gain.gain.value = 0.12;
    osc.connect(gain).connect(ctx.destination);
    const now = ctx.currentTime;
    osc.start(now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.stop(now + 0.09);
  }

  playFlipSound() {
    const ctx = this.ensureAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 260;
    gain.gain.value = 0.06;
    osc.connect(gain).connect(ctx.destination);
    const now = ctx.currentTime;
    osc.start(now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    osc.stop(now + 0.08);
  }

  playRotateSound() {
    const ctx = this.ensureAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const delay = ctx.createDelay();
    const feedback = ctx.createGain();
    const now = ctx.currentTime;

    osc.type = "triangle";
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(360, now + 0.08);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    delay.delayTime.value = 0.08;
    feedback.gain.value = 0.28;

    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.connect(delay);
    delay.connect(feedback);
    feedback.connect(delay);
    delay.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 0.12);
  }

  updateGridOffsets() {
    const offset = GAME_CONFIG.BLOCK_SIZE / 2;
    if (this.board.isFlipped) {
      this.gridOffsetBaseTop = offset;
      this.gridOffsetBaseBottom = -offset;
    } else {
      this.gridOffsetBaseTop = -offset;
      this.gridOffsetBaseBottom = offset;
    }
    this.gridParallaxTimer = this.gridParallaxDuration;
  }

  getMinBlockY(piece) {
    const blocks = getBlocks(piece);
    let min = Infinity;
    for (const block of blocks) {
      if (block.y < min) min = block.y;
    }
    return min;
  }

  overlapsActiveOwnerAtY(piece, testY) {
    const activeOwner = this.board.getActiveOwner();
    const blocks = getBlocks(piece);
    const halfRows = GAME_CONFIG.ROWS / 2;

    for (const block of blocks) {
      const x = piece.x + block.x;
      const y = testY + block.y;
      if (x < 0 || x >= GAME_CONFIG.COLS) continue;
      if (y < 0 || y >= GAME_CONFIG.ROWS) continue;
      const localRow = y - halfRows;
      if (localRow < 0 || localRow >= halfRows) continue;
      const cell = this.board.getCellForOwner(activeOwner, localRow, x);
      if (cell && cell.value !== 0) {
        return true;
      }
    }

    return false;
  }

  handleFlipJam() {
    if (!this.overlapsActiveOwnerAtY(this.activePiece, this.activePiece.y)) {
      return false;
    }

    const halfRows = GAME_CONFIG.ROWS / 2;
    const minBlockY = this.getMinBlockY(this.activePiece);
    const ceilingY = halfRows - minBlockY;
    const maxUp = Math.max(0, this.activePiece.y - ceilingY);
    const startY = this.activePiece.y;

    let shift = null;
    for (let dy = 0; dy <= maxUp; dy += 1) {
      if (!this.overlapsActiveOwnerAtY(this.activePiece, this.activePiece.y - dy)) {
        shift = dy;
        break;
      }
    }

    if (shift === null) shift = maxUp;
    this.activePiece.y -= shift;

    const jamCells = [];
    const blocks = getBlocks(this.activePiece);
    for (const block of blocks) {
      const x = this.activePiece.x + block.x;
      const y = this.activePiece.y + block.y;
      jamCells.push({ x, y });
    }
    this.jamFlashCells = jamCells;
    this.jamFlashTimer = this.jamFlashDuration;
    this.jamAnimTimer = this.jamAnimDuration;
    this.jamAnimFromY = startY;
    this.jamAnimToY = this.activePiece.y;
    this.jamAnimPiece = { ...this.activePiece };
    this.playSnapSound();

    this.lockPiece();
    return true;
  }

  collides(piece, dx, dy, rotation = piece.rotation) {
    const activeOwner = this.board.getActiveOwner();
    const blocks = getBlocks(piece, rotation);
    const halfRows = GAME_CONFIG.ROWS / 2;

    for (const block of blocks) {
      const x = piece.x + block.x + dx;
      const y = piece.y + block.y + dy;

      if (x < 0 || x >= GAME_CONFIG.COLS || y >= GAME_CONFIG.ROWS) {
        return true;
      }

      if (y < 0) continue;
      const localRow = y - halfRows;
      if (localRow < 0 || localRow >= halfRows) continue;
      const cell = this.board.getCellForOwner(activeOwner, localRow, x);
      if (cell && cell.value !== 0) {
        return true;
      }
    }

    return false;
  }

  lockPiece() {
    const activeOwner = this.board.getActiveOwner();
    const blocks = getBlocks(this.activePiece);
    const halfRows = GAME_CONFIG.ROWS / 2;
    for (const block of blocks) {
      const x = this.activePiece.x + block.x;
      const y = this.activePiece.y + block.y;
      if (y < 0) continue;
      const localRow = y - halfRows;
      if (localRow < 0 || localRow >= halfRows) continue;
      this.board.setCellForOwner(activeOwner, localRow, x, this.activePiece.type);
    }

    this.board.clearLinesForOwner(activeOwner);
    this.activePiece = this.spawnPiece();
  }

  hardDrop() {
    while (!this.collides(this.activePiece, 0, 1)) {
      this.activePiece.y += 1;
    }
    this.lockPiece();
  }

  update(delta) {
    if (this.input.hasAnyActivity()) {
      this.ensureAudioContext();
    }

    if (this.input.consumePress("KeyP") || this.input.consumePress("Escape")) {
      this.paused = !this.paused;
      return;
    }

    if (this.paused) return;

    if (this.input.consumePress("Space") ||
        this.input.consumePress("ShiftLeft") ||
        this.input.consumePress("ShiftRight")) {
      this.board.flip();
      this.updateGridOffsets();
      this.playFlipSound();
      if (this.handleFlipJam()) return;
    }

    if (this.input.consumePress("ArrowLeft")) {
      if (!this.collides(this.activePiece, -1, 0)) {
        this.activePiece.x -= 1;
      }
    }

    if (this.input.consumePress("ArrowRight")) {
      if (!this.collides(this.activePiece, 1, 0)) {
        this.activePiece.x += 1;
      }
    }

    if (this.input.consumePress("KeyZ")) {
      const rotated = rotate(this.activePiece, -1);
      if (!this.collides(rotated, 0, 0, rotated.rotation)) {
        this.activePiece = rotated;
        this.playRotateSound();
      }
    }

    if (this.input.consumePress("KeyX")) {
      const rotated = rotate(this.activePiece, 1);
      if (!this.collides(rotated, 0, 0, rotated.rotation)) {
        this.activePiece = rotated;
        this.playRotateSound();
      }
    }

    if (this.input.consumePress("ArrowUp")) {
      this.hardDrop();
      return;
    }

    if (this.jamFlashTimer > 0) {
      this.jamFlashTimer = Math.max(0, this.jamFlashTimer - delta);
    }
    if (this.jamAnimTimer > 0) {
      this.jamAnimTimer = Math.max(0, this.jamAnimTimer - delta);
      if (this.jamAnimTimer === 0) {
        this.jamAnimPiece = null;
      }
    }
    if (this.gridParallaxTimer > 0) {
      this.gridParallaxTimer = Math.max(0, this.gridParallaxTimer - delta);
      const t = this.gridParallaxTimer / this.gridParallaxDuration;
      const amplitude = t * t * t;
      this.gridOffsetTop = this.gridOffsetBaseTop * amplitude;
      this.gridOffsetBottom = this.gridOffsetBaseBottom * amplitude;
    } else {
      this.gridOffsetTop = 0;
      this.gridOffsetBottom = 0;
    }

    const softDrop = this.input.isDown("ArrowDown");
    const interval = softDrop ? 40 : this.dropInterval;

    this.dropTimer += delta;
    if (this.dropTimer >= interval) {
      this.dropTimer = 0;
      if (!this.collides(this.activePiece, 0, 1)) {
        this.activePiece.y += 1;
      } else {
        this.lockPiece();
      }
    }
  }

  draw() {
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.setTransform(1, 0, 0, 1, GAME_CONFIG.GRID_MARGIN, 0);

    const halfRows = GAME_CONFIG.ROWS / 2;
    const spawnStart = halfRows - GAME_CONFIG.SPAWN_BUFFER / 2;
    const spawnEnd = spawnStart + GAME_CONFIG.SPAWN_BUFFER - 1;
    const size = GAME_CONFIG.BLOCK_SIZE;
    const gridWidth = GAME_CONFIG.COLS * size;
    const gridHeight = GAME_CONFIG.ROWS * size;
    const topTint = this.board.isFlipped
      ? "rgba(90, 140, 90, 0.06)"
      : "rgba(70, 110, 140, 0.06)";
    const bottomTint = this.board.isFlipped
      ? "rgba(70, 110, 140, 0.06)"
      : "rgba(90, 140, 90, 0.06)";
    ctx.save();
    ctx.fillStyle = topTint;
    ctx.fillRect(0, 0, gridWidth, spawnStart * size);
    ctx.fillStyle = bottomTint;
    ctx.fillRect(0, (spawnEnd + 1) * size, gridWidth, gridHeight - (spawnEnd + 1) * size);
    ctx.restore();

    drawGrid(ctx, this.gridOffsetTop, this.gridOffsetBottom);

    const activeOwner = this.board.getActiveOwner();
    const inactiveOwner = this.board.getInactiveOwner();
    const maxIndex = halfRows - 1;

    for (let y = 0; y < GAME_CONFIG.ROWS; y += 1) {
      for (let x = 0; x < GAME_CONFIG.COLS; x += 1) {
        const cell = this.board.grid[y][x];
        if (cell.value === 0) continue;
        if (!this.board.isRowInOwner(cell.owner, y)) continue;
        const alpha = cell.owner === activeOwner ? 1 : 0.3;
        let renderY = y;
        const local = this.board.mapRowToLocal(cell.owner, y);
        if (cell.owner === activeOwner) {
          renderY = halfRows + local;
        } else if (cell.owner === inactiveOwner) {
          renderY = maxIndex - local;
        }
        if (renderY < 0 || renderY >= GAME_CONFIG.ROWS) continue;
        drawCell(ctx, x, renderY, GAME_CONFIG.COLORS[cell.value], alpha);
      }
    }

    const blocks = getBlocks(this.activePiece);
    for (const block of blocks) {
      const x = this.activePiece.x + block.x;
      const y = this.activePiece.y + block.y;
      if (y < 0) continue;
      drawCell(ctx, x, y, GAME_CONFIG.COLORS[this.activePiece.type], 1);
    }

    if (this.jamAnimPiece && this.jamAnimTimer > 0) {
      const t = 1 - this.jamAnimTimer / this.jamAnimDuration;
      const interpY = this.jamAnimFromY + (this.jamAnimToY - this.jamAnimFromY) * t;
      const animBlocks = getBlocks(this.jamAnimPiece);
      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.95)";
      ctx.lineWidth = 3;
      ctx.shadowColor = "rgba(255, 255, 255, 0.75)";
      ctx.shadowBlur = 8;
      for (const block of animBlocks) {
        const x = this.jamAnimPiece.x + block.x;
        const y = interpY + block.y;
        if (y < 0) continue;
        const size = GAME_CONFIG.BLOCK_SIZE;
        ctx.strokeRect(x * size + 1.5, y * size + 1.5, size - 3, size - 3);
      }
      ctx.restore();
    }

    if (this.jamFlashTimer > 0) {
      const alpha = this.jamFlashTimer / this.jamFlashDuration;
      ctx.save();
      ctx.fillStyle = `rgba(255, 255, 255, ${0.28 * alpha})`;
      ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(1, alpha + 0.25)})`;
      ctx.lineWidth = 4;
      ctx.shadowColor = "rgba(255, 255, 255, 0.85)";
      ctx.shadowBlur = 10;
      for (const cell of this.jamFlashCells) {
        if (cell.y < 0) continue;
        const size = GAME_CONFIG.BLOCK_SIZE;
        const px = cell.x * size;
        const py = cell.y * size;
        ctx.fillRect(px + 2, py + 2, size - 4, size - 4);
        ctx.strokeRect(px + 1.5, py + 1.5, size - 3, size - 3);
      }
      ctx.restore();
    }

    if (this.paused) {
      ctx.save();
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.fillStyle = "#ffffff";
      ctx.font = "24px \"IBM Plex Mono\", Menlo, Consolas, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("PAUSED", ctx.canvas.width / 2, ctx.canvas.height / 2);
      ctx.restore();
    }
  }
}
