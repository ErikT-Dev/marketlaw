import type { ActionIntent } from "../shared/protocol/ActionIntent";

export type ChaosMove =
  | { readonly kind: "intent"; readonly intent: ActionIntent }
  | { readonly kind: "stale"; readonly intent: ActionIntent }
  | { readonly kind: "repeat" }
  | { readonly kind: "raw"; readonly text: string };
