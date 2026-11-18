import { CHAT_THEN_FIELDS } from "./CHAT_THEN_FIELDS.ts";
import { PRESENCE_THEN_FIELDS } from "./PRESENCE_THEN_FIELDS.ts";
import { QUEUE_THEN_FIELDS } from "./QUEUE_THEN_FIELDS.ts";
import { RECORDS_THEN_FIELDS } from "./RECORDS_THEN_FIELDS.ts";

export const LOBBY_THEN_FIELDS: ReadonlySet<string> = new Set([
  "rejected",
  "unchanged",
  "room",
  "game",
  "message_to",
  "accounts",
  "generated_name",
  "logged_in",
  "lobby_rooms",
  "replay_record",
  "record",
  "tutorial_step",
  "tutorial_room",
  ...RECORDS_THEN_FIELDS,
  "emails_sent",
  "seats",
  ...CHAT_THEN_FIELDS,
  ...QUEUE_THEN_FIELDS,
  ...PRESENCE_THEN_FIELDS,
]);
