import { END_GOAL } from "./END_GOAL";
import type { SeatState } from "./SeatState";

export function hasReachedEndGoal(seat: SeatState): boolean {
  return (
    !seat.hasLeft &&
    seat.stats.income >= END_GOAL.income &&
    seat.projects.length >= END_GOAL.projects
  );
}
