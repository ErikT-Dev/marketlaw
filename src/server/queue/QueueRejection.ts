import type { ClaimRejection } from "../lobby/ClaimRejection";

export type QueueRejection =
  | ClaimRejection
  | "not_registered"
  | "email_not_confirmed"
  | "invalid_game_sizes"
  | "rejoin_too_soon"
  | "not_in_queue"
  | "no_match_to_confirm";
