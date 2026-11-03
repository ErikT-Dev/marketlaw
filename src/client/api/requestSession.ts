import * as v from "valibot";
import { SessionResponse } from "../../shared/api/SessionResponse";
import { postJson } from "./postJson";

export async function requestSession(token: string): Promise<SessionResponse | null> {
  const parsed = v.safeParse(
    SessionResponse,
    await postJson("/api/session", { token }).catch(() => null),
  );
  return parsed.success ? parsed.output : null;
}
