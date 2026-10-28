import type { ProjectName } from "../shared/ProjectName";
import type { ReasonCode } from "../shared/ReasonCode";
import { PROJECT_NEED } from "../shared/PROJECT_NEED";
import type { SeatState } from "./SeatState";

export function projectRejection(seat: SeatState, project: ProjectName): ReasonCode | undefined {
  if (seat.projects.includes(project)) {
    return "project_already_completed";
  }
  const { workforce, quality, satisfaction } = seat.stats;
  const hasNoNegativeStat = workforce >= 0 && quality >= 0 && satisfaction >= 0;
  return hasNoNegativeStat && seat.stats[project] >= PROJECT_NEED
    ? undefined
    : "project_needs_not_met";
}
