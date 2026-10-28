import type { ConnectionState } from "../../src/server/room/ConnectionState.ts";
import type { Identity } from "../../src/server/room/Identity.ts";
import type { PlayerView } from "../../src/shared/PlayerView.ts";
import type { SeatNumber } from "../../src/shared/SeatNumber.ts";

export type SimulatedSeat = {
  readonly seat: SeatNumber;
  readonly identity: Identity;
  connection: ConnectionState;
  view: PlayerView | null;
  stateVersion: number;
  lastActionText: string | null;
};
