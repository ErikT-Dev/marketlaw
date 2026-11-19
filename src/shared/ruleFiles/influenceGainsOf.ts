import * as v from "valibot";
import { Tier } from "../catalogue/Tier";
import type { Result } from "../Result";
import type { StatAmounts } from "../StatAmounts";
import { addedAmounts } from "./addedAmounts";
import { amountOf } from "./amountOf";
import type { RuleFileProblem } from "./RuleFileProblem";
import { statKeyOfWord } from "./statKeyOfWord";

type Gains =
  | { readonly kind: "get"; readonly gains: StatAmounts; readonly buildPasses: number }
  | { readonly kind: "draw"; readonly tier: Tier };

type GetGains = Extract<Gains, { readonly kind: "get" }>;

const GET = "get ";
const DRAW = /^draw a tier (\d) card of a chosen kind$/;
const BUILD_PASS_WORDS = ["build pass", "build passes"];

function withGain(gains: GetGains, part: string, line: number): Result<GetGains, RuleFileProblem> {
  const amount = amountOf(part, line);
  if (!amount.isOk) {
    return amount;
  }
  const { count, words } = amount.value;
  if (BUILD_PASS_WORDS.includes(words)) {
    return { isOk: true, value: { ...gains, buildPasses: gains.buildPasses + count } };
  }
  const stat = statKeyOfWord(words);
  return stat === null
    ? { isOk: false, error: { line, word: words, message: "unknown stat" } }
    : { isOk: true, value: { ...gains, gains: addedAmounts(gains.gains, stat, count) } };
}

export function influenceGainsOf(
  gainText: string,
  name: string,
  line: number,
): Result<Gains, RuleFileProblem> {
  const tier = Number(DRAW.exec(gainText)?.[1]);
  if (v.is(Tier, tier)) {
    return { isOk: true, value: { kind: "draw", tier } };
  }
  if (!gainText.startsWith(GET)) {
    return { isOk: false, error: { line, word: name, message: "needs new code" } };
  }
  return gainText
    .slice(GET.length)
    .split(", ")
    .reduce<Result<GetGains, RuleFileProblem>>(
      (gains, part) => (gains.isOk ? withGain(gains.value, part, line) : gains),
      { isOk: true, value: { kind: "get", gains: {}, buildPasses: 0 } },
    );
}
