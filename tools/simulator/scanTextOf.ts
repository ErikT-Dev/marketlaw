import type { DrawLogEntry } from "../../src/shared/DrawLogEntry.ts";
import type { RoomUpdate } from "../../src/shared/protocol/RoomUpdate.ts";

function withoutPublicHistory(entry: DrawLogEntry): unknown {
  return entry.kind === "turn_draw" && entry.choice.option === "A"
    ? { ...entry, choice: { option: "A" } }
    : entry;
}

export function scanTextOf(update: RoomUpdate): string {
  const game = update.game;
  return JSON.stringify(
    game === null
      ? update
      : {
          ...update,
          game: {
            ...game,
            view: {
              ...game.view,
              discard: [],
              drawLog: game.view.drawLog.map(withoutPublicHistory),
            },
          },
        },
  );
}
