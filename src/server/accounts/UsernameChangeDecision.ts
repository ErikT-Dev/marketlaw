import type { ReasonCode } from "../../shared/ReasonCode";

export type UsernameChangeDecision =
  | { readonly kind: "refused"; readonly reason: ReasonCode }
  | { readonly kind: "unchanged" }
  | { readonly kind: "renamed" };
