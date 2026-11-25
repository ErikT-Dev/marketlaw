import { expect } from "@playwright/test";
import { Sector } from "../src/shared/catalogue/Sector";
import { activate } from "./activate";
import type { Player } from "./Player";
import { timeMove } from "./timeMove";

const YOUR_GO_TITLES = ["Your go: choose your turn draw", "The marketplace is empty"];
const YOUR_GO = { selector: "h2", texts: YOUR_GO_TITLES };
const YOUR_GO_NAME = new RegExp(`^(${YOUR_GO_TITLES.join("|")})$`);
const FIND_GO_INTERVAL_MS = 50;
const LONGEST_GO_WAIT_MS = 40_000;

async function indexWithTheGo(players: ReadonlyArray<Player>): Promise<number> {
  const hasTheGo = await Promise.all(
    players.map(async ({ page }) => page.getByRole("heading", { name: YOUR_GO_NAME }).isVisible()),
  );
  return hasTheGo.indexOf(true);
}

async function playerWithTheGo(players: ReadonlyArray<Player>): Promise<Player> {
  await expect
    .poll(async () => indexWithTheGo(players), {
      intervals: [FIND_GO_INTERVAL_MS],
      timeout: LONGEST_GO_WAIT_MS,
    })
    .toBeGreaterThanOrEqual(0);
  const player = players[await indexWithTheGo(players)];
  if (player === undefined) {
    throw new Error("no player has the market go");
  }
  return player;
}

async function marketGoMove(player: Player, turn: number, isTakingACard: boolean) {
  const { page } = player;
  if (isTakingACard) {
    const marketplace = page.getByRole("list", { name: "Marketplace places" });
    await activate(player, marketplace.getByRole("button").first());
    return marketplace.getByRole("button", { name: "Draw", exact: true });
  }
  const sector = Sector.options[turn % Sector.options.length] ?? "Industry";
  return page
    .getByRole("region", { name: YOUR_GO_NAME })
    .getByRole("button", { name: sector, exact: true });
}

export async function playMarketPhase(
  players: ReadonlyArray<Player>,
  turn: number,
  isTakingACard = false,
): Promise<ReadonlyArray<number>> {
  const times: number[] = [];
  for (let go = 0; go < players.length; go += 1) {
    const player = await playerWithTheGo(players);
    const { page } = player;
    const isMarketplaceEmpty = await page
      .getByRole("heading", { name: "The marketplace is empty" })
      .isVisible();
    const move = await marketGoMove(player, turn, isTakingACard && !isMarketplaceEmpty);
    times.push(await timeMove(player, move, YOUR_GO));
  }
  return times;
}
