import * as v from "valibot";
import { PlayerId } from "../PlayerId";
import { PLAYER_ICON_CHOICE_SCHEMA } from "../playerIcons/PLAYER_ICON_CHOICE_SCHEMA";
import { ReasonCode } from "../ReasonCode";

export const GuestResponse = v.variant("isOk", [
  v.strictObject({
    isOk: v.literal(true),
    token: v.string(),
    playerId: PlayerId,
    name: v.string(),
    icon: PLAYER_ICON_CHOICE_SCHEMA,
  }),
  v.strictObject({ isOk: v.literal(false), reason: ReasonCode }),
]);

export type GuestResponse = v.InferOutput<typeof GuestResponse>;
