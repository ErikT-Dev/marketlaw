import { readFileSync } from "node:fs";
import * as v from "valibot";
import { parse } from "yaml";
import { TEST_ROOM_SECRET_HEADER } from "../../src/shared/api/TEST_ROOM_SECRET_HEADER.ts";
import { TestRoomResponse } from "../../src/shared/api/TestRoomResponse.ts";
import { ENGINE_FIELDS } from "../harness-runner/engine/ENGINE_FIELDS.ts";
import { GIVEN_SCHEMA } from "../harness-runner/engine/GIVEN_SCHEMA.ts";
import { stateFromGiven } from "../harness-runner/engine/stateFromGiven.ts";
import { testRoomSecretFor } from "./testRoomSecretFor.ts";

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
  const unusable = Object.keys(given).filter((field) => !ENGINE_FIELDS.givenFields.has(field));
  if (unusable.length > 0) {
    throw new Error(
      `${file} #${String(number)} needs ${unusable.join(", ")}, which test rooms cannot set up yet`,
    );
  }
  return { ...given };
}

export async function startTestRoom(file: string, number: number, site: string): Promise<string> {
  const parsed = v.safeParse(GIVEN_SCHEMA, givenOf(file, number));
  if (!parsed.success) {
    const problems = parsed.issues.map(
      (issue) => `${v.getDotPath(issue) ?? "given"}: ${issue.message}`,
    );
    throw new Error(
      `${file} #${String(number)} cannot start a test room yet: ${problems.join("; ")}`,
    );
  }
  const state = stateFromGiven(parsed.output);
  const response = await fetch(`${site}/api/test-rooms`, {
    method: "POST",
    headers: { "content-type": "application/json", [TEST_ROOM_SECRET_HEADER]: testRoomSecretFor(site) },
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
