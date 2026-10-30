import type { QuestName } from "../shared/catalogue/QuestName";
import type { QuestOnTable } from "../shared/QuestOnTable";

export type QuestTable = {
  readonly quests: ReadonlyArray<QuestOnTable | null>;
  readonly questList: ReadonlyArray<QuestName>;
};
