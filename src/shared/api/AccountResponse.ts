import * as v from "valibot";
import { AccountEmail } from "./AccountEmail";
import { UsernameWait } from "./UsernameWait";

export const AccountResponse = v.variant("isLoggedIn", [
  v.strictObject({
    isLoggedIn: v.literal(true),
    name: v.string(),
    usernameWait: v.nullable(UsernameWait),
    email: v.nullable(AccountEmail),
  }),
  v.strictObject({ isLoggedIn: v.literal(false) }),
]);

export type AccountResponse = v.InferOutput<typeof AccountResponse>;
