import type { BusyPlayer } from "./BusyPlayer";
import type { CountsToday } from "./CountsToday";
import type { RoomSummary } from "./RoomSummary";

export type LobbyRecord = {
  readonly rooms: ReadonlyArray<RoomSummary>;
  readonly busy: ReadonlyArray<BusyPlayer>;
  readonly staying: ReadonlyArray<BusyPlayer>;
  readonly today: CountsToday;
};
