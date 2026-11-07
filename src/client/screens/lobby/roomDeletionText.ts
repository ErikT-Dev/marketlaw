import type { EpochMs } from "../../../shared/EpochMs";
import { chatTimeText } from "../chat/chatTimeText";

function isSameLocalDay(first: number, second: number): boolean {
  return new Date(first).toDateString() === new Date(second).toDateString();
}

export function roomDeletionText(deletionAt: EpochMs | null, now: number): string {
  const lastPlayer = "This room and its chat are deleted when the last player leaves";
  if (deletionAt === null) {
    return `${lastPlayer}.`;
  }
  const day = isSameLocalDay(deletionAt, now) ? "today" : "tomorrow";
  return `${lastPlayer}, or at ${chatTimeText(deletionAt)} ${day}, 24 hours after the game ended.`;
}
