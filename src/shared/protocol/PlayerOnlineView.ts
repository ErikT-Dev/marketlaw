import * as v from "valibot";
import { PlayerId } from "../PlayerId";

export const PlayerOnlineView = v.object({
  playerId: PlayerId,
  username: v.string(),
  rating: v.nullable(v.number()),
  status: v.picklist(["online", "in_game"]),
});

export type PlayerOnlineView = v.InferOutput<typeof PlayerOnlineView>;
