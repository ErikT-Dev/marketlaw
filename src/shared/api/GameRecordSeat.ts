import * as v from "valibot";
import { RecordedSeat } from "./RecordedSeat";
import { RecordName } from "./RecordName";

export const GameRecordSeat = v.strictObject({ ...RecordedSeat.entries, player: RecordName });

export type GameRecordSeat = v.InferOutput<typeof GameRecordSeat>;
