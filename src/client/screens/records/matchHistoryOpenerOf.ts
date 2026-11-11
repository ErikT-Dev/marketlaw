import type { PlayerId } from "../../../shared/PlayerId";
import { matchHistoryHash } from "../../components/matchHistoryHash";

export function matchHistoryOpenerOf(playerId: PlayerId | null): (() => void) | null {
  return playerId === null
    ? null
    : () => {
        window.location.assign(matchHistoryHash(playerId));
      };
}
