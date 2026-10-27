import type { TierChances } from "./TierChances";

function between0And1(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function tierChancesByTurn(turn: number): TierChances {
  const completedTurns = turn - 1;
  const tier1 = between0And1(1 - completedTurns / 14);
  const tier3 = between0And1(completedTurns / 17 - 0.52);
  return { 1: tier1, 2: between0And1(1 - tier1 - tier3), 3: tier3 };
}
