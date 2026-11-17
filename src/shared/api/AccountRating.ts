import * as v from "valibot";

export const AccountRating = v.strictObject({
  rating: v.pipe(v.number(), v.integer()),
  rankedGames: v.pipe(v.number(), v.integer(), v.minValue(0)),
});

export type AccountRating = v.InferOutput<typeof AccountRating>;
