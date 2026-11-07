import type { ChatLineEntry } from "../../../shared/protocol/ChatLineEntry";

export function chatLineText(line: ChatLineEntry): string {
  switch (line.event) {
    case "joined_room":
      return `${line.name} joined the room.`;
    case "left_room":
      return `${line.name} left the room.`;
    case "left_game":
      return `${line.name} left the game.`;
    case "game_started":
      return "The game started.";
    case "game_ended":
      return "The game ended.";
  }
}
