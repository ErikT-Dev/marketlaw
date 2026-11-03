import type { EpochMs } from "../../shared/EpochMs";
import type { ReasonCode } from "../../shared/ReasonCode";
import type { Result } from "../../shared/Result";
import type { Identity } from "./Identity";
import type { RoomRecord } from "./RoomRecord";
import { withAskingIfFull } from "./withAskingIfFull";

export type JoinRejection = {
  readonly reason: ReasonCode;
  readonly rejoinAt: EpochMs | null;
};

export function joinRoom(
  record: RoomRecord,
  joining: Identity,
  now: EpochMs,
): Result<RoomRecord, JoinRejection> {
  if (record.players.some((player) => player.playerId === joining.playerId)) {
    return { isOk: true, value: record };
  }
  if (record.game !== null) {
    return { isOk: false, error: { reason: "room_not_waiting", rejoinAt: null } };
  }
  const block = record.waiting.rejoinBlocks.find(
    ({ playerId, until }) => playerId === joining.playerId && until > now,
  );
  if (block !== undefined) {
    return { isOk: false, error: { reason: "rejoin_too_soon", rejoinAt: block.until } };
  }
  if (record.players.length >= record.size) {
    return { isOk: false, error: { reason: "room_full", rejoinAt: null } };
  }
  const joined: RoomRecord = {
    ...record,
    players: [...record.players, joining],
    waiting: {
      ...record.waiting,
      rejoinBlocks: record.waiting.rejoinBlocks.filter(({ until }) => until > now),
      disconnected: [...record.waiting.disconnected, { playerId: joining.playerId, since: now }],
    },
  };
  return { isOk: true, value: withAskingIfFull(joined, now) };
}
