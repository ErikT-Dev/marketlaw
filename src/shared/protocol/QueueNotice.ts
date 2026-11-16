import type { DailyLimitReason } from "../DailyLimitReason";
import type { EpochMs } from "../EpochMs";
import type { RankedGameSize } from "../RankedGameSize";
import type { RoomCode } from "../RoomCode";
import type { MatchNotStartedReason } from "./MatchNotStartedReason";

export type QueueNotice =
  | { readonly kind: "match_found"; readonly size: RankedGameSize }
  | { readonly kind: "match_started"; readonly code: RoomCode }
  | { readonly kind: "match_not_started"; readonly reason: MatchNotStartedReason }
  | { readonly kind: "match_missed"; readonly rejoinAt: EpochMs }
  | { readonly kind: "site_game_limit" }
  | { readonly kind: "daily_limit"; readonly reason: DailyLimitReason };
