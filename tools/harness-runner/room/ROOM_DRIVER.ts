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
import type { ScriptedRandom } from "../ScriptedRandom.ts";
import { ROOM_GIVEN_SCHEMA } from "./ROOM_GIVEN_SCHEMA.ts";
import { RoomSession } from "./RoomSession.ts";

const ROOM_SEAT_FIELDS = ["state_version", "connected"];

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
    runStep(step) {
      if (step === "start_game") {
        throw new Error("the room driver cannot start a game");
      }
      if (typeof step["action"] === "string") {
        session.sendRaw({ seat: step["seat"], message: step });
        return;
      }
      if (!isRecord(step["raw"])) {
        throw new Error("the room driver runs game steps and raw messages only");
      }
      session.sendRaw(step["raw"]);
    },
    readThen(field, expected) {
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
        default:
          return readEngineThen(game.saved.state, field, expected, session.now);
      }
    },
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
  steps: new Set(["raw", "play_card", "sell", "end_turn"]),
  thenFields: ENGINE_FIELDS.thenFields,
  nestedFields: new Map([
    ...ENGINE_FIELDS.nestedFields,
    ["given.seats", new Set([...SEAT_FIELDS, ...ROOM_SEAT_FIELDS])],
    ["then.seats", new Set([...SEAT_FIELDS, "type_counts", ...ROOM_SEAT_FIELDS])],
    ["given.room", new Set(["code", "size", "public", "players", "state"])],
    ["given.accounts", new Set(["name"])],
  ]),
  startSession,
};
