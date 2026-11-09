import { USERNAME_CHANGE_WAIT_MS } from "./USERNAME_CHANGE_WAIT_MS";

export function usernameChangeAllowedAt(changedMs: number | null, now: number): number | null {
  if (changedMs === null) {
    return null;
  }
  const allowedAt = changedMs + USERNAME_CHANGE_WAIT_MS;
  return now < allowedAt ? allowedAt : null;
}
