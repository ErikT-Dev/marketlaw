import * as v from "valibot";
import { TEST_PLAYER_ICON } from "../../shared/testing/TEST_PLAYER_ICON";
import { describe, expect, it } from "vitest";
import { EpochMs } from "../../shared/EpochMs";
import { PlayerId } from "../../shared/PlayerId";
import type { ConnectionState } from "../room/ConnectionState";
import type { Identity } from "../room/Identity";
import { ROOM_TIMES } from "../room/ROOM_TIMES";
import { isTutorialAbandoned } from "./isTutorialAbandoned";
import { startTutorialIn } from "./startTutorialIn";
import { tutorialAlarmAfterClose } from "./tutorialAlarmAfterClose";
import type { TutorialRecord } from "./TutorialRecord";

const NOW = v.parse(EpochMs, 5_000);
const ANN: Identity = {
  playerId: v.parse(PlayerId, "5b0f6a52-3d5e-4f7c-8a41-6c2b9e0d7f13"),
  name: "Ann",
  icon: TEST_PLAYER_ICON,
};
const BEA: Identity = {
  playerId: v.parse(PlayerId, "7d0c7f1e-4b7a-4c5e-9a39-2f4d9c1b8e10"),
  name: "Bea",
  icon: TEST_PLAYER_ICON,
};
const UNIDENTIFIED: ConnectionState = { identity: null, rejectionTimes: [] };
const ANN_CONNECTED: ConnectionState = { identity: ANN, rejectionTimes: [] };
const BEA_CONNECTED: ConnectionState = { identity: BEA, rejectionTimes: [] };

function annsTutorial(): TutorialRecord {
  let stored: TutorialRecord | undefined;
  startTutorialIn(
    {
      read: () => stored,
      write: (record) => {
        stored = record;
      },
      remove: () => {
        stored = undefined;
      },
    },
    ANN,
    NOW,
  );
  if (stored === undefined) {
    throw new Error("the tutorial did not start");
  }
  return stored;
}

describe("the alarm after a tutorial socket closes", () => {
  it("is set 30 minutes ahead when no socket of the player is still open", () => {
    expect(tutorialAlarmAfterClose(annsTutorial(), [], NOW)).toBe(NOW + ROOM_TIMES.tutorialAwayMs);
  });

  it("is set when only sockets that never identified or belong to others are open", () => {
    expect(tutorialAlarmAfterClose(annsTutorial(), [UNIDENTIFIED, BEA_CONNECTED], NOW)).toBe(
      NOW + ROOM_TIMES.tutorialAwayMs,
    );
  });

  it("is not set while another socket of the player is open", () => {
    expect(tutorialAlarmAfterClose(annsTutorial(), [UNIDENTIFIED, ANN_CONNECTED], NOW)).toBeNull();
  });

  it("is not set when the room holds no tutorial", () => {
    expect(tutorialAlarmAfterClose(undefined, [], NOW)).toBeNull();
  });
});

describe("deleting a tutorial when its alarm fires", () => {
  it("deletes the tutorial when the player has no open socket", () => {
    expect(isTutorialAbandoned(annsTutorial(), [UNIDENTIFIED, BEA_CONNECTED])).toBe(true);
  });

  it("keeps the tutorial while the player has an open socket", () => {
    expect(isTutorialAbandoned(annsTutorial(), [ANN_CONNECTED])).toBe(false);
  });

  it("treats a room without a tutorial as abandoned", () => {
    expect(isTutorialAbandoned(undefined, [ANN_CONNECTED])).toBe(true);
  });
});
