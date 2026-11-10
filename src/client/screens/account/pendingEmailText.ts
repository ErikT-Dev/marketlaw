import type { AccountEmail } from "../../../shared/api/AccountEmail";

export function pendingEmailText(email: AccountEmail, pendingAddress: string): string {
  const waiting = `Waiting for confirmation: ${pendingAddress}.`;
  return email.address === null
    ? `${waiting} Open the link we sent to add it to your account.`
    : `${waiting} Your current address stays on the account until you open the link we sent.`;
}
