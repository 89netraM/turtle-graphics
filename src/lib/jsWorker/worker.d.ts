/**
 * Lifts the pen so that following movements leave no trace.
 */
declare function penUp(): void;

/**
 * Puts the pen down so that following movements leave a `color` trace.
 * @param color A CSS {@linkcode https://developer.mozilla.org/en-US/docs/Web/CSS/color_value | <color>} value.
 */
declare function penDown(color: string): void;

/**
 * Moves the turtle `distance` units forward, or backwards in case of a negative number.
 * @param distance The number of units to move.
 */
declare function forward(distance: number): void;

/**
 * Rotates the turtle `angle` radians without moving.
 * @param angle The rotation angle, clockwise in radians.
 */
declare function rotate(angle: number): void;
