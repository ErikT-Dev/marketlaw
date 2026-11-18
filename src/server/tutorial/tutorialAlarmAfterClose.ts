import type { ConnectionState } from "../room/ConnectionState";
import { ROOM_TIMES } from "../room/ROOM_TIMES";
import { isTutorialPlayerConnected } from "./isTutorialPlayerConnected";
import type { TutorialRecord } from "./TutorialRecord";

export function tutorialAlarmAfterClose(
  record: TutorialRecord | undefined,
  stillOpen: ReadonlyArray<ConnectionState>,
  now: number,
): number | null {
  return record === undefined || isTutorialPlayerConnected(record, stillOpen)
    ? null
    : now + ROOM_TIMES.tutorialAwayMs;
}
