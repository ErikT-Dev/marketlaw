import type { GameAction } from "./GameAction";

export type VoteAction = Extract<GameAction, { readonly type: "call_vote" | "vote" }>;
