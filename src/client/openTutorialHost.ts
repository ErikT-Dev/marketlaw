import type { GameHost } from "../shared/GameHost";
import type { PlayerId } from "../shared/PlayerId";
import { openSocketHost } from "./openSocketHost";

export function openTutorialHost(player: PlayerId, token: string): GameHost {
  return openSocketHost(`/api/tutorials/${player}/socket`, token);
}
