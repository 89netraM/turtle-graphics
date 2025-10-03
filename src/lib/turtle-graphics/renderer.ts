import type { TurtleAction } from "./TurtleAction";
import type { TurtleConfig } from "./TurtleConfig";

export function render(
  config: TurtleConfig,
  ctx: CanvasRenderingContext2D,
  actions: ReadonlyArray<TurtleAction>,
  distance: number,
) {
  const scale = config.scale ?? 1;

  ctx.reset();

  const turtle = new Turtle(new Vector(config.width / 2, 0), new Vector(config.width, config.height));
  const { traveledDistance, color } = renderPath(config.height, scale, ctx, turtle, actions, distance);
  ctx.stroke();
  if (config.drawTurtle === true) {
    renderTurtle(config.height, scale, ctx, turtle, traveledDistance, color);
  }
}

function renderPath(
  height: number,
  scale: number,
  ctx: CanvasRenderingContext2D,
  turtle: Turtle,
  actions: ReadonlyArray<TurtleAction>,
  distance: number,
): { traveledDistance: number; color: string } {
  const startingDistance = distance;
  let penIsDown = false;
  let color = "#00000000";
  ctx.strokeStyle = color;
  ctx.lineWidth = 10 * scale;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.moveTo(turtle.position.x * scale, height * scale - turtle.position.y * scale);
  for (const action of actions) {
    if (action.action === "pen-down") {
      if (penIsDown) {
        ctx.stroke();
      }
      ctx.strokeStyle = color = action.color ?? "#000000";
      ctx.beginPath();
      penIsDown = true;
    } else if (action.action === "pen-up") {
      ctx.stroke();
      ctx.strokeStyle = color = "#00000000";
      penIsDown = false;
    } else if (action.action === "forward") {
      const [{ position: start }, ...rest] = [...turtle.move(Math.min(action.distance ?? 0, distance))];
      ctx.moveTo(start.x * scale, height * scale - start.y * scale);
      for (const { distance: traveledDistance, position } of rest) {
        ctx.lineTo(position.x * scale, height * scale - position.y * scale);
        distance -= traveledDistance;
      }
      if (distance <= 0) {
        return { traveledDistance: startingDistance, color };
      }
    } else if (action.action === "rotate") {
      turtle.rotate(action.angle ?? 0);
    }
  }
  return { traveledDistance: startingDistance - distance, color };
}

function renderTurtle(
  height: number,
  scale: number,
  ctx: CanvasRenderingContext2D,
  turtle: Turtle,
  distance: number,
  color: string,
) {
  ctx.save();
  ctx.translate(turtle.position.x * scale, height * scale - turtle.position.y * scale);
  ctx.rotate(turtle.angle());
  ctx.lineWidth = 4 * scale;
  ctx.strokeStyle = "#388e3c";
  ctx.fillStyle = "#bada55";

  // --- Begin: Inverted hexagon clip ---
  ctx.save();
  // Draw a huge rectangle
  ctx.beginPath();
  ctx.rect(-10000 * scale, -10000 * scale, 20000 * scale, 20000 * scale);

  // Draw the hexagon "hole"
  ctx.moveTo(Math.cos(-Math.PI / 6) * 8 * scale, Math.sin(-Math.PI / 6) * 8 * scale + 2 * scale);
  for (let i = 1; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = Math.cos(angle) * 8 * scale;
    const y = Math.sin(angle) * 8 * scale + 2 * scale;
    ctx.lineTo(x, y);
  }
  ctx.closePath();
  // Use "evenodd" to invert the clip
  ctx.clip("evenodd");
  // --- End: Inverted hexagon clip ---

  // Wiggle amount based on distance (creates a periodic wiggle)
  const wiggleL = Math.sin(distance / 10) * 8;
  const wiggleR = Math.cos(distance / 10) * 8;

  // Left front leg
  ctx.beginPath();
  ctx.ellipse(-11 * scale, -11 * scale, 4 * scale, 8 * scale, Math.PI * 0.1 + wiggleL * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Right front leg
  ctx.beginPath();
  ctx.ellipse(11 * scale, -11 * scale, 4 * scale, 8 * scale, -Math.PI * 0.1 - wiggleR * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Left back leg
  ctx.beginPath();
  ctx.ellipse(-11 * scale, 13 * scale, 4 * scale, 8 * scale, -Math.PI * 0.1 - wiggleL * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Right back leg
  ctx.beginPath();
  ctx.ellipse(11 * scale, 13 * scale, 4 * scale, 8 * scale, Math.PI * 0.1 + wiggleR * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Body
  ctx.beginPath();
  ctx.ellipse(0, 0, 14 * scale, 20 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Head
  ctx.beginPath();
  ctx.ellipse(0, -22 * scale, 8 * scale, 10 * scale, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Eyes
  ctx.beginPath();
  ctx.fillStyle = "#222222";
  ctx.arc(-3 * scale, -26 * scale, 1.5 * scale, 0, Math.PI * 2);
  ctx.arc(3 * scale, -26 * scale, 1.5 * scale, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore(); // Remove the inverted hexagon clip

  // Now fill the hexagon with the color
  ctx.save();
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = Math.cos(angle) * 8 * scale;
    const y = Math.sin(angle) * 8 * scale + 2 * scale;
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = 2 * scale;
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

class Turtle {
  #position: Vector;
  public get position(): Vector {
    return this.#position;
  }

  #heading: Vector = new Vector(0, 1);
  public get heading(): Vector {
    return this.#heading;
  }

  public constructor(
    position: Vector,
    private readonly boundingSize: Vector,
  ) {
    this.#position = position;
  }

  public rotate(angle: number) {
    this.#heading = this.#heading.rotate(angle);
  }

  public *move(distance: number): IterableIterator<{ distance: number; position: Vector }> {
    yield { distance: 0, position: this.#position };
    const intersection = boundsIntersection(this.boundingSize, this.#position, this.#heading);
    if (intersection == null || intersection.d > distance) {
      this.#position = this.#position.add(this.#heading.scale(distance));
      yield { distance, position: this.#position };
      return;
    }

    if (intersection.d > 0) {
      this.#position = intersection.p;
      yield { distance: intersection.d, position: this.#position };
      distance -= intersection.d;
    }

    this.#position = this.#position.add(this.#heading.scale(distance)).clamp(this.boundingSize);
    yield { distance, position: this.#position };
  }

  public angle(): number {
    return Math.atan2(this.#heading.x, this.#heading.y);
  }
}

class Vector {
  public constructor(
    public readonly x: number,
    public readonly y: number,
  ) {}

  public rotate(angle: number): Vector {
    const radians = angle;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    return new Vector(this.x * cos - this.y * sin, this.x * sin + this.y * cos);
  }

  public add(other: Vector): Vector {
    return new Vector(this.x + other.x, this.y + other.y);
  }

  public sub(other: Vector): Vector {
    return new Vector(this.x - other.x, this.y - other.y);
  }

  public scale(s: number): Vector {
    return new Vector(this.x * s, this.y * s);
  }

  public clamp(bounds: Vector): Vector {
    return new Vector(Math.max(0, Math.min(this.x, bounds.x)), Math.max(0, Math.min(this.y, bounds.y)));
  }

  public distance(other: Vector): number {
    return other.sub(this).length();
  }

  public length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
}

function boundsIntersection(boundingSize: Vector, position: Vector, heading: Vector): { d: number; p: Vector } | null {
  if (!isInBounds(boundingSize, position)) {
    return null;
  }

  // Check intersection with left (x=0)
  if (heading.x !== 0) {
    const tx = (0 - position.x) / heading.x;
    if (tx >= 0) {
      const y = position.y + tx * heading.y;
      if (y >= 0 && y <= boundingSize.y) {
        return { d: tx, p: new Vector(0, y) };
      }
    }
  }
  if (heading.x !== 0) {
    // Check intersection with right (x=boundingSize.x)
    const tx = (boundingSize.x - position.x) / heading.x;
    if (tx >= 0) {
      const y = position.y + tx * heading.y;
      if (y >= 0 && y <= boundingSize.y) {
        return { d: tx, p: new Vector(boundingSize.x, y) };
      }
    }
  }

  // Check intersection with bottom (y=0)
  if (heading.y !== 0) {
    const ty = (0 - position.y) / heading.y;
    if (ty >= 0) {
      const x = position.x + ty * heading.x;
      if (x >= 0 && x <= boundingSize.x) {
        return { d: ty, p: new Vector(x, 0) };
      }
    }
  }
  // Check intersection with top (y=boundingSize.y)
  if (heading.y !== 0) {
    const ty = (boundingSize.y - position.y) / heading.y;
    if (ty >= 0) {
      const x = position.x + ty * heading.x;
      if (x >= 0 && x <= boundingSize.x) {
        return { d: ty, p: new Vector(x, boundingSize.y) };
      }
    }
  }

  return null;
}

function isInBounds(boundingSize: Vector, position: Vector): boolean {
  return 0 <= position.x && 0 <= position.y && position.x <= boundingSize.x && position.y <= boundingSize.y;
}
