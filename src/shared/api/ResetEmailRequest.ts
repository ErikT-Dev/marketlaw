import * as v from "valibot";

export const ResetEmailRequest = v.strictObject({
  email: v.pipe(v.string(), v.maxLength(1024)),
  humanCheck: v.pipe(v.string(), v.maxLength(4096)),
});

export type ResetEmailRequest = v.InferOutput<typeof ResetEmailRequest>;
