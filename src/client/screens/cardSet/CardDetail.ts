import type { Card } from "../../../shared/catalogue/Card";
import type { TypeName } from "../../../shared/catalogue/TypeName";
import type { CardStatAmount } from "./CardStatAmount";

export type CardDetail = {
  readonly card: Card;
  readonly gives: ReadonlyArray<CardStatAmount>;
  readonly usesUp: ReadonlyArray<CardStatAmount>;
  readonly types: ReadonlyArray<TypeName>;
  readonly doubleTypes: ReadonlyArray<TypeName>;
};
