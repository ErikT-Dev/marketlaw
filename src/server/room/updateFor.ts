import { viewFor } from "../../rules/viewFor";
import type { PlayerId } from "../../shared/PlayerId";
import type { RoomUpdate } from "../../shared/protocol/RoomUpdate";
import type { RoomRecord } from "./RoomRecord";

const UPDATES_BY_RECORD = new WeakMap<
  RoomRecord,
  Readonly<Partial<Record<PlayerId, RoomUpdate>>>
>();

function nameOf(record: RoomRecord, playerId: PlayerId): string {
  return record.players.find((player) => player.playerId === playerId)?.name ?? "";
}

function playerNamesOf(record: RoomRecord): ReadonlyArray<string> {
  return record.game === null
    ? record.players.map(({ name }) => name)
    : [...record.game.seats]
        .sort((first, second) => first.seat - second.seat)
        .map(({ playerId }) => nameOf(record, playerId));
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
      playerNames: playerNamesOf(record),
      mySeat: seat?.seat ?? null,
      asking:
        asking === null
          ? null
          : {
              deadline: asking.deadline,
              acceptedNames: asking.accepted.map((accepted) => nameOf(record, accepted)),
            },
    },
    game:
      record.game === null || seat === undefined
        ? null
        : { stateVersion: seat.stateVersion, view: viewFor(record.game.saved.state, seat.seat) },
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
