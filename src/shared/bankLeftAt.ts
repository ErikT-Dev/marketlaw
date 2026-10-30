import type { SeatClock } from "./SeatClock";

export function bankLeftAt(clock: SeatClock, at: number): number {
  const charged = Math.min(at, clock.deadline) - clock.freeUntil;
  return clock.bankMs - Math.max(0, charged);
}
