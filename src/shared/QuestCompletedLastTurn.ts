import type { QuestName } from "./catalogue/QuestName";
import type { SeatNumber } from "./SeatNumber";

export type QuestCompletedLastTurn = {
  readonly quest: QuestName;
  readonly seats: ReadonlyArray<SeatNumber>;
  readonly firstCompletionFunds: number;
};
