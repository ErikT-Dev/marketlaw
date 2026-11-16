import type { EpochMs } from "../EpochMs";
import type { RankedGameSize } from "../RankedGameSize";
import type { RoomCode } from "../RoomCode";

export type QueueNotice =
  | { readonly kind: "match_found"; readonly size: RankedGameSize }
  | { readonly kind: "match_started"; readonly code: RoomCode }
  | { readonly kind: "match_not_started" }
  | { readonly kind: "match_missed"; readonly rejoinAt: EpochMs }
  | { readonly kind: "site_game_limit" }
  | {
      readonly kind: "daily_limit";
      readonly reason: "daily_action_limit" | "daily_game_start_limit";
    };
