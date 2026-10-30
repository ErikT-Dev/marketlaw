import { TIME_RULES } from "../../rules/TIME_RULES";
import type { AddressedNotice } from "./AddressedNotice";
import type { RoomRecord } from "./RoomRecord";

export function timeOutNoticesBetween(
  before: RoomRecord | null,
  after: RoomRecord | null,
): ReadonlyArray<AddressedNotice> {
  const seatsBefore = before?.game?.saved.state.seats ?? [];
  return (after?.game?.saved.state.seats ?? []).flatMap((seat) => {
    const inARowBefore = seatsBefore.find(
      ({ seat: number }) => number === seat.seat,
    )?.timeoutsInARow;
    const playerId = after?.game?.seats.find(({ seat: number }) => number === seat.seat)?.playerId;
    return playerId === undefined ||
      inARowBefore === undefined ||
      seat.timeoutsInARow <= inARowBefore
      ? []
      : [
          {
            playerId,
            notice: {
              kind: "timed_out",
              inARow: seat.timeoutsInARow,
              of: TIME_RULES.timeoutsBeforeLeaving,
            },
          },
        ];
  });
}
