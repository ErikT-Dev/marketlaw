import type { EpochMs } from "../../shared/EpochMs";
import type { PlayerId } from "../../shared/PlayerId";
import type { Result } from "../../shared/Result";
import { countsOn } from "./countsOn";
import type { LobbyRecord } from "./LobbyRecord";
import { TUTORIAL_PLACE } from "./TUTORIAL_PLACE";
import type { TutorialStartRejection } from "./TutorialStartRejection";

export function countTutorialStart(
  record: LobbyRecord,
  playerId: PlayerId,
  limits: { readonly now: EpochMs; readonly siteTutorialsPerDay: number },
): Result<LobbyRecord, TutorialStartRejection> {
  const current = record.busy.find((entry) => entry.playerId === playerId);
  if (current !== undefined && current.code !== TUTORIAL_PLACE) {
    return { isOk: false, error: "busy_elsewhere" };
  }
  const counts = countsOn(record, limits.now);
  if (counts.siteTutorialStarts >= limits.siteTutorialsPerDay) {
    return { isOk: false, error: "site_daily_cap" };
  }
  return {
    isOk: true,
    value: {
      ...record,
      busy:
        current === undefined ? [...record.busy, { playerId, code: TUTORIAL_PLACE }] : record.busy,
      today: { ...counts, siteTutorialStarts: counts.siteTutorialStarts + 1 },
    },
  };
}
