import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { PlayerView } from "../../../shared/PlayerView";
import { OutOfTimeChip } from "../../components/OutOfTimeChip";
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

type ShownDecision = { readonly label: string; readonly deadline: number };

const LOW_TIME_MS = 30_000;

function marketGoDecisionOf(
  view: PlayerView,
  seat: OwnSeatView,
  playerNames: ReadonlyArray<string>,
): ShownDecision | null {
  const goSeat = view.seats.find((candidate) => candidate.seat === view.marketGo);
  if (goSeat === undefined || goSeat.clock === null) {
    return null;
  }
  const label =
    goSeat.seat === seat.seat ? "Your go" : `Go: ${playerNameOf(playerNames, goSeat.seat)}`;
  return { label, deadline: goSeat.clock.deadline };
}

function ownDecisionOf(view: PlayerView, seat: OwnSeatView): ShownDecision | null {
  return view.phase === "market" || seat.clock === null
    ? null
    : { label: "Time left", deadline: seat.clock.deadline };
}

export function YourClock({ view, seat, playerNames }: Props) {
  const now = useServerNow();
  const decisions = [ownDecisionOf(view, seat), marketGoDecisionOf(view, seat, playerNames)];
  return (
    <div className={styles["clock"]}>
      {view.phase !== "market" && seat.isOutOfTime ? <OutOfTimeChip /> : null}
      {decisions.map((decision) => {
        if (decision === null) {
          return null;
        }
        const leftMs = Math.max(0, decision.deadline - now);
        return (
          <TimerChip
            key={decision.label}
            label={decision.label}
            ms={leftMs}
            state={leftMs <= LOW_TIME_MS ? "low" : "normal"}
          />
        );
      })}
      <LiveBankChip timeBankMs={seat.timeBankMs} clock={seat.clock} label="Bank" />
    </div>
  );
}
