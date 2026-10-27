import * as v from "valibot";

export const CardName = v.pipe(v.string(), v.minLength(1), v.brand("CardName"));

export type CardName = v.InferOutput<typeof CardName>;
