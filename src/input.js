const DEFAULT_KEYS = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowDown",
  "ArrowUp",
  "KeyZ",
  "KeyX",
  "KeyC",
  "KeyA",
  "KeyS",
  "KeyD",
  "KeyW",
  "KeyJ",
  "KeyK",
  "KeyL",
  "KeyP",
  "Space",
  "Escape",
  "Enter",
  "Backspace",
  "ShiftLeft",
  "ShiftRight"
]);

const GAMEPAD_DPAD_STANDARD = [
  { index: 12, code: "ArrowUp" },
  { index: 13, code: "ArrowDown" },
  { index: 14, code: "ArrowLeft" },
  { index: 15, code: "ArrowRight" }
];

const GAMEPAD_DPAD_SIDEWAYS = [
  { index: 12, code: "ArrowRight" },
  { index: 13, code: "ArrowLeft" },
  { index: 14, code: "ArrowUp" },
  { index: 15, code: "ArrowDown" }
];

const GAMEPAD_COMMON = [
  { index: 5, code: "Space" }, // R1 / RB (Flip)
  { index: 9, code: "KeyP" }, // Start (Pause)
  { index: 8, code: "Backspace" } // Back (Menu Back)
];

const GAMEPAD_P2_BASE = [
  { index: 12, code: "KeyW" },
  { index: 13, code: "KeyS" },
  { index: 14, code: "KeyA" },
  { index: 15, code: "KeyD" }
];

const ROTATE_LAYOUTS = {
  southEast: {
    rotateCW: 0,
    rotateCCW: 1,
    hold: 2,
    flip: 3,
    dpad: GAMEPAD_DPAD_STANDARD,
    rightStick: false
  }, // A/B rotate, X hold, Y flip
  southWest: {
    rotateCW: 0,
    rotateCCW: 2,
    hold: 1,
    flip: 3,
    dpad: GAMEPAD_DPAD_STANDARD,
    rightStick: false
  }, // A/X rotate, B hold, Y flip
  sidewaysSouthEast: {
    rotateCW: 0,
    rotateCCW: 1,
    hold: 2,
    flip: 3,
    dpad: GAMEPAD_DPAD_SIDEWAYS,
    rightStick: true
  }, // Sideways A/B rotate, X hold, Y flip
  sidewaysSouthWest: {
    rotateCW: 0,
    rotateCCW: 2,
    hold: 1,
    flip: 3,
    dpad: GAMEPAD_DPAD_SIDEWAYS,
    rightStick: true
  } // Sideways A/X rotate, B hold, Y flip
};

const RIGHT_STICK_AXIS_X = 2;
const RIGHT_STICK_AXIS_Y = 3;
const RIGHT_STICK_DEADZONE = 0.4;

export function createInput(target = window, pointerTarget = window) {
  const keyboardDown = new Set();
  const gamepadDown = new Set();
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
    if (isEditableTarget(e.target)) return;
    e.preventDefault();
    if (!keyboardDown.has(e.code)) pressed.add(e.code);
    keyboardDown.add(e.code);
  }

  function onKeyUp(e) {
    if (!DEFAULT_KEYS.has(e.code)) return;
    if (isEditableTarget(e.target)) return;
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

  function setGamepad(code, isDown) {
    const wasDown = gamepadDown.has(code);
    if (isDown && !wasDown) pressed.add(code);
    if (isDown) {
      gamepadDown.add(code);
    } else {
      gamepadDown.delete(code);
    }
  }

  function pressVirtual(code) {
    pressed.add(code);
  }

  function clearVirtualGroup(codes) {
    codes.forEach((code) => setVirtual(code, false));
  }

  function addButtonMappings(nextState, pad, mapping) {
    mapping.forEach(({ index, code }) => {
      const button = pad && pad.buttons ? pad.buttons[index] : null;
      const pressedNow = Boolean(button && button.pressed);
      if (!nextState.has(code)) {
        nextState.set(code, pressedNow);
      } else if (pressedNow) {
        nextState.set(code, true);
      }
    });
  }

  function isDpadActive(pad, mapping) {
    if (!pad || !pad.buttons) return false;
    return mapping.some(({ index }) => {
      const button = pad.buttons[index];
      return button && button.pressed;
    });
  }

  function getAxisValue(pad, index) {
    if (!pad || !pad.axes || pad.axes.length <= index) return 0;
    const value = pad.axes[index];
    return Number.isFinite(value) ? value : 0;
  }

  function getSidewaysStickCode(pad) {
    const x = getAxisValue(pad, RIGHT_STICK_AXIS_X);
    const y = getAxisValue(pad, RIGHT_STICK_AXIS_Y);
    const absX = Math.abs(x);
    const absY = Math.abs(y);
    if (absX < RIGHT_STICK_DEADZONE && absY < RIGHT_STICK_DEADZONE) return null;
    if (absX > absY) {
      if (x < -RIGHT_STICK_DEADZONE) return "ArrowUp";
      if (x > RIGHT_STICK_DEADZONE) return "ArrowDown";
    } else {
      if (y < -RIGHT_STICK_DEADZONE) return "ArrowRight";
      if (y > RIGHT_STICK_DEADZONE) return "ArrowLeft";
    }
    return null;
  }

  function pollGamepad() {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    const connected = pads
      ? Array.from(pads).filter((item) => item && item.connected)
      : [];
    const pad = connected[0];
    const pad2 = connected[1];
    const layout = ROTATE_LAYOUTS[rotateLayout] || ROTATE_LAYOUTS.southEast;
    const nextState = new Map();
    const p1Mapping = [
      ...layout.dpad,
      ...GAMEPAD_COMMON,
      { index: layout.rotateCW, code: "KeyX" },
      { index: layout.rotateCCW, code: "KeyZ" },
      { index: layout.hold, code: "KeyC" },
      { index: layout.flip, code: "Space" }
    ];
    const p2Mapping = [
      ...GAMEPAD_P2_BASE,
      ...GAMEPAD_COMMON,
      { index: layout.rotateCW, code: "KeyK" },
      { index: layout.rotateCCW, code: "KeyJ" },
      { index: layout.hold, code: "KeyL" },
      { index: layout.flip, code: "Space" }
    ];
    addButtonMappings(nextState, pad, p1Mapping);
    addButtonMappings(nextState, pad2, p2Mapping);
    if (layout.rightStick && pad && !isDpadActive(pad, layout.dpad)) {
      const stickCode = getSidewaysStickCode(pad);
      if (stickCode) {
        nextState.set(stickCode, true);
      }
    }
    nextState.forEach((pressedNow, code) => setGamepad(code, pressedNow));
  }

  const pointerState = new Map();
  let multiStart = null;
  let longPressTimer = null;
  const swipeThreshold = 16;
  const longPressMs = 380;
  const holdCodes = ["ArrowLeft", "ArrowRight", "ArrowDown"];
  const mouseDragThreshold = 8;
  const mouseDragStep = 24;
  const touchTrackpadStep = 18;
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
    accumY: 0,
    lastPointerDownAt: 0,
    lastPointerUpAt: 0,
    lastRightDownAt: 0,
    rightDown: false,
    leftDown: false,
    lastHoldAt: 0,
    lastWheelUpAt: 0,
    softDropWheelTimer: null,
    lastWheelDownAt: 0
  };
  const hardDropWindowMs = 320;

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

  function handleMouseDown(e) {
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
      if (e.button === 0) {
        mouseState.leftDown = true;
      }
      if (e.button === 2) {
        mouseState.rightDown = true;
      }
      if (e.button === 2 && mouseScheme === "alternate") {
        const now = Date.now();
        if (mouseState.lastRightDownAt &&
            now - mouseState.lastRightDownAt <= hardDropWindowMs) {
          pressVirtual("ArrowUp");
          mouseState.lastRightDownAt = 0;
        } else {
          mouseState.lastRightDownAt = now;
          setVirtual("ArrowDown", true);
        }
      }
      if (mouseScheme === "alternate" &&
          mouseState.rightDown &&
          mouseState.leftDown) {
        const now = Date.now();
        if (!mouseState.lastHoldAt || now - mouseState.lastHoldAt > 150) {
          pressVirtual("KeyC");
          mouseState.lastHoldAt = now;
        }
      }
  }

  function onPointerDown(e) {
    if (e.pointerType === "mouse") {
      if (e.button === 2) e.preventDefault();
      mouseState.lastPointerDownAt = Date.now();
      handleMouseDown(e);
      return;
    }

    if (pointerTarget instanceof Element && pointerTarget.setPointerCapture) {
      pointerTarget.setPointerCapture(e.pointerId);
    }
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
      state.mode = "trackpad";
      state.holdCode = null;
      state.accumX = 0;
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
        if (mouseScheme === "tetris") {
          mouseState.mode = Math.abs(dxTotal) >= Math.abs(dyTotal)
            ? "horizontal"
            : "vertical";
        } else {
          mouseState.mode = "horizontal";
        }
      }
      if (mouseScheme === "tetris" && mouseState.mode === "vertical") {
        setVirtual("ArrowDown", dyTotal > mouseDragThreshold);
        return;
      }
      if (mouseState.mode === "horizontal") {
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
      }
      return;
    }
    if (e.pointerType !== "touch") return;
    const state = pointerState.get(e.pointerId);
    if (!state) return;
    const prevX = state.lastX;
    const prevY = state.lastY;
    state.lastX = e.clientX;
    state.lastY = e.clientY;

    if (pointerState.size === 1) {
      const dx = e.clientX - state.startX;
      const dy = e.clientY - state.startY;
      if (!state.mode) applyTouchMode(state, dx, dy);
      if (state.mode === "trackpad") {
        const deltaX = e.clientX - prevX;
        state.accumX = (state.accumX || 0) + deltaX;
        while (Math.abs(state.accumX) >= touchTrackpadStep) {
          if (state.accumX > 0) {
            pressVirtual("ArrowRight");
            state.accumX -= touchTrackpadStep;
          } else {
            pressVirtual("ArrowLeft");
            state.accumX += touchTrackpadStep;
          }
        }
      }
    } else if (pointerState.size === 2) {
      // Two-finger gestures handled on release.
    }
  }

  function handleMouseUp(e) {
      if (e.button === 0) {
        mouseState.leftDown = false;
      }
      if (e.button === 2) {
        mouseState.rightDown = false;
      }
      if (mouseState.dragging) {
        if (mouseState.mode === "vertical") {
          setVirtual("ArrowDown", false);
        }
      } else if (mouseState.active) {
        if (mouseState.button === 0) {
          if (mouseScheme === "classic" || mouseScheme === "tetris") {
            pressVirtual("KeyX");
          }
        }
        if (mouseState.button === 2) {
          if (mouseScheme === "alternate") {
            setVirtual("ArrowDown", false);
          } else if (mouseScheme === "classic" || mouseScheme === "tetris") {
            pressVirtual("KeyZ");
          }
        }
        if (mouseState.button === 1) {
          if (mouseScheme === "tetris") {
            pressVirtual("ArrowUp");
          } else {
            pressVirtual("Space");
          }
        }
      }
      mouseState.active = false;
      mouseState.dragging = false;
      mouseState.mode = null;
      mouseState.button = -1;
  }

  function onPointerUp(e) {
    if (e.pointerType === "mouse") {
      mouseState.lastPointerUpAt = Date.now();
      handleMouseUp(e);
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
    if (mouseScheme === "tetris") {
      const now = Date.now();
      if (e.deltaY < 0) {
        pressVirtual("KeyX");
      } else if (e.deltaY > 0) {
        if (mouseState.lastWheelDownAt &&
            now - mouseState.lastWheelDownAt <= hardDropWindowMs) {
          pressVirtual("ArrowUp");
          mouseState.lastWheelDownAt = 0;
        } else {
          mouseState.lastWheelDownAt = now;
          pressVirtual("KeyZ");
        }
      }
      return;
    }
    if (e.deltaY > 0) {
      if (mouseState.softDropWheelTimer) {
        clearTimeout(mouseState.softDropWheelTimer);
      }
      setVirtual("ArrowDown", true);
      mouseState.softDropWheelTimer = setTimeout(() => {
        setVirtual("ArrowDown", false);
        mouseState.softDropWheelTimer = null;
      }, 80);
    } else if (e.deltaY < 0) {
      const now = Date.now();
      if (now - mouseState.lastWheelUpAt > 220) {
        pressVirtual("ArrowUp");
        mouseState.lastWheelUpAt = now;
      }
    }
  }

  target.addEventListener("keydown", onKeyDown);
  target.addEventListener("keyup", onKeyUp);
  pointerTarget.addEventListener("pointerdown", onPointerDown);
  pointerTarget.addEventListener("pointermove", onPointerMove);
  pointerTarget.addEventListener("pointerup", onPointerUp);
  pointerTarget.addEventListener("pointercancel", onPointerCancel);
  pointerTarget.addEventListener("mousedown", (e) => {
    if (e.button !== 0 && e.button !== 2) return;
    if (e.button === 2) e.preventDefault();
    if (Date.now() - mouseState.lastPointerDownAt < 32) return;
    handleMouseDown(e);
  });
  pointerTarget.addEventListener("mouseup", (e) => {
    if (e.button !== 0 && e.button !== 2) return;
    if (Date.now() - mouseState.lastPointerUpAt < 32) return;
    handleMouseUp(e);
  });
  pointerTarget.addEventListener("wheel", onWheel, { passive: true });
  pointerTarget.addEventListener("contextmenu", (e) => e.preventDefault());

  return {
    isDown(code) {
      return keyboardDown.has(code) || virtualDown.has(code) || gamepadDown.has(code);
    },
    hasAnyActivity() {
      return pressed.size > 0
        || keyboardDown.size > 0
        || virtualDown.size > 0
        || gamepadDown.size > 0;
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
      if (mouseScheme === "alternate" && mouseState.rightDown) {
        setVirtual("ArrowDown", true);
      }
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
