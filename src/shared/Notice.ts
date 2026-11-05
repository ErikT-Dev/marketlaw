import type { SeatNumber } from "./SeatNumber";

export type Notice =
  | {
      readonly kind: "timed_out";
      readonly inARow: number;
      readonly of: number;
    }
  | {
      readonly kind: "resumed";
      readonly seats: ReadonlyArray<SeatNumber>;
      readonly freeMs: number;
    }
  | { readonly kind: "site_game_limit" };
