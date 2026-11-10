import * as v from "valibot";
import { STORED_GAME_RECORD_SCHEMA } from "./STORED_GAME_RECORD_SCHEMA";
import type { StoredGameRecord } from "./StoredGameRecord";

export function storedGameRecordOfText(text: string): StoredGameRecord {
  const record: StoredGameRecord = v.parse(STORED_GAME_RECORD_SCHEMA, JSON.parse(text));
  return record;
}
