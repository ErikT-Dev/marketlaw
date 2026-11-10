import * as v from "valibot";
import { RecordedSeat } from "../../shared/api/RecordedSeat";
import { TypeName } from "../../shared/catalogue/TypeName";
import { PlayerId } from "../../shared/PlayerId";

const SEAT_NUMBER = v.picklist([1, 2, 3, 4]);

export const STORED_GAME_RECORD_SCHEMA = v.strictObject({
  turns: v.number(),
  winner: SEAT_NUMBER,
  bonusTypes: v.array(TypeName),
  seats: v.array(RecordedSeat),
  kind: v.picklist(["casual", "ranked"]),
  startedMs: v.number(),
  endedMs: v.number(),
  players: v.array(v.strictObject({ seat: SEAT_NUMBER, playerId: PlayerId })),
});
