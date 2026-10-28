import type { CardName } from "./catalogue/CardName";

export type ClaimedCombo = {
  readonly card: CardName;
  readonly combo: number;
  readonly times: number;
};
