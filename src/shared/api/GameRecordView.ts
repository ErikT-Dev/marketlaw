import * as v from "valibot";
import { TypeName } from "../catalogue/TypeName";
import { EpochMs } from "../EpochMs";
import { GameId } from "../GameId";
import { GameRecordSeat } from "./GameRecordSeat";

export const GameRecordView = v.strictObject({
  gameId: GameId,
  kind: v.picklist(["casual", "ranked"]),
  startedAt: EpochMs,
  endedAt: EpochMs,
  turns: v.number(),
  winner: v.picklist([1, 2, 3, 4]),
  bonusTypes: v.array(TypeName),
  seats: v.array(GameRecordSeat),
});

export type GameRecordView = v.InferOutput<typeof GameRecordView>;
