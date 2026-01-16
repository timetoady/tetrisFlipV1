import { GAME_CONFIG } from "./constants.js";
import { createInput } from "./input.js";
import { GameLoop } from "./systems/gameloop.js";

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = GAME_CONFIG.COLS * GAME_CONFIG.BLOCK_SIZE + GAME_CONFIG.GRID_MARGIN * 2;
canvas.height = GAME_CONFIG.ROWS * GAME_CONFIG.BLOCK_SIZE;

const input = createInput(window);
const game = new GameLoop(ctx, input);

let last = performance.now();
function frame(now) {
  const delta = now - last;
  last = now;
  game.update(delta);
  game.draw();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
