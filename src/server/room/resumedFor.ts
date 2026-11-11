import type { Random } from "../../rules/Random";
import type { SavedGame } from "../../rules/SavedGame";
import type { EpochMs } from "../../shared/EpochMs";
import type { PlayerId } from "../../shared/PlayerId";
import type { RoomRecord } from "./RoomRecord";
import { withSystemAction } from "./withSystemAction";

export function resumedFor(
  record: RoomRecord,
  playerId: PlayerId,
  now: EpochMs,
  randomFor: (saved: SavedGame) => Random,
): RoomRecord {
  const { game } = record;
  const seat = game?.seats.find((candidate) => candidate.playerId === playerId);
  const isInGame = game?.saved.state.seats.some(
    (state) => state.seat === seat?.seat && state.departure === null,
  );
  if (game === null || seat === undefined || isInGame !== true || game.saved.state.pause === null) {
    return record;
  }
  return {
    ...record,
    game: withSystemAction(game, { type: "resume_game", seat: seat.seat }, now, randomFor),
  };
}
