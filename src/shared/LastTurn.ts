import type { IncomeGainedLastTurn } from "./IncomeGainedLastTurn";
import type { ProjectCompletedLastTurn } from "./ProjectCompletedLastTurn";
import type { QuestCompletedLastTurn } from "./QuestCompletedLastTurn";
import type { SupportThisTurn } from "./SupportThisTurn";

export type LastTurn = {
  readonly quests: ReadonlyArray<QuestCompletedLastTurn>;
  readonly projects: ReadonlyArray<ProjectCompletedLastTurn>;
  readonly incomeGains: ReadonlyArray<IncomeGainedLastTurn>;
  readonly support: ReadonlyArray<SupportThisTurn>;
};
