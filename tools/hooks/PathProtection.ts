export type PathProtection =
  { kind: "free" } | { kind: "deny"; reason: string } | { kind: "ask"; reason: string };
