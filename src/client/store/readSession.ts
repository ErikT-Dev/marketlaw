import * as v from "valibot";
import { PlayerId } from "../../shared/PlayerId";
import { RoomCode } from "../../shared/RoomCode";
import { SESSION_KEY } from "./SESSION_KEY";
import type { StoredSession } from "./StoredSession";

const STORED_SESSION = v.object({
  token: v.string(),
  playerId: v.optional(v.nullable(PlayerId), null),
  name: v.string(),
  isGuest: v.optional(v.boolean(), true),
  roomCode: v.nullable(RoomCode),
});

export function readSession(): StoredSession | null {
  try {
    const parsed = v.safeParse(
      STORED_SESSION,
      JSON.parse(localStorage.getItem(SESSION_KEY) ?? "null"),
    );
    return parsed.success ? parsed.output : null;
  } catch {
    return null;
  }
}
