import * as v from "valibot";
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
import { ROOM_GIVEN_SCHEMA } from "./ROOM_GIVEN_SCHEMA.ts";
import { RoomSession } from "./RoomSession.ts";

const ROOM_SEAT_FIELDS = ["state_version", "connected", "player"];

function engineGivenOf(rawGiven: Readonly<Record<string, unknown>>): unknown {
  const seats: ReadonlyArray<unknown> = Array.isArray(rawGiven["seats"]) ? rawGiven["seats"] : [];
  return {
    ...Object.fromEntries(
      Object.entries(rawGiven).filter(([field]) => field !== "room" && field !== "accounts"),
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
  if (!isRecord(view) || typeof view["of_seat"] !== "number") {
    return view;
  }
  const name = session.seatNames[view["of_seat"] - 1] ?? "";
  return { ...view, away: session.offline.has(name) };
}

function noticeTo(session: RoomSession, expected: unknown): unknown {
  const asked = isRecord(expected) ? expected : {};
  const seat = session.record.game?.seats.find((candidate) => candidate.seat === asked["seat"]);
  const sent = session.notices.find(
    ({ playerId, notice }) => playerId === seat?.playerId && notice.kind === asked["notice"],
  );
  return sent === undefined || seat === undefined
    ? undefined
    : {
        seat: seat.seat,
        notice: sent.notice.kind,
        in_a_row: sent.notice.inARow,
        of: sent.notice.of,
      };
}

function runRoomStep(session: RoomSession, step: ScenarioStep): void {
  if (step === "start_game") {
    throw new Error("the room driver cannot start a game");
  }
  if (step["action"] === "open_game" && typeof step["player"] === "string") {
    session.openGame(step["player"], typeof step["tab"] === "number" ? step["tab"] : 1);
    return;
  }
  if (typeof step["action"] === "string") {
    session.sendRaw({ seat: step["seat"], message: step });
    return;
  }
  if (typeof step["disconnect"] === "number") {
    session.disconnect(step["disconnect"]);
    return;
  }
  if (typeof step["reconnect"] === "number") {
    session.reconnect(step["reconnect"]);
    return;
  }
  if (typeof step["wait_ms"] === "number") {
    session.wait(step["wait_ms"], step["alarm_fires"] !== false);
    return;
  }
  if (!isRecord(step["raw"])) {
    throw new Error("the room driver runs game steps and raw messages only");
  }
  session.sendRaw(step["raw"]);
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
      return isRecord(expected) && "tab" in expected
        ? tabMessageTo(session, expected)
        : noticeTo(session, expected);
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
  const session = new RoomSession(
    stateFromGiven(given),
    v.parse(ROOM_GIVEN_SCHEMA, rawGiven),
    random,
  );
  return {
    runStep: (step) => {
      runRoomStep(session, step);
    },
    readThen: (field, expected) => readRoomThen(session, field, expected),
    measurements: () => [
      { budget: "B1", value: Math.max(0, ...session.rowsForAccepted) },
      { budget: "B2", value: Math.max(0, ...session.rowsForOther) },
      { budget: "B11", value: Math.ceil(Math.max(0, ...session.handlingMs)) },
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
  ]),
  thenFields: new Set([...ENGINE_FIELDS.thenFields, "message_to", "connected_tab"]),
  nestedFields: new Map([
    ...ENGINE_FIELDS.nestedFields,
    ["given.seats", new Set([...SEAT_FIELDS, ...ROOM_SEAT_FIELDS])],
    ["then.seats", new Set([...SEAT_FIELDS, "type_counts", ...ROOM_SEAT_FIELDS])],
    ["given.room", new Set(["code", "size", "public", "players", "state"])],
    ["given.accounts", new Set(["name"])],
    ["then.view", new Set([...(ENGINE_FIELDS.nestedFields.get("then.view") ?? []), "away"])],
    ["then.connected_tab", new Set(["player", "tab"])],
  ]),
  startSession,
};
