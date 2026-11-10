import * as v from "valibot";
import { HistoryCursor } from "./HistoryCursor";
import { MatchHistoryEntry } from "./MatchHistoryEntry";

export const MatchHistoryResponse = v.variant("kind", [
  v.strictObject({
    kind: v.literal("found"),
    username: v.string(),
    games: v.array(MatchHistoryEntry),
    older: v.nullable(HistoryCursor),
  }),
  v.strictObject({ kind: v.literal("account_gone") }),
]);

export type MatchHistoryResponse = v.InferOutput<typeof MatchHistoryResponse>;
