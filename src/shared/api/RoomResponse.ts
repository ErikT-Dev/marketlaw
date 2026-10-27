import * as v from "valibot";
import { RoomCode } from "../RoomCode";

export const RoomResponse = v.variant("isOk", [
  v.strictObject({ isOk: v.literal(true), code: RoomCode }),
  v.strictObject({ isOk: v.literal(false), reason: v.string() }),
]);

export type RoomResponse = v.InferOutput<typeof RoomResponse>;
