import { PRESENCE_THEN_FIELDS } from "./LobbyPresence.ts";
import { RECORDS_THEN_FIELDS } from "./recordsThen.ts";
import { RECORDS_ACTIONS } from "./runRecordsStep.ts";

export const ROOM_ACTIONS = [
  "change_size",
  "leave_room",
  "accept_game",
  "decline_game",
  "ask_rematch",
  "send_chat",
];

export const QUEUE_ACTIONS = [
  "join_queue",
  "change_sizes",
  "leave_queue",
  "confirm_match",
  "decline_match",
];

export const QUEUE_THEN_FIELDS = ["queue", "match", "view_lobby"];

export const CHAT_THEN_FIELDS = [
  "chat",
  "notified",
  "view_chat",
  "chat_count",
  "saved_before_shown",
];

export const LOBBY_GIVEN_FIELDS: ReadonlySet<string> = new Set([
  "clock_ms",
  "site_games_today",
  "site_counts_today",
  "email_counts",
  "players",
  "seats",
  "accounts",
  "room",
  "other_rooms",
  "records",
  "queue",
  "match",
  "ranked_accounts",
  "queue_count",
]);

export const LOBBY_STEPS: ReadonlySet<string> = new Set([
  "create_room",
  "join_room",
  "open_site",
  "create_guest",
  "ask_generated_name",
  "log_in",
  "log_out",
  "sign_up",
  "change_username",
  "confirm_email",
  "change_email",
  "delete_account",
  "reset_password",
  "set_new_password",
  ...RECORDS_ACTIONS,
  "wait_ms",
  "disconnect",
  "reconnect",
  "leave_game",
  "mute",
  "unmute",
  ...ROOM_ACTIONS,
  ...QUEUE_ACTIONS,
  "open_lobby",
]);

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
  ...RECORDS_THEN_FIELDS,
  "emails_sent",
  "seats",
  ...CHAT_THEN_FIELDS,
  ...QUEUE_THEN_FIELDS,
  ...PRESENCE_THEN_FIELDS,
]);
