import type { SummaryCounts } from "../../shared/SummaryCounts";
import { CountBox } from "./CountBox";
import { summaryCountEntriesOf } from "./summaryCountEntriesOf";

type Props = {
  readonly counts: SummaryCounts;
};

export function SummaryCountBoxes({ counts }: Props) {
  return (
    <>
      {summaryCountEntriesOf(counts).map((entry) => (
        <CountBox key={entry.letter} {...entry} />
      ))}
    </>
  );
}
