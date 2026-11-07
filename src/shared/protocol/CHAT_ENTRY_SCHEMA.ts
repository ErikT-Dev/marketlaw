import * as v from "valibot";
import { EpochMs } from "../EpochMs";

export const CHAT_ENTRY_SCHEMA = v.variant("kind", [
  v.object({
    kind: v.literal("message"),
    from: v.string(),
    text: v.string(),
    at: EpochMs,
    isOwn: v.boolean(),
  }),
  v.object({
    kind: v.literal("player_line"),
    event: v.picklist(["joined_room", "left_room", "left_game"]),
    name: v.string(),
    at: EpochMs,
  }),
  v.object({
    kind: v.literal("game_line"),
    event: v.picklist(["game_started", "game_ended"]),
    at: EpochMs,
  }),
]);
