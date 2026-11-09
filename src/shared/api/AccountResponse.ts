import * as v from "valibot";
import { UsernameWait } from "./UsernameWait";

export const AccountResponse = v.variant("isLoggedIn", [
  v.strictObject({
    isLoggedIn: v.literal(true),
    name: v.string(),
    usernameWait: v.nullable(UsernameWait),
  }),
  v.strictObject({ isLoggedIn: v.literal(false) }),
]);

export type AccountResponse = v.InferOutput<typeof AccountResponse>;
