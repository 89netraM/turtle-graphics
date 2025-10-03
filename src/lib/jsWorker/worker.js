/** @type {Array<import("$lib/turtle-graphics").TurtleAction>} */
var actions = [];

/** @param {string} color */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function penDown(color) {
  actions.push({ action: "pen-down", color });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function penUp() {
  actions.push({ action: "pen-up" });
}

/** @param {number} distance */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function forward(distance) {
  actions.push({ action: "forward", distance });
}

/** @param {number} angle */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function rotate(angle) {
  actions.push({ action: "rotate", angle });
}

self.addEventListener("message", async () => {
  try {
    // @ts-ignore: `render` is declared dynamically at runtime
    await render();
    self.postMessage({ result: actions });
  } catch {
    self.postMessage({ error: true });
  }
});
