import type { TurtleAction } from "./TurtleAction";
import type { TurtleConfig } from "./TurtleConfig";

export function render(config: TurtleConfig, ctx: CanvasRenderingContext2D, actions: ReadonlyArray<TurtleAction>) {
  const scale = config.scale ?? 1;

  ctx.clearRect(0, 0, config.width * scale, config.height * scale);
  ctx.lineWidth = 10 * scale;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const turtle = new Turtle(new Vector(config.width / 2, 0), new Vector(config.width, config.height));
  ctx.moveTo(turtle.position.x * scale, config.height * scale - turtle.position.y * scale);
  for (const action of actions) {
    if (action.action === "pen-down") {
      ctx.strokeStyle = action.color;
      ctx.beginPath();
    } else if (action.action === "pen-up") {
      ctx.stroke();
      ctx.strokeStyle = "#00000000";
    } else if (action.action === "forward") {
      const [start, ...rest] = [...turtle.move(action.distance)];
      ctx.moveTo(start.x * scale, config.height * scale - start.y * scale);
      for (const position of rest) {
        ctx.lineTo(position.x * scale, config.height * scale - position.y * scale);
      }
    } else if (action.action === "rotate") {
      turtle.rotate(action.angle);
    }
  }
  ctx.stroke();
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

  public *move(distance: number): IterableIterator<Vector> {
    yield this.#position;
    const intersection = boundsIntersection(this.boundingSize, this.#position, this.#heading);
    if (intersection == null || intersection.d > distance) {
      this.#position = this.#position.add(this.#heading.scale(distance));
      yield this.#position;
      return;
    }

    if (intersection.d > 0) {
      this.#position = intersection.p;
      yield this.#position;
      distance -= intersection.d;
    }

    this.#position = this.#position.add(this.#heading.scale(distance)).clamp(this.boundingSize);
    yield this.#position;
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

  public scale(s: number): Vector {
    return new Vector(this.x * s, this.y * s);
  }

  public clamp(bounds: Vector): Vector {
    return new Vector(Math.max(0, Math.min(this.x, bounds.x)), Math.max(0, Math.min(this.y, bounds.y)));
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
