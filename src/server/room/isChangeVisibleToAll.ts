import type { GameState } from "../../rules/GameState";

export function isChangeVisibleToAll(before: GameState, after: GameState): boolean {
  return (
    after.turn !== before.turn ||
    after.phase !== before.phase ||
    after.leaveOrder.length !== before.leaveOrder.length ||
    before.phase === "market"
  );
}
