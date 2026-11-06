import * as v from "valibot";
import { fireRoomAlarm } from "../../../src/server/room/fireRoomAlarm.ts";
import { nextAlarmAt } from "../../../src/server/room/nextAlarmAt.ts";
import type { RoomStorage } from "../../../src/server/room/RoomStorage.ts";
import { randomForNextAction } from "../../../src/rules/randomForNextAction.ts";
import { EpochMs } from "../../../src/shared/EpochMs.ts";
import type { PlayerId } from "../../../src/shared/PlayerId.ts";

export function fireAlarmsUntil(
  storage: RoomStorage,
  until: EpochMs,
  room: { readonly live: ReadonlyArray<PlayerId>; readonly setNow: (now: EpochMs) => void },
): void {
  for (
    let record = storage.read() ?? null, alarm = nextAlarmAt(record);
    record !== null && alarm !== null && alarm <= until;
    record = storage.read() ?? null, alarm = nextAlarmAt(record)
  ) {
    const now = v.parse(EpochMs, alarm);
    room.setNow(now);
    const fired = fireRoomAlarm(record, now, randomForNextAction, room.live).record;
    if (fired === record) {
      return;
    }
    if (fired === null) {
      storage.remove();
    } else {
      storage.write(fired);
    }
  }
}
