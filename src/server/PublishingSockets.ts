import type { PlayerId } from "../shared/PlayerId";
import type { ServerMessage } from "../shared/protocol/ServerMessage";
import type { AddressedNotice } from "./room/AddressedNotice";
import type { RoomRecord } from "./room/RoomRecord";
import type { RoomRemoval } from "./room/RoomRemoval";

export type PublishingSockets<Socket> = {
  readonly livePlayers: () => ReadonlyArray<PlayerId>;
  readonly sendTo: (
    playerIds: ReadonlyArray<PlayerId>,
    messageFor: (playerId: PlayerId) => ServerMessage,
  ) => void;
  readonly sendRemovals: (removals: ReadonlyArray<RoomRemoval>) => void;
  readonly sendNotices: (notices: ReadonlyArray<AddressedNotice>) => void;
  readonly welcome: (record: RoomRecord, playerId: PlayerId, socket: Socket) => void;
  readonly updatePlayers: (
    record: RoomRecord | null,
    playerIds: ReadonlyArray<PlayerId>,
    except: Socket | null,
  ) => void;
};
