import type { CardName } from "../shared/catalogue/CardName";
import type { ComboGain } from "../shared/catalogue/ComboGain";

export type ReadyCombo = {
  readonly card: CardName;
  readonly combo: number;
  readonly times: number;
  readonly gains: ComboGain;
};
