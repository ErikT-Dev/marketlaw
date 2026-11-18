import type { ProjectName } from "../shared/ProjectName";
import type { ReasonCode } from "../shared/ReasonCode";
import { PROJECT_INCOME_NEED } from "../shared/PROJECT_INCOME_NEED";
import { PROJECT_NEED } from "../shared/PROJECT_NEED";
import { negativeStatsOf } from "./negativeStatsOf";
import type { SeatState } from "./SeatState";

export function projectRejection(seat: SeatState, project: ProjectName): ReasonCode | undefined {
  if (seat.projects.includes(project)) {
    return "project_already_completed";
  }
  const hasNoNegativeStat = negativeStatsOf(seat.stats).length === 0;
  const hasTheNeeds =
    seat.stats[project] >= PROJECT_NEED && seat.stats.income >= PROJECT_INCOME_NEED;
  return hasNoNegativeStat && hasTheNeeds
    ? undefined
    : "project_needs_not_met";
}
