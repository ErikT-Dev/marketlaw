import type { QuestName } from "./catalogue/QuestName";

export type QuestOnTable = {
  readonly quest: QuestName;
  readonly turnsOnTable: number;
};
