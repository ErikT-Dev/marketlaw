import * as v from "valibot";
import { RoomCode } from "../RoomCode";
import { SEAT_NUMBER_SCHEMA } from "../protocol/SEAT_NUMBER_SCHEMA";

export const TestRoomResponse = v.variant("isOk", [
  v.strictObject({
    isOk: v.literal(true),
    code: RoomCode,
    seats: v.array(
      v.strictObject({ seat: SEAT_NUMBER_SCHEMA, name: v.string(), token: v.string() }),
    ),
  }),
  v.strictObject({ isOk: v.literal(false), reason: v.string() }),
]);

export type TestRoomResponse = v.InferOutput<typeof TestRoomResponse>;
