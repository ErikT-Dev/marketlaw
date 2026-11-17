import * as v from "valibot";

export const RatingChange = v.strictObject({ before: v.number(), change: v.number() });

export type RatingChange = v.InferOutput<typeof RatingChange>;
