import type { ProjectName } from "../shared/ProjectName";
import type { ProjectRejections } from "../shared/ProjectRejections";
import type { SeatNumber } from "../shared/SeatNumber";
import type { GameState } from "./GameState";
import { rejectionOf } from "./rejectionOf";

export function projectRejectionsOf(state: GameState, seat: SeatNumber): ProjectRejections {
  function rejection(project: ProjectName) {
    return rejectionOf(state, { type: "complete_project", seat, project }) ?? null;
  }
  return {
    quality: rejection("quality"),
    satisfaction: rejection("satisfaction"),
    workforce: rejection("workforce"),
  };
}
