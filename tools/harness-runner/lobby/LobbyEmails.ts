import { emailKeyOf } from "../../../src/server/accounts/emailKeyOf.ts";
import type { AccountEmailKind } from "../../../src/server/email/AccountEmailKind.ts";
import { emailLimitRejection } from "../../../src/server/email/emailLimitRejection.ts";
import type { Identity } from "../../../src/server/room/Identity.ts";
import type { PlayerId } from "../../../src/shared/PlayerId.ts";
import type { LobbyGiven } from "./LOBBY_GIVEN_SCHEMA.ts";

export class LobbyEmails {
  readonly sent: Array<{ readonly to: string; readonly kind: AccountEmailKind }> = [];
  readonly noticesTo = new Map<string, string>();
  private readonly addressCounts = new Map<string, number>();
  private readonly accountCounts = new Map<PlayerId, number>();

  constructor(given: LobbyGiven, identityNamed: (name: string) => Identity) {
    for (const [address, count] of Object.entries(given.email_counts ?? {})) {
      this.addressCounts.set(emailKeyOf(address), count);
    }
    for (const account of given.accounts ?? []) {
      if (account.emails_today !== undefined) {
        this.accountCounts.set(identityNamed(account.name).playerId, account.emails_today);
      }
    }
  }

  limitRejection(playerId: PlayerId | null, address: string): "email_limit_reached" | null {
    return emailLimitRejection({
      account: playerId === null ? 0 : (this.accountCounts.get(playerId) ?? 0),
      address: this.addressCounts.get(emailKeyOf(address)) ?? 0,
    });
  }

  send(playerId: PlayerId, email: { readonly to: string; readonly kind: AccountEmailKind }) {
    this.sent.push(email);
    this.accountCounts.set(playerId, (this.accountCounts.get(playerId) ?? 0) + 1);
    const addressKey = emailKeyOf(email.to);
    this.addressCounts.set(addressKey, (this.addressCounts.get(addressKey) ?? 0) + 1);
  }
}
