import type { Tier } from "../shared/catalogue/Tier";
import type { DrawCause } from "../shared/DrawCause";
import type { SeatNumber } from "../shared/SeatNumber";
import type { DrawTarget } from "./DrawTarget";

export type DrawForSeat = {
  readonly seat: SeatNumber;
  readonly cause: DrawCause;
  readonly target: DrawTarget;
  readonly tier: Tier;
};
