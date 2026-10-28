import type { CardName } from "./catalogue/CardName";

export type ComboStatus = {
  readonly card: CardName;
  readonly combo: number;
  readonly claimedTimes: number;
  readonly readyTimes: number;
};
