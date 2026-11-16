import * as v from "valibot";
import type { LobbyRecord } from "../../../src/server/lobby/LobbyRecord.ts";
import { RANKED_QUEUE_PLACE } from "../../../src/server/lobby/RANKED_QUEUE_PLACE.ts";
import { EMPTY_QUEUE } from "../../../src/server/queue/EMPTY_QUEUE.ts";
import { QUEUE_TIMES } from "../../../src/server/queue/QUEUE_TIMES.ts";
import type { QueueEntry } from "../../../src/server/queue/QueueEntry.ts";
import type { QueueState } from "../../../src/server/queue/QueueState.ts";
import type { Identity } from "../../../src/server/room/Identity.ts";
import { EpochMs } from "../../../src/shared/EpochMs.ts";
import type { LobbyGiven } from "./LOBBY_GIVEN_SCHEMA.ts";

export function queueStateFromGiven(
  given: LobbyGiven,
  lobby: LobbyRecord,
  identityNamed: (name: string) => Identity,
  now: EpochMs,
): QueueState {
  const entries: ReadonlyArray<QueueEntry> = (given.queue ?? []).map((entry) =>
    typeof entry === "string"
      ? { playerId: identityNamed(entry).playerId, sizes: [3] }
      : { playerId: identityNamed(entry.player).playerId, sizes: entry.sizes },
  );
  const match = given.match;
  const matches =
    match === undefined
      ? []
      : [
          {
            players: match.players.map((name) => ({
              playerId: identityNamed(name).playerId,
              sizes: [match.size],
            })),
            size: match.size,
            deadline: v.parse(EpochMs, now + QUEUE_TIMES.confirmMs),
            confirmed: [],
          },
        ];
  const queued = [...entries, ...matches.flatMap(({ players }) => players)];
  return {
    queue: { ...EMPTY_QUEUE, entries, matches },
    lobby: {
      ...lobby,
      busy: [
        ...lobby.busy,
        ...queued.map(({ playerId }) => ({ playerId, code: RANKED_QUEUE_PLACE })),
      ],
    },
  };
}
