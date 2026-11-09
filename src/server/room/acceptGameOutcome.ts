import type { PlayerId } from "../../shared/PlayerId";
import type { ReasonCode } from "../../shared/ReasonCode";
import type { Result } from "../../shared/Result";
import type { GameStart } from "./GameStart";
import type { RoomActionChange } from "./RoomActionChange";
import { roomChanged } from "./roomChanged";
import type { RoomRecord } from "./RoomRecord";
import { startGameWithinLimits } from "./startGameWithinLimits";

export function acceptGameOutcome(
  record: RoomRecord,
  playerId: PlayerId,
  start: GameStart,
): Result<RoomActionChange, ReasonCode> {
  const { asking } = record.waiting;
  if (asking === null) {
    return { isOk: false, error: "not_asking" };
  }
  if (asking.accepted.includes(playerId)) {
    return roomChanged(record);
  }
  const accepted = [...asking.accepted, playerId];
  if (record.players.every((player) => accepted.includes(player.playerId))) {
    return { isOk: true, value: startGameWithinLimits(record, start, playerId) };
  }
  return roomChanged({
    ...record,
    waiting: { ...record.waiting, asking: { ...asking, accepted } },
  });
}
