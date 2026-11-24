import { combosClaimedCountOf } from "../../../shared/combosClaimedCountOf";
import type { OtherSeatView } from "../../../shared/OtherSeatView";
import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { SummaryCounts } from "../../../shared/SummaryCounts";
import { typeTotalOf } from "../../../shared/typeTotalOf";

function combosClaimedOf(seat: OwnSeatView | OtherSeatView): number {
  return seat.kind === "own"
    ? seat.combos.reduce((total, { claimedTimes }) => total + claimedTimes, 0)
    : combosClaimedCountOf(seat.combosClaimed);
}

export function summaryCountsOfSeat(seat: OwnSeatView | OtherSeatView): SummaryCounts {
  return {
    questsCompleted: seat.questsCompleted.length,
    types: typeTotalOf(seat.typeCounts),
    combosClaimed: combosClaimedOf(seat),
    worthGained: seat.worthGained,
  };
}
