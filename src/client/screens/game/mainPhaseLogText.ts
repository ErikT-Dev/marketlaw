import type { MainPhaseLogEntry } from "../../../shared/MainPhaseLogEntry";
import type { StatAmounts } from "../../../shared/StatAmounts";
import { STAT_KEYS } from "../../../shared/STAT_KEYS";
import type { TradeName } from "../../../shared/TradeName";
import { TRADES } from "../../../shared/TRADES";
import type { IconText } from "../../components/IconText";
import type { IconTextPart } from "../../components/IconTextPart";
import { playerNameOf } from "./playerNameOf";
import { PROJECT_TITLES } from "./PROJECT_TITLES";

function amountParts(amounts: StatAmounts): ReadonlyArray<IconTextPart> {
  return STAT_KEYS.flatMap((stat) => {
    const value = amounts[stat];
    return value === undefined ? [] : [{ stat, value }];
  }).flatMap((part, index): ReadonlyArray<IconTextPart> => (index === 0 ? [part] : [" + ", part]));
}

function tradeParts(trade: TradeName): ReadonlyArray<IconTextPart> {
  const { costs, gains, doesGiveBuildPass } = TRADES[trade];
  const paid: ReadonlyArray<IconTextPart> =
    trade === "buy_build_pass" ? [{ stat: "funds" }] : amountParts(costs);
  const got: ReadonlyArray<IconTextPart> = doesGiveBuildPass
    ? [{ stat: "buildPasses", value: 1 }]
    : amountParts(gains);
  return [...paid, " → ", ...got];
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
  }
}
