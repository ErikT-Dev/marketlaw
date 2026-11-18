import type { PlayerId } from "../shared/PlayerId";
import type { TutorialRoom } from "./TutorialRoom";

export function tutorialOf(env: Env, playerId: PlayerId): DurableObjectStub<TutorialRoom> {
  return env.TUTORIAL.get(env.TUTORIAL.idFromName(playerId));
}
