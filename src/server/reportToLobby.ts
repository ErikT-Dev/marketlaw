import { lobbyOf } from "./lobbyOf";
import { nowMs } from "./nowMs";
import { actionsAddedBetween } from "./room/actionsAddedBetween";
import type { RoomRecord } from "./room/RoomRecord";
import { roomSummaryOf } from "./room/roomSummaryOf";

export async function reportToLobby(
  env: Env,
  before: RoomRecord | null,
  after: RoomRecord | null,
): Promise<void> {
  const summaryBefore = before === null ? null : roomSummaryOf(before);
  const summaryAfter = after === null ? null : roomSummaryOf(after);
  const played = actionsAddedBetween(before, after);
  const code = after?.code ?? before?.code;
  const isSummaryChanged = JSON.stringify(summaryBefore) !== JSON.stringify(summaryAfter);
  if (code !== undefined && (isSummaryChanged || played.length > 0)) {
    await lobbyOf(env)
      .roomChanged(code, summaryAfter, { played, now: nowMs() })
      .catch(() => undefined);
  }
}
