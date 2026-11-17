import * as v from "valibot";
import { RatingChange } from "./RatingChange";
import { RecordedSeat } from "./RecordedSeat";
import { RecordName } from "./RecordName";

export const GameRecordSeat = v.strictObject({
  ...RecordedSeat.entries,
  player: RecordName,
  rating: v.nullable(RatingChange),
});

export type GameRecordSeat = v.InferOutput<typeof GameRecordSeat>;
