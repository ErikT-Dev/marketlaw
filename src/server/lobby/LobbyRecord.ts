import type { BusyPlayer } from "./BusyPlayer";
import type { CountsToday } from "./CountsToday";
import type { RoomSummary } from "./RoomSummary";
import type { StayingPlayer } from "./StayingPlayer";

export type LobbyRecord = {
  readonly rooms: ReadonlyArray<RoomSummary>;
  readonly busy: ReadonlyArray<BusyPlayer>;
  readonly staying: ReadonlyArray<StayingPlayer>;
  readonly today: CountsToday;
};
