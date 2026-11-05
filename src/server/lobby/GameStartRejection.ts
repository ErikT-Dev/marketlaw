import type { PlayerOverLimit } from "./PlayerOverLimit";

export type GameStartRejection =
  | { readonly kind: "players_over_limit"; readonly players: ReadonlyArray<PlayerOverLimit> }
  | { readonly kind: "site_game_limit" };
