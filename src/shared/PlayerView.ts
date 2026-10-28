import type { CardName } from "./catalogue/CardName";
import type { TypeName } from "./catalogue/TypeName";
import type { DrawLogEntry } from "./DrawLogEntry";
import type { GamePhase } from "./GamePhase";
import type { MarketplaceSlot } from "./MarketplaceSlot";
import type { OtherSeatView } from "./OtherSeatView";
import type { OwnSeatView } from "./OwnSeatView";
import type { QuestOnTable } from "./QuestOnTable";
import type { SeatNumber } from "./SeatNumber";

export type PlayerView = {
  readonly seat: SeatNumber;
  readonly turn: number;
  readonly phase: GamePhase;
  readonly seats: ReadonlyArray<OwnSeatView | OtherSeatView>;
  readonly deckCount: number;
  readonly discard: ReadonlyArray<CardName>;
  readonly marketplace: ReadonlyArray<MarketplaceSlot>;
  readonly quests: ReadonlyArray<QuestOnTable>;
  readonly bonusTypes: ReadonlyArray<TypeName>;
  readonly doneOrder: ReadonlyArray<SeatNumber>;
  readonly playerOrder: ReadonlyArray<SeatNumber>;
  readonly drawLog: ReadonlyArray<DrawLogEntry>;
};
