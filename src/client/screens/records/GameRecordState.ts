import type { GameRecordView } from "../../../shared/api/GameRecordView";

export type GameRecordState =
  | { readonly kind: "loading" }
  | { readonly kind: "failed" }
  | { readonly kind: "not_found" }
  | { readonly kind: "found"; readonly record: GameRecordView };
