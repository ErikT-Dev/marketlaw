import type { GamePhase } from "../../../shared/GamePhase";

export const PHASE_NAMES: Readonly<Record<GamePhase, string>> = {
  market: "Market phase",
  main: "Main phase",
  ended: "Game over",
};
