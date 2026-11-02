import type { RoomUpdate } from "../../shared/protocol/RoomUpdate";

const TEXT_BY_UPDATE = new WeakMap<RoomUpdate, string>();

export function updateTextOf(update: RoomUpdate): string {
  const known = TEXT_BY_UPDATE.get(update);
  if (known !== undefined) {
    return known;
  }
  const text = JSON.stringify(update);
  TEXT_BY_UPDATE.set(update, text);
  return text;
}
