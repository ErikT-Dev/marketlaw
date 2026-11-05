import type { ReceiveOutcome } from "../../../src/server/room/ReceiveOutcome.ts";
import type { RoomRecord } from "../../../src/server/room/RoomRecord.ts";
import { updateFor } from "../../../src/server/room/updateFor.ts";
import type { EpochMs } from "../../../src/shared/EpochMs.ts";
import { PROTOCOL_VERSION } from "../../../src/shared/PROTOCOL_VERSION.ts";
import type { ServerMessage } from "../../../src/shared/protocol/ServerMessage.ts";
import type { LobbyAccount } from "./LobbyAccount.ts";

type Delivered = Extract<ReceiveOutcome, { readonly isRoomGone: false }>;

function messagesFor(
  account: LobbyAccount,
  outcome: Delivered,
  room: { readonly record: RoomRecord | null; readonly now: EpochMs },
): ReadonlyArray<ServerMessage> {
  const { playerId } = account.identity;
  const { record, now } = room;
  const removal = outcome.removals.find((entry) => entry.playerId === playerId);
  return [
    ...(record !== null && outcome.playersToUpdate.includes(playerId)
      ? [
          {
            type: "update" as const,
            protocolVersion: PROTOCOL_VERSION,
            acceptedActionId: null,
            update: updateFor(record, playerId),
            serverNow: now,
          },
        ]
      : []),
    ...outcome.notices
      .filter((addressed) => addressed.playerId === playerId)
      .map(({ notice }) => ({
        type: "notice" as const,
        protocolVersion: PROTOCOL_VERSION,
        notice,
      })),
    ...(removal === undefined
      ? []
      : [
          {
            type: "removed" as const,
            protocolVersion: PROTOCOL_VERSION,
            reason: removal.reason,
            rejoinAt: removal.rejoinAt,
          },
        ]),
  ];
}

export function deliverRoomOutcome(
  messagesTo: Map<string, ServerMessage[]>,
  delivery: {
    readonly sender: string;
    readonly accounts: Iterable<LobbyAccount>;
    readonly record: RoomRecord | null;
    readonly now: EpochMs;
  },
  outcome: Delivered,
): void {
  const { sender, accounts, record, now } = delivery;
  messagesTo.set(sender, [...(messagesTo.get(sender) ?? []), outcome.reply]);
  for (const account of accounts) {
    const messages = messagesFor(account, outcome, { record, now });
    if (messages.length > 0) {
      const name = account.identity.name;
      messagesTo.set(name, [...(messagesTo.get(name) ?? []), ...messages]);
    }
  }
}
