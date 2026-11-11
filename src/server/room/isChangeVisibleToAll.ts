import type { GameState } from "../../rules/GameState";
import { marketGoOf } from "../../rules/marketGoOf";

export function isChangeVisibleToAll(
  before: GameState,
  after: GameState,
  isVoteChangeOnly: boolean,
): boolean {
  return (
    after.turn !== before.turn ||
    after.phase !== before.phase ||
    after.leaveOrder.length !== before.leaveOrder.length ||
    (before.phase === "market" && !isVoteChangeOnly && marketGoOf(before) !== marketGoOf(after))
  );
}
