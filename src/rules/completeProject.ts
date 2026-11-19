import type { ProjectName } from "../shared/ProjectName";
import type { SeatNumber } from "../shared/SeatNumber";
import { drawRandomCard } from "./drawRandomCard";
import type { GameState } from "./GameState";
import { PROJECT_NAMES } from "../shared/PROJECT_NAMES";
import { PROJECT_NEED } from "../shared/PROJECT_NEED";
import type { Random } from "./Random";
import { seatOf } from "./seatOf";
import { updateSeat } from "./updateSeat";

const PROJECT_FUNDS_REWARD = 2;

export function completeProject(
  state: GameState,
  seat: SeatNumber,
  project: ProjectName,
  random: Random,
): GameState {
  const isThird = (seatOf(state, seat)?.projects.length ?? 0) === PROJECT_NAMES.length - 1;
  const rewarded = updateSeat(state, seat, (current) => ({
    ...current,
    stats: {
      ...current.stats,
      [project]: current.stats[project] - PROJECT_NEED,
      income: current.stats.income + (isThird ? 2 : 1),
      funds: current.stats.funds + PROJECT_FUNDS_REWARD,
      influence: current.stats.influence + 3,
    },
    projects: [...current.projects, project],
    projectsThisTurn: [...current.projectsThisTurn, project],
    worthGained: current.worthGained + PROJECT_FUNDS_REWARD,
    actionsThisTurn: current.actionsThisTurn + 1,
  }));
  const drawn = drawRandomCard(rewarded, seat, "project", random);
  return isThird ? drawRandomCard(drawn, seat, "project", random) : drawn;
}
