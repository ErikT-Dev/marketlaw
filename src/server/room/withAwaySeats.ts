import type { PlayerId } from "../../shared/PlayerId";
import type { ServerMessage } from "../../shared/protocol/ServerMessage";
import type { RoomRecord } from "./RoomRecord";

export function withAwaySeats(
  message: ServerMessage,
  record: RoomRecord | null,
  livePlayers: ReadonlyArray<PlayerId>,
): ServerMessage {
  const game = message.type === "update" ? message.update.game : null;
  if (message.type !== "update" || game === null || record === null || record.game === null) {
    return message;
  }
  const awaySeats = record.game.seats
    .filter(({ playerId }) => !livePlayers.includes(playerId))
    .map(({ seat }) => seat);
  return { ...message, update: { ...message.update, game: { ...game, awaySeats } } };
}
