import type { CardName } from "./catalogue/CardName";
import type { ClaimedCombo } from "./ClaimedCombo";
import type { ProjectName } from "./ProjectName";
import type { SeatTypeCounts } from "./SeatTypeCounts";
import type { SeatNumber } from "./SeatNumber";
import type { Stats } from "./Stats";

export type OtherSeatView = {
  readonly kind: "other";
  readonly seat: SeatNumber;
  readonly stats: Stats;
  readonly handCount: number;
  readonly typeCounts: SeatTypeCounts;
  readonly combosClaimed: ReadonlyArray<ClaimedCombo>;
  readonly projects: ReadonlyArray<ProjectName>;
  readonly city: ReadonlyArray<CardName>;
  readonly buildPasses: number;
  readonly isDone: boolean;
  readonly hasLeft: boolean;
  readonly timeBankMs: number;
};
