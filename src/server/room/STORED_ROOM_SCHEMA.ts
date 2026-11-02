import * as v from "valibot";
import type { RoomRecord } from "./RoomRecord";

export const STORED_ROOM_SCHEMA = v.custom<RoomRecord>(
  (value) => typeof value === "object" && value !== null && "schemaVersion" in value,
);
