import * as v from "valibot";

export const GuestRequest = v.strictObject({
  name: v.pipe(v.string(), v.maxLength(100)),
  humanCheck: v.pipe(v.string(), v.maxLength(4096)),
});

export type GuestRequest = v.InferOutput<typeof GuestRequest>;
