import type { TradeName } from "../../../shared/TradeName";
import { TRADES } from "../../../shared/TRADES";
import { StatAmountsIcons } from "../../components/StatAmountsIcons";
import { StatChip } from "../../components/StatChip";

type Props = {
  readonly trade: TradeName;
  readonly buildPassPrice: number;
};

export function TradeIcons({ trade, buildPassPrice }: Props) {
  const { costs, gains, doesGiveBuildPass } = TRADES[trade];
  return (
    <span>
      {trade === "skip_build" ? (
        "Skip build"
      ) : (
        <StatAmountsIcons
          amounts={trade === "buy_build_pass" ? { funds: buildPassPrice } : costs}
        />
      )}
      {" → "}
      {doesGiveBuildPass ? (
        <StatChip stat="buildPasses" value={1} />
      ) : (
        <StatAmountsIcons amounts={gains} />
      )}
    </span>
  );
}
