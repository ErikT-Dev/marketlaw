import type { ProjectName } from "../shared/ProjectName";
import type { SeatNumber } from "../shared/SeatNumber";
import { drawRandomCard } from "./drawRandomCard";
import type { GameState } from "./GameState";
import { PROJECT_NEED } from "../shared/PROJECT_NEED";
import type { Random } from "./Random";
import { updateSeat } from "./updateSeat";

const PROJECT_FUNDS_REWARD = 20;
const PROJECT_INCOME_REWARD = 10;

export function completeProject(
  state: GameState,
  seat: SeatNumber,
  project: ProjectName,
  random: Random,
): GameState {
  const rewarded = updateSeat(state, seat, (current) => ({
    ...current,
    stats: {
      ...current.stats,
      [project]: current.stats[project] - PROJECT_NEED,
      income: current.stats.income + PROJECT_INCOME_REWARD,
      funds: current.stats.funds + PROJECT_FUNDS_REWARD,
      influence: current.stats.influence + 3,
    },
    projects: [...current.projects, project],
    worthGained: current.worthGained + PROJECT_FUNDS_REWARD,
    actionsThisTurn: current.actionsThisTurn + 1,
  }));
  return drawRandomCard(rewarded, seat, "project", random);
}
