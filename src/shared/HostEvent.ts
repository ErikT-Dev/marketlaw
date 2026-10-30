import type { ConnectionStatus } from "./ConnectionStatus";
import type { EpochMs } from "./EpochMs";
import type { Notice } from "./Notice";
import type { RoomUpdate } from "./protocol/RoomUpdate";
import type { ReasonCode } from "./ReasonCode";

export type HostEvent =
  | {
      readonly type: "update";
      readonly update: RoomUpdate;
      readonly acceptedActionId: string | null;
      readonly serverNow: EpochMs;
    }
  | { readonly type: "rejected"; readonly code: ReasonCode; readonly actionId: string | null }
  | { readonly type: "connection"; readonly status: ConnectionStatus }
  | { readonly type: "notice"; readonly notice: Notice };
