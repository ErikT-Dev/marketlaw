import type { PlayerId } from "../../shared/PlayerId";

export type RankingViewer =
  | { readonly kind: "logged_out" }
  | { readonly kind: "guest" }
  | { readonly kind: "registered"; readonly playerId: PlayerId };
