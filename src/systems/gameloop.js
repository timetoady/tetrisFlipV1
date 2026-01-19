import { GAME_CONFIG, OWNERS } from "../constants.js";
import { Randomizer } from "../utils/randomizer.js";
import { drawCell, drawGrid } from "../utils/drawing.js";
import { createPiece, getBlocks } from "../entities/piece.js";
import { Board } from "../entities/board.js";
import { getKickOffsets } from "../utils/srs.js";

export class GameLoop {
  constructor(ctx, input, callbacks = {}) {
    this.ctx = ctx;
    this.input = input;
    this.onGameOver = callbacks.onGameOver || (() => {});
    this.onPauseBack = callbacks.onPauseBack || (() => {});
    this.board = new Board();
    this.randomizer = new Randomizer();
    this.queueSize = 3;
    this.nextQueue = [];
    this.holdType = null;
    this.holdUsed = false;
    this.startingLevel = 1;
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.dropInterval = this.getDropInterval(this.level);
    this.dropTimer = 0;
    this.paused = false;
    this.audioCtx = null;
    this.sfxVolume = 9.0;
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
    this.leftHold = 0;
    this.rightHold = 0;
    this.leftRepeat = 0;
    this.rightRepeat = 0;
    this.lockDelayMs = 500;
    this.lockDelayMinMs = 0;
    this.lockDegradeAfter = 3;
    this.lockDegradeStepMs = 40;
    this.lockTimer = 0;
    this.lockMoves = 0;
    this.lockMoveLimit = 15;
    this.groundedTimer = 0;
    this.groundedMaxMs = 1500;
    this.lockResetCooldownMs = 80;
    this.lockResetCooldown = 0;
    this.isGrounded = false;
    this.isClearing = false;
    this.clearTimer = 0;
    this.clearDuration = 0;
    this.clearRows = [];
    this.clearOwner = null;
    this.tetrisFlashTimer = 0;
    this.tetrisFlashDuration = 0;
    this.tetrisTextTimer = 0;
    this.tetrisTextDuration = 0;
    this.refillQueue();
    this.gameOver = false;
    this.pauseButtons = null;
    this.pauseActionIndex = 0;
    this.pauseConfirmActive = false;
    this.pauseConfirmIndex = 0;
    this.pauseConfirmButtons = null;
    this.viewportScale = 1;
    this.pausePointer = null;
    this.pauseHover = null;
    this.holdBoxRect = null;
    this.activePiece = this.spawnPiece();
  }

  getDropInterval(level) {
    // Tuning hook: adjust base slope and milestone bumps after playtesting.
    const baseFrames = Math.max(1, 48 - (level - 1) * 2);
    let frames = baseFrames;
    if (level >= 5) frames -= 2;
    if (level >= 10) frames -= 2;
    if (level >= 15) frames -= 2;
    if (level >= 20) frames = 1;
    return Math.max(1, frames) * (1000 / 60);
  }

  resetProgress() {
    this.score = 0;
    this.level = this.startingLevel;
    this.lines = 0;
    this.dropInterval = this.getDropInterval(this.level);
    this.dropTimer = 0;
  }

  setStartingLevel(level) {
    this.startingLevel = Math.min(35, Math.max(0, level));
  }

  getLevelForLines(lines) {
    const start = this.startingLevel;
    const threshold = start <= 1 ? 10 : (start + 1) * 10;
    if (lines < threshold) return start;
    return Math.floor((lines - threshold) / 10) + start + 1;
  }

  resetHold() {
    this.holdType = null;
    this.holdUsed = false;
  }

  resetGameState() {
    this.board.reset();
    this.resetProgress();
    this.resetHold();
    this.nextQueue = [];
    this.refillQueue();
    this.resetLockState();
    this.gameOver = false;
    this.isClearing = false;
    this.clearTimer = 0;
    this.clearDuration = 0;
    this.clearRows = [];
    this.clearOwner = null;
    this.tetrisFlashTimer = 0;
    this.tetrisFlashDuration = 0;
    this.tetrisTextTimer = 0;
    this.tetrisTextDuration = 0;
  }

  reset() {
    this.resetGameState();
    this.activePiece = this.spawnPiece();
  }

  getScoreState() {
    return {
      score: this.score,
      lines: this.lines,
      level: this.level
    };
  }

  handlePauseClick(x, y) {
    if (!this.paused) return;
    if (this.pauseConfirmActive && this.pauseConfirmButtons) {
      const { yes, no } = this.pauseConfirmButtons;
      const padding = 10;
      if (x >= yes.x - padding && x <= yes.x + yes.w + padding &&
          y >= yes.y - padding && y <= yes.y + yes.h + padding) {
        this.pauseConfirmActive = false;
        this.paused = false;
        this.onPauseBack();
        return;
      }
      if (x >= no.x - padding && x <= no.x + no.w + padding &&
          y >= no.y - padding && y <= no.y + no.h + padding) {
        this.pauseConfirmActive = false;
        return;
      }
    }
    if (!this.pauseButtons) return;
    const { resume, restart, end } = this.pauseButtons;
    if (x >= resume.x && x <= resume.x + resume.w &&
        y >= resume.y && y <= resume.y + resume.h) {
      this.pauseActionIndex = 0;
      this.pauseConfirmActive = false;
      this.paused = false;
      return;
    }
    if (x >= restart.x && x <= restart.x + restart.w &&
        y >= restart.y && y <= restart.y + restart.h) {
      this.pauseActionIndex = 1;
      this.pauseConfirmActive = false;
      this.paused = false;
      this.reset();
      return;
    }
    if (x >= end.x && x <= end.x + end.w &&
        y >= end.y && y <= end.y + end.h) {
      this.pauseActionIndex = 2;
      this.pauseConfirmActive = true;
      this.pauseConfirmIndex = 0;
      this.pauseConfirmButtons = null;
      if (this.input && this.input.clearPressed) {
        this.input.clearPressed();
      }
      return;
    }
  }

  setViewportScale(scale) {
    this.viewportScale = Number.isFinite(scale) ? scale : 1;
  }

  setPausePointer(x, y) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) {
      this.pausePointer = null;
      this.pauseHover = null;
      return;
    }
    this.pausePointer = { x, y };
  }

  getPauseCursor() {
    return this.pauseHover ? "pointer" : "";
  }

  handleHoldClick(x, y) {
    if (!this.holdBoxRect) return false;
    const { x: bx, y: by, w, h } = this.holdBoxRect;
    if (x < bx || x > bx + w || y < by || y > by + h) return false;
    this.handleHold();
    return true;
  }

  isSpawnBlocked() {
    const activeOwner = this.board.getActiveOwner();
    const halfRows = GAME_CONFIG.ROWS / 2;
    const spawnStart = halfRows - GAME_CONFIG.SPAWN_BUFFER / 2;
    const spawnEnd = spawnStart + GAME_CONFIG.SPAWN_BUFFER - 1;
    for (let localRow = 0; localRow < halfRows; localRow += 1) {
      const worldRow = halfRows + localRow;
      if (worldRow < spawnStart || worldRow > spawnEnd) continue;
      for (let x = 0; x < GAME_CONFIG.COLS; x += 1) {
        const cell = this.board.getCellForOwner(activeOwner, localRow, x);
        if (cell && cell.value !== 0) {
          return true;
        }
      }
    }
    return false;
  }

  refillQueue() {
    while (this.nextQueue.length < this.queueSize) {
      this.nextQueue.push(this.randomizer.next());
    }
  }

  takeNextType() {
    if (this.nextQueue.length === 0) {
      this.refillQueue();
    }
    const next = this.nextQueue.shift();
    this.refillQueue();
    return next;
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

  setSfxVolume(volume) {
    if (!Number.isFinite(volume)) return;
    this.sfxVolume = Math.max(0, Math.min(9.5, volume));
  }

  getSfxGain(value) {
    return value * this.sfxVolume;
  }

  spawnPiece() {
    const type = this.takeNextType();
    const x = Math.floor(GAME_CONFIG.COLS / 2);
    const y = 18;
    let piece = createPiece(type, x, y);
    if (this.isSpawnBlocked()) {
      this.gameOver = true;
      this.onGameOver();
      return piece;
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
    gain.gain.value = this.getSfxGain(0.22);
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
    gain.gain.value = this.getSfxGain(0.06);
    osc.connect(gain).connect(ctx.destination);
    const now = ctx.currentTime;
    osc.start(now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    osc.stop(now + 0.08);
  }

  playPauseSound() {
    const ctx = this.ensureAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    const now = ctx.currentTime;
    gain.gain.value = this.getSfxGain(0.06);
    osc.connect(gain).connect(ctx.destination);
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.setValueAtTime(320, now + 0.32);
    osc.frequency.setValueAtTime(520, now + 0.64);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);
    osc.start(now);
    osc.stop(now + 1.0);
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

    gain.gain.setValueAtTime(this.getSfxGain(0.08), now);
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

  playGroundSound() {
    const ctx = this.ensureAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = 140;
    gain.gain.value = this.getSfxGain(0.08);
    osc.connect(gain).connect(ctx.destination);
    const now = ctx.currentTime;
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc.start(now);
    osc.stop(now + 0.14);
  }

  playHardDropSound() {
    const ctx = this.ensureAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();
    osc.type = "square";
    osc.frequency.value = 75;
    filter.type = "lowpass";
    filter.frequency.value = 300;
    filter.Q.value = 1.4;
    gain.gain.value = this.getSfxGain(0.045);
    osc.connect(filter).connect(gain).connect(ctx.destination);
    const now = ctx.currentTime;
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    osc.start(now);
    osc.stop(now + 0.44);
  }

  playLineClearSound(lines) {
    const ctx = this.ensureAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    const base = 330;
    const step = 70;
    const freq = base + (lines - 1) * step;
    osc.frequency.value = freq;
    gain.gain.value = this.getSfxGain(0.09);
    osc.connect(gain).connect(ctx.destination);
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 1.12, now + 0.9);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
    osc.start(now);
    osc.stop(now + 1.05);
  }

  playTetrisSound() {
    const ctx = this.ensureAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sawtooth";
    const now = ctx.currentTime;
    gain.gain.value = this.getSfxGain(0.12);
    osc.connect(gain).connect(ctx.destination);
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.setValueAtTime(330, now + 0.4);
    osc.frequency.setValueAtTime(440, now + 0.8);
    osc.frequency.setValueAtTime(550, now + 1.1);
    osc.frequency.setValueAtTime(660, now + 1.4);
    osc.frequency.setValueAtTime(880, now + 1.8);
    osc.frequency.setValueAtTime(990, now + 2.1);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.4);
    osc.start(now);
    osc.stop(now + 2.45);
  }

  playLevelUpSound(delaySeconds = 0) {
    const ctx = this.ensureAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    const now = ctx.currentTime + delaySeconds;
    gain.gain.value = this.getSfxGain(4.0);
    osc.connect(gain).connect(ctx.destination);
    osc.frequency.setValueAtTime(330, now);
    osc.frequency.setValueAtTime(415, now + 0.35);
    osc.frequency.setValueAtTime(494, now + 0.7);
    osc.frequency.setValueAtTime(659, now + 1.05);
    osc.frequency.setValueAtTime(880, now + 1.4);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.8);
    osc.start(now);
    osc.stop(now + 1.9);
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

    const linesToClear = this.board.findClearLinesForOwner(activeOwner);
    const cleared = linesToClear.length;
    if (cleared > 0) {
      this.isClearing = true;
      this.clearTimer = 0;
      this.clearDuration = cleared === 4 ? 900 : 420;
      this.clearRows = linesToClear;
      this.clearOwner = activeOwner;
      // Tuning hook: scoring table and multipliers for playtesting.
      const lineScores = [0, 100, 300, 500, 800];
      this.score += lineScores[cleared] * this.level;
      this.lines += cleared;
      if (cleared === 4) {
        this.playTetrisSound();
        this.tetrisFlashDuration = this.clearDuration;
        this.tetrisFlashTimer = this.tetrisFlashDuration;
        this.tetrisTextDuration = this.clearDuration + 500;
        this.tetrisTextTimer = this.tetrisTextDuration;
      } else {
        this.playLineClearSound(cleared);
      }
      const nextLevel = this.getLevelForLines(this.lines);
      if (nextLevel !== this.level) {
        this.playLevelUpSound(0.85);
      }
      this.level = nextLevel;
      this.dropInterval = this.getDropInterval(this.level);
    }
    if (!this.isClearing) {
      this.activePiece = this.spawnPiece();
      this.resetLockState();
      this.holdUsed = false;
      this.playGroundSound();
    }
  }

  hardDrop() {
    let dropped = 0;
    while (!this.collides(this.activePiece, 0, 1)) {
      this.activePiece.y += 1;
      dropped += 1;
    }
    if (dropped > 0) {
      // Tuning hook: hard drop bonus.
      this.score += dropped * 2;
    }
    this.playHardDropSound();
    this.lockPiece();
  }

  resetLockState() {
    this.lockTimer = 0;
    this.lockMoves = 0;
    this.groundedTimer = 0;
    this.lockResetCooldown = 0;
    this.isGrounded = false;
  }

  handleHold() {
    if (this.holdUsed) return;
    if (this.holdType === null) {
      this.holdType = this.activePiece.type;
      this.activePiece = this.spawnPiece();
      if (this.gameOver) return;
    } else {
      const swap = this.holdType;
      this.holdType = this.activePiece.type;
      const piece = createPiece(swap, Math.floor(GAME_CONFIG.COLS / 2), 18);
      if (this.isSpawnBlocked()) {
        this.gameOver = true;
        this.onGameOver();
        return;
      } else {
        this.activePiece = piece;
      }
    }
    this.resetLockState();
    this.holdUsed = true;
  }

  getGhostY() {
    let offset = 0;
    while (!this.collides(this.activePiece, 0, offset + 1)) {
      offset += 1;
    }
    return this.activePiece.y + offset;
  }

  tryMoveHorizontal(dx) {
    if (!this.collides(this.activePiece, dx, 0)) {
      this.activePiece.x += dx;
      this.registerLockReset();
      return true;
    }
    return false;
  }

  tryRotate(dir) {
    const from = this.activePiece.rotation;
    const to = (from + dir + 4) % 4;
    const offsets = getKickOffsets(this.activePiece.type, from, to);
    for (const [ox, oy] of offsets) {
      if (!this.collides(this.activePiece, ox, oy, to)) {
        this.activePiece = {
          ...this.activePiece,
          x: this.activePiece.x + ox,
          y: this.activePiece.y + oy,
          rotation: to
        };
        this.registerLockReset();
        return true;
      }
    }
    return false;
  }

  registerLockReset() {
    if (!this.collides(this.activePiece, 0, 1)) return;
    if (this.lockResetCooldown > 0) return;
    this.lockTimer = 0;
    this.lockMoves += 1;
    this.lockResetCooldown = this.lockResetCooldownMs;
  }

  update(delta) {
    if (this.gameOver) return;
    if (this.input.hasAnyActivity()) {
      this.ensureAudioContext();
    }

    if (this.input.consumePress("KeyP") || this.input.consumePress("Escape")) {
      this.paused = !this.paused;
      if (this.paused) {
        this.pauseActionIndex = 0;
        this.pauseConfirmActive = false;
      }
      this.playPauseSound();
      return;
    }

    if (this.paused) {
      if (this.pauseConfirmActive) {
        const left = this.input.consumePress("ArrowLeft");
        const right = this.input.consumePress("ArrowRight");
        const up = this.input.consumePress("ArrowUp");
        const down = this.input.consumePress("ArrowDown");
        const back = this.input.consumePress("Backspace");
        if (left || right || up || down || back) {
          this.pauseConfirmIndex = this.pauseConfirmIndex === 0 ? 1 : 0;
        }
        if (this.input.consumePress("KeyX") || this.input.consumePress("Enter")) {
          if (this.pauseConfirmIndex === 0) {
            this.pauseConfirmActive = false;
            this.paused = false;
            this.onPauseBack();
          } else {
            this.pauseConfirmActive = false;
          }
        }
        if (this.input.consumePress("KeyZ")) {
          this.pauseConfirmActive = false;
        }
      } else {
        const left = this.input.consumePress("ArrowLeft");
        const right = this.input.consumePress("ArrowRight");
        const up = this.input.consumePress("ArrowUp");
        const down = this.input.consumePress("ArrowDown");
        const back = this.input.consumePress("Backspace");
        if (left || right || up || down || back) {
          const dir = left || up ? -1 : 1;
          this.pauseActionIndex = (this.pauseActionIndex + dir + 3) % 3;
        }
        if (this.input.consumePress("KeyX") || this.input.consumePress("Enter")) {
          if (this.pauseActionIndex === 0) {
            this.paused = false;
          } else if (this.pauseActionIndex === 1) {
            this.paused = false;
            this.reset();
          } else {
            this.pauseConfirmActive = true;
            this.pauseConfirmIndex = 0;
          }
        }
        if (this.input.consumePress("KeyZ")) {
          this.pauseConfirmActive = true;
          this.pauseConfirmIndex = 0;
        }
      }
      return;
    }

    if (this.tetrisFlashTimer > 0) {
      this.tetrisFlashTimer = Math.max(0, this.tetrisFlashTimer - delta);
    }
    if (this.tetrisTextTimer > 0) {
      this.tetrisTextTimer = Math.max(0, this.tetrisTextTimer - delta);
    }

    if (this.isClearing) {
      this.clearTimer += delta;
      if (this.clearTimer >= this.clearDuration) {
        this.board.clearLinesForOwner(this.clearOwner, this.clearRows);
        this.isClearing = false;
        this.clearTimer = 0;
        this.clearDuration = 0;
        this.clearRows = [];
        this.clearOwner = null;
        this.activePiece = this.spawnPiece();
        this.resetLockState();
        this.holdUsed = false;
        this.playGroundSound();
      }
      return;
    }

    if (this.input.consumePress("Space") ||
        this.input.consumePress("ShiftLeft") ||
        this.input.consumePress("ShiftRight")) {
      this.board.flip();
      this.updateGridOffsets();
      this.playFlipSound();
      if (this.handleFlipJam()) return;
    }

    if (this.input.consumePress("KeyC")) {
      this.handleHold();
    }

    const leftPressed = this.input.consumePress("ArrowLeft");
    const rightPressed = this.input.consumePress("ArrowRight");
    const leftHeld = this.input.isDown("ArrowLeft");
    const rightHeld = this.input.isDown("ArrowRight");

    if (leftPressed) {
      this.tryMoveHorizontal(-1);
      this.leftHold = 0;
      this.leftRepeat = 0;
    }

    if (rightPressed) {
      this.tryMoveHorizontal(1);
      this.rightHold = 0;
      this.rightRepeat = 0;
    }

    if (leftHeld && !rightHeld) {
      this.leftHold += delta;
      if (this.leftHold >= GAME_CONFIG.DAS_DELAY) {
        this.leftRepeat += delta;
        while (this.leftRepeat >= GAME_CONFIG.DAS_ARR) {
          this.leftRepeat -= GAME_CONFIG.DAS_ARR;
          if (!this.tryMoveHorizontal(-1)) break;
        }
      }
    } else {
      this.leftHold = 0;
      this.leftRepeat = 0;
    }

    if (rightHeld && !leftHeld) {
      this.rightHold += delta;
      if (this.rightHold >= GAME_CONFIG.DAS_DELAY) {
        this.rightRepeat += delta;
        while (this.rightRepeat >= GAME_CONFIG.DAS_ARR) {
          this.rightRepeat -= GAME_CONFIG.DAS_ARR;
          if (!this.tryMoveHorizontal(1)) break;
        }
      }
    } else {
      this.rightHold = 0;
      this.rightRepeat = 0;
    }

    if (this.input.consumePress("KeyZ")) {
      if (this.tryRotate(-1)) {
        this.playRotateSound();
      }
    }

    if (this.input.consumePress("KeyX")) {
      if (this.tryRotate(1)) {
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
        if (softDrop) {
          this.score += 1;
        }
        this.isGrounded = false;
      }
    }

    const currentlyGrounded = this.collides(this.activePiece, 0, 1);
    if (currentlyGrounded) {
      this.isGrounded = true;
      this.lockTimer += delta;
      this.groundedTimer += delta;
      if (this.lockResetCooldown > 0) {
        this.lockResetCooldown = Math.max(0, this.lockResetCooldown - delta);
      }
      const extraMoves = Math.max(0, this.lockMoves - this.lockDegradeAfter);
      const effectiveDelay = Math.max(
        this.lockDelayMinMs,
        this.lockDelayMs - extraMoves * this.lockDegradeStepMs
      );
      if (this.lockTimer >= effectiveDelay ||
          this.lockMoves >= this.lockMoveLimit ||
          this.groundedTimer >= this.groundedMaxMs) {
        this.lockPiece();
      }
    } else {
      if (!this.isGrounded) {
        this.lockTimer = 0;
        this.lockMoves = 0;
      }
      this.groundedTimer = 0;
      this.lockResetCooldown = 0;
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

    if (this.isClearing && this.clearOwner) {
      const progress = Math.min(1, this.clearTimer / this.clearDuration);
      const angle = Math.PI * progress;
      const alpha = 1 - progress;
      const baseY = this.clearOwner === activeOwner ? halfRows : 0;
      for (const localRow of this.clearRows) {
        for (let x = 0; x < GAME_CONFIG.COLS; x += 1) {
          const cell = this.board.getCellForOwner(this.clearOwner, localRow, x);
          if (!cell || cell.value === 0) continue;
          const renderY = this.clearOwner === activeOwner
            ? baseY + localRow
            : maxIndex - localRow;
          const centerX = (x + 0.5) * GAME_CONFIG.BLOCK_SIZE;
          const centerY = (renderY + 0.5) * GAME_CONFIG.BLOCK_SIZE;
          ctx.save();
          ctx.translate(centerX, centerY);
          const scaleY = Math.cos(angle);
          const skewX = Math.sin(angle) * 0.2;
          ctx.transform(1, 0, skewX, scaleY, 0, 0);
          const shade = 0.65 + 0.35 * Math.cos(angle);
          ctx.globalAlpha = alpha * shade;
          ctx.fillStyle = GAME_CONFIG.COLORS[cell.value];
          const size = GAME_CONFIG.BLOCK_SIZE;
          ctx.fillRect(-size / 2, -size / 2, size, size);
          ctx.globalAlpha = alpha * (1 - shade) * 0.4;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(-size / 2, -size / 2, size, size);
          ctx.restore();
        }
      }
    }

    if (!this.isClearing) {
      const blocks = getBlocks(this.activePiece);
      for (const block of blocks) {
        const x = this.activePiece.x + block.x;
        const y = this.activePiece.y + block.y;
        if (y < 0) continue;
        drawCell(ctx, x, y, GAME_CONFIG.COLORS[this.activePiece.type], 1);
      }

      const ghostY = this.getGhostY();
      if (ghostY !== this.activePiece.y) {
        ctx.save();
        ctx.strokeStyle = "rgba(220, 220, 220, 0.7)";
        ctx.globalAlpha = 0.8;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = "rgba(220, 220, 220, 0.45)";
        ctx.shadowBlur = 4;
        for (const block of blocks) {
          const x = this.activePiece.x + block.x;
          const y = ghostY + block.y;
          if (y < 0) continue;
          const size = GAME_CONFIG.BLOCK_SIZE;
          ctx.strokeRect(x * size + 1, y * size + 1, size - 2, size - 2);
        }
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 0.16;
        ctx.fillStyle = GAME_CONFIG.COLORS[this.activePiece.type];
        for (const block of blocks) {
          const x = this.activePiece.x + block.x;
          const y = ghostY + block.y;
          if (y < 0) continue;
          const size = GAME_CONFIG.BLOCK_SIZE;
          ctx.fillRect(x * size + 2, y * size + 2, size - 4, size - 4);
        }
        ctx.restore();
      }
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

    if (this.tetrisFlashTimer > 0) {
      const t = 1 - this.tetrisFlashTimer / this.tetrisFlashDuration;
      const pulse = 0.5 + 0.5 * Math.sin(t * Math.PI * 2);
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.06 + 0.1 * pulse})`;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      ctx.restore();
    }

    if (this.tetrisTextTimer > 0) {
      const t = 1 - this.tetrisTextTimer / this.tetrisTextDuration;
      const fade = Math.max(0, 1 - t);
      const driftX = 40 * t;
      const driftY = 20 * t;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * fade})`;
      ctx.font = "55px \"IBM Plex Mono\", Menlo, Consolas, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.shadowColor = "rgba(255, 255, 255, 0.6)";
      ctx.shadowBlur = 8;
      ctx.fillText("TETRIS!", ctx.canvas.width / 2 + driftX, ctx.canvas.height / 2 - 40 + driftY);
      ctx.restore();
    }

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#e6e6e6";
    ctx.font = "16px \"IBM Plex Mono\", Menlo, Consolas, monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    const hudX = GAME_CONFIG.GRID_MARGIN * 2
      + GAME_CONFIG.COLS * GAME_CONFIG.BLOCK_SIZE
      + 12;
    let hudY = 12;
    ctx.fillText("SCORE", hudX, hudY);
    hudY += 20;
    ctx.font = "22px \"IBM Plex Mono\", Menlo, Consolas, monospace";
    ctx.fillText(String(this.score).padStart(6, "0"), hudX, hudY);
    hudY += 32;
    ctx.font = "16px \"IBM Plex Mono\", Menlo, Consolas, monospace";
    ctx.fillText("LEVEL", hudX, hudY);
    hudY += 20;
    ctx.font = "20px \"IBM Plex Mono\", Menlo, Consolas, monospace";
    ctx.fillText(String(this.level), hudX, hudY);
    hudY += 30;
    ctx.font = "16px \"IBM Plex Mono\", Menlo, Consolas, monospace";
    ctx.fillText("LINES", hudX, hudY);
    hudY += 20;
    ctx.font = "20px \"IBM Plex Mono\", Menlo, Consolas, monospace";
    ctx.fillText(String(this.lines), hudX, hudY);
    ctx.restore();

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#e6e6e6";
    ctx.font = "14px \"IBM Plex Mono\", Menlo, Consolas, monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    const panelX = GAME_CONFIG.GRID_MARGIN * 2
      + GAME_CONFIG.COLS * GAME_CONFIG.BLOCK_SIZE
      + 12;
    let panelY = 190;
    ctx.fillText("HOLD", panelX, panelY);
    panelY += 18;
    const holdBox = { x: panelX, y: panelY, w: 96, h: 96 };
    this.holdBoxRect = holdBox;
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
    ctx.lineWidth = 2;
    ctx.strokeRect(holdBox.x, holdBox.y, holdBox.w, holdBox.h);
    ctx.restore();
    this.drawMiniPiece(ctx, this.holdType, holdBox.x, holdBox.y, holdBox.w, holdBox.h);
    panelY += 116;
    ctx.fillText("NEXT", panelX, panelY);
    panelY += 18;
    for (let i = 0; i < this.nextQueue.length; i += 1) {
      this.drawMiniPiece(ctx, this.nextQueue[i], panelX, panelY, 80, 80);
      panelY += 88;
    }
    ctx.restore();

    if (this.paused) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = "rgba(0, 0, 0, 1.0)";
      ctx.fillRect(
        GAME_CONFIG.GRID_MARGIN,
        0,
        GAME_CONFIG.COLS * GAME_CONFIG.BLOCK_SIZE,
        GAME_CONFIG.ROWS * GAME_CONFIG.BLOCK_SIZE
      );
      const touchPause = this.viewportScale < 1;
      const panelW = touchPause ? 360 : 320;
      const panelH = touchPause ? Math.min(420, ctx.canvas.height * 0.4) : 150;
      const panelX = (ctx.canvas.width - panelW) / 2;
      const panelY = (ctx.canvas.height - panelH) / 2;
      ctx.fillStyle = "rgba(10, 10, 10, 0.95)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.lineWidth = 2;
      ctx.fillRect(panelX, panelY, panelW, panelH);
      ctx.strokeRect(panelX, panelY, panelW, panelH);
      ctx.fillStyle = "#ffffff";
      ctx.font = `${touchPause ? 28 : 24}px "IBM Plex Mono", Menlo, Consolas, monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("PAUSED", ctx.canvas.width / 2, panelY + 36);

      const buttonW = touchPause ? 220 : 90;
      const buttonH = touchPause ? 64 : 32;
      const gap = touchPause ? 26 : 12;
      const buttonsY = touchPause
        ? panelY + panelH - (36 + buttonH * 3 + gap * 2)
        : panelY + panelH - 52;
      const totalW = buttonW * 3 + gap * 2;
      const startX = panelX + (panelW - totalW) / 2;
      const resumeX = touchPause ? panelX + (panelW - buttonW) / 2 : startX;
      const restartX = touchPause ? resumeX : resumeX + buttonW + gap;
      const endX = touchPause ? resumeX : restartX + buttonW + gap;
      const resumeY = buttonsY;
      const restartY = touchPause ? resumeY + buttonH + gap : buttonsY;
      const endY = touchPause ? restartY + buttonH + gap : buttonsY;
      ctx.fillStyle = "#1f1f1f";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.fillRect(resumeX, resumeY, buttonW, buttonH);
      ctx.strokeRect(resumeX, resumeY, buttonW, buttonH);
      ctx.fillRect(restartX, restartY, buttonW, buttonH);
      ctx.strokeRect(restartX, restartY, buttonW, buttonH);
      ctx.fillRect(endX, endY, buttonW, buttonH);
      ctx.strokeRect(endX, endY, buttonW, buttonH);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
      ctx.lineWidth = 2;
      if (this.pauseActionIndex === 0) {
        ctx.strokeRect(resumeX - 2, resumeY - 2, buttonW + 4, buttonH + 4);
      } else if (this.pauseActionIndex === 1) {
        ctx.strokeRect(restartX - 2, restartY - 2, buttonW + 4, buttonH + 4);
      } else {
        ctx.strokeRect(endX - 2, endY - 2, buttonW + 4, buttonH + 4);
      }
      ctx.fillStyle = "#e6e6e6";
      ctx.font = `${touchPause ? 20 : 14}px "IBM Plex Mono", Menlo, Consolas, monospace`;
      ctx.fillText("RESUME", resumeX + buttonW / 2, resumeY + buttonH / 2);
      ctx.fillText("RESTART", restartX + buttonW / 2, restartY + buttonH / 2);
      ctx.fillText("END", endX + buttonW / 2, endY + buttonH / 2);
      this.pauseButtons = {
        resume: { x: resumeX, y: resumeY, w: buttonW, h: buttonH },
        restart: { x: restartX, y: restartY, w: buttonW, h: buttonH },
        end: { x: endX, y: endY, w: buttonW, h: buttonH }
      };
      this.pauseHover = null;
      if (this.pausePointer) {
        const { x, y } = this.pausePointer;
        const hoverResume = x >= resumeX && x <= resumeX + buttonW
          && y >= resumeY && y <= resumeY + buttonH;
        const hoverRestart = x >= restartX && x <= restartX + buttonW
          && y >= restartY && y <= restartY + buttonH;
        const hoverEnd = x >= endX && x <= endX + buttonW
          && y >= endY && y <= endY + buttonH;
        if (hoverResume) this.pauseHover = "resume";
        if (hoverRestart) this.pauseHover = "restart";
        if (hoverEnd) this.pauseHover = "end";
      }
      ctx.restore();

      if (this.pauseConfirmActive) {
        const confirmW = touchPause ? 360 : 280;
        const confirmH = touchPause ? 300 : 120;
        const confirmOffsetX = touchPause ? -20 : -20;
        const confirmX = (ctx.canvas.width - confirmW) / 2 + confirmOffsetX;
        const confirmY = (ctx.canvas.height - confirmH) / 2;
        ctx.save();
        ctx.fillStyle = "rgba(5, 5, 5, 0.96)";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
        ctx.lineWidth = 2;
        ctx.fillRect(confirmX, confirmY, confirmW, confirmH);
        ctx.strokeRect(confirmX, confirmY, confirmW, confirmH);
        ctx.fillStyle = "#ffffff";
        ctx.font = "16px \"IBM Plex Mono\", Menlo, Consolas, monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("EXIT TO MENU?", confirmX + confirmW / 2, confirmY + 30);
        const btnW = touchPause ? 210 : 80;
        const btnH = touchPause ? 58 : 28;
        const yesX = touchPause
          ? confirmX + (confirmW - btnW) / 2
          : confirmX + 28;
        const noX = touchPause
          ? yesX
          : confirmX + confirmW - btnW - 28;
        const btnY = touchPause ? confirmY + 118 : confirmY + confirmH - 46;
        const noY = touchPause ? btnY + btnH + 30 : btnY;
        ctx.fillStyle = "#1f1f1f";
        ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
        ctx.lineWidth = 1.5;
        ctx.fillRect(yesX, btnY, btnW, btnH);
        ctx.strokeRect(yesX, btnY, btnW, btnH);
        ctx.fillRect(noX, noY, btnW, btnH);
        ctx.strokeRect(noX, noY, btnW, btnH);
        ctx.fillStyle = "#e6e6e6";
        ctx.font = `${touchPause ? 18 : 14}px "IBM Plex Mono", Menlo, Consolas, monospace`;
        ctx.fillText("YES", yesX + btnW / 2, btnY + btnH / 2);
        ctx.fillText("NO", noX + btnW / 2, noY + btnH / 2);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
        ctx.lineWidth = 2;
        const highlightX = this.pauseConfirmIndex === 0 ? yesX : noX;
        const highlightY = this.pauseConfirmIndex === 0 ? btnY : noY;
        ctx.strokeRect(highlightX - 2, highlightY - 2, btnW + 4, btnH + 4);
        this.pauseConfirmButtons = {
          yes: { x: yesX, y: btnY, w: btnW, h: btnH },
          no: { x: noX, y: noY, w: btnW, h: btnH }
        };
        const padding = 0;
        const pointer = this.pausePointer;
        const hoverYes = pointer
          && pointer.x >= yesX - padding
          && pointer.x <= yesX + btnW + padding
          && pointer.y >= btnY - padding
          && pointer.y <= btnY + btnH + padding;
        const hoverNo = pointer
          && pointer.x >= noX - padding
          && pointer.x <= noX + btnW + padding
          && pointer.y >= noY - padding
          && pointer.y <= noY + btnH + padding;
        if (hoverYes) this.pauseHover = "confirm-yes";
        if (hoverNo) this.pauseHover = "confirm-no";
        ctx.restore();
      }
    }
  }

  drawMiniPiece(ctx, type, x, y, boxW = 60, boxH = 60) {
    if (!type) return;
    const cell = 18;
    const piece = { type, x: 0, y: 0, rotation: 0 };
    const blocks = getBlocks(piece);
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const block of blocks) {
      if (block.x < minX) minX = block.x;
      if (block.y < minY) minY = block.y;
      if (block.x > maxX) maxX = block.x;
      if (block.y > maxY) maxY = block.y;
    }
    const width = (maxX - minX + 1) * cell;
    const height = (maxY - minY + 1) * cell;
    const offsetX = x + (boxW - width) / 2;
    const offsetY = y + (boxH - height) / 2;
    ctx.save();
    ctx.fillStyle = GAME_CONFIG.COLORS[type];
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 2;
    for (const block of blocks) {
      const px = offsetX + (block.x - minX) * cell;
      const py = offsetY + (block.y - minY) * cell;
      ctx.fillRect(px, py, cell, cell);
      ctx.strokeRect(px + 1, py + 1, cell - 2, cell - 2);
    }
    ctx.restore();
  }
}
