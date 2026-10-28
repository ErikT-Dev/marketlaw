import { readFileSync } from "node:fs";
import * as v from "valibot";
import { parse } from "yaml";
import { TestRoomResponse } from "../../src/shared/api/TestRoomResponse.ts";
import { ENGINE_FIELDS } from "../harness-runner/engine/ENGINE_FIELDS.ts";
import { GIVEN_SCHEMA } from "../harness-runner/engine/GIVEN_SCHEMA.ts";
import { stateFromGiven } from "../harness-runner/engine/stateFromGiven.ts";

const LOCAL_SITE = "http://localhost:8787";
const SECRET_HEADER = "x-test-room-secret";

function secretFor(site: string): string {
  const fromEnvironment = process.env["TEST_ROOM_SECRET"];
  if (fromEnvironment !== undefined) {
    return fromEnvironment;
  }
  if (site !== LOCAL_SITE) {
    throw new Error("set TEST_ROOM_SECRET to the live site's secret");
  }
  const line = readFileSync(".dev.vars", "utf8")
    .split(/\r?\n/)
    .find((entry) => entry.startsWith("TEST_ROOM_SECRET="));
  return line?.slice("TEST_ROOM_SECRET=".length) ?? "";
}

function givenOf(file: string, number: number): Readonly<Record<string, unknown>> {
  const scenarios: unknown = parse(readFileSync(`harness/scenarios/${file}.yaml`, "utf8"));
  const scenario: unknown = Array.isArray(scenarios) ? scenarios[number - 1] : undefined;
  const given: unknown =
    typeof scenario === "object" && scenario !== null && "given" in scenario
      ? scenario.given
      : undefined;
  if (typeof given !== "object" || given === null) {
    throw new Error(
      `harness/scenarios/${file}.yaml has no scenario ${String(number)} with a given`,
    );
  }
  return Object.fromEntries(
    Object.entries(given).filter(([field]) => ENGINE_FIELDS.givenFields.has(field)),
  );
}

export async function startTestRoom(file: string, number: number, site: string): Promise<string> {
  const state = stateFromGiven(v.parse(GIVEN_SCHEMA, givenOf(file, number)));
  const response = await fetch(`${site}/api/test-rooms`, {
    method: "POST",
    headers: { "content-type": "application/json", [SECRET_HEADER]: secretFor(site) },
    body: JSON.stringify({
      state,
      playerNames: state.seats.map((seat) => `Seat ${String(seat.seat)}`),
    }),
  });
  if (response.status === 404) {
    throw new Error(`${site} refused the request: the secret is missing or wrong`);
  }
  const room = v.parse(TestRoomResponse, await response.json());
  if (!room.isOk) {
    throw new Error(`the room could not be started (${room.reason})`);
  }
  const links = room.seats.map(
    ({ seat, name, token }) =>
      `Seat ${String(seat)}: ${site}/#${new URLSearchParams({ session: token, name, room: room.code }).toString()}`,
  );
  return [`Test room ${room.code} from ${file} #${String(number)}`, ...links].join("\n");
}
