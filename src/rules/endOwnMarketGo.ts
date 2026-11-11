import type { SeatNumber } from "../shared/SeatNumber";
import { bankLeftAt } from "../shared/bankLeftAt";
import { decisionClockOf } from "./decisionClockOf";
import { endMarketPhase } from "./endMarketPhase";
import type { GameState } from "./GameState";
import { marketGoOf } from "./marketGoOf";
import { updateSeat } from "./updateSeat";
import { withOwnMainPhaseStart } from "./withOwnMainPhaseStart";

export function endOwnMarketGo(
  state: GameState,
  seat: SeatNumber,
  isTurnDrawOpen: boolean,
  at: number,
): GameState {
  const clock = decisionClockOf(state, seat);
  const ended = {
    ...updateSeat(state, seat, (current) => ({
      ...current,
      hasHadMarketGo: true,
      isTurnDrawOpen,
      mainPhaseStartedAt: at,
      drawnThisPhase: [],
      timeBankMs: clock === null ? current.timeBankMs : bankLeftAt(clock, at),
    })),
    clockStartedAt: at,
  };
  const started = withOwnMainPhaseStart(ended, seat);
  return marketGoOf(started) === null ? endMarketPhase(started, at) : started;
}
