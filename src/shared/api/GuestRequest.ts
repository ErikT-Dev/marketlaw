import * as v from "valibot";

export const GuestRequest = v.strictObject({
  name: v.pipe(v.string(), v.trim(), v.minLength(1), v.maxLength(20)),
});

export type GuestRequest = v.InferOutput<typeof GuestRequest>;
