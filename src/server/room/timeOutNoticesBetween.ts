import type { SeatState } from "../../rules/SeatState";
import { TIME_RULES } from "../../rules/TIME_RULES";
import type { TimedOutNotice } from "../../shared/TimedOutNotice";
import type { AddressedNotice } from "./AddressedNotice";
import type { RoomRecord } from "./RoomRecord";

function noticeFor(before: SeatState, after: SeatState, isRanked: boolean): TimedOutNotice | null {
  if (isRanked) {
    return after.timeoutsInARow > before.timeoutsInARow
      ? {
          kind: "timed_out",
          gameKind: "ranked",
          inARow: after.timeoutsInARow,
          of: TIME_RULES.timeoutsBeforeLeaving,
        }
      : null;
  }
  return after.isOutOfTime && !before.isOutOfTime
    ? { kind: "timed_out", gameKind: "casual" }
    : null;
}

export function timeOutNoticesBetween(
  before: RoomRecord | null,
  after: RoomRecord | null,
): ReadonlyArray<AddressedNotice> {
  const seatsBefore = before?.game?.saved.state.seats ?? [];
  const isRanked = after?.game?.kind === "ranked";
  return (after?.game?.saved.state.seats ?? []).flatMap((seat) => {
    const seatBefore = seatsBefore.find(({ seat: number }) => number === seat.seat);
    const playerId = after?.game?.seats.find(({ seat: number }) => number === seat.seat)?.playerId;
    const notice = seatBefore === undefined ? null : noticeFor(seatBefore, seat, isRanked);
    return playerId === undefined || notice === null ? [] : [{ playerId, notice }];
  });
}
