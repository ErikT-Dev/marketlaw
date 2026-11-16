import type { QuestNeed } from "../../../shared/catalogue/QuestNeed";
import type { NegativeStat } from "../../../shared/NegativeStat";

export function negativeStatsShownIn(
  negativeStats: ReadonlyArray<NegativeStat>,
  needs: ReadonlyArray<QuestNeed>,
  isViewer: boolean,
): ReadonlyArray<NegativeStat> {
  if (isViewer) {
    return negativeStats;
  }
  return negativeStats.filter(({ stat }) =>
    needs.some((need) => need.kind === "stat" && need.stat === stat),
  );
}
