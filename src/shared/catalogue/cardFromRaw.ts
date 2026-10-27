import type { Result } from "../Result";
import type { Card } from "./Card";
import type { CardTypeCount } from "./CardTypeCount";
import type { Combo } from "./Combo";
import { comboFromRaw } from "./comboFromRaw";
import { TypeName } from "./TypeName";
import * as v from "valibot";
import type { RawCard } from "./RawCard";

const COMBO_SLOTS = [1, 2, 3, 4] as const;

function typesOf(card: RawCard): Result<ReadonlyArray<CardTypeCount>, ReadonlyArray<string>> {
  const listed = [
    ...[card.type1, card.type2, card.type3, card.type4, card.type5].map((text) => ({
      text,
      count: 1 as const,
    })),
    ...[card.doubleType1, card.doubleType2].map((text) => ({ text, count: 2 as const })),
  ].filter(({ text }) => text !== "");
  const problems = [
    ...listed
      .filter(({ text }) => !v.is(TypeName, text))
      .map(({ text }) => `type "${text}" is not one of the 33 types`),
    ...listed
      .filter(({ text }, index) => listed.findIndex((other) => other.text === text) !== index)
      .map(({ text }) => `type "${text}" is listed twice`),
  ];
  if (listed.length === 0) {
    return { isOk: false, error: ["has no types"] };
  }
  const types = listed.flatMap(({ text, count }) => {
    return v.is(TypeName, text) ? [{ type: text, count }] : [];
  });
  return problems.length > 0 ? { isOk: false, error: problems } : { isOk: true, value: types };
}

function combosOf(
  card: RawCard,
  cardNames: ReadonlyArray<string>,
): Result<ReadonlyArray<Combo>, ReadonlyArray<string>> {
  const results = COMBO_SLOTS.map((slot) => comboFromRaw(card, slot, cardNames));
  const problems = results.flatMap((result) => (result.isOk ? [] : [result.error]));
  const combos = results.flatMap((result) =>
    result.isOk && result.value !== undefined ? [result.value] : [],
  );
  return problems.length > 0 ? { isOk: false, error: problems } : { isOk: true, value: combos };
}

export function cardFromRaw(
  card: RawCard,
  cardNames: ReadonlyArray<string>,
): Result<Card, ReadonlyArray<string>> {
  const types = typesOf(card);
  const combos = combosOf(card, cardNames);
  if (!types.isOk || !combos.isOk) {
    return {
      isOk: false,
      error: [...(types.isOk ? [] : types.error), ...(combos.isOk ? [] : combos.error)],
    };
  }
  return {
    isOk: true,
    value: {
      name: card.cardName,
      sector: card.sector,
      tier: card.tier,
      baseCost: card.cost,
      stats: {
        workforce: card.workforce,
        quality: card.quality,
        satisfaction: card.satisfaction,
        product: card.product,
        distribution: card.sales,
      },
      types: types.value,
      combos: combos.value,
      photo: card.imgName,
    },
  };
}
