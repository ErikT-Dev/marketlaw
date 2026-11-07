import type { PlayerId } from "../../shared/PlayerId";

export type ChatMute = {
  readonly by: PlayerId;
  readonly muted: PlayerId;
  readonly mutedName: string;
};
