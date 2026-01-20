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
/** @type {HTMLButtonElement} */
const chillaxStart = document.getElementById("chillax-start");
/** @type {HTMLButtonElement} */
const chillaxBack = document.getElementById("chillax-back");
/** @type {HTMLElement} */
const redemptionGravityRow = document.getElementById("redemption-gravity-row");
/** @type {HTMLElement} */
const redemptionLivesRow = document.getElementById("redemption-lives-row");
/** @type {HTMLElement} */
const redemptionGravityValue = document.getElementById("redemption-gravity-value");
/** @type {HTMLElement} */
const redemptionLivesValue = document.getElementById("redemption-lives-value");
/** @type {HTMLButtonElement} */
const redemptionStart = document.getElementById("redemption-start");
/** @type {HTMLButtonElement} */
const redemptionBack = document.getElementById("redemption-back");
/** @type {HTMLElement} */
const garbageSpeedRow = document.getElementById("garbage-speed-row");
/** @type {HTMLElement} */
const garbageHeightRow = document.getElementById("garbage-height-row");
/** @type {HTMLElement} */
const garbageSpeedValue = document.getElementById("garbage-speed-value");
/** @type {HTMLElement} */
const garbageHeightValue = document.getElementById("garbage-height-value");
/** @type {HTMLButtonElement} */
const garbageStart = document.getElementById("garbage-start");
/** @type {HTMLButtonElement} */
const garbageBack = document.getElementById("garbage-back");
/** @type {HTMLButtonElement} */
const coopStart = document.getElementById("coop-start");
/** @type {HTMLButtonElement} */
const coopBack = document.getElementById("coop-back");
/** @type {HTMLButtonElement} */
const sirtetStart = document.getElementById("sirtet-start");
/** @type {HTMLButtonElement} */
const sirtetBack = document.getElementById("sirtet-back");
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
const chillaxGravityValue = document.getElementById("chillax-gravity-value");
/** @type {HTMLElement} */
const coopGravityValue = document.getElementById("coop-gravity-value");
/** @type {HTMLElement} */
const sirtetGravityValue = document.getElementById("sirtet-gravity-value");
/** @type {HTMLElement} */
const marathonScores = document.getElementById("marathon-scores");
/** @type {HTMLElement} */
const chillaxScores = document.getElementById("chillax-scores");
/** @type {HTMLElement} */
const garbageScores = document.getElementById("garbage-scores");
/** @type {HTMLElement} */
const redemptionScores = document.getElementById("redemption-scores");
/** @type {HTMLElement} */
const coopScores = document.getElementById("coop-scores");
/** @type {HTMLElement} */
const sirtetScores = document.getElementById("sirtet-scores");
/** @type {HTMLElement} */
const garbageScoreLabel = document.getElementById("garbage-score-label");
/** @type {HTMLElement} */
const nameModal = document.getElementById("name-modal");
/** @type {HTMLInputElement} */
const nameInput = document.getElementById("name-input");
/** @type {HTMLButtonElement} */
const nameSave = document.getElementById("name-save");
/** @type {HTMLButtonElement} */
const nameSkip = document.getElementById("name-skip");
/** @type {HTMLElement} */
const overlayTitle = document.getElementById("overlay-title");
/** @type {HTMLImageElement} */
const overlayImage = document.getElementById("overlay-image");
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
const garbageSuccessBase = `${baseUrl}assets/garbage-success`;
const garbageSuccessDefaultSrc = `${baseUrl}assets/garbage-success-default.png`;

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
let garbageSpeed = 0;
let garbageHeight = 1;
let redemptionGravity = 0;
let redemptionLives = 3;
let modeIndex = 0;
let marathonActionIndex = 0;
let chillaxActionIndex = 0;
let garbageActionIndex = 0;
let redemptionActionIndex = 0;
let coopActionIndex = 0;
let sirtetActionIndex = 0;
let gameOverActive = false;
let gameOverIndex = 0;
let nameEntryActive = false;
let pendingEntry = null;
let nameEntryIndex = 0;
let optionsIndex = 0;
let game = null;
let activeMode = "marathon";
let pendingScoreMode = "marathon";
let activeGarbageSpeed = garbageSpeed;
let activeGarbageHeight = garbageHeight;
let overlayMode = "gameover";
let overlayImageQueue = [];
let overlayImageIndex = 0;
let touchEnabled = true;

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
  { id: "title", label: "Title", src: titleTrackSrc },
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
const GARBAGE_SPEED_MAX = 35;
const GARBAGE_HEIGHT_MIN = 1;
const GARBAGE_HEIGHT_MAX = 9;
const GARBAGE_SPEED_TIERS = [
  { id: "slow", min: 0, max: 5, label: "Slow" },
  { id: "steady", min: 6, max: 15, label: "Steady" },
  { id: "fast", min: 16, max: 25, label: "Fast" },
  { id: "blazing", min: 26, max: 35, label: "Blazing" }
];
const GARBAGE_HEIGHT_TIERS = [
  { id: "low", min: 1, max: 3, label: "Low" },
  { id: "mid", min: 4, max: 6, label: "Mid" },
  { id: "high", min: 7, max: 9, label: "High" }
];
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
let musicPreviewActive = false;

const SCORE_STORAGE_KEYS = {
  marathon: "tetrisflip:marathon:scores",
  chillax: "tetrisflip:chillax:scores",
  garbage: "tetrisflip:garbage:scores",
  redemption: "tetrisflip:redemption:scores",
  coop: "tetrisflip:coop:scores",
  sirtet: "tetrisflip:sirtet:scores"
};
updateGravityLabels();
updateGarbageLabels();
updateRedemptionLabels();
if (overlayImage) {
  overlayImage.addEventListener("error", () => {
    overlayImageIndex += 1;
    if (overlayImageIndex < overlayImageQueue.length) {
      overlayImage.src = overlayImageQueue[overlayImageIndex];
    } else {
      overlayImage.hidden = true;
    }
  });
}

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
  if (menuState === "chillax") {
    chillaxActionIndex = 0;
    updateChillaxSelection();
  }
  if (menuState === "redemption") {
    redemptionActionIndex = 0;
    updateRedemptionSelection();
  }
  if (menuState === "garbage") {
    garbageActionIndex = 0;
    updateGarbageSelection();
  }
  if (menuState === "coop") {
    coopActionIndex = 0;
    updateCoopSelection();
  }
  if (menuState === "sirtet") {
    sirtetActionIndex = 0;
    updateSirtetSelection();
  }
  if (menuState === "options") {
    optionsIndex = 0;
    updateOptionsSelection();
  }
  musicPreviewActive = false;
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
  if (touchEnabled) {
    ensureTouchButtons();
  }
  input.clearPressed();
  updateViewportScale();
  updateMusicState();
}

function getScoreStorageKey(mode) {
  return SCORE_STORAGE_KEYS[mode] || SCORE_STORAGE_KEYS.marathon;
}

function getScoreListElement(mode) {
  if (mode === "chillax") return chillaxScores;
  if (mode === "garbage") return garbageScores;
  if (mode === "redemption") return redemptionScores;
  if (mode === "coop") return coopScores;
  if (mode === "sirtet") return sirtetScores;
  return marathonScores;
}

function updateGravityLabels() {
  if (gravityValue) {
    gravityValue.textContent = String(startingGravity);
  }
  if (chillaxGravityValue) {
    chillaxGravityValue.textContent = String(startingGravity);
  }
  if (coopGravityValue) {
    coopGravityValue.textContent = String(startingGravity);
  }
  if (sirtetGravityValue) {
    sirtetGravityValue.textContent = String(startingGravity);
  }
}

function updateGravity(delta) {
  startingGravity = Math.min(35, Math.max(0, startingGravity + delta));
  updateGravityLabels();
}

function updateGarbageLabels() {
  if (garbageSpeedValue) {
    garbageSpeedValue.textContent = String(garbageSpeed);
  }
  if (garbageHeightValue) {
    garbageHeightValue.textContent = String(garbageHeight);
  }
  if (garbageScoreLabel) {
    garbageScoreLabel.textContent = `Top 10 (Speed ${garbageSpeed} / Height ${garbageHeight})`;
  }
  renderGarbageScores();
}

function updateGarbageSpeed(delta) {
  garbageSpeed = Math.min(GARBAGE_SPEED_MAX, Math.max(0, garbageSpeed + delta));
  updateGarbageLabels();
}

function updateGarbageHeight(delta) {
  garbageHeight = Math.min(
    GARBAGE_HEIGHT_MAX,
    Math.max(GARBAGE_HEIGHT_MIN, garbageHeight + delta)
  );
  updateGarbageLabels();
}

function updateRedemptionLabels() {
  if (redemptionGravityValue) {
    redemptionGravityValue.textContent = String(redemptionGravity);
  }
  if (redemptionLivesValue) {
    redemptionLivesValue.textContent = String(redemptionLives);
  }
}

function updateRedemptionGravity(delta) {
  redemptionGravity = Math.min(35, Math.max(0, redemptionGravity + delta));
  updateRedemptionLabels();
}

function updateRedemptionLives(delta) {
  redemptionLives = Math.min(3, Math.max(1, redemptionLives + delta));
  updateRedemptionLabels();
}

function startGame() {
  const mode = menuState === "chillax"
    ? "chillax"
    : menuState === "redemption"
      ? "redemption"
    : menuState === "garbage"
      ? "garbage"
    : menuState === "coop"
      ? "coop"
    : menuState === "sirtet"
      ? "sirtet"
      : "marathon";
  activeMode = mode;
  setTouchEnabled(mode !== "coop");
  setCanvasSize(mode);
  closeMenu();
  if (game.setMode) {
    game.setMode(mode);
  }
  if (mode === "garbage") {
    activeGarbageSpeed = garbageSpeed;
    activeGarbageHeight = garbageHeight;
    game.setStartingLevel(garbageSpeed);
    if (game.setFreezeLevel) {
      game.setFreezeLevel(true);
    }
    if (game.setGarbageHeight) {
      game.setGarbageHeight(garbageHeight);
    }
    if (game.setRedemptionLives) {
      game.setRedemptionLives(0);
    }
  } else if (mode === "redemption") {
    game.setStartingLevel(redemptionGravity);
    if (game.setFreezeLevel) {
      game.setFreezeLevel(false);
    }
    if (game.setGarbageHeight) {
      game.setGarbageHeight(0);
    }
    if (game.setRedemptionLives) {
      game.setRedemptionLives(redemptionLives);
    }
  } else {
    game.setStartingLevel(startingGravity);
    if (game.setFreezeLevel) {
      game.setFreezeLevel(mode === "chillax");
    }
    if (game.setGarbageHeight) {
      game.setGarbageHeight(0);
    }
    if (game.setRedemptionLives) {
      game.setRedemptionLives(0);
    }
  }
  game.paused = false;
  game.reset();
  updateMusicState();
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

function updateChillaxSelection() {
  if (!chillaxStart || !chillaxBack) return;
  chillaxStart.classList.toggle("is-selected", chillaxActionIndex === 0);
  chillaxBack.classList.toggle("is-selected", chillaxActionIndex === 1);
}

function updateRedemptionSelection() {
  if (redemptionGravityRow) {
    redemptionGravityRow.classList.toggle("is-selected", redemptionActionIndex === 0);
  }
  if (redemptionLivesRow) {
    redemptionLivesRow.classList.toggle("is-selected", redemptionActionIndex === 1);
  }
  if (redemptionStart) {
    redemptionStart.classList.toggle("is-selected", redemptionActionIndex === 2);
  }
  if (redemptionBack) {
    redemptionBack.classList.toggle("is-selected", redemptionActionIndex === 3);
  }
}

function updateGarbageSelection() {
  if (garbageSpeedRow) {
    garbageSpeedRow.classList.toggle("is-selected", garbageActionIndex === 0);
  }
  if (garbageHeightRow) {
    garbageHeightRow.classList.toggle("is-selected", garbageActionIndex === 1);
  }
  if (garbageStart) {
    garbageStart.classList.toggle("is-selected", garbageActionIndex === 2);
  }
  if (garbageBack) {
    garbageBack.classList.toggle("is-selected", garbageActionIndex === 3);
  }
}

function updateCoopSelection() {
  if (!coopStart || !coopBack) return;
  coopStart.classList.toggle("is-selected", coopActionIndex === 0);
  coopBack.classList.toggle("is-selected", coopActionIndex === 1);
}

function updateSirtetSelection() {
  if (!sirtetStart || !sirtetBack) return;
  sirtetStart.classList.toggle("is-selected", sirtetActionIndex === 0);
  sirtetBack.classList.toggle("is-selected", sirtetActionIndex === 1);
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

function getClosestTierIndices(targetIndex, length) {
  const order = [];
  for (let offset = 1; offset < length; offset += 1) {
    const lower = targetIndex - offset;
    const upper = targetIndex + offset;
    if (lower >= 0) order.push(lower);
    if (upper < length) order.push(upper);
  }
  return order;
}

function getTierIndex(value, tiers) {
  const index = tiers.findIndex((tier) => value >= tier.min && value <= tier.max);
  return index >= 0 ? index : 0;
}

function buildGarbageSuccessCandidates(speed, height) {
  const speedIndex = getTierIndex(speed, GARBAGE_SPEED_TIERS);
  const heightIndex = getTierIndex(height, GARBAGE_HEIGHT_TIERS);
  const candidates = [];
  const pushCandidate = (speedIdx, heightIdx) => {
    const speedTier = GARBAGE_SPEED_TIERS[speedIdx];
    const heightTier = GARBAGE_HEIGHT_TIERS[heightIdx];
    if (!speedTier || !heightTier) return;
    const src = `${garbageSuccessBase}-${speedTier.id}-${heightTier.id}.png`;
    if (!candidates.includes(src)) {
      candidates.push(src);
    }
  };
  pushCandidate(speedIndex, heightIndex);
  const speedFallbacks = getClosestTierIndices(speedIndex, GARBAGE_SPEED_TIERS.length);
  speedFallbacks.forEach((idx) => pushCandidate(idx, heightIndex));
  const heightFallbacks = getClosestTierIndices(heightIndex, GARBAGE_HEIGHT_TIERS.length);
  heightFallbacks.forEach((idx) => pushCandidate(speedIndex, idx));
  if (!candidates.includes(garbageSuccessDefaultSrc)) {
    candidates.push(garbageSuccessDefaultSrc);
  }
  return candidates;
}

function setOverlayImageCandidates(candidates, altText) {
  if (!overlayImage) return;
  overlayImageQueue = Array.isArray(candidates) ? candidates : [];
  overlayImageIndex = 0;
  overlayImage.alt = altText || "";
  if (!overlayImageQueue.length) {
    overlayImage.hidden = true;
    overlayImage.removeAttribute("src");
    return;
  }
  overlayImage.hidden = false;
  overlayImage.src = overlayImageQueue[0];
}

function setOverlayMode(mode, options = {}) {
  overlayMode = mode;
  if (overlayTitle) {
    overlayTitle.textContent = mode === "success" ? "GARBAGE CLEARED" : "GAME OVER";
  }
  if (overlay) {
    overlay.classList.toggle("is-success", mode === "success");
  }
  if (mode === "success") {
    const candidates = buildGarbageSuccessCandidates(options.speed, options.height);
    setOverlayImageCandidates(candidates, "Garbage cleared");
  } else {
    setOverlayImageCandidates([], "");
  }
}

function backToSplash() {
  showScreen("splash");
}

function loadScores(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey);
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

function saveScores(scores, storageKey) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(scores));
  } catch {
    // Ignore storage failures.
  }
}

function renderScores(scores, listEl, mode) {
  if (!listEl) return;
  listEl.innerHTML = "";
  if (!scores.length) {
    const empty = document.createElement("li");
    empty.innerHTML = "<span class=\"score-rank\">-</span>"
      + "<span class=\"score-name\">No scores yet</span>"
      + "<span class=\"score-value\"></span>";
    listEl.appendChild(empty);
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
    if (mode === "garbage") {
      value.textContent = formatTimeMs(entry.timeMs);
    } else {
      value.textContent = String(entry.score);
    }
    item.append(rank, name, value);
    listEl.appendChild(item);
  });
}

function normalizeEntry(entry) {
  if (entry && typeof entry === "object") {
    return {
      score: Number.isFinite(entry.score) ? entry.score : 0,
      timeMs: Number.isFinite(entry.timeMs) ? entry.timeMs : null
    };
  }
  if (Number.isFinite(entry)) {
    return { score: entry, timeMs: null };
  }
  return { score: 0, timeMs: null };
}

function formatTimeMs(ms) {
  if (!Number.isFinite(ms)) return "--:--.--";
  const totalCentis = Math.max(0, Math.floor(ms / 10));
  const minutes = Math.floor(totalCentis / 6000);
  const seconds = Math.floor((totalCentis % 6000) / 100);
  const centis = totalCentis % 100;
  return `${minutes}:${String(seconds).padStart(2, "0")}.${String(centis).padStart(2, "0")}`;
}

function qualifyByTime(entry, scores) {
  if (!Number.isFinite(entry.timeMs)) return false;
  const times = scores
    .map((score) => score.timeMs)
    .filter((value) => Number.isFinite(value));
  if (times.length < 10) return true;
  const worst = Math.max(...times);
  return entry.timeMs < worst;
}

function matchesGarbageSetting(entry, speed, height) {
  return Number.isFinite(entry.speed)
    && Number.isFinite(entry.height)
    && entry.speed === speed
    && entry.height === height;
}

function getGarbageSettingScores(scores, speed, height) {
  return scores
    .filter((entry) => matchesGarbageSetting(entry, speed, height))
    .sort((a, b) => {
      const aTime = Number.isFinite(a.timeMs) ? a.timeMs : Infinity;
      const bTime = Number.isFinite(b.timeMs) ? b.timeMs : Infinity;
      return aTime - bTime;
    });
}

function qualifiesForScores(entry, scores, mode) {
  if (mode === "garbage") {
    return qualifyByTime(entry, scores);
  }
  if (scores.length < 10) return true;
  return entry.score > scores[scores.length - 1].score;
}

function renderGarbageScores() {
  const storageKey = getScoreStorageKey("garbage");
  const allScores = loadScores(storageKey);
  const filtered = getGarbageSettingScores(allScores, garbageSpeed, garbageHeight)
    .slice(0, 10);
  renderScores(filtered, garbageScores, "garbage");
}

function openNameEntry(entry, mode) {
  pendingEntry = normalizeEntry(entry);
  pendingScoreMode = mode;
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
  pendingEntry = null;
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
  }
  if (menuState === "options") {
    musicPreviewActive = true;
    if (musicMode === "preview") {
      stopAudio(titleMusic);
      if (gameMusicEnabled) {
        stopAudio(gameMusic);
        attemptPlay(gameMusic);
      } else {
        stopAudio(gameMusic);
      }
    } else {
      setMusicMode("preview");
      if (!gameMusicEnabled) {
        stopAudio(gameMusic);
      }
    }
  } else if (musicMode === "game" && !musicPaused) {
    stopAudio(gameMusic);
    attemptPlay(gameMusic);
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
  } else if (mode === "preview") {
    stopAudio(titleMusic);
    if (gameMusicEnabled) {
      attemptPlay(gameMusic);
    }
  }
}

function updateMusicState() {
  if (menuState === "options" && musicPreviewActive) {
    setMusicMode("preview");
    return;
  }
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
  if (!pendingEntry) return;
  const storageKey = getScoreStorageKey(pendingScoreMode);
  const scores = loadScores(storageKey);
  const trimmedName = nameInput.value.trim() || "Player 1";
  const entry = {
    name: trimmedName,
    score: pendingEntry.score
  };
  if (pendingScoreMode === "garbage") {
    entry.timeMs = pendingEntry.timeMs;
    entry.speed = activeGarbageSpeed;
    entry.height = activeGarbageHeight;
  }
  scores.push(entry);
  if (pendingScoreMode === "garbage") {
    const matching = getGarbageSettingScores(
      scores,
      activeGarbageSpeed,
      activeGarbageHeight
    );
    const trimmed = matching.slice(0, 10);
    const others = scores.filter(
      (scoreEntry) => !matchesGarbageSetting(scoreEntry, activeGarbageSpeed, activeGarbageHeight)
    );
    scores.length = 0;
    scores.push(...others, ...trimmed);
  } else {
    scores.sort((a, b) => b.score - a.score);
  }
  const updated = pendingScoreMode === "garbage"
    ? scores
    : scores.slice(0, 10);
  saveScores(updated, storageKey);
  if (pendingScoreMode === "garbage") {
    renderGarbageScores();
  } else {
    renderScores(updated, getScoreListElement(pendingScoreMode), pendingScoreMode);
  }
  closeNameEntry();
}

function getCanvasWidthForMode(mode) {
  const leftHud = mode === "coop" ? GAME_CONFIG.HUD_WIDTH : 0;
  return GAME_CONFIG.COLS * GAME_CONFIG.BLOCK_SIZE
    + GAME_CONFIG.GRID_MARGIN * 2
    + GAME_CONFIG.HUD_WIDTH
    + leftHud;
}

function setCanvasSize(mode) {
  canvas.width = getCanvasWidthForMode(mode);
  canvas.height = GAME_CONFIG.ROWS * GAME_CONFIG.BLOCK_SIZE;
}

function setTouchEnabled(enabled) {
  touchEnabled = enabled;
  if (!touchEnabled) {
    if (touchFlip) {
      touchFlip.remove();
      touchFlip = null;
    }
    if (touchPause) {
      touchPause.remove();
      touchPause = null;
    }
  }
}

setCanvasSize(activeMode);

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
    setOverlayMode("gameover");
    overlay.hidden = false;
    gameOverActive = true;
    gameOverIndex = 0;
    updateGameOverSelection();
    const storageKey = getScoreStorageKey(activeMode);
    const scores = loadScores(storageKey);
    if (activeMode === "garbage") {
      updateMusicState();
      return;
    }
    const { score, combinedScore } = game.getScoreState();
    const entry = { score: activeMode === "coop" ? combinedScore : score };
    if (qualifiesForScores(entry, scores, activeMode)) {
      openNameEntry(entry, activeMode);
    }
    updateMusicState();
  },
  onGarbageCleared() {
    setOverlayMode("success", {
      speed: activeGarbageSpeed,
      height: activeGarbageHeight
    });
    overlay.hidden = false;
    gameOverActive = true;
    gameOverIndex = 0;
    updateGameOverSelection();
    const storageKey = getScoreStorageKey(activeMode);
    const scores = loadScores(storageKey);
    const { score, timeMs } = game.getScoreState();
    const entry = { score, timeMs };
    const settingScores = getGarbageSettingScores(
      scores,
      activeGarbageSpeed,
      activeGarbageHeight
    );
    if (qualifiesForScores(entry, settingScores, activeMode)) {
      openNameEntry(entry, activeMode);
    }
    updateMusicState();
  },
  onPauseBack() {
    game.paused = false;
    openMenu(activeMode);
  }
});
game.setSfxVolume(vfxVolumeValue);

retry.addEventListener("click", () => {
  if (nameEntryActive) {
    closeNameEntry();
  }
  overlay.hidden = true;
  setOverlayMode("gameover");
  gameOverActive = false;
  game.reset();
  updateMusicState();
});

back.addEventListener("click", () => {
  if (nameEntryActive) {
    closeNameEntry();
  }
  const wasSuccess = overlayMode === "success";
  overlay.hidden = true;
  setOverlayMode("gameover");
  gameOverActive = false;
  openMenu(wasSuccess ? "garbage" : "mode");
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
  if (game.handleLifeLossClick && game.handleLifeLossClick(x, y)) {
    input.clearPressed();
    return;
  }
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

if (chillaxStart) {
  chillaxStart.addEventListener("click", () => {
    chillaxActionIndex = 0;
    updateChillaxSelection();
    startGame();
  });
}
if (chillaxBack) {
  chillaxBack.addEventListener("click", () => {
    chillaxActionIndex = 1;
    updateChillaxSelection();
    showScreen("mode");
  });
}

if (redemptionStart) {
  redemptionStart.addEventListener("click", () => {
    redemptionActionIndex = 2;
    updateRedemptionSelection();
    startGame();
  });
}
if (redemptionBack) {
  redemptionBack.addEventListener("click", () => {
    redemptionActionIndex = 3;
    updateRedemptionSelection();
    showScreen("mode");
  });
}
if (redemptionGravityRow) {
  redemptionGravityRow.addEventListener("click", () => {
    redemptionActionIndex = 0;
    updateRedemptionSelection();
    updateRedemptionGravity(1);
  });
}
if (redemptionLivesRow) {
  redemptionLivesRow.addEventListener("click", () => {
    redemptionActionIndex = 1;
    updateRedemptionSelection();
    updateRedemptionLives(1);
  });
}

if (garbageStart) {
  garbageStart.addEventListener("click", () => {
    garbageActionIndex = 2;
    updateGarbageSelection();
    startGame();
  });
}
if (garbageBack) {
  garbageBack.addEventListener("click", () => {
    garbageActionIndex = 3;
    updateGarbageSelection();
    showScreen("mode");
  });
}
if (garbageSpeedRow) {
  garbageSpeedRow.addEventListener("click", () => {
    garbageActionIndex = 0;
    updateGarbageSelection();
    updateGarbageSpeed(1);
  });
}
if (garbageHeightRow) {
  garbageHeightRow.addEventListener("click", () => {
    garbageActionIndex = 1;
    updateGarbageSelection();
    updateGarbageHeight(1);
  });
}

if (coopStart) {
  coopStart.addEventListener("click", () => {
    coopActionIndex = 0;
    updateCoopSelection();
    startGame();
  });
}
if (coopBack) {
  coopBack.addEventListener("click", () => {
    coopActionIndex = 1;
    updateCoopSelection();
    showScreen("mode");
  });
}

if (sirtetStart) {
  sirtetStart.addEventListener("click", () => {
    sirtetActionIndex = 0;
    updateSirtetSelection();
    startGame();
  });
}

if (sirtetBack) {
  sirtetBack.addEventListener("click", () => {
    sirtetActionIndex = 1;
    updateSirtetSelection();
    showScreen("mode");
  });
}

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
      } else if (selected === "marathon" || selected === "chillax"
        || selected === "garbage" || selected === "redemption"
        || selected === "coop" || selected === "sirtet") {
        showScreen(selected);
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

renderScores(loadScores(getScoreStorageKey("marathon")), marathonScores, "marathon");
renderScores(loadScores(getScoreStorageKey("chillax")), chillaxScores, "chillax");
renderGarbageScores();
renderScores(loadScores(getScoreStorageKey("redemption")), redemptionScores, "redemption");
renderScores(loadScores(getScoreStorageKey("coop")), coopScores, "coop");
renderScores(loadScores(getScoreStorageKey("sirtet")), sirtetScores, "sirtet");

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

function consumeMenuUp() {
  return input.consumePress("ArrowUp") || input.consumePress("KeyW");
}

function consumeMenuDown() {
  return input.consumePress("ArrowDown") || input.consumePress("KeyS");
}

function consumeMenuLeft() {
  return input.consumePress("ArrowLeft") || input.consumePress("KeyA");
}

function consumeMenuRight() {
  return input.consumePress("ArrowRight") || input.consumePress("KeyD");
}

function consumeMenuConfirm() {
  return input.consumePress("KeyX")
    || input.consumePress("Enter")
    || input.consumePress("KeyP")
    || input.consumePress("KeyJ")
    || input.consumePress("KeyK");
}

function consumeMenuBack() {
  return input.consumePress("KeyZ")
    || input.consumePress("Escape")
    || input.consumePress("Backspace")
    || input.consumePress("KeyL");
}

function handleMenuInput() {
  if (nameEntryActive) {
    const left = consumeMenuLeft();
    const right = consumeMenuRight();
    const up = consumeMenuUp();
    const down = consumeMenuDown();
    if (left || right) {
      nameEntryIndex = nameEntryIndex === 0 ? 1 : 0;
      updateNameEntrySelection();
    } else if (up) {
      nameEntryIndex = 0;
      updateNameEntrySelection();
    } else if (down) {
      nameEntryIndex = 1;
      updateNameEntrySelection();
    } else if (consumeMenuConfirm()) {
      if (nameEntryIndex === 0) {
        commitNameEntry();
      } else {
        closeNameEntry();
      }
    } else if (consumeMenuBack()) {
      closeNameEntry();
    }
    return;
  }

  if (gameOverActive) {
    if (consumeMenuLeft() || consumeMenuRight()) {
      gameOverIndex = gameOverIndex === 0 ? 1 : 0;
      updateGameOverSelection();
    } else if (consumeMenuConfirm()) {
      if (gameOverIndex === 0) {
        overlay.hidden = true;
        setOverlayMode("gameover");
        gameOverActive = false;
        game.reset();
        updateMusicState();
      } else {
        const wasSuccess = overlayMode === "success";
        overlay.hidden = true;
        setOverlayMode("gameover");
        gameOverActive = false;
        openMenu(wasSuccess ? "garbage" : "mode");
      }
    }
    return;
  }

  if (!menuActive) return;

  if (menuState === "splash") {
    if (consumeMenuConfirm() ||
        input.consumePress("Space") ||
        consumeMenuUp() ||
        consumeMenuDown() ||
        consumeMenuLeft() ||
        consumeMenuRight()) {
      showScreen("mode");
    }
    return;
  }

  if (menuState === "mode") {
    const confirm = consumeMenuConfirm();
    if (consumeMenuUp()) {
      modeIndex = Math.max(0, modeIndex - 1);
      updateModeSelection();
    } else if (consumeMenuDown()) {
      modeIndex = Math.min(modeOptions.length - 1, modeIndex + 1);
      updateModeSelection();
    } else if (confirm) {
      if (modeOptions[modeIndex].classList.contains("is-disabled")) return;
      const selected = modeOptions[modeIndex].dataset.mode;
      if (selected === "options") {
        showScreen("options");
      } else if (selected === "marathon" || selected === "chillax"
        || selected === "garbage" || selected === "redemption"
        || selected === "coop" || selected === "sirtet") {
        showScreen(selected);
      }
    } else if (consumeMenuBack()) {
      backToSplash();
    }
    return;
  }

  if (menuState === "options") {
    const confirm = consumeMenuConfirm();
    if (consumeMenuUp()) {
      optionsIndex = (optionsIndex + 5) % 6;
      updateOptionsSelection();
    } else if (consumeMenuDown()) {
      optionsIndex = (optionsIndex + 1) % 6;
      updateOptionsSelection();
    }
    const left = consumeMenuLeft();
    const right = consumeMenuRight();
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
    if (consumeMenuBack()) {
      showScreen("mode");
    }
    return;
  }

  if (menuState === "marathon") {
    const confirm = consumeMenuConfirm();
    if (consumeMenuUp()) {
      updateGravity(1);
    } else if (consumeMenuDown()) {
      updateGravity(-1);
    } else if (consumeMenuLeft() || consumeMenuRight()) {
      marathonActionIndex = marathonActionIndex === 0 ? 1 : 0;
      updateMarathonSelection();
    } else if (confirm) {
      if (marathonActionIndex === 0) {
        startGame();
      } else {
        showScreen("mode");
      }
    } else if (consumeMenuBack()) {
      showScreen("mode");
    }
  }

  if (menuState === "chillax") {
    const confirm = consumeMenuConfirm();
    if (consumeMenuUp()) {
      updateGravity(1);
    } else if (consumeMenuDown()) {
      updateGravity(-1);
    } else if (consumeMenuLeft() || consumeMenuRight()) {
      chillaxActionIndex = chillaxActionIndex === 0 ? 1 : 0;
      updateChillaxSelection();
    } else if (confirm) {
      if (chillaxActionIndex === 0) {
        startGame();
      } else {
        showScreen("mode");
      }
    } else if (consumeMenuBack()) {
      showScreen("mode");
    }
  }

  if (menuState === "redemption") {
    const confirm = consumeMenuConfirm();
    if (consumeMenuUp()) {
      redemptionActionIndex = (redemptionActionIndex + 3) % 4;
      updateRedemptionSelection();
    } else if (consumeMenuDown()) {
      redemptionActionIndex = (redemptionActionIndex + 1) % 4;
      updateRedemptionSelection();
    }
    const left = consumeMenuLeft();
    const right = consumeMenuRight();
    if (redemptionActionIndex === 0 && (left || right)) {
      updateRedemptionGravity(right ? 1 : -1);
    } else if (redemptionActionIndex === 1 && (left || right)) {
      updateRedemptionLives(right ? 1 : -1);
    } else if (redemptionActionIndex >= 2 && (left || right)) {
      redemptionActionIndex = redemptionActionIndex === 2 ? 3 : 2;
      updateRedemptionSelection();
    } else if (confirm) {
      if (redemptionActionIndex === 2) {
        startGame();
      } else if (redemptionActionIndex === 3) {
        showScreen("mode");
      }
    } else if (consumeMenuBack()) {
      showScreen("mode");
    }
  }

  if (menuState === "garbage") {
    const confirm = consumeMenuConfirm();
    if (consumeMenuUp()) {
      garbageActionIndex = (garbageActionIndex + 3) % 4;
      updateGarbageSelection();
    } else if (consumeMenuDown()) {
      garbageActionIndex = (garbageActionIndex + 1) % 4;
      updateGarbageSelection();
    }
    const left = consumeMenuLeft();
    const right = consumeMenuRight();
    if (garbageActionIndex === 0 && (left || right)) {
      updateGarbageSpeed(right ? 1 : -1);
    } else if (garbageActionIndex === 1 && (left || right)) {
      updateGarbageHeight(right ? 1 : -1);
    } else if (garbageActionIndex >= 2 && (left || right)) {
      garbageActionIndex = garbageActionIndex === 2 ? 3 : 2;
      updateGarbageSelection();
    } else if (confirm) {
      if (garbageActionIndex === 2) {
        startGame();
      } else if (garbageActionIndex === 3) {
        showScreen("mode");
      }
    } else if (consumeMenuBack()) {
      showScreen("mode");
    }
  }

  if (menuState === "coop") {
    const confirm = consumeMenuConfirm();
    if (consumeMenuUp()) {
      updateGravity(1);
    } else if (consumeMenuDown()) {
      updateGravity(-1);
    } else if (consumeMenuLeft() || consumeMenuRight()) {
      coopActionIndex = coopActionIndex === 0 ? 1 : 0;
      updateCoopSelection();
    } else if (confirm) {
      if (coopActionIndex === 0) {
        startGame();
      } else {
        showScreen("mode");
      }
    } else if (consumeMenuBack()) {
      showScreen("mode");
    }
  }

  if (menuState === "sirtet") {
    const confirm = consumeMenuConfirm();
    if (consumeMenuUp()) {
      updateGravity(1);
    } else if (consumeMenuDown()) {
      updateGravity(-1);
    } else if (consumeMenuLeft() || consumeMenuRight()) {
      sirtetActionIndex = sirtetActionIndex === 0 ? 1 : 0;
      updateSirtetSelection();
    } else if (confirm) {
      if (sirtetActionIndex === 0) {
        startGame();
      } else {
        showScreen("mode");
      }
    } else if (consumeMenuBack()) {
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
    if (touchEnabled) {
      ensureTouchButtons();
    }
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
