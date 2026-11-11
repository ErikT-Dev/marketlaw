import type { CardName } from "../../../shared/catalogue/CardName";

export type LookedAtCard = {
  readonly card: CardName;
  readonly place: "marketplace" | "city";
};
