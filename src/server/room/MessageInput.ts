import type { Random } from "../../rules/Random";
import type { SavedGame } from "../../rules/SavedGame";
import type { EpochMs } from "../../shared/EpochMs";
import type { PlayerId } from "../../shared/PlayerId";
import type { ClientMessage } from "../../shared/protocol/ClientMessage";
import type { ReasonCode } from "../../shared/ReasonCode";
import type { Result } from "../../shared/Result";
import type { ConnectionState } from "./ConnectionState";
import type { GameStart } from "./GameStart";
import type { Identity } from "./Identity";
import type { RoomRecord } from "./RoomRecord";

export type MessageInput = {
  readonly record: RoomRecord;
  readonly connection: ConnectionState;
  readonly parsed: Result<ClientMessage, ReasonCode>;
  readonly sender: Identity | null;
  readonly now: EpochMs;
  readonly randomFor: (saved: SavedGame) => Random;
  readonly gameStart: GameStart;
  readonly livePlayers: ReadonlyArray<PlayerId>;
};
