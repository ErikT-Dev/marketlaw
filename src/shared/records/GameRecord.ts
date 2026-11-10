import type { TypeName } from "../catalogue/TypeName";
import type { SeatNumber } from "../SeatNumber";
import type { SeatRecord } from "./SeatRecord";

export type GameRecord = {
  readonly turns: number;
  readonly winner: SeatNumber;
  readonly bonusTypes: ReadonlyArray<TypeName>;
  readonly seats: ReadonlyArray<SeatRecord>;
};
