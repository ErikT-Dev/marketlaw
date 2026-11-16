import type { SeatFreeTime } from "./SeatFreeTime";
import type { TimedOutNotice } from "./TimedOutNotice";

export type Notice =
  | TimedOutNotice
  | {
      readonly kind: "resumed";
      readonly seats: ReadonlyArray<SeatFreeTime>;
    }
  | { readonly kind: "site_game_limit" }
  | {
      readonly kind: "daily_limit";
      readonly reason: "daily_action_limit" | "daily_game_start_limit";
    };
