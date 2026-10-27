import * as v from "valibot";

export const PlayerId = v.pipe(v.string(), v.uuid(), v.brand("PlayerId"));

export type PlayerId = v.InferOutput<typeof PlayerId>;
