import type { RoomRecord } from "./RoomRecord";

export const ROOM_MIGRATION_STEPS: ReadonlyArray<(older: RoomRecord) => RoomRecord> = [];
