import * as v from "valibot";
import { EpochMs } from "../EpochMs";
import { GameId } from "../GameId";

export const HistoryCursor = v.strictObject({ endedAt: EpochMs, gameId: GameId });

export type HistoryCursor = v.InferOutput<typeof HistoryCursor>;
