import { STAT_KEYS } from "../../shared/STAT_KEYS";
import type { StatAmounts } from "../../shared/StatAmounts";
import { StatChip } from "./StatChip";

type Props = {
  readonly amounts: StatAmounts;
};

export function StatAmountsIcons({ amounts }: Props) {
  const shown = Object.entries(amounts).flatMap(([name, amount]) => {
    const stat = STAT_KEYS.find((key) => key === name);
    return stat === undefined ? [] : [{ stat, amount }];
  });
  return (
    <>
      {shown.map(({ stat, amount }, index) => (
        <span key={stat}>
          {index === 0 ? null : " + "}
          <StatChip stat={stat} value={amount} />
        </span>
      ))}
    </>
  );
}
