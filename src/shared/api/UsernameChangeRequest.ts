import * as v from "valibot";
import { SessionToken } from "./SessionToken";

export const UsernameChangeRequest = v.strictObject({
  token: SessionToken,
  username: v.pipe(v.string(), v.maxLength(100)),
});

export type UsernameChangeRequest = v.InferOutput<typeof UsernameChangeRequest>;
