import type { QuestName } from "../../../shared/catalogue/QuestName";
import type { ProjectName } from "../../../shared/ProjectName";
import type { SeatNumber } from "../../../shared/SeatNumber";

export type LastTurnRow =
  | {
      readonly kind: "quest";
      readonly seat: SeatNumber;
      readonly quest: QuestName;
      readonly firstCompletionFunds: number;
    }
  | { readonly kind: "project"; readonly seat: SeatNumber; readonly project: ProjectName }
  | { readonly kind: "income"; readonly seat: SeatNumber; readonly income: number }
  | { readonly kind: "support"; readonly seat: SeatNumber; readonly funds: number };
