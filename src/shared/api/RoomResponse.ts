import * as v from "valibot";
import { EpochMs } from "../EpochMs";
import { ReasonCode } from "../ReasonCode";
import { RoomCode } from "../RoomCode";

export const RoomResponse = v.variant("isOk", [
  v.strictObject({ isOk: v.literal(true), code: RoomCode }),
  v.strictObject({ isOk: v.literal(false), reason: ReasonCode, rejoinAt: v.nullable(EpochMs) }),
]);

export type RoomResponse = v.InferOutput<typeof RoomResponse>;
