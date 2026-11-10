import * as v from "valibot";
import { GameRecordView } from "./GameRecordView";

export const GameRecordResponse = v.variant("kind", [
  v.strictObject({ kind: v.literal("found"), record: GameRecordView }),
  v.strictObject({ kind: v.literal("not_found") }),
]);

export type GameRecordResponse = v.InferOutput<typeof GameRecordResponse>;
