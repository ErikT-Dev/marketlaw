import type { RoomUpdate } from "../../../shared/protocol/RoomUpdate";
import type { RunningGameClock } from "./RunningGameClock";

export function runningGameClockOf(
  update: RoomUpdate | null,
  serverClockOffsetMs: number,
): RunningGameClock | null {
  const view = update?.game?.view;
  if (update === null || view === undefined || view.result !== null) {
    return null;
  }
  const seat = view.seats.find((candidate) => candidate.kind === "own");
  if (seat?.kind !== "own" || seat.hasLeft) {
    return null;
  }
  return { view, seat, playerNames: update.room.playerNames, serverClockOffsetMs };
}
