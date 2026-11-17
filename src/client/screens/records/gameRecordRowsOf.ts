import type { GameKind } from "../../../shared/GameKind";
import { ratingChangeText } from "../../components/ratingChangeText";
import { GAME_RECORD_ROWS } from "./GAME_RECORD_ROWS";
import type { GameRecordRow } from "./GameRecordRow";

const RATING_ROWS: ReadonlyArray<GameRecordRow> = [
  { label: "Rating before", valueOf: (seat) => seat.rating?.before ?? "" },
  {
    label: "Rating change",
    valueOf: (seat) => (seat.rating === null ? "" : ratingChangeText(seat.rating.change)),
  },
];

export function gameRecordRowsOf(kind: GameKind): ReadonlyArray<GameRecordRow> {
  return kind === "ranked"
    ? [...GAME_RECORD_ROWS.slice(0, 1), ...RATING_ROWS, ...GAME_RECORD_ROWS.slice(1)]
    : GAME_RECORD_ROWS;
}
