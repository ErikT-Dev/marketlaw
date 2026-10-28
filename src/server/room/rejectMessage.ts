import type { EpochMs } from "../../shared/EpochMs";
import { PROTOCOL_VERSION } from "../../shared/PROTOCOL_VERSION";
import type { ReasonCode } from "../../shared/ReasonCode";
import type { ConnectionState } from "./ConnectionState";
import type { MessageOutcome } from "./MessageOutcome";
import type { RoomRecord } from "./RoomRecord";

const REJECTION_WINDOW_MS = 60_000;
const REJECTIONS_BEFORE_CLOSING = 30;

export function rejectMessage(
  record: RoomRecord,
  connection: ConnectionState,
  rejection: { readonly code: ReasonCode; readonly actionId: string | null; readonly now: EpochMs },
): MessageOutcome {
  const rejectionTimes = [
    ...connection.rejectionTimes.filter((time) => rejection.now - time < REJECTION_WINDOW_MS),
    rejection.now,
  ];
  return {
    record,
    connection: { ...connection, rejectionTimes },
    shouldSave: false,
    reply: {
      type: "rejected",
      protocolVersion: PROTOCOL_VERSION,
      actionId: rejection.actionId,
      code: rejection.code,
    },
    playersToUpdate: [],
    shouldClose: rejectionTimes.length >= REJECTIONS_BEFORE_CLOSING,
  };
}
