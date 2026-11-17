import type { AccountBinding } from "../account/AccountBinding";
import type { LoggedInAccount } from "../account/LoggedInAccount";
import type { RankedStanding } from "./RankedStanding";

export function rankedStandingOf(
  account: AccountBinding | null,
  details: LoggedInAccount | null,
): RankedStanding {
  if (account === null) {
    return "logged_out";
  }
  if (account.isGuest) {
    return "guest";
  }
  if (details === null) {
    return "checking";
  }
  return details.email?.isConfirmed === true ? "email_confirmed" : "email_not_confirmed";
}
