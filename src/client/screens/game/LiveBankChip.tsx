import { bankLeftAt } from "../../../shared/bankLeftAt";
import type { SeatClock } from "../../../shared/SeatClock";
import { TimerChip } from "../../components/TimerChip";
import { useServerNow } from "./useServerNow";

type Props = {
  readonly timeBankMs: number;
  readonly clock: SeatClock | null;
  readonly label: string;
};

export function LiveBankChip({ timeBankMs, clock, label }: Props) {
  const now = useServerNow();
  return (
    <TimerChip
      label={label}
      ms={clock === null ? timeBankMs : bankLeftAt(clock, now)}
      state="normal"
    />
  );
}
