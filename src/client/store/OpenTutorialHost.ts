import type { GameHost } from "../../shared/GameHost";
import type { PlayerId } from "../../shared/PlayerId";

export type OpenTutorialHost = (player: PlayerId, token: string) => GameHost;
