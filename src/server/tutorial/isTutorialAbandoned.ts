import type { ConnectionState } from "../room/ConnectionState";
import { isTutorialPlayerConnected } from "./isTutorialPlayerConnected";
import type { TutorialRecord } from "./TutorialRecord";

export function isTutorialAbandoned(
  record: TutorialRecord | undefined,
  openConnections: ReadonlyArray<ConnectionState>,
): boolean {
  return record === undefined || !isTutorialPlayerConnected(record, openConnections);
}
