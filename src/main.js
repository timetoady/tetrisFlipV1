import { Capacitor, registerPlugin } from "@capacitor/core";
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
const burstStart = document.getElementById("burst-start");
/** @type {HTMLButtonElement} */
const burstBack = document.getElementById("burst-back");
/** @type {HTMLButtonElement} */
const vanillaClassicStart = document.getElementById("vanilla-classic-start");
/** @type {HTMLButtonElement} */
const vanillaClassicBack = document.getElementById("vanilla-classic-back");
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
/** @type {HTMLElement} */
const optionsLayoutModeRow = document.getElementById("options-layout-mode");
/** @type {HTMLElement} */
const optionsLayoutModeValue = document.getElementById("options-layout-mode-value");
/** @type {HTMLElement} */
const optionsOrientationRow = document.getElementById("options-orientation");
/** @type {HTMLElement} */
const optionsOrientationValue = document.getElementById("options-orientation-value");
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
/** @type {HTMLElement} */
const optionsHelpRow = document.getElementById("options-help");
/** @type {HTMLButtonElement} */
/** @type {HTMLElement} */
const optionsShowFpsRow = document.getElementById("options-show-fps");
/** @type {HTMLElement} */
const optionsShowFpsValue = document.getElementById("options-show-fps-value");
const optionsLayoutDebugRow = document.getElementById("options-layout-debug");
if (optionsLayoutDebugRow) optionsLayoutDebugRow.hidden = true;
const optionsLayoutDebugValue = document.getElementById("options-layout-debug-value");
const optionsFlipP2HudRow = document.getElementById("options-flip-p2-hud");
const optionsFlipP2HudValue = document.getElementById("options-flip-p2-hud-value");
const DualScreenHud = Capacitor.getPlatform() === "web"
  ? null
  : registerPlugin("DualScreenHud");
const optionsDualScreenHudRow = document.getElementById("options-dual-screen-hud");
const optionsDualScreenHudValue = document.getElementById("options-dual-screen-hud-value");
const optionsBack = document.getElementById("options-back");
/** @type {HTMLButtonElement} */
const helpBack = document.getElementById("help-back");
/** @type {HTMLElement} */
const gravityValue = document.getElementById("gravity-value");
/** @type {HTMLElement} */
const burstGravityValue = document.getElementById("burst-gravity-value");
/** @type {HTMLElement} */
const vanillaClassicGravityValue = document.getElementById("vanilla-classic-gravity-value");
/** @type {HTMLElement} */
const chillaxGravityValue = document.getElementById("chillax-gravity-value");
/** @type {HTMLElement} */
const coopGravityValue = document.getElementById("coop-gravity-value");
/** @type {HTMLElement} */
const sirtetGravityValue = document.getElementById("sirtet-gravity-value");
/** @type {HTMLElement} */
const marathonScores = document.getElementById("marathon-scores");
/** @type {HTMLElement} */
const burstScores = document.getElementById("burst-scores");
/** @type {HTMLElement} */
const vanillaClassicScores = document.getElementById("vanilla-classic-scores");
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
const exitModal = document.getElementById("exit-modal");
/** @type {HTMLButtonElement} */
const exitYes = document.getElementById("exit-yes");
/** @type {HTMLButtonElement} */
const exitNo = document.getElementById("exit-no");
/** @type {HTMLElement} */
/** @type {HTMLElement} */
let fpsCounter = document.getElementById("fps-counter");
const overlayTitle = document.getElementById("overlay-title");
/** @type {HTMLImageElement} */
const overlayImage = document.getElementById("overlay-image");
/** @type {HTMLButtonElement | null} */
let touchFlip = document.getElementById("touch-flip");
/** @type {HTMLButtonElement | null} */
let touchPause = document.getElementById("touch-pause");
/** @type {HTMLElement} */
const wrap = document.querySelector(".wrap");

const LAYOUT_DEBUG_STORAGE_KEY = "tetrisflip:layoutDebug";

function readLayoutDebugEnabled() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.has("layoutDebug")) return true;
  } catch {
    // ignore
  }
  try {
    const stored = localStorage.getItem(LAYOUT_DEBUG_STORAGE_KEY);
    return stored === "1" || stored === "true";
  } catch {
    return false;
  }
}

let layoutDebugEnabled = readLayoutDebugEnabled();

/** @type {HTMLElement | null} */
let landscapeHud = document.getElementById("landscape-hud");
/** @type {HTMLElement | null} */
const landscapeHudLeftTitle = document.getElementById("landscape-hud-left-title");
/** @type {HTMLElement | null} */
const landscapeHudRightTitle = document.getElementById("landscape-hud-right-title");
const hudScore = document.getElementById("hud-score");
/** @type {HTMLElement | null} */
let hudDebugBadge = document.getElementById("hud-debug-badge");
const hudLevel = document.getElementById("hud-level");
const hudLines = document.getElementById("hud-lines");
const hudHold = document.getElementById("hud-hold");
const hudNext = document.getElementById("hud-next");
const hudMomentumFill = document.getElementById("hud-momentum-fill");
const hudP2Score = document.getElementById("hud-p2-score");
const hudP2Level = document.getElementById("hud-p2-level");
const hudP2Lines = document.getElementById("hud-p2-lines");
const hudP2Hold = document.getElementById("hud-p2-hold");
const hudP2Next = document.getElementById("hud-p2-next");
const hudP2MomentumFill = document.getElementById("hud-p2-momentum-fill");
const landscapeHudRightCoop = document.getElementById("landscape-hud-right-coop");
const landscapeHudRightRun = document.getElementById("landscape-hud-right-run");
const landscapeHudRightGarbage = document.getElementById("landscape-hud-right-garbage");
const hudGarbageSpeed = document.getElementById("hud-garbage-speed");
const hudGarbageHeight = document.getElementById("hud-garbage-height");
const hudGarbageRemaining = document.getElementById("hud-garbage-remaining");
const hudGarbageProgressFill = document.getElementById("hud-garbage-progress-fill");
const hudGarbageTime = document.getElementById("hud-garbage-time");
const landscapeHudRightRedemption = document.getElementById("landscape-hud-right-redemption");
const hudRedemptionLives = document.getElementById("hud-redemption-lives");
const hudRedemptionMax = document.getElementById("hud-redemption-max");
const hudPieceI = document.getElementById("hud-piece-i");
const hudPieceJ = document.getElementById("hud-piece-j");
const hudPieceL = document.getElementById("hud-piece-l");
const hudPieceO = document.getElementById("hud-piece-o");
const hudPieceS = document.getElementById("hud-piece-s");
const hudPieceT = document.getElementById("hud-piece-t");
const hudPieceZ = document.getElementById("hud-piece-z");
const hudIDrought = document.getElementById("hud-i-drought");
const hudPieceTotal = document.getElementById("hud-piece-total");
const landscapeHudLeftPanel = document.getElementById("landscape-hud-left");
const landscapeHudRightPanel = document.getElementById("landscape-hud-right");
const hudHoldIcon = document.getElementById("hud-hold-icon");
const hudNext0 = document.getElementById("hud-next-0");
const hudNext1 = document.getElementById("hud-next-1");
const hudNext2 = document.getElementById("hud-next-2");
const hudNext3 = document.getElementById("hud-next-3");
const hudNext4 = document.getElementById("hud-next-4");
const hudP2HoldIcon = document.getElementById("hud-p2-hold-icon");
const hudP2Next0 = document.getElementById("hud-p2-next-0");
const hudP2Next1 = document.getElementById("hud-p2-next-1");
const hudP2Next2 = document.getElementById("hud-p2-next-2");
const hudP2Next3 = document.getElementById("hud-p2-next-3");
const hudP2Next4 = document.getElementById("hud-p2-next-4");


function ensureDebugOverlays() {
  // If Vite/Capacitor ends up serving an older index.html, create these at runtime so we can still debug layout.
  hudDebugBadge = document.getElementById("hud-debug-badge");

  if (!fpsCounter) {
    const el = document.createElement("div");
    el.className = "fps-counter";
    el.id = "fps-counter";
    el.hidden = true;
    el.textContent = "FPS 0";
    document.body.appendChild(el);
    fpsCounter = el;
  }
  if (fpsCounter && fpsCounter.parentElement !== document.body) {
    document.body.appendChild(fpsCounter);
  }

  if (!landscapeHud) {
    const el = document.createElement("div");
    el.className = "landscape-hud";
    el.id = "landscape-hud";
    el.hidden = true;
    document.body.appendChild(el);
    landscapeHud = el;
  }
  if (landscapeHud && landscapeHud.parentElement !== document.body) {
    document.body.appendChild(landscapeHud);
  }

  // Ensure there is something to inspect even if index.html is stale/missing HUD children.
  if (landscapeHud && !landscapeHud.querySelector(".landscape-hud-panel")) {
    landscapeHud.innerHTML = `
      <div class="landscape-hud-panel" id="landscape-hud-left">
        <div class="hud-title" id="landscape-hud-left-title">LEFT HUD</div>
        <div class="hud-label">(fallback)</div>
      </div>
      <div class="landscape-hud-panel" id="landscape-hud-right">
        <div class="hud-title" id="landscape-hud-right-title">RIGHT HUD</div>
        <div class="hud-label">(fallback)</div>
      </div>
    `;
  }

  if (!hudDebugBadge) {
    const el = document.createElement("div");
    el.id = "hud-debug-badge";
    el.hidden = true; // Keep available for troubleshooting, but hide by default.
    el.style.position = "fixed";
    el.style.top = "28px";
    el.style.left = "8px";
    el.style.zIndex = "99999";
    el.style.background = "rgba(0, 0, 0, 0.35)";
    el.style.border = "1px solid rgba(255, 255, 255, 0.18)";
    el.style.padding = "2px 6px";
    el.style.fontSize = "12px";
    el.style.letterSpacing = "1px";
    el.style.pointerEvents = "none";
    el.textContent = "HUD DEBUG";
    document.body.appendChild(el);
    hudDebugBadge = el;
  }
  if (hudDebugBadge && typeof hudDebugBadge.hidden === "boolean") {
    hudDebugBadge.hidden = !layoutDebugEnabled;
  }
  if (hudDebugBadge && hudDebugBadge.parentElement !== document.body) {
    document.body.appendChild(hudDebugBadge);
  }
}
const baseUrl = import.meta.env.BASE_URL || "/";
const splashWideSrc = `${baseUrl}assets/tetrisflip1.png`;
const splashTallSrc = `${baseUrl}assets/tetrisflip2.png`;
const controllerStandardSrc = `${baseUrl}assets/standard%20controller.ui.png`;
const controllerAlternateSrc = `${baseUrl}assets/alternate%20controller.ui.png`;
const controllerHandheld1Src = `${baseUrl}assets/handheld1.ui.png`;
const controllerHandheld2Src = `${baseUrl}assets/handheld2.ui.png`;
const titleTrackSrc = `${baseUrl}assets/title.mp3`;
const garbageSuccessBase = `${baseUrl}assets/garbage-success`;
const garbageSuccessDefaultSrc = `${baseUrl}assets/garbage-success-default.png`;

overlay.hidden = true;
menu.hidden = false;
nameModal.hidden = true;
ensureDebugOverlays();
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
const MENU_NAV_REPEAT_DELAY_MS = 500;
const MENU_NAV_REPEAT_INTERVAL_MS = 60;
const menuNavRepeatState = {
  up: { armed: false, nextAt: 0 },
  down: { armed: false, nextAt: 0 }
};

function resetMenuNavRepeat() {
  menuNavRepeatState.up.armed = false;
  menuNavRepeatState.up.nextAt = 0;
  menuNavRepeatState.down.armed = false;
  menuNavRepeatState.down.nextAt = 0;
}

/**
 * Menu-only conservative key repeat (does not affect gameplay).
 * @param {"up"|"down"} direction
 * @param {string[]} codes
 */
function consumeMenuNavRepeat(direction, codes) {
  const state = menuNavRepeatState[direction];
  const now = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();

  let pressed = false;
  let down = false;
  for (const code of codes) {
    if (!pressed && input.consumePress(code)) pressed = true;
    if (!down && input.isDown(code)) down = true;
  }

  if (!down) {
    state.armed = false;
    state.nextAt = 0;
    return pressed;
  }

  if (pressed) {
    state.armed = true;
    state.nextAt = now + MENU_NAV_REPEAT_DELAY_MS;
    return true;
  }

  if (!state.armed || !state.nextAt) return false;

  if (now >= state.nextAt) {
    state.nextAt = now + MENU_NAV_REPEAT_INTERVAL_MS;
    return true;
  }

  return false;
}
let startingGravity = 0;
let garbageSpeed = 0;
let garbageHeight = 1;
let redemptionGravity = 0;
let redemptionLives = 3;
let modeIndex = 0;
let modeNavColumn = 0;
let marathonActionIndex = 0;
let burstActionIndex = 0;
let vanillaClassicActionIndex = 0;
let chillaxActionIndex = 0;
let garbageActionIndex = 0;
let redemptionActionIndex = 0;
let coopActionIndex = 0;
let sirtetActionIndex = 0;
let gameOverActive = false;
let gameOverIndex = 0;
let nameEntryActive = false;
let exitConfirmActive = false;
let exitConfirmIndex = 1;
let nativeApp = null;
let pendingEntry = null;
let nameEntryIndex = 0;
let optionsIndex = 0;
const OPTIONS_ITEM_COUNT = 12;
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
  { id: "southWest", label: "South / West (A/X)" },
  { id: "sidewaysSouthEast", label: "Sideways: South / East (A/B)" },
  { id: "sidewaysSouthWest", label: "Sideways: South / West (A/X)" }
];
const ROTATE_LAYOUT_KEY = "tetrisflip:input:rotateLayout";
let rotateLayoutIndex = 0;

const LAYOUT_MODES = [
  { id: "standard", label: "Standard" },
  { id: "handheld", label: "Handheld (Compact)" }
];
const LAYOUT_MODE_KEY = "tetrisflip:layout:mode";
let layoutModeIndex = 0;

const ORIENTATION_OPTIONS = [
  { id: "portrait", label: "Portrait" },
  { id: "landscape", label: "Landscape" }
];
const ORIENTATION_KEY = "tetrisflip:layout:orientation";
let orientationIndex = 0;

// Snapshot the default gameplay layout from GAME_CONFIG (used to restore standard mode).
const LAYOUT_BASE = Object.freeze({
  rows: GAME_CONFIG.ROWS,
  spawnBuffer: GAME_CONFIG.SPAWN_BUFFER,
  visibleTop: GAME_CONFIG.VISIBLE_ROWS_TOP,
  visibleBottom: GAME_CONFIG.VISIBLE_ROWS_BOTTOM,
  momentumOffsetY: GAME_CONFIG.MOMENTUM_OFFSET_Y
});

// Compact mode: reduce vertical playfield while keeping the dual-field split balanced.
const COMPACT_LAYOUT_ADJUST = Object.freeze({
  // Reduce the "neutral" center band (spawn buffer / 0-labeled rows) for handheld screens.
  neutral: 2, // affects total rows/spawn buffer
  field: 2    // affects each field's visible rows
});
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
  { id: "alt2", label: "Alt 2", src: `${baseUrl}assets/TetrisFlipAlt2Trim.mp3` },
  { id: "none", label: "None", src: "" }
];
const MUSIC_TRACK_KEY = "tetrisflip:audio:gameTrack";
let musicTrackIndex = 0;
const MUSIC_VOLUME_KEY = "tetrisflip:audio:musicVolume";
const VFX_VOLUME_KEY = "tetrisflip:audio:vfxVolume";
const MUSIC_VOLUME_MAX = 0.7;
const SHOW_FPS_KEY = "tetrisflip:debug:showFps";
const FLIP_P2_HUD_KEY = "tetrisflip:ui:flipP2Hud";
const DUAL_SCREEN_HUD_KEY = "tetrisflip:android:dualScreenHud";
const DUAL_SCREEN_MODES = [
  { id: "info", label: "Info" },
  { id: "game", label: "Game" },
  { id: "off", label: "Off" }
];
let showFps = false;
let flipP2Hud = false;
let dualScreenModeIndex = 0;
let viewportScale = 1;
let dualScreenHudLastPushMs = 0;
let dualScreenHudStatus = "idle";
let fpsFrames = 0;
let fpsAccumMs = 0;
const VFX_VOLUME_MAX = 6.0;
let hudLastLayoutMs = 0;
let hudLastUpdateMs = 0;
let hudCachedSideSpace = 0;
let hudLastDebugMs = 0;
let lastHudDebugText = "";
let hudTightActive = false;
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
  burst: "tetrisflip:burst:scores",
  vanillaClassic: "tetrisflip:vanillaClassic:scores",
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
  resetMenuNavRepeat();
  if (menuState === "mode") {
    modeIndex = 0;
    modeNavColumn = 0;
    updateModeSelection();
  }
  if (menuState === "marathon") {
    marathonActionIndex = 0;
    updateMarathonSelection();
  }
  if (menuState === "burst") {
    burstActionIndex = 0;
    updateBurstSelection();
  }
  if (menuState === "vanillaClassic") {
    vanillaClassicActionIndex = 0;
    updateVanillaClassicSelection();
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

if (window.tetrisFlip && typeof window.tetrisFlip.onOpenHelp === "function") {
  window.tetrisFlip.onOpenHelp(() => {
    openMenu("help");
  });
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
  if (mode === "burst") return burstScores;
  if (mode === "vanillaClassic") return vanillaClassicScores;
  return marathonScores;
}

function updateGravityLabels() {
  if (gravityValue) {
    gravityValue.textContent = String(startingGravity);
  }
  if (burstGravityValue) {
    burstGravityValue.textContent = String(startingGravity);
  }
  if (vanillaClassicGravityValue) {
    vanillaClassicGravityValue.textContent = String(startingGravity);
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

function cycleRedemptionLives() {
  redemptionLives = redemptionLives >= 3 ? 1 : redemptionLives + 1;
  updateRedemptionLabels();
}

function startGame() {
  const mode = menuState === "burst"
    ? "burst"
    : menuState === "chillax"
    ? "chillax"
    : menuState === "vanillaClassic"
      ? "vanillaClassic"
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
  // Apply layout choice at the moment gameplay starts (not mid-run).
  const layoutModeId = (LAYOUT_MODES[layoutModeIndex] || LAYOUT_MODES[0]).id;
  applyLayoutConfig(layoutModeId);
  setTouchEnabled(mode !== "coop" && layoutModeId !== "handheld");
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

function getModeMenuLayout() {
  /** @type {{index:number, el:HTMLElement, rect:DOMRect, cx:number, cy:number}[]} */
  const items = [];
  modeOptions.forEach((el, index) => {
    if (!(el instanceof HTMLElement)) return;
    const rect = el.getBoundingClientRect();
    if (!rect || rect.width <= 0 || rect.height <= 0) return;
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    items.push({ index, el, rect, cx, cy });
  });
  if (!items.length) return null;

  const nonBack = items.filter((item) => item.el.dataset.mode !== "back");
  const xValues = nonBack.map((item) => item.cx).sort((a, b) => a - b);
  let columnCenters = [];
  if (xValues.length <= 1) {
    columnCenters = [xValues[0] ?? items[0].cx];
  } else {
    const spread = xValues[xValues.length - 1] - xValues[0];
    if (spread < 40) {
      const mean = xValues.reduce((sum, v) => sum + v, 0) / xValues.length;
      columnCenters = [mean];
    } else {
      const threshold = Math.max(48, spread * 0.25);
      /** @type {{mean:number,count:number}[]} */
      const clusters = [];
      for (const v of xValues) {
        const last = clusters[clusters.length - 1];
        if (!last || Math.abs(v - last.mean) > threshold) {
          clusters.push({ mean: v, count: 1 });
        } else {
          last.mean = (last.mean * last.count + v) / (last.count + 1);
          last.count += 1;
        }
      }
      columnCenters = clusters.map((c) => c.mean).sort((a, b) => a - b);
    }
  }
  const colCount = Math.max(1, columnCenters.length);
  modeNavColumn = Math.max(0, Math.min(colCount - 1, modeNavColumn));

  const sortedByY = [...items].sort((a, b) => a.cy - b.cy || a.cx - b.cx);
  const avgHeight = sortedByY.reduce((sum, item) => sum + item.rect.height, 0) / sortedByY.length;
  const rowThreshold = Math.max(12, avgHeight * 0.75);

  /** @type {{cy:number, items: {index:number, el:HTMLElement, rect:DOMRect, cx:number, cy:number}[]}[]} */
  const rows = [];
  for (const item of sortedByY) {
    const lastRow = rows[rows.length - 1];
    if (!lastRow || Math.abs(item.cy - lastRow.cy) > rowThreshold) {
      rows.push({ cy: item.cy, items: [item] });
    } else {
      lastRow.items.push(item);
      lastRow.cy = (lastRow.cy * (lastRow.items.length - 1) + item.cy) / lastRow.items.length;
    }
  }

  const rowCount = rows.length;
  /** @type {(number|null)[][]} */
  const cells = Array.from({ length: rowCount }, () => Array.from({ length: colCount }, () => null));
  /** @type {Map<number, {row:number, col:number, isBack:boolean}>} */
  const indexToPos = new Map();
  let backRow = null;

  const getNearestCol = (x) => {
    let bestCol = 0;
    let bestDist = Infinity;
    for (let col = 0; col < colCount; col += 1) {
      const dist = Math.abs(columnCenters[col] - x);
      if (dist < bestDist) {
        bestDist = dist;
        bestCol = col;
      }
    }
    return bestCol;
  };

  rows.forEach((row, rowIndex) => {
    row.items.forEach((item) => {
      const isBack = item.el.dataset.mode === "back";
      if (isBack) {
        backRow = rowIndex;
        for (let col = 0; col < colCount; col += 1) {
          cells[rowIndex][col] = item.index;
        }
        indexToPos.set(item.index, { row: rowIndex, col: modeNavColumn, isBack: true });
        return;
      }
      const col = getNearestCol(item.cx);
      if (cells[rowIndex][col] == null) {
        cells[rowIndex][col] = item.index;
      }
      indexToPos.set(item.index, { row: rowIndex, col, isBack: false });
    });
  });

  return { cells, rowCount, colCount, indexToPos, backRow };
}

function syncModeNavColumnFromSelection() {
  const layout = getModeMenuLayout();
  if (!layout) return;
  const pos = layout.indexToPos.get(modeIndex);
  if (pos && !pos.isBack) {
    modeNavColumn = pos.col;
  }
  modeNavColumn = Math.max(0, Math.min(layout.colCount - 1, modeNavColumn));
}

/**
 * @param {"up"|"down"|"left"|"right"} direction
 */
function moveModeSelection(direction) {
  const layout = getModeMenuLayout();
  if (!layout) return;

  const currentEl = modeOptions[modeIndex];
  const currentIsBack = !!(currentEl && currentEl.dataset && currentEl.dataset.mode === "back");

  if ((direction === "left" || direction === "right") && layout.colCount < 2) return;
  if (currentIsBack && (direction === "left" || direction === "right")) return;

  const currentPos = layout.indexToPos.get(modeIndex);
  let row = currentPos ? currentPos.row : 0;
  let col = currentPos ? currentPos.col : modeNavColumn;
  if (currentIsBack && layout.backRow != null) {
    row = layout.backRow;
    col = modeNavColumn;
  }
  col = Math.max(0, Math.min(layout.colCount - 1, col));

  /** @type {number|null} */
  let nextIndex = null;

  if (direction === "up" || direction === "down") {
    const delta = direction === "down" ? 1 : -1;
    for (let r = row + delta; r >= 0 && r < layout.rowCount; r += delta) {
      const idx = layout.cells[r][col];
      if (idx != null) {
        nextIndex = idx;
        break;
      }
    }
    if (nextIndex == null) {
      const start = direction === "down" ? 0 : layout.rowCount - 1;
      const end = direction === "down" ? layout.rowCount : -1;
      const step = direction === "down" ? 1 : -1;
      for (let r = start; r !== end; r += step) {
        const idx = layout.cells[r][col];
        if (idx != null) {
          nextIndex = idx;
          break;
        }
      }
    }
  } else {
    const targetCol = direction === "right"
      ? (col + 1) % layout.colCount
      : (col + layout.colCount - 1) % layout.colCount;
    const inRow = layout.cells[row] ? layout.cells[row][targetCol] : null;
    if (inRow != null) {
      nextIndex = inRow;
    } else {
      let bestDist = Infinity;
      for (let r = 0; r < layout.rowCount; r += 1) {
        const idx = layout.cells[r][targetCol];
        if (idx == null) continue;
        const dist = Math.abs(r - row);
        if (dist < bestDist) {
          bestDist = dist;
          nextIndex = idx;
        }
      }
    }
  }

  if (nextIndex == null || nextIndex === modeIndex) return;

  modeIndex = nextIndex;
  updateModeSelection();
  syncModeNavColumnFromSelection();
}

function updateMarathonSelection() {
  marathonStart.classList.toggle("is-selected", marathonActionIndex === 0);
  marathonBack.classList.toggle("is-selected", marathonActionIndex === 1);
}

function updateBurstSelection() {
  if (!burstStart || !burstBack) return;
  burstStart.classList.toggle("is-selected", burstActionIndex === 0);
  burstBack.classList.toggle("is-selected", burstActionIndex === 1);
}

function updateVanillaClassicSelection() {
  if (!vanillaClassicStart || !vanillaClassicBack) return;
  vanillaClassicStart.classList.toggle("is-selected", vanillaClassicActionIndex === 0);
  vanillaClassicBack.classList.toggle("is-selected", vanillaClassicActionIndex === 1);
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

function scrollMenuItemIntoView(element) {
  if (!element) return;
  const scroller = element.closest(".options-scroll") || element.closest(".menu-panel");
  if (!scroller) return;
  if (scroller.scrollHeight <= scroller.clientHeight) return;
  const scrollerRect = scroller.getBoundingClientRect();
  const elRect = element.getBoundingClientRect();
  const offsetTop = elRect.top - scrollerRect.top;
  const offsetBottom = elRect.bottom - scrollerRect.bottom;
  if (offsetTop < 0) {
    scroller.scrollTop += offsetTop;
  } else if (offsetBottom > 0) {
    scroller.scrollTop += offsetBottom;
  }
}

function updateOptionsSelection() {
  if (!optionsBack) return;
  if (optionsLayoutModeRow) {
    optionsLayoutModeRow.classList.toggle("is-selected", optionsIndex === 0);
  }
  if (optionsOrientationRow) {
    optionsOrientationRow.classList.toggle("is-selected", optionsIndex === 1);
  }
  if (optionsRotateRow) {
    optionsRotateRow.classList.toggle("is-selected", optionsIndex === 2);
  }
  if (optionsMouseRow) {
    optionsMouseRow.classList.toggle("is-selected", optionsIndex === 3);
  }
  if (optionsMusicRow) {
    optionsMusicRow.classList.toggle("is-selected", optionsIndex === 4);
  }
  if (optionsMusicVolumeRow) {
    optionsMusicVolumeRow.classList.toggle("is-selected", optionsIndex === 5);
  }
  if (optionsVfxVolumeRow) {
    optionsVfxVolumeRow.classList.toggle("is-selected", optionsIndex === 6);
  }
  if (optionsHelpRow) {
    optionsHelpRow.classList.toggle("is-selected", optionsIndex === 7);
  }
  if (optionsShowFpsRow) {
    optionsShowFpsRow.classList.toggle("is-selected", optionsIndex === 8);
  }
  if (optionsFlipP2HudRow) {
    optionsFlipP2HudRow.classList.toggle("is-selected", optionsIndex === 9);
  }
  if (optionsDualScreenHudRow) {
    optionsDualScreenHudRow.classList.toggle("is-selected", optionsIndex === 10);
  }
  optionsBack.classList.toggle("is-selected", optionsIndex === 11);
  const optionItems = [
    optionsLayoutModeRow,
    optionsOrientationRow,
    optionsRotateRow,
    optionsMouseRow,
    optionsMusicRow,
    optionsMusicVolumeRow,
    optionsVfxVolumeRow,
    optionsHelpRow,
    optionsShowFpsRow,
    optionsFlipP2HudRow,
    optionsDualScreenHudRow,
    optionsBack
  ];
  scrollMenuItemIntoView(optionItems[optionsIndex]);
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
      + "<span class=\"score-value\"></span>"
      + (mode === "garbage" ? "" : "<span class=\"score-level\"></span>");
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
    if (mode !== "garbage") {
      const level = document.createElement("span");
      level.className = "score-level";
      level.textContent = Number.isFinite(entry.level) ? ("L" + entry.level) : "L-";
      item.append(rank, name, value, level);
    } else {
      item.append(rank, name, value);
    }
    listEl.appendChild(item);
  });
}

function normalizeEntry(entry) {
  if (entry && typeof entry === "object") {
    return {
      score: Number.isFinite(entry.score) ? entry.score : 0,
      timeMs: Number.isFinite(entry.timeMs) ? entry.timeMs : null,
      level: Number.isFinite(entry.level) ? entry.level : null
    };
  }
  if (Number.isFinite(entry)) {
    return { score: entry, timeMs: null, level: null };
  }
  return { score: 0, timeMs: null, level: null };
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

function updateExitConfirmSelection() {
  if (!exitYes || !exitNo) return;
  exitYes.classList.toggle("is-selected", exitConfirmIndex === 0);
  exitNo.classList.toggle("is-selected", exitConfirmIndex === 1);
}

function openExitConfirm() {
  if (!exitModal) return;
  exitConfirmActive = true;
  exitConfirmIndex = 1;
  updateExitConfirmSelection();
  exitModal.hidden = false;
  updateMusicState();
}

function closeExitConfirm() {
  if (!exitModal) return;
  exitConfirmActive = false;
  exitModal.hidden = true;
  updateMusicState();
}

function requestExitApp() {
  try {
    if (nativeApp && typeof nativeApp.exitApp === "function") {
      nativeApp.exitApp();
      return;
    }
  } catch {
    // ignore
  }
  try {
    window.close();
  } catch {
    // ignore
  }
}
function applyLayoutConfig(modeId) {
  // Vanilla - Classic always uses the standard board + timings (classic Marathon feel).
  if (activeMode === "vanillaClassic") {
    GAME_CONFIG.ROWS = LAYOUT_BASE.rows;
    GAME_CONFIG.SPAWN_BUFFER = LAYOUT_BASE.spawnBuffer;
    GAME_CONFIG.VISIBLE_ROWS_TOP = LAYOUT_BASE.visibleTop;
    GAME_CONFIG.VISIBLE_ROWS_BOTTOM = LAYOUT_BASE.visibleBottom;
    GAME_CONFIG.MOMENTUM_OFFSET_Y = LAYOUT_BASE.momentumOffsetY;
    return;
  }

  if (modeId === "handheld") {
    const rows = LAYOUT_BASE.rows - (COMPACT_LAYOUT_ADJUST.neutral + COMPACT_LAYOUT_ADJUST.field * 2);
    const evenRows = rows - (rows % 2);
    GAME_CONFIG.ROWS = Math.max(10, evenRows);
    GAME_CONFIG.SPAWN_BUFFER = Math.max(2, LAYOUT_BASE.spawnBuffer - COMPACT_LAYOUT_ADJUST.neutral);
    GAME_CONFIG.VISIBLE_ROWS_TOP = Math.max(6, LAYOUT_BASE.visibleTop - COMPACT_LAYOUT_ADJUST.field);
    GAME_CONFIG.VISIBLE_ROWS_BOTTOM = Math.max(6, LAYOUT_BASE.visibleBottom - COMPACT_LAYOUT_ADJUST.field);
    GAME_CONFIG.MOMENTUM_OFFSET_Y = LAYOUT_BASE.momentumOffsetY - 300;
  } else {
    GAME_CONFIG.ROWS = LAYOUT_BASE.rows;
    GAME_CONFIG.SPAWN_BUFFER = LAYOUT_BASE.spawnBuffer;
    GAME_CONFIG.VISIBLE_ROWS_TOP = LAYOUT_BASE.visibleTop;
    GAME_CONFIG.VISIBLE_ROWS_BOTTOM = LAYOUT_BASE.visibleBottom;
    GAME_CONFIG.MOMENTUM_OFFSET_Y = LAYOUT_BASE.momentumOffsetY;
  }
}

function applyLayoutMode(index) {
  if (!optionsLayoutModeValue) return;
  layoutModeIndex = (index + LAYOUT_MODES.length) % LAYOUT_MODES.length;
  const mode = LAYOUT_MODES[layoutModeIndex];
  optionsLayoutModeValue.textContent = mode.label;
  document.documentElement.dataset.layoutMode = mode.id;
  try {
    localStorage.setItem(LAYOUT_MODE_KEY, mode.id);
  } catch {
    // Ignore storage failures.
  }
}

function applyOrientationMode(index) {
  if (!optionsOrientationValue) return;
  orientationIndex = (index + ORIENTATION_OPTIONS.length) % ORIENTATION_OPTIONS.length;
  const mode = ORIENTATION_OPTIONS[orientationIndex];
  optionsOrientationValue.textContent = mode.label;
  document.documentElement.dataset.orientation = mode.id;
  try {
    localStorage.setItem(ORIENTATION_KEY, mode.id);
  } catch {
    // Ignore storage failures.
  }
}

function applyRotateLayout(index) {
  if (!optionsRotateValue) return;
  rotateLayoutIndex = (index + ROTATE_LAYOUTS.length) % ROTATE_LAYOUTS.length;
  const layout = ROTATE_LAYOUTS[rotateLayoutIndex];
  optionsRotateValue.textContent = layout.label;
  if (optionsController) {
    if (layout.id === "sidewaysSouthEast") {
      optionsController.src = controllerHandheld1Src;
    } else if (layout.id === "sidewaysSouthWest") {
      optionsController.src = controllerHandheld2Src;
    } else if (layout.id === "southWest") {
      optionsController.src = controllerStandardSrc;
    } else {
      optionsController.src = controllerAlternateSrc;
    }
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

function applyShowFps(enabled, persist = true) {
  showFps = Boolean(enabled);
  if (persist) {
    try {
      localStorage.setItem(SHOW_FPS_KEY, showFps ? "true" : "false");
    } catch {
      // ignore
    }
  }
  if (optionsShowFpsValue) {
    optionsShowFpsValue.textContent = showFps ? "On" : "Off";
  }
  if (fpsCounter) {
    fpsCounter.hidden = !showFps;
  }
}

function applyLayoutDebug(enabled, persist = true) {
  layoutDebugEnabled = Boolean(enabled);
  if (persist) {
    try {
      localStorage.setItem(LAYOUT_DEBUG_STORAGE_KEY, layoutDebugEnabled ? "true" : "false");
    } catch {
      // ignore
    }
  }
  if (optionsLayoutDebugValue) {
    optionsLayoutDebugValue.textContent = layoutDebugEnabled ? "On" : "Off";
  }
  ensureDebugOverlays();
  if (hudDebugBadge) {
    hudDebugBadge.hidden = !layoutDebugEnabled;
  }
  updateHudDebugBadge();
}

function applyFlipP2Hud(enabled, persist = true) {
  flipP2Hud = Boolean(enabled);
  if (persist) {
    try {
      localStorage.setItem(FLIP_P2_HUD_KEY, flipP2Hud ? "true" : "false");
    } catch {
      // ignore
    }
  }
  if (optionsFlipP2HudValue) {
    optionsFlipP2HudValue.textContent = flipP2Hud ? "On" : "Off";
  }
  document.body.dataset.flipP2Hud = flipP2Hud ? "true" : "false";
  if (game && typeof game.setFlipP2Hud === "function") {
    game.setFlipP2Hud(flipP2Hud);
  }
}

function applyDualScreenHud(indexOrId, persist = true) {
  if (typeof indexOrId === "string") {
    const found = DUAL_SCREEN_MODES.findIndex((m) => m.id === indexOrId);
    dualScreenModeIndex = found >= 0 ? found : 0;
  } else {
    dualScreenModeIndex = (indexOrId + DUAL_SCREEN_MODES.length) % DUAL_SCREEN_MODES.length;
  }
  const mode = DUAL_SCREEN_MODES[dualScreenModeIndex];
  if (optionsDualScreenHudValue) {
    optionsDualScreenHudValue.textContent = mode.label;
  }
  document.body.dataset.dualScreenMode = mode.id;

  if (persist) {
    try {
      localStorage.setItem("tetrisflip:android:dualScreenHud", mode.id);
    } catch {
      // ignore
    }
  }

  updateViewportScale();

  if (DualScreenHud) {
    try {
      DualScreenHud.setEnabled({ enabled: mode.id !== "off" });
    } catch (err) {
      console.warn("Failed to notify DualScreenHud plugin:", err);
    }
  }
}
const MUSIC_RECOVERY_STALL_MS = 6000;
const MUSIC_RECOVERY_COOLDOWN_MS = 20000;

function attemptPlay(audio, now = performance.now()) {
  if (!audio) return;
  audio.__tetrisFlipLastPlayAttemptMs = now;
  try {
    const playPromise = audio.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {});
    }
  } catch {
    // Ignore playback failures.
  }
}

function ensureMusicPlaying(audio, now = performance.now()) {
  if (!audio) return;
  if (document.hidden) return;

  // If the element is not backed by an active src (e.g. "None"), don't fight it.
  if (!audio.src) return;

  const isBroken = audio.paused || audio.error;
  if (!isBroken) {
    const t = audio.currentTime;
    if (Number.isFinite(t)) {
      audio.__tetrisFlipLastProgressTime = t;
      audio.__tetrisFlipLastProgressMs = now;
    }
    return;
  }

  const lastProgress = audio.__tetrisFlipLastProgressMs || 0;
  if ((now - lastProgress) < MUSIC_RECOVERY_STALL_MS) return;

  const lastAttempt = audio.__tetrisFlipLastPlayAttemptMs || 0;
  if ((now - lastAttempt) < MUSIC_RECOVERY_COOLDOWN_MS) return;


  const resumeTime = audio.__tetrisFlipLastProgressTime;
  if (Number.isFinite(resumeTime) && Number.isFinite(audio.currentTime)
      && (audio.currentTime + 0.25) < resumeTime) {
    try {
      audio.currentTime = resumeTime;
    } catch {
      // Ignore seek failures.
    }
  }
  // On some Android WebViews, the audio element can pause silently. Keep recovery light:
  // do not call load() or reset currentTime here to avoid restarting the track.
  attemptPlay(audio, now);
}
function stopAudio(audio) {
  if (!audio) return;
  try {
    audio.pause();
  } catch {
    // ignore
  }
  try {
    audio.currentTime = 0;
  } catch {
    // ignore
  }
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

function updateMusicState(now = performance.now()) {
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
      attemptPlay(gameMusic, now);
    }
  }
  const shouldRecoverGameMusic = activeMode === "vanillaClassic"
    && !useTitle
    && game
    && !game.paused
    && gameMusicEnabled
    && musicMode === "game";

  if (shouldRecoverGameMusic) {
    ensureMusicPlaying(gameMusic, now);
  }
}

function commitNameEntry() {
  if (!pendingEntry) return;
  const storageKey = getScoreStorageKey(pendingScoreMode);
  const scores = loadScores(storageKey);
  const trimmedName = nameInput.value.trim() || "Player 1";
  const entry = {
    name: trimmedName,
    score: pendingEntry.score,
    level: Number.isFinite(pendingEntry.level) ? pendingEntry.level : null
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

function shouldUseVanillaClassicLandscapeCanvas(mode) {
  if (mode !== "vanillaClassic") return false;
  if (!wrap || !wrap.getBoundingClientRect) return false;
  const wrapRect = wrap.getBoundingClientRect();
  const wideViewport = wrapRect.width > wrapRect.height;
  if (!wideViewport) return false;
  const playfieldW = GAME_CONFIG.COLS * GAME_CONFIG.BLOCK_SIZE + GAME_CONFIG.GRID_MARGIN * 2;
  const sideSpace = Math.max(0, (wrapRect.width - playfieldW) / 2);
  return sideSpace >= 140;
}

function setCanvasSize(mode) {
  const vanillaLandscape = shouldUseVanillaClassicLandscapeCanvas(mode);
  const wrapRect = (wrap && wrap.getBoundingClientRect) ? wrap.getBoundingClientRect() : null;
  const portraitViewport = wrapRect ? (wrapRect.width <= wrapRect.height) : (window.innerHeight >= window.innerWidth);
  const vanillaPortrait = mode === "vanillaClassic" && portraitViewport && !vanillaLandscape;

  const playfieldOnlyW = GAME_CONFIG.COLS * GAME_CONFIG.BLOCK_SIZE + GAME_CONFIG.GRID_MARGIN * 2;
  const vanillaPlayfieldH = (GAME_CONFIG.ROWS / 2) * GAME_CONFIG.BLOCK_SIZE;
  const vanillaLegacyH = vanillaPlayfieldH + GAME_CONFIG.GRID_MARGIN * 2;
  const vanillaPortraitTop = 84;
  const vanillaPortraitBottom = 84;
  const vanillaPortraitHudW = 120;

  const nextWidth = vanillaLandscape
    ? playfieldOnlyW
    : (vanillaPortrait
      ? (playfieldOnlyW + vanillaPortraitHudW)
      : getCanvasWidthForMode(mode));

  const nextHeight = (mode === "vanillaClassic")
    ? (vanillaPortrait
      ? (vanillaPlayfieldH + vanillaPortraitTop + vanillaPortraitBottom)
      : vanillaLegacyH)
    : GAME_CONFIG.ROWS * GAME_CONFIG.BLOCK_SIZE;

  const nextW = Math.round(nextWidth);
  const nextH = Math.round(nextHeight);
  const changed = canvas.width !== nextW || canvas.height !== nextH;
  if (!changed) return;

  canvas.width = nextW;
  canvas.height = nextH;
  hudLastLayoutMs = 0;
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
function handleNativeBackButton() {
  if (exitConfirmActive) {
    requestExitApp();
    return;
  }
  if (menuActive && menuState === "splash") {
    openExitConfirm();
    return;
  }
  if (menuActive) {
    input.pressVirtual("Backspace");
    return;
  }
  input.pressVirtual("Escape");
}

async function initNativeBackHandler() {
  const cap = window.Capacitor;
  const platform = cap && typeof cap.getPlatform === "function" ? cap.getPlatform() : "web";
  if (platform === "web") return;

  try {
    const mod = await import("@capacitor/app");
    if (mod && mod.App) {
      nativeApp = mod.App;
      if (nativeApp.addListener) {
        nativeApp.addListener("backButton", handleNativeBackButton);
      }
      return;
    }
  } catch {
    // ignore and fall back
  }

  const legacyApp = cap && cap.Plugins ? cap.Plugins.App : null;
  if (legacyApp && legacyApp.addListener) {
    nativeApp = legacyApp;
    legacyApp.addListener("backButton", handleNativeBackButton);
  }
}

initNativeBackHandler();
try {
  const stored = localStorage.getItem(LAYOUT_MODE_KEY);
  const storedIndex = LAYOUT_MODES.findIndex((entry) => entry.id === stored);
  applyLayoutMode(storedIndex >= 0 ? storedIndex : 0);
} catch {
  applyLayoutMode(0);
}
try {
  const stored = localStorage.getItem(ORIENTATION_KEY);
  const storedIndex = ORIENTATION_OPTIONS.findIndex((entry) => entry.id === stored);
  applyOrientationMode(storedIndex >= 0 ? storedIndex : 0);
} catch {
  applyOrientationMode(0);
}
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
try {
  const stored = localStorage.getItem(SHOW_FPS_KEY);
  applyShowFps(stored === "true", false);
} catch {
  applyShowFps(false, false);
}
try {
  const stored = localStorage.getItem(FLIP_P2_HUD_KEY);
  applyFlipP2Hud(stored === "true", false);
} catch {
  applyFlipP2Hud(false, false);
}
try {
  applyLayoutDebug(layoutDebugEnabled, false);
} catch {
  applyLayoutDebug(false, false);
}
try {
  const stored = localStorage.getItem("tetrisflip:android:dualScreenHud");
  applyDualScreenHud(stored || "info", false);
} catch {
  applyDualScreenHud("info", false);
}
game = new GameLoop(ctx, input, {
  onFlip() {
    updateViewportScale();
  },
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
    const { score, combinedScore, level, p2Level } = game.getScoreState();
    const entryLevel = activeMode === "coop" ? Math.max(level || 0, p2Level || 0) : level;
    const entry = {
      score: activeMode === "coop" ? combinedScore : score,
      level: Number.isFinite(entryLevel) ? entryLevel : null
    };
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
applyFlipP2Hud(flipP2Hud, false);

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

if (exitYes) {
  exitYes.addEventListener("click", () => {
    requestExitApp();
  });
}

if (exitNo) {
  exitNo.addEventListener("click", () => {
    closeExitConfirm();
  });
}
nameSave.addEventListener("click", () => {
  if (!nameEntryActive) return;
  commitNameEntry();
});

nameSkip.addEventListener("click", () => {
  if (!nameEntryActive) return;
  closeNameEntry();
});

nameInput.addEventListener("keydown", (event) => {
  if (!nameEntryActive) return;
  if (event.code === "Enter") {
    event.preventDefault();
    commitNameEntry();
  } else if (event.code === "Escape") {
    event.preventDefault();
    closeNameEntry();
  }
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

burstStart.addEventListener("click", () => {
  burstActionIndex = 0;
  updateBurstSelection();
  startGame();
});

burstBack.addEventListener("click", () => {
  burstActionIndex = 1;
  updateBurstSelection();
  showScreen("mode");
});

if (vanillaClassicStart) {
  vanillaClassicStart.addEventListener("click", () => {
    vanillaClassicActionIndex = 0;
    updateVanillaClassicSelection();
    startGame();
  });
}
if (vanillaClassicBack) {
  vanillaClassicBack.addEventListener("click", () => {
    vanillaClassicActionIndex = 1;
    updateVanillaClassicSelection();
    showScreen("mode");
  });
}

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
    cycleRedemptionLives();
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
  if (event && event.defaultPrevented) return;
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;
  if (menuState === "splash") {
    if (consumeMenuBack()) {
      openExitConfirm();
      return;
    }
    showScreen("mode");
  }
});

function ensureTouchButtons() {
  const createTouchSvg = (kind) => {
    const ns = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(ns, "svg");
    svg.setAttribute("class", `touch-icon touch-icon--${kind}`);
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    if (kind === "pause") {
      svg.setAttribute("fill", "currentColor");
      svg.setAttribute("stroke", "none");
    } else {
      svg.setAttribute("fill", "none");
      svg.setAttribute("stroke", "currentColor");
      svg.setAttribute("stroke-linecap", "round");
      svg.setAttribute("stroke-linejoin", "round");
      svg.setAttribute("stroke-width", kind === "flip" ? "3.4" : "2.6");
    }

    if (kind === "flip") {
      const poly1 = document.createElementNS(ns, "polyline");
      poly1.setAttribute("points", "23 4 23 10 17 10");
      const poly2 = document.createElementNS(ns, "polyline");
      poly2.setAttribute("points", "1 20 1 14 7 14");
      const path = document.createElementNS(ns, "path");
      path.setAttribute("d", "M3.51 9a9 9 0 0 1 14.13-3.36L23 10M1 14l5.37 4.37A9 9 0 0 0 20.49 15");
      svg.append(poly1, poly2, path);
      return svg;
    }

    if (kind === "pause") {
      const bar1 = document.createElementNS(ns, "rect");
      bar1.setAttribute("x", "5.0");
      bar1.setAttribute("y", "4.0");
      bar1.setAttribute("width", "4.3");
      bar1.setAttribute("height", "16.0");
      bar1.setAttribute("rx", "0.7");
      const bar2 = document.createElementNS(ns, "rect");
      bar2.setAttribute("x", "15.5");
      bar2.setAttribute("y", "4.0");
      bar2.setAttribute("width", "4.3");
      bar2.setAttribute("height", "16.0");
      bar2.setAttribute("rx", "0.7");
      svg.append(bar1, bar2);
      return svg;
    }

    return svg;
  };

  const wantsFlip = activeMode !== "vanillaClassic";
  if (!wantsFlip) {
    if (touchFlip) {
      touchFlip.remove();
      touchFlip = null;
    }
  }
  if (wantsFlip && !touchFlip) {
    const button = document.createElement("button");
    button.className = "touch-flip";
    button.id = "touch-flip";
    button.type = "button";
    button.setAttribute("aria-label", "Flip");
    button.title = "Flip";
    const label = document.createElement("span");
    label.className = "sr-only";
    label.textContent = "Flip";
    button.append(label, createTouchSvg("flip"));
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
    button.setAttribute("aria-label", "Pause");
    button.title = "Pause";
    const label = document.createElement("span");
    label.className = "sr-only";
    label.textContent = "Pause";
    button.append(label, createTouchSvg("pause"));
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
    syncModeNavColumnFromSelection();
    if (option.classList.contains("is-disabled")) return;
    const selected = option.dataset.mode;
    if (selected === "back") {
      backToSplash();
    } else if (selected === "options") {
      showScreen("options");
    } else if (selected === "marathon" || selected === "burst" || selected === "vanillaClassic" || selected === "chillax"
      || selected === "garbage" || selected === "redemption"
      || selected === "coop" || selected === "sirtet") {
      showScreen(selected);
    }
  });
});

// ModeBack capture fallback: mobile/embedded browsers can swallow button click events (often due to Text targets).
// Capture-phase + coordinate hit-testing keeps RETURN TO TITLE usable on touch/mouse.
let lastModeBackActivateMs = 0;
let modeBackSuppressClickUntil = 0;
/**
 * @param {Event} event
 * @returns {Element | null}
 */
const getEventElement = (event) => {
  const target = event ? event.target : null;
  if (target instanceof Element) return target;
  // e.g. when tapping button text, target can be a Text node.
  if (target instanceof Node && target.parentElement instanceof Element) {
    return target.parentElement;
  }
  return null;
};

const handleModeBackActivate = (event) => {
  /** @type {any} */
  const e = event;
  if (!menuActive || menuState !== "mode" || !modeBack) return;

  let clientX = e && e.clientX;
  let clientY = e && e.clientY;
  if ((clientX == null || clientY == null) && e && e.changedTouches && e.changedTouches[0]) {
    clientX = e.changedTouches[0].clientX;
    clientY = e.changedTouches[0].clientY;
  }

  const el = getEventElement(event);
  let hit = false;
  if (clientX != null && clientY != null) {
    const r = modeBack.getBoundingClientRect();
    hit = clientX >= r.left && clientX <= r.right && clientY >= r.top && clientY <= r.bottom;
  }
  if (!hit && el) {
    hit = !!el.closest("#mode-back");
  }

  if (!hit) return;

  if (event && typeof event.preventDefault === "function") event.preventDefault();
  if (event && typeof event.stopPropagation === "function") event.stopPropagation();

  const now = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
  if (now - lastModeBackActivateMs < 250) return;
  lastModeBackActivateMs = now;

  // Suppress the follow-up click event that would otherwise bubble into the splash screen and immediately re-open MODE SELECT.
  modeBackSuppressClickUntil = now + 600;

  backToSplash();
};
document.addEventListener("pointerup", handleModeBackActivate, true);
document.addEventListener("touchend", handleModeBackActivate, true);
document.addEventListener("click", handleModeBackActivate, true);

// Swallow the trailing click after RETURN TO TITLE so splash does not immediately re-open MODE SELECT.
document.addEventListener("click", (event) => {
  if (!menuActive) return;
  const now = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
  if (now > modeBackSuppressClickUntil) return;
  if (event && typeof event.preventDefault === "function") event.preventDefault();
  if (event && typeof event.stopPropagation === "function") event.stopPropagation();
}, true);

if (optionsBack) {
  optionsBack.addEventListener("click", () => {
    showScreen("mode");
  });
}

if (optionsLayoutModeRow) {
  optionsLayoutModeRow.addEventListener("click", () => {
    optionsIndex = 0;
    updateOptionsSelection();
    applyLayoutMode(layoutModeIndex + 1);
  });
}

if (optionsOrientationRow) {
  optionsOrientationRow.addEventListener("click", () => {
    optionsIndex = 1;
    updateOptionsSelection();
    applyOrientationMode(orientationIndex + 1);
  });
}

if (optionsRotateRow) {
  optionsRotateRow.addEventListener("click", () => {
    optionsIndex = 2;
    updateOptionsSelection();
    applyRotateLayout(rotateLayoutIndex + 1);
  });
}

if (optionsMouseRow) {
  optionsMouseRow.addEventListener("click", () => {
    optionsIndex = 3;
    updateOptionsSelection();
    applyMouseScheme(mouseSchemeIndex + 1);
  });
}

if (optionsMusicRow) {
  optionsMusicRow.addEventListener("click", () => {
    optionsIndex = 4;
    updateOptionsSelection();
    applyMusicTrack(musicTrackIndex + 1);
  });
}

if (optionsMusicVolumeRow) {
  optionsMusicVolumeRow.addEventListener("click", () => {
    optionsIndex = 5;
    updateOptionsSelection();
    applyMusicVolume(musicVolumeIndex + 1);
  });
}

if (optionsVfxVolumeRow) {
  optionsVfxVolumeRow.addEventListener("click", () => {
    optionsIndex = 6;
    updateOptionsSelection();
    applyVfxVolume(vfxVolumeIndex + 1);
  });
}

if (optionsHelpRow) {
  optionsHelpRow.addEventListener("click", () => {
    optionsIndex = 7;
    updateOptionsSelection();
    showScreen("help");
  });
}
if (optionsShowFpsRow) {
  optionsShowFpsRow.addEventListener("click", () => {
    optionsIndex = 8;
    updateOptionsSelection();
    applyShowFps(!showFps);
  });
}
if (optionsFlipP2HudRow) {
  optionsFlipP2HudRow.addEventListener("click", () => {
    optionsIndex = 9;
    updateOptionsSelection();
    applyFlipP2Hud(!flipP2Hud);
  });
}
if (optionsDualScreenHudRow) {
  optionsDualScreenHudRow.addEventListener("click", () => {
    optionsIndex = 10;
    updateOptionsSelection();
    applyDualScreenHud(dualScreenModeIndex + 1);
  });
}


if (helpBack) {
  helpBack.addEventListener("click", () => {
    showScreen("options");
  });
}

renderScores(loadScores(getScoreStorageKey("marathon")), marathonScores, "marathon");
renderScores(loadScores(getScoreStorageKey("vanillaClassic")), vanillaClassicScores, "vanillaClassic");
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

function updateHudDebugBadge() {
  if (!hudDebugBadge || hudDebugBadge.hidden) return;
  const vv = window.visualViewport;
  const wrapRect = wrap && wrap.getBoundingClientRect ? wrap.getBoundingClientRect() : null;
  const menuRect = menu && menu.getBoundingClientRect ? menu.getBoundingClientRect() : null;
  const menuPos = menu ? getComputedStyle(menu).position : "";
  const exitRect = exitModal && exitModal.getBoundingClientRect ? exitModal.getBoundingClientRect() : null;
  const exitVisible = exitModal ? !exitModal.hidden : false;
  const exitPanel = (exitVisible && exitModal) ? exitModal.querySelector(".exit-panel") : null;
  const exitPanelRect = exitPanel && exitPanel.getBoundingClientRect ? exitPanel.getBoundingClientRect() : null;
  const exitPos = exitModal ? getComputedStyle(exitModal).position : "";
  const panelPos = exitPanel ? getComputedStyle(exitPanel).position : "";
  const vw = vv ? Math.round(vv.width) : 0;
  const vh = vv ? Math.round(vv.height) : 0;
  const wrapW = wrapRect ? Math.round(wrapRect.width) : 0;
  const wrapH = wrapRect ? Math.round(wrapRect.height) : 0;
  const menuW = menuRect ? Math.round(menuRect.width) : 0;
  const menuH = menuRect ? Math.round(menuRect.height) : 0;
  const menuY = menuRect ? Math.round(menuRect.top) : 0;
  const exitW = (exitVisible && exitRect) ? Math.round(exitRect.width) : 0;
  const exitH = (exitVisible && exitRect) ? Math.round(exitRect.height) : 0;
  const exitX = (exitVisible && exitRect) ? Math.round(exitRect.left) : 0;
  const exitY = (exitVisible && exitRect) ? Math.round(exitRect.top) : 0;
  const panelX = (exitVisible && exitPanelRect) ? Math.round(exitPanelRect.left) : 0;
  const panelY = (exitVisible && exitPanelRect) ? Math.round(exitPanelRect.top) : 0;
  const panelW = (exitVisible && exitPanelRect) ? Math.round(exitPanelRect.width) : 0;
  const panelH = (exitVisible && exitPanelRect) ? Math.round(exitPanelRect.height) : 0;
  const dpr = window.devicePixelRatio ? Number(window.devicePixelRatio.toFixed(2)) : 1;
  hudDebugBadge.textContent =
    "iw " + window.innerWidth + " ih " + window.innerHeight
    + " vv " + vw + "x" + vh
    + " wrap " + wrapW + "x" + wrapH
    + " menu " + menuW + "x" + menuH + "@" + menuY + " " + menuPos
    + " exit " + (exitVisible ? (exitW + "x" + exitH + "@" + exitX + "," + exitY) : "off") + " " + exitPos
    + " panel " + (exitVisible ? (panelW + "x" + panelH + "@" + panelX + "," + panelY) : "off") + " " + panelPos
    + " dpr " + dpr;
}

function getTouchScale() {
  const touch = window.matchMedia("(pointer: coarse)").matches
    || navigator.maxTouchPoints > 0;
  if (!touch) return 1;
  const padding = 2;
  const wrapRect = (wrap && wrap.getBoundingClientRect) ? wrap.getBoundingClientRect() : null;
  const viewportW = wrapRect ? wrapRect.width : ((window.visualViewport && window.visualViewport.width) ? window.visualViewport.width : window.innerWidth);
  const viewportH = wrapRect ? wrapRect.height : ((window.visualViewport && window.visualViewport.height) ? window.visualViewport.height : window.innerHeight);
  const availableW = viewportW - padding * 2;
  const availableH = viewportH - padding * 2;
  if (availableW <= 0 || availableH <= 0) return 1;
  const scaleW = availableW / canvas.width;
  const isDualScreenGame = DUAL_SCREEN_MODES[dualScreenModeIndex].id === "game";
  const displayCanvasHeight = isDualScreenGame ? (canvas.height / 2) : canvas.height;
  const scaleH = availableH / displayCanvasHeight;
  if (isDualScreenGame) {
    return Math.min(scaleW, scaleH);
  }
  return Math.min(1, scaleW, scaleH);
}

function setGameplayDataset() {
  if (!wrap) return;
  const gameplayVisible = !menuActive && !gameOverActive && !nameEntryActive;
  wrap.dataset.gameplay = gameplayVisible ? "true" : "false";
  document.body.dataset.gameplay = (!menuActive) ? "true" : "false";
}
function updateViewportScale() {
  if (!wrap) return;
  const menuVisible = menu && !menu.hidden;
  // Touch buttons sit above the menu (higher z-index); hide them while any menu is open.
  const hideTouchButtons = menuVisible || !touchEnabled;
  if (touchFlip) touchFlip.hidden = hideTouchButtons;
  if (touchPause) touchPause.hidden = hideTouchButtons;
  setCanvasSize(activeMode);
  setGameplayDataset();
  viewportScale = menuVisible ? 1 : getTouchScale();
  document.documentElement.style.setProperty("--hud-scale", String(viewportScale.toFixed(3)));
  if (game && game.setViewportScale) {
    game.setViewportScale(viewportScale);
  }

  // Reset layout + transforms first.
  wrap.style.transform = "";
  wrap.style.transformOrigin = "";
  const canvasContainer = document.getElementById("canvas-container");
  if (canvasContainer) {
    canvasContainer.style.transform = "";
    canvasContainer.style.transformOrigin = "";
    canvasContainer.style.width = "";
    canvasContainer.style.height = "";
    canvasContainer.style.overflow = "";
  }
  canvas.style.transform = "";
  canvas.style.transformOrigin = "";

  const isDualScreenGame = DUAL_SCREEN_MODES[dualScreenModeIndex].id === "game";
  if (menuVisible || (viewportScale >= 1 && !isDualScreenGame)) {
    wrap.style.placeItems = "";
  } else {
    // When scaling is active, keep overlays centered by transforming the canvas only.
    wrap.style.placeItems = "start";
    const wrapRect = wrap.getBoundingClientRect();
    const viewportW = wrapRect.width;
    const viewportH = wrapRect.height;
    const displayCanvasHeight = isDualScreenGame ? (canvas.height / 2) : canvas.height;
    const isFlipped = game ? game.board.isFlipped : false;
    document.body.dataset.isFlipped = isFlipped ? "true" : "false";

    const scaledWidth = canvas.width * viewportScale;
    const scaledHeight = displayCanvasHeight * viewportScale;
    const offsetX = Math.max(0, (viewportW - scaledWidth) / 2);
    let offsetY = 2;
    if (activeMode === "vanillaClassic" && viewportW <= viewportH) {
      offsetY = Math.max(2, (viewportH - scaledHeight) / 2);
    }

    if (canvasContainer) {
      canvasContainer.style.width = `${canvas.width}px`;
      canvasContainer.style.height = `${displayCanvasHeight}px`;
      canvasContainer.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${viewportScale})`;
      canvasContainer.style.transformOrigin = "top left";
      if (isDualScreenGame) {
        canvasContainer.style.overflow = "hidden";
      } else {
        canvasContainer.style.overflow = "";
      }

      // In dual-screen game mode, the top screen always shows the top half
      // of the canvas (rows 0-19). The flip mechanic moves pieces between
      // halves on the canvas itself, so no translation is needed.
      canvas.style.transform = "translateY(0px)";
      canvas.style.transformOrigin = "top left";
    } else {
      canvas.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${viewportScale})`;
      canvas.style.transformOrigin = "top left";
    }
  }

  updateHudDebugBadge();
  positionTouchButtons();
}

/**
 * Lightweight per-frame clip sync for dual-screen game mode.
 * Ensures the top screen always shows the top half of the canvas.
 * The two physical screens form one continuous display split in half;
 * the flip mechanic moves pieces between halves on the canvas itself.
 * Does NOT do any layout recalculation — safe to call every frame.
 */
function syncDualScreenClip() {
  const isDualScreenGame = DUAL_SCREEN_MODES[dualScreenModeIndex].id === "game";
  if (!isDualScreenGame) return;
  const canvasContainer = document.getElementById("canvas-container");
  if (!canvasContainer) return;
  // Always show the top half — no translation needed.
  const current = canvas.style.transform;
  if (current !== "translateY(0px)") {
    canvas.style.transform = "translateY(0px)";
    canvas.style.transformOrigin = "top left";
  }
}


function formatHudNumber(value) {
  if (!Number.isFinite(value)) return "0";
  const intValue = Math.max(0, Math.floor(value));
  return String(intValue).padStart(6, "0");
}


function formatHudTime(ms) {
  const value = Number(ms);
  if (!Number.isFinite(value) || value < 0) return "0:00.0";
  const total = Math.floor(value);
  const minutes = Math.floor(total / 60000);
  const seconds = Math.floor((total % 60000) / 1000);
  const tenths = Math.floor((total % 1000) / 100);
  return String(minutes) + ":" + String(seconds).padStart(2, "0") + "." + String(tenths);
}


function getPieceCssClass(type) {
  switch (type) {
    case 1: return "piece-i";
    case 2: return "piece-j";
    case 3: return "piece-l";
    case 4: return "piece-o";
    case 5: return "piece-s";
    case 6: return "piece-t";
    case 7: return "piece-z";
    default: return "";
  }
}

function setMiniPieceIcon(el, type) {
  if (!el) return;
  const css = getPieceCssClass(type);
  if (!css) {
    el.className = "mini-piece is-empty";
    el.setAttribute("aria-hidden", "true");
    return;
  }
  el.removeAttribute("aria-hidden");
  el.className = `mini-piece ${css}`;
}
function updateHudMeter(fillEl, state) {
  if (!fillEl || !state) return;
  const value = Number(state.value) || 0;
  const max = Number(state.max) || 0;
  const burstTimer = Number(state.burstTimer) || 0;
  const pct = max > 0 ? Math.max(0, Math.min(1, value / max)) : 0;
  fillEl.style.height = `${Math.round(pct * 100)}%`;
  let fillColor = "#4cc3ff";
  if (pct >= 0.75) {
    fillColor = "#ff6b5a";
  } else if (pct >= 0.5) {
    fillColor = "#ffd34c";
  } else if (pct >= 0.25) {
    fillColor = "#4cff9a";
  }
  if (burstTimer > 0) {
    fillColor = "#ff5a5a";
  }
  fillEl.style.background = fillColor;
}

function updateLandscapeHud() {
  if (!landscapeHud || !wrap) return;
  const gameplay = !menuActive;
  const wrapRect = wrap.getBoundingClientRect();
  const wideViewport = wrapRect.width > wrapRect.height;
  // Hide the landscape HUD on portrait-ish layouts (e.g. small handheld screens)
  // and while name entry is active (keyboard open).
  if (!gameplay || !wideViewport || nameEntryActive) {
    landscapeHud.hidden = true;
    if (game && typeof game.setLandscapeHudActive === "function") {
      game.setLandscapeHudActive(false);
    }
    return;
  }

  const nowMs = performance.now();
  // Throttle DOM/layout work to avoid jank on Android/WebView.
  if (nowMs - hudLastUpdateMs < 120) return;
  hudLastUpdateMs = nowMs;

  if (nowMs - hudLastLayoutMs > 500) {
    const canvasRect = canvas.getBoundingClientRect();
    hudCachedSideSpace = Math.max(0, (wrapRect.width - canvasRect.width) / 2);
    hudLastLayoutMs = nowMs;
  }

  const sideSpace = hudCachedSideSpace;

  // Avoid overlapping the canvas on narrower landscape screens.
  const minSideSpace = activeMode === "vanillaClassic" ? 140 : 80;
  if (sideSpace < minSideSpace) {
    landscapeHud.hidden = true;
    if (game && typeof game.setLandscapeHudActive === "function") {
      game.setLandscapeHudActive(false);
    }
    return;
  }

  landscapeHud.hidden = false;
  if (game && typeof game.setLandscapeHudActive === "function") {
    game.setLandscapeHudActive(true);
  }
  if (!game || typeof game.getScoreState !== "function") return;

  const coop = typeof game.isCoopMode === "function" ? game.isCoopMode() : false;
  // Treat "Sirtet" like Marathon/Chillax for landscape HUD, but with a themed twist handled in CSS.
  const showRunStats = !coop && (activeMode === "marathon" || activeMode === "vanillaClassic" || activeMode === "chillax" || activeMode === "sirtet");
  const showGarbageHud = !coop && activeMode === "garbage";
  const showRedemptionHud = !coop && activeMode === "redemption";
  const showMirrorHud = !coop && !showRunStats && !showGarbageHud && !showRedemptionHud;

  document.body.dataset.hudMode = activeMode;

  const nextHudTight = viewportScale < 0.9 || window.innerHeight < 700;
  if (nextHudTight !== hudTightActive) {
    hudTightActive = nextHudTight;
    document.body.dataset.hudTight = hudTightActive ? "true" : "false";
  }

  if (landscapeHudRightCoop) landscapeHudRightCoop.hidden = !(coop || showMirrorHud);
  if (landscapeHudRightRun) landscapeHudRightRun.hidden = !showRunStats;
  if (landscapeHudRightRedemption) landscapeHudRightRedemption.hidden = !showRedemptionHud;
  if (landscapeHudRightGarbage) landscapeHudRightGarbage.hidden = !showGarbageHud;
  if (landscapeHudRightPanel) landscapeHudRightPanel.classList.toggle("is-boxed", showRunStats || showGarbageHud);

  if (landscapeHudRightTitle) {
    landscapeHudRightTitle.textContent = coop
      ? "PLAYER 2"
      : (showRunStats ? "RUN" : (showGarbageHud ? "GARBAGE" : ""));
  }
  if (landscapeHudLeftTitle) {
    landscapeHudLeftTitle.textContent = coop ? "PLAYER 1" : "";
  }

  const scoreState = game.getScoreState();
  const p1Score = Number(scoreState.score) || 0;
  const p1Level = Number(scoreState.level) || 0;
  const p1Lines = Number(scoreState.lines) || 0;
  const p2Score = Number(scoreState.p2Score) || 0;
  const p2Level = Number(scoreState.p2Level) || 0;
  const p2Lines = Number(scoreState.p2Lines) || 0;

  if (hudScore) hudScore.textContent = formatHudNumber(p1Score);
  if (hudLevel) hudLevel.textContent = String(p1Level);
  if (hudLines) hudLines.textContent = String(p1Lines);

  if (showRunStats && typeof game.getPieceStats === "function") {
    const stats = game.getPieceStats("p1");
    const counts = (stats && Array.isArray(stats.counts)) ? stats.counts : null;
    if (counts) {
      if (hudPieceI) hudPieceI.textContent = String(counts[1] || 0);
      if (hudPieceJ) hudPieceJ.textContent = String(counts[2] || 0);
      if (hudPieceL) hudPieceL.textContent = String(counts[3] || 0);
      if (hudPieceO) hudPieceO.textContent = String(counts[4] || 0);
      if (hudPieceS) hudPieceS.textContent = String(counts[5] || 0);
      if (hudPieceT) hudPieceT.textContent = String(counts[6] || 0);
      if (hudPieceZ) hudPieceZ.textContent = String(counts[7] || 0);
    }
    if (hudIDrought) hudIDrought.textContent = String((stats && Number.isFinite(stats.droughtI)) ? stats.droughtI : 0);
    if (hudPieceTotal) hudPieceTotal.textContent = String((stats && Number.isFinite(stats.total)) ? stats.total : 0);
  }

  if (showRedemptionHud) {
    if (typeof game.getLivesState === "function") {
      const livesState = game.getLivesState();
      const lives = livesState && Number.isFinite(livesState.lives) ? livesState.lives : 0;
      const maxLives = livesState && Number.isFinite(livesState.maxLives) ? livesState.maxLives : 0;
      if (hudRedemptionLives) hudRedemptionLives.textContent = String(lives);
      if (hudRedemptionMax) hudRedemptionMax.textContent = String(maxLives);
    } else {
      if (hudRedemptionLives) hudRedemptionLives.textContent = "--";
      if (hudRedemptionMax) hudRedemptionMax.textContent = "--";
    }
  }

  if (showGarbageHud) {
    if (hudGarbageSpeed) hudGarbageSpeed.textContent = String(activeGarbageSpeed);
    if (hudGarbageTime) hudGarbageTime.textContent = formatHudTime(scoreState.timeMs);
    if (hudGarbageHeight) hudGarbageHeight.textContent = String(activeGarbageHeight);
    if (typeof game.getGarbageProgress === "function") {
      const prog = game.getGarbageProgress();
      const remaining = prog && Number.isFinite(prog.remaining) ? prog.remaining : 0;
      const total = prog && Number.isFinite(prog.total) ? prog.total : 0;
      if (hudGarbageRemaining) hudGarbageRemaining.textContent = String(remaining) + "/" + String(total);
      if (hudGarbageProgressFill) {
        const pct = total > 0 ? Math.max(0, Math.min(1, 1 - (remaining / total))) : 0;
        hudGarbageProgressFill.style.width = String(Math.round(pct * 100)) + "%";
      }
    } else {
      if (hudGarbageRemaining) hudGarbageRemaining.textContent = "--";
      if (hudGarbageProgressFill) hudGarbageProgressFill.style.width = "0%";
    }
  }

  if (coop) {
    if (hudP2Score) hudP2Score.textContent = formatHudNumber(p2Score);
    if (hudP2Level) hudP2Level.textContent = String(p2Level);
    if (hudP2Lines) hudP2Lines.textContent = String(p2Lines);
  } else if (showMirrorHud) {
    if (hudP2Score) hudP2Score.textContent = formatHudNumber(p1Score);
    if (hudP2Level) hudP2Level.textContent = String(p1Level);
    if (hudP2Lines) hudP2Lines.textContent = String(p1Lines);
  }

  if (typeof game.getQueueState === "function") {
    const p1Queue = game.getQueueState("p1");
    const p2Queue = coop ? game.getQueueState("p2") : (showMirrorHud ? p1Queue : null);

    setMiniPieceIcon(hudHoldIcon, p1Queue ? p1Queue.holdType : null);
    const p1Next = (p1Queue && Array.isArray(p1Queue.nextQueue)) ? p1Queue.nextQueue : [];
    setMiniPieceIcon(hudNext0, p1Next[0]);
    setMiniPieceIcon(hudNext1, p1Next[1]);
    setMiniPieceIcon(hudNext2, p1Next[2]);
    setMiniPieceIcon(hudNext3, p1Next[3]);
    setMiniPieceIcon(hudNext4, p1Next[4]);

    if (coop || showMirrorHud) {
      setMiniPieceIcon(hudP2HoldIcon, p2Queue ? p2Queue.holdType : null);
      const p2Next = (p2Queue && Array.isArray(p2Queue.nextQueue)) ? p2Queue.nextQueue : [];
      setMiniPieceIcon(hudP2Next0, p2Next[0]);
      setMiniPieceIcon(hudP2Next1, p2Next[1]);
      setMiniPieceIcon(hudP2Next2, p2Next[2]);
      setMiniPieceIcon(hudP2Next3, p2Next[3]);
      setMiniPieceIcon(hudP2Next4, p2Next[4]);
    }
  }
  if (activeMode === "vanillaClassic" && typeof game.getMomentumState === "function") {
    updateHudMeter(hudMomentumFill, game.getMomentumState("p1"));
  }
}function pushDualScreenHud(nowMs) {
  if (!DualScreenHud) return;
  const mode = DUAL_SCREEN_MODES[dualScreenModeIndex].id;
  if (mode === "off") return;

  if (mode === "game" && game && !menuActive) {
    if (!window.DualScreenHudBridge) {
      // Bridge not yet registered — fall back to Capacitor plugin bridge for game mode
      if (nowMs - dualScreenHudLastPushMs < 16) return;
      dualScreenHudLastPushMs = nowMs;
      const state = game.getDualScreenBoardState();
      if (state) {
        try {
          const wrapRect = wrap.getBoundingClientRect();
          const viewportW = wrapRect.width;
          const viewportH = wrapRect.height;
          const displayCanvasHeight = canvas.height / 2;
          const scaledWidth = canvas.width * viewportScale;
          const offsetX = Math.max(0, (viewportW - scaledWidth) / 2);
          let offsetY = 2;
          if (activeMode === "vanillaClassic" && viewportW <= viewportH) {
            offsetY = Math.max(2, (viewportH - (displayCanvasHeight * viewportScale)) / 2);
          }
          const gridLeftCanvas = game.getGridLeft ? game.getGridLeft() : 28;
          const cellSizeVal = GAME_CONFIG.BLOCK_SIZE * viewportScale;
          const gridLeftVal = offsetX + gridLeftCanvas * viewportScale;
          const gridTopVal = offsetY;

          DualScreenHud.updateHud({
            displayMode: "game",
            board: {
              cols: 10,
              rows: 20,
              cells: state.cells
            },
            score: {
              score: state.score,
              level: state.level,
              lines: state.lines
            },
            modeLabel: activeMode,
            status: state.status,
            isFlipped: state.isFlipped,
            cellSize: cellSizeVal,
            gridLeft: gridLeftVal,
            gridTop: gridTopVal
          });
        } catch (err) {
          console.warn("Failed to push game frame via Capacitor:", err);
        }
      }
      return;
    }
    const state = game.getDualScreenBoardState();
    if (state) {
      const wrapRect = wrap.getBoundingClientRect();
      const viewportW = wrapRect.width;
      const viewportH = wrapRect.height;
      const displayCanvasHeight = canvas.height / 2;
      const scaledWidth = canvas.width * viewportScale;
      const offsetX = Math.max(0, (viewportW - scaledWidth) / 2);
      let offsetY = 2;
      if (activeMode === "vanillaClassic" && viewportW <= viewportH) {
        offsetY = Math.max(2, (viewportH - (displayCanvasHeight * viewportScale)) / 2);
      }
      const gridLeftCanvas = game.getGridLeft ? game.getGridLeft() : 28;
      const cellSizeVal = GAME_CONFIG.BLOCK_SIZE * viewportScale;
      const gridLeftVal = offsetX + gridLeftCanvas * viewportScale;
      const gridTopVal = offsetY;

      try {
        window.DualScreenHudBridge.pushFrame(
          state.cells,
          state.score,
          state.level,
          state.lines,
          state.status,
          state.isFlipped,
          cellSizeVal,
          gridLeftVal,
          gridTopVal
        );
      } catch (err) {
        console.warn("Failed to push game frame via JS bridge:", err);
      }
    }
  } else {
    if (nowMs - dualScreenHudLastPushMs < 120) return;
    dualScreenHudLastPushMs = nowMs;
    const payload = getMenuStatePayload();
    try {
      DualScreenHud.updateHud(payload);
    } catch (err) {
      console.warn("Failed to update HUD via Capacitor:", err);
    }
  }
}

function getMenuStatePayload() {
  if (menuActive) {
    const payload = {
      displayMode: "info",
      status: menuState.toUpperCase()
    };

    if (menuState === "splash") {
      payload.menu = {
        layout: "splash",
        title: "TETRIS FLIP",
        prompt: "PRESS TO START",
        author: "a fan game by Timetoady",
        tagline: "A DUAL-FIELD FLIPPING PUZZLE GAME",
        accentPieces: [6, 3, 5]
      };
    } else if (menuState === "options") {
      const optionItems = [
        optionsLayoutModeRow,
        optionsOrientationRow,
        optionsRotateRow,
        optionsMouseRow,
        optionsMusicRow,
        optionsMusicVolumeRow,
        optionsVfxVolumeRow,
        optionsHelpRow,
        optionsShowFpsRow,
        optionsFlipP2HudRow,
        optionsDualScreenHudRow,
        optionsBack
      ];
      const selectedRow = optionItems[optionsIndex];
      let label = "";
      let val = "";
      if (selectedRow) {
        if (selectedRow === optionsBack) {
          label = "BACK";
          val = "";
        } else {
          const span0 = selectedRow.querySelector("span:first-child");
          const span1 = selectedRow.querySelector("span:last-child");
          label = span0 ? (span0.querySelector(".menu-label-full")?.textContent || span0.textContent) : "";
          val = span1 ? span1.textContent : "";
        }
      }

      payload.menu = {
        layout: "options",
        title: "OPTIONS",
        selectedLabel: label,
        selectedValue: val,
        description: getOptionDescription(optionsIndex),
        hint: "Left/Right to change. X confirm, Z back"
      };

      if (optionsIndex === 2) {
        const layout = ROTATE_LAYOUTS[rotateLayoutIndex];
        let cw = "A";
        let ccw = "B";
        let badge = "SOUTH/EAST";
        if (layout.id === "southWest") {
          cw = "A";
          ccw = "X";
          badge = "SOUTH/WEST";
        } else if (layout.id === "sidewaysSouthEast") {
          cw = "A (South)";
          ccw = "B (East)";
          badge = "SIDEWAYS";
        } else if (layout.id === "sidewaysSouthWest") {
          cw = "A (South)";
          ccw = "X (West)";
          badge = "SIDEWAYS";
        }
        payload.menu.previewKind = "rotate";
        payload.menu.previewData = {
          name: layout.label,
          badge: badge,
          cw: cw,
          ccw: ccw,
          hint: "Tap options to see mappings"
        };
      }
    } else if (["marathon", "burst", "vanillaClassic", "chillax", "coop", "sirtet"].includes(menuState)) {
      let actionIndex = 0;
      let gravityVal = 1;
      if (menuState === "marathon") { actionIndex = marathonActionIndex; gravityVal = startingGravity; }
      else if (menuState === "burst") { actionIndex = burstActionIndex; gravityVal = startingGravity; }
      else if (menuState === "vanillaClassic") { actionIndex = vanillaClassicActionIndex; gravityVal = startingGravity; }
      else if (menuState === "chillax") { actionIndex = chillaxActionIndex; gravityVal = startingGravity; }
      else if (menuState === "coop") { actionIndex = coopActionIndex; gravityVal = startingGravity; }
      else if (menuState === "sirtet") { actionIndex = sirtetActionIndex; gravityVal = startingGravity; }

      payload.menu = {
        layout: "mode",
        title: menuState === "vanillaClassic" ? "VANILLA CLASSIC" : menuState.toUpperCase(),
        description: `Start a game with customized gravity settings.`,
        selected: actionIndex === 0 ? "START" : "BACK",
        detail: `Gravity: ${gravityVal}`,
        hint: "Arrows to choose. X confirm, Z back"
      };
    } else if (menuState === "garbage") {
      let actionLabel = "START";
      if (garbageActionIndex === 0) actionLabel = "SPEED";
      else if (garbageActionIndex === 1) actionLabel = "HEIGHT";
      else if (garbageActionIndex === 2) actionLabel = "START";
      else if (garbageActionIndex === 3) actionLabel = "BACK";

      payload.menu = {
        layout: "mode",
        title: "GARBAGE CHALLENGE",
        description: "Clear rising rows of garbage blocks as fast as possible.",
        selected: actionLabel,
        detail: `Speed: ${garbageSpeed} | Height: ${garbageHeight}`,
        hint: "Arrows to choose. X confirm, Z back"
      };
    } else if (menuState === "redemption") {
      let actionLabel = "START";
      if (redemptionActionIndex === 0) actionLabel = "GRAVITY";
      else if (redemptionActionIndex === 1) actionLabel = "LIVES";
      else if (redemptionActionIndex === 2) actionLabel = "START";
      else if (redemptionActionIndex === 3) actionLabel = "BACK";

      payload.menu = {
        layout: "mode",
        title: "REDEMPTION MODE",
        description: "Play with multiple lives. Restores board on top-out.",
        selected: actionLabel,
        detail: `Gravity: ${redemptionGravity} | Lives: ${redemptionLives}`,
        hint: "Arrows to choose. X confirm, Z back"
      };
    } else {
      payload.menu = {
        layout: "mode",
        title: menuState.toUpperCase(),
        description: "",
        instruction: "",
        hint: "Arrows to choose. X confirm, Z back"
      };
    }

    return payload;
  } else {
    if (!game) return { displayMode: "info", status: "IDLE" };
    const scoreState = game.getScoreState ? game.getScoreState() : { score: 0, level: 0, lines: 0, timeMs: 0 };
    const coop = typeof game.isCoopMode === "function" ? game.isCoopMode() : false;

    let p2Score = null;
    let p2Queue = null;
    if (coop) {
      p2Score = {
        score: scoreState.p2Score || 0,
        level: scoreState.p2Level || 0,
        lines: scoreState.p2Lines || 0
      };
      if (typeof game.getQueueState === "function") {
        p2Queue = game.getQueueState("p2");
      }
    }

    let garbage = null;
    if (activeMode === "garbage" && typeof game.getGarbageProgress === "function") {
      const prog = game.getGarbageProgress();
      garbage = {
        speed: activeGarbageSpeed,
        height: activeGarbageHeight,
        time: formatHudTime(scoreState.timeMs),
        remaining: prog ? prog.remaining : 0,
        total: prog ? prog.total : 0
      };
    }

    let redemption = null;
    if (activeMode === "redemption" && typeof game.getLivesState === "function") {
      const livesState = game.getLivesState();
      redemption = {
        lives: livesState ? livesState.lives : 0,
        maxLives: livesState ? livesState.maxLives : 0
      };
    }

    let runStats = null;
    const showRunStats = !coop && (activeMode === "marathon" || activeMode === "vanillaClassic" || activeMode === "chillax" || activeMode === "sirtet");
    if (showRunStats && typeof game.getPieceStats === "function") {
      const stats = game.getPieceStats("p1");
      runStats = {
        counts: stats ? stats.counts : null,
        droughtI: stats ? stats.droughtI : 0,
        total: stats ? stats.total : 0
      };
    }

    let momentum = null;
    if (activeMode === "vanillaClassic" && typeof game.getMomentumState === "function") {
      const mState = game.getMomentumState("p1");
      if (mState) {
        momentum = {
          value: mState.value,
          max: mState.max,
          burstTimer: mState.burstTimer
        };
      }
    }

    let status = "Playing";
    if (game.paused) {
      status = "Paused";
    } else if (gameOverActive) {
      status = "Game Over";
    }

    return {
      displayMode: "info",
      status: status,
      modeLabel: activeMode.charAt(0).toUpperCase() + activeMode.slice(1),
      score: {
        score: scoreState.score || 0,
        level: scoreState.level || 0,
        lines: scoreState.lines || 0,
        timeMs: scoreState.timeMs || 0
      },
      queue: typeof game.getQueueState === "function" ? game.getQueueState("p1") : null,
      p2Score: p2Score,
      p2Queue: p2Queue,
      garbage: garbage,
      redemption: redemption,
      runStats: runStats,
      momentum: momentum
    };
  }
}

function getOptionDescription(index) {
  switch (index) {
    case 0: return "Adjust the overall screen layout and scaling.";
    case 1: return "Toggle between portrait and landscape screen layout.";
    case 2: return "Choose rotation button mappings on gamepads/devices.";
    case 3: return "Configure mouse wheel behavior and click schemes.";
    case 4: return "Change the background music track.";
    case 5: return "Change the background music volume level.";
    case 6: return "Change the sound effects volume level.";
    case 7: return "Read the game controls and mechanics manual.";
    case 8: return "Show the real-time frames-per-second performance counter.";
    case 9: return "Display player 2 statistics on the primary screen layout.";
    case 10: return "Dual screen setting for AYN Thor-like displays.";
    default: return "";
  }
}

function positionTouchButtons() {
  if (!touchFlip || !touchPause) return;
  const rect = canvas.getBoundingClientRect();
  const rectScale = rect.width / canvas.width;
  const touchScale = Number.isFinite(rectScale) && rectScale > 0 ? rectScale : 1;
  touchFlip.style.setProperty("--touch-scale", touchScale.toFixed(3));
  touchPause.style.setProperty("--touch-scale", touchScale.toFixed(3));

  const isVanillaClassic = activeMode === "vanillaClassic";
  if (isVanillaClassic) {
    touchFlip.hidden = true;
    const pauseSize = 84 * rectScale;
    const pad = 12;
    touchPause.style.width = `${pauseSize}px`;
    touchPause.style.height = `${pauseSize}px`;
    touchPause.style.left = `${Math.round(rect.right - pauseSize - pad)}px`;
    touchPause.style.top = `${Math.round(rect.top + pad)}px`;
    return;
  }

  const holdBoxSize = 96 * rectScale;
  const holdBoxX = GAME_CONFIG.GRID_MARGIN * 2
    + GAME_CONFIG.COLS * GAME_CONFIG.BLOCK_SIZE
    + 12;
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

function consumeMenuUp(repeat = false) {
  if (repeat) return consumeMenuNavRepeat("up", ["ArrowUp", "KeyW"]);
  return input.consumePress("ArrowUp") || input.consumePress("KeyW");
}

function consumeMenuDown(repeat = false) {
  if (repeat) return consumeMenuNavRepeat("down", ["ArrowDown", "KeyS"]);
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
  if (exitConfirmActive) {
    resetMenuNavRepeat();
    const left = consumeMenuLeft();
    const right = consumeMenuRight();
    const up = consumeMenuUp();
    const down = consumeMenuDown();
    if (left || right || up || down) {
      exitConfirmIndex = exitConfirmIndex === 0 ? 1 : 0;
      updateExitConfirmSelection();
    } else if (consumeMenuConfirm()) {
      if (exitConfirmIndex === 0) {
        requestExitApp();
      } else {
        closeExitConfirm();
      }
    } else if (consumeMenuBack()) {
      requestExitApp();
    }
    return;
  }
  if (nameEntryActive) {
    resetMenuNavRepeat();
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
    resetMenuNavRepeat();
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

  if (!menuActive) {
    resetMenuNavRepeat();
    return;
  }

  if (menuState === "splash") {
    resetMenuNavRepeat();
    if (consumeMenuBack()) {
      openExitConfirm();
      return;
    }
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
    const up = consumeMenuUp(true);
    const down = consumeMenuDown(true);
    const left = consumeMenuLeft();
    const right = consumeMenuRight();
    if (up) {
      moveModeSelection("up");
    } else if (down) {
      moveModeSelection("down");
    } else if (left) {
      moveModeSelection("left");
    } else if (right) {
      moveModeSelection("right");
    } else if (confirm) {
      if (modeOptions[modeIndex].classList.contains("is-disabled")) return;
      const selected = modeOptions[modeIndex].dataset.mode;
      if (selected === "back") {
        backToSplash();
      } else if (selected === "options") {
        showScreen("options");
      } else if (selected === "marathon" || selected === "burst" || selected === "vanillaClassic" || selected === "chillax"
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
    if (consumeMenuUp(true)) {
      optionsIndex = (optionsIndex + OPTIONS_ITEM_COUNT - 1) % OPTIONS_ITEM_COUNT;
      updateOptionsSelection();
    } else if (consumeMenuDown(true)) {
      optionsIndex = (optionsIndex + 1) % OPTIONS_ITEM_COUNT;
      updateOptionsSelection();
    }
    const left = consumeMenuLeft();
    const right = consumeMenuRight();
    if (optionsIndex === 0) {
      if (left || right) {
        const delta = right ? 1 : -1;
        applyLayoutMode(layoutModeIndex + delta);
      } else if (confirm) {
        applyLayoutMode(layoutModeIndex + 1);
      }
    } else if (optionsIndex === 1) {
      if (left || right) {
        const delta = right ? 1 : -1;
        applyOrientationMode(orientationIndex + delta);
      } else if (confirm) {
        applyOrientationMode(orientationIndex + 1);
      }
    } else if (optionsIndex === 2) {
      if (left || right) {
        const delta = right ? 1 : -1;
        applyRotateLayout(rotateLayoutIndex + delta);
      } else if (confirm) {
        applyRotateLayout(rotateLayoutIndex + 1);
      }
    } else if (optionsIndex === 3) {
      if (left || right) {
        const delta = right ? 1 : -1;
        applyMouseScheme(mouseSchemeIndex + delta);
      } else if (confirm) {
        applyMouseScheme(mouseSchemeIndex + 1);
      }
    } else if (optionsIndex === 4) {
      if (left || right) {
        const delta = right ? 1 : -1;
        applyMusicTrack(musicTrackIndex + delta);
      } else if (confirm) {
        applyMusicTrack(musicTrackIndex + 1);
      }
    } else if (optionsIndex === 5) {
      if (left || right) {
        const delta = right ? 1 : -1;
        applyMusicVolume(musicVolumeIndex + delta);
      } else if (confirm) {
        applyMusicVolume(musicVolumeIndex + 1);
      }
    } else if (optionsIndex === 6) {
      if (left || right) {
        const delta = right ? 1 : -1;
        applyVfxVolume(vfxVolumeIndex + delta);
      } else if (confirm) {
        applyVfxVolume(vfxVolumeIndex + 1);
      }
    } else if (optionsIndex === 7 && confirm) {
      showScreen("help");
    } else if (optionsIndex === 8) {
      if ((left || right) || confirm) {
        applyShowFps(!showFps);
      }
    } else if (optionsIndex === 9) {
      if ((left || right) || confirm) {
        applyFlipP2Hud(!flipP2Hud);
      }
    } else if (optionsIndex === 10) {
      if (left || right) {
        const delta = right ? 1 : -1;
        applyDualScreenHud(dualScreenModeIndex + delta);
      } else if (confirm) {
        applyDualScreenHud(dualScreenModeIndex + 1);
      }
    } else if (optionsIndex === 11 && confirm) {
      showScreen("mode");
    }
    if (consumeMenuBack()) {
      showScreen("mode");
    }
    return;
  }

  if (menuState === "help") {
    if (consumeMenuConfirm() || consumeMenuBack()) {
      showScreen("options");
    }
    return;
  }

  if (menuState === "marathon") {
    const confirm = consumeMenuConfirm();
    if (consumeMenuUp(true)) {
      updateGravity(1);
    } else if (consumeMenuDown(true)) {
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

  if (menuState === "burst") {
    const confirm = consumeMenuConfirm();
    if (consumeMenuUp(true)) {
      updateGravity(1);
    } else if (consumeMenuDown(true)) {
      updateGravity(-1);
    } else if (consumeMenuLeft() || consumeMenuRight()) {
      burstActionIndex = burstActionIndex === 0 ? 1 : 0;
      updateBurstSelection();
    } else if (confirm) {
      if (burstActionIndex === 0) {
        startGame();
      } else {
        showScreen("mode");
      }
    } else if (consumeMenuBack()) {
      showScreen("mode");
    }
  }

  if (menuState === "vanillaClassic") {
    const confirm = consumeMenuConfirm();
    if (consumeMenuUp(true)) {
      updateGravity(1);
    } else if (consumeMenuDown(true)) {
      updateGravity(-1);
    } else if (consumeMenuLeft() || consumeMenuRight()) {
      vanillaClassicActionIndex = vanillaClassicActionIndex === 0 ? 1 : 0;
      updateVanillaClassicSelection();
    } else if (confirm) {
      if (vanillaClassicActionIndex === 0) {
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
    if (consumeMenuUp(true)) {
      updateGravity(1);
    } else if (consumeMenuDown(true)) {
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
    if (consumeMenuUp(true)) {
      redemptionActionIndex = (redemptionActionIndex + 3) % 4;
      updateRedemptionSelection();
    } else if (consumeMenuDown(true)) {
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
    if (consumeMenuUp(true)) {
      garbageActionIndex = (garbageActionIndex + 3) % 4;
      updateGarbageSelection();
    } else if (consumeMenuDown(true)) {
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
    if (consumeMenuUp(true)) {
      updateGravity(1);
    } else if (consumeMenuDown(true)) {
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
    if (consumeMenuUp(true)) {
      updateGravity(1);
    } else if (consumeMenuDown(true)) {
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
  if (showFps && fpsCounter) {
    fpsFrames += 1;
    fpsAccumMs += delta;
    if (fpsAccumMs >= 500) {
      const fps = fpsFrames * 1000 / fpsAccumMs;
      fpsCounter.textContent = `FPS ${Math.round(fps)}`;
      fpsFrames = 0;
      fpsAccumMs = 0;
    }
  }
    input.update(delta);
  }
  handleMenuInput();
  const menuVisible = menu && !menu.hidden;
  // Touch buttons sit above the menu (higher z-index); hide them while any menu is open.
  const hideTouchButtons = menuVisible || !touchEnabled;
  if (touchFlip) touchFlip.hidden = hideTouchButtons;
  if (touchPause) touchPause.hidden = hideTouchButtons;
  setGameplayDataset();
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
  syncDualScreenClip();
  updateLandscapeHud();
  pushDualScreenHud(now);
  updateMusicState(now);
  if (game.getPauseCursor) {
    canvas.style.cursor = game.getPauseCursor() || "";
  }
  updateHudDebugBadge();
  positionTouchButtons();
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);





































