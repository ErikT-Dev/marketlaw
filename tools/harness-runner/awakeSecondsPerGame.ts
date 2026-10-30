import { TURN_LIMIT } from "../../src/shared/TURN_LIMIT.ts";
import type { SimulationSummary } from "../simulator/SimulationSummary.ts";

export function awakeSecondsPerGame(simulation: SimulationSummary): number {
  return simulation.threePlayerTurns === 0
    ? 0
    : Math.ceil(
        ((simulation.threePlayerAwakeMs / simulation.threePlayerTurns) * TURN_LIMIT) / 1000,
      );
}
