import * as v from "valibot";
import type { Result } from "../Result";
import type { Card } from "./Card";
import { cardFromRaw } from "./cardFromRaw";
import { RawCard } from "./RawCard";

const RAW_CARD_LIST = v.array(RawCard);

export function parseCards(raw: unknown): Result<ReadonlyArray<Card>, ReadonlyArray<string>> {
  const parsed = v.safeParse(RAW_CARD_LIST, raw);
  if (!parsed.success) {
    return {
      isOk: false,
      error: parsed.issues.map(
        (issue) => `${v.getDotPath(issue) ?? "card list"}: ${issue.message}`,
      ),
    };
  }
  const cardNames = parsed.output.map((card) => card.cardName);
  const results = parsed.output.map((card) => ({ card, result: cardFromRaw(card, cardNames) }));
  const problems = results.flatMap(({ card, result }) =>
    result.isOk ? [] : result.error.map((problem) => `${card.cardName}: ${problem}`),
  );
  if (problems.length > 0) {
    return { isOk: false, error: problems };
  }
  return {
    isOk: true,
    value: results.flatMap(({ result }) => (result.isOk ? [result.value] : [])),
  };
}
