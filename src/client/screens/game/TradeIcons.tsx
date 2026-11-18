import { tradeOf } from "../../../shared/ruleFiles/tradeOf";
import type { TradeName } from "../../../shared/TradeName";
import { StatAmountsIcons } from "../../components/StatAmountsIcons";
import { StatChip } from "../../components/StatChip";
import { tradeCostsShown } from "./tradeCostsShown";

type Props = {
  readonly trade: TradeName;
  readonly buildPassPrice: number;
};

export function TradeIcons({ trade, buildPassPrice }: Props) {
  const shown = tradeOf(trade);
  const hasStatGains = Object.keys(shown.gains).length > 0;
  return (
    <span>
      <StatAmountsIcons amounts={tradeCostsShown(shown, buildPassPrice)} />
      {" → "}
      <StatAmountsIcons amounts={shown.gains} />
      {shown.buildPasses > 0 ? (
        <span>
          {hasStatGains ? " + " : null}
          <StatChip stat="buildPasses" value={shown.buildPasses} />
        </span>
      ) : null}
    </span>
  );
}
