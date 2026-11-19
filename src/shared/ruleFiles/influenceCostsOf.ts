import type { Result } from "../Result";
import type { StatAmounts } from "../StatAmounts";
import { addedAmounts } from "./addedAmounts";
import { amountOf } from "./amountOf";
import type { RuleFileProblem } from "./RuleFileProblem";
import { statKeyOfWord } from "./statKeyOfWord";

type Costs = { readonly costs: StatAmounts; readonly isPriceRising: boolean };

const PAY = "pay ";
const RISING_PRICE_WORDS = "1 more each time";

function withCost(
  costs: Costs,
  part: string,
  isLast: boolean,
  line: number,
): Result<Costs, RuleFileProblem> {
  if (part === RISING_PRICE_WORDS) {
    return isLast
      ? { isOk: true, value: { ...costs, isPriceRising: true } }
      : { isOk: false, error: { line, word: part, message: `"${RISING_PRICE_WORDS}" comes last` } };
  }
  const amount = amountOf(part, line);
  if (!amount.isOk) {
    return amount;
  }
  const stat = statKeyOfWord(amount.value.words);
  if (stat === null) {
    return { isOk: false, error: { line, word: amount.value.words, message: "unknown stat" } };
  }
  return {
    isOk: true,
    value: { ...costs, costs: addedAmounts(costs.costs, stat, amount.value.count) },
  };
}

export function influenceCostsOf(payText: string, line: number): Result<Costs, RuleFileProblem> {
  if (!payText.startsWith(PAY)) {
    return {
      isOk: false,
      error: { line, word: payText, message: `the costs start with "${PAY}"` },
    };
  }
  const parts = payText.slice(PAY.length).split(", ");
  return parts.reduce<Result<Costs, RuleFileProblem>>(
    (costs, part, index) =>
      costs.isOk ? withCost(costs.value, part, index === parts.length - 1, line) : costs,
    { isOk: true, value: { costs: {}, isPriceRising: false } },
  );
}
