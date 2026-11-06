import type { EpochMs } from "../EpochMs";
import type { ChatEntry } from "./ChatEntry";
import type { Notice } from "../Notice";
import type { ReasonCode } from "../ReasonCode";
import type { RemovalReason } from "./RemovalReason";
import type { RoomUpdate } from "./RoomUpdate";

export type ServerMessage =
  | {
      readonly type: "update";
      readonly protocolVersion: number;
      readonly acceptedActionId: string | null;
      readonly update: RoomUpdate;
      readonly serverNow: EpochMs;
    }
  | {
      readonly type: "rejected";
      readonly protocolVersion: number;
      readonly actionId: string | null;
      readonly code: ReasonCode;
      readonly sendAgainAt: EpochMs | null;
    }
  | { readonly type: "notice"; readonly protocolVersion: number; readonly notice: Notice }
  | {
      readonly type: "chat";
      readonly protocolVersion: number;
      readonly entries: ReadonlyArray<ChatEntry>;
      readonly isFullList: boolean;
    }
  | { readonly type: "opened_elsewhere"; readonly protocolVersion: number }
  | {
      readonly type: "removed";
      readonly protocolVersion: number;
      readonly reason: RemovalReason;
      readonly rejoinAt: EpochMs | null;
    };
