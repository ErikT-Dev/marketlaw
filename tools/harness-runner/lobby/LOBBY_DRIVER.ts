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
import { LobbyRanking } from "./LobbyRanking.ts";
import { RECORDS_THEN_FIELDS, recordsThen } from "./recordsThen.ts";
import { RECORDS_ACTIONS, runRecordsStep } from "./runRecordsStep.ts";
import { removeUnusedGuestsInLobby } from "./removeUnusedGuestsInLobby.ts";
import { runQueueStep } from "./runQueueStep.ts";
import { waitWithQueue } from "./waitWithQueue.ts";
import { lobbyQueueThen } from "./lobbyQueueThen.ts";
import { queueSentTo } from "./queueSentTo.ts";
import { connectInQueue } from "./connectInQueue.ts";

const ROOM_ACTIONS = [
  "change_size",
  "leave_room",
  "accept_game",
  "decline_game",
  "ask_rematch",
  "send_chat",
];

const QUEUE_ACTIONS = [
  "join_queue",
  "change_sizes",
  "leave_queue",
  "confirm_match",
  "decline_match",
];

const QUEUE_THEN_FIELDS = ["queue", "match", "view_lobby"];

const CHAT_THEN_FIELDS = ["chat", "notified", "view_chat", "chat_count", "saved_before_shown"];

function textOf(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function playerOfStep(session: LobbySession, step: Readonly<Record<string, unknown>>): string {
  const seat = session.record?.game?.seats.find(({ seat }) => seat === step["seat"]);
  const named = [...session.accounts.values()].find(
    ({ identity }) => identity.playerId === seat?.playerId,
  );
  return named?.identity.name ?? textOf(step["player"]);
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
  } else if (QUEUE_ACTIONS.includes(action)) {
    runQueueStep(session, name, step);
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

async function runStep(
  session: LobbySession,
  ranking: LobbyRanking,
  step: ScenarioStep,
): Promise<void> {
  if (typeof step === "string") {
    throw new Error(`the lobby driver has no step ${step}`);
  }
  session.rejected = null;
  if (RECORDS_ACTIONS.includes(textOf(step["action"]))) {
    await runRecordsStep(session, ranking, step);
  } else if (typeof step["wait_ms"] === "number") {
    waitWithQueue(session, step["wait_ms"]);
    removeUnusedGuestsInLobby(session);
  } else if (typeof step["disconnect"] === "string") {
    connectInQueue(session, step["disconnect"], false);
  } else if (typeof step["reconnect"] === "string") {
    connectInQueue(session, step["reconnect"], true);
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
  } else if (step["action"] === "change_username") {
    await changeUsernameInLobby(session, textOf(step["player"]), textOf(step["username"]));
  } else {
    runPlayerStep(session, playerOfStep(session, step), step);
  }
}

function otherFieldThen(session: LobbySession, field: string, expected: unknown) {
  if (field === "message_to") {
    return lobbyMessageThen(session.messagesTo, expected, session.emails.noticesTo, (player) =>
      queueSentTo(session, player),
    );
  }
  if (QUEUE_THEN_FIELDS.includes(field)) {
    return lobbyQueueThen(session, field, expected);
  }
  return CHAT_THEN_FIELDS.includes(field)
    ? lobbyChatThen(session, field, expected)
    : lobbyAccountsThen(session, field, expected);
}

function startSession(rawGiven: Readonly<Record<string, unknown>>, random: ScriptedRandom) {
  const given = v.parse(LOBBY_GIVEN_SCHEMA, rawGiven);
  const session = new LobbySession(given, random);
  const ranking = new LobbyRanking(given);
  let before = session.snapshot();
  const chatAtStart = {
    messageCount: session.chat.storage.messages().length,
    lineCount: session.record?.chat.lineCount ?? 0,
  };
  let isUnchanged = true;
  const driverSession: DriverSession = {
    async runStep(step) {
      before = session.snapshot();
      await runStep(session, ranking, step);
      session.reportRooms();
      isUnchanged = before === session.snapshot();
    },
    readThen(field, expected) {
      if (RECORDS_THEN_FIELDS.includes(field)) {
        return recordsThen(session, ranking, field);
      }
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
        default:
          return otherFieldThen(session, field, expected);
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
    "players",
    "seats",
    "accounts",
    "room",
    "other_rooms",
    "records",
    "queue",
    "match",
    "ranked_accounts",
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
    ...RECORDS_ACTIONS,
    "wait_ms",
    "disconnect",
    "reconnect",
    "leave_game",
    "mute",
    "unmute",
    ...ROOM_ACTIONS,
    ...QUEUE_ACTIONS,
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
    ...RECORDS_THEN_FIELDS,
    "emails_sent",
    "seats",
    ...CHAT_THEN_FIELDS,
    ...QUEUE_THEN_FIELDS,
  ]),
  nestedFields: LOBBY_NESTED_FIELDS,
  startSession,
};
