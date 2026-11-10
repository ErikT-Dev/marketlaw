import * as v from "valibot";
import { SessionToken } from "./SessionToken";

export const EmailChangeRequest = v.strictObject({
  token: SessionToken,
  email: v.pipe(v.string(), v.maxLength(1024)),
  humanCheck: v.pipe(v.string(), v.maxLength(4096)),
});

export type EmailChangeRequest = v.InferOutput<typeof EmailChangeRequest>;
