import { applyToSavedGame } from "../../src/rules/applyToSavedGame.ts";
import { randomForNextAction } from "../../src/rules/randomForNextAction.ts";
import { replayStartOf } from "../../src/rules/replayStartOf.ts";
import type { ReplayRecord } from "../../src/server/replays/ReplayRecord.ts";
import { replayRecordOf } from "../../src/server/replays/replayRecordOf.ts";
import { replayRecordOfRoom } from "../../src/server/replays/replayRecordOfRoom.ts";
import type { RoomRecord } from "../../src/server/room/RoomRecord.ts";
import { TURN_LIMIT } from "../../src/shared/TURN_LIMIT.ts";
import { simulateGame } from "../simulator/simulateGame.ts";

const RUNNING_ROOM_LAST_TURN = 3;

function lastRoomOf(seed: number, players: 2 | 3 | 4, lastTurn: number): RoomRecord | null {
  let last: RoomRecord | null = null;
  simulateGame(seed, players, "legal", lastTurn, (record) => {
    last = record;
    return record;
  });
  return last;
}

function isSentExactly(record: ReplayRecord): boolean {
  const text = JSON.stringify(record);
  return JSON.stringify(JSON.parse(text)) === text;
}

function replayedStateText(record: ReplayRecord): string {
  let replayed = replayStartOf(record);
  for (const [index, { action, at }] of record.actionLog.entries()) {
    const result = applyToSavedGame(replayed, action, at, randomForNextAction(replayed));
    if (!result.isOk) {
      return `action ${String(index + 1)} rejected with ${result.error.code}`;
    }
    replayed = result.value;
  }
  return JSON.stringify(replayed.state);
}

function exportProblems(room: RoomRecord | null, name: string): ReadonlyArray<string> {
  const saved = room?.game?.saved;
  const exported = replayRecordOfRoom(room);
  if (saved === undefined || exported === null) {
    return [`the ${name} room has no game to export`];
  }
  const expected = JSON.stringify(saved.state);
  const stored = replayRecordOf(saved);
  const fromRoom = isSentExactly(exported) ? replayedStateText(exported) : "";
  const fromStore = isSentExactly(stored) ? replayedStateText(stored) : "";
  return [
    ...(fromRoom === expected ? [] : [`the ${name} room's export does not replay exactly`]),
    ...(fromStore === expected ? [] : [`the ${name} room's stored record does not replay exactly`]),
  ];
}

export function checkReplayExport(): ReadonlyArray<string> {
  const running = lastRoomOf(1, 3, RUNNING_ROOM_LAST_TURN);
  const ended = lastRoomOf(2, 2, TURN_LIMIT);
  return [
    ...(running?.game?.saved.state.phase === "ended" ? ["the running room has ended"] : []),
    ...(ended?.game?.saved.state.phase === "ended" ? [] : ["the ended room has not ended"]),
    ...exportProblems(running, "running"),
    ...exportProblems(ended, "ended"),
  ];
}
