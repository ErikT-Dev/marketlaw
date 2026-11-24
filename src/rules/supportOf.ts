import type { SeatState } from "./SeatState";

const WORTH_BEHIND_PER_SUPPORT_STEP = 100;
const FUNDS_PER_SUPPORT_STEP = 10;

export function supportOf(seat: SeatState, seats: ReadonlyArray<SeatState>): number {
  const others = seats.filter((other) => other.departure === null && other.seat !== seat.seat);
  if (seat.departure !== null || others.length === 0) {
    return 0;
  }
  const highest = Math.max(...others.map((other) => other.worthGained));
  return (
    FUNDS_PER_SUPPORT_STEP *
    Math.floor(Math.max(0, highest - seat.worthGained) / WORTH_BEHIND_PER_SUPPORT_STEP)
  );
}
