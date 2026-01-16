import { GAME_CONFIG, OWNERS } from "../constants.js";

export class Board {
  constructor() {
    this.isFlipped = false;
    this.grid = this.createGrid();
  }

  createGrid() {
    const grid = [];
    for (let y = 0; y < GAME_CONFIG.ROWS; y += 1) {
      const row = [];
      for (let x = 0; x < GAME_CONFIG.COLS; x += 1) {
        row.push({ value: 0, owner: OWNERS.NONE, locked: false });
      }
      grid.push(row);
    }
    return grid;
  }

  reset() {
    this.grid = this.createGrid();
    this.isFlipped = false;
  }

  getActiveOwner() {
    return this.isFlipped ? OWNERS.FIELD_B : OWNERS.FIELD_A;
  }

  getInactiveOwner() {
    return this.isFlipped ? OWNERS.FIELD_A : OWNERS.FIELD_B;
  }

  flip() {
    this.isFlipped = !this.isFlipped;
  }

  inBounds(x, y) {
    return x >= 0 && x < GAME_CONFIG.COLS && y >= 0 && y < GAME_CONFIG.ROWS;
  }

  setCell(x, y, value, owner) {
    if (!this.inBounds(x, y)) return;
    this.grid[y][x].value = value;
    this.grid[y][x].owner = owner;
    this.grid[y][x].locked = value !== 0;
  }

  clearLinesForOwner(owner) {
    let cleared = 0;
    for (let y = GAME_CONFIG.ROWS - 1; y >= 0; y -= 1) {
      let full = true;
      for (let x = 0; x < GAME_CONFIG.COLS; x += 1) {
        const cell = this.grid[y][x];
        if (cell.value === 0 || cell.owner !== owner) {
          full = false;
          break;
        }
      }

      if (full) {
        this.grid.splice(y, 1);
        const newRow = [];
        for (let x = 0; x < GAME_CONFIG.COLS; x += 1) {
          newRow.push({ value: 0, owner: OWNERS.NONE, locked: false });
        }
        this.grid.unshift(newRow);
        cleared += 1;
        y += 1;
      }
    }

    return cleared;
  }
}
