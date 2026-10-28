import type { ProjectName } from "../shared/ProjectName";
import type { GameState } from "./GameState";
import { PROJECT_NAMES } from "./PROJECT_NAMES";

export function firstCompletionsOf(state: GameState): ReadonlyArray<ProjectName> {
  return PROJECT_NAMES.filter(
    (project) =>
      !state.firstCompletions.includes(project) &&
      state.seats.some((seat) => seat.projectsThisTurn.includes(project)),
  );
}
