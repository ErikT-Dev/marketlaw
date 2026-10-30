import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { PlayerView } from "../../../shared/PlayerView";
import { TimerChip } from "../../components/TimerChip";
import { LiveBankChip } from "./LiveBankChip";
import { playerNameOf } from "./playerNameOf";
import styles from "./GameTopBar.module.css";
import { useServerNow } from "./useServerNow";

type Props = {
  readonly view: PlayerView;
  readonly seat: OwnSeatView;
  readonly playerNames: ReadonlyArray<string>;
};

const LOW_TIME_MS = 30_000;

function decisionOf(view: PlayerView, seat: OwnSeatView, playerNames: ReadonlyArray<string>) {
  if (view.phase === "market") {
    const goSeat = view.seats.find((candidate) => candidate.seat === view.marketGo);
    const label =
      goSeat?.seat === seat.seat
        ? "Your go"
        : `Go: ${playerNameOf(playerNames, goSeat?.seat ?? 1)}`;
    return goSeat?.clock === null || goSeat === undefined
      ? null
      : { label, deadline: goSeat.clock.deadline };
  }
  return seat.clock === null ? null : { label: "Time left", deadline: seat.clock.deadline };
}

export function YourClock({ view, seat, playerNames }: Props) {
  const now = useServerNow();
  const decision = decisionOf(view, seat, playerNames);
  const leftMs = decision === null ? 0 : Math.max(0, decision.deadline - now);
  return (
    <div className={styles["clock"]}>
      {decision === null ? null : (
        <TimerChip
          label={decision.label}
          ms={leftMs}
          state={leftMs <= LOW_TIME_MS ? "low" : "normal"}
        />
      )}
      <LiveBankChip timeBankMs={seat.timeBankMs} clock={seat.clock} label="Bank" />
    </div>
  );
}
