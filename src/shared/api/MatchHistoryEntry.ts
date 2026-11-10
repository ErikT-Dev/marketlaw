import * as v from "valibot";
import { EpochMs } from "../EpochMs";
import { GameId } from "../GameId";
import { RecordName } from "./RecordName";

export const MatchHistoryEntry = v.strictObject({
  gameId: GameId,
  endedAt: EpochMs,
  result: v.picklist(["won", "lost", "left"]),
  place: v.number(),
  players: v.number(),
  score: v.number(),
  turns: v.number(),
  winner: RecordName,
  winnerScore: v.number(),
});

export type MatchHistoryEntry = v.InferOutput<typeof MatchHistoryEntry>;
