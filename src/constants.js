export const GAME_CONFIG = {
  COLS: 10,
  ROWS: 40,
  BLOCK_SIZE: 30,
  GRID_MARGIN: 28,
  HUD_WIDTH: 160,
  VISIBLE_ROWS_TOP: 18,
  VISIBLE_ROWS_BOTTOM: 18,
  SPAWN_BUFFER: 4,
  DAS_DELAY: 160,
  DAS_ARR: 30,
  COLORS: [
    null,
    "#00f0f0", // I
    "#0000f0", // J
    "#f0a000", // L
    "#f0f000", // O
    "#00f000", // S
    "#a000f0", // T
    "#f00000", // Z
    "#7a7a7a"  // Garbage
  ]
};

export const OWNERS = {
  NONE: "NONE",
  FIELD_A: "FIELD_A",
  FIELD_B: "FIELD_B"
};
