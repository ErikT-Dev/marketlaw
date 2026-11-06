import type { CardName } from "../../../shared/catalogue/CardName";
import type { HandChoice } from "./HandChoice";

export type HandSwitch = {
  readonly shown: HandChoice;
  readonly wanted: CardName | null;
  readonly hasWaitedLongEnough: boolean;
};
