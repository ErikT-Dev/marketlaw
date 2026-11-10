import * as v from "valibot";
import type { DriverSession } from "../DriverSession.ts";
import type { ScenarioDriver } from "../ScenarioDriver.ts";
import type { ScenarioStep } from "../ScenarioStep.ts";
import type { ScriptedRandom } from "../ScriptedRandom.ts";
import { lobbyAccountsThen } from "./lobbyAccountsThen.ts";
import { LOBBY_GIVEN_SCHEMA } from "./LOBBY_GIVEN_SCHEMA.ts";
import { lobbyMessageThen } from "./lobbyMessageThen.ts";
import { lobbyGameThen, lobbyRoomThen } from "./lobbyRoomThen.ts";
import { LobbySession } from "./LobbySession.ts";
import { replayRecordThen } from "./replayRecordThen.ts";
import { gameRecordThen } from "./gameRecordThen.ts";
import { lobbyChatThen } from "./lobbyChatThen.ts";
import { chatTextOfStep } from "./chatTextOfStep.ts";
import { publicRoomsOf } from "../../../src/server/lobby/publicRoomsOf.ts";
import { logInVisitor } from "./logInVisitor.ts";
import { logOutPlayer } from "./logOutPlayer.ts";
import { signUpInLobby } from "./signUpInLobby.ts";
import { changeUsernameInLobby } from "./changeUsernameInLobby.ts";
import { confirmEmailInLobby } from "./confirmEmailInLobby.ts";
import { requestResetInLobby } from "./requestResetInLobby.ts";
import { setNewPasswordInLobby } from "./setNewPasswordInLobby.ts";
import { changeEmailInLobby } from "./changeEmailInLobby.ts";
import { deleteAccountInLobby } from "./deleteAccountInLobby.ts";
import { LOBBY_NESTED_FIELDS } from "./LOBBY_NESTED_FIELDS.ts";
import { matchHistoryThen } from "./matchHistoryThen.ts";
import { removeUnusedGuestsInLobby } from "./removeUnusedGuestsInLobby.ts";

const ROOM_ACTIONS = [
  "change_size",
  "leave_room",
  "accept_game",
  "decline_game",
  "ask_rematch",
  "send_chat",
];

const CHAT_THEN_FIELDS = ["chat", "notified", "view_chat", "chat_count", "saved_before_shown"];

function textOf(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function runPlayerStep(
  session: LobbySession,
  name: string,
  step: Readonly<Record<string, unknown>>,
) {
  const action = textOf(step["action"]);
  if (action === "create_room") {
    session.createRoom(name, step);
  } else if (action === "join_room") {
    session.joinRoom(name, step["code"]);
  } else if (action === "open_site") {
    session.openSite(name);
  } else if (action === "log_out") {
    logOutPlayer(session, name);
  } else if (action === "leave_game") {
    session.sendGameAction(name, { type: "leave_game" });
  } else if (action === "send_chat") {
    session.sendRoomAction(name, { type: "send_chat", text: chatTextOfStep(step) });
  } else if (action === "mute" || action === "unmute") {
    session.sendRoomAction(name, { type: action, playerName: textOf(step[`player_to_${action}`]) });
  } else if (ROOM_ACTIONS.includes(action)) {
    const details = Object.entries(step).filter(([key]) => key !== "player" && key !== "action");
    session.sendRoomAction(name, { ...Object.fromEntries(details), type: action });
  } else {
    throw new Error(`the lobby driver has no player step ${action}`);
  }
}

async function runVisitorStep(
  session: LobbySession,
  visitor: string,
  step: Readonly<Record<string, unknown>>,
) {
  switch (textOf(step["action"])) {
    case "log_in":
      await logInVisitor(session, visitor, step);
      return;
    case "log_out":
      session.visitorLogins.delete(visitor);
      return;
    case "sign_up":
      await signUpInLobby(session, { visitor }, step);
      return;
    case "join_room":
      session.visitorJoins(visitor, step["code"]);
      return;
    case "create_guest":
      session.createGuest(visitor, step);
      return;
    case "ask_generated_name":
      session.askGeneratedName();
      return;
    case "reset_password":
      requestResetInLobby(session, step);
      return;
    case "set_new_password":
      setNewPasswordInLobby(session, visitor, step);
      return;
    default:
      throw new Error(`the lobby driver has no visitor step ${textOf(step["action"])}`);
  }
}

async function runStep(session: LobbySession, step: ScenarioStep): Promise<void> {
  if (typeof step === "string") {
    throw new Error(`the lobby driver has no step ${step}`);
  }
  session.rejected = null;
  if (typeof step["wait_ms"] === "number") {
    session.wait(step["wait_ms"]);
    removeUnusedGuestsInLobby(session);
  } else if (typeof step["disconnect"] === "string") {
    session.setConnected(step["disconnect"], false);
  } else if (typeof step["reconnect"] === "string") {
    session.setConnected(step["reconnect"], true);
  } else if (typeof step["visitor"] === "string") {
    await runVisitorStep(session, step["visitor"], step);
  } else if (step["action"] === "sign_up") {
    await signUpInLobby(session, { player: textOf(step["player"]) }, step);
  } else if (step["action"] === "confirm_email") {
    confirmEmailInLobby(session, textOf(step["player"]));
  } else if (step["action"] === "change_email") {
    changeEmailInLobby(session, textOf(step["player"]), step);
  } else if (step["action"] === "delete_account") {
    deleteAccountInLobby(session, textOf(step["player"]), step);
  } else if (step["action"] === "open_match_history") {
    const of =
      session.accounts.get(textOf(step["of"]))?.identity ??
      session.identityNamed(textOf(step["of"]));
    await session.history.open(session.accounts, of.playerId);
  } else if (step["action"] === "change_username") {
    await changeUsernameInLobby(session, textOf(step["player"]), textOf(step["username"]));
  } else {
    runPlayerStep(session, textOf(step["player"]), step);
  }
}

function startSession(rawGiven: Readonly<Record<string, unknown>>, random: ScriptedRandom) {
  const session = new LobbySession(v.parse(LOBBY_GIVEN_SCHEMA, rawGiven), random);
  let before = session.snapshot();
  const chatAtStart = {
    messageCount: session.chat.storage.messages().length,
    lineCount: session.record?.chat.lineCount ?? 0,
  };
  let isUnchanged = true;
  const driverSession: DriverSession = {
    async runStep(step) {
      before = session.snapshot();
      await runStep(session, step);
      session.reportRooms();
      isUnchanged = before === session.snapshot();
    },
    readThen(field, expected) {
      switch (field) {
        case "rejected":
          return session.rejected ?? undefined;
        case "unchanged":
          return isUnchanged;
        case "room":
          return session.record === null
            ? session.goneAs
            : lobbyRoomThen(session.record, expected, {
                messages: session.chat.storage.messages(),
                atStart: chatAtStart,
              });
        case "record":
          return gameRecordThen(session.endedRoom);
        case "replay_record":
          return replayRecordThen(session.endedRoom, session.now);
        case "game":
          return lobbyGameThen(session.record);
        case "lobby_rooms":
          return publicRoomsOf(session.lobby).map((room) => ({
            owner: room.ownerName,
            players: room.playerNames,
            free_places: room.size - room.playerNames.length,
          }));
        case "match_history":
          return matchHistoryThen(session.history.opened);
        case "record_usernames":
          return session.history.accountGameUsernames(session.accounts);
        case "message_to":
          return lobbyMessageThen(session.messagesTo, expected, session.emails.noticesTo);
        default:
          return CHAT_THEN_FIELDS.includes(field)
            ? lobbyChatThen(session, field, expected)
            : lobbyAccountsThen(session, field, expected);
      }
    },
    measurements: () => session.chat.rowsPerChatIntent.map((value) => ({ budget: "B7", value })),
  };
  return driverSession;
}

export const LOBBY_DRIVER: ScenarioDriver = {
  name: "lobby",
  unhandledGivenValues: () => [],
  givenFields: new Set([
    "clock_ms",
    "site_games_today",
    "site_counts_today",
    "email_counts",
    "seats",
    "accounts",
    "room",
    "other_rooms",
    "records",
  ]),
  steps: new Set([
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
    "open_match_history",
    "wait_ms",
    "disconnect",
    "reconnect",
    "leave_game",
    "mute",
    "unmute",
    ...ROOM_ACTIONS,
  ]),
  thenFields: new Set([
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
    "match_history",
    "record_usernames",
    "emails_sent",
    "seats",
    ...CHAT_THEN_FIELDS,
  ]),
  nestedFields: LOBBY_NESTED_FIELDS,
  startSession,
};
