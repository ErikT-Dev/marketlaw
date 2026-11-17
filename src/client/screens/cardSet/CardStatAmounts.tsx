import { StatChip } from "../../components/StatChip";
import type { CardStatAmount } from "./CardStatAmount";

type Props = {
  readonly amounts: ReadonlyArray<CardStatAmount>;
  readonly sign: "+" | "−";
};

export function CardStatAmounts({ amounts, sign }: Props) {
  return amounts.length === 0
    ? "nothing"
    : amounts.map(({ stat, amount }) => (
        <StatChip key={stat} stat={stat} value={`${sign}${String(amount)}`} />
      ));
}
