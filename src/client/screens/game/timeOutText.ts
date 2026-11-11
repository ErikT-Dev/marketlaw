import type { TimedOutNotice } from "../../../shared/TimedOutNotice";

const KEEP_PLAYING = "You can keep playing until the other players are done.";

export function timeOutText(notice: TimedOutNotice): string {
  if (notice.gameKind === "casual") {
    return KEEP_PLAYING;
  }
  const of = String(notice.of);
  const count = `This was ${String(notice.inARow)} of ${of}.`;
  return notice.inARow >= notice.of
    ? `Your time ran out in ${of} turns in a row, so you left the game. ${count}`
    : `${KEEP_PLAYING} If your time runs out in ${of} turns in a row, you leave the game. ${count}`;
}
