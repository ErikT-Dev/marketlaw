import { pickTier } from "../../src/rules/pickTier.ts";
import { seededRandom } from "../../src/rules/seededRandom.ts";
import type { TierChances } from "../../src/rules/TierChances.ts";
import { tierChancesByTurn } from "../../src/rules/tierChancesByTurn.ts";

const TURNS = [...Array(40).keys()].map((index) => index + 1);
const ALLOWED_DIFFERENCE = 0.01;
const TIERS = [1, 2, 3] as const;

function sharesInRule(turn: number): TierChances {
  const finishedTurns = turn - 1;
  const tier1 = Math.max(0, 1 - finishedTurns / 14);
  const tier3 = Math.min(1, Math.max(0, finishedTurns / 17 - 0.52));
  return { 1: tier1, 2: 1 - tier1 - tier3, 3: tier3 };
}

function sharesDrawn(turn: number, draws: number): TierChances {
  const random = seededRandom(turn, 0);
  const chances = tierChancesByTurn(turn);
  const counts = { 1: 0, 2: 0, 3: 0 };
  for (let draw = 0; draw < draws; draw += 1) {
    counts[pickTier(chances, random)] += 1;
  }
  return { 1: counts[1] / draws, 2: counts[2] / draws, 3: counts[3] / draws };
}

function percent(share: number): string {
  return `${(share * 100).toFixed(2)}%`;
}

export function checkTierShares(drawsPerTurn: number): ReadonlyArray<string> {
  return TURNS.flatMap((turn) => {
    const expected = sharesInRule(turn);
    const drawn = sharesDrawn(turn, drawsPerTurn);
    return TIERS.filter((tier) => Math.abs(drawn[tier] - expected[tier]) > ALLOWED_DIFFERENCE).map(
      (tier) =>
        `turn ${String(turn)} tier ${String(tier)}: drawn ${percent(drawn[tier])}, R17.10 says ${percent(expected[tier])}`,
    );
  });
}
