import type { Identity } from "../../../src/server/room/Identity.ts";
import type { PlayerId } from "../../../src/shared/PlayerId.ts";
import type { LobbyGiven } from "./LOBBY_GIVEN_SCHEMA.ts";

export class LobbyHistory {
  readonly seats: ReadonlyArray<{ readonly seat: number; readonly playerId: PlayerId }>;
  private readonly games = new Map<PlayerId, number>();

  constructor(given: LobbyGiven, identityNamed: (name: string) => Identity) {
    this.seats = (given.seats ?? []).map(({ seat, player }) => ({
      seat,
      playerId: identityNamed(player).playerId,
    }));
    for (const account of given.accounts ?? []) {
      this.games.set(identityNamed(account.name).playerId, account.games ?? 0);
    }
  }

  gamesOf(playerId: PlayerId): number {
    return this.games.get(playerId) ?? 0;
  }
}
