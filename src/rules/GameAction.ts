import type { CardName } from "../shared/catalogue/CardName";
import type { ProjectName } from "../shared/ProjectName";
import type { SeatNumber } from "../shared/SeatNumber";

export type GameAction =
  | { readonly type: "play_card"; readonly seat: SeatNumber; readonly card: CardName }
  | {
      readonly type: "sell";
      readonly seat: SeatNumber;
      readonly cards: readonly [CardName, ...CardName[]];
    }
  | { readonly type: "end_turn"; readonly seat: SeatNumber }
  | { readonly type: "claim_all"; readonly seat: SeatNumber }
  | {
      readonly type: "complete_project";
      readonly seat: SeatNumber;
      readonly project: ProjectName;
    };
