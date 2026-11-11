import * as v from "valibot";
import { SessionToken } from "../../shared/api/SessionToken";
import { RoomCode } from "../../shared/RoomCode";
import type { StoredSession } from "./StoredSession";

const LINKED_SESSION = v.object({
  session: SessionToken,
  name: v.pipe(v.string(), v.minLength(1), v.maxLength(20)),
  room: RoomCode,
});

export function sessionFromLink(hash: string): StoredSession | null {
  const fields = Object.fromEntries(new URLSearchParams(hash.replace(/^#/, "")));
  const parsed = v.safeParse(LINKED_SESSION, fields);
  return parsed.success
    ? {
        token: parsed.output.session,
        playerId: null,
        name: parsed.output.name,
        isGuest: true,
        roomCode: parsed.output.room,
      }
    : null;
}
