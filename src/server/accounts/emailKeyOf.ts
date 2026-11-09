const GMAIL_DOMAINS = new Set(["gmail.com", "googlemail.com"]);

export function emailKeyOf(email: string): string {
  const lowered = email.toLowerCase();
  const at = lowered.lastIndexOf("@");
  if (at < 0) {
    return lowered;
  }
  const domain = lowered.slice(at + 1);
  const beforePlus = lowered.slice(0, at).split("+")[0] ?? "";
  return GMAIL_DOMAINS.has(domain)
    ? `${beforePlus.replaceAll(".", "")}@gmail.com`
    : `${beforePlus}@${domain}`;
}
