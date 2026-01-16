const DEFAULT_KEYS = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowDown",
  "ArrowUp",
  "KeyZ",
  "KeyX",
  "KeyP",
  "Space",
  "Escape",
  "ShiftLeft",
  "ShiftRight"
]);

export function createInput(target = window) {
  const down = new Set();
  const pressed = new Set();

  function onKeyDown(e) {
    if (!DEFAULT_KEYS.has(e.code)) return;
    e.preventDefault();
    if (!down.has(e.code)) pressed.add(e.code);
    down.add(e.code);
  }

  function onKeyUp(e) {
    if (!DEFAULT_KEYS.has(e.code)) return;
    e.preventDefault();
    down.delete(e.code);
  }

  target.addEventListener("keydown", onKeyDown);
  target.addEventListener("keyup", onKeyUp);

  return {
    isDown(code) {
      return down.has(code);
    },
    hasAnyPress() {
      return pressed.size > 0;
    },
    consumePress(code) {
      if (!pressed.has(code)) return false;
      pressed.delete(code);
      return true;
    },
    clearPressed() {
      pressed.clear();
    }
  };
}
