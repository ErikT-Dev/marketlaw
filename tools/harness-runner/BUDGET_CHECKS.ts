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
  B7: {
    by: "harness",
    where:
      "lobby scenarios (chat), the most rows one accepted chat message, mute or unmute wrote: the room record and the newest chat block",
  },
  B8: { by: "not built", where: "phase 25, game records" },
  B9: { by: "harness", where: LEGAL_THREE_PLAYER_AVERAGE },
  B10: {
    by: "other check",
    where: "browser test e2e/idleClient.spec.ts (npm run e2e): an idle client for five minutes",
  },
  B11: {
    by: "harness",
    where:
      "room scenarios through the production path (receiveCheckingGameStart, with a lobby that answers at once), the 99th percentile over every message the room handled of the time it took (wall-clock time, never less than CPU time); and separately the password hash of one login or signup (one hash each), its iteration count times the CPU time per iteration measured on the live Free plan Worker (400 ns, Q102)",
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
      "busy-day simulator, 50 rooms through the room and lobby code to the end of each room, with 2,000 chat messages after the games (the lobby's chat quota blocks, the chat blocks deleted with each room, the replay record with its two indexes, the 30-day delete of an older one, the cleanup alarm's storage delete and the lobby report; setting the cleanup alarm is in B4, with the game's last action), plus the guests' and players' rows in D1 and the day's signups, logins, failed logins, logouts and username changes",
  },
};
