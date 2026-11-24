import type { MainPhaseLogEntry } from "../../../shared/MainPhaseLogEntry";
import { tradeOf } from "../../../shared/ruleFiles/tradeOf";
import type { StatAmounts } from "../../../shared/StatAmounts";
import { STAT_KEYS } from "../../../shared/STAT_KEYS";
import type { TradeName } from "../../../shared/TradeName";
import type { IconText } from "../../components/IconText";
import type { IconTextPart } from "../../components/IconTextPart";
import { playerNameOf } from "./playerNameOf";
import { PROJECT_TITLES } from "./PROJECT_TITLES";

type StatPart = Extract<IconTextPart, { readonly stat: unknown }>;

function statParts(amounts: StatAmounts): ReadonlyArray<StatPart> {
  return STAT_KEYS.flatMap((stat) => {
    const value = amounts[stat];
    return value === undefined ? [] : [{ stat, value }];
  });
}

function joinedParts(parts: ReadonlyArray<IconTextPart>): ReadonlyArray<IconTextPart> {
  return parts.flatMap((part, index): ReadonlyArray<IconTextPart> =>
    index === 0 ? [part] : [" + ", part],
  );
}

function tradeParts(tradeName: TradeName): ReadonlyArray<IconTextPart> {
  const { costs, gains, buildPasses, isPriceRising } = tradeOf(tradeName);
  const paid = isPriceRising ? statParts(costs).map(({ stat }) => ({ stat })) : statParts(costs);
  const passes = buildPasses > 0 ? [{ stat: "buildPasses" as const, value: buildPasses }] : [];
  return [...joinedParts(paid), " → ", ...joinedParts([...statParts(gains), ...passes])];
}

export function mainPhaseLogText(
  entry: MainPhaseLogEntry,
  playerNames: ReadonlyArray<string>,
): IconText {
  const name = playerNameOf(playerNames, entry.seat);
  switch (entry.kind) {
    case "played":
      return `${name} played ${entry.card}`;
    case "completed_quest":
      return `${name} completed the quest ${entry.quest}`;
    case "completed_project":
      return [
        `${name} completed the project ${PROJECT_TITLES[entry.project]} (`,
        { stat: entry.project },
        ")",
      ];
    case "influence":
      return [`${name} used influence: `, ...tradeParts(entry.trade)];
    case "redrew":
      return `${name} redrew their starting hand ${String(entry.times)} ${entry.times === 1 ? "time" : "times"}`;
    case "income_gained":
      return [`${name} gained income: `, { stat: "income", value: `+${String(entry.income)}` }];
    case "support":
      return [`${name} got Support: `, { stat: "funds", value: `+${String(entry.funds)}` }];
  }
}
