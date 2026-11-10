import type { PlayerId } from "../../shared/PlayerId";

export type UsernameLookup = (
  playerIds: ReadonlyArray<PlayerId>,
) => Promise<ReadonlyMap<PlayerId, string>>;
