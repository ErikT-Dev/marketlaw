import type { ProjectName } from "./ProjectName";
import type { SeatNumber } from "./SeatNumber";

export type ProjectCompletedLastTurn = {
  readonly project: ProjectName;
  readonly seats: ReadonlyArray<SeatNumber>;
};
