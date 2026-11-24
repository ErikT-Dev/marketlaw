import * as v from "valibot";
import { AccountEmail } from "./AccountEmail";
import { AccountRating } from "./AccountRating";
import { PLAYER_ICON_CHOICE_SCHEMA } from "../playerIcons/PLAYER_ICON_CHOICE_SCHEMA";
import { UsernameWait } from "./UsernameWait";

export const AccountResponse = v.variant("isLoggedIn", [
  v.strictObject({
    isLoggedIn: v.literal(true),
    name: v.string(),
    usernameWait: v.nullable(UsernameWait),
    icon: PLAYER_ICON_CHOICE_SCHEMA,
    iconWait: v.nullable(UsernameWait),
    email: v.nullable(AccountEmail),
    rating: v.nullable(AccountRating),
  }),
  v.strictObject({ isLoggedIn: v.literal(false) }),
]);

export type AccountResponse = v.InferOutput<typeof AccountResponse>;
