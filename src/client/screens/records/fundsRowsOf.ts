import type { GameRecordSeat } from "../../../shared/api/GameRecordSeat";
import type { GameRecordRow } from "./GameRecordRow";

const FUNDS_AND_CARDS_IN_HAND_ROWS: ReadonlyArray<GameRecordRow> = [
  { label: [{ stat: "funds" }], valueOf: (seat) => seat.funds ?? "" },
  { label: "Cards in hand", valueOf: (seat) => seat.cardsInHand ?? "" },
];

const RECORDED_BEFORE_SPLIT_ROWS: ReadonlyArray<GameRecordRow> = [
  { label: [{ stat: "funds" }, " + cards in hand"], valueOf: (seat) => seat.fundsAndHand ?? "" },
];

export function fundsRowsOf(seats: ReadonlyArray<GameRecordSeat>): ReadonlyArray<GameRecordRow> {
  return seats.some(({ fundsAndHand }) => fundsAndHand !== null)
    ? RECORDED_BEFORE_SPLIT_ROWS
    : FUNDS_AND_CARDS_IN_HAND_ROWS;
}
