import type { DrawAsked } from "./DrawAsked";
import type { DrawCause } from "./DrawCause";
import type { SeatNumber } from "./SeatNumber";
import type { TurnDrawChoice } from "./TurnDrawChoice";

export type DrawLogEntry =
  | {
      readonly kind: "draw";
      readonly turn: number;
      readonly seat: SeatNumber;
      readonly cause: DrawCause;
      readonly count: number;
      readonly asked: DrawAsked;
    }
  | {
      readonly kind: "turn_draw";
      readonly turn: number;
      readonly seat: SeatNumber;
      readonly choice: TurnDrawChoice;
      readonly count: number;
      readonly asked: DrawAsked;
    }
  | {
      readonly kind: "shuffle";
      readonly turn: number;
      readonly seat: SeatNumber | null;
      readonly asked: DrawAsked | null;
      readonly count: number;
    };
