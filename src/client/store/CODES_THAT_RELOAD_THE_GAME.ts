import type { ReasonCode } from "../../shared/ReasonCode";

export const CODES_THAT_RELOAD_THE_GAME: ReadonlyArray<ReasonCode> = [
  "malformed_message",
  "unknown_action",
  "room_not_found",
  "room_full",
  "room_not_waiting",
  "invalid_room_size",
];
