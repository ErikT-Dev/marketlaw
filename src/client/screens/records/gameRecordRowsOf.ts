import type { GameRecordView } from "../../../shared/api/GameRecordView";
import { ratingChangeText } from "../../components/ratingChangeText";
import { GAME_RECORD_ROWS } from "./GAME_RECORD_ROWS";
import type { GameRecordRow } from "./GameRecordRow";
import { fundsRowsOf } from "./fundsRowsOf";

const RATING_ROWS: ReadonlyArray<GameRecordRow> = [
  { label: "Rating before", valueOf: (seat) => seat.rating?.before ?? "" },
  {
    label: "Rating change",
    valueOf: (seat) => (seat.rating === null ? "" : ratingChangeText(seat.rating.change)),
  },
];

export function gameRecordRowsOf(record: GameRecordView): ReadonlyArray<GameRecordRow> {
  const rows = GAME_RECORD_ROWS.flatMap((row) =>
    row === "funds" ? fundsRowsOf(record.seats) : [row],
  );
  return record.kind === "ranked" ? [...rows.slice(0, 1), ...RATING_ROWS, ...rows.slice(1)] : rows;
}
