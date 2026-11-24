import type { InfluenceAction } from "../../../shared/ruleFiles/InfluenceAction";
import { RISING_PRICE_STEP } from "../../../shared/ruleFiles/RISING_PRICE_STEP";
import { amountsText } from "../game/amountsText";
import { tradeLabel } from "../game/tradeLabel";

function actionText(action: InfluenceAction): string {
  switch (action.kind) {
    case "trade":
      return action.isPriceRising
        ? `${tradeLabel(action.name, action.costs.funds ?? 0)} (costs ${String(RISING_PRICE_STEP)} more funds each time you buy one)`
        : tradeLabel(action.name, 0);
    case "draw":
      return `${amountsText(action.costs)} → draw a tier ${String(action.tier)} card of a kind you choose`;
  }
}

export function influenceActionsTableText(actions: ReadonlyArray<InfluenceAction>): string {
  return [
    "| Action | Times per game |",
    "|---|---|",
    ...actions.map(
      (action) =>
        `| ${actionText(action)} | ${action.limitPerGame === null ? "any" : String(action.limitPerGame)} |`,
    ),
  ].join("\n");
}
