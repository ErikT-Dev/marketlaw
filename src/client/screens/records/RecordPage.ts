import type { GameId } from "../../../shared/GameId";
import type { PlayerId } from "../../../shared/PlayerId";

export type RecordPage =
  | { readonly kind: "history"; readonly playerId: PlayerId }
  | { readonly kind: "record"; readonly gameId: GameId };
