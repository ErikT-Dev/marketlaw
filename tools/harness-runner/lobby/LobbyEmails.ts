import { emailKeyOf } from "../../../src/server/accounts/emailKeyOf.ts";
import type { AccountEmailKind } from "../../../src/server/email/AccountEmailKind.ts";
import { EMAIL_LINK_LIFETIME_MS } from "../../../src/server/email/EMAIL_LINK_LIFETIME_MS.ts";
import { emailLimitRejection } from "../../../src/server/email/emailLimitRejection.ts";
import type { LinkedEmailKind } from "../../../src/server/email/LinkedEmailKind.ts";
import type { Identity } from "../../../src/server/room/Identity.ts";
import type { PlayerId } from "../../../src/shared/PlayerId.ts";
import type { LobbyGiven } from "./LOBBY_GIVEN_SCHEMA.ts";

type LobbyLink = { readonly serial: number; readonly expiresMs: number };

function linkKeyOf(playerId: PlayerId, kind: LinkedEmailKind): string {
  return `${playerId} ${kind}`;
}

export class LobbyEmails {
  readonly sent: Array<{ readonly to: string; readonly kind: AccountEmailKind }> = [];
  readonly noticesTo = new Map<string, string>();
  newestReset: { readonly playerId: PlayerId; readonly serial: number } | null = null;
  private readonly addressCounts = new Map<string, number>();
  private readonly accountCounts = new Map<PlayerId, number>();
  private readonly links = new Map<string, LobbyLink>();
  private serials = 0;

  constructor(given: LobbyGiven, identityNamed: (name: string) => Identity) {
    for (const [address, count] of Object.entries(given.email_counts ?? {})) {
      this.addressCounts.set(emailKeyOf(address), count);
    }
    for (const account of given.accounts ?? []) {
      const { playerId } = identityNamed(account.name);
      if (account.emails_today !== undefined) {
        this.accountCounts.set(playerId, account.emails_today);
      }
      const isUnconfirmed = account.email_confirmed !== true;
      if (account.kind === "registered" && typeof account.email === "string" && isUnconfirmed) {
        this.addLink(playerId, "confirm", given.clock_ms ?? 0);
      }
    }
  }

  limitRejection(playerId: PlayerId | null, address: string): "email_limit_reached" | null {
    return emailLimitRejection({
      account: playerId === null ? 0 : (this.accountCounts.get(playerId) ?? 0),
      address: this.addressCounts.get(emailKeyOf(address)) ?? 0,
    });
  }

  send(
    playerId: PlayerId,
    email: { readonly to: string; readonly kind: AccountEmailKind },
    now: number,
  ): void {
    this.sent.push(email);
    this.accountCounts.set(playerId, (this.accountCounts.get(playerId) ?? 0) + 1);
    const addressKey = emailKeyOf(email.to);
    this.addressCounts.set(addressKey, (this.addressCounts.get(addressKey) ?? 0) + 1);
    if (email.kind === "already_in_use") {
      return;
    }
    const serial = this.addLink(playerId, email.kind, now);
    if (email.kind === "reset") {
      this.newestReset = { playerId, serial };
    }
  }

  newestSerial(playerId: PlayerId, kind: LinkedEmailKind): number | null {
    return this.links.get(linkKeyOf(playerId, kind))?.serial ?? null;
  }

  useLink(
    playerId: PlayerId,
    link: { readonly kind: LinkedEmailKind; readonly serial: number },
    now: number,
  ) {
    const key = linkKeyOf(playerId, link.kind);
    const stored = this.links.get(key);
    if (stored?.serial !== link.serial) {
      return false;
    }
    this.links.delete(key);
    return stored.expiresMs > now;
  }

  removeLinksOf(playerId: PlayerId): void {
    for (const kind of ["confirm", "change_confirm", "reset"] as const) {
      this.links.delete(linkKeyOf(playerId, kind));
    }
    if (this.newestReset?.playerId === playerId) {
      this.newestReset = null;
    }
  }

  private addLink(playerId: PlayerId, kind: LinkedEmailKind, now: number): number {
    this.serials += 1;
    this.links.set(linkKeyOf(playerId, kind), {
      serial: this.serials,
      expiresMs: now + EMAIL_LINK_LIFETIME_MS[kind],
    });
    return this.serials;
  }
}
