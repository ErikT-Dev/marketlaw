import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { EpochMs } from "../../shared/EpochMs";
import { PlayerId } from "../../shared/PlayerId";
import { RoomCode } from "../../shared/RoomCode";
import { countTutorialStart } from "./countTutorialStart";
import { dayOf } from "./dayOf";
import { EMPTY_LOBBY } from "./EMPTY_LOBBY";
import type { LobbyRecord } from "./LobbyRecord";
import { releasePlayer } from "./releasePlayer";
import { siteTutorialLimitOf } from "./siteTutorialLimitOf";
import { TUTORIAL_PLACE } from "./TUTORIAL_PLACE";

const NOW = v.parse(EpochMs, 20 * 86_400_000 + 5000);
const NEXT_DAY = v.parse(EpochMs, 21 * 86_400_000 + 5000);
const AT_NOW = { now: NOW, siteTutorialsPerDay: siteTutorialLimitOf({}) };
const ANN = v.parse(PlayerId, "5b0f6a52-3d5e-4f7c-8a41-6c2b9e0d7f13");

function lobbyWithTutorials(siteTutorialStarts: number): LobbyRecord {
  return {
    ...EMPTY_LOBBY,
    today: {
      day: dayOf(NOW),
      players: [{ playerId: ANN, actions: 2000, gameStarts: 10 }],
      siteGameStarts: 50,
      siteChatMessages: 0,
      siteEmails: 0,
      siteTutorialStarts,
    },
  };
}

describe("tutorial starts in the lobby", () => {
  it("counts a site tutorial start and marks the player busy in the tutorial", () => {
    const started = countTutorialStart(lobbyWithTutorials(4), ANN, AT_NOW);
    expect(started.isOk && started.value.today.siteTutorialStarts).toBe(5);
    expect(started.isOk && started.value.busy).toEqual([{ playerId: ANN, code: TUTORIAL_PLACE }]);
  });

  it("ignores the player's daily action and game start limits", () => {
    expect(countTutorialStart(lobbyWithTutorials(0), ANN, AT_NOW).isOk).toBe(true);
  });

  it("refuses a start once 100 tutorials started today", () => {
    expect(countTutorialStart(lobbyWithTutorials(100), ANN, AT_NOW)).toEqual({
      isOk: false,
      error: "site_daily_cap",
    });
  });

  it("starts counting again on the next day", () => {
    const started = countTutorialStart(lobbyWithTutorials(100), ANN, {
      ...AT_NOW,
      now: NEXT_DAY,
    });
    expect(started.isOk && started.value.today.siteTutorialStarts).toBe(1);
  });

  it("counts a restart by a player already in the tutorial without a second busy entry", () => {
    const started = countTutorialStart(lobbyWithTutorials(0), ANN, AT_NOW);
    const restarted = started.isOk ? countTutorialStart(started.value, ANN, AT_NOW) : started;
    expect(restarted.isOk && restarted.value.today.siteTutorialStarts).toBe(2);
    expect(restarted.isOk && restarted.value.busy).toHaveLength(1);
  });

  it("refuses a player waiting in a room or in the queue", () => {
    const code = v.parse(RoomCode, "K7QR2P");
    const waiting = { ...lobbyWithTutorials(0), busy: [{ playerId: ANN, code }] };
    expect(countTutorialStart(waiting, ANN, AT_NOW)).toEqual({
      isOk: false,
      error: "busy_elsewhere",
    });
    const queued = {
      ...lobbyWithTutorials(0),
      busy: [{ playerId: ANN, code: "ranked_queue" as const }],
    };
    expect(countTutorialStart(queued, ANN, AT_NOW)).toEqual({
      isOk: false,
      error: "busy_elsewhere",
    });
  });

  it("frees the player when the tutorial is released", () => {
    const started = countTutorialStart(lobbyWithTutorials(0), ANN, AT_NOW);
    const released = started.isOk ? releasePlayer(started.value, ANN, TUTORIAL_PLACE) : null;
    expect(released?.busy).toEqual([]);
  });
});
