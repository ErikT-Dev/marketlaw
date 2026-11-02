import { TYPE_POINTS } from "../shared/catalogue/TYPE_POINTS";
import type { TypeName } from "../shared/catalogue/TypeName";
import type { SeatState } from "./SeatState";
import { typeCountsOf } from "./typeCountsOf";

export function bonusTypePointsOf(seat: SeatState, bonusTypes: ReadonlyArray<TypeName>): number {
  const counts = typeCountsOf(seat);
  return bonusTypes.reduce((points, type) => points + (counts[type] ?? 0) * TYPE_POINTS[type], 0);
}
