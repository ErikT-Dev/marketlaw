import type { CardName } from "../shared/catalogue/CardName";
import type { Kind } from "../shared/catalogue/Kind";
import type { Tier } from "../shared/catalogue/Tier";
import type { QuestName } from "../shared/catalogue/QuestName";
import type { ProjectName } from "../shared/ProjectName";
import type { SeatNumber } from "../shared/SeatNumber";
import type { TradeName } from "../shared/TradeName";
import type { TurnDrawChoice } from "../shared/TurnDrawChoice";

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
    }
  | { readonly type: "complete_quest"; readonly seat: SeatNumber; readonly quest: QuestName }
  | { readonly type: "influence"; readonly seat: SeatNumber; readonly trade: TradeName }
  | {
      readonly type: "draw_action";
      readonly seat: SeatNumber;
      readonly kind: Kind;
      readonly tier: Tier;
    }
  | { readonly type: "undo"; readonly seat: SeatNumber }
  | { readonly type: "time_out"; readonly seat: SeatNumber }
  | { readonly type: "pause_game"; readonly seat: SeatNumber }
  | { readonly type: "resume_game"; readonly seat: SeatNumber }
  | { readonly type: "turn_draw"; readonly seat: SeatNumber; readonly choice: TurnDrawChoice };
