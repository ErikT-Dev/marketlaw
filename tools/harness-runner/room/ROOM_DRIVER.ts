import * as v from "valibot";
import { updateFor } from "../../../src/server/room/updateFor.ts";
import { withAwaySeats } from "../../../src/server/room/withAwaySeats.ts";
import { PROTOCOL_VERSION } from "../../../src/shared/PROTOCOL_VERSION.ts";
import { isRecord } from "../../harness-check/isRecord.ts";
import type { DriverSession } from "../DriverSession.ts";
import { ENGINE_FIELDS } from "../engine/ENGINE_FIELDS.ts";
import { engineRandom } from "../engine/engineRandom.ts";
import { GIVEN_SCHEMA } from "../engine/GIVEN_SCHEMA.ts";
import { readEngineThen } from "../engine/readEngineThen.ts";
import { seatThen } from "../engine/seatThen.ts";
import { stateFromGiven } from "../engine/stateFromGiven.ts";
import type { ScenarioDriver } from "../ScenarioDriver.ts";
import type { ScenarioStep } from "../ScenarioStep.ts";
import type { ScriptedRandom } from "../ScriptedRandom.ts";
import { lobbyRoomThen } from "../lobby/lobbyRoomThen.ts";
import { ROOM_GIVEN_SCHEMA } from "./ROOM_GIVEN_SCHEMA.ts";
import { roomMessageContains } from "./roomMessageContains.ts";
import { RoomSession } from "./RoomSession.ts";
import { logOutInRoom } from "./logOutInRoom.ts";
import { recordThen } from "./recordThen.ts";
import { ratingsThen } from "./ratingsThen.ts";

const ROOM_SEAT_FIELDS = ["state_version", "connected", "player"];

function playerCountOf(
  rawGiven: Readonly<Record<string, unknown>>,
): Readonly<Record<string, number>> {
  const room = rawGiven["room"];
  return isRecord(room) && Array.isArray(room["players"]) && rawGiven["players"] === undefined
    ? { players: room["players"].length }
    : {};
}

function engineGivenOf(rawGiven: Readonly<Record<string, unknown>>): unknown {
  const seats: ReadonlyArray<unknown> = Array.isArray(rawGiven["seats"]) ? rawGiven["seats"] : [];
  return {
    ...playerCountOf(rawGiven),
    ...Object.fromEntries(
      Object.entries(rawGiven).filter(([field]) => !["room", "accounts"].includes(field)),
    ),
    ...(rawGiven["seats"] === undefined
      ? {}
      : {
          seats: seats.map((seat) =>
            isRecord(seat)
              ? Object.fromEntries(
                  Object.entries(seat).filter(([field]) => !ROOM_SEAT_FIELDS.includes(field)),
                )
              : seat,
          ),
        }),
  };
}

function seatsThen(session: RoomSession, expected: unknown): ReadonlyArray<unknown> {
  const asked: ReadonlyArray<unknown> = Array.isArray(expected) ? expected : [];
  const game = session.record.game;
  return asked.map((entry) => {
    const seatNumber = isRecord(entry) ? entry["seat"] : undefined;
    const seat = game?.saved.state.seats.find((candidate) => candidate.seat === seatNumber);
    const seatPlayer = game?.seats.find((candidate) => candidate.seat === seatNumber);
    const name = session.seatNames[(seat?.seat ?? 0) - 1] ?? "";
    return seat === undefined || game === null
      ? undefined
      : {
          ...seatThen(game.saved.state, seat, session.now),
          state_version: seatPlayer?.stateVersion,
          connected: session.connections.get(name)?.isClosed !== true,
        };
  });
}

function tabMessageTo(session: RoomSession, expected: Readonly<Record<string, unknown>>) {
  const sent = session.tabMessages.find(
    ({ name, tab }) => name === expected["player"] && tab === expected["tab"],
  );
  return sent === undefined ? undefined : { player: sent.name, tab: sent.tab, notice: sent.notice };
}

function connectedTab(session: RoomSession, expected: unknown): unknown {
  const player = isRecord(expected) ? expected["player"] : undefined;
  const tab = typeof player === "string" ? session.openTabs.get(player) : undefined;
  return tab === undefined ? undefined : { player, tab };
}

function viewWithAway(session: RoomSession, view: unknown): unknown {
  const viewer = session.record.game?.seats.find(
    ({ seat }) => isRecord(view) && seat === view["seat"],
  );
  if (!isRecord(view) || typeof view["of_seat"] !== "number" || viewer === undefined) {
    return view;
  }
  const message = withAwaySeats(
    {
      type: "update",
      protocolVersion: PROTOCOL_VERSION,
      acceptedActionId: null,
      update: updateFor(session.record, viewer.playerId),
      serverNow: session.now,
    },
    session.record,
    session.livePlayers(),
  );
  const awaySeats = message.type === "update" ? (message.update.game?.awaySeats ?? []) : [];
  return { ...view, away: awaySeats.some((seat) => seat === view["of_seat"]) };
}

function noticeTo(session: RoomSession, expected: unknown): unknown {
  const asked = isRecord(expected) ? expected : {};
  const seat = session.record.game?.seats.find((candidate) => candidate.seat === asked["seat"]);
  const sent = session.notices.find(
    ({ playerId, notice }) => playerId === seat?.playerId && notice.kind === asked["notice"],
  );
  if (sent === undefined || seat === undefined) {
    return undefined;
  }
  if (sent.notice.kind !== "timed_out") {
    return { seat: seat.seat, notice: sent.notice.kind };
  }
  return sent.notice.gameKind === "ranked"
    ? { seat: seat.seat, notice: "timed_out", in_a_row: sent.notice.inARow, of: sent.notice.of }
    : { seat: seat.seat, notice: "timed_out", keep_playing: true };
}

function messageTo(session: RoomSession, expected: unknown): unknown {
  if (isRecord(expected) && "tab" in expected) {
    return tabMessageTo(session, expected);
  }
  return isRecord(expected) && "contains" in expected
    ? roomMessageContains(session.record, (name) => session.identityNamed(name).playerId, expected)
    : noticeTo(session, expected);
}

async function runRoomStep(
  session: RoomSession,
  step: ScenarioStep,
  registeredNames: ReadonlyArray<string>,
): Promise<void> {
  if (step === "start_game") {
    throw new Error("the room driver cannot start a game");
  }
  const isLoggingOut = step["action"] === "log_out" || step["action"] === "delete_account";
  if (isLoggingOut && typeof step["player"] === "string") {
    const isStaying = step["action"] === "log_out" && registeredNames.includes(step["player"]);
    await logOutInRoom(session, step["player"], isStaying);
    return;
  }
  if (step["action"] === "open_game" && typeof step["player"] === "string") {
    session.openGame(step["player"], typeof step["tab"] === "number" ? step["tab"] : 1);
    return;
  }
  if (typeof step["action"] === "string") {
    await session.sendRaw({ seat: step["seat"], player: step["player"], message: step });
    return;
  }
  if (typeof step["disconnect"] === "number") {
    session.disconnect(step["disconnect"]);
    return;
  }
  if (typeof step["reconnect"] === "number") {
    await session.reconnect(step["reconnect"]);
    return;
  }
  if (typeof step["wait_ms"] === "number") {
    session.wait(step["wait_ms"], step["alarm_fires"] !== false);
    return;
  }
  if (!isRecord(step["raw"])) {
    throw new Error("the room driver runs game steps and raw messages only");
  }
  await session.sendRaw(step["raw"]);
}

function readRoomThen(session: RoomSession, field: string, expected: unknown): unknown {
  const game = session.record.game;
  if (game === null) {
    throw new Error("the room has no game");
  }
  switch (field) {
    case "rejected":
      return session.lastReply?.type === "rejected" ? session.lastReply.code : undefined;
    case "unchanged":
      return session.isLastStepUnchanged;
    case "seats":
      return seatsThen(session, expected);
    case "message_to":
      return messageTo(session, expected);
    case "room":
      return lobbyRoomThen(session.record, expected, {
        messages: [],
        atStart: { messageCount: 0, lineCount: 0 },
      });
    case "record":
      return recordThen(game, session.seatNames);
    case "ratings":
      return ratingsThen(session, expected);
    case "connected_tab":
      return connectedTab(session, expected);
    case "view":
      return viewWithAway(session, readEngineThen(game.saved.state, field, expected, session.now));
    default:
      return readEngineThen(game.saved.state, field, expected, session.now);
  }
}

function startSession(
  rawGiven: Readonly<Record<string, unknown>>,
  scripted: ScriptedRandom,
): DriverSession {
  const given = v.parse(GIVEN_SCHEMA, engineGivenOf(rawGiven));
  const random = engineRandom({ scripted, purpose: () => "play", startingDeck: [] });
  const roomGiven = v.parse(ROOM_GIVEN_SCHEMA, rawGiven);
  const session = new RoomSession(stateFromGiven(given), roomGiven, random);
  const registeredNames = (roomGiven.accounts ?? [])
    .filter((account) => account.kind === "registered")
    .map(({ name }) => name);
  return {
    runStep: async (step) => {
      await runRoomStep(session, step, registeredNames);
      await session.recordsSaved();
    },
    readThen: (field, expected) => readRoomThen(session, field, expected),
    measurements: () => [
      { budget: "B1", value: Math.max(0, ...session.rowsForAccepted) },
      { budget: "B2", value: Math.max(0, ...session.rowsForOther) },
      ...session.handlingMs.map((value) => ({ budget: "B11", value })),
    ],
  };
}

const SEAT_FIELDS = ENGINE_FIELDS.nestedFields.get("given.seats") ?? new Set<string>();

export const ROOM_DRIVER: ScenarioDriver = {
  name: "room",
  givenFields: new Set([...ENGINE_FIELDS.givenFields, "room", "accounts"]),
  steps: new Set([
    "raw",
    "play_card",
    "sell",
    "end_turn",
    "wait_ms",
    "disconnect",
    "reconnect",
    "open_game",
    "leave_game",
    "call_vote",
    "vote",
    "log_out",
    "delete_account",
  ]),
  thenFields: new Set([
    ...ENGINE_FIELDS.thenFields,
    "message_to",
    "connected_tab",
    "room",
    "record",
    "ratings",
  ]),
  nestedFields: new Map([
    ...ENGINE_FIELDS.nestedFields,
    ["given.seats", new Set([...SEAT_FIELDS, ...ROOM_SEAT_FIELDS])],
    ["then.seats", new Set([...SEAT_FIELDS, "type_counts", ...ROOM_SEAT_FIELDS])],
    ["given.room", new Set(["code", "size", "public", "owner", "players", "state"])],
    ["given.accounts", new Set(["name", "kind", "rating", "ranked_games", "highest_rating"])],
    ["then.view", new Set([...(ENGINE_FIELDS.nestedFields.get("then.view") ?? []), "away"])],
    ["then.connected_tab", new Set(["player", "tab"])],
    ["then.room", new Set(["state", "players"])],
    ["then.record", new Set(["turns", "winner", "bonus_types", "ranked", "players", "results"])],
  ]),
  unhandledGivenValues: (given) => {
    const state = isRecord(given["room"]) ? given["room"]["state"] : undefined;
    return state === undefined || state === "playing"
      ? []
      : [`given room.state ${JSON.stringify(state)}`];
  },
  startSession,
};
