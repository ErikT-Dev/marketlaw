import type { AccountEmailMessage } from "./AccountEmailMessage";
import type { OutgoingEmail } from "./OutgoingEmail";

const IGNORE_IF_NOT_YOU = "If this was not you, ignore this email.";

function linesOf(message: AccountEmailMessage, siteUrl: string): ReadonlyArray<string> {
  switch (message.kind) {
    case "confirm":
    case "change_confirm":
      return [
        "Open this link to confirm your email address for MarketLaw:",
        `${siteUrl}/#confirm=${message.token}`,
        "The link works once, for 24 hours.",
      ];
    case "reset":
      return [
        "Open this link to set a new password for your MarketLaw account:",
        `${siteUrl}/#reset=${message.token}`,
        "The link works once, for 1 hour.",
      ];
    case "already_in_use":
      return [
        "Someone tried to use this email address for a MarketLaw account, but it already belongs to an account.",
        "If you forgot the password of that account, set a new one here:",
        `${siteUrl}/#forgot-password`,
      ];
  }
}

const SUBJECTS: Readonly<Record<AccountEmailMessage["kind"], string>> = {
  confirm: "Confirm your email address",
  change_confirm: "Confirm your new email address",
  reset: "Set a new password",
  already_in_use: "This email address is already in use",
};

export function accountEmailOf(message: AccountEmailMessage, siteUrl: string): OutgoingEmail {
  return {
    to: message.to,
    subject: `MarketLaw: ${SUBJECTS[message.kind]}`,
    text: [...linesOf(message, siteUrl), "", IGNORE_IF_NOT_YOU].join("\n"),
  };
}
