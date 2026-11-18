import type { EpochMs } from "../../shared/EpochMs";
import type { ReasonCode } from "../../shared/ReasonCode";
import type { Result } from "../../shared/Result";
import type { TutorialClientMessage } from "../../shared/protocol/TutorialClientMessage";
import type { ConnectionState } from "../room/ConnectionState";
import type { Identity } from "../room/Identity";

export type TutorialInput = {
  readonly connection: ConnectionState;
  readonly parsed: Result<TutorialClientMessage, ReasonCode>;
  readonly sender: Identity | null;
  readonly now: EpochMs;
};
