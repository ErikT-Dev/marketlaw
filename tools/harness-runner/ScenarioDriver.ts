import type { DriverSession } from "./DriverSession.ts";
import type { ScriptedRandom } from "./ScriptedRandom.ts";

export type ScenarioDriver = {
  readonly name: string;
  readonly givenFields: ReadonlySet<string>;
  readonly steps: ReadonlySet<string>;
  readonly thenFields: ReadonlySet<string>;
  readonly startSession: (
    given: Readonly<Record<string, unknown>>,
    random: ScriptedRandom,
  ) => DriverSession;
};
