import { queueViewFor } from "../../../src/server/queue/queueViewFor.ts";
import type { PlayerId } from "../../../src/shared/PlayerId.ts";
import { isRecord } from "../../harness-check/isRecord.ts";
import type { LobbySession } from "./LobbySession.ts";
import { queueContextIn } from "./queueContextIn.ts";

function nameOf(session: LobbySession, playerId: PlayerId): string | undefined {
  return [...session.accounts.values()].find(({ identity }) => identity.playerId === playerId)
    ?.identity.name;
}

function queueThen(session: LobbySession, expected: unknown) {
  const asked: ReadonlyArray<unknown> = Array.isArray(expected) ? expected : [];
  return session.queue.entries.map(({ playerId, sizes }, index) => {
    const player = nameOf(session, playerId);
    const isOnlyThree = sizes.length === 1 && sizes[0] === 3;
    return typeof asked[index] === "string" && isOnlyThree ? player : { player, sizes };
  });
}

function viewLobbyThen(session: LobbySession, expected: unknown) {
  const asked = isRecord(expected) ? expected : {};
  const player = typeof asked["player"] === "string" ? asked["player"] : "";
  const state = { queue: session.queue, lobby: session.lobby };
  const view = queueViewFor(state, session.identityNamed(player).playerId, queueContextIn(session));
  const text = JSON.stringify(view);
  const hides: ReadonlyArray<unknown> = Array.isArray(asked["hides"]) ? asked["hides"] : [];
  return {
    player,
    queue_count: { total: view.counts.total, by_size: view.counts.bySize },
    in_queue: view.own.kind !== "out",
    hides: hides.filter(
      (name) =>
        typeof name === "string" &&
        !text.includes(name) &&
        !text.includes(session.identityNamed(name).playerId),
    ),
  };
}

export function lobbyQueueThen(session: LobbySession, field: string, expected: unknown) {
  switch (field) {
    case "queue":
      return queueThen(session, expected);
    case "match": {
      const match = session.queue.matches.at(-1);
      return match === undefined
        ? null
        : {
            players: match.players.map(({ playerId }) => nameOf(session, playerId)),
            size: match.size,
            state: "confirming",
          };
    }
    default:
      return viewLobbyThen(session, expected);
  }
}
