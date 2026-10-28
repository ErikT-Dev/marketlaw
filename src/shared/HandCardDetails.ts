import type { CardName } from "./catalogue/CardName";
import type { ReasonCode } from "./ReasonCode";

export type HandCardDetails = {
  readonly card: CardName;
  readonly realCost: number;
  readonly sameSectorAndTierInCity: number;
  readonly playRejection: ReasonCode | null;
};
