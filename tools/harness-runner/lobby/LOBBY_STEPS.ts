import { QUEUE_ACTIONS } from "./QUEUE_ACTIONS.ts";
import { RECORDS_ACTIONS } from "./RECORDS_ACTIONS.ts";
import { ROOM_ACTIONS } from "./ROOM_ACTIONS.ts";

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
