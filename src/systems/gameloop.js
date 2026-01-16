import { GAME_CONFIG } from "../constants.js";
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
    this.activePiece = this.spawnPiece();
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

  collides(piece, dx, dy, rotation = piece.rotation) {
    const activeOwner = this.board.getActiveOwner();
    const blocks = getBlocks(piece, rotation);

    for (const block of blocks) {
      const x = piece.x + block.x + dx;
      const y = piece.y + block.y + dy;

      if (x < 0 || x >= GAME_CONFIG.COLS || y >= GAME_CONFIG.ROWS) {
        return true;
      }

      if (y < 0) continue;
      const cell = this.board.grid[y][x];
      if (cell.value !== 0 && cell.owner === activeOwner) {
        return true;
      }
    }

    return false;
  }

  lockPiece() {
    const activeOwner = this.board.getActiveOwner();
    const blocks = getBlocks(this.activePiece);
    for (const block of blocks) {
      const x = this.activePiece.x + block.x;
      const y = this.activePiece.y + block.y;
      if (y < 0) continue;
      this.board.setCell(x, y, this.activePiece.type, activeOwner);
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
    if (this.input.consumePress("Space") ||
        this.input.consumePress("ShiftLeft") ||
        this.input.consumePress("ShiftRight")) {
      this.board.flip();
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
      }
    }

    if (this.input.consumePress("KeyX")) {
      const rotated = rotate(this.activePiece, 1);
      if (!this.collides(rotated, 0, 0, rotated.rotation)) {
        this.activePiece = rotated;
      }
    }

    if (this.input.consumePress("ArrowUp")) {
      this.hardDrop();
      return;
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
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    drawGrid(ctx);

    const activeOwner = this.board.getActiveOwner();
    const inactiveOwner = this.board.getInactiveOwner();

    for (let y = 0; y < GAME_CONFIG.ROWS; y += 1) {
      for (let x = 0; x < GAME_CONFIG.COLS; x += 1) {
        const cell = this.board.grid[y][x];
        if (cell.value === 0) continue;
        const alpha = cell.owner === activeOwner ? 1 : 0.3;
        drawCell(ctx, x, y, GAME_CONFIG.COLORS[cell.value], alpha);
      }
    }

    const blocks = getBlocks(this.activePiece);
    for (const block of blocks) {
      const x = this.activePiece.x + block.x;
      const y = this.activePiece.y + block.y;
      if (y < 0) continue;
      drawCell(ctx, x, y, GAME_CONFIG.COLORS[this.activePiece.type], 1);
    }
  }
}
