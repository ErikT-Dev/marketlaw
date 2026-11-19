import type { Result } from "../Result";
import { duplicateNameProblems } from "./duplicateNameProblems";
import type { InfluenceAction } from "./InfluenceAction";
import { influenceCostsOf } from "./influenceCostsOf";
import { influenceGainsOf } from "./influenceGainsOf";
import { readRuleFile } from "./readRuleFile";
import type { RuleFileEntry } from "./RuleFileEntry";
import type { RuleFileParts } from "./RuleFileParts";
import type { RuleFileProblem } from "./RuleFileProblem";
import { wholeNumberOf } from "./wholeNumberOf";

const ACTION_NAME = /^[a-z0-9]+(?: [a-z0-9]+)*$/;
const PER_GAME = /^(\S+) per game$/;
const NO_LIMIT = "no limit";

function limitOf(limitText: string, line: number): Result<number | null, RuleFileProblem> {
  if (limitText === NO_LIMIT) {
    return { isOk: true, value: null };
  }
  const limit = wholeNumberOf(PER_GAME.exec(limitText)?.[1] ?? "");
  return limit === null
    ? {
        isOk: false,
        error: { line, word: limitText, message: 'the limit is "N per game" or "no limit"' },
      }
    : { isOk: true, value: limit };
}

function isRisingPriceAllowed(action: InfluenceAction): boolean {
  return (
    action.kind === "trade" &&
    Object.keys(action.costs).every((stat) => stat === "funds") &&
    Object.keys(action.gains).length === 0 &&
    action.buildPasses === 1
  );
}

function needsNewCode(action: InfluenceAction): boolean {
  return action.kind === "draw"
    ? action.limitPerGame !== null
    : action.isPriceRising && !isRisingPriceAllowed(action);
}

function readInfluenceActionLine(
  [name, payText, gainText, limitText]: RuleFileParts,
  line: number,
): Result<InfluenceAction, ReadonlyArray<RuleFileProblem>> {
  const pay = influenceCostsOf(payText, line);
  const gains = influenceGainsOf(gainText, name, line);
  const limitPerGame = limitOf(limitText, line);
  const isNameValid = ACTION_NAME.test(name);
  if (!isNameValid || !pay.isOk || !gains.isOk || !limitPerGame.isOk) {
    const nameProblem = {
      line,
      word: name,
      message: "a name has lower-case letters, digits and spaces",
    };
    return {
      isOk: false,
      error: [
        ...(isNameValid ? [] : [nameProblem]),
        ...[pay, gains, limitPerGame].flatMap((part) => (part.isOk ? [] : [part.error])),
      ],
    };
  }
  const common = {
    name: name.replaceAll(" ", "_"),
    costs: pay.value.costs,
    limitPerGame: limitPerGame.value,
  };
  const action: InfluenceAction =
    gains.value.kind === "draw"
      ? { kind: "draw", ...common, tier: gains.value.tier }
      : {
          kind: "trade",
          ...common,
          gains: gains.value.gains,
          buildPasses: gains.value.buildPasses,
          isPriceRising: pay.value.isPriceRising,
        };
  return needsNewCode(action)
    ? { isOk: false, error: [{ line, word: name, message: "needs new code" }] }
    : { isOk: true, value: action };
}

function drawTierProblems(
  entries: ReadonlyArray<RuleFileEntry<InfluenceAction>>,
): ReadonlyArray<RuleFileProblem> {
  return entries.flatMap(({ line, value }) => {
    const first = entries.find(
      (entry) =>
        entry.value.kind === "draw" && value.kind === "draw" && entry.value.tier === value.tier,
    );
    return first === undefined || first.line === line || value.kind !== "draw"
      ? []
      : [
          {
            line,
            word: value.name,
            message: `a draw action for tier ${value.tier} is already on line ${first.line}`,
          },
        ];
  });
}

function secondRisingLineProblems(
  entries: ReadonlyArray<RuleFileEntry<InfluenceAction>>,
): ReadonlyArray<RuleFileProblem> {
  const risingLines = entries.filter(({ value }) => value.kind === "trade" && value.isPriceRising);
  return risingLines
    .slice(1)
    .map(({ line, value }) => ({ line, word: value.name, message: "needs new code" }));
}

export function readInfluenceActionFile(
  text: string,
): Result<ReadonlyArray<InfluenceAction>, ReadonlyArray<RuleFileProblem>> {
  const actions = readRuleFile(text, readInfluenceActionLine);
  if (!actions.isOk) {
    return actions;
  }
  const problems = [
    ...duplicateNameProblems(actions.value, ({ name }) => name),
    ...drawTierProblems(actions.value),
    ...secondRisingLineProblems(actions.value),
  ];
  return problems.length > 0
    ? { isOk: false, error: problems }
    : { isOk: true, value: actions.value.map(({ value }) => value) };
}
