import * as v from "valibot";
import { PlayerId } from "../PlayerId";

export const SessionResponse = v.variant("isLoggedIn", [
  v.strictObject({
    isLoggedIn: v.literal(true),
    playerId: PlayerId,
    name: v.string(),
    isGuest: v.boolean(),
  }),
  v.strictObject({ isLoggedIn: v.literal(false) }),
]);

export type SessionResponse = v.InferOutput<typeof SessionResponse>;
