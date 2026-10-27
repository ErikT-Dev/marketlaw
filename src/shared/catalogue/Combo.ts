import type { CardName } from "./CardName";
import type { ComboGain } from "./ComboGain";
import type { TypeName } from "./TypeName";

export type Combo =
  | { readonly kind: "card_name"; readonly card: CardName; readonly gains: ComboGain }
  | {
      readonly kind: "type_count";
      readonly type: TypeName;
      readonly count: number;
      readonly isInfinite: boolean;
      readonly gains: ComboGain;
    };
