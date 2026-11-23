import type { MainPhaseLogEntry } from "../shared/MainPhaseLogEntry";
import type { GameState } from "./GameState";
import { seatsInPlayerOrderOf } from "./seatsInPlayerOrderOf";
import type { SeatState } from "./SeatState";
import { supportOf } from "./supportOf";

type TurnStart = Pick<GameState, "seats" | "firstPlayer" | "turn" | "mainPhaseLog">;

function supportEntryOf(start: TurnStart, seat: SeatState): ReadonlyArray<MainPhaseLogEntry> {
  const funds = supportOf(seat, start.seats);
  return funds > 0 ? [{ kind: "support", turn: start.turn, seat: seat.seat, funds }] : [];
}

export function withSupport(start: TurnStart): TurnStart {
  return {
    ...start,
    seats: start.seats.map((seat) => {
      const funds = supportOf(seat, start.seats);
      return {
        ...seat,
        stats: { ...seat.stats, funds: seat.stats.funds + funds },
        worthGained: seat.worthGained + funds,
      };
    }),
    mainPhaseLog: [
      ...start.mainPhaseLog,
      ...seatsInPlayerOrderOf(start).flatMap((seat) => supportEntryOf(start, seat)),
    ],
  };
}
