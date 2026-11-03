import type { RoomRecord } from "./RoomRecord";
import type { RoomRemoval } from "./RoomRemoval";

export type RoomChange = {
  readonly record: RoomRecord | null;
  readonly removals: ReadonlyArray<RoomRemoval>;
};
