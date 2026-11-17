import type { RankingViewer } from "../../../src/server/ratings/RankingViewer.ts";
import type { LobbyRanking } from "./LobbyRanking.ts";
import type { LobbySession } from "./LobbySession.ts";

export const RECORDS_ACTIONS = ["open_match_history", "open_ranking"];

function textOf(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function viewerNameOf(session: LobbySession, step: Readonly<Record<string, unknown>>) {
  return typeof step["visitor"] === "string"
    ? (session.visitorLogins.get(step["visitor"]) ?? null)
    : textOf(step["player"]);
}

function rankingViewerOf(session: LobbySession, name: string | null): RankingViewer {
  const account = name === null ? undefined : session.accounts.get(name);
  if (account === undefined) {
    return { kind: "logged_out" };
  }
  return account.registration === null
    ? { kind: "guest" }
    : { kind: "registered", playerId: account.identity.playerId };
}

export async function runRecordsStep(
  session: LobbySession,
  ranking: LobbyRanking,
  step: Readonly<Record<string, unknown>>,
): Promise<void> {
  if (step["action"] === "open_ranking") {
    const name = viewerNameOf(session, step);
    const page = step["jump_to_me"] === true ? "mine" : 1;
    await ranking.open(session.accounts, { name, ranking: rankingViewerOf(session, name) }, page);
    return;
  }
  const of =
    session.accounts.get(textOf(step["of"]))?.identity ?? session.identityNamed(textOf(step["of"]));
  await session.history.open(session.accounts, of.playerId);
}
