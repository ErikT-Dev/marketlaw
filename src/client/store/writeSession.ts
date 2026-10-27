import { SESSION_KEY } from "./SESSION_KEY";
import type { StoredSession } from "./StoredSession";

export function writeSession(session: StoredSession | null): void {
  try {
    if (session === null) {
      localStorage.removeItem(SESSION_KEY);
      return;
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    return;
  }
}
