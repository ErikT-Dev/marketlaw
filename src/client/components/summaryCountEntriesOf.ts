import type { SummaryCounts } from "../../shared/SummaryCounts";
import type { SummaryCountEntry } from "./SummaryCountEntry";
import { tenthsShown } from "./tenthsShown";

export function summaryCountEntriesOf(counts: SummaryCounts): ReadonlyArray<SummaryCountEntry> {
  return [
    { letter: "Q", count: counts.questsCompleted, label: "Quests completed" },
    { letter: "T", count: counts.types, label: "Types" },
    { letter: "C", count: counts.combosClaimed, label: "Combos claimed" },
    { letter: "F", count: tenthsShown(counts.worthGained), label: "Total worth gained" },
  ];
}
