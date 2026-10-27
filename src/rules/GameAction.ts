import type { CardName } from "../shared/catalogue/CardName";
import type { SeatNumber } from "../shared/SeatNumber";

export type GameAction =
  | { readonly type: "play_card"; readonly seat: SeatNumber; readonly card: CardName }
  | {
      readonly type: "sell";
      readonly seat: SeatNumber;
      readonly cards: readonly [CardName, ...CardName[]];
    }
  | { readonly type: "end_turn"; readonly seat: SeatNumber };
