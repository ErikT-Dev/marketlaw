import { isRecord } from "../../harness-check/isRecord.ts";
import type { LobbySession } from "./LobbySession.ts";

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
      return [...session.accounts.values()].map(({ identity, registration }) => ({
        name: identity.name,
        kind: registration === null ? "guest" : "registered",
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
