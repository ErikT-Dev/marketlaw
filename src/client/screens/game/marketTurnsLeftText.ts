import { MARKET_PHASES_SHOWN } from "../../../shared/MARKET_PHASES_SHOWN";

export function marketTurnsLeftText(phasesShown: number): string {
  const turnsLeft = MARKET_PHASES_SHOWN - phasesShown;
  if (turnsLeft <= 0) {
    return "Leaves next turn";
  }
  return turnsLeft === 1 ? "1 turn left" : `${String(turnsLeft)} turns left`;
}
