import type { PlayerId } from "../../shared/PlayerId";
import type { Identity } from "../room/Identity";
import { iconOfOlderAccount } from "./iconOfOlderAccount";

export function identityWithDefaultIcon(playerId: PlayerId, name: string): Identity {
  return { playerId, name, icon: iconOfOlderAccount(playerId) };
}
