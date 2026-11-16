import type { AccountBinding } from "../account/AccountBinding";
import type { RankedQueueBinding } from "./RankedQueueBinding";
import { ShownRankedQueue } from "./ShownRankedQueue";

type Props = {
  readonly account: AccountBinding | null;
  readonly ranked: RankedQueueBinding;
  readonly now: number;
};

export function RankedQueueSection(props: Props) {
  const { queue } = props.ranked;
  return queue === null ? null : <ShownRankedQueue {...props} queue={queue} />;
}
