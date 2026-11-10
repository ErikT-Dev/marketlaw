import * as v from "valibot";
import { SessionToken } from "./SessionToken";

export const AccountDeletionRequest = v.strictObject({
  token: SessionToken,
  password: v.pipe(v.string(), v.maxLength(1024)),
});

export type AccountDeletionRequest = v.InferOutput<typeof AccountDeletionRequest>;
