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
import { lobbyChatThen } from "./lobbyChatThen.ts";
import { chatTextOfStep } from "./chatTextOfStep.ts";
import { publicRoomsOf } from "../../../src/server/lobby/publicRoomsOf.ts";

const ROOM_ACTIONS = ["change_size", "leave_room", "accept_game", "decline_game", "send_chat"];

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
  } else if (action === "leave_game") {
    session.sendGameAction(name, { type: "leave_game" });
  } else if (action === "send_chat") {
    session.sendRoomAction(name, { type: "send_chat", text: chatTextOfStep(step) });
  } else if (ROOM_ACTIONS.includes(action)) {
    const details = Object.entries(step).filter(([key]) => key !== "player" && key !== "action");
    session.sendRoomAction(name, { ...Object.fromEntries(details), type: action });
  } else {
    throw new Error(`the lobby driver has no player step ${action}`);
  }
}

function runVisitorStep(
  session: LobbySession,
  visitor: string,
  step: Readonly<Record<string, unknown>>,
) {
  switch (textOf(step["action"])) {
    case "join_room":
      session.visitorJoins(visitor, step["code"]);
      return;
    case "create_guest":
      session.createGuest(visitor, step);
      return;
    case "ask_generated_name":
      session.askGeneratedName();
      return;
    default:
      throw new Error(`the lobby driver has no visitor step ${textOf(step["action"])}`);
  }
}

function runStep(session: LobbySession, step: ScenarioStep): void {
  if (typeof step === "string") {
    throw new Error(`the lobby driver has no step ${step}`);
  }
  session.rejected = null;
  if (typeof step["wait_ms"] === "number") {
    session.wait(step["wait_ms"]);
  } else if (typeof step["disconnect"] === "string") {
    session.setConnected(step["disconnect"], false);
  } else if (typeof step["reconnect"] === "string") {
    session.setConnected(step["reconnect"], true);
  } else if (typeof step["visitor"] === "string") {
    runVisitorStep(session, step["visitor"], step);
  } else {
    runPlayerStep(session, textOf(step["player"]), step);
  }
}

function startSession(rawGiven: Readonly<Record<string, unknown>>, random: ScriptedRandom) {
  const session = new LobbySession(v.parse(LOBBY_GIVEN_SCHEMA, rawGiven), random);
  let before = session.snapshot();
  let isUnchanged = true;
  const driverSession: DriverSession = {
    runStep(step) {
      before = session.snapshot();
      runStep(session, step);
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
            : lobbyRoomThen(session.record, expected, session.chat.storage.messages());
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
        case "message_to":
          return lobbyMessageThen(session.messagesTo, expected);
        default:
          return CHAT_THEN_FIELDS.includes(field)
            ? lobbyChatThen(session, field, expected)
            : lobbyAccountsThen(session, field, expected);
      }
    },
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
    "accounts",
    "room",
    "other_rooms",
  ]),
  steps: new Set([
    "create_room",
    "join_room",
    "open_site",
    "create_guest",
    "ask_generated_name",
    "wait_ms",
    "disconnect",
    "reconnect",
    "leave_game",
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
    ...CHAT_THEN_FIELDS,
  ]),
  nestedFields: new Map([
    [
      "given.accounts",
      new Set(["name", "kind", "last_used_ms", "actions_today", "games_started_today"]),
    ],
    [
      "given.room",
      new Set([
        "code",
        "size",
        "public",
        "owner",
        "players",
        "state",
        "ended_ms",
        "chat",
        "messages_sent",
      ]),
    ],
    ["given.other_rooms", new Set(["code", "size", "public", "owner", "players", "state"])],
    ["then.lobby_rooms", new Set(["owner", "players", "free_places"])],
    [
      "then.room",
      new Set([
        "size",
        "public",
        "owner",
        "players",
        "state",
        "accepted",
        "code_format",
        "chat_last",
      ]),
    ],
    ["then.game", new Set(["kind", "seats"])],
    ["then.message_to", new Set(["player", "contains", "text"])],
    ["then.accounts", new Set(["name", "kind"])],
    ["then.generated_name", new Set(["taken", "max_length", "not"])],
    ["then.logged_in", new Set(["as"])],
  ]),
  startSession,
};
