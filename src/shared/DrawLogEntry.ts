import type { DrawAsked } from "./DrawAsked";
import type { DrawCause } from "./DrawCause";
import type { SeatNumber } from "./SeatNumber";

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
      readonly kind: "shuffle";
      readonly turn: number;
      readonly seat: SeatNumber;
      readonly asked: DrawAsked | null;
      readonly count: number;
    };
