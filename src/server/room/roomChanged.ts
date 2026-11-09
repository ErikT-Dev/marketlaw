import type { ReasonCode } from "../../shared/ReasonCode";
import type { Result } from "../../shared/Result";
import type { RoomActionChange } from "./RoomActionChange";
import type { RoomRecord } from "./RoomRecord";

export function roomChanged(record: RoomRecord | null): Result<RoomActionChange, ReasonCode> {
  return { isOk: true, value: { record, removals: [], notices: [], refusal: null } };
}
