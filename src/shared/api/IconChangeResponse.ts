import * as v from "valibot";
import { PLAYER_ICON_CHOICE_SCHEMA } from "../playerIcons/PLAYER_ICON_CHOICE_SCHEMA";
import { ReasonCode } from "../ReasonCode";
import { UsernameWait } from "./UsernameWait";

export const IconChangeResponse = v.variant("isOk", [
  v.strictObject({
    isOk: v.literal(true),
    icon: PLAYER_ICON_CHOICE_SCHEMA,
    iconWait: v.nullable(UsernameWait),
  }),
  v.strictObject({ isOk: v.literal(false), reason: ReasonCode }),
]);

export type IconChangeResponse = v.InferOutput<typeof IconChangeResponse>;
