export type TurtleAction =
  | {
      action: "pen-down";
      color: string;
    }
  | {
      action: "pen-up";
    }
  | {
      action: "forward";
      distance: number;
    }
  | {
      action: "rotate";
      angle: number;
    };
