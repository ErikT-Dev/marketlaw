import { expect, test } from "@playwright/test";
import { expectScreenFits } from "./expectScreenFits";
import { openTestSeat } from "./openTestSeat";
import { startTestRoom } from "./startTestRoom";

function nameOf(link: string): string {
  return new URLSearchParams(link.split("#")[1] ?? "").get("name") ?? "";
}

test("a winner opens their match history, the game record and the other player's history", async ({
  browser,
  viewport,
  request,
}, testInfo) => {
  const [firstLink = "", secondLink = ""] = await startTestRoom(request, { players: 2 });
  const [leaverName, winnerName] = [nameOf(firstLink), nameOf(secondLink)];
  const leaver = await openTestSeat(browser, viewport, firstLink);
  const winner = await openTestSeat(browser, viewport, secondLink);
  await leaver.getByRole("button", { name: "Leave game" }).click();
  await leaver
    .getByRole("dialog", { name: "Leave the game?" })
    .getByRole("button", { name: "Leave the game" })
    .click();
  const won = winner.getByRole("dialog", { name: "You win: everyone else left" });
  await won.getByRole("button", { name: "Exit to lobby" }).click();
  await winner.getByRole("button", { name: "My match history" }).click();

  const history = winner.getByRole("dialog", { name: `Match history · ${winnerName}` });
  const games = history.getByRole("table", { name: "Games" });
  await expect(games.getByRole("row")).toHaveCount(2);
  await expect(games.getByRole("row").nth(1)).toContainText("Casualwon1st of 2");
  await expectScreenFits(winner, "match-history", testInfo);

  await games.getByRole("row").nth(1).getByRole("link").first().click();
  const record = winner.getByRole("dialog", { name: /^Game record · / });
  const players = record.getByRole("table", { name: "Players" });
  await expect(players.getByRole("columnheader")).toHaveText([
    "Player",
    `${winnerName} (you)`,
    leaverName,
  ]);
  await expect(players.getByRole("row", { name: /^Place and result/ })).toContainText(
    "1st · won2nd · left (turn 1)",
  );
  await expectScreenFits(winner, "game-record", testInfo);

  await players.getByRole("link", { name: leaverName }).click();
  const other = winner.getByRole("dialog", { name: `Match history · ${leaverName}` });
  await expect(other.getByRole("row").nth(1)).toContainText("Casualleft2nd of 2");
  await other.getByRole("button", { name: "Back" }).click();
  await expect(record).toBeVisible();
  await winner.keyboard.press("Escape");
  await expect(history).toBeVisible();
  await history.getByRole("button", { name: "Back" }).click();
  await expect(history).toBeHidden();
  await expect(winner.getByRole("button", { name: "Create room" })).toBeVisible();
});

test("a player clicks an opponent's name in a game and comes back to the game", async ({
  browser,
  viewport,
  request,
}) => {
  const [firstLink = "", secondLink = ""] = await startTestRoom(request, { players: 2 });
  const opponentName = nameOf(secondLink);
  const player = await openTestSeat(browser, viewport, firstLink);
  const opponents = player.getByRole("region", { name: "Opponents" });
  await opponents.getByRole("link", { name: opponentName }).click();

  const history = player.getByRole("dialog", { name: `Match history · ${opponentName}` });
  await expect(history).toBeVisible();
  await history.getByRole("button", { name: "Back" }).click();
  await expect(history).toBeHidden();
  await expect(player.getByRole("button", { name: "Leave game" })).toBeVisible();
});
