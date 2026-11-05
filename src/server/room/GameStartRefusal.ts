import type { GameStartRejection } from "../lobby/GameStartRejection";

export type GameStartRefusal = GameStartRejection | { readonly kind: "no_answer" };
