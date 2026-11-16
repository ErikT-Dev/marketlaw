import { isRecord } from "../../harness-check/isRecord.ts";
import type { LobbySession } from "./LobbySession.ts";
import { countsOn } from "../../../src/server/lobby/countsOn.ts";

function loggedInThen(session: LobbySession, visitor: unknown) {
  if (typeof visitor !== "string") {
    return session.loggedIn ?? undefined;
  }
  const name = session.visitorLogins.get(visitor);
  return name === undefined ? undefined : { visitor, as: name };
}

export function lobbyAccountsThen(session: LobbySession, field: string, expected: unknown) {
  const asked = isRecord(expected) ? expected : {};
  switch (field) {
    case "accounts":
      return Promise.all(
        [...session.accounts.values()].map(async ({ identity, registration }) => ({
          name: identity.name,
          kind: registration === null ? "guest" : "registered",
          email: registration?.email ?? null,
          email_confirmed: registration?.isEmailConfirmed ?? false,
          pending_email: registration?.pendingEmail ?? null,
          games: await session.history.gamesOf(identity.playerId),
          actions_today:
            countsOn(session.lobby, session.now).players.find(
              ({ playerId }) => playerId === identity.playerId,
            )?.actions ?? 0,
        })),
      );
    case "emails_sent":
      return session.emails.sent.map(({ to, kind }) => ({
        to,
        kind: kind === "change_confirm" ? "confirm" : kind,
      }));
    case "seats":
      return session.history.seats.map(({ seat, playerId }) => ({
        seat,
        player: [...session.accounts.values()].find(
          ({ identity }) => identity.playerId === playerId,
        )?.identity.name,
      }));
    case "generated_name": {
      const name = session.generatedName ?? "";
      const isTaken = [...session.accounts.keys()].some(
        (taken) => taken.toLowerCase() === name.toLowerCase(),
      );
      const longest = typeof asked["max_length"] === "number" ? asked["max_length"] : 0;
      return name === ""
        ? undefined
        : {
            taken: isTaken,
            max_length: name.length <= longest ? longest : name.length,
            not: name === asked["not"] ? `the same name, ${name}` : asked["not"],
          };
    }
    default:
      return loggedInThen(session, asked["visitor"]);
  }
}
