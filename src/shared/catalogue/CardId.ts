import * as v from "valibot";

export const CardId = v.pipe(v.number(), v.integer(), v.minValue(1), v.brand("CardId"));

export type CardId = v.InferOutput<typeof CardId>;
