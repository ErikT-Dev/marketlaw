import * as v from "valibot";
import { SessionResponse } from "../../shared/api/SessionResponse";
import { postJson } from "./postJson";

export async function requestLogout(token: string): Promise<boolean> {
  const answer = await postJson("/api/logout", { token }).catch(() => null);
  return v.safeParse(SessionResponse, answer).success;
}
