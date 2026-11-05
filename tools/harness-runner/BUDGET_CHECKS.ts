import type { BudgetCheck } from "./BudgetCheck.ts";

const LEGAL_THREE_PLAYER_AVERAGE = "simulator, average over complete legal-bot 3-player games";

export const BUDGET_CHECKS: Readonly<Record<string, BudgetCheck>> = {
  B1: {
    by: "harness",
    where: "simulator and room scenarios, the most rows one accepted action wrote",
  },
  B2: {
    by: "harness",
    where: "simulator and room scenarios, the most rows any other message wrote",
  },
  B3: {
    by: "harness",
    where:
      "simulator, how many alarm changes the busiest turn made over its allowance (measured limit 0 over)",
  },
  B4: { by: "harness", where: LEGAL_THREE_PLAYER_AVERAGE },
  B5: { by: "harness", where: "simulator, average over complete legal-bot 4-player games" },
  B6: { by: "not built", where: "phase 29, the tutorial" },
  B7: { by: "not built", where: "phase 21, room chat" },
  B8: { by: "not built", where: "phase 25, game records" },
  B9: { by: "harness", where: LEGAL_THREE_PLAYER_AVERAGE },
  B10: {
    by: "other check",
    where: "browser test e2e/idleClient.spec.ts (npm run e2e): an idle client for five minutes",
  },
  B11: {
    by: "harness",
    where:
      "room scenarios, the longest time the room took to handle one message (wall-clock time, never less than CPU time)",
  },
  B12: {
    by: "harness",
    where: "simulator with the sleep model (docs/sleep-model.md), a 40-turn 3-player game",
  },
  B13: {
    by: "harness",
    where: "simulator, the largest saved room in a legal-bot game, compressed as stored",
  },
  B14: {
    by: "other check",
    where: "size-limit (.size-limit.js) on the production build, in npm run check",
  },
  B15: {
    by: "other check",
    where:
      "browser tests e2e/fullGames.spec.ts (npm run e2e): every market go and End turn of complete 2-, 3- and 4-player games, 95th percentile per game",
  },
  B16: {
    by: "harness",
    where:
      "simulator, room reads per complete legal-bot 3-player game, plus the busy-day simulator's room, lobby and D1 token reads outside the game, per room",
  },
  B17: { by: "harness", where: "simulator, the largest replay record in a legal-bot game" },
  B18: {
    by: "harness",
    where:
      "busy-day simulator, 50 rooms through the room and lobby code, plus the guests' and players' rows in D1",
  },
};
