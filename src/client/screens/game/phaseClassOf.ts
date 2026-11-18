import type { PlayerView } from "../../../shared/PlayerView";

export function phaseClassOf(view: PlayerView): string {
  if (view.phase !== "market") {
    return "phase";
  }
  return view.marketGo === view.seat ? "yourGoPhase" : "marketPhase";
}
