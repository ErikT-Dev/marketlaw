import type { RandomKind } from "./RandomKind.ts";

export type RandomEntry = {
  readonly kind: RandomKind;
  readonly value: unknown;
};
