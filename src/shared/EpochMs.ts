import * as v from "valibot";

export const EpochMs = v.pipe(v.number(), v.integer(), v.minValue(0), v.brand("EpochMs"));

export type EpochMs = v.InferOutput<typeof EpochMs>;
