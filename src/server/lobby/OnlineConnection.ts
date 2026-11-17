import * as v from "valibot";
import { PlayerId } from "../../shared/PlayerId";

export const OnlineConnection = v.object({
  playerId: PlayerId,
  username: v.string(),
  tokenHash: v.string(),
  rating: v.nullable(v.number()),
});

export type OnlineConnection = v.InferOutput<typeof OnlineConnection>;
