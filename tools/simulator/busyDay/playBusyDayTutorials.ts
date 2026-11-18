import * as v from "valibot";
import { TUTORIAL_STEPS } from "../../../src/rules/tutorial/TUTORIAL_STEPS.ts";
import { countTutorialStart } from "../../../src/server/lobby/countTutorialStart.ts";
import { releasePlayer } from "../../../src/server/lobby/releasePlayer.ts";
import { siteTutorialLimitOf } from "../../../src/server/lobby/siteTutorialLimitOf.ts";
import { TUTORIAL_PLACE } from "../../../src/server/lobby/TUTORIAL_PLACE.ts";
import type { ConnectionState } from "../../../src/server/room/ConnectionState.ts";
import type { Identity } from "../../../src/server/room/Identity.ts";
import { receiveTutorialMessage } from "../../../src/server/tutorial/receiveTutorialMessage.ts";
import { startTutorialIn } from "../../../src/server/tutorial/startTutorialIn.ts";
import type { TutorialOutcome } from "../../../src/server/tutorial/TutorialOutcome.ts";
import type { TutorialRecord } from "../../../src/server/tutorial/TutorialRecord.ts";
import type { TutorialStorage } from "../../../src/server/tutorial/TutorialStorage.ts";
import { EpochMs } from "../../../src/shared/EpochMs.ts";
import { parseTutorialClientMessage } from "../../../src/shared/protocol/parseTutorialClientMessage.ts";
import { TUTORIAL_STEP_IDS } from "../../../src/shared/TUTORIAL_STEP_IDS.ts";
import { tutorialMessageText } from "../../harness-runner/tutorial/tutorialMessageText.ts";
import { BUSY_DAY } from "./BUSY_DAY.ts";
import type { BusyDayCounter } from "./BusyDayCounter.ts";
import { busyDayPlayer } from "./busyDayPlayer.ts";

const TOKEN_AND_LOBBY_READS_PER_START = 3;
const TUTORIAL_ROOM_READS_PER_BUSY_CHECK = 1;
const LOBBY_READS_PER_RELEASE = 1;
const NO_IDENTITY: ConnectionState = { identity: null, rejectionTimes: [] };

type Room = { record: TutorialRecord | undefined };

function storageOf(room: Room): TutorialStorage {
  return {
    read: () => room.record,
    write: (record) => {
      room.record = record;
    },
    remove: () => {
      room.record = undefined;
    },
  };
}

function send(
  room: Room,
  player: Identity,
  action: Parameters<typeof tutorialMessageText>[0],
  now: EpochMs,
): TutorialOutcome {
  const text = tutorialMessageText(action, {
    token: "t",
    actionId: `step-${String(room.record?.stateVersion ?? 0)}`,
    stateVersion: room.record?.stateVersion ?? 0,
  });
  return receiveTutorialMessage(storageOf(room), {
    connection: NO_IDENTITY,
    parsed: parseTutorialClientMessage(text),
    sender: player,
    now,
    restartRefusal: null,
  });
}

function playOneTutorial(counter: BusyDayCounter, player: Identity, at: EpochMs): void {
  counter.countReads(TOKEN_AND_LOBBY_READS_PER_START + TUTORIAL_ROOM_READS_PER_BUSY_CHECK);
  const limits = { now: at, siteTutorialsPerDay: siteTutorialLimitOf({}) };
  const counted = countTutorialStart(counter.lobby, player.playerId, limits);
  if (!counted.isOk) {
    throw new Error(`the busy day could not start a tutorial: ${counted.error}`);
  }
  counter.changeLobby(counted.value);
  const room: Room = { record: undefined };
  startTutorialIn(storageOf(room), player, at);
  for (const step of TUTORIAL_STEP_IDS) {
    send(room, player, TUTORIAL_STEPS[step].accepts, at);
  }
  if (room.record?.tutorial.stage !== "complete") {
    throw new Error(`the busy day did not finish the tutorial of ${player.name}`);
  }
  if (send(room, player, { type: "leave_tutorial" }, at).kind !== "closing") {
    throw new Error(`the busy day could not leave the tutorial of ${player.name}`);
  }
  counter.count("alarm");
  counter.count("room");
  counter.countReads(LOBBY_READS_PER_RELEASE);
  counter.changeLobby(releasePlayer(counter.lobby, player.playerId, TUTORIAL_PLACE));
}

export function playBusyDayTutorials(
  counter: BusyDayCounter,
  clock: { now: number },
  firstGame: number,
): void {
  for (let tutorial = 0; tutorial < BUSY_DAY.tutorials; tutorial += 1) {
    playOneTutorial(counter, busyDayPlayer(firstGame + tutorial, 0), v.parse(EpochMs, clock.now));
  }
}
