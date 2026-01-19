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
const modeBack = document.getElementById("mode-back");
/** @type {HTMLButtonElement} */
const marathonStart = document.getElementById("marathon-start");
/** @type {HTMLButtonElement} */
const marathonBack = document.getElementById("marathon-back");
/** @type {HTMLElement} */
const optionsRotateRow = document.getElementById("options-rotate");
/** @type {HTMLElement} */
const optionsRotateValue = document.getElementById("options-rotate-value");
/** @type {HTMLImageElement} */
const optionsController = document.getElementById("options-controller");
/** @type {HTMLElement} */
const optionsMouseRow = document.getElementById("options-mouse");
/** @type {HTMLElement} */
const optionsMouseValue = document.getElementById("options-mouse-value");
/** @type {HTMLElement} */
const optionsMusicRow = document.getElementById("options-music");
/** @type {HTMLElement} */
const optionsMusicValue = document.getElementById("options-music-value");
/** @type {HTMLElement} */
const optionsMusicVolumeRow = document.getElementById("options-music-volume");
/** @type {HTMLElement} */
const optionsMusicVolumeValue = document.getElementById("options-music-volume-value");
/** @type {HTMLElement} */
const optionsVfxVolumeRow = document.getElementById("options-vfx-volume");
/** @type {HTMLElement} */
const optionsVfxVolumeValue = document.getElementById("options-vfx-volume-value");
/** @type {HTMLButtonElement} */
const optionsBack = document.getElementById("options-back");
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
/** @type {HTMLButtonElement | null} */
let touchFlip = document.getElementById("touch-flip");
/** @type {HTMLButtonElement | null} */
let touchPause = document.getElementById("touch-pause");
/** @type {HTMLElement} */
const wrap = document.querySelector(".wrap");

const baseUrl = import.meta.env.BASE_URL || "/";
const splashWideSrc = `${baseUrl}assets/tetrisflip1.png`;
const splashTallSrc = `${baseUrl}assets/tetrisflip2.png`;
const controllerStandardSrc = `${baseUrl}assets/standard%20controller.png`;
const controllerAlternateSrc = `${baseUrl}assets/alternate%20controller.png`;
const titleTrackSrc = `${baseUrl}assets/title.mp3`;

overlay.hidden = true;
menu.hidden = false;
nameModal.hidden = true;
if (touchFlip) {
  touchFlip.remove();
  touchFlip = null;
}
if (touchPause) {
  touchPause.remove();
  touchPause = null;
}

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
let optionsIndex = 0;
let game = null;

const ROTATE_LAYOUTS = [
  { id: "southEast", label: "South / East (A/B)" },
  { id: "southWest", label: "South / West (A/X)" }
];
const ROTATE_LAYOUT_KEY = "tetrisflip:input:rotateLayout";
let rotateLayoutIndex = 0;
const MOUSE_SCHEMES = [
  { id: "alternate", label: "Alternate (Wheel Rotate)" },
  { id: "classic", label: "Classic (Wheel Drop)" },
  { id: "tetris", label: "Tetris.com" }
];
const MOUSE_SCHEME_KEY = "tetrisflip:input:mouseScheme";
let mouseSchemeIndex = 0;
let mouseSchemeId = MOUSE_SCHEMES[0].id;
const MUSIC_TRACKS = [
  { id: "main", label: "Main", src: `${baseUrl}assets/Main.mp3` },
  { id: "alt1", label: "Alt 1", src: `${baseUrl}assets/Alt1.mp3` },
  { id: "korobeiniki", label: "Korobeiniki", src: `${baseUrl}assets/TetrisFlipKorobeiniki.mp3` },
  { id: "none", label: "None", src: "" }
];
const MUSIC_TRACK_KEY = "tetrisflip:audio:gameTrack";
let musicTrackIndex = 0;
const MUSIC_VOLUME_KEY = "tetrisflip:audio:musicVolume";
const VFX_VOLUME_KEY = "tetrisflip:audio:vfxVolume";
const MUSIC_VOLUME_MAX = 0.7;
const VFX_VOLUME_MAX = 6.0;
const VOLUME_STEPS = 10;
const MUSIC_VOLUMES = Array.from({ length: VOLUME_STEPS + 1 }, (_, index) => {
  const percent = index * 10;
  const normalized = percent / 100;
  return {
    label: `${percent}%`,
    value: Math.pow(normalized, 2) * MUSIC_VOLUME_MAX
  };
});
const VFX_VOLUMES = Array.from({ length: VOLUME_STEPS + 1 }, (_, index) => {
  const percent = index * 10;
  const normalized = percent / 100;
  return {
    label: `${percent}%`,
    value: normalized * VFX_VOLUME_MAX
  };
});
let musicVolumeIndex = 4;
let vfxVolumeIndex = 10;
let vfxVolumeValue = VFX_VOLUMES[vfxVolumeIndex].value;

const titleMusic = new Audio(titleTrackSrc);
titleMusic.loop = true;
titleMusic.preload = "auto";
const gameMusic = new Audio(MUSIC_TRACKS[0].src);
gameMusic.loop = true;
gameMusic.preload = "auto";
let musicMode = null;
let musicPaused = false;
let gameMusicEnabled = true;

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
  if (menuState === "options") {
    optionsIndex = 0;
    updateOptionsSelection();
  }
}

function openMenu(name) {
  menuActive = true;
  menu.hidden = false;
  canvas.style.visibility = "hidden";
  canvas.style.pointerEvents = "none";
  if (touchFlip) {
    touchFlip.remove();
    touchFlip = null;
  }
  if (touchPause) {
    touchPause.remove();
    touchPause = null;
  }
  showScreen(name);
  updateViewportScale();
  updateMusicState();
}

function closeMenu() {
  menuActive = false;
  menu.hidden = true;
  canvas.style.visibility = "visible";
  canvas.style.pointerEvents = "auto";
  ensureTouchButtons();
  input.clearPressed();
  updateViewportScale();
  updateMusicState();
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

function updateOptionsSelection() {
  if (!optionsRotateRow || !optionsBack) return;
  optionsRotateRow.classList.toggle("is-selected", optionsIndex === 0);
  if (optionsMouseRow) {
    optionsMouseRow.classList.toggle("is-selected", optionsIndex === 1);
  }
  if (optionsMusicRow) {
    optionsMusicRow.classList.toggle("is-selected", optionsIndex === 2);
  }
  if (optionsMusicVolumeRow) {
    optionsMusicVolumeRow.classList.toggle("is-selected", optionsIndex === 3);
  }
  if (optionsVfxVolumeRow) {
    optionsVfxVolumeRow.classList.toggle("is-selected", optionsIndex === 4);
  }
  optionsBack.classList.toggle("is-selected", optionsIndex === 5);
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
  updateMusicState();
}

function closeNameEntry() {
  nameEntryActive = false;
  pendingScore = null;
  nameModal.hidden = true;
  updateMusicState();
}

function updateNameEntrySelection() {
  nameSave.classList.toggle("is-selected", nameEntryIndex === 0);
  nameSkip.classList.toggle("is-selected", nameEntryIndex === 1);
}

function applyRotateLayout(index) {
  if (!optionsRotateValue) return;
  rotateLayoutIndex = (index + ROTATE_LAYOUTS.length) % ROTATE_LAYOUTS.length;
  const layout = ROTATE_LAYOUTS[rotateLayoutIndex];
  optionsRotateValue.textContent = layout.label;
  if (optionsController) {
    optionsController.src = layout.id === "southWest"
      ? controllerStandardSrc
      : controllerAlternateSrc;
  }
  if (input.setGamepadRotateLayout) {
    input.setGamepadRotateLayout(layout.id);
  }
  try {
    localStorage.setItem(ROTATE_LAYOUT_KEY, layout.id);
  } catch {
    // Ignore storage failures.
  }
}

function applyMouseScheme(index) {
  if (!optionsMouseValue) return;
  mouseSchemeIndex = (index + MOUSE_SCHEMES.length) % MOUSE_SCHEMES.length;
  const scheme = MOUSE_SCHEMES[mouseSchemeIndex];
  optionsMouseValue.textContent = scheme.label;
  mouseSchemeId = scheme.id;
  if (input.setMouseScheme) {
    input.setMouseScheme(scheme.id);
  }
  try {
    localStorage.setItem(MOUSE_SCHEME_KEY, scheme.id);
  } catch {
    // Ignore storage failures.
  }
}

function applyMusicTrack(index) {
  musicTrackIndex = (index + MUSIC_TRACKS.length) % MUSIC_TRACKS.length;
  const track = MUSIC_TRACKS[musicTrackIndex];
  if (optionsMusicValue) {
    optionsMusicValue.textContent = track.label;
  }
  gameMusicEnabled = Boolean(track.src);
  if (!gameMusicEnabled) {
    stopAudio(gameMusic);
    gameMusic.removeAttribute("src");
    gameMusic.load();
  } else {
    gameMusic.src = track.src;
    gameMusic.currentTime = 0;
    gameMusic.load();
    if (musicMode === "game" && !musicPaused) {
      stopAudio(gameMusic);
      attemptPlay(gameMusic);
    }
  }
  try {
    localStorage.setItem(MUSIC_TRACK_KEY, track.id);
  } catch {
    // Ignore storage failures.
  }
}

function applyMusicVolume(index) {
  musicVolumeIndex = (index + MUSIC_VOLUMES.length) % MUSIC_VOLUMES.length;
  const volume = MUSIC_VOLUMES[musicVolumeIndex];
  if (optionsMusicVolumeValue) {
    optionsMusicVolumeValue.textContent = volume.label;
  }
  titleMusic.volume = volume.value;
  gameMusic.volume = volume.value;
  try {
    localStorage.setItem(MUSIC_VOLUME_KEY, String(volume.value));
  } catch {
    // Ignore storage failures.
  }
}

function applyVfxVolume(index, playSound = true) {
  vfxVolumeIndex = (index + VFX_VOLUMES.length) % VFX_VOLUMES.length;
  const volume = VFX_VOLUMES[vfxVolumeIndex];
  vfxVolumeValue = volume.value;
  if (optionsVfxVolumeValue) {
    optionsVfxVolumeValue.textContent = volume.label;
  }
  if (game && game.setSfxVolume) {
    game.setSfxVolume(volume.value);
  }
  if (playSound && game && game.playRotateSound) {
    game.playRotateSound();
  }
  try {
    localStorage.setItem(VFX_VOLUME_KEY, String(volume.value));
  } catch {
    // Ignore storage failures.
  }
}

function attemptPlay(audio) {
  if (!audio) return;
  const playPromise = audio.play();
  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(() => {});
  }
}

function stopAudio(audio) {
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
}

function setMusicMode(mode) {
  if (musicMode === mode) return;
  musicMode = mode;
  musicPaused = false;
  if (mode === "menu") {
    stopAudio(gameMusic);
    attemptPlay(titleMusic);
  } else if (mode === "game") {
    stopAudio(titleMusic);
    if (gameMusicEnabled) {
      attemptPlay(gameMusic);
    }
  }
}

function updateMusicState() {
  const useTitle = menuActive || gameOverActive || nameEntryActive;
  setMusicMode(useTitle ? "menu" : "game");
  if (!useTitle && game && game.paused) {
    if (!musicPaused) {
      musicPaused = true;
      if (gameMusicEnabled) {
        gameMusic.pause();
      }
    }
    return;
  }
  if (musicPaused) {
    musicPaused = false;
    if (gameMusicEnabled) {
      attemptPlay(gameMusic);
    }
  }
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

const input = createInput(window, canvas);
try {
  const stored = localStorage.getItem(ROTATE_LAYOUT_KEY);
  const storedIndex = ROTATE_LAYOUTS.findIndex((entry) => entry.id === stored);
  applyRotateLayout(storedIndex >= 0 ? storedIndex : 0);
} catch {
  applyRotateLayout(0);
}
try {
  const stored = localStorage.getItem(MOUSE_SCHEME_KEY);
  const storedIndex = MOUSE_SCHEMES.findIndex((entry) => entry.id === stored);
  applyMouseScheme(storedIndex >= 0 ? storedIndex : 0);
} catch {
  applyMouseScheme(0);
}
try {
  const stored = localStorage.getItem(MUSIC_TRACK_KEY);
  const storedIndex = MUSIC_TRACKS.findIndex((entry) => entry.id === stored);
  applyMusicTrack(storedIndex >= 0 ? storedIndex : 0);
} catch {
  applyMusicTrack(0);
}
try {
  const stored = localStorage.getItem(MUSIC_VOLUME_KEY);
  const storedValue = Number(stored);
  const storedIndex = MUSIC_VOLUMES.findIndex((entry) => entry.value === storedValue);
  applyMusicVolume(storedIndex >= 0 ? storedIndex : musicVolumeIndex);
} catch {
  applyMusicVolume(musicVolumeIndex);
}
try {
  const stored = localStorage.getItem(VFX_VOLUME_KEY);
  const storedValue = Number(stored);
  const storedIndex = VFX_VOLUMES.findIndex((entry) => entry.value === storedValue);
  applyVfxVolume(storedIndex >= 0 ? storedIndex : vfxVolumeIndex, false);
} catch {
  applyVfxVolume(vfxVolumeIndex, false);
}
game = new GameLoop(ctx, input, {
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
    updateMusicState();
  },
  onPauseBack() {
    game.paused = false;
    openMenu("marathon");
  }
});
game.setSfxVolume(vfxVolumeValue);

retry.addEventListener("click", () => {
  if (nameEntryActive) {
    closeNameEntry();
  }
  overlay.hidden = true;
  gameOverActive = false;
  game.reset();
  updateMusicState();
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

function getCanvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  const style = window.getComputedStyle(canvas);
  const borderLeft = parseFloat(style.borderLeftWidth) || 0;
  const borderRight = parseFloat(style.borderRightWidth) || 0;
  const borderTop = parseFloat(style.borderTopWidth) || 0;
  const borderBottom = parseFloat(style.borderBottomWidth) || 0;
  const innerWidth = Math.max(1, rect.width - borderLeft - borderRight);
  const innerHeight = Math.max(1, rect.height - borderTop - borderBottom);
  const pointerOffsetX = -25;
  const x = (event.clientX - rect.left - borderLeft) * (canvas.width / innerWidth)
    + pointerOffsetX;
  const y = (event.clientY - rect.top - borderTop) * (canvas.height / innerHeight);
  return { x, y };
}

canvas.addEventListener("click", (event) => {
  const { x, y } = getCanvasPoint(event);
  if (game.paused) {
    game.handlePauseClick(x, y);
    input.clearPressed();
    return;
  }
  if (!menuActive && !game.paused) {
    if (game.handleHoldClick(x, y)) return;
  }
  game.handlePauseClick(x, y);
});

canvas.addEventListener("pointermove", (event) => {
  if (event.pointerType !== "mouse") return;
  if (!game.paused) {
    game.setPausePointer(null, null);
    return;
  }
  const { x, y } = getCanvasPoint(event);
  game.setPausePointer(x, y);
});

canvas.addEventListener("mousemove", (event) => {
  if (!game.paused) {
    game.setPausePointer(null, null);
    return;
  }
  const { x, y } = getCanvasPoint(event);
  game.setPausePointer(x, y);
});

canvas.addEventListener("pointerleave", () => {
  game.setPausePointer(null, null);
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

menu.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (menuState === "splash") {
    showScreen("mode");
  }
});

function ensureTouchButtons() {
  if (!touchFlip) {
    const button = document.createElement("button");
    button.className = "touch-flip";
    button.id = "touch-flip";
    button.type = "button";
    button.textContent = "FLIP!";
    button.addEventListener("click", () => {
      input.pressVirtual("Space");
    });
    document.body.appendChild(button);
    touchFlip = button;
  }
  if (!touchPause) {
    const button = document.createElement("button");
    button.className = "touch-pause";
    button.id = "touch-pause";
    button.type = "button";
    button.textContent = "PAUSE";
    button.addEventListener("click", () => {
      if (!menuActive) {
        input.pressVirtual("KeyP");
      }
    });
    document.body.appendChild(button);
    touchPause = button;
  }
  updateViewportScale();
}

modeOptions.forEach((option, index) => {
  option.addEventListener("click", () => {
    modeIndex = index;
    updateModeSelection();
    if (option.classList.contains("is-disabled")) return;
    const selected = option.dataset.mode;
    if (selected === "options") {
      showScreen("options");
    } else if (selected === "marathon") {
      showScreen("marathon");
    }
  });
});

if (modeBack) {
  modeBack.addEventListener("click", (event) => {
    event.stopPropagation();
    backToSplash();
  });
}

if (optionsBack) {
  optionsBack.addEventListener("click", () => {
    showScreen("mode");
  });
}

if (optionsRotateRow) {
  optionsRotateRow.addEventListener("click", () => {
    optionsIndex = 0;
    updateOptionsSelection();
    applyRotateLayout(rotateLayoutIndex + 1);
  });
}

if (optionsMouseRow) {
  optionsMouseRow.addEventListener("click", () => {
    optionsIndex = 1;
    updateOptionsSelection();
    applyMouseScheme(mouseSchemeIndex + 1);
  });
}

if (optionsMusicRow) {
  optionsMusicRow.addEventListener("click", () => {
    optionsIndex = 2;
    updateOptionsSelection();
    applyMusicTrack(musicTrackIndex + 1);
  });
}

if (optionsMusicVolumeRow) {
  optionsMusicVolumeRow.addEventListener("click", () => {
    optionsIndex = 3;
    updateOptionsSelection();
    applyMusicVolume(musicVolumeIndex + 1);
  });
}

if (optionsVfxVolumeRow) {
  optionsVfxVolumeRow.addEventListener("click", () => {
    optionsIndex = 4;
    updateOptionsSelection();
    applyVfxVolume(vfxVolumeIndex + 1);
  });
}

renderScores(loadScores());

function unlockMusic() {
  musicMode = null;
  musicPaused = false;
  updateMusicState();
}

document.addEventListener("pointerdown", unlockMusic, { once: true });
document.addEventListener("keydown", unlockMusic, { once: true });

function setSplashImage() {
  const wide = window.innerWidth > window.innerHeight;
  splashImage.src = wide ? splashWideSrc : splashTallSrc;
}

let viewportScale = 1;

function getTouchScale() {
  const touch = window.matchMedia("(pointer: coarse)").matches
    || navigator.maxTouchPoints > 0;
  if (!touch) return 1;
  const padding = 8;
  const available = window.innerHeight - padding * 2;
  if (available <= 0) return 1;
  return Math.min(1, available / canvas.height);
}

function updateViewportScale() {
  if (!wrap) return;
  const menuVisible = menu && !menu.hidden;
  viewportScale = menuVisible ? 1 : getTouchScale();
  if (game && game.setViewportScale) {
    game.setViewportScale(viewportScale);
  }
  if (viewportScale >= 1) {
    wrap.style.transform = "";
  } else {
    const scaledHeight = canvas.height * viewportScale;
    const offsetX = 24;
    const offsetY = Math.max(0, (window.innerHeight - scaledHeight) / 2);
    wrap.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${viewportScale})`;
    wrap.style.transformOrigin = "top left";
  }
  positionTouchButtons();
}

function positionTouchButtons() {
  if (!touchFlip || !touchPause) return;
  const rect = canvas.getBoundingClientRect();
  const rectScale = rect.width / canvas.width;
  const holdBoxSize = 96 * rectScale;
  const holdBoxX = GAME_CONFIG.GRID_MARGIN * 2
    + GAME_CONFIG.COLS * GAME_CONFIG.BLOCK_SIZE
    + 12;
  const holdBoxY = 190 + 18;
  const gap = 18 * rectScale;
  const flipWidth = holdBoxSize;
  const flipHeight = holdBoxSize;
  const pauseWidth = holdBoxSize;
  const pauseHeight = holdBoxSize;
  touchFlip.style.width = `${flipWidth}px`;
  touchFlip.style.height = `${flipHeight}px`;
  touchPause.style.width = `${pauseWidth}px`;
  touchPause.style.height = `${pauseHeight}px`;
  const left = rect.left + (holdBoxX + 12) * rectScale;
  const nextStart = 190 + 18 + 96 + 116 + 18;
  const nextEnd = nextStart + (3 * 88);
  const pauseTop = rect.top + (nextEnd + 12) * rectScale;
  const flipTop = pauseTop + pauseHeight + gap;
  touchFlip.style.left = `${left}px`;
  touchFlip.style.top = `${flipTop}px`;
  touchPause.style.left = `${left}px`;
  touchPause.style.top = `${pauseTop}px`;
}

setSplashImage();
updateViewportScale();
window.addEventListener("resize", setSplashImage);
window.addEventListener("resize", updateViewportScale);
canvas.style.visibility = "hidden";

function handleMenuInput() {
  if (nameEntryActive) {
    if (input.consumePress("ArrowLeft") || input.consumePress("ArrowRight")) {
      nameEntryIndex = nameEntryIndex === 0 ? 1 : 0;
      updateNameEntrySelection();
    } else if (input.consumePress("ArrowUp")) {
      nameEntryIndex = 0;
      updateNameEntrySelection();
    } else if (input.consumePress("ArrowDown")) {
      nameEntryIndex = 1;
      updateNameEntrySelection();
    } else if (input.consumePress("KeyX") || input.consumePress("Enter")) {
      if (nameEntryIndex === 0) {
        commitNameEntry();
      } else {
        closeNameEntry();
      }
    } else if (input.consumePress("Escape")) {
      closeNameEntry();
    }
    return;
  }

  if (gameOverActive) {
    if (input.consumePress("ArrowLeft") || input.consumePress("ArrowRight")) {
      gameOverIndex = gameOverIndex === 0 ? 1 : 0;
      updateGameOverSelection();
    } else if (input.consumePress("KeyX") || input.consumePress("Enter")) {
      if (gameOverIndex === 0) {
        overlay.hidden = true;
        gameOverActive = false;
        game.reset();
        updateMusicState();
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
    if (input.consumePress("KeyX") ||
        input.consumePress("Enter") ||
        input.consumePress("KeyP") ||
        input.consumePress("Space") ||
        input.consumePress("ArrowUp") ||
        input.consumePress("ArrowDown") ||
        input.consumePress("ArrowLeft") ||
        input.consumePress("ArrowRight")) {
      showScreen("mode");
    }
    return;
  }

  if (menuState === "mode") {
    const confirm = input.consumePress("KeyX") ||
      input.consumePress("Enter") ||
      input.consumePress("KeyP");
    if (input.consumePress("ArrowUp")) {
      modeIndex = Math.max(0, modeIndex - 1);
      updateModeSelection();
    } else if (input.consumePress("ArrowDown")) {
      modeIndex = Math.min(modeOptions.length - 1, modeIndex + 1);
      updateModeSelection();
    } else if (confirm) {
      if (modeOptions[modeIndex].classList.contains("is-disabled")) return;
      const selected = modeOptions[modeIndex].dataset.mode;
      if (selected === "options") {
        showScreen("options");
      } else {
        showScreen("marathon");
      }
    } else if (input.consumePress("KeyZ") ||
               input.consumePress("Escape") ||
               input.consumePress("Backspace")) {
      backToSplash();
    }
    return;
  }

  if (menuState === "options") {
    const confirm = input.consumePress("KeyX") ||
      input.consumePress("Enter") ||
      input.consumePress("KeyP");
    if (input.consumePress("ArrowUp")) {
      optionsIndex = (optionsIndex + 5) % 6;
      updateOptionsSelection();
    } else if (input.consumePress("ArrowDown")) {
      optionsIndex = (optionsIndex + 1) % 6;
      updateOptionsSelection();
    }
    const left = input.consumePress("ArrowLeft");
    const right = input.consumePress("ArrowRight");
    if (optionsIndex === 0) {
      if (left || right) {
        const delta = right ? 1 : -1;
        applyRotateLayout(rotateLayoutIndex + delta);
      } else if (confirm) {
        applyRotateLayout(rotateLayoutIndex + 1);
      }
    } else if (optionsIndex === 1) {
      if (left || right) {
        const delta = right ? 1 : -1;
        applyMouseScheme(mouseSchemeIndex + delta);
      } else if (confirm) {
        applyMouseScheme(mouseSchemeIndex + 1);
      }
    } else if (optionsIndex === 2) {
      if (left || right) {
        const delta = right ? 1 : -1;
        applyMusicTrack(musicTrackIndex + delta);
      } else if (confirm) {
        applyMusicTrack(musicTrackIndex + 1);
      }
    } else if (optionsIndex === 3) {
      if (left || right) {
        const delta = right ? 1 : -1;
        applyMusicVolume(musicVolumeIndex + delta);
      } else if (confirm) {
        applyMusicVolume(musicVolumeIndex + 1);
      }
    } else if (optionsIndex === 4) {
      if (left || right) {
        const delta = right ? 1 : -1;
        applyVfxVolume(vfxVolumeIndex + delta);
      } else if (confirm) {
        applyVfxVolume(vfxVolumeIndex + 1);
      }
    } else if (optionsIndex === 5 && confirm) {
      showScreen("mode");
    }
    if (input.consumePress("KeyZ") ||
        input.consumePress("Escape") ||
        input.consumePress("Backspace")) {
      showScreen("mode");
    }
    return;
  }

  if (menuState === "marathon") {
    const confirm = input.consumePress("KeyX") ||
      input.consumePress("Enter") ||
      input.consumePress("KeyP");
    if (input.consumePress("ArrowUp")) {
      updateGravity(1);
    } else if (input.consumePress("ArrowDown")) {
      updateGravity(-1);
    } else if (input.consumePress("ArrowLeft") || input.consumePress("ArrowRight")) {
      marathonActionIndex = marathonActionIndex === 0 ? 1 : 0;
      updateMarathonSelection();
    } else if (confirm) {
      if (marathonActionIndex === 0) {
        startGame();
      } else {
        showScreen("mode");
      }
    } else if (input.consumePress("KeyZ") ||
               input.consumePress("Escape") ||
               input.consumePress("Backspace")) {
      showScreen("mode");
    }
  }
}

let last = performance.now();
function frame(now) {
  const delta = now - last;
  last = now;
  if (input.update) {
    input.update(delta);
  }
  handleMenuInput();
  const menuVisible = menu && !menu.hidden;
  if (menuVisible || gameOverActive || nameEntryActive || game.paused) {
    if (touchFlip) {
      touchFlip.remove();
      touchFlip = null;
    }
    if (touchPause) {
      touchPause.remove();
      touchPause = null;
    }
  } else {
    ensureTouchButtons();
  }
  if (!menuActive) {
    game.update(delta);
  }
  game.draw();
  updateMusicState();
  if (game.getPauseCursor) {
    canvas.style.cursor = game.getPauseCursor() || "";
  }
  positionTouchButtons();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
