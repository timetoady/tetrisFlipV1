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
    this.onGarbageCleared = callbacks.onGarbageCleared || (() => {});
    this.onPauseBack = callbacks.onPauseBack || (() => {});
    this.board = new Board();
    this.randomizer = new Randomizer();
    this.p2Randomizer = new Randomizer();
    this.queueSize = 3;
    this.nextQueue = [];
    this.p2Queue = [];
    this.holdType = null;
    this.holdUsed = false;
    this.p2HoldType = null;
    this.p2HoldUsed = false;
    this.startingLevel = 1;
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.dropInterval = this.getDropInterval(this.level);
    this.dropTimer = 0;
    this.p2Score = 0;
    this.p2Lines = 0;
    this.p2Level = 1;
    this.p2DropInterval = this.getDropInterval(this.p2Level);
    this.p2DropTimer = 0;
    this.p2PlacementDuration = 5000;
    this.p2PlacementTimer = 0;
    this.elapsedTimeMs = 0;
    this.animTimeMs = 0;
    this.freezeLevel = false;
    this.mode = "marathon";
    this.garbageHeight = 0;
    this.lives = 0;
    this.maxLives = 0;
    this.lifeLossPending = false;
    this.lifeLossOwner = null;
    this.lifeLossChoiceIndex = 0;
    this.lifeLossButtons = null;
    this.lifeLossHover = null;
    this.lifeLossAnimating = false;
    this.lifeLossHeartTimer = 0;
    this.lifeLossHeartDuration = 600;
    this.lifeLossAnimTimer = 0;
    this.lifeLossAnimDuration = 2000;
    this.lifeLossFlashTimer = 0;
    this.lifeLossFlashDuration = 600;
    this.lifeLossHeartIndex = null;
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
    this.p2LeftHold = 0;
    this.p2RightHold = 0;
    this.p2LeftRepeat = 0;
    this.p2RightRepeat = 0;
    this.p2UpHold = 0;
    this.p2DownHold = 0;
    this.p2UpRepeat = 0;
    this.p2DownRepeat = 0;
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
    this.p2LockTimer = 0;
    this.p2LockMoves = 0;
    this.p2GroundedTimer = 0;
    this.p2LockResetCooldown = 0;
    this.p2IsGrounded = false;
    this.isClearing = false;
    this.clearTimer = 0;
    this.clearDuration = 0;
    this.clearRows = [];
    this.clearOwner = null;
    this.tetrisFlashTimer = 0;
    this.tetrisFlashDuration = 0;
    this.tetrisTextTimer = 0;
    this.tetrisTextDuration = 0;
    this.callouts = [];
    this.calloutMax = 4;
    this.calloutBaseDuration = 1400;
    this.tetrisStreak = 0;
    this.tetrisStreakMax = 4;
    this.flipChain = 0;
    this.flipChainMax = 4;
    this.flipSinceClear = false;
    this.lastLockWasFlipJam = false;
    this.lastClearWasFlipJam = false;
    this.lastClearWasRisk = false;
    this.lastClearWasClearout = false;
    this.momentumValue = 0;
    this.p2MomentumValue = 0;
    this.momentumMax = 100;
    this.momentumBurstTimer = 0;
    this.p2MomentumBurstTimer = 0;
    this.momentumBurstDuration = 7000;
    this.momentumDecayPerMs = 0.004;
    this.momentumGainTable = [0, 18, 30, 42, 56];
    this.momentumHardDropGain = 4;
    this.momentumRecoveryTimer = 0;
    this.p2MomentumRecoveryTimer = 0;
    this.momentumRecoveryDuration = 5000;
    this.momentumRecoveryMultiplier = 0.7;
    this.riskHeightThreshold = 14;
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
    this.p2Piece = null;
    this.clearPlayer = null;
  }

  getDropInterval(level) {
    // Tuning hook: faster overall progression while keeping level 1 readable.
    const frameTable = [
      50, 48, 44, 41, 38, 35, 32, 29, 26, 24, 22,
      20, 18, 16, 14, 12, 10, 8, 6, 4, 2
    ];
    const safeLevel = Math.max(0, level);
    if (safeLevel >= 21) return 1 * (1000 / 60);
    const frames = frameTable[Math.min(safeLevel, frameTable.length - 1)];
    return frames * (1000 / 60);
  }

  resetProgress() {
    this.score = 0;
    this.level = this.startingLevel;
    this.lines = 0;
    this.dropInterval = this.getDropInterval(this.level);
    this.dropTimer = 0;
    this.p2Score = 0;
    this.p2Lines = 0;
    this.p2Level = this.startingLevel;
    this.p2DropInterval = this.getDropInterval(this.p2Level);
    this.p2DropTimer = 0;
    this.p2PlacementTimer = 0;
    this.elapsedTimeMs = 0;
    this.animTimeMs = 0;
  }

  setStartingLevel(level) {
    this.startingLevel = Math.min(35, Math.max(0, level));
  }

  setFreezeLevel(freeze) {
    this.freezeLevel = Boolean(freeze);
  }

  setMode(mode) {
    this.mode = mode || "marathon";
  }

  isCoopMode() {
    return this.mode === "coop";
  }

  isSirtetMode() {
    return this.mode === "sirtet";
  }

  getActivePieceOwner() {
    return this.isSirtetMode() ? this.board.getInactiveOwner() : this.board.getActiveOwner();
  }

  getP2Owner() {
    return this.board.getInactiveOwner();
  }

  getActiveGravityDirection() {
    return this.isSirtetMode() ? -1 : 1;
  }

  getMomentumKeys(playerId) {
    if (playerId === "p2") {
      return {
        valueKey: "p2MomentumValue",
        burstKey: "p2MomentumBurstTimer",
        recoveryKey: "p2MomentumRecoveryTimer"
      };
    }
    return {
      valueKey: "momentumValue",
      burstKey: "momentumBurstTimer",
      recoveryKey: "momentumRecoveryTimer"
    };
  }

  getGridOffsetX() {
    return GAME_CONFIG.GRID_MARGIN + (this.isCoopMode() ? GAME_CONFIG.HUD_WIDTH : 0);
  }

  setGarbageHeight(height) {
    const clamped = Math.max(0, Math.min(9, Math.floor(height)));
    this.garbageHeight = clamped;
  }

  setRedemptionLives(lives) {
    const clamped = Math.max(0, Math.min(3, Math.floor(lives)));
    this.maxLives = clamped;
    this.lives = clamped;
  }

  getGarbageRowCount() {
    if (this.garbageHeight <= 0) return 0;
    const halfRows = GAME_CONFIG.ROWS / 2;
    const minRows = 2;
    const maxRows = Math.max(minRows, halfRows - GAME_CONFIG.SPAWN_BUFFER);
    const clamped = Math.min(9, Math.max(1, this.garbageHeight));
    const t = (clamped - 1) / 8;
    return Math.floor(minRows + t * (maxRows - minRows));
  }

  seedGarbage() {
    if (this.mode !== "garbage" || this.garbageHeight <= 0) return;
    const halfRows = GAME_CONFIG.ROWS / 2;
    const height = Math.min(this.getGarbageRowCount(), halfRows);
    const owners = [OWNERS.FIELD_A, OWNERS.FIELD_B];
    owners.forEach((owner) => {
      for (let i = 0; i < height; i += 1) {
        const localRow = halfRows - 1 - i;
        const minBlocks = Math.max(2, Math.floor(GAME_CONFIG.COLS * 0.3));
        const maxBlocks = Math.max(minBlocks, GAME_CONFIG.COLS - 1);
        const fillCount = minBlocks
          + Math.floor(Math.random() * (maxBlocks - minBlocks + 1));
        const filled = new Set();
        while (filled.size < fillCount) {
          filled.add(Math.floor(Math.random() * GAME_CONFIG.COLS));
        }
        for (let x = 0; x < GAME_CONFIG.COLS; x += 1) {
          const value = filled.has(x) ? 8 : 0;
          this.board.setCellForOwner(owner, localRow, x, value);
        }
      }
    });
  }

  hasRemainingGarbage() {
    for (let y = 0; y < GAME_CONFIG.ROWS; y += 1) {
      for (let x = 0; x < GAME_CONFIG.COLS; x += 1) {
        if (this.board.grid[y][x].value === 8) {
          return true;
        }
      }
    }
    return false;
  }

  queueLifeLoss(owner) {
    this.lifeLossPending = true;
    this.lifeLossOwner = owner;
    this.lifeLossChoiceIndex = 0;
    this.lifeLossButtons = null;
    this.lifeLossHover = null;
  }

  triggerLifeLoss() {
    this.lifeLossPending = false;
    this.lifeLossAnimating = true;
    this.lifeLossHeartTimer = this.lifeLossHeartDuration;
    this.lifeLossAnimTimer = 0;
    this.lifeLossFlashTimer = 0;
    this.lifeLossHeartIndex = Math.max(0, this.lives - 1);
    this.lives = Math.max(0, this.lives - 1);
    this.activePiece = null;
    this.resetLockState();
    this.playHeartBreakSound();
  }

  finalizeLifeLoss() {
    if (this.lifeLossOwner) {
      this.board.removeBottomRowsForOwner(this.lifeLossOwner, 6);
    }
    this.lifeLossAnimating = false;
    this.lifeLossHeartTimer = 0;
    this.lifeLossAnimTimer = 0;
    this.lifeLossFlashTimer = 0;
    this.lifeLossHeartIndex = null;
    this.lifeLossOwner = null;
    this.activePiece = this.spawnPiece();
    this.holdUsed = false;
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
    this.p2HoldType = null;
    this.p2HoldUsed = false;
  }

  resetRewardState() {
    this.tetrisStreak = 0;
    this.flipChain = 0;
    this.flipSinceClear = false;
    this.lastLockWasFlipJam = false;
    this.lastClearWasFlipJam = false;
    this.lastClearWasRisk = false;
    this.lastClearWasClearout = false;
    this.callouts = [];
    this.momentumValue = 0;
    this.p2MomentumValue = 0;
    this.momentumBurstTimer = 0;
    this.p2MomentumBurstTimer = 0;
    this.momentumRecoveryTimer = 0;
    this.p2MomentumRecoveryTimer = 0;
  }

  addCallout(text, options = {}) {
    const duration = Number.isFinite(options.duration)
      ? options.duration
      : this.calloutBaseDuration;
    const size = Number.isFinite(options.size) ? options.size : 26;
    const color = options.color || "#ffffff";
    this.callouts.push({
      text,
      duration,
      timer: duration,
      size,
      color
    });
    if (this.callouts.length > this.calloutMax) {
      this.callouts.shift();
    }
  }

  resetGameState() {
    this.board.reset();
    this.resetProgress();
    this.resetHold();
    this.resetRewardState();
    this.nextQueue = [];
    this.p2Queue = [];
    this.refillQueue();
    this.refillP2Queue();
    this.resetLockState();
    this.resetP2LockState();
    this.seedGarbage();
    if (this.mode === "redemption") {
      this.lives = this.maxLives;
    } else {
      this.lives = 0;
    }
    this.lifeLossPending = false;
    this.lifeLossOwner = null;
    this.lifeLossChoiceIndex = 0;
    this.lifeLossButtons = null;
    this.lifeLossHover = null;
    this.lifeLossAnimating = false;
    this.lifeLossHeartTimer = 0;
    this.lifeLossAnimTimer = 0;
    this.lifeLossFlashTimer = 0;
    this.lifeLossHeartIndex = null;
    this.gameOver = false;
    this.isClearing = false;
    this.clearTimer = 0;
    this.clearDuration = 0;
    this.clearRows = [];
    this.clearOwner = null;
    this.clearPlayer = null;
    this.tetrisFlashTimer = 0;
    this.tetrisFlashDuration = 0;
    this.tetrisTextTimer = 0;
    this.tetrisTextDuration = 0;
    this.p2Piece = null;
    this.p2PlacementTimer = 0;
  }

  reset() {
    this.resetGameState();
    this.activePiece = this.spawnPiece();
    if (this.isCoopMode()) {
      this.p2Piece = this.spawnP2Piece();
      this.resetP2LockState();
    } else {
      this.p2Piece = null;
    }
  }

  getScoreState() {
    return {
      score: this.score,
      lines: this.lines,
      level: this.level,
      timeMs: this.elapsedTimeMs,
      p2Score: this.p2Score,
      p2Lines: this.p2Lines,
      p2Level: this.p2Level,
      combinedScore: this.score + this.p2Score
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
    if (this.lifeLossPending || this.lifeLossAnimating) return false;
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

  refillP2Queue() {
    while (this.p2Queue.length < this.queueSize) {
      this.p2Queue.push(this.p2Randomizer.next());
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

  takeNextTypeForP2() {
    if (this.p2Queue.length === 0) {
      this.refillP2Queue();
    }
    const next = this.p2Queue.shift();
    this.refillP2Queue();
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

  getSpawnPositionForOwner(owner, type) {
    const x = Math.floor(GAME_CONFIG.COLS / 2);
    const halfRows = GAME_CONFIG.ROWS / 2;
    const tempPiece = createPiece(type, x, 0);
    if (this.isCoopMode()) {
      if (this.isOwnerActive(owner)) {
        const minBlockY = this.getMinBlockY(tempPiece);
        return { x, y: halfRows - minBlockY };
      }
      const maxBlockY = this.getMaxBlockYForType(type);
      const bottomRow = halfRows - 1;
      return { x, y: bottomRow - maxBlockY };
    }
    if (this.isOwnerActive(owner)) {
      return { x, y: 18 };
    }
    const maxBlockY = this.getMaxBlockY(tempPiece);
    const bottomRow = halfRows - 1;
    return { x, y: bottomRow - maxBlockY };
  }

  isSpawnBlockedForOwner(owner, piece, otherPiece = null) {
    return this.collidesForOwner(piece, owner, 0, 0, piece.rotation, otherPiece);
  }

  spawnP2Piece() {
    if (!this.isCoopMode()) return null;
    const type = this.takeNextTypeForP2();
    const owner = this.getP2Owner();
    const pos = this.getSpawnPositionForOwner(owner, type);
    const piece = createPiece(type, pos.x, pos.y);
    if (this.isSpawnBlockedForOwner(owner, piece, this.activePiece)) {
      this.gameOver = true;
      this.onGameOver();
      return piece;
    }
    this.p2PlacementTimer = this.p2PlacementDuration;
    return piece;
  }

  spawnPiece() {
    const type = this.takeNextType();
    const owner = this.getActivePieceOwner();
    const pos = this.getSpawnPositionForOwner(owner, type);
    let piece = createPiece(type, pos.x, pos.y);
    const otherPiece = this.isCoopMode() ? this.p2Piece : null;
    let blocked = false;
    if (owner === this.board.getActiveOwner() && !this.isSirtetMode()) {
      blocked = this.isSpawnBlocked();
      if (!blocked && otherPiece) {
        blocked = this.piecesOverlap(piece, otherPiece);
      }
    } else {
      blocked = this.isSpawnBlockedForOwner(owner, piece, otherPiece);
    }
    if (blocked) {
      if (this.mode === "redemption" && this.lives > 0
          && !this.lifeLossPending && !this.lifeLossAnimating) {
        this.queueLifeLoss(this.board.getActiveOwner());
      } else {
        this.gameOver = true;
        this.onGameOver();
      }
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

  playThudSound() {
    const ctx = this.ensureAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = 120;
    gain.gain.value = this.getSfxGain(0.06);
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

  playHeartBreakSound() {
    const ctx = this.ensureAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc2.type = "sawtooth";
    const now = ctx.currentTime;
    gain.gain.value = this.getSfxGain(0.1);
    osc.detune.value = -15;
    osc2.detune.value = 12;
    osc.connect(gain).connect(ctx.destination);
    osc2.connect(gain);
    osc.frequency.setValueAtTime(520, now);
    osc2.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.18);
    osc2.frequency.exponentialRampToValueAtTime(170, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
    osc.start(now);
    osc2.start(now);
    osc.stop(now + 0.32);
    osc2.stop(now + 0.34);
  }
  
  playLifeShiftSound(durationSeconds = 0.6) {
    const ctx = this.ensureAudioContext();
    if (!ctx) return;
    const duration = Math.max(3.0, durationSeconds);
    const length = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) {
      const decay = Math.pow(1 - i / length, 0.6);
      data[i] = (Math.random() * 2 - 1) * decay;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const lowpass = ctx.createBiquadFilter();
    const shaper = ctx.createWaveShaper();
    const gain = ctx.createGain();
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    const delay = ctx.createDelay();
    const feedback = ctx.createGain();
    const feedbackFilter = ctx.createBiquadFilter();
    const mix = ctx.createGain();
    lowpass.type = "lowpass";
    lowpass.Q.value = 0.9;
    delay.delayTime.value = 0.5;
    feedbackFilter.type = "lowpass";
    feedbackFilter.frequency.value = 600;
    feedbackFilter.Q.value = 0.7;
    feedback.gain.value = 0.6;
    mix.gain.value = 0.7;
    gain.gain.value = this.getSfxGain(0.26);
    const curve = new Float32Array(256);
    for (let i = 0; i < curve.length; i += 1) {
      const x = (i / (curve.length - 1)) * 2 - 1;
      curve[i] = Math.sign(x) * Math.pow(Math.abs(x), 0.65);
    }
    shaper.curve = curve;
    shaper.oversample = "4x";
    noise.connect(lowpass);
    lowpass.connect(shaper);
    shaper.connect(gain);
    gain.connect(mix);
    mix.connect(ctx.destination);
    mix.connect(delay);
    delay.connect(feedbackFilter);
    feedbackFilter.connect(feedback);
    feedback.connect(delay);
    delay.connect(ctx.destination);
    const now = ctx.currentTime;
    const baseGain = this.getSfxGain(0.22);
    gain.gain.setValueAtTime(baseGain, now);
    lfo.type = "sine";
    lfo.frequency.value = 1.6;
    lfoGain.gain.value = this.getSfxGain(0.1);
    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    lowpass.frequency.setValueAtTime(1000, now);
    lowpass.frequency.exponentialRampToValueAtTime(40, now + duration);
    noise.start(now);
    noise.stop(now + duration);
    lfo.start(now);
    lfo.stop(now + duration);
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
    gain.gain.value = this.getSfxGain(0.05);
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

  playRewardTone(startFreq, endFreq, duration, gainValue = 0.07, type = "triangle") {
    const ctx = this.ensureAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    const now = ctx.currentTime;
    osc.frequency.setValueAtTime(startFreq, now);
    osc.frequency.exponentialRampToValueAtTime(endFreq, now + duration);
    gain.gain.value = this.getSfxGain(gainValue);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration + 0.06);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.08);
  }

  playFlipJumpRewardSound() {
    this.playRewardTone(520, 760, 0.12, 0.07, "square");
  }

  playFlipChainRewardSound(chain) {
    const base = 360 + chain * 40;
    this.playRewardTone(base, base * 1.25, 0.1, 0.06, "triangle");
  }

  playTetrisStreakRewardSound(streak) {
    const base = 420 + streak * 60;
    this.playRewardTone(base, base * 1.4, 0.16, 0.06, "sawtooth");
  }

  playClearoutRewardSound() {
    this.playRewardTone(260, 520, 0.2, 0.08, "triangle");
  }

  playRiskRewardSound() {
    this.playRewardTone(220, 330, 0.18, 0.07, "triangle");
  }

  playMomentumBurstSound() {
    this.playRewardTone(330, 660, 0.24, 0.07, "sawtooth");
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

  getMaxBlockY(piece) {
    const blocks = getBlocks(piece);
    let max = -Infinity;
    for (const block of blocks) {
      if (block.y > max) max = block.y;
    }
    return max;
  }

  getMaxBlockYForType(type) {
    let max = -Infinity;
    const tempPiece = createPiece(type, 0, 0);
    for (let rotation = 0; rotation < 4; rotation += 1) {
      const blocks = getBlocks(tempPiece, rotation);
      for (const block of blocks) {
        if (block.y > max) max = block.y;
      }
    }
    return max;
  }

  isOwnerActive(owner) {
    return owner === this.board.getActiveOwner();
  }

  getLocalRowForOwnerAtRenderY(owner, renderY) {
    const halfRows = GAME_CONFIG.ROWS / 2;
    const maxIndex = halfRows - 1;
    return this.isOwnerActive(owner)
      ? renderY - halfRows
      : maxIndex - renderY;
  }

  overlapsOwnerAtY(piece, owner, testY) {
    const blocks = getBlocks(piece);
    const halfRows = GAME_CONFIG.ROWS / 2;
    const maxIndex = halfRows - 1;
    const isActive = this.isOwnerActive(owner);

    for (const block of blocks) {
      const x = piece.x + block.x;
      const y = testY + block.y;
      if (x < 0 || x >= GAME_CONFIG.COLS) continue;
      if (isActive) {
        if (y < 0 || y >= GAME_CONFIG.ROWS) continue;
        const localRow = y - halfRows;
        if (localRow < 0 || localRow >= halfRows) continue;
        const cell = this.board.getCellForOwner(owner, localRow, x);
        if (cell && cell.value !== 0) {
          return true;
        }
      } else {
        if (y < 0 || y >= halfRows) continue;
        const localRow = maxIndex - y;
        const cell = this.board.getCellForOwner(owner, localRow, x);
        if (cell && cell.value !== 0) {
          return true;
        }
      }
    }

    return false;
  }

  isClearoutForOwner(owner, localRows) {
    if (!localRows || localRows.length === 0) return false;
    const halfRows = GAME_CONFIG.ROWS / 2;
    const cleared = new Set(localRows);
    for (let localRow = 0; localRow < halfRows; localRow += 1) {
      if (cleared.has(localRow)) continue;
      for (let x = 0; x < GAME_CONFIG.COLS; x += 1) {
        const cell = this.board.getCellForOwner(owner, localRow, x);
        if (cell && cell.value !== 0) {
          return false;
        }
      }
    }
    return true;
  }

  getOwnerStackHeight(owner) {
    const halfRows = GAME_CONFIG.ROWS / 2;
    let topFilled = null;
    for (let localRow = 0; localRow < halfRows; localRow += 1) {
      for (let x = 0; x < GAME_CONFIG.COLS; x += 1) {
        const cell = this.board.getCellForOwner(owner, localRow, x);
        if (cell && cell.value !== 0) {
          topFilled = localRow;
          break;
        }
      }
      if (topFilled !== null) break;
    }
    if (topFilled === null) return 0;
    return halfRows - topFilled;
  }

  handleFlipJamForPiece(piece, owner, gravityDirection, playerId) {
    if (!piece) return false;
    if (!this.overlapsOwnerAtY(piece, owner, piece.y)) {
      return false;
    }

    const halfRows = GAME_CONFIG.ROWS / 2;
    const minBlockY = this.getMinBlockY(piece);
    const maxBlockY = this.getMaxBlockY(piece);
    const shiftDir = gravityDirection === 1 ? -1 : 1;
    const startY = piece.y;
    let maxShift = 0;

    if (shiftDir < 0) {
      const ceilingY = halfRows - minBlockY;
      maxShift = Math.max(0, piece.y - ceilingY);
    } else {
      const floorY = (halfRows - 1) - maxBlockY;
      maxShift = Math.max(0, floorY - piece.y);
    }

    let shift = null;
    for (let step = 0; step <= maxShift; step += 1) {
      if (!this.overlapsOwnerAtY(piece, owner, piece.y + step * shiftDir)) {
        shift = step;
        break;
      }
    }

    if (shift === null) shift = maxShift;
    piece.y += shift * shiftDir;

    const jamCells = [];
    const blocks = getBlocks(piece);
    for (const block of blocks) {
      const x = piece.x + block.x;
      const y = piece.y + block.y;
      jamCells.push({ x, y });
    }
    this.jamFlashCells = jamCells;
    this.jamFlashTimer = this.jamFlashDuration;
    this.jamAnimTimer = this.jamAnimDuration;
    this.jamAnimFromY = startY;
    this.jamAnimToY = piece.y;
    this.jamAnimPiece = { ...piece };
    this.playSnapSound();

    this.lastLockWasFlipJam = true;
    this.lockPiece(playerId);
    return true;
  }

  piecesOverlap(piece, otherPiece, dx = 0, dy = 0, rotation = piece.rotation) {
    if (!piece || !otherPiece) return false;
    const blocks = getBlocks(piece, rotation);
    const otherBlocks = getBlocks(otherPiece);
    for (const block of blocks) {
      const x = piece.x + block.x + dx;
      const y = piece.y + block.y + dy;
      for (const otherBlock of otherBlocks) {
        const ox = otherPiece.x + otherBlock.x;
        const oy = otherPiece.y + otherBlock.y;
        if (x === ox && y === oy) return true;
      }
    }
    return false;
  }

  collidesForOwner(piece, owner, dx, dy, rotation = piece.rotation, otherPiece = null) {
    if (this.piecesOverlap(piece, otherPiece, dx, dy, rotation)) {
      return true;
    }
    const blocks = getBlocks(piece, rotation);
    const halfRows = GAME_CONFIG.ROWS / 2;
    const maxIndex = halfRows - 1;
    const isActive = this.isOwnerActive(owner);

    for (const block of blocks) {
      const x = piece.x + block.x + dx;
      const y = piece.y + block.y + dy;

      if (x < 0 || x >= GAME_CONFIG.COLS) {
        return true;
      }

      if (isActive) {
        if (y >= GAME_CONFIG.ROWS) {
          return true;
        }
        if (y < 0) continue;
        const localRow = y - halfRows;
        if (localRow < 0 || localRow >= halfRows) continue;
        const cell = this.board.getCellForOwner(owner, localRow, x);
        if (cell && cell.value !== 0) {
          return true;
        }
      } else {
        if (y < 0 || y >= halfRows) {
          return true;
        }
        const localRow = maxIndex - y;
        const cell = this.board.getCellForOwner(owner, localRow, x);
        if (cell && cell.value !== 0) {
          return true;
        }
      }
    }

    return false;
  }

  collides(piece, dx, dy, rotation = piece.rotation) {
    const activeOwner = this.getActivePieceOwner();
    const otherPiece = this.isCoopMode() ? this.p2Piece : null;
    return this.collidesForOwner(piece, activeOwner, dx, dy, rotation, otherPiece);
  }

  lockPiece(playerId = "p1") {
    const isP2 = playerId === "p2";
    const piece = isP2 ? this.p2Piece : this.activePiece;
    if (!piece) return;
    const owner = isP2 ? this.getP2Owner() : this.getActivePieceOwner();
    const { valueKey, burstKey, recoveryKey } = this.getMomentumKeys(playerId);
    const wasFlipJam = this.lastLockWasFlipJam;
    const preClearHeight = this.getOwnerStackHeight(owner);
    const blocks = getBlocks(piece);
    const halfRows = GAME_CONFIG.ROWS / 2;
    const maxIndex = halfRows - 1;
    const isActive = this.isOwnerActive(owner);
    for (const block of blocks) {
      const x = piece.x + block.x;
      const y = piece.y + block.y;
      if (isActive) {
        if (y < 0) continue;
        const localRow = y - halfRows;
        if (localRow < 0 || localRow >= halfRows) continue;
        this.board.setCellForOwner(owner, localRow, x, piece.type);
      } else {
        if (y < 0 || y >= halfRows) continue;
        const localRow = maxIndex - y;
        if (localRow < 0 || localRow >= halfRows) continue;
        this.board.setCellForOwner(owner, localRow, x, piece.type);
      }
    }

    const linesToClear = this.board.findClearLinesForOwner(owner);
    const cleared = linesToClear.length;
    if (cleared > 0) {
      let momentumBurstTriggered = false;
      const willClearout = this.isClearoutForOwner(owner, linesToClear);
      this.tetrisStreak = cleared === 4
        ? Math.min(this.tetrisStreak + 1, this.tetrisStreakMax)
        : 0;
      if (this.flipSinceClear) {
        this.flipChain = Math.min(this.flipChain + 1, this.flipChainMax);
      } else {
        this.flipChain = 0;
      }
      this.flipSinceClear = false;
      this.lastClearWasFlipJam = wasFlipJam;
      this.lastClearWasRisk = preClearHeight >= this.riskHeightThreshold;
      this.lastClearWasClearout = willClearout;
      const momentumGain = this.momentumGainTable[cleared] || 0;
      if (momentumGain > 0) {
        const gainScale = this[recoveryKey] > 0
          ? this.momentumRecoveryMultiplier
          : 1;
        const scaledGain = Math.max(1, Math.floor(momentumGain * gainScale));
        this[valueKey] = Math.min(this.momentumMax, this[valueKey] + scaledGain);
        if (this[valueKey] >= this.momentumMax && this[burstKey] <= 0) {
          this[burstKey] = this.momentumBurstDuration;
          this[recoveryKey] = 0;
          momentumBurstTriggered = true;
        }
      }
      this.isClearing = true;
      this.clearTimer = 0;
      this.clearDuration = cleared === 4 ? 900 : 420;
      this.clearRows = linesToClear;
      this.clearOwner = owner;
      this.clearPlayer = playerId;
      // Tuning hook: scoring table and multipliers for playtesting.
      const lineScores = [0, 100, 300, 500, 800];
      const flipJumpMultiplier = 1.25;
      const riskMultiplier = 1.2;
      const momentumBurstMultiplier = 1.75;
      const flipChainMultipliers = [1, 1.1, 1.2, 1.35, 1.5];
      const tetrisStreakMultipliers = [1, 1, 1.25, 1.5, 1.75];
      const clearoutBonusBase = 1500;
      let scoreMultiplier = 1;
      if (wasFlipJam) scoreMultiplier *= flipJumpMultiplier;
      if (this.flipChain > 0) {
        scoreMultiplier *= (flipChainMultipliers[this.flipChain] || 1);
      }
      if (this.lastClearWasRisk) scoreMultiplier *= riskMultiplier;
      if (this[burstKey] > 0) scoreMultiplier *= momentumBurstMultiplier;
      if (cleared === 4 && this.tetrisStreak >= 2) {
        scoreMultiplier *= (tetrisStreakMultipliers[this.tetrisStreak] || 1);
      }
      const scoreKey = isP2 ? "p2Score" : "score";
      const linesKey = isP2 ? "p2Lines" : "lines";
      const levelKey = isP2 ? "p2Level" : "level";
      const dropKey = isP2 ? "p2DropInterval" : "dropInterval";
      let score = this[scoreKey];
      let lines = this[linesKey];
      let level = this[levelKey];
      const baseScore = lineScores[cleared] * level;
      const lineScore = Math.round(baseScore * scoreMultiplier);
      score += lineScore;
      if (willClearout) {
        score += clearoutBonusBase * level;
      }
      if (wasFlipJam) {
        this.addCallout("FLIP POP", { color: "#b9ffd1" });
        this.playFlipJumpRewardSound();
      }
      if (this.flipChain > 0) {
        this.addCallout(`FLIP CHAIN x${this.flipChain}`, { color: "#9ad7ff" });
        this.playFlipChainRewardSound(this.flipChain);
      }
      if (this.lastClearWasRisk) {
        this.addCallout("HIGH WIRE", { color: "#ffb27a" });
        this.playRiskRewardSound();
      }
      if (cleared === 4 && this.tetrisStreak >= 2) {
        this.addCallout(`TETRIS STREAK x${this.tetrisStreak}`, { color: "#ffd1f0" });
        this.playTetrisStreakRewardSound(this.tetrisStreak);
      }
      if (momentumBurstTriggered) {
        this.addCallout("BURST", { color: "#fff07a", size: 30 });
        this.playMomentumBurstSound();
      }
      if (willClearout) {
        this.addCallout("CLEAROUT", { color: "#ffe08a", size: 30 });
        this.playClearoutRewardSound();
      }
      lines += cleared;
      if (cleared === 4) {
        this.playTetrisSound();
        this.tetrisFlashDuration = this.clearDuration;
        this.tetrisFlashTimer = this.tetrisFlashDuration;
        this.tetrisTextDuration = this.clearDuration + 500;
        this.tetrisTextTimer = this.tetrisTextDuration;
      } else {
        this.playLineClearSound(cleared);
      }
      const nextLevel = this.freezeLevel
        ? this.startingLevel
        : this.getLevelForLines(lines);
      if (!this.freezeLevel && nextLevel !== level) {
        this.playLevelUpSound(0.85);
      }
      level = nextLevel;
      this[scoreKey] = score;
      this[linesKey] = lines;
      this[levelKey] = level;
      this[dropKey] = this.getDropInterval(level);
    } else {
      this.tetrisStreak = 0;
      this.flipChain = 0;
      this.flipSinceClear = false;
      this.lastClearWasFlipJam = false;
      this.lastClearWasRisk = false;
      this.lastClearWasClearout = false;
    }
    this.lastLockWasFlipJam = false;
    if (!this.isClearing) {
      if (isP2) {
        this.p2Piece = this.spawnP2Piece();
        this.p2HoldUsed = false;
        this.resetP2LockState();
      } else {
        this.activePiece = this.spawnPiece();
        this.resetLockState();
        this.holdUsed = false;
      }
      this.playGroundSound();
    }
  }

  hardDrop() {
    const direction = this.getActiveGravityDirection();
    let dropped = 0;
    while (!this.collides(this.activePiece, 0, direction)) {
      this.activePiece.y += direction;
      dropped += 1;
    }
    if (dropped > 0) {
      // Tuning hook: hard drop bonus.
      this.score += dropped * 2;
      const gain = this.momentumHardDropGain || 0;
      if (gain > 0 && this.momentumBurstTimer <= 0) {
        const gainScale = this.momentumRecoveryTimer > 0
          ? this.momentumRecoveryMultiplier
          : 1;
        const scaledGain = Math.max(1, Math.floor(gain * gainScale));
        this.momentumValue = Math.min(this.momentumMax, this.momentumValue + scaledGain);
      }
    }
    this.playHardDropSound();
    this.lockPiece();
  }

  hardDropP2() {
    if (!this.p2Piece) return;
    const owner = this.getP2Owner();
    const otherPiece = this.activePiece;
    const direction = -1;
    let dropped = 0;
    while (!this.collidesForOwner(this.p2Piece, owner, 0, direction, this.p2Piece.rotation, otherPiece)) {
      this.p2Piece.y += direction;
      dropped += 1;
    }
    if (dropped > 0) {
      this.p2Score += dropped * 2;
      const { valueKey, burstKey, recoveryKey } = this.getMomentumKeys("p2");
      const gain = this.momentumHardDropGain || 0;
      if (gain > 0 && this[burstKey] <= 0) {
        const gainScale = this[recoveryKey] > 0
          ? this.momentumRecoveryMultiplier
          : 1;
        const scaledGain = Math.max(1, Math.floor(gain * gainScale));
        this[valueKey] = Math.min(this.momentumMax, this[valueKey] + scaledGain);
      }
    }
    this.playHardDropSound();
    this.lockPiece("p2");
  }

  resetLockState() {
    this.lockTimer = 0;
    this.lockMoves = 0;
    this.groundedTimer = 0;
    this.lockResetCooldown = 0;
    this.isGrounded = false;
  }

  resetP2LockState() {
    this.p2LockTimer = 0;
    this.p2LockMoves = 0;
    this.p2GroundedTimer = 0;
    this.p2LockResetCooldown = 0;
    this.p2IsGrounded = false;
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
      const owner = this.getActivePieceOwner();
      const pos = this.getSpawnPositionForOwner(owner, swap);
      const piece = createPiece(swap, pos.x, pos.y);
      const otherPiece = this.isCoopMode() ? this.p2Piece : null;
      let blocked = false;
      if (owner === this.board.getActiveOwner() && !this.isSirtetMode()) {
        blocked = this.isSpawnBlocked();
        if (!blocked && otherPiece) {
          blocked = this.piecesOverlap(piece, otherPiece);
        }
      } else {
        blocked = this.isSpawnBlockedForOwner(owner, piece, otherPiece);
      }
      if (blocked) {
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

  handleP2Hold() {
    if (this.p2HoldUsed || !this.p2Piece) return;
    const owner = this.getP2Owner();
    if (this.p2HoldType === null) {
      this.p2HoldType = this.p2Piece.type;
      this.p2Piece = this.spawnP2Piece();
      if (this.gameOver) return;
    } else {
      const swap = this.p2HoldType;
      this.p2HoldType = this.p2Piece.type;
      const pos = this.getSpawnPositionForOwner(owner, swap);
      const piece = createPiece(swap, pos.x, pos.y);
      if (this.isSpawnBlockedForOwner(owner, piece, this.activePiece)) {
        this.gameOver = true;
        this.onGameOver();
        return;
      }
      this.p2Piece = piece;
    }
    this.p2HoldUsed = true;
    this.p2PlacementTimer = this.p2PlacementDuration;
    this.resetP2LockState();
  }

  getGhostYForPiece(piece, owner, direction, otherPiece = null) {
    let offset = 0;
    while (!this.collidesForOwner(piece, owner, 0, offset + direction, piece.rotation, otherPiece)) {
      offset += direction;
    }
    return piece.y + offset;
  }

  getGhostY() {
    const owner = this.getActivePieceOwner();
    const direction = this.getActiveGravityDirection();
    const otherPiece = this.isCoopMode() ? this.p2Piece : null;
    return this.getGhostYForPiece(this.activePiece, owner, direction, otherPiece);
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

  tryMovePiece(piece, owner, dx, dy, otherPiece = null) {
    if (!piece) return false;
    if (!this.collidesForOwner(piece, owner, dx, dy, piece.rotation, otherPiece)) {
      piece.x += dx;
      piece.y += dy;
      return true;
    }
    return false;
  }

  tryRotatePiece(piece, owner, dir, otherPiece = null) {
    if (!piece) return false;
    const from = piece.rotation;
    const to = (from + dir + 4) % 4;
    const offsets = getKickOffsets(piece.type, from, to);
    for (const [ox, oy] of offsets) {
      if (!this.collidesForOwner(piece, owner, ox, oy, to, otherPiece)) {
        piece.x += ox;
        piece.y += oy;
        piece.rotation = to;
        return true;
      }
    }
    return false;
  }

  registerLockReset() {
    const direction = this.getActiveGravityDirection();
    if (!this.collides(this.activePiece, 0, direction)) return;
    if (this.lockResetCooldown > 0) return;
    this.lockTimer = 0;
    this.lockMoves += 1;
    this.lockResetCooldown = this.lockResetCooldownMs;
  }

  registerP2LockReset() {
    if (!this.p2Piece) return;
    const owner = this.getP2Owner();
    const otherPiece = this.activePiece;
    if (!this.collidesForOwner(this.p2Piece, owner, 0, -1, this.p2Piece.rotation, otherPiece)) return;
    if (this.p2LockResetCooldown > 0) return;
    this.p2LockTimer = 0;
    this.p2LockMoves += 1;
    this.p2LockResetCooldown = this.lockResetCooldownMs;
  }

  updateP2State(delta) {
    if (!this.p2Piece) return;
    const owner = this.getP2Owner();
    const otherPiece = this.activePiece;

    const leftPressed = this.input.consumePress("KeyA");
    const rightPressed = this.input.consumePress("KeyD");
    const upPressed = this.input.consumePress("KeyW");
    const leftHeld = this.input.isDown("KeyA");
    const rightHeld = this.input.isDown("KeyD");
    const upHeld = this.input.isDown("KeyW");
    const downPressed = this.input.consumePress("KeyS");

    if (leftPressed) {
      const moved = this.tryMovePiece(this.p2Piece, owner, -1, 0, otherPiece);
      if (moved) {
        this.registerP2LockReset();
      } else if (this.piecesOverlap(this.p2Piece, otherPiece, -1, 0)) {
        this.playThudSound();
      }
      this.p2LeftHold = 0;
      this.p2LeftRepeat = 0;
    }

    if (rightPressed) {
      const moved = this.tryMovePiece(this.p2Piece, owner, 1, 0, otherPiece);
      if (moved) {
        this.registerP2LockReset();
      } else if (this.piecesOverlap(this.p2Piece, otherPiece, 1, 0)) {
        this.playThudSound();
      }
      this.p2RightHold = 0;
      this.p2RightRepeat = 0;
    }

    if (upPressed) {
      const moved = this.tryMovePiece(this.p2Piece, owner, 0, -1, otherPiece);
      if (moved) {
        this.registerP2LockReset();
      } else if (this.piecesOverlap(this.p2Piece, otherPiece, 0, -1)) {
        this.playThudSound();
      }
      this.p2UpHold = 0;
      this.p2UpRepeat = 0;
    }

    if (downPressed) {
      this.hardDropP2();
      return;
    }

    if (leftHeld && !rightHeld) {
      this.p2LeftHold += delta;
      if (this.p2LeftHold >= GAME_CONFIG.DAS_DELAY) {
        this.p2LeftRepeat += delta;
        while (this.p2LeftRepeat >= GAME_CONFIG.DAS_ARR) {
          this.p2LeftRepeat -= GAME_CONFIG.DAS_ARR;
          const moved = this.tryMovePiece(this.p2Piece, owner, -1, 0, otherPiece);
          if (moved) {
            this.registerP2LockReset();
          } else {
            if (this.piecesOverlap(this.p2Piece, otherPiece, -1, 0)) {
              this.playThudSound();
            }
            break;
          }
        }
      }
    } else {
      this.p2LeftHold = 0;
      this.p2LeftRepeat = 0;
    }

    if (rightHeld && !leftHeld) {
      this.p2RightHold += delta;
      if (this.p2RightHold >= GAME_CONFIG.DAS_DELAY) {
        this.p2RightRepeat += delta;
        while (this.p2RightRepeat >= GAME_CONFIG.DAS_ARR) {
          this.p2RightRepeat -= GAME_CONFIG.DAS_ARR;
          const moved = this.tryMovePiece(this.p2Piece, owner, 1, 0, otherPiece);
          if (moved) {
            this.registerP2LockReset();
          } else {
            if (this.piecesOverlap(this.p2Piece, otherPiece, 1, 0)) {
              this.playThudSound();
            }
            break;
          }
        }
      }
    } else {
      this.p2RightHold = 0;
      this.p2RightRepeat = 0;
    }

    if (upHeld) {
      this.p2UpHold += delta;
      if (this.p2UpHold >= GAME_CONFIG.DAS_DELAY) {
        this.p2UpRepeat += delta;
        while (this.p2UpRepeat >= GAME_CONFIG.DAS_ARR) {
          this.p2UpRepeat -= GAME_CONFIG.DAS_ARR;
          const moved = this.tryMovePiece(this.p2Piece, owner, 0, -1, otherPiece);
          if (moved) {
            this.registerP2LockReset();
          } else {
            if (this.piecesOverlap(this.p2Piece, otherPiece, 0, -1)) {
              this.playThudSound();
            }
            break;
          }
        }
      }
    } else {
      this.p2UpHold = 0;
      this.p2UpRepeat = 0;
    }

    if (this.input.consumePress("KeyJ")) {
      if (this.tryRotatePiece(this.p2Piece, owner, -1, otherPiece)) {
        this.playRotateSound();
        this.registerP2LockReset();
      }
    }

    if (this.input.consumePress("KeyK")) {
      if (this.tryRotatePiece(this.p2Piece, owner, 1, otherPiece)) {
        this.playRotateSound();
        this.registerP2LockReset();
      }
    }

    if (this.input.consumePress("KeyL")) {
      this.handleP2Hold();
    }

    this.p2PlacementTimer = Math.max(0, this.p2PlacementTimer - delta);
    if (this.p2PlacementTimer === 0) {
      this.hardDropP2();
      return;
    }

    const currentlyGrounded = this.collidesForOwner(
      this.p2Piece,
      owner,
      0,
      -1,
      this.p2Piece.rotation,
      otherPiece
    );
    if (currentlyGrounded) {
      this.p2IsGrounded = true;
      this.p2LockTimer += delta;
      this.p2GroundedTimer += delta;
      if (this.p2LockResetCooldown > 0) {
        this.p2LockResetCooldown = Math.max(0, this.p2LockResetCooldown - delta);
      }
      const extraMoves = Math.max(0, this.p2LockMoves - this.lockDegradeAfter);
      const effectiveDelay = Math.max(
        this.lockDelayMinMs,
        this.lockDelayMs - extraMoves * this.lockDegradeStepMs
      );
      if (this.p2LockTimer >= effectiveDelay ||
          this.p2LockMoves >= this.lockMoveLimit ||
          this.p2GroundedTimer >= this.groundedMaxMs) {
        this.lockPiece("p2");
        return;
      }
    } else {
      this.p2IsGrounded = false;
      this.p2LockTimer = 0;
      this.p2LockMoves = 0;
      this.p2GroundedTimer = 0;
      this.p2LockResetCooldown = 0;
    }

  }

  updateMomentumState(delta, valueKey, burstKey, recoveryKey) {
    if (this[burstKey] > 0) {
      const wasBursting = this[burstKey] > 0;
      this[burstKey] = Math.max(0, this[burstKey] - delta);
      if (wasBursting && this[burstKey] === 0) {
        this[recoveryKey] = this.momentumRecoveryDuration;
      }
    }
    if (this[recoveryKey] > 0) {
      this[recoveryKey] = Math.max(0, this[recoveryKey] - delta);
    } else if (this[valueKey] > 0) {
      const pct = this.momentumMax > 0 ? this[valueKey] / this.momentumMax : 0;
      const decayBoost = pct > 0.8 ? 2 : 1;
      this[valueKey] = Math.max(
        0,
        this[valueKey] - delta * this.momentumDecayPerMs * decayBoost
      );
    }
  }

  update(delta) {
    if (this.gameOver) return;
    if (this.input.hasAnyActivity()) {
      this.ensureAudioContext();
    }

    if (this.lifeLossPending) {
      const left = this.input.consumePress("ArrowLeft");
      const right = this.input.consumePress("ArrowRight");
      const up = this.input.consumePress("ArrowUp");
      const down = this.input.consumePress("ArrowDown");
      if (left || right || up || down) {
        this.lifeLossChoiceIndex = this.lifeLossChoiceIndex === 0 ? 1 : 0;
      }
      if (this.input.consumePress("KeyZ") || this.input.consumePress("Escape")) {
        this.lifeLossChoiceIndex = 1;
      }
      if (this.input.consumePress("KeyX") || this.input.consumePress("Enter")) {
        if (this.lifeLossChoiceIndex === 0) {
          this.triggerLifeLoss();
        } else {
          this.gameOver = true;
          this.onGameOver();
        }
      }
      return;
    }

    if (this.lifeLossAnimating) {
      if (this.lifeLossHeartTimer > 0) {
        this.lifeLossHeartTimer = Math.max(0, this.lifeLossHeartTimer - delta);
        if (this.lifeLossHeartTimer === 0) {
          this.lifeLossAnimTimer = this.lifeLossAnimDuration;
          this.lifeLossFlashTimer = this.lifeLossFlashDuration;
          this.playLifeShiftSound(this.lifeLossAnimDuration / 1000);
        }
      } else if (this.lifeLossAnimTimer > 0) {
        this.lifeLossAnimTimer = Math.max(0, this.lifeLossAnimTimer - delta);
        if (this.lifeLossFlashTimer > 0) {
          this.lifeLossFlashTimer = Math.max(0, this.lifeLossFlashTimer - delta);
        }
        if (this.lifeLossAnimTimer === 0) {
          this.finalizeLifeLoss();
        }
      }
      return;
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
        const left = this.input.consumePress("ArrowLeft") || this.input.consumePress("KeyA");
        const right = this.input.consumePress("ArrowRight") || this.input.consumePress("KeyD");
        const up = this.input.consumePress("ArrowUp") || this.input.consumePress("KeyW");
        const down = this.input.consumePress("ArrowDown") || this.input.consumePress("KeyS");
        const back = this.input.consumePress("Backspace") || this.input.consumePress("KeyL");
        if (left || right || up || down || back) {
          this.pauseConfirmIndex = this.pauseConfirmIndex === 0 ? 1 : 0;
        }
        if (this.input.consumePress("KeyX") ||
            this.input.consumePress("Enter") ||
            this.input.consumePress("KeyJ") ||
            this.input.consumePress("KeyK")) {
          if (this.pauseConfirmIndex === 0) {
            this.pauseConfirmActive = false;
            this.paused = false;
            this.onPauseBack();
          } else {
            this.pauseConfirmActive = false;
          }
        }
        if (this.input.consumePress("KeyZ") || this.input.consumePress("KeyL")) {
          this.pauseConfirmActive = false;
        }
      } else {
        const left = this.input.consumePress("ArrowLeft") || this.input.consumePress("KeyA");
        const right = this.input.consumePress("ArrowRight") || this.input.consumePress("KeyD");
        const up = this.input.consumePress("ArrowUp") || this.input.consumePress("KeyW");
        const down = this.input.consumePress("ArrowDown") || this.input.consumePress("KeyS");
        const back = this.input.consumePress("Backspace") || this.input.consumePress("KeyL");
        if (left || right || up || down || back) {
          const dir = left || up ? -1 : 1;
          this.pauseActionIndex = (this.pauseActionIndex + dir + 3) % 3;
        }
        if (this.input.consumePress("KeyX") ||
            this.input.consumePress("Enter") ||
            this.input.consumePress("KeyJ") ||
            this.input.consumePress("KeyK")) {
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
        if (this.input.consumePress("KeyZ") || this.input.consumePress("KeyL")) {
          this.pauseConfirmActive = true;
          this.pauseConfirmIndex = 0;
        }
      }
      return;
    }

    this.animTimeMs += delta;

    if (this.mode === "garbage") {
      this.elapsedTimeMs += delta;
    }

    if (this.tetrisFlashTimer > 0) {
      this.tetrisFlashTimer = Math.max(0, this.tetrisFlashTimer - delta);
    }
    if (this.tetrisTextTimer > 0) {
      this.tetrisTextTimer = Math.max(0, this.tetrisTextTimer - delta);
    }
    if (this.callouts.length > 0) {
      for (let i = this.callouts.length - 1; i >= 0; i -= 1) {
        const callout = this.callouts[i];
        callout.timer = Math.max(0, callout.timer - delta);
        if (callout.timer === 0) {
          this.callouts.splice(i, 1);
        }
      }
    }
    this.updateMomentumState(delta, "momentumValue", "momentumBurstTimer", "momentumRecoveryTimer");
    if (this.isCoopMode()) {
      this.updateMomentumState(delta, "p2MomentumValue", "p2MomentumBurstTimer", "p2MomentumRecoveryTimer");
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
        const clearedPlayer = this.clearPlayer || "p1";
        this.clearPlayer = null;
        if (this.mode === "garbage" && !this.hasRemainingGarbage()) {
          this.gameOver = true;
          this.onGarbageCleared();
          return;
        }
        if (clearedPlayer === "p2") {
          this.p2Piece = this.spawnP2Piece();
          this.p2HoldUsed = false;
          this.resetP2LockState();
        } else {
          this.activePiece = this.spawnPiece();
          this.resetLockState();
          this.holdUsed = false;
        }
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
      this.flipSinceClear = true;
      if (this.handleFlipJamForPiece(
        this.activePiece,
        this.getActivePieceOwner(),
        this.getActiveGravityDirection(),
        "p1"
      )) return;
      if (this.isCoopMode() && this.p2Piece) {
        if (this.handleFlipJamForPiece(
          this.p2Piece,
          this.getP2Owner(),
          -1,
          "p2"
        )) return;
      }
    }

    if (this.input.consumePress("KeyC")) {
      this.handleHold();
    }

    const leftPressed = this.input.consumePress("ArrowLeft");
    const rightPressed = this.input.consumePress("ArrowRight");
    const leftHeld = this.input.isDown("ArrowLeft");
    const rightHeld = this.input.isDown("ArrowRight");

    if (leftPressed) {
      const moved = this.tryMoveHorizontal(-1);
      if (!moved && this.isCoopMode() && this.p2Piece &&
          this.piecesOverlap(this.activePiece, this.p2Piece, -1, 0)) {
        this.playThudSound();
      }
      this.leftHold = 0;
      this.leftRepeat = 0;
    }

    if (rightPressed) {
      const moved = this.tryMoveHorizontal(1);
      if (!moved && this.isCoopMode() && this.p2Piece &&
          this.piecesOverlap(this.activePiece, this.p2Piece, 1, 0)) {
        this.playThudSound();
      }
      this.rightHold = 0;
      this.rightRepeat = 0;
    }

    if (leftHeld && !rightHeld) {
      this.leftHold += delta;
      if (this.leftHold >= GAME_CONFIG.DAS_DELAY) {
        this.leftRepeat += delta;
        while (this.leftRepeat >= GAME_CONFIG.DAS_ARR) {
          this.leftRepeat -= GAME_CONFIG.DAS_ARR;
          if (!this.tryMoveHorizontal(-1)) {
            if (this.isCoopMode() && this.p2Piece &&
                this.piecesOverlap(this.activePiece, this.p2Piece, -1, 0)) {
              this.playThudSound();
            }
            break;
          }
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
          if (!this.tryMoveHorizontal(1)) {
            if (this.isCoopMode() && this.p2Piece &&
                this.piecesOverlap(this.activePiece, this.p2Piece, 1, 0)) {
              this.playThudSound();
            }
            break;
          }
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

    const hardDropKey = this.isSirtetMode() ? "ArrowDown" : "ArrowUp";
    if (this.input.consumePress(hardDropKey)) {
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

    const gravityDir = this.getActiveGravityDirection();
    const softDropKey = this.isSirtetMode() ? "ArrowUp" : "ArrowDown";
    const softDrop = this.input.isDown(softDropKey);
    const interval = softDrop ? 40 : this.dropInterval;

    this.dropTimer += delta;
    if (this.dropTimer >= interval) {
      this.dropTimer = 0;
      if (!this.collides(this.activePiece, 0, gravityDir)) {
        this.activePiece.y += gravityDir;
        if (softDrop) {
          this.score += 1;
        }
        this.isGrounded = false;
      }
    }

    const currentlyGrounded = this.collides(this.activePiece, 0, gravityDir);
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

    if (this.isCoopMode() && this.p2Piece && !this.isClearing) {
      this.updateP2State(delta);
    }
  }

  draw() {
    const ctx = this.ctx;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    const gridOffsetX = this.getGridOffsetX();
    ctx.setTransform(1, 0, 0, 1, gridOffsetX, 0);

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
        const alpha = (this.isCoopMode() || this.isSirtetMode())
          ? 1
          : (cell.owner === activeOwner ? 1 : 0.3);
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

    if (!this.isClearing && this.activePiece && !this.lifeLossPending && !this.lifeLossAnimating) {
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

    if (!this.isClearing && this.isCoopMode() && this.p2Piece) {
      const blocks = getBlocks(this.p2Piece);
      const p2Urgent = this.p2PlacementTimer > 0 && this.p2PlacementTimer <= 1000;
      const shakeStrength = p2Urgent ? 1.2 : 0;
      const shakeX = p2Urgent ? Math.sin(this.animTimeMs / 45) * shakeStrength : 0;
      const shakeY = p2Urgent ? Math.cos(this.animTimeMs / 55) * shakeStrength : 0;
      ctx.save();
      if (p2Urgent) {
        ctx.shadowColor = "rgba(255, 200, 140, 0.85)";
        ctx.shadowBlur = 12;
        ctx.translate(shakeX, shakeY);
      }
      for (const block of blocks) {
        const x = this.p2Piece.x + block.x;
        const y = this.p2Piece.y + block.y;
        if (y < 0) continue;
        drawCell(ctx, x, y, GAME_CONFIG.COLORS[this.p2Piece.type], 1);
      }
      ctx.restore();

      const ghostY = this.getGhostYForPiece(
        this.p2Piece,
        this.getP2Owner(),
        -1,
        this.activePiece
      );
      if (ghostY !== this.p2Piece.y) {
        ctx.save();
        ctx.strokeStyle = "rgba(220, 220, 220, 0.7)";
        ctx.globalAlpha = 0.8;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = "rgba(220, 220, 220, 0.45)";
        ctx.shadowBlur = 4;
        for (const block of blocks) {
          const x = this.p2Piece.x + block.x;
          const y = ghostY + block.y;
          if (y < 0) continue;
          const size = GAME_CONFIG.BLOCK_SIZE;
          ctx.strokeRect(x * size + 1, y * size + 1, size - 2, size - 2);
        }
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 0.16;
        ctx.fillStyle = GAME_CONFIG.COLORS[this.p2Piece.type];
        for (const block of blocks) {
          const x = this.p2Piece.x + block.x;
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

    if ((this.lifeLossAnimTimer > 0 || this.lifeLossFlashTimer > 0) && this.lifeLossOwner) {
      const flashAlpha = this.lifeLossFlashDuration > 0
        ? this.lifeLossFlashTimer / this.lifeLossFlashDuration
        : 0;
      const t = this.lifeLossAnimDuration > 0
        ? 1 - this.lifeLossAnimTimer / this.lifeLossAnimDuration
        : 1;
      const halfRows = GAME_CONFIG.ROWS / 2;
      const maxIndex = halfRows - 1;
      const baseY = this.lifeLossOwner === activeOwner ? halfRows : 0;
      const removeCount = Math.min(6, halfRows);
      for (let localRow = halfRows - 1; localRow >= halfRows - removeCount; localRow -= 1) {
        for (let x = 0; x < GAME_CONFIG.COLS; x += 1) {
          const cell = this.board.getCellForOwner(this.lifeLossOwner, localRow, x);
          if (!cell || cell.value === 0) continue;
          const renderY = this.lifeLossOwner === activeOwner
            ? baseY + localRow
            : maxIndex - localRow;
          const size = GAME_CONFIG.BLOCK_SIZE;
          const columnDelay = (x / Math.max(1, GAME_CONFIG.COLS - 1)) * 0.35;
          const progress = Math.min(1, Math.max(0, (t - columnDelay) / 0.65));
          if (progress <= 0) continue;
          const radius = size * (0.35 + 0.95 * progress);
          const alpha = (1 - progress) * (0.8 + 0.4 * flashAlpha);
          const centerX = x * size + size / 2;
          const centerY = renderY * size + size / 2;
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = "rgba(255, 110, 50, 0.95)";
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = alpha * 0.9;
          ctx.fillStyle = "rgba(255, 245, 220, 0.9)";
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius * 0.45, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
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

    if (this.callouts.length > 0) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const baseX = ctx.canvas.width / 2;
      const baseY = ctx.canvas.height / 2 + 30;
      for (let i = 0; i < this.callouts.length; i += 1) {
        const callout = this.callouts[i];
        const t = 1 - callout.timer / callout.duration;
        const fade = Math.max(0, 1 - t);
        const driftY = 16 * t;
        ctx.globalAlpha = 0.9 * fade;
        ctx.fillStyle = callout.color;
        ctx.font = `${callout.size}px "IBM Plex Mono", Menlo, Consolas, monospace`;
        ctx.shadowColor = "rgba(255, 255, 255, 0.5)";
        ctx.shadowBlur = 6;
        ctx.fillText(
          callout.text,
          baseX,
          baseY + i * (callout.size + 8) + driftY
        );
      }
      ctx.restore();
    }

    if (this.isCoopMode()) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = "#e6e6e6";
      ctx.font = "16px \"IBM Plex Mono\", Menlo, Consolas, monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      const leftHudX = GAME_CONFIG.GRID_MARGIN + 12;
      let leftHudY = 12;
      ctx.fillText("SCORE", leftHudX, leftHudY);
      leftHudY += 20;
      ctx.font = "22px \"IBM Plex Mono\", Menlo, Consolas, monospace";
      ctx.fillText(String(this.p2Score).padStart(6, "0"), leftHudX, leftHudY);
      leftHudY += 32;
      ctx.font = "16px \"IBM Plex Mono\", Menlo, Consolas, monospace";
      ctx.fillText("LEVEL", leftHudX, leftHudY);
      leftHudY += 20;
      ctx.font = "20px \"IBM Plex Mono\", Menlo, Consolas, monospace";
      ctx.fillText(String(this.p2Level), leftHudX, leftHudY);
      leftHudY += 30;
      ctx.font = "16px \"IBM Plex Mono\", Menlo, Consolas, monospace";
      ctx.fillText("LINES", leftHudX, leftHudY);
      leftHudY += 20;
      ctx.font = "20px \"IBM Plex Mono\", Menlo, Consolas, monospace";
      ctx.fillText(String(this.p2Lines), leftHudX, leftHudY);
      ctx.restore();

      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = "#e6e6e6";
      ctx.font = "14px \"IBM Plex Mono\", Menlo, Consolas, monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      const leftPanelX = GAME_CONFIG.GRID_MARGIN + 12;
      let leftPanelY = 190;
      ctx.fillText("HOLD", leftPanelX, leftPanelY);
      leftPanelY += 18;
      const holdBox = { x: leftPanelX, y: leftPanelY, w: 96, h: 96 };
      ctx.save();
      ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
      ctx.lineWidth = 2;
      ctx.strokeRect(holdBox.x, holdBox.y, holdBox.w, holdBox.h);
      ctx.restore();
      this.drawMiniPiece(ctx, this.p2HoldType, holdBox.x, holdBox.y, holdBox.w, holdBox.h);
      leftPanelY += 116;
      ctx.fillText("NEXT", leftPanelX, leftPanelY);
      leftPanelY += 18;
      for (let i = 0; i < this.p2Queue.length; i += 1) {
        this.drawMiniPiece(ctx, this.p2Queue[i], leftPanelX, leftPanelY, 80, 80);
        leftPanelY += 88;
      }
      leftPanelY += 8;
      const p2TimeLeftMs = Math.max(0, this.p2PlacementTimer);
      const p2Seconds = Math.ceil(p2TimeLeftMs / 1000);
      const p2Urgent = p2TimeLeftMs > 0 && p2TimeLeftMs <= 1000;
      ctx.fillStyle = p2Urgent ? "#ff9a6b" : "#e6e6e6";
      ctx.font = "14px \"IBM Plex Mono\", Menlo, Consolas, monospace";
      ctx.fillText("TIMER", leftPanelX, leftPanelY);
      leftPanelY += 18;
      ctx.font = "24px \"IBM Plex Mono\", Menlo, Consolas, monospace";
      ctx.fillText(`${p2Seconds}s`, leftPanelX, leftPanelY);
      const holdBoxSize = 96;
      const nextStart = 190 + 18 + 96 + 116 + 18;
      const nextEnd = nextStart + (3 * 88);
      const pauseTop = nextEnd + 12;
      const buttonGap = 18;
      const flipTop = pauseTop + holdBoxSize + buttonGap;
      const meterOffsetX = 12;
      const meterOffsetY = 48;
      const meterTop = flipTop + holdBoxSize + 18 + meterOffsetY;
      this.drawMomentumMeter(ctx, leftPanelX + meterOffsetX, meterTop, holdBoxSize, 140, {
        value: this.p2MomentumValue,
        burstTimer: this.p2MomentumBurstTimer
      });
      ctx.restore();
    }

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#e6e6e6";
    ctx.font = "16px \"IBM Plex Mono\", Menlo, Consolas, monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    const hudX = gridOffsetX
      + GAME_CONFIG.GRID_MARGIN
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
    if (this.mode === "redemption" && this.maxLives > 0) {
      const heartSize = 24;
      const heartGap = 8;
      const heartsX = hudX + GAME_CONFIG.HUD_WIDTH - heartSize - 24;
      const heartsY = 12;
      this.drawLives(ctx, heartsX, heartsY, heartSize, heartGap);
    }
    ctx.restore();

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = "#e6e6e6";
    ctx.font = "14px \"IBM Plex Mono\", Menlo, Consolas, monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    const panelX = gridOffsetX
      + GAME_CONFIG.GRID_MARGIN
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
    const holdBoxSize = 96;
    const nextStart = 190 + 18 + 96 + 116 + 18;
    const nextEnd = nextStart + (3 * 88);
    const pauseTop = nextEnd + 12;
    const buttonGap = 18;
    const flipTop = pauseTop + holdBoxSize + buttonGap;
    const meterOffsetX = 12;
    const meterOffsetY = 48;
    const meterTop = flipTop + holdBoxSize + 18 + meterOffsetY;
    this.drawMomentumMeter(ctx, panelX + meterOffsetX, meterTop, holdBoxSize, 140);
    ctx.restore();

    if (this.paused) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = "rgba(0, 0, 0, 1.0)";
      ctx.fillRect(
        gridOffsetX,
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

    if (this.lifeLossPending) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      const panelW = 360;
      const panelH = 180;
      const panelX = (ctx.canvas.width - panelW) / 2;
      const panelY = (ctx.canvas.height - panelH) / 2;
      ctx.fillStyle = "rgba(12, 12, 12, 0.95)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 2;
      ctx.fillRect(panelX, panelY, panelW, panelH);
      ctx.strokeRect(panelX, panelY, panelW, panelH);
      ctx.fillStyle = "#ffffff";
      ctx.font = "20px \"IBM Plex Mono\", Menlo, Consolas, monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("USE A LIFE?", panelX + panelW / 2, panelY + 36);
      ctx.font = "14px \"IBM Plex Mono\", Menlo, Consolas, monospace";
      ctx.fillText(
        `Lives remaining: ${this.lives}`,
        panelX + panelW / 2,
        panelY + 62
      );
      const btnW = 120;
      const btnH = 36;
      const gap = 18;
      const totalW = btnW * 2 + gap;
      const startX = panelX + (panelW - totalW) / 2;
      const useX = startX;
      const quitX = startX + btnW + gap;
      const btnY = panelY + panelH - 60;
      ctx.fillStyle = "#1f1f1f";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
      ctx.lineWidth = 1.5;
      ctx.fillRect(useX, btnY, btnW, btnH);
      ctx.strokeRect(useX, btnY, btnW, btnH);
      ctx.fillRect(quitX, btnY, btnW, btnH);
      ctx.strokeRect(quitX, btnY, btnW, btnH);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
      ctx.lineWidth = 2;
      if (this.lifeLossChoiceIndex === 0) {
        ctx.strokeRect(useX - 2, btnY - 2, btnW + 4, btnH + 4);
      } else {
        ctx.strokeRect(quitX - 2, btnY - 2, btnW + 4, btnH + 4);
      }
      ctx.fillStyle = "#e6e6e6";
      ctx.font = "14px \"IBM Plex Mono\", Menlo, Consolas, monospace";
      ctx.fillText("USE LIFE", useX + btnW / 2, btnY + btnH / 2);
      ctx.fillText("QUIT", quitX + btnW / 2, btnY + btnH / 2);
      this.lifeLossButtons = {
        use: { x: useX, y: btnY, w: btnW, h: btnH },
        quit: { x: quitX, y: btnY, w: btnW, h: btnH }
      };
      ctx.restore();
    }
  }

  handleLifeLossClick(x, y) {
    if (!this.lifeLossPending || !this.lifeLossButtons) return false;
    const { use, quit } = this.lifeLossButtons;
    const padding = 10;
    if (x >= use.x - padding && x <= use.x + use.w + padding &&
        y >= use.y - padding && y <= use.y + use.h + padding) {
      this.lifeLossChoiceIndex = 0;
      this.triggerLifeLoss();
      return true;
    }
    if (x >= quit.x - padding && x <= quit.x + quit.w + padding &&
        y >= quit.y - padding && y <= quit.y + quit.h + padding) {
      this.lifeLossChoiceIndex = 1;
      this.gameOver = true;
      this.onGameOver();
      return true;
    }
    return false;
  }

  drawMomentumMeter(ctx, x, y, w, h, options = {}) {
    const value = Number.isFinite(options.value) ? options.value : this.momentumValue;
    const max = Number.isFinite(options.max) ? options.max : this.momentumMax;
    const burstTimer = Number.isFinite(options.burstTimer)
      ? options.burstTimer
      : this.momentumBurstTimer;
    const pct = max > 0 ? value / max : 0;
    const clamped = Math.max(0, Math.min(1, pct));
    let fillColor = "#4cc3ff";
    if (clamped >= 0.75) {
      fillColor = "#ff6b5a";
    } else if (clamped >= 0.5) {
      fillColor = "#ffd34c";
    } else if (clamped >= 0.25) {
      fillColor = "#4cff9a";
    }
    let outline = "rgba(255, 255, 255, 0.45)";
    if (burstTimer > 0) {
      const pulse = 0.5 + 0.5 * Math.sin((burstTimer / 120) * Math.PI * 2);
      const alpha = 0.65 + 0.35 * pulse;
      fillColor = `rgba(255, 90, 90, ${alpha})`;
      outline = `rgba(255, 255, 255, ${0.6 + 0.4 * pulse})`;
    }
    const innerPad = 2;
    const innerHeight = h - innerPad * 2;
    const fillHeight = Math.max(0, Math.floor(innerHeight * clamped));
    const fillY = y + h - innerPad - fillHeight;

    ctx.save();
    ctx.fillStyle = "rgba(12, 12, 12, 0.6)";
    ctx.strokeStyle = outline;
    ctx.lineWidth = 2;
    ctx.fillRect(x, y, w, h);
    ctx.strokeRect(x, y, w, h);
    if (fillHeight > 0) {
      ctx.fillStyle = fillColor;
      ctx.fillRect(x + innerPad, fillY, w - innerPad * 2, fillHeight);
      if (burstTimer > 0) {
        ctx.globalAlpha = 0.5;
        ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
        ctx.fillRect(x + innerPad, fillY, w - innerPad * 2, Math.min(10, fillHeight));
        ctx.globalAlpha = 1;
      }
    }
    ctx.fillStyle = "#e6e6e6";
    ctx.font = "14px \"IBM Plex Mono\", Menlo, Consolas, monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "bottom";
    ctx.fillText("MOMENTUM", x, y - 8);
    ctx.restore();
  }

  drawLives(ctx, x, y, size, gap) {
    const lives = Math.max(0, Math.min(this.lives, this.maxLives));
    for (let i = 0; i < this.maxLives; i += 1) {
      let px = x;
      let py = y + i * (size + gap);
      const isBreaking = this.lifeLossAnimating && this.lifeLossHeartIndex === i;
      const t = this.lifeLossHeartDuration > 0
        ? 1 - this.lifeLossHeartTimer / this.lifeLossHeartDuration
        : 1;
      const breakPhase = isBreaking ? Math.min(1, t) : 0;
      if (isBreaking && breakPhase < 1) {
        const wobble = Math.sin(breakPhase * Math.PI * 6) * 2;
        const lift = -2 * breakPhase;
        px += wobble;
        py += lift;
      }
      const filled = i < lives || (isBreaking && breakPhase < 1);
      this.drawHeart(ctx, px, py, size, filled);
    }
  }

  drawHeart(ctx, x, y, size, filled) {
    const unit = Math.max(2, Math.floor(size / 7));
    const color = filled ? "#ff0000" : "rgba(255, 255, 255, 0.22)";
    const stroke = filled ? "rgba(255, 255, 255, 0.65)" : "rgba(255, 255, 255, 0.25)";
    const pattern = [
      [0, 1, 1, 0, 1, 1, 0],
      [1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 1, 0],
      [0, 0, 1, 1, 1, 0, 0],
      [0, 0, 0, 1, 0, 0, 0]
    ];
    ctx.save();
    ctx.fillStyle = color;
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1.5;
    for (let row = 0; row < pattern.length; row += 1) {
      for (let col = 0; col < pattern[row].length; col += 1) {
        if (!pattern[row][col]) continue;
        const px = x + col * unit;
        const py = y + row * unit;
        ctx.fillRect(px, py, unit, unit);
        ctx.strokeRect(px + 0.5, py + 0.5, unit - 1, unit - 1);
      }
    }
    ctx.restore();
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
