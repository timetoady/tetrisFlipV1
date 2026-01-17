import { GAME_CONFIG, OWNERS } from "../constants.js";

export class Board {
  constructor() {
    this.isFlipped = false;
    this.grid = this.createGrid();
  }

  getHalfRows() {
    return GAME_CONFIG.ROWS / 2;
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

  isRowInOwner(owner, row) {
    const halfRows = this.getHalfRows();
    if (owner === OWNERS.FIELD_A) return row >= halfRows;
    if (owner === OWNERS.FIELD_B) return row < halfRows;
    return false;
  }

  mapLocalToRow(owner, localRow) {
    const halfRows = this.getHalfRows();
    return owner === OWNERS.FIELD_A ? localRow + halfRows : localRow;
  }

  mapRowToLocal(owner, row) {
    const halfRows = this.getHalfRows();
    return owner === OWNERS.FIELD_A ? row - halfRows : row;
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

  getCellForOwner(owner, localRow, x) {
    const halfRows = this.getHalfRows();
    if (localRow < 0 || localRow >= halfRows) return null;
    if (x < 0 || x >= GAME_CONFIG.COLS) return null;
    const row = this.mapLocalToRow(owner, localRow);
    return this.grid[row][x];
  }

  setCellForOwner(owner, localRow, x, value) {
    const halfRows = this.getHalfRows();
    if (localRow < 0 || localRow >= halfRows) return;
    if (x < 0 || x >= GAME_CONFIG.COLS) return;
    const row = this.mapLocalToRow(owner, localRow);
    this.grid[row][x].value = value;
    this.grid[row][x].owner = value === 0 ? OWNERS.NONE : owner;
    this.grid[row][x].locked = value !== 0;
  }

  findClearLinesForOwner(owner) {
    const fullRows = [];
    const halfRows = this.getHalfRows();
    for (let localRow = halfRows - 1; localRow >= 0; localRow -= 1) {
      const rowIndex = this.mapLocalToRow(owner, localRow);
      let full = true;
      for (let x = 0; x < GAME_CONFIG.COLS; x += 1) {
        const cell = this.grid[rowIndex][x];
        if (cell.value === 0 || cell.owner !== owner) {
          full = false;
          break;
        }
      }
      if (full) {
        fullRows.push(localRow);
      }
    }
    return fullRows;
  }

  clearLinesForOwner(owner, localRows) {
    if (!localRows || localRows.length === 0) return 0;
    const sorted = [...localRows].sort((a, b) => a - b);
    const halfRows = this.getHalfRows();
    const isCleared = new Set(sorted);
    let writeRow = halfRows - 1;
    for (let localRow = halfRows - 1; localRow >= 0; localRow -= 1) {
      if (isCleared.has(localRow)) continue;
      const fromIndex = this.mapLocalToRow(owner, localRow);
      const toIndex = this.mapLocalToRow(owner, writeRow);
      this.grid[toIndex] = this.grid[fromIndex].map((cell) => ({ ...cell }));
      writeRow -= 1;
    }
    for (let r = writeRow; r >= 0; r -= 1) {
      const rowIndex = this.mapLocalToRow(owner, r);
      this.grid[rowIndex] = Array.from({ length: GAME_CONFIG.COLS }, () => ({
        value: 0,
        owner: OWNERS.NONE,
        locked: false
      }));
    }
    return sorted.length;
  }
}
