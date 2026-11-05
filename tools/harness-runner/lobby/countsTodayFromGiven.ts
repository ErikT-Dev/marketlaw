import { dayOf } from "../../../src/server/lobby/dayOf.ts";
import type { CountsToday } from "../../../src/server/lobby/CountsToday.ts";
import type { Identity } from "../../../src/server/room/Identity.ts";
import type { EpochMs } from "../../../src/shared/EpochMs.ts";
import type { LobbyGiven } from "./LOBBY_GIVEN_SCHEMA.ts";

export function countsTodayFromGiven(
  given: LobbyGiven,
  now: EpochMs,
  accounts: { readonly identityNamed: (name: string) => Identity },
): CountsToday {
  const counted = (given.accounts ?? []).filter(
    (account) => account.actions_today !== undefined || account.games_started_today !== undefined,
  );
  return {
    day: dayOf(now),
    players: counted.map((account) => ({
      playerId: accounts.identityNamed(account.name).playerId,
      actions: account.actions_today ?? 0,
      gameStarts: account.games_started_today ?? 0,
    })),
    siteGameStarts: given.site_games_today ?? 0,
  };
}
