import { decisionOf } from "../../rules/decisionOf";
import type { SeatFreeTime } from "../../shared/SeatFreeTime";
import type { AddressedNotice } from "./AddressedNotice";
import type { RoomRecord } from "./RoomRecord";

export function resumeNoticesBetween(
  before: RoomRecord | null,
  after: RoomRecord | null,
): ReadonlyArray<AddressedNotice> {
  const pause = before?.game?.saved.state.pause ?? null;
  const game = after?.game ?? null;
  if (pause === null || game === null || game.saved.state.pause !== null) {
    return [];
  }
  const state = game.saved.state;
  const seats = pause.seats.flatMap((seat): ReadonlyArray<SeatFreeTime> => {
    const decision = decisionOf(state, seat);
    return decision === null ? [] : [{ seat, freeMs: decision.freeMs }];
  });
  return game.seats.map(({ playerId }) => ({ playerId, notice: { kind: "resumed", seats } }));
}
