import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { EpochMs } from "../../shared/EpochMs";
import { dayOf } from "./dayOf";
import { EMPTY_LOBBY } from "./EMPTY_LOBBY";
import { grantChatQuota } from "./grantChatQuota";
import type { LobbyRecord } from "./LobbyRecord";
import { siteChatLimitOf } from "./siteChatLimitOf";

const NOW = v.parse(EpochMs, 20 * 86_400_000 + 5000);
const AT_NOW = { now: NOW, siteChatMessagesPerDay: siteChatLimitOf({}) };

function lobbyWithChatMessages(siteChatMessages: number): LobbyRecord {
  return {
    ...EMPTY_LOBBY,
    today: { day: dayOf(NOW), players: [], siteGameStarts: 3, siteChatMessages },
  };
}

describe("the site's daily chat quota", () => {
  it("grants a block of 20 messages and counts it for today", () => {
    const grant = grantChatQuota(lobbyWithChatMessages(100), AT_NOW);
    expect(grant.granted).toBe(20);
    expect(grant.record.today).toEqual({
      day: dayOf(NOW),
      players: [],
      siteGameStarts: 3,
      siteChatMessages: 120,
    });
  });

  it("grants only what is left of 2000 for the day", () => {
    expect(grantChatQuota(lobbyWithChatMessages(1990), AT_NOW).granted).toBe(10);
  });

  it("grants nothing and changes nothing once 2000 are granted today", () => {
    const full = lobbyWithChatMessages(2000);
    expect(grantChatQuota(full, AT_NOW)).toEqual({ record: full, granted: 0 });
  });

  it("starts from zero on a new UTC day", () => {
    const tomorrow = v.parse(EpochMs, NOW + 86_400_000);
    const grant = grantChatQuota(lobbyWithChatMessages(2000), { ...AT_NOW, now: tomorrow });
    expect(grant.granted).toBe(20);
    expect(grant.record.today.siteChatMessages).toBe(20);
  });

  it("uses the site limit a test server sets and the spec's 2000 otherwise", () => {
    expect(siteChatLimitOf({})).toBe(2000);
    expect(siteChatLimitOf({ TEST_SITE_CHAT_MESSAGES_PER_DAY: "not a number" })).toBe(2000);
    expect(siteChatLimitOf({ TEST_SITE_CHAT_MESSAGES_PER_DAY: "1000000" })).toBe(1_000_000);
    const raised = { ...AT_NOW, siteChatMessagesPerDay: 1_000_000 };
    expect(grantChatQuota(lobbyWithChatMessages(2000), raised).granted).toBe(20);
  });
});
