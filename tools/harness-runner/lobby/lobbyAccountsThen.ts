import { isRecord } from "../../harness-check/isRecord.ts";
import type { LobbySession } from "./LobbySession.ts";

export function lobbyAccountsThen(session: LobbySession, field: string, expected: unknown) {
  const asked = isRecord(expected) ? expected : {};
  switch (field) {
    case "accounts":
      return [...session.accounts.values()].map(({ identity, kind }) => ({
        name: identity.name,
        kind,
      }));
    case "generated_name": {
      const name = session.generatedName ?? "";
      const isTaken = [...session.accounts.keys()].some(
        (taken) => taken.toLowerCase() === name.toLowerCase(),
      );
      const longest = typeof asked["max_length"] === "number" ? asked["max_length"] : 0;
      return {
        taken: isTaken,
        max_length: name.length <= longest ? longest : name.length,
        not: name === asked["not"] ? name : asked["not"],
      };
    }
    default:
      return session.loggedInAs === null ? undefined : { as: session.loggedInAs };
  }
}
