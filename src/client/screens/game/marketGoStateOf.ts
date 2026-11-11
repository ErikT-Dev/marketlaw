import type { OwnSeatView } from "../../../shared/OwnSeatView";
import type { PlayerView } from "../../../shared/PlayerView";
import type { MarketGoState } from "./MarketGoState";
import { playerNameOf } from "./playerNameOf";

export function marketGoStateOf(
  view: PlayerView,
  seat: OwnSeatView,
  playerNames: ReadonlyArray<string>,
): MarketGoState {
  if (seat.turnDrawRejection === null && !seat.hasHadMarketGo) {
    return {
      kind: "your_go",
      isMarketplaceEmpty: seat.marketCardRejection === "marketplace_empty",
    };
  }
  const goIndex = view.playerOrder.findIndex((candidate) => candidate === view.marketGo);
  const ownIndex = view.playerOrder.findIndex((candidate) => candidate === seat.seat);
  const before = goIndex < 0 || ownIndex < goIndex ? [] : view.playerOrder.slice(goIndex, ownIndex);
  return {
    kind: "waiting",
    goName: view.marketGo === null ? "" : playerNameOf(playerNames, view.marketGo),
    namesBefore: before.map((seatNumber) => playerNameOf(playerNames, seatNumber)),
  };
}
