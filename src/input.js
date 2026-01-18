const DEFAULT_KEYS = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowDown",
  "ArrowUp",
  "KeyZ",
  "KeyX",
  "KeyC",
  "KeyP",
  "Space",
  "Escape",
  "Enter",
  "Backspace",
  "ShiftLeft",
  "ShiftRight"
]);

const GAMEPAD_BASE = [
  { index: 12, code: "ArrowUp" },
  { index: 13, code: "ArrowDown" },
  { index: 14, code: "ArrowLeft" },
  { index: 15, code: "ArrowRight" },
  { index: 5, code: "Space" }, // R1 / RB (Flip)
  { index: 9, code: "KeyP" }, // Start (Pause)
  { index: 8, code: "Backspace" } // Back (Menu Back)
];

const ROTATE_LAYOUTS = {
  southEast: { rotateCW: 0, rotateCCW: 1, hold: 2 }, // A/B rotate, X hold
  southWest: { rotateCW: 0, rotateCCW: 2, hold: 1 } // A/X rotate, B hold
};

export function createInput(target = window, pointerTarget = window) {
  const keyboardDown = new Set();
  const virtualDown = new Set();
  const pressed = new Set();
  const virtualState = new Map();
  let rotateLayout = "southEast";

  function onKeyDown(e) {
    if (!DEFAULT_KEYS.has(e.code)) return;
    e.preventDefault();
    if (!keyboardDown.has(e.code)) pressed.add(e.code);
    keyboardDown.add(e.code);
  }

  function onKeyUp(e) {
    if (!DEFAULT_KEYS.has(e.code)) return;
    e.preventDefault();
    keyboardDown.delete(e.code);
    pressed.delete(e.code);
  }

  function setVirtual(code, isDown) {
    const wasDown = virtualState.get(code) || false;
    if (isDown && !wasDown) pressed.add(code);
    if (isDown) {
      virtualDown.add(code);
    } else {
      virtualDown.delete(code);
    }
    virtualState.set(code, isDown);
  }

  function pressVirtual(code) {
    pressed.add(code);
  }

  function clearVirtualGroup(codes) {
    codes.forEach((code) => setVirtual(code, false));
  }

  function pollGamepad() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const pad = pads && pads.find((item) => item && item.connected);
    const layout = ROTATE_LAYOUTS[rotateLayout] || ROTATE_LAYOUTS.southEast;
    const mapping = [
      ...GAMEPAD_BASE,
      { index: layout.rotateCW, code: "KeyX" },
      { index: layout.rotateCCW, code: "KeyZ" },
      { index: layout.hold, code: "KeyC" }
    ];
    if (!pad) {
      mapping.forEach(({ code }) => setVirtual(code, false));
      return;
    }

    mapping.forEach(({ index, code }) => {
      const button = pad.buttons[index];
      setVirtual(code, Boolean(button && button.pressed));
    });
  }

  const pointerState = new Map();
  let multiStart = null;
  let longPressTimer = null;
  const swipeThreshold = 24;
  const longPressMs = 380;
  const holdCodes = ["ArrowLeft", "ArrowRight", "ArrowDown"];

  function clearLongPress() {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  }

  function handleSinglePointerStart(state) {
    clearLongPress();
    longPressTimer = setTimeout(() => {
      if (pointerState.size === 1 && !state.mode) {
        pressVirtual("KeyC");
      }
    }, longPressMs);
  }

  function onPointerDown(e) {
    if (e.pointerType === "mouse") {
      if (e.button === 0) pressVirtual("KeyX");
      if (e.button === 2) pressVirtual("KeyZ");
      return;
    }

    pointerTarget.setPointerCapture(e.pointerId);
    const state = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
      mode: null,
      holdCode: null
    };
    pointerState.set(e.pointerId, state);

    if (pointerState.size === 1) {
      handleSinglePointerStart(state);
    } else if (pointerState.size === 2) {
      clearLongPress();
      clearVirtualGroup(holdCodes);
      const points = Array.from(pointerState.values());
      const avgX = (points[0].startX + points[1].startX) / 2;
      const avgY = (points[0].startY + points[1].startY) / 2;
      multiStart = { x: avgX, y: avgY };
    }
  }

  function applyTouchMode(state, dx, dy) {
    if (Math.abs(dx) < swipeThreshold && Math.abs(dy) < swipeThreshold) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      state.mode = dx > 0 ? "right" : "left";
      state.holdCode = dx > 0 ? "ArrowRight" : "ArrowLeft";
      setVirtual(state.holdCode, true);
    } else {
      state.mode = dy > 0 ? "down" : "up";
      if (dy > 0) {
        state.holdCode = "ArrowDown";
        setVirtual("ArrowDown", true);
      } else {
        pressVirtual("ArrowUp");
      }
    }
    clearLongPress();
  }

  function onPointerMove(e) {
    if (e.pointerType !== "touch") return;
    const state = pointerState.get(e.pointerId);
    if (!state) return;
    state.lastX = e.clientX;
    state.lastY = e.clientY;

    if (pointerState.size === 1) {
      const dx = e.clientX - state.startX;
      const dy = e.clientY - state.startY;
      if (!state.mode) applyTouchMode(state, dx, dy);
    } else if (pointerState.size === 2) {
      // Two-finger gestures handled on release.
    }
  }

  function onPointerUp(e) {
    if (e.pointerType === "mouse") return;
    const state = pointerState.get(e.pointerId);
    if (!state) return;
    state.lastX = e.clientX;
    state.lastY = e.clientY;

    if (pointerState.size === 1) {
      if (!state.mode) {
        pressVirtual("KeyX");
      }
      if (state.holdCode) {
        setVirtual(state.holdCode, false);
      }
      clearLongPress();
    }

    if (multiStart && pointerState.size === 2) {
      const points = Array.from(pointerState.values());
      const endX = (points[0].lastX + points[1].lastX) / 2;
      const endY = (points[0].lastY + points[1].lastY) / 2;
      const dx = endX - multiStart.x;
      const dy = endY - multiStart.y;
      if (Math.abs(dy) > swipeThreshold) {
        pressVirtual("Space");
      } else {
        pressVirtual("KeyZ");
      }
      multiStart = null;
    }

    pointerState.delete(e.pointerId);
  }

  function onPointerCancel(e) {
    if (e.pointerType !== "touch") return;
    const state = pointerState.get(e.pointerId);
    if (state && state.holdCode) {
      setVirtual(state.holdCode, false);
    }
    pointerState.delete(e.pointerId);
    if (pointerState.size === 0) {
      clearLongPress();
      multiStart = null;
    }
  }

  function onWheel(e) {
    if (e.deltaY > 0) {
      pressVirtual("ArrowDown");
    } else if (e.deltaY < 0) {
      pressVirtual("ArrowUp");
    }
  }

  target.addEventListener("keydown", onKeyDown);
  target.addEventListener("keyup", onKeyUp);
  pointerTarget.addEventListener("pointerdown", onPointerDown);
  pointerTarget.addEventListener("pointermove", onPointerMove);
  pointerTarget.addEventListener("pointerup", onPointerUp);
  pointerTarget.addEventListener("pointercancel", onPointerCancel);
  pointerTarget.addEventListener("wheel", onWheel, { passive: true });
  pointerTarget.addEventListener("contextmenu", (e) => e.preventDefault());

  return {
    isDown(code) {
      return keyboardDown.has(code) || virtualDown.has(code);
    },
    hasAnyActivity() {
      return pressed.size > 0 || keyboardDown.size > 0 || virtualDown.size > 0;
    },
    consumePress(code) {
      if (!pressed.has(code)) return false;
      pressed.delete(code);
      return true;
    },
    clearPressed() {
      pressed.clear();
    },
    update() {
      pollGamepad();
    },
    setGamepadRotateLayout(layout) {
      if (ROTATE_LAYOUTS[layout]) {
        rotateLayout = layout;
      }
    }
  };
}
