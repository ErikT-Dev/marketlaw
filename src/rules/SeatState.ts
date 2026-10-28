import type { CardName } from "../shared/catalogue/CardName";
import type { SeatNumber } from "../shared/SeatNumber";
import type { Stats } from "../shared/Stats";
import type { TypeCounts } from "./TypeCounts";

export type SeatState = {
  readonly seat: SeatNumber;
  readonly stats: Stats;
  readonly hand: ReadonlyArray<CardName>;
  readonly city: ReadonlyArray<CardName>;
  readonly drawnThisPhase: ReadonlyArray<CardName>;
  readonly gainedTypes: TypeCounts;
  readonly buildPasses: number;
  readonly buildPassesBought: number;
  readonly hasPlayedThisTurn: boolean;
  readonly hasSkippedBuild: boolean;
  readonly actionsThisTurn: number;
  readonly isDone: boolean;
  readonly hasLeft: boolean;
  readonly timeBankMs: number;
};
