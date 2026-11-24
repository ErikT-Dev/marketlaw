import * as v from "valibot";
import { PlayerId } from "../PlayerId";
import { PLAYER_ICON_CHOICE_SCHEMA } from "../playerIcons/PLAYER_ICON_CHOICE_SCHEMA";

export const SessionResponse = v.variant("isLoggedIn", [
  v.strictObject({
    isLoggedIn: v.literal(true),
    playerId: PlayerId,
    name: v.string(),
    isGuest: v.boolean(),
    icon: PLAYER_ICON_CHOICE_SCHEMA,
  }),
  v.strictObject({ isLoggedIn: v.literal(false) }),
]);

export type SessionResponse = v.InferOutput<typeof SessionResponse>;
