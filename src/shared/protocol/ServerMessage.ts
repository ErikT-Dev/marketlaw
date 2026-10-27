import type { ReasonCode } from "../ReasonCode";
import type { RoomUpdate } from "./RoomUpdate";

export type ServerMessage =
  | {
      readonly type: "update";
      readonly protocolVersion: number;
      readonly acceptedActionId: string | null;
      readonly update: RoomUpdate;
    }
  | {
      readonly type: "rejected";
      readonly protocolVersion: number;
      readonly actionId: string | null;
      readonly code: ReasonCode;
    };
