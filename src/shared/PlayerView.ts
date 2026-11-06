import type { TypeName } from "./catalogue/TypeName";
import type { DrawLogEntry } from "./DrawLogEntry";
import type { ProjectName } from "./ProjectName";
import type { GamePhase } from "./GamePhase";
import type { GameResult } from "./GameResult";
import type { MarketplaceSlot } from "./MarketplaceSlot";
import type { OtherSeatView } from "./OtherSeatView";
import type { OwnSeatView } from "./OwnSeatView";
import type { QuestPlaceView } from "./QuestPlaceView";
import type { SeatNumber } from "./SeatNumber";

export type PlayerView = {
  readonly seat: SeatNumber;
  readonly turn: number;
  readonly phase: GamePhase;
  readonly firstPlayer: SeatNumber;
  readonly marketGo: SeatNumber | null;
  readonly seats: ReadonlyArray<OwnSeatView | OtherSeatView>;
  readonly deckCount: number;
  readonly discardCount: number;
  readonly marketplace: ReadonlyArray<MarketplaceSlot>;
  readonly quests: ReadonlyArray<QuestPlaceView>;
  readonly bonusTypes: ReadonlyArray<TypeName>;
  readonly doneOrder: ReadonlyArray<SeatNumber>;
  readonly playerOrder: ReadonlyArray<SeatNumber>;
  readonly drawLog: ReadonlyArray<DrawLogEntry>;
  readonly firstCompletions: ReadonlyArray<ProjectName>;
  readonly result: GameResult | null;
};
