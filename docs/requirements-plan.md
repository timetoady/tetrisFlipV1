Here is the implementation-ready requirements document for **Tetris Flip**.

---

# Tetris Flip: Technical Requirements Document (v1.0)

## 1. Executive Summary

**Tetris Flip** is a single-player, browser-based puzzle game. It introduces a "Dual-Field" mechanic where the player manages two separate stacks of blocks (Top and Bottom fields) within a single vertical play area. The player can "Flip" the fields instantly, swapping their positions. Gravity always pulls the active piece downward, meaning the player must swap the target field into the bottom position to land pieces on it.

This document serves as the master blueprint for development using **HTML5 Canvas** and **Vanilla JavaScript (ES Modules)**.

---

## 2. Key Design Decisions

* **Rendering Engine:** Canvas 2D API is selected over DOM manipulation for performance (60fps guaranteed) and ease of pixel-perfect manipulation during the "Flip" animation.
* **State Management:** The Game State (Logic) is strictly decoupled from the Render State (Visuals). The logic grid is a single 1D array, but cells carry a `fieldOwner` tag.
* **Collision Philosophy:** The Active Piece collides *only* with blocks belonging to the **currently active target field** (visually at the bottom). It passes through blocks belonging to the inactive field (visually at the top), creating a "ghost" layer effect.
* **Code Structure:** ES Modules (`import`/`export`) with JSDoc typing for robust IntelliSense without the compilation overhead of TypeScript.

---

## 3. Assumptions

* **Resolution:** The game renders at an internal logical resolution (e.g., 320x640) and scales up via CSS to fit the viewport, ensuring sharp pixel art edges (using `image-rendering: pixelated`).
* **Mixed Lines:** A row containing blocks from *both* Top and Bottom fields simultaneously **does not clear**. This encourages clean sorting.
* **Gravity:** "Up" input performs a Hard Drop (instant lock). It does *not* reverse gravity. Gravity is always Down (+Y).
* **Flip Safety:** The player can Flip at any time, even if the active piece is overlapping a block in the "incoming" field. Since the inactive field is non-collidable, this does not cause a game-over, but visually creates a temporary overlap (ghosting).

---

## 4. Open Questions / Future Exploration

* *Question:* Should the "Inactive" field (Top) be completely invisible, or just semi-transparent?
* *Decision:* Semi-transparent (Alpha 0.3) to allow strategic planning.


* *Question:* Does a Hard Drop auto-flip if the piece passes through the spawn zone?
* *Decision:* No. Manual Flip only.



---

## 5. Game Rules & Mechanics

### 5.1 The Board

* **Logical Grid:** Width 10 x Height 40 (approx).
* **Spawn Zone:** The middle 4 rows (rows 18-21).
* **Field A (Red/Warm):** Initially located at the Bottom.
* **Field B (Blue/Cool):** Initially located at the Top.

### 5.2 The Flip Mechanic

* **Trigger:** Player presses 'F' or Shift.
* **Action:**
1. Field A and Field B swap visual positions.
2. The "Target" property of the Game Manager toggles.
3. The active falling piece **maintains its absolute world position**.


* **Visual Logic:**
* If `State == Normal`: Field A is drawn at y=20..40. Field B is drawn at y=0..19.
* If `State == Flipped`: Field B is drawn at y=20..40. Field A is drawn at y=0..19.



### 5.3 Tetris Standards (SRS Subset)

* **Piece Generation:** 7-Bag Randomizer (guarantees one of each shape every 7 pieces).
* **Rotation:** Super Rotation System (SRS) logic.
* Basic rotation.
* Wall kicks (try rotating, if fail, try offset positions).


* **Lock Delay:** 500ms reset on movement/rotation (limit 15 moves).
* **Ghost Piece:** Shows where the piece will land on the *Active* (Bottom) field.

### 5.4 Scoring (Marathon)

* **Leveling:** Level increases every 10 lines cleared.
* **Speed:** Gravity speed (frames per drop) decreases as Level increases.
* Level 1: 48 frames.
* Level 15: 4 frames.
* Level 20+: 1 frame (20G).



---

## 6. UX / UI Layout

### Screen Layout (Wireframe)

```text
[ BACKGROUND: DARK GRAY (#1a1a1a) ]
-------------------------------------------------------
|  [ HOLD ]   |     [ GAME BOARD ]      |  [ NEXT ]   |
|   4x4 grid  |      10x40 grid         |   4x4 grid  |
|             |                         |             |
|  Current    |    [ INACTIVE FIELD ]   |  Score:     |
|  Score      |     (Low Opacity)       |  000000     |
|             |                         |             |
|             |    [ SPAWN ZONE --- ]   |  Level: 1   |
|             |                         |             |
|             |    [ ACTIVE FIELD ]     |  Lines: 0   |
|             |     (High Contrast)     |             |
-------------------------------------------------------

```

### Visual Style

* **Grid:** Faint grid lines (Alpha 0.1).
* **Active Blocks:** Bright, stained-glass gradient, inner white stroke.
* **Inactive Blocks:** Desaturated, 30% Opacity.
* **Ghost Piece:** Outline only, same color as active piece.

---

## 7. Controls & Input

| Action | Keyboard Key | Description |
| --- | --- | --- |
| Move Left | Arrow Left | DAS (Delayed Auto Shift) applies. |
| Move Right | Arrow Right | DAS applies. |
| Soft Drop | Arrow Down | Increases fall speed. |
| Hard Drop | Arrow Up | Instant lock + Score bonus. |
| Rotate CW | X / Up Arrow | Standard rotation. |
| Rotate CCW | Z / Ctrl | Standard rotation. |
| **FLIP** | Space / Shift | **The Core Mechanic.** |
| Hold | C | Stashes current piece. |
| Pause | Esc / P | Freezes game loop. |

**Constants:**

* `DAS_DELAY`: 160ms
* `DAS_ARR` (Auto Repeat Rate): 30ms

---

## 8. Data Models

### 8.1 Cell Model

```javascript
/**
 * @typedef {Object} Cell
 * @property {number} value - 0 for empty, 1-7 for pieces, 8 for garbage
 * @property {string} owner - 'FIELD_A' | 'FIELD_B' | 'NONE'
 * @property {boolean} locked - True if placed
 */

```

### 8.2 Piece Model

```javascript
/**
 * @typedef {Object} Piece
 * @property {number} type - 1 (I), 2 (J), 3 (L), 4 (O), 5 (S), 6 (T), 7 (Z)
 * @property {number} x - Grid X position
 * @property {number} y - Grid Y position
 * @property {number} rotation - 0, 1, 2, 3 (0 = North)
 */

```

### 8.3 Config Object

```javascript
export const GAME_CONFIG = {
  COLS: 10,
  ROWS: 40, // Tall board
  BLOCK_SIZE: 30, // Pixels
  VISIBLE_ROWS_TOP: 18,
  VISIBLE_ROWS_BOTTOM: 18,
  SPAWN_BUFFER: 4,
  COLORS: [
     null,
     '#00f0f0', // I
     '#0000f0', // J
     '#f0a000', // L
     '#f0f000', // O
     '#00f000', // S
     '#a000f0', // T
     '#f00000'  // Z
  ]
};

```

---

## 9. Game Loop Architecture

The loop uses a standard `requestAnimationFrame` with delta time calculation to ensure logic runs independently of frame rate (though V1 is frame-locked for simplicity).

1. **Input Phase:** Process key buffer.
2. **Update Phase:**
* Apply gravity (based on level speed).
* Check collision.
* Handle Lock Delay.
* Check Line Clears (Iterate rows, check if full of *Active Field* blocks).


3. **Render Phase:**
* `ctx.clearRect()`
* Draw Board (Inactive Field first, then Active Field).
* Draw Active Piece.
* Draw Ghost Piece.
* Draw HUD.



---

## 10. File and Folder Structure

```text
/tetris-flip
├── index.html          # Entry point, Canvas setup
├── package.json        # Dependencies (Vite)
├── jsconfig.json       # Type checking config
├── .vscode
│   └── settings.json   # Workspace format settings
├── src
│   ├── main.js         # Bootstraps game, loop entry
│   ├── constants.js    # Global configs
│   ├── input.js        # Keyboard listener
│   ├── systems
│   │   ├── gameloop.js # Main Update/Draw coordinator
│   │   ├── audio.js    # (Stub for future)
│   │   └── scorer.js   # Scoring logic
│   ├── entities
│   │   ├── board.js    # Grid logic, Flip logic
│   │   └── piece.js    # SRS, Movement
│   └── utils
│       ├── randomizer.js # 7-bag generator
│       ├── srs.js      # Offset tables
│       └── drawing.js  # Canvas helper functions
└── assets              # (Empty for V1, code-only graphics)

```

---

## 11. VS Code + Environment Setup

1. **Install Node.js** (LTS version).
2. **Initialize Project:**
```bash
mkdir tetris-flip
cd tetris-flip
npm init -y
npm install vite --save-dev

```


3. **Configure `package.json` scripts:**
```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview"
}

```


4. **Create `jsconfig.json**` (Crucial for IntelliSense):
```json
{
  "compilerOptions": {
    "target": "ES6",
    "module": "ESNext",
    "checkJs": true
  },
  "exclude": ["node_modules"]
}

```



---

## 12. Implementation Roadmap

### Phase 1: The Engine (Basic Tetris)

* [ ] Setup Vite and Canvas.
* [ ] Draw a static grid.
* [ ] Implement Piece spawning (7-bag) and gravity.
* [ ] Implement Basic Collision (piece stops at bottom).
* [ ] Implement Standard Locking (piece becomes board blocks).

### Phase 2: The Inputs

* [ ] Implement Left/Right movement.
* [ ] Implement SRS Rotation (basic).
* [ ] Add Wall Kicks (advanced SRS).

### Phase 3: The Flip (Unique Mechanic)

* [ ] Update Board Data Structure to support `owner` property.
* [ ] Implement `Flip()` function:
* Swaps rendering coordinates.
* Swaps collision check target.


* [ ] Verify piece falls "through" the top field.

### Phase 4: Rules & Polish

* [ ] Line Clearing (Field specific).
* [ ] Game Over conditions (Spawn zone intrusion).
* [ ] UI / HUD.
* [ ] Pause Menu.

---

## 13. Critical Pseudocode

### 13.1 Collision Logic (With Flip)

```javascript
function checkCollision(piece, board, isFlipped) {
    // Determine which field is the "Floor" (Active)
    const activeOwner = isFlipped ? 'FIELD_A' : 'FIELD_B';
    
    for (let block of piece.blocks) {
        // Calculate proposed coordinates
        let px = piece.x + block.x;
        let py = piece.y + block.y;

        // 1. Wall bounds
        if (px < 0 || px >= 10 || py >= 40) return true;

        // 2. Block overlap
        let cell = board.grid[py][px];
        if (cell.value !== 0) {
            // MAGIC: Only collide if the cell belongs to the active floor
            // The "Ceiling" (inactive owner) is ignored
            if (cell.owner === activeOwner) {
                return true;
            }
        }
    }
    return false;
}

```

### 13.2 The Flip Operation

```javascript
class Board {
    constructor() {
        this.isFlipped = false; // false = Field B is Floor
    }

    flip() {
        this.isFlipped = !this.isFlipped;
        // No data mutation needed! 
        // We just change how we render and how we collide.
    }

    draw(ctx) {
        if (!this.isFlipped) {
            this.drawField(ctx, 'FIELD_B', 'BOTTOM'); // Render B at bottom
            this.drawField(ctx, 'FIELD_A', 'TOP');    // Render A at top
        } else {
            this.drawField(ctx, 'FIELD_A', 'BOTTOM'); // Render A at bottom
            this.drawField(ctx, 'FIELD_B', 'TOP');    // Render B at top
        }
    }
}

```

---

## 14. Debugging & Tuning Tools

* **Debug Overlay:** Press `~` (Tilde) to toggle.
* Shows: FPS, Current Level, Active Field Name.
* Visualizes: Spawn Zone boundaries in bright red.


* **State Logger:** `console.log` grid state on Lock.

## 15. Performance Considerations

* **Object Pooling:** Not strictly necessary for V1 (JS garbage collector can handle 60Hz Tetris), but avoid creating `new` objects inside the game loop. Re-use the `Piece` object or coordinate arrays.
* **Rendering:** Use `Math.floor()` for all canvas coordinates to avoid sub-pixel blurring.

## 16. Accessibility

* **Color Blindness:** Do not rely on color alone to distinguish Field A from Field B.
* *Implementation:* Field A blocks have a "Circle" pattern overlay. Field B blocks have a "Square" pattern overlay.


* **Motion Sensitivity:** The "Flip" must be instant (1 frame swap). **Do not animate a slide or rotation** as this triggers motion sickness in a high-focus game.

---

**Next Step:** Open VS Code, initialize the folder structure as defined in Section 10, and begin implementing **Phase 1: The Engine**.