import type { DrawLogEntry } from "../../../shared/DrawLogEntry";
import type { DrawLogRow } from "./DrawLogRow";

function isSameMarketGo(previous: DrawLogEntry, entry: DrawLogEntry): boolean {
  return (
    previous.kind === "turn_draw" &&
    entry.kind === "turn_draw" &&
    previous.turn === entry.turn &&
    previous.seat === entry.seat
  );
}

export function drawLogRows(drawLog: ReadonlyArray<DrawLogEntry>): ReadonlyArray<DrawLogRow> {
  return drawLog.reduce<ReadonlyArray<DrawLogRow>>((rows, entry) => {
    const last = rows.at(-1);
    return last !== undefined && isSameMarketGo(last[0], entry)
      ? [...rows.slice(0, -1), [...last, entry]]
      : [...rows, [entry]];
  }, []);
}
