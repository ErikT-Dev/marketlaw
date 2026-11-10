import type { LinkedEmailKind } from "./LinkedEmailKind";

export type AccountEmailMessage =
  | { readonly kind: "already_in_use"; readonly to: string }
  | { readonly kind: LinkedEmailKind; readonly to: string; readonly token: string };
