import { PLAYER_STATUS_TEXTS } from "../../../src/client/components/PLAYER_STATUS_TEXTS.ts";
import { onlineBadgeStatusOf } from "../../../src/client/screens/lobby/onlineBadgeStatusOf.ts";
import { lobbyMessageOf } from "../../../src/server/lobby/lobbyMessageOf.ts";
import { onlineConnectionOf } from "../../../src/server/lobby/onlineConnectionOf.ts";
import type { LobbyMessage } from "../../../src/shared/protocol/LobbyMessage.ts";
import { givenRatingsDatabaseOf } from "./givenRatingsDatabaseOf.ts";
import type { LobbyGiven } from "./LOBBY_GIVEN_SCHEMA.ts";
import type { LobbySession } from "./LobbySession.ts";
import { memoryReadStatementOf } from "./memoryReadStatementOf.ts";
import { queueSentTo } from "./queueSentTo.ts";

export const PRESENCE_THEN_FIELDS = ["players_online", "queue_count"];

export class LobbyPresence {
  private opened: LobbyMessage | null = null;
  private readonly given: LobbyGiven;

  constructor(given: LobbyGiven) {
    this.given = given;
  }

  async open(session: LobbySession): Promise<void> {
    const sqlite = givenRatingsDatabaseOf(this.given, session.accounts);
    const db = { prepare: (query: string) => memoryReadStatementOf(sqlite, query, []) };
    const online = (this.given.accounts ?? []).filter((account) => account.online === true);
    const connections = await Promise.all(
      online.map(async ({ name }) =>
        onlineConnectionOf(db, {
          identity: session.identityNamed(name),
          tokenHash: `token-hash-of-${name}`,
        }),
      ),
    );
    this.opened = lobbyMessageOf(session.lobby, connections);
  }

  then(session: LobbySession, field: string): unknown {
    if (field === "queue_count") {
      return queueSentTo(session, "").view.counts.total;
    }
    return (
      this.opened?.playersOnline.map(({ username, status, rating }) => ({
        username,
        status: PLAYER_STATUS_TEXTS[onlineBadgeStatusOf(status)],
        ...(rating === null ? {} : { rating }),
      })) ?? "no lobby opened"
    );
  }
}
