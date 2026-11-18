import type { ConnectionState } from "../room/ConnectionState";
import type { TutorialRecord } from "./TutorialRecord";

export function isTutorialPlayerConnected(
  record: TutorialRecord,
  openConnections: ReadonlyArray<ConnectionState>,
): boolean {
  return openConnections.some(({ identity }) => identity?.playerId === record.player.playerId);
}
