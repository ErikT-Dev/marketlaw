import * as v from "valibot";
import { describe, expect, it } from "vitest";
import { EpochMs } from "../../shared/EpochMs";
import { dayOf } from "./dayOf";
import { EMPTY_LOBBY } from "./EMPTY_LOBBY";
import type { LobbyRecord } from "./LobbyRecord";
import { returnSiteEmail } from "./returnSiteEmail";
import { siteEmailLimitOf } from "./siteEmailLimitOf";
import { takeSiteEmail } from "./takeSiteEmail";

const NOW = v.parse(EpochMs, 30 * 86_400_000 + 7000);
const NEXT_DAY = v.parse(EpochMs, NOW + 86_400_000);
const AT_NOW = { now: NOW, siteEmailsPerDay: siteEmailLimitOf({}) };

function lobbyWithEmails(siteEmails: number): LobbyRecord {
  return {
    ...EMPTY_LOBBY,
    today: {
      day: dayOf(NOW),
      players: [],
      siteGameStarts: 0,
      siteChatMessages: 0,
      siteEmails,
      siteTutorialStarts: 0,
    },
  };
}

describe("the site's daily email quota", () => {
  it("allows 90 emails a day on the whole site", () => {
    expect(siteEmailLimitOf({})).toBe(90);
    expect(takeSiteEmail(lobbyWithEmails(89), AT_NOW).isTaken).toBe(true);
    expect(takeSiteEmail(lobbyWithEmails(90), AT_NOW).isTaken).toBe(false);
  });

  it("counts a taken email and leaves the record unchanged when the cap is reached", () => {
    expect(takeSiteEmail(lobbyWithEmails(4), AT_NOW).record.today.siteEmails).toBe(5);
    const full = lobbyWithEmails(90);
    expect(takeSiteEmail(full, AT_NOW).record).toBe(full);
  });

  it("starts counting again on the next day", () => {
    const taken = takeSiteEmail(lobbyWithEmails(90), { ...AT_NOW, now: NEXT_DAY });
    expect(taken.isTaken).toBe(true);
    expect(taken.record.today).toMatchObject({ day: dayOf(NEXT_DAY), siteEmails: 1 });
  });

  it("gives back an email that could not be sent", () => {
    expect(returnSiteEmail(lobbyWithEmails(5), NOW).today.siteEmails).toBe(4);
    expect(returnSiteEmail(lobbyWithEmails(0), NOW).today.siteEmails).toBe(0);
  });

  it("uses a raised limit configured for the browser tests", () => {
    expect(siteEmailLimitOf({ TEST_SITE_EMAILS_PER_DAY: "1000000" })).toBe(1_000_000);
  });
});
