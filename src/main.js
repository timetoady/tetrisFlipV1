import { GAME_CONFIG } from "./constants.js";
import { createInput } from "./input.js";
import { GameLoop } from "./systems/gameloop.js";

/** @type {HTMLCanvasElement} */
const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
/** @type {HTMLElement} */
const overlay = document.getElementById("overlay");
/** @type {HTMLButtonElement} */
const retry = document.getElementById("retry");
/** @type {HTMLButtonElement} */
const back = document.getElementById("back");
/** @type {HTMLElement} */
const menu = document.getElementById("menu");
/** @type {HTMLImageElement} */
const splashImage = document.getElementById("splash-image");
/** @type {HTMLButtonElement} */
const marathonStart = document.getElementById("marathon-start");
/** @type {HTMLButtonElement} */
const marathonBack = document.getElementById("marathon-back");
/** @type {HTMLElement} */
const gravityValue = document.getElementById("gravity-value");
/** @type {HTMLElement} */
const marathonScores = document.getElementById("marathon-scores");
/** @type {HTMLElement} */
const nameModal = document.getElementById("name-modal");
/** @type {HTMLInputElement} */
const nameInput = document.getElementById("name-input");
/** @type {HTMLButtonElement} */
const nameSave = document.getElementById("name-save");
/** @type {HTMLButtonElement} */
const nameSkip = document.getElementById("name-skip");

overlay.hidden = true;
menu.hidden = false;
nameModal.hidden = true;

const screens = document.querySelectorAll("[data-screen]");
const modeOptions = Array.from(document.querySelectorAll("[data-mode]"));
let menuState = "splash";
let menuActive = true;
let startingGravity = 0;
let modeIndex = 0;
let marathonActionIndex = 0;
let gameOverActive = false;
let gameOverIndex = 0;
let nameEntryActive = false;
let pendingScore = null;
let nameEntryIndex = 0;

const SCORE_STORAGE_KEY = "tetrisflip:marathon:scores";
gravityValue.textContent = String(startingGravity);

function showScreen(name) {
  screens.forEach((screen) => {
    screen.classList.toggle("is-active", screen.dataset.screen === name);
  });
  menuState = name;
  if (menuState === "mode") {
    modeIndex = 0;
    updateModeSelection();
  }
  if (menuState === "marathon") {
    marathonActionIndex = 0;
    updateMarathonSelection();
  }
}

function openMenu(name) {
  menuActive = true;
  menu.hidden = false;
  canvas.style.visibility = "hidden";
  showScreen(name);
}

function closeMenu() {
  menuActive = false;
  menu.hidden = true;
  canvas.style.visibility = "visible";
}

function updateGravity(delta) {
  startingGravity = Math.min(35, Math.max(0, startingGravity + delta));
  gravityValue.textContent = String(startingGravity);
}

function startGame() {
  closeMenu();
  game.setStartingLevel(startingGravity);
  game.paused = false;
  game.reset();
}

function updateModeSelection() {
  modeOptions.forEach((option, index) => {
    option.classList.toggle("is-selected", index === modeIndex);
  });
}

function updateMarathonSelection() {
  marathonStart.classList.toggle("is-selected", marathonActionIndex === 0);
  marathonBack.classList.toggle("is-selected", marathonActionIndex === 1);
}

function updateGameOverSelection() {
  retry.classList.toggle("is-selected", gameOverIndex === 0);
  back.classList.toggle("is-selected", gameOverIndex === 1);
}

function backToSplash() {
  showScreen("splash");
}

function loadScores() {
  try {
    const raw = localStorage.getItem(SCORE_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry) => entry && typeof entry.name === "string"
        && Number.isFinite(entry.score))
      .slice(0, 10);
  } catch {
    return [];
  }
}

function saveScores(scores) {
  try {
    localStorage.setItem(SCORE_STORAGE_KEY, JSON.stringify(scores));
  } catch {
    // Ignore storage failures.
  }
}

function renderScores(scores) {
  marathonScores.innerHTML = "";
  if (!scores.length) {
    const empty = document.createElement("li");
    empty.innerHTML = "<span class=\"score-rank\">-</span>"
      + "<span class=\"score-name\">No scores yet</span>"
      + "<span class=\"score-value\"></span>";
    marathonScores.appendChild(empty);
    return;
  }
  scores.forEach((entry, index) => {
    const item = document.createElement("li");
    const rank = document.createElement("span");
    rank.className = "score-rank";
    rank.textContent = String(index + 1).padStart(2, "0");
    const name = document.createElement("span");
    name.className = "score-name";
    name.textContent = entry.name;
    const value = document.createElement("span");
    value.className = "score-value";
    value.textContent = String(entry.score);
    item.append(rank, name, value);
    marathonScores.appendChild(item);
  });
}

function qualifiesForScores(score, scores) {
  if (scores.length < 10) return true;
  return score > scores[scores.length - 1].score;
}

function openNameEntry(score) {
  pendingScore = score;
  nameInput.value = "Player 1";
  nameModal.hidden = false;
  nameEntryActive = true;
  nameEntryIndex = 0;
  updateNameEntrySelection();
  nameInput.focus();
  nameInput.select();
}

function closeNameEntry() {
  nameEntryActive = false;
  pendingScore = null;
  nameModal.hidden = true;
}

function updateNameEntrySelection() {
  nameSave.classList.toggle("is-selected", nameEntryIndex === 0);
  nameSkip.classList.toggle("is-selected", nameEntryIndex === 1);
}

function commitNameEntry() {
  if (pendingScore == null) return;
  const scores = loadScores();
  const trimmedName = nameInput.value.trim() || "Player 1";
  scores.push({ name: trimmedName, score: pendingScore });
  scores.sort((a, b) => b.score - a.score);
  const updated = scores.slice(0, 10);
  saveScores(updated);
  renderScores(updated);
  closeNameEntry();
}

canvas.width = GAME_CONFIG.COLS * GAME_CONFIG.BLOCK_SIZE
  + GAME_CONFIG.GRID_MARGIN * 2
  + GAME_CONFIG.HUD_WIDTH;
canvas.height = GAME_CONFIG.ROWS * GAME_CONFIG.BLOCK_SIZE;

const input = createInput(window);
const game = new GameLoop(ctx, input, {
  onGameOver() {
    overlay.hidden = false;
    gameOverActive = true;
    gameOverIndex = 0;
    updateGameOverSelection();
    const scores = loadScores();
    const { score } = game.getScoreState();
    if (qualifiesForScores(score, scores)) {
      openNameEntry(score);
    }
  },
  onPauseBack() {
    game.paused = false;
    openMenu("mode");
  }
});

retry.addEventListener("click", () => {
  if (nameEntryActive) {
    closeNameEntry();
  }
  overlay.hidden = true;
  gameOverActive = false;
  game.reset();
});

back.addEventListener("click", () => {
  if (nameEntryActive) {
    closeNameEntry();
  }
  overlay.hidden = true;
  gameOverActive = false;
  openMenu("mode");
});

nameSave.addEventListener("click", () => {
  if (!nameEntryActive) return;
  commitNameEntry();
});

nameSkip.addEventListener("click", () => {
  if (!nameEntryActive) return;
  closeNameEntry();
});

canvas.addEventListener("click", (event) => {
  const rect = canvas.getBoundingClientRect();
  const x = (event.clientX - rect.left) * (canvas.width / rect.width);
  const y = (event.clientY - rect.top) * (canvas.height / rect.height);
  game.handlePauseClick(x, y);
});


marathonStart.addEventListener("click", () => {
  marathonActionIndex = 0;
  updateMarathonSelection();
  startGame();
});
marathonBack.addEventListener("click", () => {
  marathonActionIndex = 1;
  updateMarathonSelection();
  showScreen("mode");
});

window.addEventListener("keydown", (event) => {
  if (nameEntryActive) {
    if (event.code === "ArrowLeft" || event.code === "ArrowRight") {
      nameEntryIndex = nameEntryIndex === 0 ? 1 : 0;
      updateNameEntrySelection();
    } else if (event.code === "ArrowUp") {
      nameEntryIndex = 0;
      updateNameEntrySelection();
    } else if (event.code === "ArrowDown") {
      nameEntryIndex = 1;
      updateNameEntrySelection();
    } else if (event.code === "KeyX" || event.code === "Enter") {
      if (nameEntryIndex === 0) {
        commitNameEntry();
      } else {
        closeNameEntry();
      }
    } else if (event.code === "Escape") {
      closeNameEntry();
    } else {
      return;
    }
    event.preventDefault();
    return;
  }
  if (gameOverActive) {
    if (event.code === "ArrowLeft" || event.code === "ArrowRight") {
      gameOverIndex = gameOverIndex === 0 ? 1 : 0;
      updateGameOverSelection();
    } else if (event.code === "KeyX" || event.code === "Enter") {
      if (gameOverIndex === 0) {
        overlay.hidden = true;
        gameOverActive = false;
        game.reset();
      } else {
        overlay.hidden = true;
        gameOverActive = false;
        openMenu("mode");
      }
    }
    return;
  }
  if (!menuActive) return;
  if (menuState === "splash") {
    event.preventDefault();
    showScreen("mode");
    return;
  }
  if (menuState === "mode") {
    if (event.code === "ArrowUp") {
      modeIndex = Math.max(0, modeIndex - 1);
      updateModeSelection();
    } else if (event.code === "ArrowDown") {
      modeIndex = Math.min(modeOptions.length - 1, modeIndex + 1);
      updateModeSelection();
    } else if (event.code === "KeyX" || event.code === "Enter") {
      if (modeOptions[modeIndex].classList.contains("is-disabled")) return;
      showScreen("marathon");
    } else if (event.code === "KeyZ" || event.code === "Escape") {
      backToSplash();
    }
    return;
  }
  if (menuState === "marathon") {
    if (event.code === "ArrowUp") {
      updateGravity(1);
    } else if (event.code === "ArrowDown") {
      updateGravity(-1);
    } else if (event.code === "ArrowLeft" || event.code === "ArrowRight") {
      marathonActionIndex = marathonActionIndex === 0 ? 1 : 0;
      updateMarathonSelection();
    } else if (event.code === "KeyX" || event.code === "Enter") {
      if (marathonActionIndex === 0) {
        startGame();
      } else {
        showScreen("mode");
      }
    } else if (event.code === "KeyZ" || event.code === "Escape") {
      showScreen("mode");
    }
  }
});

menu.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (menuState === "splash") {
    showScreen("mode");
  }
});

modeOptions.forEach((option, index) => {
  option.addEventListener("click", () => {
    modeIndex = index;
    updateModeSelection();
  });
});

renderScores(loadScores());

function setSplashImage() {
  const wide = window.innerWidth > window.innerHeight;
  splashImage.src = wide ? "/assets/tetrisflip1.png" : "/assets/tetrisflip2.png";
}

setSplashImage();
window.addEventListener("resize", setSplashImage);
canvas.style.visibility = "hidden";

let last = performance.now();
function frame(now) {
  const delta = now - last;
  last = now;
  if (!menuActive) {
    game.update(delta);
  }
  game.draw();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
