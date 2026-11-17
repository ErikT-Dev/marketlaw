import * as v from "valibot";
import { PlayerId } from "../PlayerId";

export const RankingEntry = v.strictObject({
  place: v.number(),
  playerId: PlayerId,
  username: v.string(),
  rating: v.number(),
  rankedGames: v.number(),
});

export type RankingEntry = v.InferOutput<typeof RankingEntry>;
