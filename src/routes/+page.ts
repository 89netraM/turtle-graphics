import type { TurtleAction } from "$lib/turtle-graphics";

export function load() {
  const actions: ReadonlyArray<TurtleAction> = [
    { action: "pen-down", color: "#bada55" },
    { action: "forward", distance: 50 },
    { action: "rotate", angle: Math.PI / 2 },
    { action: "forward", distance: 25 },
    { action: "rotate", angle: Math.PI / 8 },
    { action: "forward", distance: -500 },
    { action: "rotate", angle: -Math.PI / 2 },
    { action: "forward", distance: 25 },
  ];
  return {
    actions,
  };
}
