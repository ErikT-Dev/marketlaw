import type { SavedGame } from "../../rules/SavedGame";
import type { RoomRecord } from "../room/RoomRecord";

export function endedGameOf(before: RoomRecord | null, after: RoomRecord | null): SavedGame | null {
  const saved = after?.game?.saved;
  const wasEnded = before?.game?.saved.state.phase === "ended";
  return saved !== undefined && saved.state.phase === "ended" && !wasEnded ? saved : null;
}
