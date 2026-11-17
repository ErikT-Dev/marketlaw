import { viewFor } from "../../rules/viewFor";
import type { PlayerId } from "../../shared/PlayerId";
import type { RoomUpdate } from "../../shared/protocol/RoomUpdate";
import { endedRoomDeletionAt } from "./endedRoomDeletionAt";
import type { Identity } from "./Identity";
import type { RoomRecord } from "./RoomRecord";
import { seatRatingsOf } from "./seatRatingsOf";

const UPDATES_BY_RECORD = new WeakMap<
  RoomRecord,
  Readonly<Partial<Record<PlayerId, RoomUpdate>>>
>();

function nameOf(record: RoomRecord, playerId: PlayerId): string {
  return record.players.find((player) => player.playerId === playerId)?.name ?? "";
}

function seatPlayersOf(record: RoomRecord): ReadonlyArray<Identity> {
  return record.game === null
    ? record.players
    : [...record.game.seats].sort((first, second) => first.seat - second.seat);
}

function buildUpdate(record: RoomRecord, playerId: PlayerId): RoomUpdate {
  const seat = record.game?.seats.find((candidate) => candidate.playerId === playerId);
  const { asking } = record.waiting;
  return {
    room: {
      code: record.code,
      size: record.size,
      isPublic: record.isPublic,
      ownerName: record.players[0]?.name ?? "",
      playerNames: seatPlayersOf(record).map(({ name }) => name),
      playerIds: seatPlayersOf(record).map(({ playerId }) => playerId),
      namesInRoom: record.players.map(({ name }) => name),
      idsInRoom: record.players.map(({ playerId }) => playerId),
      myName: nameOf(record, playerId),
      mySeat: seat?.seat ?? null,
      asking:
        asking === null
          ? null
          : {
              deadline: asking.deadline,
              acceptedNames: asking.accepted.map((accepted) => nameOf(record, accepted)),
              hasAccepted: asking.accepted.includes(playerId),
            },
      deletionAt: endedRoomDeletionAt(record),
      ratings: seatRatingsOf(record.game),
    },
    game:
      record.game === null || seat === undefined
        ? null
        : {
            stateVersion: seat.stateVersion,
            view: viewFor(record.game.saved.state, seat.seat),
            awaySeats: [],
          },
  };
}

export function updateFor(record: RoomRecord, playerId: PlayerId): RoomUpdate {
  const updates = UPDATES_BY_RECORD.get(record) ?? {};
  const known = updates[playerId];
  if (known !== undefined) {
    return known;
  }
  const update = buildUpdate(record, playerId);
  UPDATES_BY_RECORD.set(record, { ...updates, [playerId]: update });
  return update;
}
