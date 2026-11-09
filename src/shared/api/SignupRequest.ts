import * as v from "valibot";
import { SessionToken } from "./SessionToken";

export const SignupRequest = v.strictObject({
  token: v.optional(SessionToken),
  username: v.optional(v.pipe(v.string(), v.maxLength(100))),
  email: v.pipe(v.string(), v.maxLength(1024)),
  password: v.pipe(v.string(), v.maxLength(1024)),
  humanCheck: v.pipe(v.string(), v.maxLength(4096)),
});

export type SignupRequest = v.InferOutput<typeof SignupRequest>;
