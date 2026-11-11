import type { ProjectName } from "../shared/ProjectName";
import { FIRST_COMPLETION_FUNDS } from "./FIRST_COMPLETION_FUNDS";
import type { SeatState } from "./SeatState";

export function firstCompletionFundsOf(
  seat: SeatState,
  firsts: ReadonlyArray<ProjectName>,
): number {
  return seat.departure !== null
    ? 0
    : seat.projectsThisTurn.filter((project) => firsts.includes(project)).length *
        FIRST_COMPLETION_FUNDS;
}
