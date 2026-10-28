import type { RoomUpdate } from "../../src/shared/protocol/RoomUpdate.ts";

export type SeatUpdates = {
  readonly updates: ReadonlyArray<RoomUpdate>;
  readonly texts: ReadonlyArray<string>;
  readonly allText: string;
};
