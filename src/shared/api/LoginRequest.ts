import * as v from "valibot";

export const LoginRequest = v.strictObject({
  login: v.pipe(v.string(), v.maxLength(254)),
  password: v.pipe(v.string(), v.maxLength(1024)),
  humanCheck: v.optional(v.pipe(v.string(), v.maxLength(4096))),
});

export type LoginRequest = v.InferOutput<typeof LoginRequest>;
