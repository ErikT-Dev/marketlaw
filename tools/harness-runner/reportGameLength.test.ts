import { describe, expect, it } from "vitest";
import { NO_GAMES } from "../simulator/NO_GAMES.ts";
import { reportGameLength } from "./reportGameLength.ts";

describe("the game-length report", () => {
  it("averages legal-bot games by game size and counts only games that reached a turn", () => {
    const report = reportGameLength({
      ...NO_GAMES,
      legalGameTotals: {
        "games:3": 2,
        "turns:3": 61,
        "endedByEndGoal:3": 1,
        "endedByTurnLimit:3": 1,
        "winnerScore:3": 90,
        "averageScore:3": 70,
        "funds@1:3": 20,
        "reached@1:3": 2,
        "funds@40:3": 33,
        "reached@40:3": 1,
        "rowsWritten:3": 1401,
      },
    });
    expect(report).toContain(
      "<td>3 players</td><td>2</td><td>30.5</td><td>50.0%</td><td>50.0%</td><td>45.0</td><td>35.0</td><td>10.0 (2)</td><td>–</td><td>–</td><td>–</td><td>33.0 (1)</td><td>701</td>",
    );
    expect(report).toContain("<td>2 players</td><td>0</td><td>0.0</td>");
  });
});
