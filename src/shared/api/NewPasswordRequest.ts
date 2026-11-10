import * as v from "valibot";
import { SessionToken } from "./SessionToken";

export const NewPasswordRequest = v.strictObject({
  link: SessionToken,
  password: v.pipe(v.string(), v.maxLength(1024)),
});

export type NewPasswordRequest = v.InferOutput<typeof NewPasswordRequest>;
