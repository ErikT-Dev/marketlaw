import * as v from "valibot";

export const RankingStanding = v.variant("kind", [
  v.strictObject({ kind: v.literal("placed"), place: v.number() }),
  v.strictObject({ kind: v.literal("logged_out") }),
  v.strictObject({ kind: v.literal("guest") }),
  v.strictObject({ kind: v.literal("no_ranked_game") }),
]);

export type RankingStanding = v.InferOutput<typeof RankingStanding>;
