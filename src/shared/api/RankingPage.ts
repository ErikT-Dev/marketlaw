import * as v from "valibot";

export const RankingPage = v.union([
  v.pipe(v.number(), v.safeInteger(), v.minValue(1)),
  v.literal("mine"),
]);

export type RankingPage = v.InferOutput<typeof RankingPage>;
