import type { StatAmounts } from "../StatAmounts";
import type { TypeName } from "./TypeName";

export type QuestReward = {
  readonly stats: StatAmounts;
  readonly gainedType: TypeName | null;
  readonly draws: number;
};
