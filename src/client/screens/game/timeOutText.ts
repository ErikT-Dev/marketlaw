import type { Notice } from "../../../shared/Notice";

export function timeOutText(notice: Notice): string {
  return `You were made done for this turn. If your time runs out in ${String(notice.of)} turns in a row, you leave the game. This was ${String(notice.inARow)} of ${String(notice.of)}.`;
}
