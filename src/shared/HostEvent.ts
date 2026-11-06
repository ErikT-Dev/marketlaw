import type { ConnectionStatus } from "./ConnectionStatus";
import type { EpochMs } from "./EpochMs";
import type { Notice } from "./Notice";
import type { ChatEntry } from "./protocol/ChatEntry";
import type { RemovalReason } from "./protocol/RemovalReason";
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
  | { readonly type: "notice"; readonly notice: Notice }
  | {
      readonly type: "chat";
      readonly entries: ReadonlyArray<ChatEntry>;
      readonly mutedNames: ReadonlyArray<string>;
      readonly isFullList: boolean;
    }
  | { readonly type: "removed"; readonly reason: RemovalReason; readonly rejoinAt: EpochMs | null };
