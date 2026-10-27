import * as v from "valibot";
import { PlayerId } from "../PlayerId";

export const GuestResponse = v.strictObject({
  token: v.string(),
  playerId: PlayerId,
  name: v.string(),
});

export type GuestResponse = v.InferOutput<typeof GuestResponse>;
