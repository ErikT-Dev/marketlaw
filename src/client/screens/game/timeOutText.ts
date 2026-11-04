import type { Notice } from "../../../shared/Notice";

export function timeOutText(notice: Extract<Notice, { readonly kind: "timed_out" }>): string {
  const of = String(notice.of);
  const count = `This was ${String(notice.inARow)} of ${of}.`;
  return notice.inARow >= notice.of
    ? `Your time ran out in ${of} turns in a row, so you left the game. ${count}`
    : `You were made done for this turn. If your time runs out in ${of} turns in a row, you leave the game. ${count}`;
}
