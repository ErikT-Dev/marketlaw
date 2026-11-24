import { combosClaimedCountOf } from "../shared/combosClaimedCountOf";
import type { SummaryCounts } from "../shared/SummaryCounts";
import { typeTotalOf } from "../shared/typeTotalOf";
import type { SeatState } from "./SeatState";
import { typeCountsOf } from "./typeCountsOf";

export function summaryCountsOf(seat: SeatState): SummaryCounts {
  return {
    questsCompleted: seat.questsCompleted.length,
    types: typeTotalOf(typeCountsOf(seat)),
    combosClaimed: combosClaimedCountOf(seat.combosClaimed),
    worthGained: seat.worthGained,
  };
}
