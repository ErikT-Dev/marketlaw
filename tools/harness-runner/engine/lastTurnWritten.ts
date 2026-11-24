import type { LastTurn } from "../../../src/shared/LastTurn.ts";
import { fundsWritten } from "./fundsWritten.ts";

export function lastTurnWritten(lastTurn: LastTurn): Readonly<Record<string, unknown>> {
  return {
    quests: lastTurn.quests,
    projects: lastTurn.projects,
    income: Object.fromEntries(lastTurn.incomeGains.map(({ seat, income }) => [seat, income])),
    support: Object.fromEntries(
      lastTurn.support.map(({ seat, funds }) => [seat, fundsWritten(funds)]),
    ),
  };
}
