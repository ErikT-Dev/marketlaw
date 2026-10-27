import type { Card } from "../../src/shared/catalogue/Card.ts";
import { parseCards } from "../../src/shared/catalogue/parseCards.ts";

const CARD_COUNT = 240;
const CARDS_PER_SECTOR_AND_TIER = 20;
const SECTORS = ["Residential", "Industry", "Service", "Public"] as const;
const TIERS = [1, 2, 3] as const;
const BASE_COST_BY_TIER = {
  1: { lowest: 3, highest: 6 },
  2: { lowest: 7, highest: 9 },
  3: { lowest: 11, highest: 13 },
} as const;

function countProblems(cards: ReadonlyArray<Card>): ReadonlyArray<string> {
  const problems = cards.length === CARD_COUNT ? [] : [`${cards.length} cards, not ${CARD_COUNT}`];
  const groups = SECTORS.flatMap((sector) => TIERS.map((tier) => ({ sector, tier })));
  return [
    ...problems,
    ...groups.flatMap(({ sector, tier }) => {
      const count = cards.filter((card) => card.sector === sector && card.tier === tier).length;
      return count === CARDS_PER_SECTOR_AND_TIER
        ? []
        : [`${count} tier ${tier} ${sector} cards, not ${CARDS_PER_SECTOR_AND_TIER}`];
    }),
  ];
}

function uniquenessProblems(cards: ReadonlyArray<Card>): ReadonlyArray<string> {
  const names = cards.map((card) => card.name);
  const ids = cards.map((card) => card.id);
  return [
    ...names
      .filter((name, index) => names.indexOf(name) !== index)
      .map((name) => `"${name}" is listed twice`),
    ...ids
      .filter((id, index) => ids.indexOf(id) !== index)
      .map((id) => `card id ${id} is used twice`),
  ];
}

function tierProblems(card: Card): ReadonlyArray<string> {
  const { lowest, highest } = BASE_COST_BY_TIER[card.tier];
  const costProblem =
    card.baseCost >= lowest && card.baseCost <= highest
      ? []
      : [
          `${card.name}: base cost ${card.baseCost} is outside ${lowest}-${highest} for tier ${card.tier}`,
        ];
  const output =
    card.sector === "Industry"
      ? { stat: "product", value: card.stats.product }
      : card.sector === "Service"
        ? { stat: "distribution", value: card.stats.distribution }
        : undefined;
  const outputProblem =
    output === undefined || output.value === card.tier
      ? []
      : [`${card.name}: ${output.stat} ${output.value} is not ${card.tier} for tier ${card.tier}`];
  return [...costProblem, ...outputProblem];
}

export function checkCardData(cardList: unknown): ReadonlyArray<string> {
  const parsed = parseCards(cardList);
  if (!parsed.isOk) {
    return parsed.error;
  }
  return [
    ...countProblems(parsed.value),
    ...uniquenessProblems(parsed.value),
    ...parsed.value.flatMap(tierProblems),
  ];
}
