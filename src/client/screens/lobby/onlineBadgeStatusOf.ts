import type { PlayerOnlineView } from "../../../shared/protocol/PlayerOnlineView";
import type { PlayerStatus } from "../../components/PlayerStatus";

export function onlineBadgeStatusOf(status: PlayerOnlineView["status"]): PlayerStatus {
  return status === "in_game" ? "inGame" : "online";
}
