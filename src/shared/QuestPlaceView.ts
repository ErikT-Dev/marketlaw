import type { QuestName } from "./catalogue/QuestName";
import type { QuestProgress } from "./QuestProgress";
import type { ReasonCode } from "./ReasonCode";

export type QuestPlaceView =
  | { readonly quest: null }
  | {
      readonly quest: QuestName;
      readonly turnsLeft: number;
      readonly isInExtraTurn: boolean;
      readonly completeRejection: ReasonCode | null;
      readonly progress: ReadonlyArray<QuestProgress>;
    };
