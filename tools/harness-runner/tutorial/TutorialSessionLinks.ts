import type { LobbyRecord } from "../../../src/server/lobby/LobbyRecord.ts";
import type { Identity } from "../../../src/server/room/Identity.ts";

export type TutorialSessionLinks = {
  readonly identityNamed: (name: string) => Identity;
  readonly lobby: {
    readonly read: () => LobbyRecord;
    readonly write: (lobby: LobbyRecord) => void;
  };
};
