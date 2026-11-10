import * as v from "valibot";
import { PlayerId } from "../PlayerId";

export const RecordName = v.variant("kind", [
  v.strictObject({ kind: v.literal("player"), playerId: PlayerId, username: v.string() }),
  v.strictObject({ kind: v.literal("deleted") }),
]);

export type RecordName = v.InferOutput<typeof RecordName>;
