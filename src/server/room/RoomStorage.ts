import type { RoomRecord } from "./RoomRecord";

export type RoomStorage = {
  readonly read: () => RoomRecord | undefined;
  readonly write: (record: RoomRecord) => void;
  readonly remove: () => void;
};
