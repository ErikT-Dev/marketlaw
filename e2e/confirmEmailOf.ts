import { expect, type APIRequestContext } from "@playwright/test";
import { newestLinkSentTo } from "./newestLinkSentTo";
import { openLink } from "./openLink";
import type { Player } from "./Player";
import { signUpInLobby } from "./signUpInLobby";

function emailOf(player: Player): string {
  return `${player.name.replaceAll(" ", ".").toLowerCase()}@example.com`;
}

export async function signUpUnconfirmed(player: Player): Promise<void> {
  await signUpInLobby(player.page, player.name, emailOf(player), "harbour lights 42");
  await player.page
    .getByRole("dialog", { name: "Check your email" })
    .getByRole("button", { name: "OK" })
    .click();
}

export async function confirmEmailOf(player: Player, request: APIRequestContext): Promise<void> {
  await openLink(player.page, await newestLinkSentTo(request, emailOf(player), "confirm"));
  const confirmed = player.page.getByRole("dialog", { name: "Email address confirmed" });
  await confirmed.getByRole("button", { name: "OK" }).click();
  await expect(confirmed).toBeHidden();
}
