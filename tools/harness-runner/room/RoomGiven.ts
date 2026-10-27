import type * as v from "valibot";
import type { ROOM_GIVEN_SCHEMA } from "./ROOM_GIVEN_SCHEMA.ts";

export type RoomGiven = v.InferOutput<typeof ROOM_GIVEN_SCHEMA>;
