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
  southEast: { rotateCW: 0, rotateCCW: 1, hold: 2, flip: 3 }, // A/B rotate, X hold, Y flip
  southWest: { rotateCW: 0, rotateCCW: 2, hold: 1, flip: 3 } // A/X rotate, B hold, Y flip
};

export function createInput(target = window, pointerTarget = window) {
  const keyboardDown = new Set();
  const virtualDown = new Set();
  const pressed = new Set();
  const virtualState = new Map();
  let rotateLayout = "southEast";
  let mouseScheme = "classic";

  function isEditableTarget(targetEl) {
    if (!targetEl || !(targetEl instanceof HTMLElement)) return false;
    const tag = targetEl.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA") return true;
    return targetEl.isContentEditable;
  }

  function onKeyDown(e) {
    if (!DEFAULT_KEYS.has(e.code)) return;
    if (e.code === "Backspace" && isEditableTarget(e.target)) return;
    e.preventDefault();
    if (!keyboardDown.has(e.code)) pressed.add(e.code);
    keyboardDown.add(e.code);
  }

  function onKeyUp(e) {
    if (!DEFAULT_KEYS.has(e.code)) return;
    if (e.code === "Backspace" && isEditableTarget(e.target)) return;
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
      { index: layout.hold, code: "KeyC" },
      { index: layout.flip, code: "Space" }
    ];
    if (!pad) {
      mapping.forEach(({ code }) => setVirtual(code, false));
      return;
    }

    const nextState = new Map();
    mapping.forEach(({ index, code }) => {
      const button = pad.buttons[index];
      const pressedNow = Boolean(button && button.pressed);
      if (!nextState.has(code)) {
        nextState.set(code, pressedNow);
      } else if (pressedNow) {
        nextState.set(code, true);
      }
    });
    nextState.forEach((pressedNow, code) => {
      setVirtual(code, pressedNow);
    });
  }

  const pointerState = new Map();
  let multiStart = null;
  let longPressTimer = null;
  const swipeThreshold = 24;
  const longPressMs = 380;
  const holdCodes = ["ArrowLeft", "ArrowRight", "ArrowDown"];
  const mouseDragThreshold = 8;
  const mouseDragStep = 24;
  const mouseState = {
    active: false,
    dragging: false,
    mode: null,
    button: -1,
    startX: 0,
    startY: 0
    ,
    lastX: 0,
    lastY: 0,
    accumX: 0,
    accumY: 0
  };

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
      mouseState.active = true;
      mouseState.dragging = false;
      mouseState.mode = null;
      mouseState.button = e.button;
      mouseState.startX = e.clientX;
      mouseState.startY = e.clientY;
      mouseState.lastX = e.clientX;
      mouseState.lastY = e.clientY;
      mouseState.accumX = 0;
      mouseState.accumY = 0;
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
    if (e.pointerType === "mouse") {
      if (!mouseState.active) return;
      const dxTotal = e.clientX - mouseState.startX;
      const dyTotal = e.clientY - mouseState.startY;
      const dx = e.clientX - mouseState.lastX;
      const dy = e.clientY - mouseState.lastY;
      mouseState.lastX = e.clientX;
      mouseState.lastY = e.clientY;
      if (!mouseState.dragging) {
        if (Math.abs(dxTotal) < mouseDragThreshold &&
            Math.abs(dyTotal) < mouseDragThreshold) {
          return;
        }
        mouseState.dragging = true;
        mouseState.mode = Math.abs(dxTotal) >= Math.abs(dyTotal)
          ? "horizontal"
          : "vertical";
      }
      if (mouseState.mode === "horizontal") {
        setVirtual("ArrowDown", false);
        mouseState.accumX += dx;
        while (Math.abs(mouseState.accumX) >= mouseDragStep) {
          if (mouseState.accumX > 0) {
            pressVirtual("ArrowRight");
            mouseState.accumX -= mouseDragStep;
          } else {
            pressVirtual("ArrowLeft");
            mouseState.accumX += mouseDragStep;
          }
        }
      } else if (mouseState.mode === "vertical") {
        mouseState.accumY += dy;
        const shouldDrop = dyTotal > mouseDragStep;
        setVirtual("ArrowDown", shouldDrop);
      }
      return;
    }
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
    if (e.pointerType === "mouse") {
      if (mouseState.dragging) {
        setVirtual("ArrowDown", false);
      } else if (mouseState.active) {
        if (mouseState.button === 0) {
          pressVirtual("KeyX");
        }
        if (mouseState.button === 2) {
          if (mouseScheme === "alternate") {
            pressVirtual("ArrowUp");
          } else {
            pressVirtual("KeyZ");
          }
        }
        if (mouseState.button === 1) pressVirtual("Space");
      }
      mouseState.active = false;
      mouseState.dragging = false;
      mouseState.mode = null;
      mouseState.button = -1;
      return;
    }
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
    if (mouseScheme === "alternate") {
      if (e.deltaY > 0) {
        pressVirtual("KeyZ");
      } else if (e.deltaY < 0) {
        pressVirtual("KeyX");
      }
      return;
    }
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
    pressVirtual,
    setMouseScheme(scheme) {
      if (scheme === "classic" || scheme === "alternate") {
        mouseScheme = scheme;
      }
    },
    setGamepadRotateLayout(layout) {
      if (ROTATE_LAYOUTS[layout]) {
        rotateLayout = layout;
      }
    }
  };
}
